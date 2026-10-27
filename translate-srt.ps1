# =============================================================
#  translate-srt.ps1 — перевод файла субтитров (SRT) с сохранением таймингов
#  Использование:
#    powershell -ExecutionPolicy Bypass -File translate-srt.ps1 -InputFile "ролик.ru.srt" -Target en
#    powershell -ExecutionPolicy Bypass -File translate-srt.ps1 -InputFile "ролик.en.srt" -Target ru
#  Результат: файл вида "ролик.<Target>.srt" рядом с исходным.
#  Требуется интернет. Используется бесплатный публичный эндпоинт перевода Google.
# =============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    # Язык ПЕРЕВОДА: ru, en, uk, de, fr, es, it, pl, kk, zh, ja, ko...
    [string]$Target = 'ru',

    # Куда сохранить (по умолчанию: имя.<Target>.srt рядом с исходником)
    [string]$OutputFile = "",

    # Пауза между запросами, мс (чтобы не словить блокировку)
    [int]$DelayMs = 250,

    # v1.22: ГЛОССАРИЙ ПЕРЕВОДА — файл со строками «термин=замена»
    # (также «термин -> замена» или таб; пустые строки и # — игнор).
    # Применяется к ПЕРЕВЕДЁННОМУ тексту, регистр не важен: имена и
    # термины останутся как задано. Файл должен быть в UTF-8.
    [string]$GlossaryFile = ""
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $InputFile)) {
    Write-Error "Файл не найден: $InputFile"
    exit 1
}

# ---------- чтение (автодетект UTF-8 / windows-1251) ----------
$bytes = [IO.File]::ReadAllBytes($InputFile)
$text = [Text.Encoding]::UTF8.GetString($bytes)
if ($text.Contains([char]0xFFFD)) {
    $text = [Text.Encoding]::GetEncoding(1251).GetString($bytes)
}
$text = $text -replace "\r\n", "`n"
$text = $text -replace "[\r]", "`n"

# ---------- v1.22: глоссарий перевода «термин=замена» ----------
# (также «термин -> замена» и таб; пустые строки и # — игнорируются)
$glossary = @()
if ($GlossaryFile -ne "" -and (Test-Path -LiteralPath $GlossaryFile)) {
    $glLines = [IO.File]::ReadAllLines($GlossaryFile, [Text.Encoding]::UTF8)
    foreach ($gln in $glLines) {
        $gt = $gln.Trim()
        if ($gt -eq '' -or $gt.StartsWith('#')) { continue }
        $gpos = $gt.IndexOf('=')
        if ($gpos -lt 1) { $gpos = $gt.IndexOf('->') }
        if ($gpos -lt 1) { $gpos = $gt.IndexOf("`t") }
        if ($gpos -lt 1) { continue }
        $gterm = $gt.Substring(0, $gpos).Trim()
        $grepl = $gt.Substring($gpos).TrimStart('=', '>', ' ', "`t")
        if ($gterm -eq '' -or $grepl -eq '') { continue }
        $glossary += @{ term = $gterm; repl = $grepl }
    }
    Write-Host ("Глоссарий: {0} замен(ы) из {1}" -f $glossary.Count, $GlossaryFile)
}

# ---------- v1.23: кэш переводов — повторные прогоны не тратят запросы ----------
# Ключ — хэш «язык|текст», хранилище — %TEMP%\AutoSub_translate_cache.txt
$cachePath = Join-Path ([System.IO.Path]::GetTempPath()) 'AutoSub_translate_cache.txt'
$cache = @{}
if (Test-Path -LiteralPath $cachePath) {
    try {
        foreach ($cl in [IO.File]::ReadAllLines($cachePath, [Text.Encoding]::UTF8)) {
            $ci = $cl.IndexOf("`t")
            if ($ci -gt 0) { $cache[$cl.Substring(0, $ci)] = $cl.Substring($ci + 1) }
        }
    } catch {}
}
function Get-TextHash {
    param([string]$s)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        return [System.BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($s))).Replace('-', '').Substring(0, 40)
    } finally { try { $sha.Dispose() } catch {} }
}

Add-Type -AssemblyName System.Web

# ---------- перевод одного куска текста ----------
function Translate-String {
    param([string]$Segment, [string]$Lang)
    $enc = [System.Web.HttpUtility]::UrlEncode($Segment)
    $uri = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=$Lang&q=$enc"
    $resp = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 30 -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    $out = ""
    if ($resp[0]) {
        foreach ($chunk in $resp[0]) {
            if ($chunk[0]) { $out += [string]$chunk[0] }
        }
    }
    return $out
}

# ---------- разбор SRT на блоки ----------
$blocks = $text -split "\n\n+"
$timeRe = [regex]'(?m)\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}'

$result = New-Object System.Collections.Generic.List[string]
$n = 0
$fails = 0
$total = 0

foreach ($block in $blocks) {
    $lines = $block -split "\n"
    $timeIdx = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($timeRe.IsMatch($lines[$i])) { $timeIdx = $i; break }
    }
    if ($timeIdx -lt 0) { continue }   # не блок субтитра (например WEBVTT)

    $timeLine = $lines[$timeIdx].Trim()
    $segLines = @()
    for ($i = $timeIdx + 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -ne "") { $segLines += $lines[$i].Trim() }
    }
    if ($segLines.Count -eq 0) { continue }
    $total++
    $n++
    $src = [string]::Join("`n", $segLines)

    if ($src.Length -gt 4500) {
        $translated = $src
        $fails++
    } else {
        $translated = $null
        # v1.23: сперва кэш — повторный прогон не бьёт по эндпоинту
        $ck = Get-TextHash ($Target + '|' + $src)
        if ($cache.ContainsKey($ck)) {
            $translated = $cache[$ck]
        } else {
            try {
                $translated = Translate-String -Segment $src -Lang $Target
            } catch {
                Start-Sleep -Milliseconds 1200
                try   { $translated = Translate-String -Segment $src -Lang $Target }
                catch { $translated = $src; $fails++ }
            }
            if ($translated) {
                $cache[$ck] = $translated
                try { Add-Content -LiteralPath $cachePath -Value ($ck + "`t" + $translated) -Encoding UTF8 } catch {}
            }
        }
        # v1.22: глоссарий — правка перевода «термин -> замена» (без регистра)
        if ($translated) {
            foreach ($g in $glossary) {
                $translated = [regex]::Replace($translated, [regex]::Escape($g.term), ($g.repl -replace '\$', '$$'), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            }
        }
        Start-Sleep -Milliseconds $DelayMs
    }

    $result.Add([string]$n)
    $result.Add($timeLine)
    $result.Add($translated)
    $result.Add("")

    if (($total % 5) -eq 0) {
        Write-Host ("Переведено {0} реплик..." -f $total)
    }
}

if ($total -eq 0) {
    Write-Error "В файле не найдено субтитров."
    exit 2
}

# ---------- сохранение ----------
$dir = Split-Path -Parent (Resolve-Path -LiteralPath $InputFile).Path
if ($OutputFile -eq "") {
    $base = [IO.Path]::GetFileNameWithoutExtension($InputFile)
    $OutputFile = Join-Path $dir ($base + "." + $Target + ".srt")
}
$joinText = [string]::Join("`n", $result)
$joinText = $joinText -replace "\r\n", "`n"
$joinText = $joinText -replace "[\r]", "`n"
$joinText = $joinText -replace "\n", "`r`n"

$utf8bom = New-Object System.Text.UTF8Encoding($true)
[IO.File]::WriteAllText($OutputFile, $joinText, $utf8bom)

Write-Host ("")
Write-Host ("Готово! Реплик: {0}.   Ошибок перевода: {1}." -f $total, $fails)
Write-Host ("Сохранено: {0}" -f $OutputFile)
