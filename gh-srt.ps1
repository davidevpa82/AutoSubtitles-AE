# =============================================================
#  gh-srt.ps1 — выкладка/скачивание SRT в репозиторий AutoSubtitles-AE
#  Используется кнопками панели «⬆ SRT на GitHub» / «⬇ SRT с GitHub».
#  Требуется gh (GitHub CLI) с выполненным входом: gh auth login
#
#  Примеры:
#    powershell -File gh-srt.ps1 -Action upload   -LocalFile "C:\video\rolik.ru.srt"
#    powershell -File gh-srt.ps1 -Action download -DestDir   "C:\video"
# =============================================================

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('upload', 'download')]
    [string]$Action,

    # upload: какой файл выложить
    [string]$LocalFile = '',

    # Репозиторий и папка внутри него
    [string]$RepoName = 'davidevpa82/AutoSubtitles-AE',
    [string]$RepoDir = 'srt',

    # download: куда складывать скачанные .srt
    [string]$DestDir = '',

    [string]$Message = ''
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# токен из gh CLI (панель не хранит логины — всё через gh)
try { $ghToken = (& gh auth token).Trim() } catch { $ghToken = '' }
if ($ghToken -eq '') { Write-Output 'ERR: gh не найден или нет входа — выполни: gh auth login'; exit 1 }

$hdr = @{
    Authorization = "Bearer $ghToken"
    Accept        = 'application/vnd.github+json'
    'User-Agent'  = 'AutoSubtitles-AE-panel'
}
$apiBase = "https://api.github.com/repos/$RepoName/contents"

if ($Action -eq 'upload') {
    if ($LocalFile -eq '' -or -not (Test-Path -LiteralPath $LocalFile)) {
        Write-Output "ERR: файл не найден: $LocalFile"; exit 1
    }
    $name = [IO.Path]::GetFileName($LocalFile)
    $pathEnc = [Uri]::EscapeDataString("$RepoDir/$name")
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($LocalFile))
    if ($Message -eq '') { $Message = "SRT: $name (из панели AE)" }

    $body = @{ message = $Message; content = $content; branch = 'main' }
    # если файл уже выкладывался — нужен sha старой версии, иначе GitHub отклонит
    try {
        $old = Invoke-RestMethod -Uri "$apiBase/$pathEnc`?ref=main" -Headers $hdr
        $body.sha = $old.sha
        $body.message = "SRT обновлён: $name"
    } catch {}

    try {
        Invoke-RestMethod -Uri "$apiBase/$pathEnc" -Method Put -Headers $hdr -Body ($body | ConvertTo-Json) -ContentType 'application/json' | Out-Null
        Write-Output "OK: выложен $RepoDir/$name"
    } catch {
        Write-Output ("ERR: " + $_.Exception.Message); exit 1
    }
    exit 0
}

# ---------- download: все .srt из папки srt/ ----------
if ($DestDir -eq '' -or -not (Test-Path -LiteralPath $DestDir)) {
    $DestDir = [Environment]::GetFolderPath('Desktop')
}
try {
    $list = Invoke-RestMethod -Uri "$apiBase/$([Uri]::EscapeDataString($RepoDir))`?ref=main" -Headers $hdr
} catch {
    Write-Output 'ERR: в репозитории пока нет папки srt — сначала выложи файл кнопкой «SRT на GitHub»'
    exit 1
}
$cnt = 0
foreach ($f in $list) {
    if ($f.type -ne 'file' -or $f.name -notmatch '\.srt$') { continue }
    $dest = Join-Path $DestDir $f.name
    if (Test-Path -LiteralPath $dest) {
        $dest = Join-Path $DestDir (([IO.Path]::GetFileNameWithoutExtension($f.name)) + '_gh.srt')
    }
    Invoke-RestMethod -Uri $f.download_url -Headers $hdr -OutFile $dest
    Write-Output "OK: $dest"
    $cnt++
}
if ($cnt -eq 0) { Write-Output 'ERR: в папке srt нет .srt файлов'; exit 1 }
