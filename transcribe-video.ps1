# =============================================================
#  transcribe-video.ps1 — расшифровка речи из видео в субтитры (Whisper)
#  Запускается из AE-панели Auto Subtitles. Можно и вручную:
#
#    powershell -ExecutionPolicy Bypass -File transcribe-video.ps1 `
#      -Video "C:\video\rolik.mp4" -Lang ru -Model small -SecondLang en
#
#  Результат: рядом с видео:
#    rolik.ru.srt  (или rolik.en.srt)  — расшифровка
#    rolik.<second>.srt               — перевод второй дорожки
#
#  Прогресс для панели AE: параметр -StatusFile указывает на файл,
#  куда пишутся stage/msg/pct/elapsed/remain/total (панель опрашивает
#  его каждую секунду и показывает % + «осталось ≈ N мин · к ЧЧ:ММ»).
#  ВАЖНО: whisper запускается с --verbose False — иначе его внутренний
#  progress-bar отключён и % не видно вообще (замерший столбик).
#
#  v1.16.0: модель качает обёртка — в несколько потоков и с докачкой
#  после обрыва (HTTP Range + SHA-256); whisper получает готовый файл.
# =============================================================

param(
    [Parameter(Mandatory = $true)]
    [string]$Video,

    # Язык РЕЧИ в видео: ru | en
    [ValidateSet('ru', 'en')]
    [string]$Lang = 'ru',

    # Модель Whisper: tiny | base | small | medium | large | turbo
    [ValidateSet('tiny', 'base', 'small', 'medium', 'large', 'turbo')]
    [string]$Model = 'small',

    # Вторая дорожка ('' = не создавать): ru | en — перевод через translate-srt.ps1
    [string]$SecondLang = '',

    # Служебный: путь к status-файлу для панели AE
    [string]$StatusFile = '',

    # Служебный: не ждать Enter в конце (панель сама всё видит в статус-файле,
    # а «Enter для выхода» держал бы консоль (и запустившую её AE) вечно)
    [switch]$NoWait,

    # Сколько потоков качает модель (4-8 — обычно быстрее всего;
    # докачка работает всегда: обрыв связи не сбрасывает прогресс как раньше)
    [ValidateRange(1, 16)]
    [int]$DlThreads = 6,

    # Служебный: только скачать/докачать модель и выйти (без whisper)
    [switch]$DownloadModelOnly,

    # Словарь-подсказка Whisper (имена/жаргон): путь к UTF-8 текст-файлу
    # — чтобы не портить кириллицу в командной строке .bat
    [string]$PromptFile = '',

    # Караоке: тайминги КАЖДОГО СЛОВА (whisper --word_timestamps):
    # whisper выдаёт JSON, обёртка собирает SRT + <имя>.<lang>.kar.json
    # для подсветки слов в панели AE
    [switch]$Karaoke,

    # v1.22: пакетный запуск — номер/всего пишется в статус (панель
    # показывает «[3/12]»); 0 = одиночный запуск
    [int]$BatchIndex = 0,
    [int]$BatchTotal = 0,

    # v1.22: глоссарий перевода — файл «термин=замена» (также «->», таб;
    # # — комментарий); применяется translate-srt.ps1 к переведённой дорожке
    [string]$GlossaryFile = '',

    # v1.23: движок whisper-ctranslate2 (faster-whisper) — быстрее в 2-4 раза;
    # не найден — честный откат на обычный whisper
    [switch]$FastWhisper,

    # v1.23: резать мусор — сегменты с низкой уверенностью Whisper
    # (no_speech_prob > 0.6 или avg_logprob < -1.0) не попадают в SRT
    [switch]$CutGarbage,

    # v1.23: окно «ГОТОВО» в конце (не нужно следить за консолью)
    [switch]$NotifyDone,

    # v1.23: РЕЖИМ СЛЕЖЕНИЯ — папка, новые видео в которой расшифровываются
    # сами (проверка раз в 60 с, до закрытия окна)
    [string]$WatchFolder = ''
)

$ErrorActionPreference = 'Continue'
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}
# Поэтому Python (whisper) не падает на юникод-выводе при перенаправлении потоков
$env:PYTHONIOENCODING = 'utf-8'
cmd /c "chcp 65001 >nul" | Out-Null

$script:StartedAt = Get-Date
$script:LastStatusAt = $null
$script:TotalSec = 0
$script:ModelName = $Model
$script:LogLines = @()
$script:Dev = 'CPU'      # v1.19.6: устройство Whisper (CPU/CUDA) для строки статуса
$script:SegNow = 0       # v1.19.6: прогресс по сегментам tqdm «51/124»
$script:SegAll = 0

# Опознаваемое имя окна консоли (искать в панели задач)
try { $Host.UI.RawUI.WindowTitle = 'AUTO SUBTITLES - WHISPER' } catch {}

function Set-Status {
    param([string]$Stage, [string]$Msg, [int]$Pct = -1, [int]$Remain = -1)
    try {
        if ($StatusFile -eq '') { return }
        $now = Get-Date
        $isFinal = ($Stage -eq 'DONE') -or ($Stage -eq 'ERROR')
        if ($script:LastStatusAt -ne $null -and (-not $isFinal)) {
            if (($now - $script:LastStatusAt).TotalMilliseconds -lt 700) { return }
        }
        $elapsed = [int]($now - $script:StartedAt).TotalSeconds
        $lines = @()
        $lines += "stage=$Stage"
        $lines += "elapsed=$elapsed"
        if ($script:ModelName) { $lines += "model=$script:ModelName" }
        if ($script:Dev) { $lines += ("dev=" + $script:Dev) }
        if ($script:SegAll -gt 0) { $lines += ("seg=" + $script:SegNow + "/" + $script:SegAll) }
        if ($script:TotalSec -gt 0) { $lines += "total=$script:TotalSec" }
        if ($BatchIndex -gt 0) { $lines += ("batch=" + $BatchIndex + "/" + $BatchTotal) }
        if ($Msg) { $lines += "msg=$Msg" }
        if ($Pct -ge 0) { $lines += "pct=$Pct" }
        if ($Remain -ge 0) { $lines += "remain=$Remain" }
        $lines += "pid=$PID"
        if ($script:LogLines.Count -gt 0) {
            $lines += "log=" + $script:LogLines[$script:LogLines.Count - 1]
        }
        if ($Stage -eq 'ERROR') { $lines += "err=1" }
        if ($Stage -eq 'DONE')  { $lines += "done=1" }
        $enc = New-Object System.Text.UTF8Encoding($false)
        [IO.File]::WriteAllText($StatusFile, (($lines -join "`r`n") + "`r`n"), $enc)
        $script:LastStatusAt = $now
    } catch {}
}

# Хранит последние строки лога Whisper для зеркала в панели AE
function Add-LogLine {
    param([string]$Raw)
    try {
        $t = $Raw.Trim()
        if ($t.Length -eq 0) { return }
        if ($t.Length -gt 80) { $t = $t.Substring(0, 80) }
        $n = $script:LogLines.Count
        if ($n -gt 0 -and $script:LogLines[$n - 1] -eq $t) { return }
        $script:LogLines += $t
        if ($script:LogLines.Count -gt 3) {
            $script:LogLines = $script:LogLines[($script:LogLines.Count - 3)..($script:LogLines.Count - 1)]
        }
    } catch {}
}

# Ждать ли Enter перед закрытием (передаётся как -NoWait из панели AE:
# там консоль закрывается сама, а Read-Host держал AE «Не отвечает»)
function Wait-Exit {
    param([string]$Msg = 'Нажмите Enter для выхода')
    if ($NoWait) { return }
    try { Read-Host $Msg | Out-Null } catch {}
}

Write-Host ""
Write-Host "=========== Auto Subtitles: Whisper ==========="
Write-Host ""

# ------------------------------------------------------------
#  СКАЧИВАНИЕ МОДЕЛИ: докачка после обрыва + мультипоток (v1.16.0)
#  Whisper сам качает модель одним потоком и без докачки — обрыв
#  связи начинал загрузку с нуля. Здесь модель качаем сами, ровно
#  в кэш whisper (~\.cache\whisper), в N потоков; каждый кусок
#  продолжается ровно с места обрыва (HTTP Range), SHA-256
#  сверяется с официальным — whisper принимает файл, не качая его
#  сам. Если что-то не вышло — whisper качает сам, как раньше.
# ------------------------------------------------------------

$script:ModelUrls = @{
    'tiny'   = @{ file = 'tiny.pt';           url = 'https://openaipublic.azureedge.net/main/whisper/models/65147644a518d12f04e32d6f3b26facc3f8dd46e5390956a9424a650c0ce22b9/tiny.pt' }
    'base'   = @{ file = 'base.pt';           url = 'https://openaipublic.azureedge.net/main/whisper/models/ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e/base.pt' }
    'small'  = @{ file = 'small.pt';          url = 'https://openaipublic.azureedge.net/main/whisper/models/9ecf779972d90ba49c06d968637d720dd632c55bbf19d441fb42bf17a411e794/small.pt' }
    'medium' = @{ file = 'medium.pt';         url = 'https://openaipublic.azureedge.net/main/whisper/models/345ae4da62f9b3d59415adc60127b97c714f32e89e936602e85993674d08dcb1/medium.pt' }
    'large'  = @{ file = 'large-v3.pt';       url = 'https://openaipublic.azureedge.net/main/whisper/models/e5b1a55b89c1367dacf97e3e19bfd829a01529dbfdeefa8caeb59b3f1b81dadb/large-v3.pt' }
    'turbo'  = @{ file = 'large-v3-turbo.pt'; url = 'https://openaipublic.azureedge.net/main/whisper/models/aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a/large-v3-turbo.pt' }
}

# Кэш моделей — как у whisper: XDG_CACHE_HOME или ~\.cache + \whisper
function Get-WhisperCacheDir {
    $xdg = $env:XDG_CACHE_HOME
    if ([string]::IsNullOrWhiteSpace($xdg)) { $xdg = Join-Path $env:USERPROFILE '.cache' }
    return (Join-Path $xdg 'whisper')
}

# SHA-256 официальной модели = сегмент пути URL (так их хранит и проверяет whisper)
function Test-ModelHashOk {
    param([string]$Path, [string]$Url)
    try {
        if (-not (Test-Path -LiteralPath $Path)) { return $false }
        $expected = (($Url -split '/')[-2]).ToLowerInvariant()
        $h = (Get-FileHash -LiteralPath $Path -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
        return ($h -eq $expected)
    } catch { return $false }
}

# Размер файла на сервере + поддерживает ли он Range-докачку
function Get-RemoteInfo {
    param([string]$Url)
    try {
        try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
        try { [Net.ServicePointManager]::DefaultConnectionLimit = 64 } catch {}
        $req = [Net.HttpWebRequest]::Create($Url)
        $req.Method = 'HEAD'
        $req.Timeout = 30000
        $req.UserAgent = 'AutoSubtitles/1.16'
        $resp = $req.GetResponse()
        $total = $resp.ContentLength
        $ar = $resp.Headers['Accept-Ranges']
        $resp.Close()
        $ranges = ($total -gt 0 -and $ar -ne $null -and ('' + $ar) -match 'bytes')
        return @{ total = $total; ranges = $ranges }
    } catch {
        return @{ total = [long]-1; ranges = $false }
    }
}

# Тело ОДНОГО загрузчика: качает диапазон [Start..End] в файл PartPath,
# начиная ровно с того места, где этот кусок прервался (это и есть докачка)
$script:DlWorkerBody = @'
param([string]$Url, [long]$Start, [long]$End, [string]$PartPath)

$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
try { [Net.ServicePointManager]::DefaultConnectionLimit = 64 } catch {}

$need = $End - $Start + 1
$have = [long]0
if (Test-Path -LiteralPath $PartPath) {
    $have = [long](Get-Item -LiteralPath $PartPath -Force).Length
    if ($have -lt 0) { $have = [long]0 }
}
$from = $Start + $have
if ($from -le $End) {
    $req = [Net.HttpWebRequest]::Create($Url)
    $req.Method = 'GET'
    $req.AddRange('bytes', $from, $End)
    $req.UserAgent = 'AutoSubtitles/1.16'
    $req.Timeout = 45000
    $req.ReadWriteTimeout = 90000
    $req.AllowAutoRedirect = $true

    $resp = $null
    try {
        $resp = $req.GetResponse()
        if ($have -gt 0 -and [int]$resp.StatusCode -ne 206) {
            throw ('сервер не поддержал докачку (HTTP ' + [int]$resp.StatusCode + ')')
        }
        $s = $resp.GetResponseStream()
        try {
            $fs = $null
            $openTries = 0
            while ($fs -eq $null) {
                try {
                    $fs = [IO.File]::Open($PartPath, [IO.FileMode]::Append, [IO.FileAccess]::Write, [IO.FileShare]::Read)
                } catch {
                    $openTries++
                    if ($openTries -gt 5) { throw }
                    Start-Sleep -Milliseconds 400
                }
            }
            try {
                $buf = New-Object byte[] 1048576
                while ($true) {
                    $n = $s.Read($buf, 0, $buf.Length)
                    if ($n -le 0) { break }
                    $fs.Write($buf, 0, $n)
                    $fs.Flush()
                }
            } finally { try { $fs.Close() } catch {} }
        } finally { try { $s.Close() } catch {} }
    } finally { try { if ($resp -ne $null) { $resp.Close() } } catch {} }
}

# кусок обязан достать ровно до своего размера
$have2 = [long](Get-Item -LiteralPath $PartPath -Force).Length
if ($have2 -lt $need) { throw ('кусок недокачан: ' + $have2 + ' из ' + $need) }
'@

# Сборка кусков в готовую модель (по смещениям, ровно по размерам кусков)
function Merge-ModelParts {
    param($PartList, [string]$Target)
    $out = [IO.File]::Open($Target, [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try {
        $buf = New-Object byte[] 1048576
        foreach ($p in $PartList) {
            $remaining = [long]($p.end - $p.start + 1)
            $in = [IO.File]::OpenRead($p.path)
            try {
                while ($remaining -gt 0) {
                    $take = [int][Math]::Min([long]$buf.Length, $remaining)
                    $r = $in.Read($buf, 0, $take)
                    if ($r -le 0) { break }
                    $out.Write($buf, 0, $r)
                    $remaining -= $r
                }
            } finally { try { $in.Close() } catch {} }
            if ($remaining -gt 0) { throw ('не все байты куска на месте: ' + $p.path) }
        }
    } finally { try { $out.Close() } catch {} }
}

function Start-ModelDownload {
    param([string]$Name, [string]$Url, [string]$File, [string]$Dir, [int]$Threads)

    if ($Threads -lt 1) { $Threads = 1 }
    $target = Join-Path $Dir $File
    $merge = $target + '.merge'

    # 1) уже на месте и целое?
    if ((Test-Path -LiteralPath $target) -and (Test-ModelHashOk -Path $target -Url $Url)) {
        Write-Host ("Модель {0} уже в кэше ({1:N1} МБ) — скачивание не нужно." -f $File, ((Get-Item -LiteralPath $target).Length / 1MB))
        return $true
    }
    # 2) битая (недокачанная) копия в кэше помешала бы whisper — убираем
    if (Test-Path -LiteralPath $target) {
        Write-Host "В кэше лежит битая копия модели (SHA-256 не совпал) — скачаю заново."
        try { [IO.File]::Delete($target) } catch {}
    }
    if (Test-Path -LiteralPath $merge) { try { [IO.File]::Delete($merge) } catch {} }
    if (-not (Test-Path -LiteralPath $Dir)) { New-Item -ItemType Directory -Force -Path $Dir | Out-Null }

    # 3) размер на сервере + поддержка Range
    $info = Get-RemoteInfo -Url $Url
    if ([long]$info.total -le 0) { return $false }
    $total = [long]$info.total
    if (-not $info.ranges) {
        if ($Threads -gt 1) { Write-Host "Сервер не поддерживает Range-докачку — качаю одним потоком." }
        $Threads = 1
    }
    # куски мельче 8 МБ не делаем
    $K = [Math]::Max(1, [Math]::Min($Threads, [int][Math]::Ceiling($total / 8MB)))
    if ($K -gt 1) {
        Write-Host ("Скачиваю {0} ({1:N1} МБ) в {2} поток(а), с докачкой при обрывах..." -f $File, ($total / 1MB), $K)
        Write-Host "Прервёшь окно — в следующий раз модель ДОКАЧАЕТСЯ с места обрыва."
    } else {
        Write-Host ("Скачиваю {0} ({1:N1} МБ) одним потоком..." -f $File, ($total / 1MB))
    }
    Set-Status 'DL' ("Скачиваю модель {0}: {1} поток(а) · с докачкой" -f $Name, $K) 0 -1

    # 4) куски: имя файла-части = СМЕЩЕНИЕ в байтах → докачка прежних
    #    кусков возможна даже если число потоков сменилось между запусками
    $chunk = [long][Math]::Floor($total / $K)
    $parts = @()
    $off = [long]0
    for ($i = 0; $i -lt $K; $i++) {
        $e = $off + $chunk - 1
        if ($i -ge ($K - 1)) { $e = $total - 1 }
        $parts += @{
            idx   = $i; start = $off; end = $e
            path  = (Join-Path $Dir ($File + '.part.' + $off.ToString('D12')))
            ps    = $null; handle = $null; tries = 0
            lastLen = [long]-1; changedAt = $null
        }
        $off = $off + $chunk
    }

    $pool = [RunspaceFactory]::CreateRunspacePool(1, $K)
    function Start-Runner {
        param([hashtable]$r)
        $ps = [PowerShell]::Create()
        $ps.RunspacePool = $pool
        [void]$ps.AddScript($script:DlWorkerBody).
            AddArgument($Url).
            AddArgument([long]$r.start).
            AddArgument([long]$r.end).
            AddArgument([string]$r.path)
        $r.ps = $ps
        $r.handle = $ps.BeginInvoke()
        $r.lastLen = [long]-1
        $r.changedAt = Get-Date
    }

    try {
        $pool.Open()
        foreach ($r in $parts) { Start-Runner $r }

        $shownAt = [datetime]::MinValue
        $lastT = $null
        $lastDone = [long]-1
        while ($true) {
            $allDone = $true
            $doneSum = [long]0
            $now = Get-Date
            foreach ($r in $parts) {
                $len = [long]0
                try {
                    $fi = Get-Item -LiteralPath $r.path -Force -ErrorAction SilentlyContinue
                    if ($fi -ne $null) { $len = [long]$fi.Length }
                } catch { $len = [long]0 }
                $needR = [long]($r.end - $r.start + 1)
                if ($len -ge $needR) { $doneSum += $needR; continue }
                $allDone = $false
                $doneSum += $len
                if ($len -ne $r.lastLen) { $r.lastLen = $len; $r.changedAt = $now }
                if ($r.ps -ne $null -and $r.handle -ne $null -and $r.handle.IsCompleted) {
                    try { $null = $r.ps.EndInvoke($r.handle) } catch { Write-Host ("  поток {0}: {1} — продолжаю с {2:N1} МБ" -f ($r.idx + 1), $_.Exception.Message, ($len / 1MB)) }
                    try { $r.ps.Dispose() } catch {}
                    $r.ps = $null; $r.handle = $null
                }
                $stalled = ($r.changedAt -ne $null -and (($now - $r.changedAt).TotalSeconds -gt 12))
                if ($r.ps -eq $null) {
                    $r.tries++
                    if ($r.tries -gt 8) { throw ("не удалось докачать кусок " + $r.idx) }
                    Start-Runner $r
                } elseif ($stalled) {
                    # поток завис — перезапуск с того же места (докачка)
                    try { $r.ps.Stop() } catch {}
                    try { $r.ps.Dispose() } catch {}
                    $r.ps = $null; $r.handle = $null
                    $r.tries++
                    if ($r.tries -gt 8) { throw ("не удалось докачать кусок " + $r.idx) }
                    Start-Runner $r
                }
            }

            $pct = [int](($doneSum * 100) / $total)
            if ($lastT -ne $null) {
                $dt = ($now - $lastT).TotalSeconds
                if ($dt -gt 0.3) {
                    $speed = [long](($doneSum - $lastDone) / $dt)
                    $remain = -1
                    if ($speed -gt 4096) { $remain = [int](($total - $doneSum) / $speed) }
                    $msg = ("{0:N0} из {1:N0} МБ · {2} поток(а) · {3:N1} МБ/с" -f ($doneSum / 1MB), ($total / 1MB), $K, ($speed / 1MB))
                    Set-Status 'DL' $msg $pct $remain
                    if (($now - $shownAt).TotalSeconds -gt 8) {
                        $shownAt = $now
                        Write-Host ("  {0}% · {1}" -f $pct, $msg)
                    }
                }
            }
            $lastT = $now
            $lastDone = $doneSum

            if ($allDone) { break }
            Start-Sleep -Milliseconds 450
        }
    } catch {
        foreach ($r in $parts) {
            try { if ($r.ps -ne $null) { $r.ps.Stop(); $r.ps.Dispose() } } catch {}
        }
        Write-Host ("ДОКАЧКА не удалась: " + $_.Exception.Message)
        return $false
    } finally {
        try { if ($pool -ne $null) { $pool.Close() } } catch {}
    }

    # 5) сборка + SHA-256 (как у whisper — он обязан принять файл)
    Set-Status 'DL' 'Собираю модель из кусков...' 99 -1
    Write-Host "Собираю модель из кусков..."
    try {
        Merge-ModelParts -PartList ($parts | Sort-Object { $_.start }) -Target $merge
        if (-not (Test-ModelHashOk -Path $merge -Url $Url)) {
            throw 'SHA-256 не совпал — куски битые, в следующий раз скачается заново.'
        }
        try { [IO.File]::Delete($target) } catch {}
        [IO.File]::Move($merge, $target)
        Get-ChildItem -LiteralPath $Dir -Filter ($File + '.part.*') -ErrorAction SilentlyContinue | ForEach-Object {
            try { [IO.File]::Delete($_.FullName) } catch {}
        }
        Set-Status 'DL' ('Модель скачана (SHA-256 ок)') 100 -1
        Write-Host ("ГОТОВО: модель {0} скачана и сверена — whisper запустится без загрузки." -f $File)
        return $true
    } catch {
        try { [IO.File]::Delete($merge) } catch {}
        Write-Host ("Сборка не удалась: " + $_.Exception.Message)
        return $false
    }
}

function Ensure-WhisperModel {
    param([string]$Name, [int]$Threads)

    $mi = $script:ModelUrls[$Name]
    if ($null -eq $mi) { return $false }

    $dir = Get-WhisperCacheDir
    $ok = Start-ModelDownload -Name $Name -Url $mi.url -File $mi.file -Dir $dir -Threads $Threads
    if (-not $ok) {
        Write-Host ""
        Write-Host "Докачка не удалась — whisper скачает модель сам (одним потоком), как раньше."
        Write-Host ""
    }
    return $ok
}

if ($FastWhisper) {
    Write-Host "Ускоритель faster-whisper включён — модель CT2 whisper-ctranslate2 скачает сам при первом запуске."
} else {
    [void](Ensure-WhisperModel -Name $Model -Threads $DlThreads)
}
if ($DownloadModelOnly) {
    Set-Status 'DONE' 'Модель в кэше (проверено).' 100
    Wait-Exit
    exit 0
}

# ---------- v1.23: РЕЖИМ СЛЕЖЕНИЯ за папкой ----------
# Проверка раз в 60 с: новое видео (без готового SRT) — запускает сам
# себя для него со всеми текущими настройками. Выход — закрыть окно.
if ($WatchFolder -ne '') {
    Write-Host ""
    Write-Host ("РЕЖИМ СЛЕЖЕНИЯ за папкой: " + $WatchFolder)
    Write-Host ("Проверка новых видео раз в 60 с. Выход — закрыть это окно.")
    Write-Host ""
    $doneW = @{}
    while ($true) {
        try {
            $vidsW = Get-ChildItem -LiteralPath $WatchFolder -File -ErrorAction SilentlyContinue | Where-Object {
                $ew = $_.Extension.ToLower().TrimStart('.')
                (@('mp4', 'mov', 'avi', 'mkv', 'm4v', 'webm') -contains $ew) -and (-not $doneW.ContainsKey($_.FullName))
            }
            foreach ($vw in $vidsW) {
                $doneW[$vw.FullName] = $true
                $srtExpW = Join-Path $vw.DirectoryName ($vw.BaseName + "." + $Lang + ".srt")
                if (Test-Path -LiteralPath $srtExpW) { continue }
                $glossW = Join-Path $vw.DirectoryName ($vw.BaseName + ".glossary.txt")
                $argsW = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $PSCommandPath,
                    '-Video', $vw.FullName, '-Lang', $Lang, '-Model', $Model,
                    '-StatusFile', $StatusFile, '-DlThreads', [string]$DlThreads, '-NoWait')
                if ($SecondLang -ne '') { $argsW += @('-SecondLang', $SecondLang) }
                if ($PromptFile -ne '') { $argsW += @('-PromptFile', $PromptFile) }
                if ($Karaoke) { $argsW += '-Karaoke' }
                if ($CutGarbage) { $argsW += '-CutGarbage' }
                if ($FastWhisper) { $argsW += '-FastWhisper' }
                if ($NotifyDone) { $argsW += '-NotifyDone' }
                if (Test-Path -LiteralPath $glossW) { $argsW += @('-GlossaryFile', $glossW) }
                Write-Host ""
                Write-Host ("НОВОЕ ВИДЕО: " + $vw.Name)
                & powershell @argsW
            }
        } catch {
            Write-Host ("Ошибка сканирования папки: " + $_.Exception.Message)
        }
        Start-Sleep -Seconds 60
    }
}

# ---------- ffmpeg: winget кладёт алиас в WinGet\Links — добавим в PATH сессии ----------
Set-Status 'CHECK' 'Проверка whisper/ffmpeg...' 3

$wingetLinks = "$env:LOCALAPPDATA\Microsoft\WinGet\Links"
if (Test-Path -LiteralPath $wingetLinks) {
    if ($env:Path -notlike "*$wingetLinks*") {
        $env:Path = "$wingetLinks;" + $env:Path
    }
}
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($null -eq $ffmpeg) {
    Set-Status 'ERROR' 'ffmpeg не найден'
    Write-Host "ОШИБКА: ffmpeg не найден."
    Write-Host "Установите: winget install --id Gyan.FFmpeg -e"
    Wait-Exit
    exit 2
}

# ---------- проверки ----------
if (-not (Test-Path -LiteralPath $Video)) {
    Set-Status 'ERROR' 'Файл видео не найден'
    Write-Host "ОШИБКА: файл не найден: $Video"
    Wait-Exit
    exit 1
}

# ---------- длительность видео (для ETA-оценки в панели) ----------
try {
    $durRaw = & ffprobe -v quiet -show_entries format=duration -of csv=p=0 $Video 2>$null
    if ($durRaw) {
        $script:TotalSec = [math]::Round([double]($durRaw | Select-Object -First 1), 1)
    }
} catch {
    $script:TotalSec = 0
}

# ---------- поиск whisper.exe (в т.ч. вне PATH) ----------
function Resolve-Whisper {
    $c = Get-Command whisper -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    $candidates = @(
        "$env:LOCALAPPDATA\Programs\Python\Python313\Scripts\whisper.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python312\Scripts\whisper.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\Scripts\whisper.exe",
        "C:\Python312\Scripts\whisper.exe",
        "C:\Python313\Scripts\whisper.exe",
        "C:\Python311\Scripts\whisper.exe"
    )
    foreach ($p in $candidates) {
        if (Test-Path -LiteralPath $p) { return $p }
    }
    $g = Get-ChildItem "$env:LOCALAPPDATA\Programs\Python\Python*\Scripts\whisper.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($g) { return $g.FullName }
    return $null
}

$whisperExe = Resolve-Whisper
if ($null -eq $whisperExe) {
    Set-Status 'ERROR' 'whisper.exe не найден'
    Write-Host "ОШИБКА: не найден whisper.exe."
    Write-Host ""
    Write-Host "Установите один раз:"
    Write-Host "   pip install openai-whisper"
    Write-Host ""
    Wait-Exit
    exit 2
}

# ---------- v1.19.6: устройство Whisper (CPU/CUDA) для строки статуса ----------
# cuda-модель в torch — почти мгновенная проверка через python, чей whisper.exe
try {
    $whDir2 = Split-Path -Parent $whisperExe
    $pyHome2 = Split-Path -Parent $whDir2
    $pyExe2 = Join-Path $pyHome2 'python.exe'
    if (Test-Path -LiteralPath $pyExe2) {
        $devRaw = & $pyExe2 -c "import torch; print('cuda' if torch.cuda.is_available() else 'cpu')" 2>$null
        if ("$devRaw".Trim().ToLower() -eq 'cuda') { $script:Dev = 'CUDA' }
    }
} catch { $script:Dev = 'CPU' }

$langMap = @{ 'ru' = 'Russian'; 'en' = 'English' }
$langName = $langMap[$Lang]

$tmpRoot = Join-Path ([System.IO.Path]::GetTempPath()) "AutoSubWhisper"
$tmp = Join-Path $tmpRoot ("run_" + [guid]::NewGuid().ToString("N").Substring(0, 8))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$etaHint = ""
if ($script:TotalSec -gt 5) {
    $factors = @{ 'tiny' = 0.15; 'base' = 0.35; 'small' = 0.8; 'medium' = 2.5; 'large' = 4.5; 'turbo' = 0.9 }
    $est = [int]($script:TotalSec * $factors[$Model])
    $mins = [int][math]::Round($est / 60)
    if ($mins -ge 1) { $etaHint = ("  (примерно ~{0} мин)" -f $mins) }
}

Set-Status 'START' ('Модель ' + $Model + ', видео ' + [int]$script:TotalSec + ' c.') 6
Write-Host ("Распознавание речи ({0}, модель {1})..." -f $langName, $Model)
Write-Host ("Видео: {0}  [{1:N0} c]{2}" -f $Video, $script:TotalSec, $etaHint)
Write-Host ("Кэш моделей: {0}  (обрыв не теряет ход — докачка; потоков: {1})" -f (Get-WhisperCacheDir), $DlThreads)
Write-Host ""
Write-Host "Прогресс Whisper'а показан ниже (первый запуск качает модель):"
Write-Host ""

# ---------- словарь-подсказка (initial_prompt) ----------
$script:UserPrompt = ''
if ($PromptFile -ne '' -and (Test-Path -LiteralPath $PromptFile)) {
    try {
        $script:UserPrompt = ([IO.File]::ReadAllText($PromptFile, [Text.Encoding]::UTF8)).Trim()
        if ($script:UserPrompt.Length -gt 900) { $script:UserPrompt = $script:UserPrompt.Substring(0, 900) }
    } catch { $script:UserPrompt = '' }
}
if ($script:UserPrompt -ne '') {
    Write-Host ("Словарь-подсказка ({0} симв.): {1}" -f $script:UserPrompt.Length, $script:UserPrompt)
}

# --verbose False — включает tqdm-бар whisper (без этого флага он отключён!)
# Караоке-режим: вывод JSON + --word_timestamps → обёртка сама собирает
# SRT из сегментов и пишет kar-файл с таймингами слов.
function Start-WhisperRun {
    param([string]$Mode)

    # v1.23: движок — whisper-ctranslate2 (faster-whisper), если выбран
    # и установлен; иначе обычный whisper
    $exeRun = $whisperExe
    if ($FastWhisper) {
        $fwCmd = Get-Command 'whisper-ctranslate2' -ErrorAction SilentlyContinue
        if ($null -ne $fwCmd) {
            $exeRun = $fwCmd.Source
            Write-Host "Движок: whisper-ctranslate2 (faster-whisper) — быстрее в 2-4 раза."
        } else {
            Write-Host "whisper-ctranslate2 не найден (pip install whisper-ctranslate2) — работаю обычным whisper."
        }
    }

    $wa = @($Video, '--model', $Model, '--verbose', 'False', '--language', $langName, '--task', 'transcribe')
    if ($script:UserPrompt -ne '') { $wa += @('--initial_prompt', $script:UserPrompt) }
    if ($Mode -eq 'kar') {
        $wa += @('--word_timestamps', 'True', '--output_format', 'json')
    } else {
        $wa += @('--output_format', 'srt')
    }
    $wa += @('--output_dir', $tmp)

    & $exeRun @wa 2>&1 | ForEach-Object {
        $line = "$_"
        Write-Host $line
        Add-LogLine $line
        # v1.19.6: прогресс по сегментам из бара tqdm («| 51/124 [»)
        if ($line -match '^\s*\d{1,3}%\|[^|]*\|\s*(\d+)/(\d+)\s') {
            try {
                $script:SegNow = [int]$Matches[1]
                $script:SegAll = [int]$Matches[2]
            } catch {}
        }
        if ($line -match '(\d{1,3})\s*%') {
            $p = [int]$Matches[1]
            if ($p -ge 0 -and $p -le 100) {
                $rem = -1
                # tqdm пишет [прошло<осталось, скорость]: " 41%|...| [00:51<01:12, 12.4it/s]"
                if ($line -match '\[[^\]<]*<\s*([0-9:]+)') {
                    try {
                        $rem = 0
                        foreach ($seg in ($Matches[1] -split ':')) { $rem = $rem * 60 + [int]$seg }
                    } catch { $rem = -1 }
                }
                if ($line -match 'safetensors|\.bin\b|\.pt\b|Downloading|MB/s') {
                    Set-Status 'LOAD' ('Качаю модель: ' + $p + '%') $p $rem
                } else {
                    Set-Status 'RUN' ('Распознаю речь: ' + $p + '%') $p $rem
                }
            }
        }
    }
}

# Формат тайм-кода SRT: 00:01:02,345
function Fmt-SrtTime {
    param([double]$sec)
    if ($sec -lt 0) { $sec = 0 }
    $t = [int][Math]::Floor($sec)
    $ms = [int][Math]::Round(($sec - $t) * 1000)
    if ($ms -ge 1000) { $ms = 999 }
    $h = [int][Math]::Floor($t / 3600)
    $m = [int][Math]::Floor(($t % 3600) / 60)
    $s = $t % 60
    return ('{0:D2}:{1:D2}:{2:D2},{3:D3}' -f $h, $m, $s, $ms)
}

# JSON Whisper (с word_timestamps) → SRT + kar-файл (тайминги слов для панели)
function Convert-WhisperJsonToSrt {
    param([string]$JsonPath, [string]$SrtPath, [string]$KarPath, [switch]$CutGarbage)
    $raw = [IO.File]::ReadAllText($JsonPath, [Text.Encoding]::UTF8)
    $j = $raw | ConvertFrom-Json
    if ($null -eq $j) { throw 'JSON пуст' }
    $segs = $j.segments
    if ($null -eq $segs) { throw 'в JSON нет сегментов' }

    $srtText = ''
    $karItems = @()
    $n = 0
    for ($si = 0; $si -lt $segs.Count; $si++) {
        $sg = $segs[$si]
        $n++
        $sgText = ("" + $sg.text).Trim()
        if ($sgText -eq '') { $n-- ; continue }
        # v1.23: РЕЗКА МУСОРА — сегменты с низкой уверенностью Whisper
        # (фантомы на музыке/шуме) не попадают в SRT
        if ($CutGarbage) {
            $nspG = 0.0; $alpG = 0.0
            try { $nspG = [double]$sg.no_speech_prob } catch {}
            try { $alpG = [double]$sg.avg_logprob } catch {}
            if (($nspG -gt 0.6) -or ($alpG -lt -1.0)) {
                $n--
                Write-Host ("  отфильтрован мусор (Whisper не уверен): " + $sgText)
                continue
            }
        }
        $srtText += ($n.ToString() + "`r`n")
        $srtText += ((Fmt-SrtTime ([double]$sg.start)) + ' --> ' + (Fmt-SrtTime ([double]$sg.end)) + "`r`n")
        $srtText += ($sgText + "`r`n")
        $srtText += "`r`n"

        $wi = @()
        if ($null -ne $sg.words) {
            for ($si2 = 0; $si2 -lt $sg.words.Count; $si2++) {
                $w = $sg.words[$si2]
                $wTxt = ("" + $w.word).Trim()
                if ($wTxt -eq '') { continue }
                $wi += ,@([double]$w.start, [double]$w.end, $wTxt)
            }
        }
        if ($wi.Count -gt 1) {
            $karItems += @{ i = $n; w = $wi }
        }
    }

    $utfBom = New-Object Text.UTF8Encoding($true)
    [IO.File]::WriteAllText($SrtPath, $srtText, $utfBom)
    if ($KarPath -ne '' -and $karItems.Count -gt 0) {
        $karJson = ConvertTo-Json ([object[]]$karItems) -Depth 5 -Compress
        [IO.File]::WriteAllText($KarPath, $karJson, (New-Object Text.UTF8Encoding($false)))
    }
    return $n
}

$videoBase = [IO.Path]::GetFileNameWithoutExtension($Video)
# v1.23: «резать мусор» тоже идёт через JSON (фильтр по оценкам Whisper)
if ($Karaoke -or $CutGarbage) {
    Start-WhisperRun 'kar'
    $errCode = $LASTEXITCODE

    $karIn = Join-Path $tmp ($videoBase + '.json')
    $haveSrt = (Get-ChildItem -LiteralPath $tmp -Filter '*.srt' -ErrorAction SilentlyContinue) -ne $null
    if ((Test-Path -LiteralPath $karIn) -and (-not $haveSrt)) {
        try {
            $srtBuilt = Join-Path $tmp ($videoBase + '.' + $Lang + '.srt')
            $karTmp = Join-Path $tmp '__karaoke.json'
            $builtCount = Convert-WhisperJsonToSrt -JsonPath $karIn -SrtPath $srtBuilt -KarPath $karTmp -CutGarbage:$CutGarbage
            Write-Host ("SRT собран из JSON Whisper с таймингами слов (караоке): {0} сегментов" -f $builtCount)
        } catch {
            Write-Host ('Караоке-JSON не обработан: ' + $_.Exception.Message)
        }
    }
    if (-not (Get-ChildItem -LiteralPath $tmp -Filter '*.srt' -ErrorAction SilentlyContinue)) {
        # Особым путём не вышло (возможно, старый Whisper без word_timestamps) —
        # обычный проход, субтитры всё равно не теряются
        Write-Host "Караоке-режим не сработал — повторяю обычным режимом SRT."
        Start-WhisperRun 'srt'
        $errCode = $LASTEXITCODE
    }
} else {
    Start-WhisperRun 'srt'
    $errCode = $LASTEXITCODE
}

$srt = Get-ChildItem -LiteralPath $tmp -Filter *.srt -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $srt) {
    Set-Status 'ERROR' ('Whisper не создал SRT (код ' + $errCode + ')')
    Write-Host ""
    Write-Host ("ОШИБКА: Whisper не создал файл субтитров (код {0})." -f $errCode)
    Wait-Exit
    exit 3
}

# ---------- перенос результата к видео ----------
Set-Status 'COPY' 'Переношу SRT к видео...' 99
$dir = Split-Path -Parent (Resolve-Path -LiteralPath $Video).Path
$base = [System.IO.Path]::GetFileNameWithoutExtension($Video)
$langSrt = Join-Path $dir ($base + "." + $Lang + ".srt")
Copy-Item -LiteralPath $srt.FullName -Destination $langSrt -Force
# караоке-файл (тайминги слов) — рядом с SRT, панель подхватывает его на импорте
$karTmp = Join-Path $tmp '__karaoke.json'
if (Test-Path -LiteralPath $karTmp) {
    try {
        Copy-Item -LiteralPath $karTmp -Destination (Join-Path $dir ($base + "." + $Lang + ".kar.json")) -Force
        Write-Host ("Караоке-файл (слова с таймингами): {0}.{1}.kar.json" -f $base, $Lang)
    } catch { Write-Host ('Караоке-файл не скопировался: ' + $_.Exception.Message) }
}
Write-Host ""
Write-Host ("ГОТОВО: {0}" -f $langSrt)

# ---------- вторая дорожка (перевод) ----------
if ($SecondLang -and $SecondLang -ne $Lang) {
    Set-Status 'TRANSLATE' 'Перевод второй дорожки...' 99
    $translator = Join-Path (Split-Path -Parent $PSCommandPath) "translate-srt.ps1"
    if (Test-Path -LiteralPath $translator) {
        Write-Host ""
        Write-Host ("Перевод на '{0}'..." -f $SecondLang)
        try {
            & $translator -InputFile $langSrt -Target $SecondLang -GlossaryFile $GlossaryFile 2>&1 | ForEach-Object {
                $line = "$_"
                Write-Host $line
                Add-LogLine $line
                if ($line -match 'Переведено\s+(\d+)') {
                    Set-Status 'TRANSLATE' ('Перевод: ' + $Matches[1] + ' реплик...') -1
                }
            }
        } catch {
            Write-Host "Перевод не удался: $($_.Exception.Message)"
            Write-Host ("Дорожка '{0}' не создана — используйте Whisper напрямую." -f $SecondLang)
        }
    } else {
        Write-Host "translate-srt.ps1 не найден рядом со скриптом — вторая дорожка пропущена."
    }
}

Set-Status 'DONE' 'Готово. В панели: «Загрузить SRT».' 100

# v1.23: окно «ГОТОВО» — не нужно следить за консолью
if ($NotifyDone) {
    try {
        Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-Command', "Add-Type -AssemblyName System.Windows.Forms; [void][System.Windows.Forms.MessageBox]::Show('Auto Subtitles: Whisper ГОТОВО — SRT рядом с видео','Auto Subtitles')"
    } catch {}
}

Write-Host ""
Write-Host "=========== ГОТОВО ==========="
Write-Host "Зайдите в AE-панель и нажмите «Загрузить SRT»."
Write-Host ""
Wait-Exit 'Нажатие Enter закрывает окно'
