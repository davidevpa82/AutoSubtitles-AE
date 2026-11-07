# deploy-to-ae.ps1 — копирует свежие файлы панели в ScriptUI Panels AE
# Запуск: powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-to-ae.ps1
$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $MyInvocation.MyCommand.Path
$dst  = Join-Path $env:APPDATA 'Adobe\After Effects\24.6\Scripts\ScriptUI Panels'
if (-not (Test-Path $dst)) { throw "Не найдена папка AE: $dst" }
foreach ($f in @('AutoSubtitles.jsx', 'transcribe-video.ps1', 'translate-srt.ps1', 'gh-srt.ps1')) {
    Copy-Item -LiteralPath (Join-Path $proj $f) -Destination $dst -Force
    Write-Host ("dep: " + $f)
}
Write-Host 'OK'
