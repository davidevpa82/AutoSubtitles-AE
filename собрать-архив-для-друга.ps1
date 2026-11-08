# =============================================================
#  собрать-архив-для-друга.ps1 — пакует панель Auto Subtitles
#  в один zip, который можно отправить другу (мессенджер/почта).
#
#  Запуск: правый клик по файлу → «Выполнить с помощью PowerShell»,
#  или в консоли:  powershell -ExecutionPolicy Bypass -File ".\собрать-архив-для-друга.ps1"
#
#  Результат: рядом со скриптом — AutoSubtitles-AE-v<версия>.zip.
#  Внутри папка AutoSubtitles-AE\ со всем нужным; друг распаковывает
#  и ставит по УСТАНОВКА.txt (лежит в том же архиве).
# =============================================================

$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path

# версия берётся прямо из панели — рассинхрон с файлом невозможен
# (ищем по ВСЕМУ файлу: changelog в шапке вырос, VERSION_STR давно не в первых 6 КБ)
$jsx = Join-Path $proj 'AutoSubtitles.jsx'
if (-not (Test-Path -LiteralPath $jsx)) { throw 'AutoSubtitles.jsx не найден рядом со скриптом.' }
$head = [IO.File]::ReadAllText($jsx, [Text.Encoding]::UTF8)
$ver = '1.0'
if ($head -match 'VERSION_STR\s*=\s*"v([\d.]+)"') { $ver = $Matches[1] }

$files = @(
    'AutoSubtitles.jsx',
    'transcribe-video.ps1',
    'translate-srt.ps1',
    'УСТАНОВКА.txt',
    'README.md',
    'sample.ru.srt',
    'sample.en.srt'
)

# staging: в архиве всё лежит в одной папке — распаковка не «рассыпается»
$stage = Join-Path $env:TEMP ('AutoSub-pack-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
$dir = New-Item -ItemType Directory -Path (Join-Path $stage 'AutoSubtitles-AE')
foreach ($f in $files) {
    $src = Join-Path $proj $f
    if (-not (Test-Path -LiteralPath $src)) { throw "Не найден файл: $f" }
    Copy-Item -LiteralPath $src -Destination $dir.FullName
}

$zip = Join-Path $proj ("AutoSubtitles-AE-v" + $ver + ".zip")
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path (Join-Path $stage 'AutoSubtitles-AE') -DestinationPath $zip
Remove-Item $stage -Recurse -Force

# отчёт: что внутри архива
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [IO.Compression.ZipFile]::OpenRead($zip)
Write-Host ''
Write-Host ("ГОТОВО: " + $zip + "  (" + [math]::Round((Get-Item -LiteralPath $zip).Length / 1KB, 1) + " KB)")
Write-Host "Внутри:"
foreach ($e in $z.Entries) { Write-Host ("   " + $e.FullName + "  (" + $e.Length + " B)") }
$z.Dispose()
Write-Host ''
Write-Host "Отправь этот файл другу. Он распаковывает архив и делает всё по УСТАНОВКА.txt."
