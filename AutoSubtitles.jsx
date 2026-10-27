#targetengine "session"

/* =========================================================================
   Auto Subtitles v1.19.0 — субтитры из видео для After Effects 2024 (24.x)
   Видео → Whisper → SRT → текстовые слои: чистка пунктуации, автоподгон
   под комп, единая анимация (без выражений), режим «по одному слову»,
   запуск Whisper прямо от выбранного слоя таймлайна. RU снизу + EN сверху.
   Караоке-подсветка слов по реальным таймингам Whisper (word_timestamps):
   реплика = базовый слой + «♪»-дубль, Source Text шагает hold-ключами.
   Фон-подложка (v1.19): тёмная скруглённая полоса за текстом (shape-слой,
   ребёнок текстового слоя, живёт на длительность реплики) — опционально.
   v1.19.1: полоса доведена — в «по одному слову» не гаснет после первого
   слова (свои ключи прозрачности на всю реплику), рисуется ПОД всеми
   словами реплики и входит в свои пресеты (💾 Сохранить).
   v1.19.2: двойной клик в редакторе выделяет ВСЕ слои реплики (база +
   ♪ + фон-полоса / все слова) — по метке «AutoSub cue=N» в комментарии
   слоя; раньше поиск по имени терял слои при караоке и «по одному слову».
   v1.19.3: пресеты стиля — кнопки-переключатели: активный подсвечен
   акцентом, повторный клик снимает пресет («свой стиль»), ручная правка
   любого поля стиля снимает подсветку сама.
   v1.19.4: вкладки без номеров («Видео/Дорожки/Стиль/Эффекты»), пресеты
   сеткой 2×2, в «Эффектах» — ПОИСК по всем эффектам, установленным в AE
   (app.effects): печатаешь часть названия — список показывает совпадения.
   v1.19.5: экспорт .ass из редактора — караоке-подсветка слов «{\k NN}»
   по таймингам Whisper (kar.json), стиль из панели (шрифт/цвета/обводка
   или фон-подложка через BorderStyle=3), \fad по «Аним.,с». Файл пишется
   рядом с SRT — проект AE не трогается. Открывается в VLC, DaVinci,
   Media Player Classic, Premiere (плагины).
   Словарь-промпт (initial_prompt) для правильных имён; live-строка
   «что делать дальше»; в редакторе — массовая замена и реплика↔CTI.
   Прогресс Whisper в панели: % , время и ETA
   («осталось ≈ мин · готово к ЧЧ:ММ»). Тёмная тема (Notio-стиль).
   Тикер прогресса «тихий»: без cancelTask изнутри задачи и без
   перерисовки UI из фонового тика (иначе AE падает с 0::42).
    v1.19.7: палитра по канону Nothi Toolkit (реальные токены его CSS):
    bg #0A0A0A, шапка #141416, подсказка #1C1C20, ghost #24242A,
    текст #EDEDEF, muted #8A8A93, dim #5E5E66, зелёный ok #6FD49A
    (все зелёные кнопки — один токен), ошибка #FF8A80 («Стоп»).
    Структура вкладок не менялась — надёжный tabbedpanel.
    v1.19.8: ПОИСК ПОЧИНЕН — app.effects в реальном AE это МАССИВ
    (индексация с 0, поля displayName/matchName, а не numEffects/.name),
    поэтому раньше всегда влетали в «нет списка» и выпадашка не
    реагировала на запрос; фолбэк (без API) теперь тоже фильтрует
    запрос. Кнопки — по образцу Notio Toolkit: скруглённые тайлы и
    полные пилюли для главных действий (onDraw + ScriptUIPath:
    newPath/moveTo/lineTo/closePath/rectPath/fillPath/drawString);
    если path-API недоступен — деградация в прежние прямоугольники;
    рисование идёт только в штатный момент перерисовки (0::42 не
    рискует). «?» и «🗑» и «Синхрониз. со списком» тоже покрашены.
   v1.19.11: ПЛАШКА-ПОДСКАЗКА «Шаг 1/2/3» под шапкой УБРАНА (по
   просьбе): последовательность видна по кнопкам, прогресс Whisper
   не дублируется — он есть в собственной строке статуса («Whisper:
   N%» + бар). updateGuide оставлен пустым — вызовы не тронуты.
   v1.19.12: «✎ Список» при показе поля списка сразу перестраивает
   строки параметров из поля (правка доступна немедленно); пустой
   список больше не молчит — подсказка «найди эффект выше и жми +».
   v1.20.0: ДИЗАЙН, ВИДИМЫЙ НА ЛЮБОЙ СБОРКЕ. На репаках с изменённой
   темой нативные Button игнорируют ScriptUI-кисти (фон/цвет текста
   не применяются — серые кнопки без зелёного). Ключевые цветные
   кнопки переведены на КНОПКИ-НАДПИСИ (statictext красится
   гарантированно — доказано скрином пользователя): «Создать
   субтитры» и «Whisper → SRT» — зелёные, «Стоп» — красный текст,
   «?» — компактный (больше не растягивается), «+» и «💾 Сохранить»
   — зелёные, пресеты — подсветка активного + текстовая строка
   «пресет: N — повторный клик снимает». Логика и обработчики не
   изменились; на обычных сборках выглядит так же.
   v1.20.1: уточнено по второму скрину — на этой сборке НЕ красится
   и фон statictext (только цвет текста). Кнопка = ГРУППА (фон
   контейнеров красится — полоса шапки доказывает) + надпись внутри
   (цвет текста). Клик на обеих. Диагностика краски: %TEMP%\
   AutoSub_paint_probe.txt — какие примитивы реально поддержаны.
   v1.20.2: ПРОКРУТКА ВКЛАДОК — ползунок справа на каждой вкладке
   листает содержимое вверх/вниз (панель больше не нужно растягивать);
   maxvalue пересчитывается при смене вкладки и ресайзе. Убраны
   символы, не отрисовавшиеся на сборке пользователя: «↻»→«Обн.»,
   «↺»→«Сброс», «⤴»→«↑», «💾»/«🗑»/«➤»/«⚠» — заменены текстом
   (отображавшиеся «📁🎙⬇⬆✎⚙✕» оставлены). «Создать субтитры»
   крупнее: высота 44, шрифт 14.
   v1.20.3: ползунок прокрутки заменён на кнопки «▲/▼» справа на
   каждой вкладке — на тёмных репаках слайдер мог рисоваться
   невидимым; кнопки листают по 90px за клик и активны только когда
   содержимое не влезает (пересчёт при смене вкладки и ресайзе).
   v1.20.4: ПРОКРУТКА ОТКАЧЕНА ПО ПРОСЬБЕ — вкладки как в v1.19.11:
   без ползунка и кнопок ▲▼, эксперимент ломал раскладку на сборке
   пользователя (поджимал строки, обрезал подписи). Сохранено из
   более новых версий: зелёные кнопки-группы («Создать субтитры»
   крупнее), «Обн.»/«Сброс»/«↑ В список» вместо битых символов.
   Родная прокрутка длинных вкладок — скроллом док-окна AE.
   v1.20.5: ПОЛНЫЙ ОТКАТ UI-ЭКСПЕРИМЕНТОВ к состоянию v1.19.11 (по
   просьбе): все кнопки снова НАТИВНЫЕ (на репаках — серые), прежние
   символы «💾🗑↻↺⤴➤⚠» возвращены, «Создать субтитры» 36px/12,
   строка-подсказка пресетов убрана, хелперы кнопок-надписей удалены.
   Работают все функции v1.19.11+: поиск шрифтов/эффектов, «⚙»-диалог
   параметров, пресеты-переключатели, редактор, экспорт .ass.
   v1.21.0: УМНЫЙ ТАЙМИНГ — галочка во вкладке «Стиль»: длительность
   реплики прикидывается по числу слов (~0,35 с на слово, потолок 6 с,
   минимум — «Мин. показ, с»). Короткие реплики не висят, длинные
   дотягиваются до читаемой длины — только растяжение и только в
   свободное место до старта следующей реплики (налезать нельзя).
   Работает для обеих дорожек, хранится в пресетах и автозапоминании.
   v1.22.0: ШЕСТЬ НОВЫХ ИНСТРУМЕНТОВ.
   «Снять стиль» («Стиль», у поля шрифта) — выбери в таймлайне ЛЮБОЙ
   текстовый слой: панель читает его шрифт/размер/цвет/обводку/отступ
   и заполняет свои поля («сделай как вон в том ролике»).
   Редактор: галочка «(!) быстрые» (ВЫКЛ по умолчанию) помечает реплики
   быстрее 20 симв/с; кнопки «Разделить реплику» (по слову у середины,
   время пропорционально) и «Склеить с предыдущей».
   «Пакет: папка видео» («Видео») — Whisper расшифровывает ПО ОЧЕРЕДИ
   все видео папки в одном окне; статус «[номер/всего]».
   Глоссарий перевода (галочка, ВЫКЛ): файл <видео>.glossary.txt
   («термин=замена») правит перевод дорожки 2 — имена не переводятся.
   «Проверка: всё готово?» — чек-лист: видео, SRT, kar.json, модель
   в кэше, обёртка, ffmpeg/whisper, faster-whisper (опционально).
   v1.23.0: СЕМЬ ИНСТРУМЕНТОВ — ВСЕ ГАЛОЧКИ, ВЫКЛ ПО УМОЛЧАНИЮ.
   «Ускоритель: faster-whisper» — движок whisper-ctranslate2 быстрее
   в 2-4 раза (pip install whisper-ctranslate2), не найден — откат.
   «Резать мусор» — сегменты с низкой уверенностью Whisper не попадают
   в SRT (фильтр no_speech/avg_logprob, JSON-путь).
   «Словарь учится на правках» — замены из редактора сами добавляются
   в Словарь-промпт при следующем запуске.
   «Исчезание: уехать вниз» — реплика уезжает вниз ключами позиции.
   «Схлопывать повторы реплик подряд» — «Да. / Да. / Да.» → одна.
   «Выключить ПК после пакета» (60 с на отмену shutdown /a).
   «Сообщить о завершении» — окно Windows в конце расшифровки.
   «Watch: следить» — папка мониторится: новые видео расшифровываются
   сами (проверка раз в 60 с). Кэш переводов в translate-srt.ps1 —
   повторные прогоны не тратят запросы. Undo в редакторе (20 шагов),
   «Таймкоды YouTube» (<имя>.chapters.txt), счётчик симв/слов.
   v1.24.0: ПРЕВЬЮ-РЕНДЕР 5 СЕК — кнопка под «Создать субтитры»:
   рендерит активный комп с позиции таймлайна (5 с) в файл рядом
   с видео (H.264 → .mp4; модуля нет — дефолтный Lossless → .avi).
   AE на время рендера подвисает (штатный rq.render()); при сбое
   комп остаётся в Render Queue — Start вручную. Файл не затирается:
   _превью, _превью_1, _превью_2...
   v1.25.0: ДИАПАЗОН ПОКАЗА — поля «Показ: с … до … сек» во вкладке
   «Стиль» (пусто = весь ролик, как раньше). Реплики вне диапазона
   пропускаются, задевшие границы — обрезаются по ним; полировка и
   умный тайминг не выталкивают реплику за правую границу. Формат
   гибкий: «5», «90.5», «1:30». Перепутали «с» и «до» — меняются
   местами сами. Поля не запоминаются после перезапуска AE — чтобы
   диапазон не остался включённым случайно. Работает для обеих дорожек.
   v1.19.10: ПОИСК ШРИФТОВ как у эффектов. Печатаешь в поле «Шрифт»
   часть имени — под ним выпадает список УСТАНОВЛЕННЫХ в AE шрифтов
   (app.fonts.allFonts, работает с AE 24.0; из каждой семейственной
   группы берётся «Regular», имена как в Character-панели, без дублей;
   до 24 совпадений: сначала «начинается с запроса», потом «содержит»).
   Клик по совпадению записывает полное имя в поле шрифта; счётчик
   «шр.:N»/«найдено: N»; кнопка «↻» перечитывает список после установки
   новых шрифтов. Без app.fonts — честный фолбэк (статический список
   популярных + фильтр запроса). Поле «Шрифт» остаётся ЕДИНСТВЕННЫМ
   источником истины: пресеты, снапшоты и экспорт не менялись.
   Дописано при ревизии: выбор из списка снимает подсветку пресета
   (ручной onChange), счётчик не режет «найдено: 24».
   v1.19.9: откат скруглённых кнопок к проверенному виду (path-API на
   сборке не поддержался — прежние прямоугольники + штатная надпись).
   Параметры эффектов: векторные «10, 20» / «[10,20]» и цветовые
   «255,40,0» значения свойств (цвет 0–255 → 0–1); список эффектов
   режется с учётом скобок — «Name(Col=255,40,0)» не ломается
   (parseFxSpec теперь реально использует splitFxList — был написан,
   но не подключён).
   v1.19.6: дизайн по макету — шапка «Auto Subtitles.jsx — After
   Effects ‹версия›», live-подсказка на плашке, вкладки — кнопки-пилюли
   вручную (нативные вкладки ScriptUI не красятся), «Стоп» у прогресса,
   вкладка «Эффекты» как в макете: поиск по УСТАНОВЛЕННЫМ эффектам
   (app.effects, пусто = реальные установленные, популярные из них
   сверху, счётчик «ус.:N»), сырой список «На все слои» скрыт
   (кнопка «✎ Список»), строки параметров с ✕, ghost-кнопки.
   Статус Whisper: «whisper small · CUDA · 51/124 сегм.» — обёртка
   пишет dev= и seg= (torch cuda-детект + разбор бара tqdm).
   Установка: .../Scripts/ScriptUI Panels/ (+translate-srt.ps1,
   +transcribe-video.ps1 рядом). Совместимо с AE 17.x и новее.
   ========================================================================= */

(function autoSubtitles(thisObj) {

  var SCRIPT_NAME = "Auto Subtitles";
  var VERSION_STR = "v1.25.0";
  var PREFIX = "AutoSubtitles";

  var COLOR_NAMES = ["Белый", "Чёрный", "Жёлтый", "Красный", "Зелёный", "Голубой", "Оранжевый", "Розовый", "Другой..."];
  var COLOR_VALUES = {
    "Белый": [1, 1, 1],
    "Чёрный": [0, 0, 0],
    "Жёлтый": [1, 0.88, 0.1],
    "Красный": [1, 0.25, 0.22],
    "Зелёный": [0.35, 0.85, 0.4],
    "Голубой": [0.4, 0.8, 1],
    "Оранжевый": [1, 0.62, 0.1],
    "Розовый": [1, 0.55, 0.8]
  };

  /* Оценка скорости Whisper на CPU: во сколько раз время обработки
     больше длительности видео (fallback, если Whisper не отдал %). */
  var MODEL_FACTOR = { "tiny": 0.15, "base": 0.35, "small": 0.8, "medium": 2.0, "large": 4.5, "turbo": 0.9 };

  /* Тёмная палитра (референс Notio, углублённая v1.11.1) */
  /* v1.19.7: палитра по канону Nothi Toolkit (com.nothi.toolkit / css/panel.css):
    bg #0A0A0A → plate #141416 (raise) → card #1C1C20 (hover) → ghost #24242A (press),
    текст #EDEDEF, muted #8A8A93, dim #5E5E66, успех #6FD49A, ошибка #FF8A80 */
  var STYLE = {
    bg:     [0.039, 0.039, 0.039],
    card:   [0.110, 0.110, 0.125],  // live-подсказка — ступень hover
    plate:  [0.078, 0.078, 0.086],  // шапка — ступень raise
    ghost:  [0.141, 0.141, 0.165],  // «призрачные» кнопки — ступень press
    tiles:  [0.086, 0.086, 0.098],  // v1.19.8: тайлы-кнопки #161619 (поверхность Notio)
    accent: [0.36, 0.63, 0.99],
    green:  [0.435, 0.831, 0.604],  // #6FD49A — единый зелёный всех действий
    yellow: [1.0, 0.83, 0.30],
    gray:   [0.541, 0.541, 0.576],  // #8A8A93 — второстепенные статусы
    label:  [0.929, 0.929, 0.937],  // #EDEDEF — основной текст
    dim:    [0.369, 0.369, 0.400],  // #5E5E66 — тихие метки
    red:    [1.0, 0.541, 0.502]     // #FF8A80 — ошибки/«Стоп»
  };

  /* ------------------------------ утилиты ------------------------------ */

  function trimStr(s) { return String(s).replace(/^\s+|\s+$/g, ""); }

  function truncateMid(s, n) {
    s = String(s);
    if (s.length <= n) return s;
    var head = Math.floor((n - 3) / 2);
    return s.substring(0, head) + "..." + s.substring(s.length - head);
  }

  function parseNumber(txt, def) {
    var v = parseFloat(String(txt).replace(",", "."));
    if (isNaN(v)) return def;
    return v;
  }

  // v1.25: гибкое время — «5» = 5 с, «1:30»/«0:05» = минуты:секунды,
  // «90.5» = с дробью. Пусто/мусор → -1 (диапазон выключен).
  function parseTimeFlex(txt) {
    var t = trimStr(String(txt));
    if (t === "") return -1;
    var m = t.match(/^(\d+):(\d{1,2})([.,]\d+)?$/);
    if (m) return parseInt(m[1], 10) * 60 + parseFloat(m[2] + (m[3] || ""));
    var v = parseNumber(t, -1);
    if (v < 0) return -1;
    return v;
  }

  // v1.19.9: «10, 20» / «[10,20]» / «255,40,0» → массив чисел (для
  // двумерных и цветовых свойств эффектов). Не числа / пусто → null.
  function parseVecStr(txt) {
    var s = trimStr(String(txt)).replace(/^\[/, "").replace(/\]$/, "");
    if (s === "") return null;
    var arr = s.split(",");
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var piece = trimStr(arr[i]).replace(",", ".");
      if (piece === "" || !/^-?(\d+\.?\d*|\.\d+)([eE]-?\d+)?$/.test(piece)) return null;
      out.push(parseFloat(piece));
    }
    if (out.length < 2 || out.length > 4) return null;
    return out;
  }

  // v1.19.9: значение PropertyValueType.COLOR в AE (имя члена COLOR/Color
  // различается в сборках — берём любое найденное; -1 = узнать не удалось)
  var VT_COLOR = -1;
  (function () {
    try {
      if (typeof PropertyValueType !== "undefined" && PropertyValueType) {
        if (PropertyValueType.COLOR !== undefined) VT_COLOR = PropertyValueType.COLOR;
        else if (PropertyValueType.Color !== undefined) VT_COLOR = PropertyValueType.Color;
      }
    } catch (eVt) { VT_COLOR = -1; }
  })();

  // v1.19.9: разбор списка эффектов С УЧЁТОМ СКОБОК — параметры вида
  // «Name(Col=255,40,0; Radius=25)» больше не разрезаются по запятым
  // внутри «(...)» (раньше это ломало список при запятых в значениях)
  function splitFxList(txt) {
    var s = String(txt);
    var out = [], cur = "", depth = 0, i, ch;
    for (i = 0; i < s.length; i++) {
      ch = s.charAt(i);
      if (ch === "(") depth++;
      else if (ch === ")") { if (depth > 0) depth--; }
      if (ch === "," && depth <= 0) {
        if (trimStr(cur) !== "") out.push(trimStr(cur));
        cur = "";
      } else {
        cur += ch;
      }
    }
    if (trimStr(cur) !== "") out.push(trimStr(cur));
    return out;
  }

  // Быстрая регулировка сдвига: кнопки −0.5/−0.1/+0.1/+0.5 у поля сдвига.
  function mkNudge(parent, field, labelTxt) {
    parent.add("statictext", undefined, labelTxt);
    function mkB(txt, d) {
      var b = parent.add("button", undefined, txt);
      b.preferredSize.width = 30;
      b.helpTip = "Сдвиг субтитров на " + (d > 0 ? "+" : "") + d + " с (плюс = позже, минус = раньше). Сохрани и сравни с аудио.";
      b.onClick = function () {
        var v = parseNumber(field.text, 0);
        v = Math.round((v + d) * 10) / 10;
        field.text = (v > 0 ? "+" : "") + String(v);
        // programmatic .text не зовёт onChange — зовём вручную,
        // чтобы ручная правка сдвига сняла подсветку пресета (v1.19.3)
        try { if (typeof field.onChange === "function") field.onChange.call(field); } catch (eN0) {}
      };
    }
    mkB("−0.5", -0.5); mkB("−0.1", -0.1); mkB("+0.1", 0.1); mkB("+0.5", 0.5);
  }

  // Разбор строки эффектов с параметрами:
  // "Deep Glow(Radius=25;Exposure=1.2), S_DropShadow" →
  // [{name:"Deep Glow", params:"Radius=25;Exposure=1.2"}, {name:"S_DropShadow", params:""}]
  function parseFxSpec(txt) {
    // v1.19.9: резка списка через скобочный splitFxList — запятые внутри
    // «(...)» (например «Name(Col=255,40,0)») больше не рвут запись эффекта
    var arr = splitFxList(txt);
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var s = trimStr(arr[i]);
      if (s === "") continue;
      var eo = s.indexOf("(");
      if (eo > 0 && s.charAt(s.length - 1) === ")") {
        var nm = trimStr(s.substring(0, eo));
        var ps = trimStr(s.substring(eo + 1, s.length - 1));
        if (nm !== "") out.push({ name: nm, params: ps });
      } else {
        out.push({ name: s, params: "" });
      }
    }
    return out;
  }

  // Чистка запинок: Whisper рисует повторяющиеся подряд слова («и и», «да да да»).
  // Из серии остаётся первое слово; сравнение по буквам, без знаков препинания.
  function cleanStutters(cuesIn) {
    var out = [];
    for (var i = 0; i < cuesIn.length; i++) {
      var c = cuesIn[i];
      var flat = String(c.text).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");
      var words = trimStr(flat).split(" ");
      var kept = [];
      var prevKey = "";
      for (var w = 0; w < words.length; w++) {
        var key = words[w].toLowerCase().replace(/[^\wа-яё]/g, "");
        if (key === "") { kept.push(words[w]); continue; }
        if (key === prevKey) continue;
        kept.push(words[w]);
        prevKey = key;
      }
      var t = trimStr(kept.join(" "));
      if (t !== "") out.push({ start: c.start, end: c.end, text: t });
    }
    return out;
  }

  // v1.23: схлопывание ПОДРЯД ИДУЩИХ одинаковых реплик («Да. / Да. / Да.»
  // от Whisper) в одну — время от первой до конца последней, текст один раз.
  function dedupeCues(cuesIn) {
    var out = [];
    for (var i = 0; i < cuesIn.length; i++) {
      var t = trimStr(String(cuesIn[i].text)).replace(/\s+/g, " ");
      var prev = (out.length > 0) ? trimStr(String(out[out.length - 1].text)).replace(/\s+/g, " ") : "\u0001";
      if (t !== "" && t.toLowerCase() === prev.toLowerCase()) {
        out[out.length - 1].end = cuesIn[i].end;
      } else {
        out.push({ start: cuesIn[i].start, end: cuesIn[i].end, text: cuesIn[i].text });
      }
    }
    return out;
  }

  /* ---- КАРАОКЕ-ПОДСВЕТКА (v1.18) ----------------------------------------
     Два слоя на реплику: базовый (весь текст) + дубликат сверху с цветом
     акцента, у которого SOURCE TEXT меняется hold-ключами по реальным
     таймингам слов Whisper: на старте реплики — "", к старту каждого слова
     в дубликате добавляется очередная часть текста. Сказанная часть
     рисуется цветом акцента поверх базового — классическая караоке-
     подсветка.НИКАКИХ выражений и sourceRectAtTime — только ключи. ---- */

  // Сверка слов по буквам/цифрам (знаки препинания и регистр не важны)
  function sameWord(a, b) {
    var ka = String(a).toLowerCase().replace(/[^\wа-яё]/g, "");
    var kb = String(b).toLowerCase().replace(/[^\wа-яё]/g, "");
    return ka !== "" && ka === kb;
  }

  // Возвращает число созданных слоёв: 2 (база + подсветка), 1 (только база,
  // дубликат не вышел) или 0 (слова не совпали — караоке-options пропустить,
  // вызывающий код построит обычные слои).
  function buildKaraokeLayers(comp, kw, baseTxt, s, e, opts, idx, cStartRaw, cSpanRaw, cueNo) {
    try {
      // 1) Слова БАЗОВОГО текста по строкам (переносы уже сделал wrapText).
      //    Префиксы подсветки строим из токенов базового текста — тогда
      //    глифы дубликата совпадают с базой пиксель-в-пиксель.
      var linesArr = baseTxt.split("\r");
      var toks = [];       // {t: слово, ln: номер строки} по порядку
      var lineFirst = [];  // индекс первого токена каждой строки
      var rL, rW;
      for (rL = 0; rL < linesArr.length; rL++) {
        lineFirst.push(-1);
        var wsArr = trimStr(linesArr[rL]).replace(/\s+/g, " ").split(" ");
        for (rW = 0; rW < wsArr.length; rW++) {
          if (wsArr[rW] === "") continue;
          if (lineFirst[rL] < 0) lineFirst[rL] = toks.length;
          toks.push({ t: wsArr[rW], ln: rL });
        }
      }
      if (toks.length !== kw.length) return 0;
      var q;
      for (q = 0; q < toks.length; q++) if (!sameWord(toks[q].t, kw[q][2])) return 0;

      // 2) базовый слой (метка реплики в комментарии уйдёт и в «♪»-дубль)
      var baseL = makeSubLayer(comp, baseTxt, s, e, opts, idx, cueNo);

      // 3) слой-подсветка: дубликат базы (стили, эффекты, прозрачность, in/out)
      var hl;
      try { hl = baseL.duplicate(); } catch (dupErr) { return 1; }
      try {
        var sxT = hl.property("Source Text");
        while (sxT.numKeys > 0) sxT.removeKey(1);
      } catch (skErr) {}
      try {
        var tdH = hl.property("Source Text").value;
        tdH.applyFill = true;
        tdH.fillColor = (opts.kColor !== undefined) ? opts.kColor : [1, 0.88, 0.15];
        hl.property("Source Text").setValue(tdH);
      } catch (colErr) {}
      var trackLbl = (opts.trackName && opts.trackName !== "") ? opts.trackName : "SUB";
      try { hl.name = trackLbl + " " + pad3(idx) + " \u266A"; } catch (nErrK) {}

      // 4) ключи Source Text: s → " " (пока не сказано — пусто; пробел вместо
      //    пустой строки: пустые TextDocument капризны), старт слова k →
      //    строки-префикс до k
      try {
        var hlT = hl.property("Source Text");
        var startDoc = hlT.value;
        startDoc.text = " ";
        hlT.setValueAtTime(s, startDoc);
        var lastKeyT = s;
        var frG = (comp.frameRate && comp.frameRate > 1) ? comp.frameRate : 30;
        var spanBg = (cSpanRaw > 0.05) ? cSpanRaw : Math.max(0.05, e - s);
        for (var kIdx = 0; kIdx < toks.length; kIdx++) {
          // время слова из ИСХОДНОЙ реплики линейно отображаем в [s..e]
          var r = (kw[kIdx][0] - cStartRaw) / spanBg;
          if (r < 0) r = 0;
          if (r > 1) r = 1;
          var tK = Math.round((s + r * (e - s)) * frG) / frG;
          if (tK <= lastKeyT + 1 / frG) tK = lastKeyT + 1 / frG;
          if (tK > e) tK = e;
          if (tK <= lastKeyT + 0.0005) continue;

          // префикс: строки ДО текущей целиком + текущая строка до слова k
          var curLine = toks[kIdx].ln;
          var outLines = [];
          for (var li2 = 0; li2 <= curLine; li2++) {
            var st2 = lineFirst[li2];
            if (st2 < 0) { outLines.push(""); continue; }
            if (li2 < curLine) {
              outLines.push(trimStr(linesArr[li2]));
            } else {
              var prefParts = [];
              for (var tk2 = st2; tk2 <= kIdx; tk2++) prefParts.push(toks[tk2].t);
              outLines.push(prefParts.join(" "));
            }
          }
          var doc2 = hlT.value;
          doc2.text = outLines.join("\r");
          hlT.setValueAtTime(tK, doc2);
          lastKeyT = tK;
        }
      } catch (keyKarErr) {
        // ключи не сложились — дубликат просто красит исходную реплику
      }
      // v1.19: фон-подложка за караоке-репликой (под обоими текстовыми слоями)
      if (opts.bgBar) {
        try { addBarLayer(comp, baseL, baseTxt, s, e, opts, idx, null, cueNo); } catch (barK) {}
      }
      return 2;
    } catch (karOuter) {
      return 0;
    }
  }

  function loadPref(key, def) {
    try {
      var v = app.settings.getSetting(PREFIX, key);
      if (v !== "" && v !== undefined && v !== null) return v;
    } catch (e) {}
    return def;
  }

  function savePref(key, val) {
    try { app.settings.saveSetting(PREFIX, key, String(val)); } catch (e) {}
  }

  function rgbToInt(rgb) {
    var r = Math.round(Math.max(0, Math.min(1, rgb[0])) * 255);
    var g = Math.round(Math.max(0, Math.min(1, rgb[1])) * 255);
    var b = Math.round(Math.max(0, Math.min(1, rgb[2])) * 255);
    return (255 * 16777216) + (r * 65536) + (g * 256) + b;
  }

  function pickColor(rgb) {
    var res = -1;
    try { res = $.colorPicker(rgbToInt(rgb)); } catch (e) { res = -1; }
    if (res === undefined || res === null || res < 0) return null;
    var r = (res >> 16) & 255;
    var g = (res >> 8) & 255;
    var b = res & 255;
    return [r / 255, g / 255, b / 255];
  }

  function baseNameOf(pathOrFile) {
    var n = "";
    if (pathOrFile instanceof File) n = pathOrFile.name;
    else n = String(pathOrFile).replace(/\\/g, "/").split("/").pop();
    n = n.replace(/\.[^.]*$/, "");
    if (n === "") n = "video";
    return n;
  }

  function folderOf(pathOrFile) {
    if (pathOrFile instanceof File && pathOrFile.parent) return pathOrFile.parent.fsName;
    var s = String(pathOrFile).replace(/\//g, "\\");
    var i = s.lastIndexOf("\\");
    return (i > 0) ? s.substring(0, i) : "";
  }

  /* ------------------------- стилизация UI ----------------------------- */

  function paintLabel(ctrl, rgb) {
    try {
      var g = ctrl.graphics;
      g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, [rgb[0], rgb[1], rgb[2], 1], 1, { style: "plain" });
    } catch (e) {}
  }

  function makeBold(ctrl, size) {
    try { ctrl.graphics.font = ctrl.graphics.newFont("Segoe UI", size, "BOLD"); } catch (e) {}
  }

  /* ---- v1.19.9: кнопки — ПРОВЕРЕННЫЙ вид ----------------------------------
     Эксперимент v1.19.8 (скругление через onDraw + ScriptUIPath) на сборке
     пользователя не поддержался: path-функции отсутствовали, рисовались
     резервные прямоугольники, а собственная текст-рисовалка давала неверную
     центровку. Возвращаем прежний вид: заливка фона графической
     кистью + ШТАТНАЯ надпись (ScriptUI сам центрует текст) — как во всех
     стабильных версиях до v1.19.7. Палитра Notio сохраняется. -------------- */
  function paintButton(ctrl, rgb) {
    try {
      ctrl.graphics.backgroundColor = ctrl.graphics.newBrush(ctrl.graphics.BrushType.SOLID_COLOR, [rgb[0], rgb[1], rgb[2], 1]);
      ctrl.graphics.foregroundColor = ctrl.graphics.newPen(ctrl.graphics.PenType.SOLID_COLOR, [0.05, 0.05, 0.05, 1], 1, { style: "plain" });
    } catch (e) {}
  }

  function paintPanel(ctrl, rgb) {
    try {
      var g = ctrl.graphics;
      g.backgroundColor = g.newBrush(g.BrushType.SOLID_COLOR, [rgb[0], rgb[1], rgb[2], 1]);
    } catch (e) {}
  }

  // вторичная кнопка: спокойная тёмная заливка + надпись (белая по
  // умолчанию; fgOpt — цвет надписи: красный «Стоп», акценты)
  function paintGhost(ctrl, fgOpt) {
    var fg = fgOpt || STYLE.label;
    try {
      var g = ctrl.graphics;
      g.backgroundColor = g.newBrush(g.BrushType.SOLID_COLOR, [STYLE.tiles[0], STYLE.tiles[1], STYLE.tiles[2], 1]);
      g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, [fg[0], fg[1], fg[2], 1], 1, { style: "plain" });
    } catch (e) {}
  }

  // v1.19.6: кнопка-вкладка — активная подсвечена светлой плашкой и
  // белым текстом, неактивная — тонет в фоне панели (как в мокапе)
  function paintTab(ctrl, active) {
    try {
      var g = ctrl.graphics;
      if (active) {
        g.backgroundColor = g.newBrush(g.BrushType.SOLID_COLOR, [0.205, 0.225, 0.265, 1]);
        g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1, 1], 1, { style: "plain" });
      } else {
        g.backgroundColor = g.newBrush(g.BrushType.SOLID_COLOR, [0.075, 0.082, 0.098, 1]);
        g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, [0.58, 0.60, 0.64, 1], 1, { style: "plain" });
      }
    } catch (e) {}
  }

  function fmtElapsed(sec) {
    if (sec < 0) return "";
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + " мин " + (s < 10 ? "0" : "") + s + " с";
  }

  /* --------------------------- чтение файла ---------------------------- */

  function detectEncoding(path) {
    var f = new File(path);
    f.encoding = "BINARY";
    if (!f.open("r")) return "UTF-8";
    var d = f.read();
    f.close();
    if (d.length >= 3 && d.charCodeAt(0) === 0xEF && d.charCodeAt(1) === 0xBB && d.charCodeAt(2) === 0xBF) return "UTF-8";
    var i, b, n, valid = 0, high = 0;
    for (i = 0; i < d.length; i++) {
      b = d.charCodeAt(i);
      if (b > 127) {
        high++;
        if ((b === 0xD0 || b === 0xD1) && (i + 1) < d.length) {
          n = d.charCodeAt(i + 1);
          if (n >= 0x80 && n <= 0xBF) { valid++; i++; }
        }
      }
    }
    if (high === 0) return "UTF-8";
    return (valid * 10 >= high * 6) ? "UTF-8" : "windows-1251";
  }

  function readText(path, enc) {
    var f = new File(path);
    try { f.encoding = enc; } catch (e) {}
    if (!f.open("r")) throw new Error("Не удалось открыть файл: " + path);
    var data = f.read();
    f.close();
    if (data.charAt(0) === "\uFEFF") data = data.substring(1);
    return data;
  }

  /* ---------------------------- парсинг SRT ---------------------------- */

  function toSeconds(h, m, s, ms) {
    var frac = parseInt(ms, 10);
    var div = Math.pow(10, String(ms).length);
    return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10) + frac / div;
  }

  // секунды → "HH:MM:SS,mmm" (формат SRT, для редактора субтитров)
  function fmtSrtTime(sec) {
    if (sec < 0) sec = 0;
    var ms = Math.round(sec * 1000);
    var h = Math.floor(ms / 3600000); ms -= h * 3600000;
    var m = Math.floor(ms / 60000); ms -= m * 60000;
    var s = Math.floor(ms / 1000); ms -= s * 1000;
    function p2(n) { return (n < 10 ? "0" : "") + n; }
    function p3(n) { return (n < 100 ? (n < 10 ? "00" : "0") : "") + n; }
    return p2(h) + ":" + p2(m) + ":" + p2(s) + "," + p3(ms);
  }

  // v1.19.5: секунды → "H:MM:SS.CC" (формат ASS, санти-секунды)
  function fmtAssTime(sec) {
    if (sec < 0) sec = 0;
    var ce = Math.round(sec * 100);
    var h = Math.floor(ce / 360000); ce -= h * 360000;
    var m = Math.floor(ce / 6000); ce -= m * 6000;
    var s = Math.floor(ce / 100); ce -= s * 100;
    function p2(n) { return (n < 10 ? "0" : "") + n; }
    return h + ":" + p2(m) + ":" + p2(s) + "." + p2(ce);
  }

  // v1.19.5: цвет [r,g,b] 0..1 → "&HAABBGGRR" (в ASS альфа идёт ПЕРВЫМ
  // байтом, каналы — BGR; альфа 0x00 = непрозрачно, 0xFF = прозрачно)
  function rgbToAss(col, a) {
    function h2(n) {
      var v = Math.max(0, Math.min(255, Math.round(n)));
      var sx = v.toString(16).toUpperCase();
      return (sx.length < 2 ? "0" : "") + sx;
    }
    var r = (col && col.length >= 3) ? col : [1, 1, 1];
    var aa = (a === undefined) ? 0 : a;
    if (aa < 0) aa = 0; if (aa > 255) aa = 255;
    return "&H" + h2(aa) + h2(r[2] * 255) + h2(r[1] * 255) + h2(r[0] * 255);
  }

  /* ---- ЭКСПОРТ ASS (v1.19.5) ---------------------------------------------
     Пишет Advanced SubStation (.ass) рядом с SRT: тот же стиль, что в AE
     (шрифт/размер/цвета; фон-подложка → BorderStyle=3, обводка → 1),
     плюс караоке-подсветка слов «{\k NN}» по таймингам из <имя>.kar.json
     (его создаёт Whisper с галочкой «Караоке»). Проект AE не трогается —
     чистая запись файла ------------------------------------------------------------------ */
  function exportAssFile(srcFile, cues, o) {
    try {
      var out = [];
      var stripe = function (w) { return String(w).replace(/[{}]/g, ""); };
      var sizeA = Math.max(8, Math.round(o.size));
      var boxPadA = Math.max(6, Math.min(40, Math.round(o.size * 0.22)));
      var fadeMs = Math.round(o.fadeSec * 1000);

      out.push("[Script Info]");
      out.push("; Auto Subtitles " + VERSION_STR + " — экспорт из панели (караоке \\k)");
      out.push("Title: " + baseNameOf(srcFile));
      out.push("ScriptType: v4.00+");
      out.push("PlayResX: " + Math.max(1, Math.round(o.playW)));
      out.push("PlayResY: " + Math.max(1, Math.round(o.playH)));
      out.push("WrapStyle: 0");
      out.push("ScaledBorderAndShadow: yes");
      out.push("");
      out.push("[V4+ Styles]");
      out.push("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding");
      out.push("Style: AutoSub," + trimStr(o.font) + "," + sizeA + "," +
        rgbToAss(o.karColor, 0) + "," + rgbToAss(o.primary, 0) + "," +
        rgbToAss(o.outlineColor, 0) + "," + rgbToAss([0, 0, 0], 140) + "," +
        "0,0,0,0,100,100,0,0," +
        (o.bgBar ? ("3," + boxPadA + ",0,") : ("1," + Math.round(o.outlineW) + ",0,")) +
        "2,60,60," + Math.round(o.bottom) + ",1");
      out.push("");
      out.push("[Events]");
      out.push("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text");

      // kar-данные Whisper: [{"i":N,"w":[[start,end,"слово"],...]}] рядом с SRT
      var kd = null;
      if (o.karFile && o.karFile.exists) {
        try { kd = eval("(" + readText(o.karFile, "UTF-8") + ")"); } catch (eKA5) { kd = null; }
      }

      var karCount = 0;
      var iA, kA;
      for (iA = 0; iA < cues.length; iA++) {
        var cA = cues[iA];
        var plainA = trimStr(String(cA.text).replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").join("\\N").replace(/[{}]/g, ""));
        var bodyA = plainA;
        var mrkA = false;

        // слова панели (с пунктуацией) и тайминги Whisper сверяются 1:1;
        // не совпало — реплика уйдёт в ASS обычной строкой (без \k)
        if (kd && kd[iA] && kd[iA].w && kd[iA].w.length > 1) {
          var wA = kd[iA].w;
          var toksA = trimStr(plainA.replace(/\\N/g, " ")).replace(/\s+/g, " ").split(" ");
          var okA = (toksA.length === wA.length);
          if (okA) for (kA = 0; kA < wA.length; kA++) if (!sameWord(toksA[kA], wA[kA][2])) { okA = false; break; }
          if (okA) {
            var tagA = "";
            var prevT = cA.start;
            var penA = fadeMs > 0 ? ("{\\fad(" + fadeMs + "," + fadeMs + ")}") : "";
            for (kA = 0; kA < wA.length; kA++) {
              var dCe = Math.round((wA[kA][0] - prevT) * 100);
              if (dCe < 0) dCe = 0;
              tagA += penA + "{\\k" + dCe + "}" + stripe(toksA[kA]) + " ";
              penA = ""; // \fad достаточно одного тега на строку
              prevT = wA[kA][0];
            }
            bodyA = tagA.replace(/\s+$/, "");
            mrkA = true;
            karCount++;
          }
        }
        if (!mrkA && fadeMs > 0) {
          bodyA = "{\\fad(" + fadeMs + "," + fadeMs + ")}" + plainA;
        }

        out.push("Dialogue: 0," + fmtAssTime(cA.start) + "," + fmtAssTime(cA.end) +
          ",AutoSub,,0,0," + Math.round(o.bottom) + ",," + bodyA);
      }

      var fA = new File(srcFile.fsName.replace(/\.(srt|vtt)$/i, ".ass"));
      fA.encoding = "UTF-8";
      if (!fA.open("w")) return { ok: false, err: "Не удалось записать файл:\n\r" + fA.fsName };
      for (iA = 0; iA < out.length; iA++) fA.writeln(out[iA]);
      fA.close();
      return { ok: true, path: fA.fsName, kar: karCount, all: cues.length };
    } catch (eAS5) {
      return { ok: false, err: String(eAS5) };
    }
  }

  function parseSubtitles(data) {
    data = String(data).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^\uFEFF/, "");
    var lines = data.split("\n");
    var timeRe = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;
    var digitsRe = /^\s*\d+\s*$/;
    var cues = [];
    var active = null;
    var closed = true;
    var i, line, m, clean;

    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      if (/^WEBVTT/.test(line)) continue;
      m = timeRe.exec(line);
      if (m) {
        active = {
          start: toSeconds(m[1], m[2], m[3], m[4]),
          end: toSeconds(m[5], m[6], m[7], m[8]),
          text: []
        };
        cues.push(active);
        closed = false;
        continue;
      }
      if (digitsRe.test(line)) {
        if (active) { active = null; closed = true; }
        continue;
      }
      clean = line.replace(/<[^>]*>/g, "");
      clean = trimStr(clean);
      if (clean === "") {
        if (active) closed = true;
        continue;
      }
      if (active && !closed) active.text.push(clean);
    }

    var out = [];
    for (i = 0; i < cues.length; i++) {
      var c = cues[i];
      if (c.text.length === 0) continue;
      if (c.end <= c.start) c.end = c.start + 0.5;
      out.push({ start: c.start, end: c.end, text: c.text.join("\n") });
    }
    return out;
  }

  function wrapText(text, maxChars) {
    if (!maxChars || maxChars < 5) return text;
    var paras = text.split("\n");
    var out = [];
    var p, words, w, cur, candidate, word;
    for (p = 0; p < paras.length; p++) {
      words = paras[p].replace(/\s+/g, " ").split(" ");
      cur = "";
      for (w = 0; w < words.length; w++) {
        if (words[w] === "") continue;
        word = words[w];
        // СТРАХОВКА «ничего не выходит за край»: если одно слово длиннее
        // лимита строки — рвём его на куски (без дефисов).
        while (word.length > maxChars) {
          if (cur !== "") { out.push(cur); cur = ""; }
          out.push(word.substring(0, maxChars));
          word = word.substring(maxChars);
        }
        candidate = (cur === "") ? word : cur + " " + word;
        if (cur !== "" && candidate.length > maxChars) {
          out.push(cur);
          cur = word;
        } else {
          cur = candidate;
        }
      }
      out.push(cur);
    }
    return out.join("\r");
  }

  /* ------------------------- создание слоёв ---------------------------- */

  /* --- фишки из тутора «АВТО СУБТИТРЫ» (стиль CapCut-панелей) --- */

  // Убрать знаки препинания из текста (.,!?;: «» кавычки, скобки, тире)
  function stripPunct(s) {
    try {
      return String(s)
        .replace(/[.,!?:;«»'"()\[\]{}\-–—…]/g, "")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+$/g, "")
        .replace(/^[ \t]+/g, "");
    } catch (pErr) {
      return s;
    }
  }

  function cleanCues(cues) {
    try {
      for (var i = 0; i < cues.length; i++) {
        cues[i].text = stripPunct(cues[i].text);
      }
    } catch (cErr) {}
    return cues;
  }

  // Все px-параметры в панеле рассчитаны под комп 1920x1080.
  // fitOptsToComp пересчитывает их под реальную высоту компа.
  function fitOptsToComp(opts, comp) {
    try {
      var m = comp.height / 1080;
      if (!(m > 0.05 && m < 20)) return;
      opts.size = Math.max(8, Math.round(opts.size * m));
      opts.bottom = Math.max(0, Math.round(opts.bottom * m));
      if (opts.strokeOn && opts.strokeWidth > 0) {
        opts.strokeWidth = Math.max(1, Math.round(opts.strokeWidth * m));
      }
      // перенос строк — из ширины компа и размера шрифта.
      // ОСТОРОЖНЫЙ запас: строка ≤ 88% ширины компа и 0.6 px/символ —
      // в связке с разрывом слишком длинных слов строки гарантированно
      // не выходят за край композиции.
      if (opts.wrapChars > 0) {
        opts.wrapChars = Math.max(8, Math.floor(comp.width * 0.88 / (opts.size * 0.6)));
      }
    } catch (fErr) {}
  }

  // badge общий для RU и EN — масштабируется РАЗ (отдельно от opts)
  function fitBadgeToComp(badge, comp) {
    try {
      var m = comp.height / 1080;
      if (!(m > 0.05 && m < 20)) return;
      badge.padX = Math.max(2, Math.round(badge.padX * m));
      badge.padY = Math.max(1, Math.round(badge.padY * m));
      badge.round = Math.max(0, Math.round(badge.round * m));
    } catch (fBErr) {}
  }

  // Единая анимация слоёв. Строго ключевые кадры — НИ ОДНОГО выражения
  // (expressions роняют эту сборку AE). opts.anim: fade|pop|slideup|none,
  // opts.fade — длительность появления/затухания (сек).
  function applyLayerAnim(comp, layer, startT, endT, opts) {
    var anim = opts.anim || "fade";
    var dur = (opts.fade > 0.02) ? opts.fade : 0.15;
    var op = layer.property("Opacity");
    if (anim === "fade") {
      if ((endT - startT) > dur * 2.2) {
        try {
          op.setValueAtTime(startT, 0);
          op.setValueAtTime(startT + dur, 100);
          op.setValueAtTime(endT - dur, 100);
          op.setValueAtTime(endT, 0);
        } catch (e) {}
      }
      return;
    }
    if (anim === "none") return;
    try {
      if (anim === "pop") {
        var sc = layer.property("Scale");
        sc.setValueAtTime(startT, [0, 0]);
        sc.setValueAtTime(startT + dur * 0.7, [108, 108]);
        sc.setValueAtTime(startT + dur, [100, 100]);
        op.setValueAtTime(startT, 0);
        op.setValueAtTime(startT + dur * 0.6, 100);
      } else if (anim === "slideup") {
        var rise = Math.round(comp.height * 0.055);
        var pos = layer.property("Position");
        var basePos = pos.value;
        pos.setValueAtTime(startT, [basePos[0], basePos[1] + rise]);
        pos.setValueAtTime(startT + dur, basePos);
        op.setValueAtTime(startT, 0);
        op.setValueAtTime(startT + dur * 0.7, 100);
      }
    } catch (aErr) {}
    // конец реплики — плавное затухание (у всех режимов);
    // v1.23: галочка «Исчезание: уехать вниз» — позиция уезжает вниз
    if ((endT - startT) > dur * 2.2) {
      try {
        op.setValueAtTime(endT - dur, 100);
        op.setValueAtTime(endT, 0);
        if (opts.outDown) {
          var posD = layer.property("Position");
          var baseD = posD.value;
          posD.setValueAtTime(endT - dur, [baseD[0], baseD[1]]);
          posD.setValueAtTime(endT, [baseD[0], baseD[1] + Math.round(comp.height * 0.06)]);
        }
      } catch (aErr2) {}
    }
  }

  function getActiveComp() {
    if (!app.project) return null;
    var item = app.project.activeItem;
    if (item && item instanceof CompItem) return item;
    return null;
  }

  function pad3(n) {
    if (n < 10) return "00" + n;
    if (n < 100) return "0" + n;
    return "" + n;
  }

  function makeSubLayer(comp, txt, startT, endT, opts, idx, cueNo) {
    var layer = comp.layers.addText(txt);
    var td = layer.property("Source Text").value;
    try { td.font = opts.font; } catch (e) {}
    try { td.fontSize = opts.size; } catch (e) {}
    try {
      td.applyFill = true;
      td.fillColor = opts.fill;
    } catch (e) {}
    try {
      td.applyStroke = opts.strokeOn;
      if (opts.strokeOn) {
        td.strokeColor = opts.strokeColor;
        td.strokeWidth = opts.strokeWidth;
      }
    } catch (e) {}
    try { td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (e) {}
    layer.property("Source Text").setValue(td);

    layer.inPoint = startT;
    layer.outPoint = Math.max(endT, startT + 0.05);

    var linesCount = txt.split("\r").length;
    var x = comp.width / 2;
    var y = comp.height - opts.bottom - (linesCount - 1) * opts.size * 1.2;
    layer.property("Position").setValue([x, y]);

    applyLayerAnim(comp, layer, startT, endT, opts);

    var trackLabel = (opts.trackName && opts.trackName !== "") ? opts.trackName : "SUB";
    layer.name = trackLabel + " " + pad3(idx) + ": " + truncateMid(txt.split("\r")[0], 28);

    // v1.19.2: метка реплики в комментарии слоя. По ней редактор двойным
    // кликом находит ВСЕ слои реплики (база + ♪ + фон-полоса / слова) —
    // нумерация имён («RU 003:») с номером реплики не совпадает, как
    // только реплика создаёт больше одного слоя (караоке, по-слову).
    try { layer.comment = "AutoSub cue=" + (cueNo || 0) + " track=" + trackLabel; } catch (cmtErr) {}

    // Геометрия для статичной плашки (без sourceRectAtTime — он роняет AE на некоторых сборках)
    if (opts.badge && opts.badge.on) {
      try {
        var linesG = txt.split("\r").length;
        var lineHG = opts.size * 1.25;
        var segsG = txt.split("\r");
        var maxLenG = 0;
        for (var li = 0; li < segsG.length; li++) {
          if (segsG[li].length > maxLenG) maxLenG = segsG[li].length;
        }
        var estWG = Math.min(comp.width - 24, Math.max(140, maxLenG * opts.size * 0.55));
        opts.badge._geom = {
          cx: x,
          cy: y + linesG * lineHG / 2 - opts.size * 0.28,
          w: estWG,
          h: linesG * lineHG
        };
      } catch (gErr) {}
    }

    // СВОИ ЭФФЕКТЫ (Deep Glow, S_DropShadow и т.п.) — вешаются на каждый
    // созданный текстовый слой, с кастомными параметрами, если заданы.
    // Формат строки списка: «Имя(Свойство=значение; Свойство=значение)».
    // Не установленные эффекты/свойства НЕ роняют скрипт: собираются в
    // opts._fxMiss, отчёт показывается после импорта.
    if (opts.fx && opts.fx.length) {
      var efG = layer.Effects;
      for (var fi = 0; fi < opts.fx.length; fi++) {
        var fxSpec = opts.fx[fi];
        var fxName = trimStr((typeof fxSpec === "string") ? fxSpec : fxSpec.name);
        var fxParams = (typeof fxSpec === "object" && fxSpec !== null && fxSpec.params) ? trimStr(fxSpec.params) : "";
        if (fxName === "") continue;
        try {
          efG.addProperty(fxName);
          if (fxParams !== "") {
            var effObj = efG.property(efG.numProperties);
            var pairs = fxParams.split(";");
            for (var pk = 0; pk < pairs.length; pk++) {
              var kv = pairs[pk];
              var eq = kv.indexOf("=");
              if (eq <= 0) continue;
              var kk = trimStr(kv.substring(0, eq));
              var vv = trimStr(kv.substring(eq + 1)).replace(/%/g, "");
              if (kk === "" || vv === "") continue;
              try {
                // v1.19.9: двумерные (x, y) и цветовые (R,G,B 0–255 → 0–1)
                // свойства: «10, 20» → массив; обычные числа — как раньше
                var tgtP = effObj.property(kk);
                var vecV = parseVecStr(vv);
                if (vecV) {
                  try {
                    var isColP = false;
                    if (VT_COLOR >= 0) {
                      try { isColP = (tgtP.propertyValueType === VT_COLOR); } catch (eVc2) {}
                    }
                    if (isColP) {
                      var colP = [];
                      var nCx = (vecV.length > 3) ? 3 : vecV.length;
                      for (var cP = 0; cP < nCx; cP++) {
                        var cfP = vecV[cP] / 255;
                        if (cfP < 0) cfP = 0;
                        if (cfP > 1) cfP = 1;
                        colP.push(cfP);
                      }
                      if (vecV.length > 3) colP.push(vecV[3] / 255);
                      tgtP.setValue(colP);
                    } else {
                      tgtP.setValue(vecV);
                    }
                  } catch (eVec2) {
                    tgtP.setValue(parseNumber(vv, 0)); // не взялся массив — как раньше
                  }
                } else {
                  tgtP.setValue(parseNumber(vv, 0));
                }
              } catch (pvErr) {
                try {
                  if (!opts._fxMiss) opts._fxMiss = {};
                  opts._fxMiss[fxName + " — свойство " + kk] = true;
                } catch (pvErr2) {}
              }
            }
          }
        } catch (fxErr) {
          try {
            if (!opts._fxMiss) opts._fxMiss = {};
            opts._fxMiss[fxName] = true;
          } catch (fxErr2) {}
        }
      }
    }

    return layer;
  }

  /* -------------- плашка под текстом (стиль Premiere 24) --------------- */

  function addBadgeLayer(comp, textLayer, badge) {
    var shape = comp.layers.addShape();
    shape.name = truncateMid(textLayer.name, 56) + " [плашка]";

    var contents = shape.property("ADBE Root Vectors Group");
    var grp = null;
    var isRounded = false;
    try {
      grp = contents.addProperty("ADBE Vector Shape - Rounded Rect");
      isRounded = true;
    } catch (rErr) {
      grp = null;
    }
    if (grp === null) grp = contents.addProperty("ADBE Vector Shape - Rect");
    grp.name = "Box";

    var sizeProp, posProp;
    if (isRounded) {
      sizeProp = grp.property("ADBE Vector Rounded Rect Size");
      posProp = grp.property("ADBE Vector Rounded Rect Position");
      try { grp.property("ADBE Vector Rounded Rect Radius").setValue(badge.round); }
      catch (rr0) {
        try { grp.property("ADBE Vector Rounded Rect Roundness").setValue(badge.round); } catch (rr1) {}
      }
    } else {
      sizeProp = grp.property("ADBE Vector Rect Size");
      posProp = grp.property("ADBE Vector Rect Position");
    }

    try {
      var fill = contents.addProperty("ADBE Vector Graphic - Fill");
      fill.property("ADBE Vector Fill Color").setValue(badge.color);
      fill.property("ADBE Vector Fill Opacity").setValue(badge.opacity);
    } catch (fErr) {}

    var ln = textLayer.name.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");

    if (badge.isStatic) {
      /* ---- БЕЗОПАСНЫЙ РЕЖИМ: ни выражений, ни sourceRectAtTime
         (обе вещи роняют AE на некоторых сборках). Размер/позиция
         плашки оцениваются по параметрам текста при создании. ---- */
      var bw = comp.width * 0.7, bh = 90, bx = comp.width / 2, by = comp.height - 100;
      try {
        if (badge._geom) {
          bw = badge._geom.w + badge.padX * 2;
          bh = badge._geom.h + badge.padY * 2;
          bx = badge._geom.cx;
          by = badge._geom.cy;
        }
      } catch (gErr) {}
      try { sizeProp.setValue([Math.round(bw), Math.round(bh)]); } catch (szErr) {}
      try { posProp.setValue([0, 0]); } catch (ppErr) {}
      try {
        shape.transform.anchorPoint.setValue([0, 0]);
        shape.transform.position.setValue([Math.round(bx), Math.round(by)]);
      } catch (tpErr) {}
      try {
        var opTxt = textLayer.property("Opacity");
        var opShape = shape.property("Opacity");
        if (opTxt.numKeys > 0) {
          for (var k = 1; k <= opTxt.numKeys; k++) {
            opShape.setValueAtTime(opTxt.keyTime(k), opTxt.keyValue(k));
          }
        } else {
          opShape.setValue(100);
        }
      } catch (op2Err) {}
      // Плашка анимируется той же самой анимацией, что и текст
      try {
        var dAnim = badge.anim || "fade";
        var dDur = (badge.animDur > 0.02) ? badge.animDur : 0.15;
        var stT = shape.inPoint;
        if (dAnim === "pop" && dDur > 0) {
          shape.transform.scale.setValueAtTime(stT, [0, 0]);
          shape.transform.scale.setValueAtTime(stT + dDur * 0.7, [108, 108]);
          shape.transform.scale.setValueAtTime(stT + dDur, [100, 100]);
        } else if (dAnim === "slideup" && dDur > 0) {
          var riseB = Math.round(comp.height * 0.055);
          shape.transform.position.setValueAtTime(stT, [Math.round(bx), Math.round(by) + riseB]);
          shape.transform.position.setValueAtTime(stT + dDur, [Math.round(bx), Math.round(by)]);
        }
      } catch (bAnimErr) {}
    } else {
      /* ---- ЖИВОЙ РЕЖИМ: выражения (плашка следует за текстом) ---- */
      var refExp = 'tl = thisComp.layer("' + ln + '"); r = tl.text.sourceRectAtTime(time, true);';

      sizeProp.expression = refExp +
        " [r.width + " + (badge.padX * 2) + ", r.height + " + (badge.padY * 2) + "]";
      posProp.expression = refExp +
        " p = tl.toComp([r.left, r.top]); " + "[p[0] - " + badge.padX + ", p[1] - " + badge.padY + "]";

      try {
        shape.transform.anchorPoint.setValue([0, 0]);
        shape.transform.position.setValue([0, 0]);
      } catch (tErr) {}

      try {
        shape.property("Opacity").expression = 'thisComp.layer("' + ln + '").transform.opacity';
      } catch (oErr) {}
    }

    shape.inPoint = textLayer.inPoint;
    shape.outPoint = textLayer.outPoint;
    try { shape.moveBefore(textLayer); } catch (mErr) {}
    return shape;
  }

  /* -------------- фоновая полоса-подложка (v1.19) ------------------------
     Простая «плашка уровня CapCut»: тёмный скруглённый прямоугольник ЗА
     текстом — читаемость на светлом видео. shape-слой живёт ровно на
     длительность реплики. Никаких выражений и sourceRectAtTime (обе вещи
     роняют эту сборку AE): размер оценивается по параметрам текста,
     полоса ставится ребёнком текстового слоя — Pop/Слайд ведут её сами,
     а прозрачность получает СВОИ ключи на всю реплику (v1.19.1 — та же
     схема, что у текста: Затухание/Pop синхронны, полоса не гаснет на
     середине реплики в «по одному слову»). stackAfter — слой, ПОД которым
     положить полосу (в «по одному слову» это последнее слово реплики).
     Выкл. по умолчанию. ---- */

  function addBarLayer(comp, textLayer, txt, s, e, opts, idx, stackAfter, cueNo) {
    try {
      var linesArr = String(txt).split("\r");
      var maxChars = 0;
      for (var li = 0; li < linesArr.length; li++) {
        var lt = trimStr(linesArr[li]);
        if (lt.length > maxChars) maxChars = lt.length;
      }
      if (maxChars < 1) return null;
      var size = (opts.size > 4) ? opts.size : 96;

      // оценка габаритов (как в CapCut: комфортные «воздух» и радиус)
      var padX = size * 0.5;
      var padY = size * 0.24;
      var bw = Math.round(maxChars * size * 0.58 + padX * 2);
      var bh = Math.round(linesArr.length * size * 1.2 + padY * 2);
      var round = Math.round(size * 0.35);
      // центр визуального блока текста относительно его анкера (базовая
      // линия первой строки): строка растёт вниз со сдвигом ведущения 1.2h
      var cy = Math.round(size * ((linesArr.length - 1) * 0.6 - 0.25));

      var shape = comp.layers.addShape();
      try { shape.name = (opts.trackName || "SUB") + " " + pad3(idx) + " bg"; } catch (nErr) {}
      // v1.19.2: та же метка реплики, что у текстовых слоёв, — двойной клик
      // в редакторе выделит полосу вместе с текстом
      try { shape.comment = "AutoSub cue=" + (cueNo || 0) + " track=" + (opts.trackName || "SUB"); } catch (cmtB) {}

      var contents = shape.property("ADBE Root Vectors Group");
      var grp = null;
      try { grp = contents.addProperty("ADBE Vector Shape - Rounded Rect"); } catch (rErr) { grp = null; }
      if (grp === null) grp = contents.addProperty("ADBE Vector Shape - Rect");

      var isRounded = true;
      try {
        grp.property("ADBE Vector Rounded Rect Size").setValue([bw, bh]);
        grp.property("ADBE Vector Rounded Rect Position").setValue([0, 0]);
        try {
          grp.property("ADBE Vector Rounded Rect Radius").setValue(round);
        } catch (rr0) {
          try { grp.property("ADBE Vector Rounded Rect Roundness").setValue(round); } catch (rr1) {}
        }
      } catch (errRR) {
        isRounded = false;
      }
      if (!isRounded) {
        try { grp.property("ADBE Vector Rect Size").setValue([bw, bh]); } catch (szR) {}
        try { grp.property("ADBE Vector Rect Position").setValue([0, 0]); } catch (ppR) {}
      }

      try {
        var fill = contents.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue([0, 0, 0]);
        fill.property("ADBE Vector Fill Opacity").setValue(45);
      } catch (fErr) {}

      try { shape.transform.anchorPoint.setValue([0, 0]); } catch (aErr) {}
      shape.inPoint = (s > 0) ? s : 0;
      shape.outPoint = Math.max(e, shape.inPoint + 0.05);

      // ребёнок текстового слоя: двигается/масштабируется вместе с ним
      // (Pop, Слайд и «по одному слову» работают без дублирования анимации)
      try { shape.parent = textLayer; } catch (pErr1) {}
      try { shape.transform.position.setValue([0, cy]); } catch (pErr2) {}

      // прозрачность — СВОИ ключи на всю реплику [s..e] (v1.19.1).
      // Раньше копировались ключи текстового слоя — в «по одному слову»
      // первый слой гаснет после СВОЕГО конца, и полоса исчезала вместе
      // с ним на середине реплики. Теперь та же схема, что у текста
      // (Затухание/Pop синхронно), но на полный показ реплики.
      try {
        var opBar = shape.property("Opacity");
        var aBar = opts.anim || "fade";
        var dBar = (opts.fade > 0.02) ? opts.fade : 0.15;
        if (aBar === "none" || (e - s) <= dBar * 2.2) {
          opBar.setValue(100);
        } else {
          opBar.setValueAtTime(s, 0);
          if (aBar === "fade") {
            opBar.setValueAtTime(s + dBar, 100);
          } else {
            opBar.setValueAtTime(s + dBar * 0.6, 100);
          }
          opBar.setValueAtTime(e - dBar, 100);
          opBar.setValueAtTime(e, 0);
        }
      } catch (opErr) {}

      // в стек — сразу ПОД текстовый слой (полоса за текстом, не поверх);
      // в «по одному слову» — под САМЫЙ НИЖНИЙ слой реплики (stackAfter),
      // иначе полоса оказалась бы ПОВЕРХ слов 2..N (они ниже в стеке)
      try { shape.moveAfter(stackAfter || textLayer); } catch (mErr) {}
      return shape;
    } catch (barOuter) {
      return null;
    }
  }

  function importTrack(comp, cues, opts, offset, markersOn) {
    var created = 0;
    // ПОЛИРОВКА ТАЙМИНГА: конец предыдущей реплики (для ровных переходов)
    var prevEnd = 0;
    // v1.25: ДИАПАЗОН ПОКАЗА — субтитры не на весь ролик, а с…до.
    // Реплики вне диапазона пропускаются, задевшие границы — обрезаются.
    var rs = (opts.rangeStart !== undefined && opts.rangeStart >= 0) ? opts.rangeStart : -1;
    var re = (opts.rangeEnd !== undefined && opts.rangeEnd >= 0) ? opts.rangeEnd : -1;
    var rangeOn = (rs >= 0 && re > rs);
    for (var i = 0; i < cues.length; i++) {
      var fr = comp.frameRate || 30;
      var gapF = (opts.gapFrames === undefined || opts.gapFrames === null) ? 2 : Math.max(0, Math.round(opts.gapFrames));
      var gapT = gapF / fr;                                 // пауза N кадров (0 = монотонно)
      var minDur = (opts.minDur > 0.05) ? opts.minDur : 0.8; // мин. время на экране
      var s0 = cues[i].start + offset;   // исходный старт реплики (до правок)
      var e0 = cues[i].end + offset;     // исходный конец (до правок)
      // диапазон: целиком вне [rs..re] — пропустить; частично — обрезать
      if (rangeOn) {
        if (e0 <= rs || s0 >= re) continue;
        if (s0 < rs) s0 = rs;
        if (e0 > re) e0 = re;
      }
      var s = s0;
      var e = e0;
      // 1) реплика не стартует раньше, чем кончилась предыдущая (+пауза).
      //    ГАЛКА «ВПЛОТНУЮ»: каждая следующая реплика ставится ровно на конец
      //    предыдущей (+gapT кадров) — естественные паузы Whisper (тишина
      //    между фразами) убираются, поток идёт стык в стык. Первая реплика
      //    остаётся на своём естественном месте.
      if (opts.chain && i > 0) {
        s = prevEnd + gapT;
      } else if (s < prevEnd + gapT) {
        s = prevEnd + gapT;
      }
      // 2) минимальная длительность показа (иначе реплика мигает)
      if (e < s + minDur) e = s + minDur;
      // v1.25: полировка не выталкивает реплику за правую границу диапазона
      if (rangeOn && e > re) e = re;
      // 2а) v1.21: УМНЫЙ ТАЙМИНГ — длительность по числу слов.
      //    ~0,35 с на слово (комфортный темп чтения), потолок 6 с,
      //    пол — «Мин. показ, с». Реплика ТОЛЬКО растягивается и только
      //    в свободное место: до старта следующей реплики минус пауза
      //    (налезать нельзя — а если следующая стоит вплотную, растяжения
      //    просто не будет). Короткое «Да.» остаётся как сказал Whisper,
      //    длинная фраза дотягивается до читаемой длины.
      if (opts.smart) {
        var txtW = trimStr(String(cues[i].text)).replace(/\s+/g, " ");
        var wc = (txtW === "") ? 1 : txtW.split(" ").length;
        var need = Math.min(wc * 0.35, 6.0);
        if (need < minDur) need = minDur;
        var wantE = s + need;
        if (i < cues.length - 1) {
          var nextS = cues[i + 1].start + offset;
          if ((nextS - gapT) < wantE) wantE = Math.max(s + minDur, nextS - gapT);
        }
        // v1.25: растяжение тоже не выходит за правую границу диапазона
        if (rangeOn && wantE > re) wantE = re;
        if (wantE > e) e = wantE;
      }
      // 3) привязка к целым кадрам компа (никаких дробных моментов)
      s = Math.round(s * fr) / fr;
      e = Math.round(e * fr) / fr;
      if (s < 0) s = 0;
      if (s >= comp.duration) continue;
      if (e > comp.duration) e = comp.duration;
      if (e - s < 0.05) continue;

      var txt = wrapText(cues[i].text, opts.wrapChars);
      if (trimStr(txt.split("\r").join("")) === "") continue;

      // ФИШКА «КАРАОКЕ» (v1.18): слова подсвечиваются цветом по РЕАЛЬНЫМ
      // таймингам Whisper (cues[i].kw приложены в doImport). Реплика=2 слоя:
      // базовый с полным текстом + верхний «♪»-дубликат, у которого Source
      // Text шагает ключами по словам. Не совпало/не вышло → обычные слои.
      if (opts.karaoke && cues[i].kw && cues[i].kw.length > 1) {
        var kk = buildKaraokeLayers(comp, cues[i].kw, txt, s, e, opts, created + 1, s0, e0 - s0, i + 1);
        if (kk > 0) {
          created += kk;
          if (markersOn) {
            try {
              var mvK = new MarkerValue(truncateMid(txt.split("\r")[0], 60));
              comp.markerProperty.setValueAtTime(s, mvK);
            } catch (mKErr) {}
          }
          prevEnd = e;
          continue;
        }
        // kk === 0 — слова не совпали с текстом: дальше обычный путь
      }

      // ФИШКА «ПО ОДНОМУ СЛОВУ»: реплика делится на слова; каждое слово
      // живёт свою часть времени реплики (караоке-стиль CapCut).
      if (opts.words) {
        var rawW = trimStr(String(cues[i].text)).replace(/\s+/g, " ");
        var wordsArr = rawW.split(" ");
        var perW = (e - s) / wordsArr.length;
        var j;
        var idxCueW = created + 1;
        var firstW = null;
        var lastW = null;
        var longestW = "";
        for (j = 0; j < wordsArr.length; j++) {
          if (wordsArr[j] === "") continue;
          if (wordsArr[j].length > longestW.length) longestW = wordsArr[j];
          var wTxt = wrapText(wordsArr[j], opts.wrapChars);
          if (trimStr(wTxt) === "") continue;
          var wStart = s + j * perW;
          var wEnd = (j === wordsArr.length - 1) ? e : (wStart + perW);
          if (wEnd - wStart < 0.05) continue;
          var wLayer = makeSubLayer(comp, wTxt, wStart, wEnd, opts, created + 1, i + 1);
          if (firstW === null) firstW = wLayer;
          lastW = wLayer;
          created++;
          if (opts.badge && opts.badge.on) {
            try { addBadgeLayer(comp, wLayer, opts.badge); } catch (bwErr) {}
          }
        }
        // v1.19: фон-подложка — ОДНА полоса на всю реплику. Размер — по
        // самому длинному слову (слова рендерятся по одному в центре кадра:
        // полоса по ширине фразы оставляла пустые поля, а копирование ключей
        // первого слова гасило её на середине реплики). В стек — под САМОЕ
        // нижнее слово, чтобы полоса не рисовалась поверх слов 2..N.
        if (opts.bgBar && firstW !== null && longestW !== "") {
          try { addBarLayer(comp, firstW, longestW, s, e, opts, idxCueW, lastW, i + 1); } catch (barW2) {}
        }
        if (markersOn) {
          try {
            var mvW = new MarkerValue(truncateMid(rawW, 60));
            comp.markerProperty.setValueAtTime(s, mvW);
          } catch (mWErr) {}
        }
        prevEnd = e;
        continue;
      }

      var idxCue = created + 1;
      var layer = makeSubLayer(comp, txt, s, e, opts, idxCue, i + 1);
      created++;

      if (opts.badge && opts.badge.on) {
        try { addBadgeLayer(comp, layer, opts.badge); } catch (bErr) {}
      }

      // v1.19: фон-подложка за текстом (по длительности реплики)
      if (opts.bgBar) {
        try { addBarLayer(comp, layer, txt, s, e, opts, idxCue, null, i + 1); } catch (barN) {}
      }

      if (markersOn) {
        try {
          var mv = new MarkerValue(truncateMid(txt.split("\r")[0], 60));
          comp.markerProperty.setValueAtTime(s, mv);
        } catch (mErr) {}
      }
      prevEnd = e;
    }
    return created;
  }

  /* ----------------------- комп из видео файла ------------------------- */

  function importVideoAsComp(videoFile) {
    var io = new ImportOptions();
    io.file = videoFile;
    var footage = app.project.importFile(io);
    if (!footage || !(footage instanceof FootageItem)) {
      if (footage) { try { footage.remove(); } catch (e1) {} }
      throw new Error("AE не смог импортировать этот файл как видео.");
    }
    var fps = footage.frameRate;
    if (!fps || fps < 1 || isNaN(fps)) fps = 30;
    var dur = footage.duration;
    var comp = app.project.items.addComp(
      truncateMid(baseNameOf(videoFile), 28),
      footage.width, footage.height, 1, Math.round(fps * 100) / 100, dur
    );
    comp.layers.add(footage);
    try {
      var items = app.project.items;
      for (var i = 1; i <= items.length; i++) items[i].selected = false;
      comp.selected = true;
    } catch (e2) {}
    return comp;
  }

  /* ------------------------------ импорт ------------------------------- */

  function doImport(ctx) {
    if (!ctx.file || !ctx.file.exists) {
      alert("Сначала выберите файл субтитров (.srt или .vtt).", SCRIPT_NAME);
      return;
    }
    var file = ctx.file;

    try {
      var selEnc = (ctx.ddEnc.selection !== null) ? ctx.ddEnc.selection.text : "Авто";
      var enc = (selEnc === "Авто") ? detectEncoding(file.fsName) : selEnc;
      var cues1 = parseSubtitles(readText(file, enc));
      if (ctx.chkClean.value) cleanCues(cues1);

      if (cues1.length === 0) {
        alert("В файле не найдено ни одного субтитра.\n\rПроверьте, что это корректный файл SRT или VTT.", SCRIPT_NAME);
        return;
      }

      var offset = parseNumber(ctx.edOffset.text, 0);

      // Плашки (стиль Premiere Pro 24) удалены из панели v1.8.0 — пользователь
      // их не использует; механизм оставлен в коде в выключенном состоянии.
      var badge = {
        on: false,
        isStatic: true,
        color: [0, 0, 0],
        opacity: 60,
        round: 10,
        padX: 20,
        padY: 10
      };

      // Единая анимация на ВСЕ слои (RU + EN) — выбор из панели
      var animIdx = (ctx.ddAnim && ctx.ddAnim.selection) ? ctx.ddAnim.selection.index : 0;
      var animName = (animIdx === 1) ? "pop" : (animIdx === 2) ? "slideup" : (animIdx === 3) ? "none" : "fade";

      var opts1 = {
        trackName: "RU",
        font: trimStr(ctx.edFont.text) || "Arial",
        size: parseNumber(ctx.edSize.text, 96),
        bottom: parseNumber(ctx.edBottom.text, 60),
        fade: parseNumber(ctx.edFade.text, 0.15),
        anim: animName,
        words: ctx.chkWords.value,
        karaoke: ctx.chkKaraoke ? ctx.chkKaraoke.value : false,
        kColor: [1, 0.88, 0.15],
        bgBar: ctx.chkBgBar ? ctx.chkBgBar.value : false,
        chain: ctx.chkChain.value,
        fx: parseFxSpec(ctx.edEffects.text),
        minDur: parseNumber(ctx.edMinDur.text, 0.8),
        smart: ctx.chkSmart ? ctx.chkSmart.value : false, // v1.21: умный тайминг
        outDown: ctx.chkOutDown ? ctx.chkOutDown.value : false, // v1.23: исчезание вниз
        // v1.25: диапазон показа (пусто = весь ролик; «с» больше «до» — меняем местами)
        rangeStart: parseTimeFlex(ctx.edRangeFrom ? ctx.edRangeFrom.text : ""),
        rangeEnd: parseTimeFlex(ctx.edRangeTo ? ctx.edRangeTo.text : ""),
        gapFrames: Math.max(0, Math.round(parseNumber(ctx.edGap.text, 2))),
        wrapChars: ctx.chkWrap.value ? parseNumber(ctx.edWrap.text, 42) : 0,
        fill: ctx.fillCol,
        strokeOn: ctx.chkStroke.value,
        strokeColor: ctx.strokeCol,
        strokeWidth: parseNumber(ctx.edStrokeW.text, 4),
        badge: badge
      };
      badge.anim = animName;
      badge.animDur = opts1.fade;
      // v1.25: если «с» больше «до» — меняем местами автоматически
      if (opts1.rangeStart >= 0 && opts1.rangeEnd >= 0 && opts1.rangeStart > opts1.rangeEnd) {
        var tmpR = opts1.rangeStart;
        opts1.rangeStart = opts1.rangeEnd;
        opts1.rangeEnd = tmpR;
      }

      // ---------- вторая дорожка (например EN) ----------
      var track2 = null;
      var notes = [];
      if (ctx.chkDual.value) {
        var f2 = ctx.file2;
        if (!f2 || !f2.exists) {
          notes.push("Нет файла 2 — импортирована только первая дорожка.");
        } else if (ctx.file && f2.fsName === ctx.file.fsName) {
          notes.push("Файл 2 совпадает с первым — вторая дорожка пропущена.");
        } else {
          try {
            var enc2 = (selEnc === "Авто") ? detectEncoding(f2.fsName) : selEnc;
            var cues2 = parseSubtitles(readText(f2, enc2));
            if (ctx.chkClean.value) cleanCues(cues2);
            if (cues2.length === 0) {
              notes.push("Файл 2 пуст или не распознан — вторая дорожка пропущена.");
            } else {
              track2 = {
                cues: cues2,
                offset: parseNumber(ctx.edOffset2.text, 0),
                opts: {
                  trackName: "EN",
                  font: trimStr(ctx.edFont.text) || "Arial",
                  size: parseNumber(ctx.edSize2.text, 66),
                  bottom: parseNumber(ctx.edBottom2.text, 205),
                  fade: opts1.fade,
                  anim: animName,
                  words: opts1.words,
                  karaoke: false,
                  kColor: opts1.kColor,
                  bgBar: opts1.bgBar,
                  chain: opts1.chain,
                  fx: opts1.fx,
                  minDur: opts1.minDur,
                  smart: opts1.smart, // v1.21: умный тайминг и для дорожки 2
                  outDown: opts1.outDown, // v1.23: исчезание вниз и для дорожки 2
                  rangeStart: opts1.rangeStart, // v1.25: диапазон и для дорожки 2
                  rangeEnd: opts1.rangeEnd,
                  gapFrames: opts1.gapFrames,
                  wrapChars: opts1.wrapChars,
                  fill: ctx.fill2Col,
                  strokeOn: false,
                  strokeColor: ctx.strokeCol,
                  strokeWidth: 0,
                  badge: badge
                }
              };
            }
          } catch (err2) {
            notes.push("Файл 2 не прочитался: " + err2.toString());
          }
        }
      }

      // ---------- максимальная длительность ----------
      var maxEnd = 0;
      var i, e;
      for (i = 0; i < cues1.length; i++) {
        e = cues1[i].end + offset;
        if (e > maxEnd) maxEnd = e;
      }
      if (track2 !== null) {
        for (i = 0; i < track2.cues.length; i++) {
          e = track2.cues[i].end + track2.offset;
          if (e > maxEnd) maxEnd = e;
        }
      }

      // ---------- куда кладём ----------
      var comp = null;
      var createdNew = false;
      if (ctx.ddDest.selection && ctx.ddDest.selection.index === 0) {
        comp = getActiveComp();
        if (comp === null && ctx.lastComp && ctx.lastComp instanceof CompItem) comp = ctx.lastComp;
      }

      if (comp === null) {
        var w = Math.max(16, Math.round(parseNumber(ctx.edW.text, 1920)));
        var h = Math.max(16, Math.round(parseNumber(ctx.edH.text, 1080)));
        var fps = Math.max(1, parseNumber(ctx.edFps.text, 30));
        var baseName = file.name.replace(/\.[^.]*$/, "").replace(/[_]+/g, " ");
        if (baseName === "") baseName = "Субтитры";
        comp = app.project.items.addComp("Субтитры — " + baseName, w, h, 1, fps, Math.max(5, maxEnd + 1));
        createdNew = true;
      }

      if (ctx.chkExtend.value && maxEnd > comp.duration) {
        comp.duration = Math.ceil(maxEnd) + 1;
      }

      // Фишка из тутора: подгон всех размеров под конкретную композицию
      // (референс дизайна 1080p). Плашка масштабируется ровно один раз.
      if (ctx.chkFit.value) {
        fitBadgeToComp(badge, comp);
        fitOptsToComp(opts1, comp);
        if (track2 !== null) fitOptsToComp(track2.opts, comp);
      }

      // v1.15: чистка запинков Whisper (повторов слов) — до построения слоёв
      // и статистики, обе дорожки
      if (ctx.chkStutter.value) {
        try { cues1 = cleanStutters(cues1); } catch (stc1) {}
        try { if (track2 !== null) track2.cues = cleanStutters(track2.cues); } catch (stc2) {}
      }
      // v1.23: схлопывание подряд идущих одинаковых реплик, обе дорожки
      if (ctx.chkDedup && ctx.chkDedup.value) {
        try { cues1 = dedupeCues(cues1); } catch (stc3) {}
        try { if (track2 !== null) track2.cues = dedupeCues(track2.cues); } catch (stc4) {}
      }

      // v1.18: караоке — тайминги слов из Whisper (файл <имя>.<lang>.kar.json
      // рядом с SRT). Слова прикладываются к репликам первой дорожки; на
      // импорте каждое слово сверяется с текстом реплики не совпало —
      // реплика строится обычным слоем.
      if (ctx.chkKaraoke && ctx.chkKaraoke.value && ctx.file && ctx.file.exists &&
          /\.srt$/i.test(ctx.file.fsName)) {
        try {
          var karF = new File(ctx.file.fsName.replace(/\.srt$/i, ".kar.json"));
          if (karF.exists) {
            var karData = eval("(" + readText(karF, "UTF-8") + ")");
            var karOk = 0;
            if (karData && karData.length) {
              for (var kI2 = 0; kI2 < cues1.length && kI2 < karData.length; kI2++) {
                var kR = karData[kI2];
                if (kR && kR.w && kR.w.length > 1) { cues1[kI2].kw = kR.w; karOk++; }
              }
            }
            if (karOk > 0) {
              notes.push("Караоке: подсветка включится у " + karOk + " реплик (слои «♪», цвет жёлтый).");
            } else {
              notes.push("Караоке: слова из kar-файла не совпали с текстом — реплики обычные. Запусти «Whisper → SRT» заново с галочкой «Караоке».");
            }
          } else {
            notes.push("Караоке: kar-файла нет рядом с SRT — Whisper запускался без галочки «Караоке».");
          }
        } catch (kErr) {
          notes.push("Караоке: kar-файл не прочитался (" + kErr + ") — реплики обычные.");
        }
      }

      var created1 = 0;
      var created2 = 0;
      app.beginUndoGroup("Auto Subtitles: импорт");
      try {
        // v1.15: старые слои субтитров панели стираются — пересоздание без дублей
        // (v1.18: и карaoke-дубли «♪»; v1.19: и фон-полосы «bg»)
        if (ctx.chkReplace.value && !createdNew) {
          for (var ir = comp.layers.length; ir >= 1; ir--) {
            var lr = comp.layer(ir);
            if (/^(RU|EN) \d{3}(:| ♪| bg)/.test(lr.name)) {
              try { lr.remove(); } catch (rL1) {}
            }
          }
        }
        created1 = importTrack(comp, cues1, opts1, offset, ctx.chkMarkers.value);
        if (track2 !== null) {
          created2 = importTrack(comp, track2.cues, track2.opts, track2.offset, false);
        }
      } finally {
        app.endUndoGroup();
      }

      savePref("lastFolder", file.parent.fsName);

      // Отчёт о неустановленных эффектах (Deep Glow / Sapphire / ...)
      var fxMiss = {};
      try { if (opts1._fxMiss) fxMiss = opts1._fxMiss; } catch (eF1) {}
      try {
        if (track2 !== null && track2.opts._fxMiss) {
          for (var mf1 in track2.opts._fxMiss) fxMiss[mf1] = true;
        }
      } catch (eF2) {}

      // Статистика субтитров (слова/символы/средний показ/читаемость)
      var stWords = 0, stChars = 0, stDurSec = 0, stCueN = 0;
      function accStats(cuesS) {
        for (var sc = 0; sc < cuesS.length; sc++) {
          var tS = trimStr(String(cuesS[sc].text)).replace(/\s+/g, " ");
          if (tS === "") continue;
          stWords += tS.split(" ").length;
          stChars += tS.replace(/ /g, "").length;
          var dS = cuesS[sc].end - cuesS[sc].start;
          if (dS > 0.05) { stDurSec += dS; stCueN++; }
        }
      }
      try { accStats(cues1); } catch (eSt1) {}
      try { if (track2 !== null) accStats(track2.cues); } catch (eSt2) {}

      var msg = "Готово!\n\r" +
        "Основная дорожка: " + created1 + " слоёв (из " + cues1.length + ").\n\r";
      if (track2 !== null) {
        msg += "Вторая дорожка: " + created2 + " слоёв (из " + track2.cues.length + ").\n\r";
      }
      msg += (createdNew ? "Создана композиция: «" + comp.name + "»." : "Композиция: «" + comp.name + "».");
      if (stCueN > 0) {
        var cpsS = (stDurSec > 0) ? (stChars / stDurSec) : 0;
        msg += "\n\rСтатистика: слов " + stWords + ", символов " + stChars +
               ", сред. показ " + (Math.round(stDurSec / stCueN * 10) / 10) + " с/реплика.";
        if (cpsS > 20) {
          msg += "\n\r⚠ Читается быстро (~" + Math.round(cpsS) + " симв/с) — увеличь «Мин. показ, с».";
        }
      }
      var missNames = [];
      for (var mf2 in fxMiss) missNames.push(mf2);
      if (missNames.length > 0) {
        msg += "\n\r\n\r⚠ Эти эффекты НЕ добавлены (не установлены в AE?):\n\r" + missNames.join(", ") +
               "\n\rСохрани субтитры без них или поставь плагин и пересоздай.";
      }
      if (notes.length > 0) msg += "\n\r\n\r" + notes.join("\n\r");
      alert(msg, SCRIPT_NAME);
      try { if (ctx.guide) ctx.guide(); } catch (gImpErr) {}

    } catch (err) {
      try { app.endUndoGroup(); } catch (e2) {}
      alert("Ошибка импорта:\n" + err.toString() + (err.line ? "\n(строка " + err.line + ")" : ""), SCRIPT_NAME);
      try { if (ctx.guide) ctx.guide(); } catch (gImpErr2) {}
    }
  }

  /* --------------------- запуск внешних процессов ---------------------- */

  function getPanelFolder() {
    try { return new File($.fileName).parent.fsName; } catch (e) { return ""; }
  }

  function buildPSLineDirect(wrapper, videoFs, lang, model, second, statusPath, dlThreads, promptFile, karaokeOn, glossaryFile, batchIdx, batchTotal, fastWhisper, cutGarbage, notifyDone) {
    var nT = (dlThreads > 1) ? ((dlThreads > 16) ? 16 : dlThreads) : 1;
    return 'powershell -NoProfile -ExecutionPolicy Bypass -File "' + wrapper +
      '" -Video "' + videoFs + '" -Lang ' + lang + ' -Model ' + model +
      (statusPath ? ' -StatusFile "' + statusPath + '"' : '') +
      (second !== "" ? ' -SecondLang ' + second : '') +
      ' -DlThreads ' + nT +
      // v1.18: словарь передаётся ФАЙЛОМ (кириллица не портится в командной
      // строке), караоке — ключом -Karaoke
      (promptFile && promptFile !== "" ? ' -PromptFile "' + promptFile + '"' : '') +
      (karaokeOn ? ' -Karaoke' : '') +
      // v1.22: глоссарий перевода (файл «термин=замена») и пакетный номер
      (glossaryFile && glossaryFile !== "" ? ' -GlossaryFile "' + glossaryFile + '"' : '') +
      (batchIdx && batchIdx > 0 ? ' -BatchIndex ' + batchIdx + ' -BatchTotal ' + batchTotal : '') +
      // v1.23: движок faster-whisper, фильтр мусора, уведомление о готовности
      (fastWhisper ? ' -FastWhisper' : '') +
      (cutGarbage ? ' -CutGarbage' : '') +
      (notifyDone ? ' -NotifyDone' : '') +
      ' -NoWait';
  }

  function launchWhisper(wrapper, videoFs, lang, model, second, statusPath, dlThreads, promptFile, karaokeOn, glossaryFile, batchIdx, batchTotal, fastWhisper, cutGarbage, notifyDone) {
    // ПОЧЕМУ ЧЕРЕЗ .bat + File.execute (v1.6.0):
    // 1) system.callSystem ждёт ЗАКРЫТИЯ наследованного pipe-канала: потомок,
    //    запущенный через cmd start, наследует хэндл AE и держит AE «Не
    //    отвечает» до конца работы консоли (в v1.5.9 AE висел весь job).
    // 2) File.execute идёт через ShellExecute — НЕ наследует ни один pipe AE,
    //    и не ждёт завершения: AE остаётся живым на всё время Whisper.
    // 3) Сам .bat мгновенный (startpowershell и сразу exit), поэтому даже если
    //    лончер подождать — это доля секунды. Окно Whisper остаётся отдельным.
    var direct = buildPSLineDirect(wrapper, videoFs, lang, model, second, statusPath, dlThreads, promptFile, karaokeOn, glossaryFile, batchIdx, batchTotal, fastWhisper, cutGarbage, notifyDone);
    var batBody =
      '@echo off\r\n' +
      'title AUTO SUBTITLES - WHISPER\r\n' +
      'start "AUTO SUBTITLES - WHISPER" /NORMAL ' + direct + '\r\n' +
      'exit\r\n';
    var batPath = Folder.temp.fsName + "\\AutoSubWhisper_launch.bat";
    var batFile = new File(batPath);
    batFile.encoding = "UTF-8";
    try {
      if (!batFile.open("w")) throw new Error("нет доступа: " + batPath);
      batFile.write(batBody);
      batFile.close();
    } catch (eBat) {
      throw new Error("Не удалось подготовить лончер.\n\r" + eBat.toString());
    }
    var started = false;
    try { started = batFile.execute(); } catch (eEx) { started = false; }
    if (!started) {
      throw new Error("AE не смог запустить лончер.\n\r" +
        "Запустите вручную двойным кликом:\n\r" + batPath);
    }
  }

  function writeFallbackBat(directLine) {
    try {
      var dir = getPanelFolder();
      if (dir === "") return "";
      var batFile = new File(dir + "\\transcribe-START.bat");
      batFile.encoding = "UTF-8";
      if (!batFile.open("w")) return "";
      batFile.write("@echo off\r\nchcp 65001 >nul\r\n" + directLine + "\r\npause\r\n");
      batFile.close();
      return batFile.fsName;
    } catch (eBat) {
      return "";
    }
  }

  /* --------------- прогресс Whisper в панели (polling) ----------------- */

  function parseStatus(data) {
    var st = { pct: -1, msg: "", done: false, err: false, elapsed: -1, stage: "", remain: -1, total: 0, model: "", pid: -1, log: "", dev: "", segNow: 0, segAll: 0, batch: "" };
    if (!data) return st;
    var lines = data.split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
      var line = trimStr(lines[i]);
      if (line.length < 3) continue;
      if (line.substring(0, 4) === "pct=") {
        st.pct = parseInt(line.substring(4), 10);
        if (isNaN(st.pct)) st.pct = -1;
      } else if (line.substring(0, 4) === "msg=") {
        st.msg = line.substring(4);
      } else if (line.substring(0, 5) === "done=") {
        st.done = true;
      } else if (line.substring(0, 4) === "err=") {
        st.err = true;
      } else if (line.substring(0, 8) === "elapsed=") {
        st.elapsed = parseInt(line.substring(8), 10);
        if (isNaN(st.elapsed)) st.elapsed = -1;
      } else if (line.substring(0, 6) === "stage=") {
        st.stage = line.substring(6);
      } else if (line.substring(0, 7) === "remain=") {
        st.remain = parseInt(line.substring(7), 10);
        if (isNaN(st.remain)) st.remain = -1;
      } else if (line.substring(0, 6) === "total=") {
        st.total = parseFloat(line.substring(6));
        if (isNaN(st.total)) st.total = 0;
      } else if (line.substring(0, 6) === "model=") {
        st.model = line.substring(6);
      } else if (line.substring(0, 4) === "dev=") {
        // v1.19.6: устройство Whisper (cpu/cuda) из обёртки ps1
        st.dev = trimStr(line.substring(4));
      } else if (line.substring(0, 4) === "seg=") {
        // v1.19.6: «51/124» из бара tqdm Whisper
        var mSg = line.substring(4).match(/^(\d+)\/(\d+)$/);
        if (mSg) {
          st.segNow = parseInt(mSg[1], 10);
          st.segAll = parseInt(mSg[2], 10);
          if (isNaN(st.segNow) || isNaN(st.segAll)) { st.segNow = 0; st.segAll = 0; }
        }
      } else if (line.substring(0, 4) === "pid=") {
        st.pid = parseInt(line.substring(4), 10);
        if (isNaN(st.pid)) st.pid = -1;
      } else if (line.substring(0, 4) === "log=") {
        st.log = line.substring(4);
      } else if (line.substring(0, 6) === "batch=") {
        st.batch = line.substring(6);
      }
    }
    return st;
  }

  function fmtRemain(sec) {
    if (sec >= 5400) return Math.round(sec / 36000) / 10 + " ч";
    if (sec >= 90) return Math.round(sec / 60) + " мин";
    return sec + " с";
  }

  function startWhisperPolling(statusPath, pbar, statusTxt, logTxt, win, guideFn) {
    // Сначала гасим прежний тикер (БЕЗОПАСНО: отменяем снаружи, из UI-события,
    // а не изнутри выполняющейся задачи — cancelTask изнутри задачи роняет AE).
    try {
      if ($.global.AutoSubWhisperPollId && typeof app.cancelTask === "function") {
        app.cancelTask($.global.AutoSubWhisperPollId);
      }
    } catch (cPrev) {}

    var stGlobal = {
      statusPath: statusPath,
      pbar: pbar,
      statusTxt: statusTxt,
      logTxt: logTxt,
      win: win,
      guideFn: guideFn,
      lastPct: -1,
      factor: 0,
      tick: 0,
      pid: -1,
      finished: false,
      startedAt: (new Date()).getTime()
    };

    $.global.AutoSubState = stGlobal;

    // ПРАВИЛА СТАБИЛЬНОСТИ тикера (причина крашей 0::42 в v1.5.2):
    // 1. НИКОГДА не вызывать app.cancelTask изнутри выполняющейся задачи.
    // 2. НИКАКИХ win.update() / смен шрифтов и цветов из фонового тика —
    //    только обновление .text/.value (AE перерисовывает сам).
    // 3. Окончив работу, тик просто выставляет флаг finished и дальше
    //    молча выходит; задача отменится снаружи при следующем запуске.
    $.global.AutoSubWhisperPollTick = function () {
      var st = $.global.AutoSubState;
      if (!st || st.finished) return;
      try {
        if (!st.pbar || !st.statusTxt || !st.logTxt || !st.win) { st.finished = true; return; }

        var data = "";
        try {
          var f = new File(st.statusPath);
          f.encoding = "UTF-8";
          if (f.open("r")) {
            data = f.read();
            f.close();
          }
        } catch (rErr) {}

        var s = parseStatus(data);
        if (s.model && MODEL_FACTOR[s.model]) st.factor = MODEL_FACTOR[s.model];
        if (s.pid > 0) st.pid = s.pid;

        var finMsg = null;
        if (s.stage === "STOP") finMsg = "Остановлено кнопкой Стоп";
        else if (s.err) finMsg = "ОШИБКА: " + s.msg;
        else if (s.done) finMsg = "ГОТОВО — нажмите «Загрузить SRT»";

        if (finMsg !== null) {
          // финал: только текст и полоса, БЕЗ перекраски и отмены изнутри
          st.finished = true;
          try { st.pbar.value = s.err ? 0 : 100; } catch (pFinErr) {}
          try { st.statusTxt.text = truncateMid(finMsg, 64); } catch (tFinErr) {}
          try { st.logTxt.text = ""; } catch (lFinErr) {}
          try { if (st.guideFn) st.guideFn(); } catch (gFinErr) {}
          return;
        }

        // --- реальный процент от Whisper ---
        if (s.pct >= 0) {
          try { st.pbar.value = s.pct; } catch (pErr) {}
          if (s.pct > st.lastPct) st.lastPct = s.pct;
        } else {
          // пока Whisper молчит (% ещё нет) — полоса «дышит»
          st.tick++;
          try { st.pbar.value = (st.tick % 12) * 8; } catch (sweepErr) {}
        }

        // --- расчёт оставшегося времени ---
        var remain = -1;
        if (s.remain > 0) {
          remain = s.remain;                       // точная ETA от tqdm Whisper
        } else if (s.pct > 0 && s.elapsed > 0) {
          remain = Math.max(1, Math.round(s.elapsed * (100 - s.pct) / s.pct));
        } else if (s.total > 0 && st.factor > 0 && s.elapsed >= 0) {
          var est = Math.round(s.total * st.factor) - s.elapsed;
          if (est > 0) remain = est;               // оценка по модели
        }

        // --- текст статуса ---
        var text = s.msg;
        if (text === "") {
          if (s.stage === "START") text = "Whisper запускается...";
          else if (s.stage === "LOAD") text = "Качаю модель Whisper...";
          else if (s.stage === "DL") text = "Скачиваю модель (мультипоток, докачка)...";
          else if (s.stage === "RUN") text = st.lastPct >= 0 ? ("Whisper: " + st.lastPct + "%") : "Whisper работает...";
          else if (s.stage === "COPY") text = "Копирую SRT к видео...";
          else if (s.stage === "TRANSLATE") text = "Перевод второй дорожки...";
          else if (s.stage === "CHECK") text = "Проверка whisper/ffmpeg...";
          else text = st.lastPct >= 0 ? ("Whisper: " + st.lastPct + "%") : "Whisper работает...";
        }

        // СТОРОЖ: если за 45 с статус так и не ушёл со START — цепочка запуска
        // не дошла до обёртки (так было на старой связке из AE). Вместо вечного
        // «запускается...» прямо говорим пользователю, что что-то не так.
        if (s.stage === "START" && !s.done && !s.err) {
          var startSec = Math.floor(((new Date()).getTime() - st.startedAt) / 1000);
          if (startSec > 45) {
            text = "⚠ Whisper не запустился (окна не видно?) — «Стоп» и напишите разработчику";
          }
        }

        var elapsed = s.elapsed;
        if (elapsed < 0) elapsed = Math.floor(((new Date()).getTime() - st.startedAt) / 1000);

        if (elapsed >= 0) text += "  (" + fmtElapsed(elapsed) + ")";
        if (remain > 0) {
          var dEnd = new Date();
          dEnd.setSeconds(dEnd.getSeconds() + remain);
          var mmEnd = dEnd.getMinutes();
          text += "  |  осталось ≈ " + fmtRemain(remain) +
                  " · к " + dEnd.getHours() + ":" + (mmEnd < 10 ? "0" : "") + mmEnd;
        }

        // v1.22: в пакетном режиме статус помечается «[номер/всего]»
        if (s.batch && s.batch !== "") text = "[" + s.batch + "] " + text;
        try { st.statusTxt.text = truncateMid(text, 64); } catch (tErr) {}

        // зеркало лога Whisper (что именно сейчас грузится/распознаётся).
        // v1.19.6: в режиме распознавания строка статуса Whisper —
        // «whisper small · CUDA · 51/124 сегм.» (модель, устройство,
        // сегменты tqdm); вне RUN — как раньше, последнее слово лога
        try {
          if (s.model !== "" && st.lastPct >= 0) {
            var bsTxt = "whisper " + s.model;
            if (s.dev !== "") bsTxt += " · " + (s.dev.toLowerCase() === "cpu" ? "CPU" : s.dev.toUpperCase());
            if (s.segAll > 0 && s.segNow > 0) bsTxt += " · " + s.segNow + "/" + s.segAll + " сегм.";
            st.logTxt.text = bsTxt;
          } else {
            st.logTxt.text = (s.log && s.log !== "") ? truncateMid(s.log, 58) : "";
          }
        } catch (lErr2) {}

        // live-строка под шапкой («что делать дальше»)
        try { if (st.guideFn) st.guideFn(); } catch (gTickErr) {}
      } catch (pollErr) {
        // любая ошибка — тихо гасим тик, НЕ отменяя задачу изнутри
        try { st.finished = true; } catch (feErr) {}
      }
    };

    if (typeof app.scheduleTask === "function") {
      try {
        var id = app.scheduleTask("AutoSubWhisperPollTick();", 1000, true);
        $.global.AutoSubWhisperPollId = id;
      } catch (sErr) {}
    }
  }

  /* ------------------------------- UI ---------------------------------- */

  function buildUI(thisObj) {
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Auto Subtitles " + VERSION_STR, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 7;
    win.margins = 10;
    paintPanel(win, STYLE.bg);

    /* --- шапка (v1.19.6, как в макете): строка-плашка «Auto Subtitles.jsx —
       After Effects ‹версия›», крупный заголовок, live-подсказка на плашке --- */
    var aeName2 = "After Effects";
    try {
      var mv2 = String(app.version);
      var mp2 = mv2.match(/^(\d+)\./);
      if (mp2) {
        var mj2 = parseInt(mp2[1], 10);
        var yr2 = { 22: "2022", 23: "2023", 24: "2024", 25: "2025" };
        aeName2 = "After Effects " + (yr2[mj2] || ("v" + mj2));
      }
    } catch (eAV1) {}
    var gBar = win.add("group");
    gBar.alignment = ["fill", "top"];
    gBar.margins = [8, 4, 8, 4];
    paintPanel(gBar, STYLE.plate);
    var stBar1 = gBar.add("statictext", undefined, "Auto Subtitles.jsx");
    stBar1.characters = 18;
    paintLabel(stBar1, STYLE.gray);
    var stBar2 = gBar.add("statictext", undefined, "");
    stBar2.alignment = ["fill", "center"];
    var stBar3 = gBar.add("statictext", undefined, aeName2);
    paintLabel(stBar3, STYLE.gray);

    var gHead = win.add("group");
    gHead.alignChildren = ["left", "center"];
    var stTitle = gHead.add("statictext", undefined, "AUTO SUBTITLES");
    var stVer = gHead.add("statictext", undefined, VERSION_STR);
    makeBold(stTitle, 16);
    paintLabel(stTitle, STYLE.label);
    paintLabel(stVer, [0.55, 0.75, 1]);
    try {
      stTitle.helpTip = "Чтобы ПРИКРЕПИТЬ панель справа (как остальные панели AE):\n" +
        "1) Закрой плавающее окно панели.\n" +
        "2) Открой через меню «Окно (Window)» — пункт Auto Subtitles.jsx в самом низу списка.\n" +
        "3) Потяни за ярлык панели (её «шапку») к правому краю посадочной зоны AE —\n" +
        "появится подсветка места докинга — и отпусти: панель станет вкладкой\n" +
        "в одной группе с другими панелями (как Flow на скрине).";
    } catch (eHT1) {}

    /* --- v1.19.11: строка-подсказка «Шаг 1/2/3» УБРАНА (по просьбе) ------
       Плашка под шапкой удалена: последовательность «видео → Whisper →
       SRT → Создать субтитры» и так видна по кнопкам, а прогресс Whisper
       дублировался в его собственной строке («Whisper: N%» + бар рядом
       с кнопкой «Стоп»). updateGuide оставлен ПУСТЫМ — все места вызовов
       (импорт, загрузка SRT, тик Whisper, ctx.guide) работают без правок.
       ----------------------------------------------------------------- */
    function updateGuide() {}

    /* --- кнопка «Создать субтитры» всегда НАВЕРХУ панели: видна на
       любой вкладке и в узком доке, никакой прокрутки не нужно --- */
    var gFoot = win.add("group");
    gFoot.alignChildren = ["fill", "center"];
    gFoot.alignment = ["fill", "top"];
    // v1.20.0: кнопки-надписи — красятся даже на сборках, где нативные
    // Button игнорируют ScriptUI-кисти (репаки). «?» больше не растягивается.
    // v1.20.5: полный откат UI-экспериментов — кнопки нативные, как в v1.19.11
    var btnGo = gFoot.add("button", undefined, "Создать субтитры");
    btnGo.preferredSize.height = 36;
    btnGo.alignment = ["fill", "center"];
    paintButton(btnGo, STYLE.green);
    makeBold(btnGo, 12);
    var btnHelp = gFoot.add("button", undefined, "?");
    btnHelp.preferredSize.height = 34;
    btnHelp.preferredSize.width = 30;
    paintGhost(btnHelp);

    // v1.24: превью-рендер 5 секунд — быстро посмотреть стиль на видео
    var gFoot2 = win.add("group");
    gFoot2.alignChildren = ["fill", "center"];
    gFoot2.alignment = ["fill", "top"];
    var btnPreview = gFoot2.add("button", undefined, "Превью-рендер 5 сек (с позиции таймлайна)");
    btnPreview.alignment = ["fill", "center"];
    paintGhost(btnPreview);
    btnPreview.helpTip = "Рендерит 5 секунд активного компа, НАЧИНАЯ с позиции таймлайна (встань на интересный момент) — файл рядом с видео (H.264, а если модуля нет — AVI).\n\rAE на время рендера подвисает — это нормально.\n\rСначала «Создать субтитры», потом превью.";

    /* --- ВКЛАДКИ: v1.19.6 — ВЕРНУЛИСЬ к надёжному tabbedpanel.
       Эксперимент с ручными кнопками-пилюлями и переключением
       visible групп ломает лейаут в дока-панели (контент вкладок
       перестаёт показываться) — на крякнутой сборке 24.6 проверено.
       tabbedpanel переключает секции нативно и стабильно. --- */
    var tabRoot = win.add("tabbedpanel");
    tabRoot.alignChildren = ["fill", "fill"];
    tabRoot.alignment = ["fill", "fill"];
    try { paintPanel(tabRoot, STYLE.bg); } catch (eTP0) {}

    /* --- v1.20.4: вкладки как в v1.19.11 — БЕЗ прокрутки -------------
       Эксперимент с прокруткой (ползунок, затем ▲/▼) на сборке
       пользователя ломал раскладку: строки поджимались, подписи
       обрезались («Пауза, кад…», «Уда…»). Откачено по просьбе —
       простой tabbedpanel; содержимое вкладок видно прокруткой
       самого док-окна AE (колёсико/скроллбар док-панели). ---- */
    function makeCard(titleText) {
      var tab = tabRoot.add("tab", undefined, titleText);
      tab.orientation = "column";
      tab.alignChildren = ["fill", "top"];
      tab.margins = [10, 8, 10, 8];
      tab.spacing = 5;
      try { paintPanel(tab, STYLE.bg); } catch (eTP1) {}
      return tab;
    }

    /* --- 1. видео / whisper --- */
    var panVideo = makeCard("ВИДЕО");

    var gV0 = panVideo.add("group");
    gV0.alignChildren = ["left", "center"];
    var btnVideo = gV0.add("button", undefined, "Выбрать видео...");
    btnVideo.preferredSize.width = 118;
    var stVideo = gV0.add("statictext", undefined, "файл не выбран");
    stVideo.characters = 34;
    paintLabel(stVideo, STYLE.dim);

    var gV1 = panVideo.add("group");
    gV1.add("statictext", undefined, "Яз.:");
    var ddSrcLang = gV1.add("dropdownlist", undefined, ["Русский", "Английский"]);
    ddSrcLang.selection = 0;
    gV1.add("statictext", undefined, "Модель:");
    var ddModel = gV1.add("dropdownlist", undefined, ["tiny", "base", "small", "medium", "large", "turbo"]);
    ddModel.selection = 2; // small
    ddModel.helpTip = "tiny ≈0.15× · base ≈0.35× · small ≈0.8× · medium ≈2.5× · large ≈4.5× (макс. качество; при первом запуске качается ~3 ГБ) · turbo ≈0.9× (почти как large, но в разы быстрее). Оценки для CPU — на твоей GPU всё быстрее в несколько раз.";

    // v1.19.6: раскладка как в макете — галочка перевода и потоки качания
    // живут на одной строке
    var gV1a = panVideo.add("group");
    var chkTrans2 = gV1a.add("checkbox", undefined, "Перевести на 2-й яз.");
    chkTrans2.value = true;
    var dlLbl = gV1a.add("statictext", undefined, "Скачивание:");
    var ddDlThreads = gV1a.add("dropdownlist", undefined, ["1", "2", "4", "6", "8", "12"]);
    ddDlThreads.selection = 3; // 6 потоков
    gV1a.add("statictext", undefined, "потоков");
    dlLbl.helpTip = "Скачивание модели Whisper: в несколько потоков одновременно, быстрее. И с ДОКАЧКОЙ после обрыва — если интернет прервался, в следующий раз модель продолжается с места обрыва (перескачки с нуля не будет).";
    ddDlThreads.helpTip = "Сколько потоков качает модель Whisper (4-8 — хороший выбор; на слабом Wi-Fi — 2-4). «1» — один поток. Докачка после обрыва работает при любом значении.";
    function dlThreadsVal() {
      try {
        var nT = parseInt(ddDlThreads.selection.text, 10);
        if (!isNaN(nT) && nT >= 1 && nT <= 16) return nT;
      } catch (eDT1) {}
      return 6;
    }

    // v1.17: словарь-подсказка Whisper (initial_prompt)
    var gV1c = panVideo.add("group");
    var prLbl = gV1c.add("statictext", undefined, "Словарь:");
    var edPrompt = gV1c.add("edittext", undefined, "");
    edPrompt.characters = 44;
    prLbl.helpTip = "Словарь-подсказка для Whisper (initial_prompt).";
    edPrompt.helpTip = "Имена и жаргон через запятую — Whisper напишет их правильно.\n\rНапример: «Шершер, ТикТок, капиба». Хватает 5-15 слов.\n\rКириллица безопасна — передаётся через файл, не через командную строку.";

    // v1.22: ГЛОССАРИЙ ПЕРЕВОДА — файл <видео>.glossary.txt рядом с видео
    var gV1d = panVideo.add("group");
    var chkGloss = gV1d.add("checkbox", undefined, "Глоссарий перевода: <видео>.glossary.txt (термин=замена)");
    chkGloss.value = false;
    chkGloss.helpTip = "Перевод второй дорожки правится по глоссарию — чтобы имена и термины не переводились.\n\rРядом с видео лежит файл <имя видео>.glossary.txt, строки вида «термин=замена» (также «термин -> замена» или таб; # — комментарий):\n\r  Карпушов=Karpushov\n\r  TikTok=TikTok\n\rПрименяется ПОСЛЕ перевода, регистр не важен. Файла нет — глоссарий просто пропускается.";

    // v1.23: движок и фильтры распознавания (все галочки — ВЫКЛ по умолчанию)
    var gV1e = panVideo.add("group");
    var chkFw = gV1e.add("checkbox", undefined, "Ускоритель: faster-whisper");
    chkFw.value = false;
    chkFw.helpTip = "Движок whisper-ctranslate2 (faster-whisper) — та же расшифровка в 2-4 раза быстрее на CPU.\n\rСтавится один раз: pip install whisper-ctranslate2\n\rЕсли не найден — панель честно откатится на обычный whisper. Модель скачается сама в свой кэш при первом запуске.";
    var chkCut = gV1e.add("checkbox", undefined, "Резать мусор (низкая уверенность)");
    chkCut.value = false;
    chkCut.helpTip = "Сегменты, в которых Whisper НЕ уверен (фантомные обрывки на музыке, шуме), не попадут в субтитры.\n\rФильтр по оценкам самого Whisper (no_speech_prob > 0.6 или avg_logprob < -1.0). Расшифровка идёт через JSON — чуть медленнее.";

    var gV1f = panVideo.add("group");
    var chkLearn = gV1f.add("checkbox", undefined, "Словарь учится на правках");
    chkLearn.value = false;
    chkLearn.helpTip = "Каждое «Заменить все» в редакторе запоминается, и правильные слова автоматически добавляются в Словарь-промпт при следующем «Whisper → SRT».\n\rЧем больше правишь — тем меньше ошибок у Whisper на следующих роликах.";
    var chkNotify = gV1f.add("checkbox", undefined, "Сообщить о завершении (окно Windows)");
    chkNotify.value = false;
    chkNotify.helpTip = "Когда Whisper закончит (или закончится пакет) — всплывёт окно «ГОТОВО». Не нужно следить за консолью.";

    // v1.23: выключение ПК после пакета
    var gV2c = panVideo.add("group");
    var chkShutdown = gV2c.add("checkbox", undefined, "Выключить ПК после пакета (60 с на отмену — shutdown /a)");
    chkShutdown.value = false;
    chkShutdown.helpTip = "Только для «Пакет: папка видео»: после последнего ролика компьютер выключится через 60 секунд.\n\rОтменить выключение: Win+R → shutdown /a (Enter).\n\rНочные прогоны: запустил пакет — ушёл — утром всё готово.";

    var gV2 = panVideo.add("group");
    gV2.alignChildren = ["fill", "center"];
    var btnMakeComp = gV2.add("button", undefined, "📁 Комп с видео");
    var btnWhisper = gV2.add("button", undefined, "🎙 Whisper → SRT");
    var btnResult = gV2.add("button", undefined, "⬇ Загрузить SRT");
    paintButton(btnWhisper, STYLE.green);
    paintGhost(btnMakeComp);
    paintGhost(btnResult);

    // v1.22: пакетная папка + аудит готовности
    var gV2b = panVideo.add("group");
    gV2b.alignChildren = ["fill", "center"];
    var btnBatch = gV2b.add("button", undefined, "Пакет: папка видео");
    try { btnBatch.alignment = ["fill", "center"]; } catch (eBt0) {}
    paintGhost(btnBatch);
    btnBatch.helpTip = "Выбери ПАПКУ с видео (mp4/mov/avi/mkv/m4v/webm) — Whisper расшифрует их ПО ОЧЕРЕДИ в одном консольном окне, с текущими настройками (язык, модель, перевод, караоке, словарь).\n\rСтатус в панели: [номер/всего] + проценты текущего ролика. Готовые SRT — рядом с каждым видео.";
    var btnAudit = gV2b.add("button", undefined, "Проверка: всё готово?");
    try { btnAudit.alignment = ["fill", "center"]; } catch (eBt1) {}
    paintGhost(btnAudit);
    btnAudit.helpTip = "Чек-лист готовности: видео, SRT обеих дорожек, kar.json, модель в кэше, transcribe-video.ps1, ffmpeg, whisper, whisper-ctranslate2 (опционально).\n\rУдобно после переноса на другой компьютер.";
    // v1.23: режим слежения — новые видео в папке расшифровываются сами
    var btnWatch = gV2b.add("button", undefined, "Watch: следить");
    try { btnWatch.alignment = ["fill", "center"]; } catch (eBt2) {}
    paintGhost(btnWatch);
    btnWatch.helpTip = "Выбери папку — консоль будет проверять её раз в 60 с и расшифровывать НОВЫЕ видео сами (кинул ролик — через пару минут SRT готов).\n\rОкно работает, пока не закроешь; повторное видео не обрабатывается.";

    var gV3 = panVideo.add("group");
    gV3.orientation = "column";
    gV3.alignChildren = ["fill", "top"];
    var pbWhisper = gV3.add("progressbar", undefined, 0, 100);
    pbWhisper.alignment = ["fill", "top"];
    pbWhisper.value = 0;
    var stWhisper = gV3.add("statictext", undefined, "Whisper не запущен");
    stWhisper.characters = 56;
    paintLabel(stWhisper, [0.55, 0.80, 1]);
    // v1.19.6: зеркало лога + «Стоп» прижаты к правому краю одной строкой
    var gV3b = panVideo.add("group");
    gV3b.alignment = ["fill", "top"];
    var stWhisperLog = gV3b.add("statictext", undefined, "");
    stWhisperLog.characters = 50;
    stWhisperLog.alignment = ["fill", "center"];
    paintLabel(stWhisperLog, STYLE.gray);
    var btnStop = gV3b.add("button", undefined, "Стоп");
    btnStop.helpTip = "Остановить Whisper (например, если качание модели застряло)";
    try { btnStop.preferredSize.width = 52; } catch (eSW5) {}
    paintGhost(btnStop, STYLE.red);

    /* --- 2. дорожки и файлы --- */
    var panTracks = makeCard("ДОРОЖКИ");

    var gFile = panTracks.add("group");
    var btnFile = gFile.add("button", undefined, "Файл 1 — RU (снизу)...");
    var stFile = gFile.add("statictext", undefined, "не выбран");
    stFile.characters = 30;
    paintLabel(stFile, STYLE.dim);

    var gLayerPick = panTracks.add("group");
    var btnLayer = gLayerPick.add("button", undefined, "Субтитры ОТ ВЫБРАННОГО СЛОЯ (mp4 / прекомп)");
    btnLayer.helpTip = "Выбери слой в таймлайне (mp4 или прекомпоз) и нажми: панель найдёт SRT рядом с исходником слоя, включит его как комп назначения и тут же создаст субтитры.";
    paintButton(btnLayer, STYLE.green);

    var gEdit = panTracks.add("group");
    var btnEditor = gEdit.add("button", undefined, "✎ Редактор субтитров — исправить распознанное");
    btnEditor.helpTip = "Отдельное окно: список всех реплик файла 1/2, правка текста любой реплики, сохранение обратно в SRT. Дальше — «Создать субтитры» (панель возьмёт правленный файл).\n\rДвойной клик по реплике выделяет в таймлайне ВСЕ её слои (база + ♪ + фон-полоса) — правь стиль, не листая сотни слоёв.";
    paintButton(btnEditor, [0.6, 0.9, 1]);

    var g2 = panTracks.add("group");
    g2.add("statictext", undefined, "Кодировка:");
    var ddEnc = g2.add("dropdownlist", undefined, ["Авто", "UTF-8", "windows-1251"]);
    ddEnc.selection = 0;
    var stCount = g2.add("statictext", undefined, "");
    paintLabel(stCount, STYLE.dim);

    var gDualA = panTracks.add("group");
    var chkDual = gDualA.add("checkbox", undefined, "Второй язык сверху (EN над RU)");
    chkDual.value = false;

    var gDualB = panTracks.add("group");
    var btnFile2 = gDualB.add("button", undefined, "Файл 2 — EN (сверху)...");
    var stFile2 = gDualB.add("statictext", undefined, "не выбран");
    stFile2.characters = 30;
    paintLabel(stFile2, STYLE.dim);
    btnFile2.enabled = false;

    var gDualC = panTracks.add("group");
    gDualC.add("statictext", undefined, "Цвет 2:");
    var ddFill2 = gDualC.add("dropdownlist", undefined, COLOR_NAMES);
    ddFill2.selection = 2; // Жёлтый
    gDualC.add("statictext", undefined, "Раз-р 2:");
    var edSize2 = gDualC.add("edittext", undefined, "66"); edSize2.characters = 3;
    gDualC.add("statictext", undefined, "Отст. 2:");
    var edBottom2 = gDualC.add("edittext", undefined, "205"); edBottom2.characters = 4;
    gDualC.add("statictext", undefined, "Сдвиг 2:");
    var edOffset2 = gDualC.add("edittext", undefined, "0"); edOffset2.characters = 3;

    var gDualD = panTracks.add("group");
    mkNudge(gDualD, edOffset2, "Рег. сдвиг EN:");

    var gNext = panTracks.add("group");
    gNext.add("statictext", undefined, "Куда:");
    var ddDest = gNext.add("dropdownlist", undefined, ["Активная композиция", "Новая композиция"]);
    ddDest.selection = (getActiveComp() !== null) ? 0 : 1;
    gNext.add("statictext", undefined, "Новая W");
    var edW = gNext.add("edittext", undefined, "1920");   edW.characters = 5;
    gNext.add("statictext", undefined, "H");
    var edH = gNext.add("edittext", undefined, "1080");   edH.characters = 5;
    gNext.add("statictext", undefined, "FPS");
    var edFps = gNext.add("edittext", undefined, "30");   edFps.characters = 3;

    var gNext2 = panTracks.add("group");
    var chkReplace = gNext2.add("checkbox", undefined, "Стереть прежние субтитры (RU/EN) перед созданием");
    chkReplace.value = true;
    chkReplace.helpTip = "Перед «Создать субтитры» удаляет из выбранной композиции старые слои Auto Subtitles (RU 001:... / EN 001:...), чтобы при пересоздании они не дублировались. Свои чужие слои не трогает. Отключай, если создаёшь несколько наборов.";

    /* --- 3. стиль текста --- */
    var panStyle = makeCard("СТИЛЬ");

    /* --- пресеты стиля: кнопки-переключатели (v1.19.3) -----------------
       Активный пресет красится акцентом, снятый — нейтральным. Повторный
       клик по активному пресету снимает его: значения остаются как есть,
       дальше стиль правится свободно («свой стиль»). Ручная правка любого
       поля стиля тоже снимает подсветку — она всегда честно показывает,
       откуда взялись текущие значения. Состояние переживает перезапуск AE. */
    var gPres = panStyle.add("group");
    gPres.orientation = "column";
    gPres.alignChildren = ["fill", "top"];
    gPres.spacing = 4;
    var gPres1 = gPres.add("group");
    gPres1.alignChildren = ["fill", "center"];
    var btnPrCap = gPres1.add("button", undefined, "CapCut");
    var btnPrTik = gPres1.add("button", undefined, "TikTok");
    var gPres2 = gPres.add("group");
    gPres2.alignChildren = ["fill", "center"];
    var btnPrYt = gPres2.add("button", undefined, "YouTube");
    var btnPrCin = gPres2.add("button", undefined, "Минимал");
    try {
      btnPrCap.alignment = ["fill", "center"];
      btnPrTik.alignment = ["fill", "center"];
      btnPrYt.alignment = ["fill", "center"];
      btnPrCin.alignment = ["fill", "center"];
    } catch (ePrAl) {}

    var presetApplying = false;
    var activePreset = loadPref("activePreset", "");
    if (activePreset !== "CapCut" && activePreset !== "TikTok" &&
        activePreset !== "YouTube" && activePreset !== "Минимал") activePreset = "";

    function paintPresetBtn(btn, on) {
      try {
        var gP = btn.graphics;
        gP.backgroundColor = gP.newBrush(gP.BrushType.SOLID_COLOR,
          on ? [0.36, 0.63, 0.99, 1] : [0.145, 0.16, 0.185, 1]);
        gP.foregroundColor = gP.newPen(gP.PenType.SOLID_COLOR,
          on ? [0.05, 0.07, 0.12, 1] : [0.93, 0.94, 0.96, 1], 1, { style: "plain" });
      } catch (ePB1) {}
    }
    function paintPresets() {
      paintPresetBtn(btnPrCap, activePreset === "CapCut");
      paintPresetBtn(btnPrTik, activePreset === "TikTok");
      paintPresetBtn(btnPrYt, activePreset === "YouTube");
      paintPresetBtn(btnPrCin, activePreset === "Минимал");
    }
    // ручная правка поля стиля снимает подсветку пресета
    function markCustom() {
      if (presetApplying || activePreset === "") return;
      activePreset = "";
      try { savePref("activePreset", ""); } catch (eMC1) {}
      paintPresets();
    }
    function setPreset(name, applyFn, desc) {
      // повторный клик по активному пресету = снять («свой стиль»)
      if (activePreset === name) {
        activePreset = "";
        try { savePref("activePreset", ""); } catch (eSP0) {}
        paintPresets();
        return;
      }
      presetApplying = true;
      try { applyFn(); } finally { presetApplying = false; }
      activePreset = name;
      try { savePref("activePreset", name); } catch (eSP1) {}
      paintPresets();
      presetMsg(name, desc);
    }
    btnPrCap.helpTip = "Стиль из тутора «АВТО СУБТИТРЫ»: белый 96 (EN жёлтый 66 сверху), обводка чёрная 4, анимация Pop, «по одному слову», перенос 42, снизу 60.\n\rПовторный клик — снять пресет (значения останутся, дальше правь свободно).";
    btnPrTik.helpTip = "Жёлтый караоке: жёлтые 96 (EN белый 66), обводка 5, Pop, «по одному слову», перенос 38, снизу 60.\n\rПовторный клик — снять пресет (значения останутся, дальше правь свободно).";
    btnPrYt.helpTip = "Классика YouTube: белые 72 (EN белый 54), обводка 4, Затухание, без «по одному слову», перенос 46.\n\rПовторный клик — снять пресет (значения останутся, дальше правь свободно).";
    btnPrCin.helpTip = "Минимал (кино): белые 64 (EN 50), БЕЗ обводки, без анимации, снизу 46, перенос 48.\n\rПовторный клик — снять пресет (значения останутся, дальше правь свободно).";

    function presetMsg(name, desc) {
      try { alert("Пресет «" + name + "» применён:\n\r" + desc + "\n\rНажми «Создать субтитры» — слои перестроятся с этим стилем.\n\rПовторный клик по кнопке пресета снимает его (значения не трогаются) — можно править стиль свободно.", SCRIPT_NAME); } catch (ePM) {}
    }
    function presetCommon() {
      edFont.text = "Arial";
      edOffset.text = "0";
      edOffset2.text = "0";
      chkWrap.value = true;
      chkClean.value = true;
      chkFit.value = true;
    }

    btnPrCap.onClick = function () {
      setPreset("CapCut", function () {
        presetCommon();
        edSize.text = "96"; edFade.text = "0.15"; edBottom.text = "60";
        ddFill.selection = 0; chkStroke.value = true; ddStroke.selection = 1; edStrokeW.text = "4";
        edSize2.text = "66"; edBottom2.text = "205"; ddFill2.selection = 2;
        edWrap.text = "42";
        ddAnim.selection = 1;      // Pop (масштаб)
        chkWords.value = true;
      }, "белый 96 (EN жёлтый 66), обводка чёр. 4, Pop, «по одному слову».");
    };
    btnPrTik.onClick = function () {
      setPreset("TikTok", function () {
        presetCommon();
        edSize.text = "96"; edFade.text = "0.15"; edBottom.text = "60";
        ddFill.selection = 2; chkStroke.value = true; ddStroke.selection = 1; edStrokeW.text = "5";
        edSize2.text = "66"; edBottom2.text = "205"; ddFill2.selection = 0;
        edWrap.text = "38";
        ddAnim.selection = 1;      // Pop (масштаб)
        chkWords.value = true;
      }, "жёлтый 96 (EN белый 66), обводка чёр. 5, Pop, «по одному слову».");
    };
    btnPrYt.onClick = function () {
      setPreset("YouTube", function () {
        presetCommon();
        edSize.text = "72"; edFade.text = "0.2"; edBottom.text = "60";
        ddFill.selection = 0; chkStroke.value = true; ddStroke.selection = 1; edStrokeW.text = "4";
        edSize2.text = "54"; edBottom2.text = "140"; ddFill2.selection = 0;
        edWrap.text = "46";
        ddAnim.selection = 0;      // Затухание
        chkWords.value = false;
      }, "белые 72 / EN 54, обводка 4, Затухание, целыми фразами.");
    };
    btnPrCin.onClick = function () {
      setPreset("Минимал", function () {
        presetCommon();
        edSize.text = "64"; edFade.text = "0.25"; edBottom.text = "46";
        ddFill.selection = 0; chkStroke.value = false; edStrokeW.text = "3";
        edSize2.text = "50"; edBottom2.text = "120"; ddFill2.selection = 0;
        edWrap.text = "48";
        ddAnim.selection = 3;      // Без анимации
        chkWords.value = false;
      }, "белые 64 / EN 50, без обводки, без анимации, снизу 46.");
    };

    var g4 = panStyle.add("group");
    g4.add("statictext", undefined, "Шрифт:");
    // v1.19.10: поле шрифта — одновременно ЗНАЧЕНИЕ и ПОИСК (как поиск
    // эффектов). Печатаешь часть названия — под полем выпадает список
    // установленных шрифтов; выбрал совпадение — в поле встанет полное имя.
    var edFont = g4.add("edittext", undefined, "Arial"); edFont.characters = 14;
    try { edFont.alignment = ["fill", "center"]; } catch (eAlFo) {}
    edFont.helpTip = "Шрифт текстовых слоёв (RU и EN).\n\rПечатай часть названия — ниже выпадет список УСТАНОВЛЕННЫХ шрифтов (сначала те, что начинаются с запроса). Клик по совпадению запишет в поле полное имя шрифта.\n\rПоле пустое или с ошибкой — AE возьмёт Arial.";
    // v1.22: снять стиль с выбранного текстового слоя
    var btnGrabStyle = g4.add("button", undefined, "Снять стиль");
    paintGhost(btnGrabStyle);
    btnGrabStyle.helpTip = "Выбери в таймлайне ЛЮБОЙ текстовый слой (например, скопированный из чужого ролика) и нажми: панель прочитает его шрифт, размер, цвет, обводку и отступ снизу — и заполнит поля этой вкладки.\n\rДальше — «Создать субтитры».";
    g4.add("statictext", undefined, "Раз-р 1:");
    var edSize = g4.add("edittext", undefined, "96");   edSize.characters = 4;
    g4.add("statictext", undefined, "Аним.,с:");
    var edFade = g4.add("edittext", undefined, "0.15"); edFade.characters = 4;
    g4.add("statictext", undefined, "Сдвиг 1:");
    var edOffset = g4.add("edittext", undefined, "0"); edOffset.characters = 3;

    /* --- v1.19.10: ПОИСК ШРИФТОВ — как поиск эффектов --------------------
       Список берётся из app.fonts.allFonts (AE 24.0+): это СЕМЕЙНЫЕ
       группы (Array of Array of Font). Из группы берём «Regular»
       (или первое попадание) и пишем его familyName — по одному пункту
       на семейство, имена как в Character-панели. Кэш строится один раз
       лениво; запрос фильтрует (сначала «начинается с», потом «содержит»,
       максимум 24). Если app.fonts недоступен — честный фолбэк:
       статический список популярных (запрос и его фильтрует).
       Поле «Шрифт» остаётся единственным источником истины: пресеты,
       снапшоты и «Сохранить пресет» пишут прямо в него — API выбора не
       менялись. Guard fontSearchSpin нужен потому, что ПРОГРАМММНАЯ
       смена .selection у dropdownlist ДЁРГАЕТ onChange (смена .text у
       edittext НЕ дёргает onChanging). ----------------------------------- */
    var FONT_POPULAR = [
      "Arial", "Montserrat", "Inter", "Roboto", "Bebas Neue", "Oswald",
      "Impact", "Segoe UI", "PT Sans", "Noto Sans", "Times New Roman",
      "Georgia", "Verdana", "Helvetica"
    ];
    var fontAllCache = null;
    var fontSearchSpin = false;
    function allFamilies() {
      if (fontAllCache !== null) return fontAllCache;
      var out = [];
      try {
        var groupsF = app.fonts.allFonts;
        var nGF = 0;
        try { nGF = groupsF.length; } catch (eGNF) { nGF = 0; }
        var seenFam = {};
        for (var iGF = 0; iGF < nGF; iGF++) {
          var grF = null;
          try { grF = groupsF[iGF]; } catch (eGIF) {}
          if (!grF || !grF.length) continue;
          var pickF = null;
          try {
            for (var iS2 = 0; iS2 < grF.length; iS2++) {
              var f0S = grF[iS2];
              if (!f0S) continue;
              if (!pickF) pickF = f0S;
              var st0 = "";
              try { st0 = String(f0S.styleName); } catch (eST0) {}
              if (st0 === "Regular") { pickF = f0S; break; }
            }
          } catch (ePF2) {}
          var fSF = pickF || grF[0];
          if (!fSF) continue;
          var famF = "";
          try { famF = String(fSF.familyName); } catch (eFN1) {}
          if (famF === "" || famF === "undefined" || famF === "null") {
            try { famF = String(fSF.nativeFamilyName); } catch (eFN2) {}
          }
          if (famF === "" || famF === "undefined" || famF === "null") continue;
          if (seenFam[famF]) continue; // одно и то же имя может быть в разных группах
          seenFam[famF] = true;
          out.push({ name: famF, low: famF.toLowerCase() });
        }
      } catch (eFAllF) { out = []; }
      fontAllCache = out;
      return out;
    }
    function filterFonts(qF) {
      qF = trimStr(String(qF)).toLowerCase();
      var allF = allFamilies();
      if (allF.length === 0) {
        // API не отдал список шрифтов — честный фолбэк: популярные + фильтр
        var fbF = [], iFbF;
        for (iFbF = 0; iFbF < FONT_POPULAR.length; iFbF++) {
          var lowFbF = FONT_POPULAR[iFbF].toLowerCase();
          if (qF === "" || lowFbF.indexOf(qF) === 0 || lowFbF.indexOf(qF) > 0) fbF.push(FONT_POPULAR[iFbF]);
        }
        return { hits: fbF, total: -1 };
      }
      if (qF === "") {
        // пустой запрос: популярные установленные сверху, остальные по алфавиту
        var popF = [], restF = [], seenQ = {};
        var iPqF, jPqF, fPqF;
        for (iPqF = 0; iPqF < FONT_POPULAR.length; iPqF++) {
          var lowPqF = FONT_POPULAR[iPqF].toLowerCase();
          for (jPqF = 0; jPqF < allF.length; jPqF++) {
            if (allF[jPqF].low === lowPqF) { popF.push(allF[jPqF].name); break; }
          }
        }
        for (iPqF = 0; iPqF < allF.length; iPqF++) {
          fPqF = allF[iPqF];
          if (seenQ[fPqF.name]) continue;
          seenQ[fPqF.name] = true;
          var isPopF = false;
          for (jPqF = 0; jPqF < popF.length; jPqF++) if (popF[jPqF] === fPqF.name) { isPopF = true; break; }
          if (!isPopF) restF.push(fPqF.name);
        }
        restF.sort(function (a1F, b1F) { return (a1F < b1F) ? -1 : ((a1F > b1F) ? 1 : 0); });
        return { hits: popF.concat(restF).slice(0, 24), total: allF.length };
      }
      var startsF = [], insideF = [], seenLF = {};
      for (var iFqF = 0; iFqF < allF.length; iFqF++) {
        var ffF = allF[iFqF];
        if (seenLF[ffF.name]) continue;
        if (ffF.low.indexOf(qF) === 0) { seenLF[ffF.name] = true; startsF.push(ffF.name); }
        else if (ffF.low.indexOf(qF) > 0) { seenLF[ffF.name] = true; insideF.push(ffF.name); }
      }
      return { hits: startsF.concat(insideF).slice(0, 24), total: allF.length };
    }

    var g4c = panStyle.add("group");
    g4c.add("statictext", undefined, "Шрифты:");
    var ddFontPick = g4c.add("dropdownlist", undefined, []);
    try { ddFontPick.alignment = ["fill", "center"]; } catch (eDDF1) {}
    ddFontPick.helpTip = "Совпадения по запросу в поле «Шрифт» (до 24: сначала те, что НАЧИНАЮТСЯ с запроса, потом «содержат»; при пустом поле — популярные установленные сверху).\n\rКлик по пункту — полное имя шрифта встанет в поле «Шрифт».";
    var stFontCnt = g4c.add("statictext", undefined, "");
    stFontCnt.characters = 11;
    paintLabel(stFontCnt, STYLE.dim);
    var btnFontRld = g4c.add("button", undefined, "↻");
    btnFontRld.helpTip = "Перечитать список установленных шрифтов (например, после установки новых)";
    try { btnFontRld.preferredSize.width = 26; } catch (eBFr) {}
    paintGhost(btnFontRld);
    btnFontRld.onClick = function () {
      fontAllCache = null;
      refreshFontSearch();
    };

    function refreshFontSearch() {
      var rFl = filterFonts(edFont.text);
      fontSearchSpin = true; // программный .selection дёргает onChange — глушим
      try {
        ddFontPick.removeAll();
        var selFl = -1;
        var curFl = trimStr(edFont.text);
        for (var iFl = 0; iFl < rFl.hits.length; iFl++) {
          ddFontPick.add("item", rFl.hits[iFl]);
          if (selFl < 0 && rFl.hits[iFl] === curFl) selFl = iFl; // полное имя совпало
        }
        if (selFl < 0 && rFl.hits.length > 0) selFl = 0;
        ddFontPick.selection = (selFl >= 0) ? selFl : null;
      } catch (eRFl) {}
      fontSearchSpin = false;
      try {
        if (rFl.total < 0) stFontCnt.text = "нет списка";
        else if (curFl === "") stFontCnt.text = ("шр.:" + rFl.total);
        else stFontCnt.text = ("найдено: " + rFl.hits.length);
      } catch (eCntFl) {}
    }
    edFont.onChanging = function () { refreshFontSearch(); };
    ddFontPick.onChange = function () {
      if (fontSearchSpin) return;
      if (!ddFontPick.selection) return;
      var chosenF = ddFontPick.selection.text;
      if (trimStr(edFont.text) === chosenF) return;
      fontSearchSpin = true;
      try { edFont.text = chosenF; } finally { fontSearchSpin = false; }
      // программный .text не дёргает onChange — зовём вручную, чтобы
      // выбор шрифта из списка снял подсветку активного пресета (v1.19.10)
      try { if (typeof edFont.onChange === "function") edFont.onChange.call(edFont); } catch (eChF) {}
      refreshFontSearch();
    };
    refreshFontSearch();

    var g4b = panStyle.add("group");
    mkNudge(g4b, edOffset, "Рег. сдвиг RU:");

    var g5 = panStyle.add("group");
    g5.add("statictext", undefined, "Цвет 1:");
    var ddFill = g5.add("dropdownlist", undefined, COLOR_NAMES);
    ddFill.selection = 0; // Белый
    var chkStroke = g5.add("checkbox", undefined, "Обводка");
    var ddStroke = g5.add("dropdownlist", undefined, COLOR_NAMES);
    ddStroke.selection = 1; // Чёрный
    var edStrokeW = g5.add("edittext", undefined, "4"); edStrokeW.characters = 2;

    var g6 = panStyle.add("group");
    g6.add("statictext", undefined, "Отступ снизу 1:");
    var edBottom = g6.add("edittext", undefined, "60"); edBottom.characters = 4;
    var chkWrap = g6.add("checkbox", undefined, "Перенос строк (симв):");
    chkWrap.value = true;
    var edWrap = g6.add("edittext", undefined, "42"); edWrap.characters = 3;
    var chkMarkers = g6.add("checkbox", undefined, "Маркеры");
    var chkExtend = g6.add("checkbox", undefined, "Удлинять комп.");
    chkExtend.value = true;

    /* --- фишки из тутора «Автосубтитры в AE» (стиль CapCut) --- */
    var g7 = panStyle.add("group");
    g7.add("statictext", undefined, "Анимация:");
    var ddAnim = g7.add("dropdownlist", undefined, ["Затухание", "Pop (масштаб)", "Слайд вверх", "Без анимации"]);
    ddAnim.selection = 0;
    ddAnim.helpTip = "Одинаковая анимация на ВСЕ слои (RU и EN). Только ключевые кадры, без выражений — стабильно на крянутой сборке.";
    var chkClean = g7.add("checkbox", undefined, "Убирать зн. препинания");
    chkClean.value = true;
    chkClean.helpTip = "Убирает из текста точки, запятые, ?, !, кавычки и т.п. — чистый CapCut-вид субтитров.";
    var chkFit = g7.add("checkbox", undefined, "Под размер компа");
    chkFit.value = true;
    chkFit.helpTip = "Пересчитывает шрифт, отступы и перенос строк под размеры композиции (референс 1080p).";

    var g7b = panStyle.add("group");
    var chkWords = g7b.add("checkbox", undefined, "Субтитры по одному слову (караоке-стиль)");
    chkWords.value = false;
    chkWords.helpTip = "Реплика делится на слова: каждое слово появляется по очереди на свою часть времени реплики (стиль CapCut). Анимация из списка применяется к каждому слову.";
    g7b.add("statictext", undefined, "Мин. показ, с:");
    var edMinDur = g7b.add("edittext", undefined, "0.8"); edMinDur.characters = 4;
    edMinDur.helpTip = "Минимум, сколько реплика (или слово в режиме «по одному слову») держится на экране. Более короткие удлиняются — и тайминг выглядит ровно.";
    g7b.add("statictext", undefined, "Пауза, кадр.:");
    var edGap = g7b.add("edittext", undefined, "2"); edGap.characters = 3;
    edGap.helpTip = "Пауза между репликами в кадрах. 0 = без добавленной паузы. С галочкой «Вплотную» это зазор между репликами: 0 = стык в стык, без зазора.";

    // v1.21: УМНЫЙ ТАЙМИНГ — длительность реплики по числу слов
    var g7b2 = panStyle.add("group");
    var chkSmart = g7b2.add("checkbox", undefined, "Умный тайминг: длительность по числу слов (короче фраза — короче реплика)");
    chkSmart.value = false;
    chkSmart.helpTip = "Длительность каждой реплики прикидывается по длине: ~0,35 с на слово, потолок 6 с, минимум — «Мин. показ, с».\n\rКороткое «Да.» не висит полторы секунды, а длинная фраза дотягивается, чтобы успеть прочитать.\n\rРастягивается только в свободное место — до старта следующей реплики, наезжать нельзя.\n\rВыкл. — тайминг ровно как сказал Whisper (с полировкой «Мин. показ»).";

    // v1.25: диапазон показа субтитров — не на весь ролик, а с…до
    var g7b3 = panStyle.add("group");
    g7b3.add("statictext", undefined, "Показ: с");
    var edRangeFrom = g7b3.add("edittext", undefined, ""); edRangeFrom.characters = 6;
    g7b3.add("statictext", undefined, "до");
    var edRangeTo = g7b3.add("edittext", undefined, ""); edRangeTo.characters = 6;
    g7b3.add("statictext", undefined, "сек (пусто = весь ролик)");
    edRangeFrom.helpTip = "С какой секунды показывать субтитры.\n\rФормат: «5» — пять секунд, «1:30» — полторы минуты, «90.5» — с дробью.\n\rПУСТО = весь ролик (как раньше). Реплики вне диапазона пропускаются, задевшие границы — обрезаются по ним.\n\rНе запоминается — после перезапуска AE поля пустые, чтобы диапазон не забыл выключить.";
    edRangeTo.helpTip = "До какой секунды показывать субтитры (тот же формат).\n\rПУСТО = до конца ролика. Если «до» меньше «с» — значения поменяются местами автоматически.";

    var g7c = panStyle.add("group");
    var chkChain = g7c.add("checkbox", undefined, "Вплотную: субтитры идут без пауз");
    chkChain.value = false;
    chkChain.helpTip = "ВКЛ: каждая реплика начинается ровно там, где кончилась предыдущая (+ пауза из «Пауза, кадр.:», 0 = совсем без зазора). Естественные паузы Whisper (тишина между фразами) убираются — реплики идут одна за другой.\nВЫКЛ: сохраняются естественные тайминги Whisper — убирается только наезд реплик друг на друга.";
    var chkStutter = g7c.add("checkbox", undefined, "Чистить запинки (повторы слов)");
    chkStutter.value = true;
    chkStutter.helpTip = "Удаляет повторяющиеся подряд слова («и и», «да да да»), которые Whisper рисует на запинках речи. Из серии остаётся первое слово. Работает для обеих дорожек до построения слоёв.";

    // v1.23: отдельное исчезновение «уехать вниз» + схлопывание повторов
    var g7c2 = panStyle.add("group");
    var chkOutDown = g7c2.add("checkbox", undefined, "Исчезание: уехать вниз");
    chkOutDown.value = false;
    chkOutDown.helpTip = "Реплика исчезает не просто затуханием, а уезжает вниз (как в TikTok) — ключами позиции, без выражений.\n\rПоявление остаётся из списка «Анимация».";
    var chkDedup = g7c2.add("checkbox", undefined, "Схлопывать повторы реплик подряд");
    chkDedup.value = false;
    chkDedup.helpTip = "Подряд идущие одинаковые реплики («Да. / Да. / Да.» от Whisper) склеиваются в одну: время — от первой до конца последней. Работает для обеих дорожек, до построения слоёв.";

    // v1.18: караоке — настоящая подсветка слов по таймингам Whisper
    var g7d = panStyle.add("group");
    var chkKaraoke = g7d.add("checkbox", undefined, "Караоке: подсветка слов по речи");
    chkKaraoke.value = true;
    chkKaraoke.helpTip = "Слова реплики подсвечиваются цветом по ходу речи — как в TikTok.\n\rВСЕГО ОДНО УСЛОВИЕ: «Whisper → SRT» должен быть запущен С ЭТОЙ галочкой — тогда рядом с SRT появится файл <имя>.ru.kar.json с таймингами слов.\n\rНа реплику создаётся 2 слоя: обычный + слой «♪» — подсвеченная часть.\n\rЕсли kar-файла нет — реплики создадутся обычными (не страшно).\n\rЦвет подсветки — жёлтый. Ставится приоритетнее «Субтитры по одному слову».";

    // v1.19: фон-подложка (тёмная полоса за текстом, CapCut-стиль)
    var g7e = panStyle.add("group");
    var chkBgBar = g7e.add("checkbox", undefined, "Фон: тёмная полоса за текстом (читаемость)");
    chkBgBar.value = false;
    chkBgBar.helpTip = "Тёмная полупрозрачная полоса с закруглениями ЗА текстом — читаемость на светлом/пёстром видео (стиль CapCut).\n\rРаботает для RU и EN, обычных реплик, «по одному слову» и караоке.\n\rПолоса живёт ровно на длину реплики и анимируется вместе с текстом.\n\rВ «по одному слову» полоса ОДНА на всю реплику — по ширине самого длинного слова, не мигает на каждом слове.\n\rВходит в свои пресеты (кнопка «Сохранить» во вкладке «Эффекты»).\n\rВыключена по умолчанию — включи галочку и жми «Создать субтитры».";

    /* --- 4. свои эффекты на текст + свои пресеты --- */
    var panFx = makeCard("ЭФФЕКТЫ");

    /* --- v1.19.4: ПОИСК по всем эффектам, установленным в этом AE ------
       app.effects отдаёт ВСЕ эффекты машины (родные + любые плагины:
       Deep Glow, Sapphire, Red Giant...). Печатаешь часть названия —
       выпадашка показывает совпадения (до 24; сначала «начинается с
       запроса», потом «содержит»). Пустое поле — список популярных.
       Список эффектов читается один раз (лениво, при первом поиске)
       и кэшируется — открытие панели не медленнее обычного. */
    var FX_POPULAR = [
      "Deep Glow", "S_DropShadow", "S_Glow", "Glow", "Drop Shadow",
      "Radial Blur", "Gaussian Blur", "Hue/Saturation", "Tint", "Fill"
    ];
    var fxAllCache = null;
    var fxAllFailed = false;
    // v1.19.8: ПОЧИНЕНО — в реальном AE app.effects это МАССИВ (индексация
    // с 0), а у элемента поля displayName / category / matchName:
    //   var allFx = app.effects;        // Array
    //   allFx[0].displayName → "Fast Box Blur"
    //   allFx[0].matchName  → "ADBE Box Blur2"
    // (раньше читали не существующие numEffects и .name — цикл не
    // выполнялся, влетали в фолбэк «нет списка», поиск не горел).
    function allInstalledFx() {
      if (fxAllCache !== null) return fxAllCache;
      var out = [];
      try {
        var srcFx = app.effects;
        if (srcFx) {
          var nFxAll = 0;
          try {
            if (typeof srcFx.length === "number") nFxAll = srcFx.length;      // массив (реальный API)
            else if (typeof srcFx.numEffects === "number") nFxAll = srcFx.numEffects; // страховка
          } catch (eFxN) { nFxAll = 0; }
          var iFx, fxOne, nmFx1, mnFx1;
          for (iFx = 0; iFx < nFxAll; iFx++) {          // индексация С НУЛЯ
            fxOne = null;
            try { fxOne = srcFx[iFx]; } catch (eFxI) {}
            if (!fxOne) continue;
            nmFx1 = "";
            try { nmFx1 = String(fxOne.displayName); } catch (eNfx) {}
            if (nmFx1 === "" || nmFx1 === "undefined" || nmFx1 === "null") {
              try { nmFx1 = String(fxOne.name); } catch (eNfx2) {}
            }
            if (nmFx1 === "" || nmFx1 === "undefined" || nmFx1 === "null") continue;
            mnFx1 = "";
            try { mnFx1 = String(fxOne.matchName); } catch (eQfx) {}
            if (mnFx1 === "undefined" || mnFx1 === "null") mnFx1 = "";
            out.push({ name: nmFx1, low: nmFx1.toLowerCase(), mnLow: mnFx1.toLowerCase() });
          }
        }
      } catch (eFxAll) { out = []; fxAllFailed = true; }
      fxAllCache = out;
      return out;
    }
    // v1.19.6: ПУСТОЙ запрос показывает ТОЛЬКО то, что реально ЕСТЬ на
    // компьютере: сначала популярные, которые установлены (если они
    // встречаются в реальном списке), затем остальные установленные по
    // алфавиту. Статический список «доступных по названию» больше не
    // показывается — как просили: «установленное, а не доступное».
    function filterFx(q) {
      q = trimStr(String(q)).toLowerCase();
      var all = allInstalledFx();
      if (fxAllFailed || all.length === 0) {
        // список установленного недоступен — честный фолбэк.
        // v1.19.8: в фолбэке запрос тоже ФИЛЬТРУЕТСЯ (раньше выпадашка
        // показывала один и тот же список при любом запросе).
        var fbHits = [], iFb;
        for (iFb = 0; iFb < FX_POPULAR.length; iFb++) {
          var lowFb = FX_POPULAR[iFb].toLowerCase();
          if (q === "" || lowFb.indexOf(q) === 0 || lowFb.indexOf(q) > 0) fbHits.push(FX_POPULAR[iFb]);
        }
        return { hits: fbHits, total: -1 };
      }
      if (q === "") {
        var popHere = [], restFx = [], wastedFx = {};
        var iPq, jPq, fPq;
        for (iPq = 0; iPq < FX_POPULAR.length; iPq++) {
          var lowPq = FX_POPULAR[iPq].toLowerCase();
          for (jPq = 0; jPq < all.length; jPq++) {
            if (all[jPq].low === lowPq || all[jPq].mnLow === lowPq) { popHere.push(all[jPq].name); break; }
          }
        }
        for (iPq = 0; iPq < all.length; iPq++) {
          fPq = all[iPq];
          if (wastedFx[fPq.name]) continue;
          wastedFx[fPq.name] = true;
          var isPop = false;
          for (jPq = 0; jPq < popHere.length; jPq++) if (popHere[jPq] === fPq.name) { isPop = true; break; }
          if (!isPop) restFx.push(fPq.name);
        }
        restFx.sort(function (a1, b1) { return (a1 < b1) ? -1 : ((a1 > b1) ? 1 : 0); });
        return { hits: popHere.concat(restFx).slice(0, 24), total: rest_fx_total(wastedFx) };
      }
      var starts = [], inside = [], seenFx = {};
      for (var iFq = 0; iFq < all.length; iFq++) {
        var f = all[iFq];
        if (seenFx[f.name]) continue;
        if (f.low.indexOf(q) === 0 || f.mnLow.indexOf(q) === 0) {
          seenFx[f.name] = true; starts.push(f.name);
        } else if (f.low.indexOf(q) >= 0 || f.mnLow.indexOf(q) >= 0) {
          seenFx[f.name] = true; inside.push(f.name);
        }
      }
      return { hits: starts.concat(inside).slice(0, 24), total: all.length };
    }
    function rest_fx_total(wasted) {
      var n = 0, key;
      for (key in wasted) n++;
      return n;
    }

    var gFxS = panFx.add("group");
    var stFxSLbl = gFxS.add("statictext", undefined, "Поиск:");
    var edFxSearch = gFxS.add("edittext", undefined, "");
    edFxSearch.characters = 24;
    edFxSearch.alignment = ["fill", "center"];
    edFxSearch.helpTip = "Поиск ТОЛЬКО по тому, что ЕСТЬ на компьютере (родные эффекты AE и плагины: Deep Glow, Sapphire, Red Giant...).\n\rПечатай часть названия — список покажет совпадения (до 24, сначала те, что НАЧИНАЮТСЯ с запроса).\n\rПусто — список установленных (популярные сверху). Дальше выбери и жми «+».";
    var stFxCnt = gFxS.add("statictext", undefined, "");
    stFxCnt.characters = 10;
    paintLabel(stFxCnt, STYLE.dim);
    var btnFxListTgl = gFxS.add("button", undefined, "✎ Список");
    btnFxListTgl.helpTip = "Показать/скрыть поле списка «На все слои» (текст) и «⚙ Синхрониз. со списком».\n\rПри показе строки параметров ниже СРАЗУ перестраиваются из поля. Параметры отдельного эффекта удобнее менять кнопкой «⚙» рядом с «+».";
    paintGhost(btnFxListTgl);
    try { btnFxListTgl.preferredSize.width = 62; } catch (eTT5) {}

    var gFx1 = panFx.add("group");
    var ddFxLib = gFx1.add("dropdownlist", undefined, []);
    ddFxLib.alignment = ["fill", "center"];
    ddFxLib.helpTip = "Установленные эффекты по запросу. Выбери и нажми «+» — эффект попадёт в список «На все слои».";
    var btnFxPlus = gFx1.add("button", undefined, " + ");
    btnFxPlus.helpTip = "Добавить выбранный эффект в список «На все слои».";
    paintButton(btnFxPlus, STYLE.green);
    var btnFxTune = gFx1.add("button", undefined, "⚙");
    btnFxTune.helpTip = "Настроить выбранный эффект БЕЗ ручного текста: панель покажет параметры со значениями по умолчанию, правишь только нужные — строка для списка пишется сама.";
    try { btnFxTune.preferredSize.width = 30; } catch (eTN4) {}
    paintGhost(btnFxTune);
    var btnFxClear = gFx1.add("button", undefined, "Очистить");
    btnFxClear.helpTip = "Убрать все эффекты из СПИСКА «На все слои» (поиск не трогает) — слои создадутся без эффектов.";
    paintGhost(btnFxClear);
    btnFxTune.onClick = function () {
      var selFxT = null;
      try { selFxT = ddFxLib.selection; } catch (eFxT0) {}
      if (!selFxT) { alert("Сначала найди и выбери эффект в списке поиска."); return; }
      openFxTuner(selFxT.text);
    };

    function refreshFxSearch() {
      var rFx = filterFx(edFxSearch.text);
      ddFxLib.removeAll();
      for (var iFx2 = 0; iFx2 < rFx.hits.length; iFx2++) {
        ddFxLib.add("item", rFx.hits[iFx2]);
      }
      if (rFx.hits.length > 0) ddFxLib.selection = 0;
      try {
        if (rFx.total < 0) stFxCnt.text = "нет списка";
        else if (trimStr(edFxSearch.text) === "") stFxCnt.text = ("ус.:" + rFx.total);
        else stFxCnt.text = ("найдено: " + rFx.hits.length);
      } catch (eCntFx) {}
    }
    edFxSearch.onChanging = function () { refreshFxSearch(); };
    refreshFxSearch();

    /* --- v1.19.9: МАСТЕР «⚙» — параметры эффекта без ручного текста -----
       Выбираешь эффект в поиске → «⚙»: на секунду создаётся ПРОБНЫЙ комп
       (32×32, тут же удаляется), на его скрытый слой вешается эффект и
       считываются реальные параметры СО ЗНАЧЕНИЯМИ ПО УМОЛЧАНИЮ
       (числа, цвета R,G,B 0–255, точки x,y — до 14). В маленьком окне
       правишь только нужное → кнопка «⤴ В список» САМА собирает строку
       «Имя(Свойство=…; Свойство=…)» и заменяет прежнюю запись этого же
       эффекта в списке «На все слои». Собранные значения — в обычном
       формате v1.14, так что стоит и «прогнать» через «Создать
       субтитры», и править потом вручную, как раньше. -------------------- */
    function fmtTuneNum(vT) {
      return String(Math.round(vT * 1000) / 1000);
    }
    function fmtTuneRGB255(vlT) {
      var outT = [], iT;
      for (iT = 0; iT < 3; iT++) {
        var cfT = (typeof vlT[iT] === "number") ? vlT[iT] : 0;
        var cvT = Math.round(cfT * 255);
        if (cvT < 0) cvT = 0;
        if (cvT > 255) cvT = 255;
        outT.push("" + cvT);
      }
      return outT.join(", ");
    }
    function mkTuneReset9(entryT) {
      return function () {
        try { entryT.ed.text = entryT.row.def; } catch (eRt9) {}
      };
    }
    function openFxTuner(fxNameT) {
      fxNameT = trimStr(fxNameT);
      if (fxNameT === "") return;
      var rowsT = [];
      var probeComp = null;
      var undoT = false;
      try { app.beginUndoGroup("Auto Subtitles — чтение параметров эффекта"); undoT = true; } catch (eU0) {}
      try {
        probeComp = app.project.items.addComp("AutoSub tune tmp", 32, 32, 1, 0.4, 24);
        var probeL = probeComp.layers.addSolid([1, 1, 1], "tunesolid", 32, 32, 1, 0.4);
        var fxEx = probeL.property("ADBE Effect Parade").addProperty(fxNameT);
        var nP = fxEx.numProperties;
        var c1D = null, c2D = null, c2S = null, cCol = -1;
        try { c1D = PropertyValueType.OneD; } catch (eC1) {}
        try { c2D = PropertyValueType.TwoD; } catch (eC2) {}
        try { c2S = PropertyValueType.TwoD_SPATIAL; } catch (eC3) {}
        try {
          if (PropertyValueType.COLOR !== undefined) cCol = PropertyValueType.COLOR;
          else if (PropertyValueType.Color !== undefined) cCol = PropertyValueType.Color;
        } catch (eC4) {}
        for (var iP = 1; iP <= nP; iP++) {
          var ppT = null;
          try { ppT = fxEx.property(iP); } catch (ePr1) { continue; }
          if (!ppT) continue;
          var nmT = "";
          try { nmT = String(ppT.name); } catch (ePr2) { continue; }
          if (trimStr(nmT) === "") continue;
          var vtT = -3, vlT = null;
          try { vtT = ppT.propertyValueType; } catch (ePr3) { continue; }
          try { vlT = ppT.value; } catch (ePr4) { continue; }
          var kindT = "", defT = "";
          if (c1D !== null && vtT === c1D && typeof vlT === "number" && isFinite(vlT)) {
            kindT = "num"; defT = fmtTuneNum(vlT);
          } else if (cCol >= 0 && vtT === cCol && vlT !== null && vlT.length >= 3) {
            kindT = "col"; defT = fmtTuneRGB255(vlT);
          } else if (((c2D !== null && vtT === c2D) || (c2S !== null && vtT === c2S)) && vlT !== null && vlT.length >= 2) {
            kindT = "xy"; defT = fmtTuneNum(vlT[0]) + ", " + fmtTuneNum(vlT[1]);
          }
          if (kindT === "") continue;
          rowsT.push({ name: nmT, kind: kindT, def: defT });
          if (rowsT.length >= 14) break;
        }
      } catch (eProbe) {
        rowsT = [];
      }
      try { if (probeComp) app.project.items.remove(probeComp); } catch (eDel1) {}
      try { if (undoT) app.endUndoGroup(); } catch (eU1) {}
      if (rowsT.length === 0) {
        alert("Не удалось прочитать параметры «" + fxNameT + "».\n" +
          "Эффект, скорее всего, не установлен, либо у него нет простых параметров " +
          "(числа/цвета/точки). Строку «Имя(Свойство=значение)» можно вписать вручную в «На все слои».");
        return;
      }
      var tw9 = new Window("palette", "Настройка: " + fxNameT, undefined, { resizeable: false });
      tw9.orientation = "column";
      tw9.alignChildren = ["fill", "top"];
      tw9.spacing = 5;
      tw9.margins = 10;
      paintPanel(tw9, STYLE.bg);
      var stHint9 = tw9.add("statictext", undefined, "Правишь только нужное — остальное по умолчанию.");
      stHint9.characters = 46;
      paintLabel(stHint9, STYLE.dim);
      var rowsUI9 = [];
      for (var iR = 0; iR < rowsT.length; iR++) {
        var row9 = rowsT[iR];
        var g9 = tw9.add("group");
        g9.alignChildren = ["fill", "center"];
        var hintT = row9.name;
        if (row9.kind === "col") hintT += "  (цвет: R,G,B 0–255)";
        else if (row9.kind === "xy") hintT += "  (точка: x, y)";
        var st9 = g9.add("statictext", undefined, truncateMid(row9.name, 26));
        st9.characters = 26;
        st9.helpTip = hintT;
        paintLabel(st9, STYLE.gray);
        var ed9 = g9.add("edittext", undefined, row9.def);
        ed9.characters = 14;
        try { ed9.alignment = ["fill", "center"]; } catch (eE9) {}
        ed9.helpTip = hintT + "\rПо умолчанию: " + row9.def;
        var btn9 = g9.add("button", undefined, "↺");
        try { btn9.preferredSize.width = 24; } catch (eB9) {}
        paintGhost(btn9);
        btn9.helpTip = "Вернуть значение по умолчанию: " + row9.def;
        var entry9 = { g: g9, st: st9, ed: ed9, row: row9 };
        btn9.onClick = mkTuneReset9(entry9);
        rowsUI9.push(entry9);
      }
      var gFoot9 = tw9.add("group");
      gFoot9.alignment = ["fill", "top"];
      var btnApply9 = gFoot9.add("button", undefined, "⤴ В список");
      try { btnApply9.alignment = ["fill", "center"]; } catch (eA9) {}
      paintButton(btnApply9, STYLE.green);
      var btnCancel9 = gFoot9.add("button", undefined, "Отмена");
      paintGhost(btnCancel9);
      btnCancel9.onClick = function () { try { tw9.close(); } catch (eC9) {} };
      btnApply9.onClick = function () {
        var parts9 = [];
        for (var iU = 0; iU < rowsUI9.length; iU++) {
          var ui9 = rowsUI9[iU];
          var val9 = trimStr(ui9.ed.text);
          if (val9 === "" || val9 === ui9.row.def) continue; // не тронуто → по умолчанию
          parts9.push(ui9.row.name + "=" + val9.replace(/\s*;\s*/g, " "));
        }
        var params9 = parts9.join("; ");
        var specs9 = parseFxSpec(edEffects.text);
        var nameLow9 = fxNameT.toLowerCase();
        var hitIdx9 = -1;
        for (var iP2 = 0; iP2 < specs9.length; iP2++) {
          if (specs9[iP2].name.toLowerCase() === nameLow9) { hitIdx9 = iP2; break; }
        }
        var spec9 = { name: fxNameT, params: params9 };
        if (hitIdx9 >= 0) specs9.splice(hitIdx9, 1, spec9); else specs9.push(spec9);
        edEffects.text = fxSpecsToText(specs9);
        try { rebuildFxRows(); } catch (eRB9) {}
        try { tw9.close(); } catch (eCl9) {}
      };
      tw9.show();
    }

    var gFx2 = panFx.add("group");
    gFx2.add("statictext", undefined, "На все слои:");
    var edEffects = gFx2.add("edittext", undefined, ""); edEffects.characters = 33;
    edEffects.helpTip = "Список эффектов через запятую, можно с параметрами:\n\r«Deep Glow(Radius=25;Exposure=1.2), S_DropShadow(Distance=18)».\n\rКаждый эффект вешается на КАЖДЫЙ текстовый слой (RU и EN). Тысяча конфигураций — правь и жми «Создать субтитры».";
    var btnFxNoview = gFx2.add("button", undefined, "?");
    btnFxNoview.preferredSize.width = 24;
    btnFxNoview.helpTip = "Как задавать параметры эффектов";

    /* --- редактор параметров: строка на каждый эффект --- */
    var gFxRowsHdr = panFx.add("group");
    gFxRowsHdr.add("statictext", undefined, "Параметры:");
    var btnFxSync = gFxRowsHdr.add("button", undefined, "⚙ Синхрониз. со списком");
    btnFxSync.helpTip = "Перечитать список «На все слои» и показать строку параметров у каждого эффекта (нужен после ручного ввода текста в поле).";
    paintGhost(btnFxSync);
    // v1.19.6: сырой список и заголовок «Параметры:» скрыты (как в макете) —
    // включаются кнопкой «✎ Список» в строке поиска
    var expertFxList = false;
    try { gFx2.visible = false; } catch (eX11) {}
    try { gFxRowsHdr.visible = false; } catch (eX21) {}
    var gFxRows = panFx.add("group");
    gFxRows.orientation = "column";
    gFxRows.alignChildren = ["fill", "top"];
    gFxRows.helpTip = "Своя строка для каждого эффекта: «Свойство=значение; Свойство=значение». Пусто — настройки плагина по умолчанию.";
    var rowState = [];
    var fxSyncing = false;

    function fxSpecsToText(specs) {
      var parts = [];
      for (var i = 0; i < specs.length; i++) {
        parts.push(specs[i].name + (trimStr(specs[i].params) !== "" ? "(" + trimStr(specs[i].params) + ")" : ""));
      }
      return parts.join(", ");
    }
    function rebuildFxRows() {
      try {
        for (var i = gFxRows.children.length - 1; i >= 0; i--) {
          gFxRows.remove(gFxRows.children[i]);
        }
      } catch (eRw0) {}
      rowState = parseFxSpec(edEffects.text);
      if (rowState.length === 0) {
        // v1.19.12: пустой список не выглядит «сломанным» — подсказка,
        // как добавить эффект и где править параметры
        try {
          var stEmpty = gFxRows.add("statictext", undefined, "(список пуст — найди эффект выше и жми «+»)");
          try { paintLabel(stEmpty, STYLE.dim); } catch (eE1) {}
        } catch (eE0) {}
      }
      for (var r = 0; r < rowState.length; r++) {
        (function (idx) {
          var rowG = gFxRows.add("group");
          rowG.alignChildren = ["left", "center"];
          var stR = rowG.add("statictext", undefined, truncateMid(rowState[idx].name, 20));
          stR.characters = 20;
          paintLabel(stR, STYLE.label);
          var edR = rowG.add("edittext", undefined, rowState[idx].params);
          edR.characters = 28;
          edR.helpTip = "Параметры эффекта: «Свойство=значение; Свойство=значение». Свойства — как называются в Effect Controls (Radius, Exposure, Distance, Size, Opacity и т.п.). Пусто — настройки плагина по умолчанию.";
          edR.onChange = function () {
            rowState[idx].params = trimStr(this.text);
            fxSyncing = true;
            edEffects.text = fxSpecsToText(rowState);
            fxSyncing = false;
          };
          var bDel = rowG.add("button", undefined, "✕");
          bDel.preferredSize.width = 26;
          bDel.helpTip = "Убрать этот эффект из списка";
          bDel.onClick = function () {
            rowState.splice(idx, 1);
            fxSyncing = true;
            edEffects.text = fxSpecsToText(rowState);
            fxSyncing = false;
            rebuildFxRows();
          };
        })(r);
      }
    }
    btnFxSync.onClick = function () { rebuildFxRows(); };
    btnFxListTgl.onClick = function () {
      // v1.19.12: при показе поля списка строки параметров СРАЗУ
      // перестраиваются из поля — правка доступна немедленно
      expertFxList = !expertFxList;
      try { gFx2.visible = expertFxList; } catch (eV21) {}
      try { gFxRowsHdr.visible = expertFxList; } catch (eV22) {}
      if (expertFxList) { try { rebuildFxRows(); } catch (eV24) {} }
      try { win.layout.layout(true); } catch (eV23) {}
    };

    /* --- готовые варианты эффектов одним кликом --- */
    var gFx5 = panFx.add("group");
    gFx5.add("statictext", undefined, "Готовые:");
    var btnFxGSoft = gFx5.add("button", undefined, "Д.Glow мягкий");
    paintGhost(btnFxGSoft);
    btnFxGSoft.helpTip = "Deep Glow для мягкого свечения: Radius=18, Exposure=1.2. Добавляет/обновляет запись в списке.";
    var btnFxGHot = gFx5.add("button", undefined, "Д.Glow яркий");
    paintGhost(btnFxGHot);
    btnFxGHot.helpTip = "Deep Glow ярче/жирнее: Radius=45, Exposure=2.";
    var btnFxShd = gFx5.add("button", undefined, "Тень (S_Drop)");
    paintGhost(btnFxShd);
    btnFxShd.helpTip = "S_DropShadow: Distance=16, Size=20, Opacity=55 — тень-подсветка как в оформлении роликов.";
    var btnFxGAE = gFx5.add("button", undefined, "Glow (AE)");
    paintGhost(btnFxGAE);
    btnFxGAE.helpTip = "Родной AE «Glow»: Glow Intensity=1.2, Glow Radius=25 (без установки плагинов).";

    var gFx3 = panFx.add("group");
    gFx3.add("statictext", undefined, "Мой стиль:");
    var ddUserPr = gFx3.add("dropdownlist", undefined, ["(нет своих)"]);
    ddUserPr.alignment = ["fill", "center"];
    ddUserPr.selection = 0;
    ddUserPr.helpTip = "Твои сохранённые пресеты: все настройки вкладки «Стиль» + список эффектов + тайминг. Выбор из списка применяет их обратно.";
    var btnPrSave = gFx3.add("button", undefined, "💾 Сохранить");
    paintButton(btnPrSave, STYLE.green);
    btnPrSave.helpTip = "Сохранить текущие настройки (стиль + эффекты + тайминг) как свой пресет. Переживает перезапуск AE.";
    var btnPrDel = gFx3.add("button", undefined, "🗑");
    try { btnPrDel.preferredSize.width = 26; } catch (ePD5) {}
    btnPrDel.helpTip = "Удалить выбранный свой пресет.";
    paintGhost(btnPrDel);

    btnFxPlus.onClick = function () {
      if (!ddFxLib.selection) return;
      var nmAdd = ddFxLib.selection.text;
      if (nmAdd === "") return;
      fxAppendSpec(nmAdd, "");
    };
    btnFxClear.onClick = function () {
      fxSyncing = true;
      edEffects.text = "";
      fxSyncing = false;
      rebuildFxRows();
    };
    btnFxNoview.onClick = function () {
      alert(
        "Формат списка эффектов:\n\r" +
        "Deep Glow(Radius=25;Exposure=1.2), S_DropShadow(Distance=18;Size=20)\n\r" +
        "• Имя эффекта, в скобках свойства через «;».\n" +
        "• Имена свойств — как в Effect Controls (Radius, Exposure, Threshold, Distance, Size, Opacity, Glow Intensity...).\n" +
        "• Без скобок или с пустыми — настройки плагина по умолчанию.\n\r" +
        "После создания субтитров: если эффект или свойство не найдены (плагин не установлен / локаль AE),\n" +
        "панель покажет отчёт — а слой получит остальные параметры. Дефолт не уронит ничего.",
        SCRIPT_NAME + " — параметры эффектов"
      );
    };

    function fxAppendSpec(nm, params) {
      nm = trimStr(nm);
      params = trimStr(params);
      var specs = parseFxSpec(edEffects.text);
      var found = false;
      for (var i = 0; i < specs.length; i++) {
        if (specs[i].name === nm) { specs[i].params = params; found = true; break; }
      }
      if (!found) specs.push({ name: nm, params: params });
      fxSyncing = true;
      edEffects.text = fxSpecsToText(specs);
      fxSyncing = false;
      rebuildFxRows();
    }
    btnFxGSoft.onClick = function () { fxAppendSpec("Deep Glow", "Radius=18;Exposure=1.2"); };
    btnFxGHot.onClick = function () { fxAppendSpec("Deep Glow", "Radius=45;Exposure=2"); };
    btnFxShd.onClick = function () { fxAppendSpec("S_DropShadow", "Distance=16;Size=20;Opacity=55"); };
    btnFxGAE.onClick = function () { fxAppendSpec("Glow", "Glow Intensity=1.2;Glow Radius=25"); };

    /* --- снимок настроек: один формат для пресетов и автосохранения --- */
    function makeSnap() {
      return [
        edFont.text, edSize.text, edFade.text, edOffset.text,
        edSize2.text, edBottom2.text, edOffset2.text,
        "" + ddFill.selection.index, "" + ddStroke.selection.index, edStrokeW.text, chkStroke.value ? "1" : "0",
        edBottom.text, chkWrap.value ? "1" : "0", edWrap.text,
        "" + ddAnim.selection.index,
        chkWords.value ? "1" : "0", chkClean.value ? "1" : "0", chkFit.value ? "1" : "0",
        edMinDur.text, edGap.text, chkChain.value ? "1" : "0",
        edEffects.text,
        // v1.19.1: фон-полоса — в своих пресетах (старые 22-полевые
        // снимки остаются совместимы: поля всего 22 → галочка не трогается)
        chkBgBar.value ? "1" : "0",
        // v1.21: умный тайминг (старые снимки без поля — галочка не трогается)
        chkSmart.value ? "1" : "0",
        // v1.23: исчезание вниз
        chkOutDown.value ? "1" : "0"
      ].join("~");
    }
    function applySnap(snap) {
      var p = String(snap).split("~");
      if (p.length < 22) return false;
      function safeIdx(ctrl, txt) {
        var idx = parseInt(txt, 10);
        if (isNaN(idx) || idx < 0 || (ctrl.items && idx >= ctrl.items.length)) idx = 0;
        return idx;
      }
      try {
        edFont.text = p[0]; edSize.text = p[1]; edFade.text = p[2]; edOffset.text = p[3];
        edSize2.text = p[4]; edBottom2.text = p[5]; edOffset2.text = p[6];
        ddFill.selection = safeIdx(ddFill, p[7]);
        ddStroke.selection = safeIdx(ddStroke, p[8]);
        edStrokeW.text = p[9]; chkStroke.value = (p[10] === "1");
        edBottom.text = p[11]; chkWrap.value = (p[12] === "1"); edWrap.text = p[13];
        ddAnim.selection = safeIdx(ddAnim, p[14]);
        chkWords.value = (p[15] === "1"); chkClean.value = (p[16] === "1"); chkFit.value = (p[17] === "1");
        edMinDur.text = p[18]; edGap.text = p[19]; chkChain.value = (p[20] === "1");
        edEffects.text = p[21];
        if (p.length > 22) chkBgBar.value = (p[22] === "1"); // v1.19.1
        if (p.length > 23) chkSmart.value = (p[23] === "1"); // v1.21
        if (p.length > 24) chkOutDown.value = (p[24] === "1"); // v1.23
        try { rebuildFxRows(); } catch (eAS3) {}
      } catch (eAS1) { return false; }
      return true;
    }
    // автозапоминание ВСЕХ настроек панели (переживают перезапуск AE)
    function saveUiState() {
      try { savePref("uiState", makeSnap()); } catch (eSU1) {}
      try {
        if (ddDlThreads.selection !== null) savePref("uiDlThreads", "" + ddDlThreads.selection.index);
      } catch (eSU1b) {}
      // v1.18: караоке и словарь — отдельными prefs (makeSnap не трогаем)
      try { savePref("uiKaraoke", chkKaraoke.value ? "1" : "0"); } catch (eSU1c) {}
      try { savePref("uiPrompt", edPrompt.text); } catch (eSU1d) {}
      // v1.19: фон-подложка
      try { savePref("uiBgBar", chkBgBar.value ? "1" : "0"); } catch (eSU1e) {}
      // v1.22/v1.23: новые галочки ВИДЕО — отдельными prefs
      try { savePref("uiGloss", chkGloss.value ? "1" : "0"); } catch (eSU1f) {}
      try { savePref("uiFw", chkFw.value ? "1" : "0"); } catch (eSU1g) {}
      try { savePref("uiCut", chkCut.value ? "1" : "0"); } catch (eSU1h) {}
      try { savePref("uiLearn", chkLearn.value ? "1" : "0"); } catch (eSU1i) {}
      try { savePref("uiNotify", chkNotify.value ? "1" : "0"); } catch (eSU1j) {}
      try { savePref("uiShutdown", chkShutdown.value ? "1" : "0"); } catch (eSU1k) {}
    }

    function userPresetNames() {
      var s = loadPref("userPresetNames", "");
      return (s === "") ? [] : s.split("~~");
    }
    function refreshUserPresets() {
      var names = userPresetNames();
      ddUserPr.removeAll();
      ddUserPr.add("item", "(нет своих)");
      for (var i = 0; i < names.length; i++) ddUserPr.add("item", names[i]);
      ddUserPr.selection = 0;
    }
    btnPrSave.onClick = function () {
      var nm = prompt("Название своего пресета:", trimStr(edFont.text) + " " + edSize.text, "💾 Сохранить пресет");
      if (nm === null || trimStr(nm) === "") return;
      nm = trimStr(nm);
      savePref("userPreset_" + nm, makeSnap());
      var names = userPresetNames();
      var exists = false;
      for (var i2 = 0; i2 < names.length; i2++) if (names[i2] === nm) { exists = true; break; }
      if (!exists) names.push(nm);
      savePref("userPresetNames", names.join("~~"));
      refreshUserPresets();
      try { alert("Свой пресет «" + nm + "» сохранён.\n\rЭффекты: " + (trimStr(edEffects.text) === "" ? "(нет)" : edEffects.text) + "\n\rВыбери его в списке «Свой пресет» в любой момент.", SCRIPT_NAME); } catch (ePS1) {}
    };
    btnPrDel.onClick = function () {
      if (!ddUserPr.selection || ddUserPr.selection.index === 0) { alert("Сначала выбери свой пресет в списке.", SCRIPT_NAME); return; }
      var nm = ddUserPr.selection.text;
      savePref("userPreset_" + nm, "");
      var names = userPresetNames();
      var out = [];
      for (var i3 = 0; i3 < names.length; i3++) if (names[i3] !== nm) out.push(names[i3]);
      savePref("userPresetNames", out.join("~~"));
      refreshUserPresets();
    };
    ddUserPr.onChange = function () {
      if (!this.selection || this.selection.index === 0) return;
      var nm = this.selection.text;
      var snap = loadPref("userPreset_" + nm, "");
      if (snap === "") return;
      presetApplying = true;
      var okU = false;
      try { okU = applySnap(snap); } finally { presetApplying = false; }
      if (okU) {
        // свой пресет — это тоже «свой стиль»: подсветка встроенного снимается
        activePreset = "";
        try { savePref("activePreset", ""); } catch (eUP1) {}
        paintPresets();
        alert("Пресет «" + nm + "» применён: стиль + эффекты + тайминг.\n\rНажми «Создать субтитры».", SCRIPT_NAME);
      }
    };

    /* --- обмен пресетами: файл .txt (можно передать другу) --- */
    var gFx4 = panFx.add("group");
    gFx4.alignment = ["fill", "top"];
    var btnPrExp = gFx4.add("button", undefined, "⬆ Экспорт пресетов");
    try { btnPrExp.alignment = ["fill", "center"]; } catch (ePEa) {}
    paintGhost(btnPrExp);
    btnPrExp.helpTip = "Сохранить все свои пресеты в файл .txt — можно передать другу или перенести на другой компьютер.";
    var btnPrImp = gFx4.add("button", undefined, "⬇ Импорт пресетов");
    try { btnPrImp.alignment = ["fill", "center"]; } catch (ePIa) {}
    paintGhost(btnPrImp);
    btnPrImp.helpTip = "Добавить пресеты из файла .txt (созданного кнопкой «Экспорт»). Существующие пресеты с теми же именами обновятся.";

    btnPrExp.onClick = function () {
      var names = userPresetNames();
      if (names.length === 0) { alert("Своих пресетов пока нет — сначала «💾 Сохранить».", SCRIPT_NAME); return; }
      var fE = new File(File.saveDialog("Куда сохранить пресеты", "Пресеты Auto Subtitles:*.txt"));
      if (!fE) return;
      fE.encoding = "UTF-8";
      try { fE.lineFeed = "windows"; } catch (eLf1) {}
      if (!fE.open("w")) { alert("Не удалось записать файл.", SCRIPT_NAME); return; }
      for (var e1 = 0; e1 < names.length; e1++) {
        fE.writeln(names[e1] + "\t" + loadPref("userPreset_" + names[e1], ""));
      }
      fE.close();
      alert("Экспортировано пресетов: " + names.length + "\n\r" + fE.fsName, SCRIPT_NAME);
    };
    btnPrImp.onClick = function () {
      var fI = new File(File.openDialog("Файл пресетов (создан кнопкой «Экспорт»)", "Пресеты Auto Subtitles:*.txt"));
      if (!fI) return;
      fI.encoding = "UTF-8";
      if (!fI.open("r")) { alert("Не удалось открыть файл.", SCRIPT_NAME); return; }
      var body = "";
      try { body = fI.read(); } catch (eRd1) {}
      fI.close();
      var lines = body.split(/\r\n|\n/);
      var names = userPresetNames();
      var cntNew = 0, cntUpd = 0;
      for (var i1 = 0; i1 < lines.length; i1++) {
        var ln = lines[i1];
        if (trimStr(ln) === "") continue;
        var ti = ln.indexOf("\t");
        if (ti <= 0) continue;
        var nm = trimStr(ln.substring(0, ti));
        var snap = trimStr(ln.substring(ti + 1));
        if (nm === "" || snap === "") continue;
        savePref("userPreset_" + nm, snap);
        var ex = false;
        for (var i2 = 0; i2 < names.length; i2++) if (names[i2] === nm) { ex = true; break; }
        if (ex) cntUpd++; else { names.push(nm); cntNew++; }
      }
      if (names.length > 0) savePref("userPresetNames", names.join("~~"));
      refreshUserPresets();
      alert("Импорт завершён: новых " + cntNew + ", обновлено существующих " + cntUpd + ".", SCRIPT_NAME);
    };

    refreshUserPresets();
    // восстановление последних настроек панели после перезапуска AE
    try {
      presetApplying = true;
      var stUi = loadPref("uiState", "");
      if (stUi !== "") applySnap(stUi);
      var dlIx = parseInt(loadPref("uiDlThreads", "3"), 10);
      if (!isNaN(dlIx) && dlIx >= 0 && dlIx < ddDlThreads.items.length) ddDlThreads.selection = dlIx;
      // v1.18: караоке и словарь
      var kSv = loadPref("uiKaraoke", "");
      if (kSv !== "") { try { chkKaraoke.value = (kSv === "1"); } catch (eK1) {} }
      try { edPrompt.text = loadPref("uiPrompt", ""); } catch (eK2) {}
      // v1.19: фон-подложка
      var bSv = loadPref("uiBgBar", "");
      if (bSv !== "") { try { chkBgBar.value = (bSv === "1"); } catch (eK3) {} }
      // v1.22/v1.23: новые галочки ВИДЕО
      var gSv = loadPref("uiGloss", ""); if (gSv !== "") { try { chkGloss.value = (gSv === "1"); } catch (eK4) {} }
      var fwSv = loadPref("uiFw", ""); if (fwSv !== "") { try { chkFw.value = (fwSv === "1"); } catch (eK5) {} }
      var cutSv = loadPref("uiCut", ""); if (cutSv !== "") { try { chkCut.value = (cutSv === "1"); } catch (eK6) {} }
      var lnSv = loadPref("uiLearn", ""); if (lnSv !== "") { try { chkLearn.value = (lnSv === "1"); } catch (eK7) {} }
      var ntSv = loadPref("uiNotify", ""); if (ntSv !== "") { try { chkNotify.value = (ntSv === "1"); } catch (eK8) {} }
      var sdSv = loadPref("uiShutdown", ""); if (sdSv !== "") { try { chkShutdown.value = (sdSv === "1"); } catch (eK9) {} }
    } catch (eRst1) {} finally { presetApplying = false; }
    // v1.19.3: подсветка активного пресета (состояние — из prefs)
    try { paintPresets(); } catch (ePP1) {}

    /* --- логика --- */
    var fillCol = COLOR_VALUES["Белый"];
    var fill2Col = COLOR_VALUES["Жёлтый"];
    var strokeCol = COLOR_VALUES["Чёрный"];
    var currentFile = null;
    var currentFile2 = null;
    var currentVideo = null;
    var lastComp = null;

    function wireColorDD(dd, getCol, setCol) {
      dd.onChange = function () {
        var n = this.selection ? this.selection.text : null;
        if (n === "Другой...") {
          var c = pickColor(getCol());
          if (c) setCol(c);
        } else if (n && COLOR_VALUES[n]) {
          setCol(COLOR_VALUES[n]);
        }
      };
    }

    wireColorDD(ddFill, function () { return fillCol; }, function (c) { fillCol = c; });
    wireColorDD(ddFill2, function () { return fill2Col; }, function (c) { fill2Col = c; });
    wireColorDD(ddStroke, function () { return strokeCol; }, function (c) { strokeCol = c; });

    // v1.19.3: правка стиля вручную снимает подсветку пресета.
    // Цвета — цепочкой к существующим onChange (paint-логика сохраняется),
    // остальные поля стиля — напрямую. Программная установка значений из
    // пресета проходит без снятия (guard presetApplying в setPreset).
    function chainMarkCustom(ctrl) {
      var prev = ctrl.onChange;
      ctrl.onChange = function () {
        if (prev) { try { prev.apply(this, arguments); } catch (eCM1) {} }
        markCustom();
      };
    }
    chainMarkCustom(ddFill);
    chainMarkCustom(ddFill2);
    chainMarkCustom(ddStroke);
    var customFields = [edFont, edSize, edFade, edBottom, edStrokeW, edSize2, edBottom2,
                        edWrap, edOffset, edOffset2, ddAnim, chkStroke, chkWords, chkWrap, chkClean, chkFit];
    for (var cMF = 0; cMF < customFields.length; cMF++) {
      try { customFields[cMF].onChange = markCustom; } catch (eCM2) {}

    // v1.22: ближайший цвет из списка COLOR_NAMES (для «Снять стиль»)
    function nearestColorIdx(rgb) {
      var bestI = 0, bestD = Infinity;
      for (var nN = 0; nN < COLOR_NAMES.length; nN++) {
        var cv = COLOR_VALUES[COLOR_NAMES[nN]];
        if (!cv) continue;
        var dN = Math.pow(cv[0] - rgb[0], 2) + Math.pow(cv[1] - rgb[1], 2) + Math.pow(cv[2] - rgb[2], 2);
        if (dN < bestD) { bestD = dN; bestI = nN; }
      }
      return bestI;
    }

    // v1.22: «Снять стиль со слоя» — читает Source Text выбранного слоя
    btnGrabStyle.onClick = function () {
      try {
        var compG = getActiveComp();
        if (compG === null) { alert("Нет активной композиции. Открой комп с текстовым слоем.", SCRIPT_NAME); return; }
        var selG = null;
        try { if (compG.selectedLayers && compG.selectedLayers.length > 0) selG = compG.selectedLayers[0]; } catch (eG1) {}
        if (selG === null) { alert("Выбери в таймлайне текстовый слой — с него снимем стиль.", SCRIPT_NAME); return; }
        var tdG = null;
        try { tdG = selG.property("Source Text").value; } catch (eG2) {}
        if (tdG === null) { alert("На выбранном слое нет текста (Source Text) — это не текстовый слой.", SCRIPT_NAME); return; }
        // шрифт: семейство, если доступно (FontObject, AE 17+), иначе имя из td.font
        var famG = "";
        try { famG = String(tdG.fontObject.familyName); } catch (eG3) {}
        if (famG === "" || famG === "undefined" || famG === "null") { try { famG = String(tdG.font); } catch (eG4) {} }
        if (famG !== "" && famG !== "undefined" && famG !== "null") edFont.text = famG;
        try { var szG = Math.round(tdG.fontSize); if (szG > 2) edSize.text = "" + szG; } catch (eG5) {}
        try {
          if (tdG.applyFill) {
            var fcG = tdG.fillColor;
            ddFill.selection = nearestColorIdx(fcG);
            fillCol = [fcG[0], fcG[1], fcG[2]];
          }
        } catch (eG6) {}
        try {
          if (tdG.applyStroke) {
            chkStroke.value = true;
            var scG = tdG.strokeColor;
            ddStroke.selection = nearestColorIdx(scG);
            strokeCol = [scG[0], scG[1], scG[2]];
            var swG = Math.round(tdG.strokeWidth * 10) / 10;
            if (swG > 0) edStrokeW.text = "" + swG;
          } else {
            chkStroke.value = false;
          }
        } catch (eG7) {}
        try {
          var posG = selG.property("Position").value;
          var botG = Math.round(compG.height - posG[1]);
          if (botG >= 0) edBottom.text = "" + botG;
        } catch (eG8) {}
        try { if (typeof edFont.onChange === "function") edFont.onChange.call(edFont); } catch (eG9) {}
        alert("Стиль снят со слоя «" + selG.name + "»:\n\rшрифт " + edFont.text + ", размер " + edSize.text + ", отступ снизу " + edBottom.text + ".\n\rНажми «Создать субтитры».", SCRIPT_NAME);
      } catch (eG0) { alert("Не удалось снять стиль: " + eG0.toString(), SCRIPT_NAME); }
    };
    }

    chkDual.onClick = function () {
      btnFile2.enabled = this.value;
    };

    function srcLangCode() {
      return (ddSrcLang.selection && ddSrcLang.selection.index === 1) ? "en" : "ru";
    }

    function getWrapperPath() {
      var dir = getPanelFolder();
      return (dir !== "") ? (dir + "\\transcribe-video.ps1") : "";
    }

    function previewInto(slot, f) {
      var selEnc = (ddEnc.selection !== null) ? ddEnc.selection.text : "Авто";
      var enc = (selEnc === "Авто") ? detectEncoding(f.fsName) : selEnc;
      var cues = parseSubtitles(readText(f, enc));
      var label = truncateMid(f.fsName, 50) + "  (" + cues.length + ")";
      if (slot === 1) {
        currentFile = f;
        stFile.text = label;
        stFile.helpTip = f.fsName;
        stCount.text = "Субтитров: " + cues.length;
      } else {
        chkDual.value = true;
        btnFile2.enabled = true;
        currentFile2 = f;
        stFile2.text = label;
        stFile2.helpTip = f.fsName;
      }
      try { updateGuide(); } catch (eUG4) {}
      return cues;
    }

    btnVideo.onClick = function () {
      var f = File.openDialog("Выберите видеофайл (mp4/mov/avi...)");
      if (!f) return;
      currentVideo = f;
      stVideo.text = truncateMid(f.fsName, 52);
      stVideo.helpTip = f.fsName;
      savePref("lastFolder", folderOf(f));
      try { updateGuide(); } catch (eUG5) {}
    };

    btnMakeComp.onClick = function () {
      if (!currentVideo || !currentVideo.exists) {
        alert("Сначала выберите видеофайл.", SCRIPT_NAME);
        return;
      }
      try {
        app.beginUndoGroup("Auto Subtitles: комп с видео");
        try {
          lastComp = importVideoAsComp(currentVideo);
          ddDest.selection = 0; // "Активная" — использовать созданную комп
        } finally {
          app.endUndoGroup();
        }
      } catch (err) {
        try { app.endUndoGroup(); } catch (e2) {}
        alert("Ошибка:\n" + err.toString(), SCRIPT_NAME);
      }
    };

    btnWhisper.onClick = function () {
      try { saveUiState(); } catch (eSU3) {}
      if (!currentVideo || !currentVideo.exists) {
        alert("Сначала выберите видеофайл.", SCRIPT_NAME);
        return;
      }
      var wrapper = getWrapperPath();
      var wf = new File(wrapper);
      if (wrapper === "" || !wf.exists) {
        alert(
          "Не найден transcribe-video.ps1 рядом с панелью.\n\r" +
          "Скопируйте transcribe-video.ps1 и translate-srt.ps1 в папку:\n" +
          getPanelFolder(),
          SCRIPT_NAME
        );
        return;
      }

      var lang = srcLangCode();
      var model = (ddModel.selection !== null) ? ddModel.selection.text : "small";
      var second = (chkTrans2.value) ? (lang === "ru" ? "en" : "ru") : "";
      var dlThreads = dlThreadsVal();

      // v1.18: словарь-промпт — через UTF-8 файл (кириллица не ломается в
      // командной строке), караоке — ключ -Karaoke
      var promptFile = "";
      try {
        var pTxt = String(edPrompt.text || "");
        pTxt = pTxt.replace(/[\r\n]+/g, " ").replace(/"/g, " ");
        pTxt = trimStr(pTxt);
        if (pTxt !== "") {
          var pf = new File(Folder.temp.fsName + "\\AutoSubWhisper_prompt.txt");
          pf.encoding = "UTF-8";
          if (pf.open("w")) {
            pf.write("\uFEFF" + pTxt);
            pf.close();
            promptFile = pf.fsName;
          }
        }
      } catch (pFErr) { promptFile = ""; }
      var karaokeOn = (chkKaraoke && chkKaraoke.value) ? true : false;
      // v1.22: глоссарий перевода — файл <видео>.glossary.txt рядом с видео
      var glossFile = "";
      if (chkGloss.value) {
        try {
          var gfW = folderOf(currentVideo) + "\\" + baseNameOf(currentVideo) + ".glossary.txt";
          if (new File(gfW).exists) glossFile = gfW;
        } catch (eGl0) { glossFile = ""; }
      }
      // v1.23: СЛОВАРЬ УЧИТСЯ НА ПРАВКАХ — замены из редактора добавляются
      // в Словарь-промпт (правильные слова bias-ят Whisper)
      if (chkLearn.value) {
        try {
          var jW = loadPref("replJournal", "");
          if (jW !== "") {
            var learnsW = [], seenW = {};
            var partsW = jW.split("~~");
            for (var jw2 = 0; jw2 < partsW.length; jw2++) {
              var eqW = partsW[jw2].indexOf("=");
              if (eqW < 1) continue;
              var goodW = trimStr(partsW[jw2].substring(eqW + 1));
              if (goodW === "" || seenW[goodW.toLowerCase()]) continue;
              seenW[goodW.toLowerCase()] = true;
              learnsW.push(goodW);
            }
            if (learnsW.length > 0) {
              var pTxt2 = String(edPrompt.text || "");
              pTxt2 = pTxt2.replace(/[\r\n]+/g, " ").replace(/"/g, " ");
              pTxt2 = trimStr(pTxt2);
              var addW = learnsW.slice(0, 15).join(", ");
              edPrompt.text = trimStr((pTxt2 === "") ? addW : (pTxt2 + ", " + addW));
            }
          }
        } catch (eJl0) {}
      }

      var statusPath = Folder.temp.fsName + "\\AutoSubWhisper_status.txt";
      try {
        var sf = new File(statusPath);
        if (sf.open("w")) {
          sf.write("stage=START\r\nmsg=Whisper запускается...\r\n");
          sf.close();
        }
      } catch (wErr) {}

      try {
        launchWhisper(wrapper, currentVideo.fsName, lang, model, second, statusPath, dlThreads, promptFile, karaokeOn, glossFile, 0, 0, chkFw.value, chkCut.value, chkNotify.value);
      } catch (ex) {
        var bat = writeFallbackBat(buildPSLineDirect(wrapper, currentVideo.fsName, lang, model, second, statusPath, dlThreads, promptFile, karaokeOn, glossFile, 0, 0, chkFw.value, chkCut.value, chkNotify.value));
        var hint = (bat !== "") ? "\n\rЛибо вручную: двойной клик по файлу\n\r" + bat : "";
        alert("Не удалось запустить Whisper из скрипта." + hint + "\n\r" + ex.toString(), SCRIPT_NAME);
        return;
      }

      paintLabel(stWhisper, [0.6, 0.85, 1]);
      try { pbWhisper.value = 2; } catch (pErr) {}
      stWhisper.text = "Whisper запущен, ждём статус...";
      try { stWhisperLog.text = ""; } catch (logClearErr) {}

      startWhisperPolling(statusPath, pbWhisper, stWhisper, stWhisperLog, win, updateGuide);
      try { updateGuide(); } catch (eUG3) {}

      var exp1 = folderOf(currentVideo) + "\\" + baseNameOf(currentVideo) + "." + lang + ".srt";
      var exp2 = (second !== "") ? (folderOf(currentVideo) + "\\" + baseNameOf(currentVideo) + "." + second + ".srt") : "";
      alert(
        "Whisper запущен — открылось окно консоли.\n\r" +
        "(Окошко-лончер мог мигнуть и исчезнуть — это нормально.)\n\r" +
        "В консоли весь лог: качание модели, расшифровка; окно закроется само.\n\r" +
        "• Русская дорожка: " + truncateMid(exp1, 54) + "\n\r" +
        (exp2 !== "" ? "• Второй язык: " + truncateMid(exp2, 54) + "\n\r" : "") +
        (karaokeOn ? "• Караоке ВКЛ: рядом появится <имя>." + lang + ".kar.json — после него «Создать субтитры» нарисует подсветку слов.\n\r" : "") +
        (chkGloss.value ? (glossFile !== "" ? "• Глоссарий перевода: " + truncateMid(glossFile, 44) + "\n\r" : "• Глоссарий ВКЛ, но файла <видео>.glossary.txt нет — перевод без правок.\n\r") : "") +
        (promptFile !== "" ? "• Словарь передан: " + truncateMid(promptFile, 40) + "\n\r" : "") +
        "В панели тоже видно: «Качаю модель: N%» или «Распознаю речь: N%» + ETA.\n\r" +
        "Если что-то зависло — кнопка «Стоп» убивает процесс.",
        SCRIPT_NAME
      );
    };

    // v1.22: ПАКЕТ — папка видео, расшифровка по очереди в одном окне
    btnBatch.onClick = function () {
      try { saveUiState(); } catch (eSU4) {}
      var wrapperB = getWrapperPath();
      var wfB = new File(wrapperB);
      if (wrapperB === "" || !wfB.exists) { alert("Не найден transcribe-video.ps1 рядом с панелью.", SCRIPT_NAME); return; }
      var fdirB = Folder.selectDialog("Папка с видео для пакетной расшифровки");
      if (!fdirB) return;
      var extsB = { mp4: 1, mov: 1, avi: 1, mkv: 1, m4v: 1, webm: 1 };
      var vidsB = [];
      var allB = fdirB.getFiles();
      for (var ib = 0; ib < allB.length; ib++) {
        var fb = allB[ib];
        if (!(fb instanceof File)) continue;
        var nmb = String(fb.name);
        var dotb = nmb.lastIndexOf(".");
        var extb = (dotb >= 0) ? nmb.substring(dotb + 1).toLowerCase() : "";
        if (extsB[extb]) vidsB.push(fb);
      }
      if (vidsB.length === 0) { alert("В папке нет видеофайлов (mp4/mov/avi/mkv/m4v/webm).", SCRIPT_NAME); return; }
      vidsB.sort(function (a, b) {
        var an = a.name.toLowerCase(), bn = b.name.toLowerCase();
        return (an < bn) ? -1 : ((an > bn) ? 1 : 0);
      });
      var langB = srcLangCode();
      var modelB = (ddModel.selection !== null) ? ddModel.selection.text : "small";
      var secondB = (chkTrans2.value) ? (langB === "ru" ? "en" : "ru") : "";
      if (!confirm("Найдено видео: " + vidsB.length + ".\n\rРасшифровать все по очереди?\n\rЯзык: " + langB + ", модель: " + modelB + (secondB !== "" ? ", +перевод на " + secondB : "") + ((chkKaraoke && chkKaraoke.value) ? ", караоке" : ""), SCRIPT_NAME, "Пакетная расшифровка")) return;
      var dlB = dlThreadsVal();
      var promptB = "";
      try {
        var pB = String(edPrompt.text || "");
        pB = pB.replace(/[\r\n]+/g, " ").replace(/"/g, " ");
        pB = trimStr(pB);
        if (pB !== "") {
          var pfB = new File(Folder.temp.fsName + "\\AutoSubWhisper_prompt.txt");
          pfB.encoding = "UTF-8";
          if (pfB.open("w")) { pfB.write("\uFEFF" + pB); pfB.close(); promptB = pfB.fsName; }
        }
      } catch (ePfB) { promptB = ""; }
      var karB = (chkKaraoke && chkKaraoke.value) ? true : false;
      var statusPathB = Folder.temp.fsName + "\\AutoSubWhisper_status.txt";
      try {
        var sfB = new File(statusPathB);
        if (sfB.open("w")) { sfB.write("stage=START\r\nmsg=Пакет: " + vidsB.length + " видео\r\n"); sfB.close(); }
      } catch (eSfB) {}
      var linesB = [];
      linesB.push("@echo off");
      linesB.push("chcp 65001 >nul");
      linesB.push("title AUTO SUBTITLES - BATCH (" + vidsB.length + ")");
      for (var jb = 0; jb < vidsB.length; jb++) {
        var vb = vidsB[jb];
        var glossB2 = "";
        try {
          var gfB = folderOf(vb) + "\\" + baseNameOf(vb) + ".glossary.txt";
          if (new File(gfB).exists) glossB2 = gfB;
        } catch (eGfB) {}
        linesB.push(buildPSLineDirect(wrapperB, vb.fsName, langB, modelB, secondB, statusPathB, dlB, promptB, karB, glossB2, jb + 1, vidsB.length, chkFw.value, chkCut.value, chkNotify.value));
      }
      // v1.23: выключение ПК после пакета (60 с на отмену shutdown /a)
      if (chkShutdown.value) {
        linesB.push("echo ПК выключится через 60 секунд. Отмена: Win+R, команда  shutdown /a");
        linesB.push("shutdown /s /t 60");
      }
      var batB = Folder.temp.fsName + "\\AutoSubWhisper_batch.bat";
      var batFileB = new File(batB);
      batFileB.encoding = "UTF-8";
      try {
        if (!batFileB.open("w")) throw new Error("нет доступа: " + batB);
        batFileB.write(linesB.join("\r\n") + "\r\n");
        batFileB.close();
      } catch (eBatB) {
        alert("Не удалось подготовить лончер пакета.\n\r" + eBatB.toString(), SCRIPT_NAME);
        return;
      }
      var startedB = false;
      try { startedB = batFileB.execute(); } catch (eExB) { startedB = false; }
      if (!startedB) { alert("AE не смог запустить пакетный лончер:\n\r" + batB, SCRIPT_NAME); return; }
      paintLabel(stWhisper, [0.6, 0.85, 1]);
      try { pbWhisper.value = 2; } catch (pB2) {}
      stWhisper.text = "Пакет запущен: " + vidsB.length + " видео по очереди...";
      try { stWhisperLog.text = ""; } catch (eLB0) {}
      startWhisperPolling(statusPathB, pbWhisper, stWhisper, stWhisperLog, win, updateGuide);
      alert("Пакет запущен: " + vidsB.length + " видео по очереди (одно консольное окно).\n\rСтатус в панели: [номер/всего] + проценты текущего ролика.\n\rГотовые SRT появятся рядом с каждым видео — потом «Загрузить SRT» на нужном.", SCRIPT_NAME);
    };

    // v1.23: WATCH — слежение за папкой (консоль само-приглашает новые видео)
    btnWatch.onClick = function () {
      try { saveUiState(); } catch (eSU5) {}
      var wrapperW = getWrapperPath();
      var wfW = new File(wrapperW);
      if (wrapperW === "" || !wfW.exists) { alert("Не найден transcribe-video.ps1 рядом с панелью.", SCRIPT_NAME); return; }
      var fdirW = Folder.selectDialog("Папка, за которой следить (новые видео расшифруются сами)");
      if (!fdirW) return;
      var langW = srcLangCode();
      var modelW = (ddModel.selection !== null) ? ddModel.selection.text : "small";
      var secondW = (chkTrans2.value) ? (langW === "ru" ? "en" : "ru") : "";
      var dlW = dlThreadsVal();
      var promptW = "";
      try {
        var pW = String(edPrompt.text || "");
        pW = pW.replace(/[\r\n]+/g, " ").replace(/"/g, " ");
        pW = trimStr(pW);
        if (pW !== "") {
          var pfW2 = new File(Folder.temp.fsName + "\\AutoSubWhisper_prompt.txt");
          pfW2.encoding = "UTF-8";
          if (pfW2.open("w")) { pfW2.write("\uFEFF" + pW); pfW2.close(); promptW = pfW2.fsName; }
        }
      } catch (ePfW) { promptW = ""; }
      var statusPathW = Folder.temp.fsName + "\\AutoSubWhisper_status.txt";
      try {
        var sfW = new File(statusPathW);
        if (sfW.open("w")) { sfW.write("stage=START\r\nmsg=Следим за папкой...\r\n"); sfW.close(); }
      } catch (eSfW) {}
      var wA = [];
      wA.push("@echo off");
      wA.push("chcp 65001 >nul");
      wA.push("title AUTO SUBTITLES - WATCH (" + fdirW.fsName + ")");
      var lineW = "powershell -NoProfile -ExecutionPolicy Bypass -File \"" + wrapperW +
        "\" -WatchFolder \"" + fdirW.fsName + "\" -Lang " + langW + " -Model " + modelW +
        " -StatusFile \"" + statusPathW + "\" -DlThreads " + dlW +
        (secondW !== "" ? " -SecondLang " + secondW : "") +
        (promptW !== "" ? " -PromptFile \"" + promptW + "\"" : "") +
        ((chkKaraoke && chkKaraoke.value) ? " -Karaoke" : "") +
        (chkCut.value ? " -CutGarbage" : "") +
        (chkFw.value ? " -FastWhisper" : "") +
        (chkNotify.value ? " -NotifyDone" : "") +
        " -NoWait";
      wA.push(lineW);
      var batW = Folder.temp.fsName + "\\AutoSubWhisper_watch.bat";
      var batFileW = new File(batW);
      batFileW.encoding = "UTF-8";
      try {
        if (!batFileW.open("w")) throw new Error("нет доступа: " + batW);
        batFileW.write(wA.join("\r\n") + "\r\n");
        batFileW.close();
      } catch (eBatW) { alert("Не удалось подготовить лончер слежения.\n\r" + eBatW.toString(), SCRIPT_NAME); return; }
      var startedW = false;
      try { startedW = batFileW.execute(); } catch (eExW) { startedW = false; }
      if (!startedW) { alert("AE не смог запустить слежение:\n\r" + batW, SCRIPT_NAME); return; }
      paintLabel(stWhisper, [0.6, 0.85, 1]);
      try { pbWhisper.value = 2; } catch (pW3) {}
      stWhisper.text = "Следим за папкой — кидай видео, расшифрую сам...";
      startWhisperPolling(statusPathW, pbWhisper, stWhisper, stWhisperLog, win, updateGuide);
      alert("Слежение запущено (одно консольное окно).\n\rКидай новые видео в папку — они расшифруются сами, SRT появится рядом.\n\rОкно консоли работает, пока его не закрыть.", SCRIPT_NAME);
    };

    // v1.24: ПРЕВЬЮ-РЕНДЕР 5 секунд — быстро посмотреть стиль на видео
    btnPreview.onClick = function () {
      try {
        var compP = getActiveComp();
        if (compP === null && lastComp && lastComp instanceof CompItem) compP = lastComp;
        if (compP === null) { alert("Нет активной композиции. Открой комп с субтитрами.", SCRIPT_NAME); return; }
        // старт — с позиции таймлайна (поставь CTI на интересный момент)
        var startP = compP.time;
        if (!(startP > 0) || startP >= compP.duration - 0.2) startP = 0;
        var durP = Math.min(5, compP.duration - startP);
        if (durP < 0.3) { alert("Композиция слишком короткая для превью.", SCRIPT_NAME); return; }
        // куда сохранять: рядом с видео, иначе в TEMP
        var dirP = (currentVideo && currentVideo.exists) ? folderOf(currentVideo) : Folder.temp.fsName;
        var baseP = (currentVideo && currentVideo.exists) ? baseNameOf(currentVideo) : compP.name;
        baseP = baseP.replace(/[\\\/:*?"<>|]/g, "_");
        // формат: H.264 (модуль есть в AE 22+) → .mp4; нет модуля — дефолтный Lossless → .avi
        var rqP = app.project.renderQueue;
        var rqItem = rqP.items.add(compP);
        var omP = rqItem.outputModule(1);
        var extP = "avi";
        try { omP.applyTemplate("H.264"); extP = "mp4"; } catch (eH1) {
          try { omP.applyTemplate("H264"); extP = "mp4"; } catch (eH2) {}
        }
        var fP = new File(dirP + "\\" + baseP + "_превью." + extP);
        var nP = 1;
        while (fP.exists && nP < 50) { fP = new File(dirP + "\\" + baseP + "_превью_" + nP + "." + extP); nP++; }
        try { omP.file = fP; } catch (eF0) { alert("Не удалось назначить файл вывода: " + eF0.toString(), SCRIPT_NAME); return; }
        try {
          rqItem.timeSpanStart = startP;
          rqItem.timeSpanDuration = durP;
        } catch (eT0) { alert("AE не дал задать диапазон рендера: " + eT0.toString(), SCRIPT_NAME); return; }
        alert("Рендерю превью: 5 сек с " + fmtSrtTime(startP) + "\n\r→ " + fP.fsName + "\n\rAE на время рендера подвиснет — это нормально.", SCRIPT_NAME);
        try {
          rqP.render();
        } catch (eR0) {
          alert("AE не смог отрендерить сам (особенность сборки).\n\rКомп уже в Render Queue — открой её (Window → Render Queue) и нажми Start.\n\r" + eR0.toString(), SCRIPT_NAME);
          return;
        }
        try { rqP.items.remove(rqItem); } catch (eRm0) {}
        if (fP.exists) {
          alert("Превью готово:\n\r" + fP.fsName + "\n\r(" + (Math.round(fP.length / 1048576 * 10) / 10) + " МБ" + (extP === "avi" ? " — AVI без сжатия, файл большой, это нормально" : "") + ")", SCRIPT_NAME);
        } else {
          alert("Рендер завершился, но файл не найден:\n\r" + fP.fsName + "\n\rСмотри ошибки в Render Queue.", SCRIPT_NAME);
        }
      } catch (ePv0) {
        alert("Ошибка превью-рендера: " + ePv0.toString(), SCRIPT_NAME);
      }
    };

    // v1.22: АУДИТ ГОТОВНОСТИ — чек-лист «что мешает прямо сейчас»
    btnAudit.onClick = function () {
      var rows = [];
      var okA = "[OK] ", noA = "[--] ";
      function addRow(okA2, txtA) { rows.push((okA2 ? okA : noA) + txtA); }
      var vidOk = (currentVideo && currentVideo.exists);
      addRow(vidOk, "видео выбрано" + (vidOk ? (": " + truncateMid(currentVideo.fsName, 44)) : " — кнопка «Выбрать видео…»"));
      var dirA = vidOk ? folderOf(currentVideo) : "";
      var baseA = vidOk ? baseNameOf(currentVideo) : "";
      var langA = srcLangCode();
      var secondA = (chkTrans2.value) ? (langA === "ru" ? "en" : "ru") : "";
      var wrapA = getWrapperPath();
      addRow((wrapA !== "" && new File(wrapA).exists), "transcribe-video.ps1 рядом с панелью");
      var ffA = false;
      try { ffA = (system.callSystem("cmd /c where ffmpeg") === 0); } catch (eAu1) {}
      addRow(ffA, "ffmpeg найден в системе");
      var whA = false;
      try { whA = (system.callSystem("cmd /c where whisper") === 0); } catch (eAu2) {}
      addRow(whA, "whisper найден в системе");
      var modelA = (ddModel.selection !== null) ? ddModel.selection.text : "small";
      var modelFileA = ({ tiny: "tiny.pt", base: "base.pt", small: "small.pt", medium: "medium.pt", large: "large-v3.pt", turbo: "large-v3-turbo.pt" })[modelA];
      var mfA = null;
      try {
        var xdgA = $.getenv("XDG_CACHE_HOME");
        var cacheDirA = (xdgA && xdgA !== "") ? (xdgA + "\\whisper") : ($.getenv("USERPROFILE") + "\\.cache\\whisper");
        mfA = new File(cacheDirA + "\\" + modelFileA);
        addRow(mfA.exists, "модель " + modelA + " в кэше (" + modelFileA + "; нет — скачается при первом запуске)");
      } catch (eAu3) { addRow(false, "модель " + modelA + " в кэше — не удалось проверить путь"); }
      var srtA = (vidOk) ? new File(dirA + "\\" + baseA + "." + langA + ".srt") : null;
      addRow(srtA !== null && srtA.exists, "SRT основной дорожки (" + langA + (srtA !== null && srtA.exists ? ")" : ") — нет, нужен «Whisper → SRT»"));
      if (secondA !== "") {
        var srt2A = (vidOk) ? new File(dirA + "\\" + baseA + "." + secondA + ".srt") : null;
        addRow(srt2A !== null && srt2A.exists, "SRT перевода (" + secondA + (srt2A !== null && srt2A.exists ? ")" : ") — нет"));
      }
      if (chkKaraoke.value) {
        var karA = (vidOk) ? new File(dirA + "\\" + baseA + "." + langA + ".kar.json") : null;
        addRow(karA !== null && karA.exists, "kar.json для караоке (создаётся «Whisper → SRT» с галочкой «Караоке»)");
      }
      if (chkGloss.value && vidOk) {
        var glA = new File(dirA + "\\" + baseA + ".glossary.txt");
        addRow(glA.exists, "файл глоссария (" + baseA + ".glossary.txt)");
      }
      var fwA = false;
      try { fwA = (system.callSystem("cmd /c where whisper-ctranslate2") === 0); } catch (eAu4) {}
      addRow(fwA, "whisper-ctranslate2 (ускоритель faster-whisper) — опционально, ставится: pip install whisper-ctranslate2");
      alert("ЧЕК-ЛИСТ готовности:\n\r\n\r" + rows.join("\n\r"), SCRIPT_NAME + " — аудит");
    };

    btnStop.onClick = function () {
      if (!confirm("Остановить Whisper сейчас?")) return;
      var st = $.global.AutoSubState;
      var pid = (st && st.pid > 0) ? st.pid : 0;
      try {
        if (pid > 0) {
          system.callSystem('cmd /c taskkill /PID ' + pid + ' /T /F');
        } else {
          system.callSystem('cmd /c taskkill /IM whisper.exe /F');
        }
      } catch (killErr) {}
      try {
        if (st && st.statusPath) {
          var fS = new File(st.statusPath);
          if (fS.open("w")) {
            fS.write("stage=STOP\r\nmsg=Остановлено кнопкой Стоп.\r\n");
            fS.close();
          }
        }
      } catch (stopSWE) {}
      if (!st) {
        try { pbWhisper.value = 0; } catch (p5Err) {}
        stWhisper.text = "Остановлено";
        paintLabel(stWhisper, STYLE.gray);
      }
    };

    btnResult.onClick = function () {
      if (!currentVideo) {
        alert("Сначала выберите видеофайл.", SCRIPT_NAME);
        return;
      }
      var dir = folderOf(currentVideo);
      var base = baseNameOf(currentVideo);
      var lang = srcLangCode();
      var second = (chkTrans2.value) ? (lang === "ru" ? "en" : "ru") : "";
      var found = 0;

      var f1 = new File(dir + "\\" + base + "." + lang + ".srt");
      if (f1.exists) { try { previewInto(1, f1); found++; } catch (e1) {} }

      if (second !== "") {
        var f2 = new File(dir + "\\" + base + "." + second + ".srt");
        if (f2.exists) { try { previewInto(2, f2); found++; } catch (e2) {} }
      }

      if (found === 0) {
        alert(
          "Готовые SRT в папке видео не найдены:\n\r" +
          dir + "\\" + base + "." + lang + ".srt" + "\n\r" +
          "Whisper ещё работает или файл называется иначе — выберите его кнопкой «Файл 1».",
          SCRIPT_NAME
        );
      } else {
        savePref("lastFolder", dir);
      }
    };

    btnLayer.onClick = function () {
      var compSel = getActiveComp();
      if (compSel === null) {
        alert("Нет активной композиции. Открой комп с видео в таймлайне.", SCRIPT_NAME);
        return;
      }
      var sel = null;
      try {
        if (compSel.selectedLayers && compSel.selectedLayers.length > 0) {
          sel = compSel.selectedLayers[0];
        }
      } catch (selErr) {}
      if (sel === null) {
        alert("Сначала выбери слой (mp4 или прекомпоз) в таймлайне — субтитры создадутся для него.", SCRIPT_NAME);
        return;
      }

      // Комп назначения = комп выбранного слоя (= активная комп)
      ddDest.selection = 0;

      // Исходник слоя (mp4) → SRT рядом с ним
      var srcFile = null;
      try {
        if (sel.source && sel.source.file && sel.source.file.fsName) {
          srcFile = sel.source.file;
        }
      } catch (srcErr0) {}
      if (srcFile && srcFile.exists) {
        var dirL = folderOf(srcFile);
        var baseL = baseNameOf(srcFile);
        var langL = srcLangCode();
        var secondL = (chkTrans2.value) ? (langL === "ru" ? "en" : "ru") : "";
        var f1L = new File(dirL + "\\" + baseL + "." + langL + ".srt");
        if (f1L.exists) {
          try { previewInto(1, f1L); savePref("lastFolder", dirL); } catch (pE1) {}
        } else {
          // Нет SRT — ВЕДЁМ ЦЕПОЧКУ САМИ: запускаем Whisper прямо по видео
          // выбранного слоя. После «ГОТОВО» пользователь нажимает кнопку
          // ещё раз — SRT уже будет, и субтитры создадутся.
          currentVideo = srcFile;
          try {
            btnWhisper.onClick();
          } catch (wRunErr) {}
          return;
        }
        if (secondL !== "") {
          var f2L = new File(dirL + "\\" + baseL + "." + secondL + ".srt");
          if (f2L.exists) { try { previewInto(2, f2L); } catch (pE2) {} }
        }
      } else if (!currentFile) {
        alert(
          "Слой не содержит исходный видео-файл (это прекомпоз), а файл SRT пока не выбран.\n\r" +
          "Выбери SRT кнопкой «Файл 1» — и нажми эту кнопку ещё раз: субтитры встанут в комп, где лежит слой.",
          SCRIPT_NAME
        );
        return;
      }

      // Сразу создаём субтитры (все настройки — как выставлены в панели)
      try { btnGo.onClick(); } catch (goErr) {}
    };

    /* --- редактор субтитров: отдельное окно, правка текста реплик --- */
    function openSrtEditor() {
      var ed = new Window("palette", "Auto Subtitles — редактор субтитров " + VERSION_STR, undefined, { resizeable: true });
      ed.orientation = "column";
      ed.alignChildren = ["fill", "top"];
      ed.spacing = 6;
      ed.margins = 10;
      paintPanel(ed, STYLE.bg);

      var gE1 = ed.add("group");
      gE1.add("statictext", undefined, "Дорожка:");
      var ddEd = gE1.add("dropdownlist", undefined, ["Файл 1 — RU", "Файл 2 — EN"]);
      ddEd.selection = 0;
      var stEdFile = gE1.add("statictext", undefined, "(файл не выбран)");
      stEdFile.characters = 46;
      paintLabel(stEdFile, STYLE.dim);
      // v1.22: пометка «читается быстро» (>20 символов в секунду)
      var chkCps = gE1.add("checkbox", undefined, "(!) быстрые");
      chkCps.value = false;
      chkCps.helpTip = "Пометить реплики, которые читаются быстрее 20 символов в секунду — в номере появится маркер «(!)».\n\rПравь тайминги таких реплик прицельно (клик — CTI прыгнет на неё), а не наугад.";

      var lst = ed.add("listbox", undefined, [], { numberOfColumns: 3, showHeaders: true, columnTitles: ["Реплика", "Время", "Текст"] });
      lst.alignment = ["fill", "top"];
      lst.preferredSize = [620, 240];

      var edTxt = ed.add("edittext", undefined, "", { multiline: true });
      edTxt.alignment = ["fill", "top"];
      edTxt.preferredSize = [620, 90];

      var gE2 = ed.add("group");
      gE2.add("statictext", undefined, "Правишь текст ниже — «Сохранить SRT» перепишет файл:");
      var gE3 = ed.add("group");
      var btnPrev = gE3.add("button", undefined, "◄ Пред");
      var btnNext = gE3.add("button", undefined, "След ►");
      var btnSaveE = gE3.add("button", undefined, "Сохранить SRT");
      paintButton(btnSaveE, STYLE.green);
      // v1.19.5: экспорт ASS с караоке «\k» — стиль из панели, файл рядом с SRT
      var btnAssE = gE3.add("button", undefined, "ASS (караоке)");
      paintButton(btnAssE, [0.99, 0.83, 0.3]);
      btnAssE.helpTip = "Экспорт .ass РЯДОМ с SRT: караоке-подсветка слов {\\k} по таймингам Whisper,\n\rцвета, шрифт и подложка/обводка — как настроено в панели. Открывается в VLC,\n\rDaVinci, Media Player Classic, Premiere (плагины).\n\rНужен файл <имя>.kar.json рядом с SRT — его создаёт Whisper с галочкой «Караоке».\n\rКараоке-теги пишутся для дорожки ФАЙЛ 1 (у перевода EN таймингов нет).";
      var btnCreateE = gE3.add("button", undefined, "➤ Создать субтитры");
      paintButton(btnCreateE, STYLE.green);

      // v1.22: разделить / склеить реплику
      var gE3b = ed.add("group");
      var btnSplit = gE3b.add("button", undefined, "Разделить реплику");
      paintGhost(btnSplit);
      // v1.23: кнопки отмены/счётчика/таймкодов в ряду split/merge
      var btnUndo = gE3b.add("button", undefined, "Отменить");
      paintGhost(btnUndo);
      btnUndo.helpTip = "Отменить последнее действие редактора (разделить/склеить/заменить все) — до 20 шагов.\n\rНа сами слои в компе не влияет — только на текст реплик здесь.";
      var btnYtE = gE3b.add("button", undefined, "Таймкоды YouTube");
      paintGhost(btnYtE);
      btnYtE.helpTip = "Сохранить рядом с SRT файл <имя>.chapters.txt — строки «MM:SS текст» для главы в описании YouTube (первая метка — 00:00).";
      var stEdCount = gE3b.add("statictext", undefined, "");
      try { stEdCount.characters = 16; } catch (eCt0) {}
      paintLabel(stEdCount, STYLE.dim);
      edTxt.onChanging = function () {
        try {
          var tc = this.text.replace(/\s+/g, "");
          var tw = trimStr(this.text).split(/\s+/);
          stEdCount.text = tc.length + " симв. · " + ((trimStr(this.text) === "") ? 0 : tw.length) + " сл.";
        } catch (eCt1) {}
      };
      // v1.23: журнал правок для «Словарь учится на правках»
      eSt.undo = [];
      function pushUndo() {
        try {
          var snapU = [];
          for (var u = 0; u < eSt.cues.length; u++) {
            snapU.push({ start: eSt.cues[u].start, end: eSt.cues[u].end, text: eSt.cues[u].text });
          }
          eSt.undo.push(snapU);
          if (eSt.undo.length > 20) eSt.undo.shift();
        } catch (eU0) {}
      }
      btnUndo.onClick = function () {
        if (!eSt.undo || eSt.undo.length === 0) { alert("Нечего отменять.", SCRIPT_NAME); return; }
        eSt.cues = eSt.undo.pop();
        var keepU = Math.min(Math.max(eSt.sel, 0), eSt.cues.length - 1);
        loadEd();
        showCue(keepU);
      };
      btnYtE.onClick = function () {
        applyEdit();
        if (!eSt.file || !eSt.file.exists || eSt.cues.length === 0) { alert("Сначала выбери файл с репликами.", SCRIPT_NAME); return; }
        var outE = [];
        if (eSt.cues[0].start >= 10) outE.push("00:00 Начало");
        for (var iE = 0; iE < eSt.cues.length; iE++) {
          var tE = Math.floor(eSt.cues[iE].start);
          var mmE = Math.floor(tE / 60), ssE = tE % 60;
          outE.push(mmE + ":" + ((ssE < 10) ? "0" : "") + ssE + " " + eSt.cues[iE].text.replace(/\n/g, " "));
        }
        var fE = new File(eSt.file.fsName.replace(/\.[^.]*$/, "") + ".chapters.txt");
        fE.encoding = "UTF-8";
        try { fE.lineFeed = "windows"; } catch (eLfE) {}
        if (!fE.open("w")) { alert("Не удалось записать файл.", SCRIPT_NAME); return; }
        fE.write(outE.join("\n"));
        fE.close();
        alert("Таймкоды сохранены:\n\r" + fE.fsName + "\n\rСкопируй строки в описание YouTube (первая метка — 00:00).", SCRIPT_NAME);
      };

      btnSplit.helpTip = "Делит текущую реплику на две: по слову, ближайшему к середине текста; время делится пропорционально длине частей.\n\rПосле — «Сохранить SRT».";
      var btnMerge = gE3b.add("button", undefined, "Склеить с предыдущей");
      paintGhost(btnMerge);
      btnMerge.helpTip = "Объединяет текущую реплику с предыдущей: текст через пробел, время — от начала предыдущей до конца текущей.\n\rПосле — «Сохранить SRT».";

      var gE4 = ed.add("group");
      gE4.add("statictext", undefined, "Найти:");
      var edFind = gE4.add("edittext", undefined, ""); edFind.characters = 18;
      var btnFind = gE4.add("button", undefined, "Искать далее");
      paintButton(btnFind, [0.6, 0.9, 1]);
      btnFind.helpTip = "Найти реплику с этим текстом (регистр не важен). Ищет с текущей позиции списка и обходит весь список по кругу.";
      gE4.add("statictext", undefined, " → Заменить на:");
      var edRepl = gE4.add("edittext", undefined, ""); edRepl.characters = 14;
      var btnReplAll = gE4.add("button", undefined, "Заменить все");
      paintButton(btnReplAll, [1, 0.85, 0.4]);
      btnReplAll.helpTip = "Заменить ВСЕ вхождения «Найти» на текст «Заменить на» во всех репликах (регистр НЕ важен).\n\rНапример: «Шершер» → «Шершер betray» или чистка слов-паразитов. После — жми «Сохранить SRT».";

      var eSt = { file: null, cues: [], sel: -1 };

      function selFile() {
        return (ddEd.selection && ddEd.selection.index === 1) ? currentFile2 : currentFile;
      }

      function loadEd() {
        var f = selFile();
        // если файл ещё не выбран — авто-подхват SRT рядом с видео (как «Загрузить SRT»)
        if ((f === null || !f.exists) && currentVideo && currentVideo.exists) {
          var dirE = folderOf(currentVideo);
          var baseE = baseNameOf(currentVideo);
          var langE = srcLangCode();
          var nmE = (ddEd.selection && ddEd.selection.index === 1) ? (langE === "ru" ? "en" : "ru") : langE;
          f = new File(dirE + "\\" + baseE + "." + nmE + ".srt");
          if (f.exists) {
            if (ddEd.selection && ddEd.selection.index === 1) currentFile2 = f; else currentFile = f;
          }
        }
        eSt.file = f;
        eSt.cues = [];
        eSt.sel = -1;
        edTxt.text = "";
        lst.removeAll();
        stEdFile.text = (f && f.exists) ? truncateMid(f.fsName, 58) : "(файл SRT не выбран — «Файл 1/2» или «Загрузить SRT»)";
        if (!f || !f.exists) return;
        try {
          eSt.cues = parseSubtitles(readText(f.fsName, detectEncoding(f.fsName)));
        } catch (eP2) { eSt.cues = []; }
        for (var i = 0; i < eSt.cues.length; i++) {
          // v1.22: маркер «(!)» у реплик быстрее 20 симв/с (по галочке)
          var lblC = pad3(i + 1);
          if (chkCps.value) {
            var dC = eSt.cues[i].end - eSt.cues[i].start;
            var cC = eSt.cues[i].text.replace(/\s+/g, "").length;
            if (dC > 0.05 && (cC / dC) > 20) lblC += " (!)";
          }
          var it = lst.add("item", lblC);
          it.subItems[0].text = fmtSrtTime(eSt.cues[i].start) + " → " + fmtSrtTime(eSt.cues[i].end);
          it.subItems[1].text = truncateMid(eSt.cues[i].text.replace(/\n/g, " "), 64);
        }
        try { updateGuide(); } catch (eUG6) {}
      }

      function applyEdit() {
        var i = eSt.sel;
        if (i < 0 || i >= eSt.cues.length) return;
        var t = edTxt.text.replace(/\r\n/g, "\n").replace(/[\r]/g, "\n");
        if (t !== eSt.cues[i].text) {
          eSt.cues[i].text = t;
          lst.items[i].subItems[1].text = truncateMid(t.replace(/\n+/g, " "), 64);
        }
      }

      function showCue(i) {
        if (i < 0 || i >= eSt.cues.length) return;
        applyEdit();
        eSt.sel = i;
        try { lst.selection = lst.items[i]; } catch (lS2) {}
        edTxt.text = eSt.cues[i].text.replace(/\n/g, "\r");
      }

      lst.onChange = function () {
        if (lst.selection === null) return;
        applyEdit();
        eSt.sel = lst.selection.index;
        edTxt.text = eSt.cues[eSt.sel].text.replace(/\n/g, "\r");
        // v1.17: РЕПЛИКА ↔ CTI — CTI активного компа прыгает на старт реплики
        try {
          var compE = getActiveComp();
          if (compE !== null && compE instanceof CompItem) {
            var tE = eSt.cues[eSt.sel].start;
            if (tE < 0) tE = 0;
            if (tE > compE.duration - 0.01) tE = Math.max(0, compE.duration - 0.01);
            compE.time = tE;
          }
        } catch (cE1) {}
      };

      // v1.17: двойной клик по реплике — выделить её слои субтитров в компе.
      // v1.19.2: сперва поиск по МЕТКЕ в комментарии слоя («AutoSub cue=N
      // track=RU», ставится при создании) — выделяются ВСЕ слои реплики:
      // база + ♪ + фон-полоса (а в «по одному слову» — все слова разом).
      // Поиск по имени не работал при караоке и «по-слову» (нумерация слоёв
      // там не равна номеру реплики). Для слоёв старых версий — fallback
      // по имени, как раньше.
      lst.onDoubleClick = function () {
        if (eSt.sel < 0 || eSt.sel >= eSt.cues.length) return;
        var compD = getActiveComp();
        if (compD === null || !(compD instanceof CompItem)) return;
        var lblD = (ddEd.selection && ddEd.selection.index === 1) ? "EN" : "RU";
        var nD = eSt.sel + 1;
        var markD = "AutoSub cue=" + nD + " track=" + lblD;
        var hits = [];
        var iL, lrD;

        for (iL = 1; iL <= compD.layers.length; iL++) {
          lrD = compD.layer(iL);
          var isM = false;
          try { isM = (String(lrD.comment).indexOf(markD) === 0); } catch (cD1) {}
          if (isM) hits.push(lrD);
        }
        if (hits.length === 0) {
          // слои без метки (созданы до v1.19.2) — прежний поиск по имени
          var nmD = lblD + " " + pad3(nD) + ":";
          for (iL = 1; iL <= compD.layers.length; iL++) {
            lrD = compD.layer(iL);
            var isN = false;
            try { isN = (lrD.name.indexOf(nmD) === 0); } catch (nD1) {}
            if (isN) hits.push(lrD);
          }
        }

        for (iL = 1; iL <= compD.layers.length; iL++) {
          try { compD.layer(iL).selected = false; } catch (sD1) {}
        }
        for (var hD = 0; hD < hits.length; hD++) {
          try { hits[hD].selected = true; } catch (sD2) {}
        }
        if (hits.length === 0) {
          alert(
            "Слои реплики " + nD + " (" + lblD + ") в активном компе не найдены.\n\r" +
            "Субтитры созданы старой версией панели или удалены.\n\r" +
            "Пересоздай («Создать субтитры» с галочкой «Стереть прежние») —\n\r" +
            "тогда двойной клик выделяет сразу все слои реплики (база + ♪ + фон).",
            SCRIPT_NAME
          );
        }
      };

      btnPrev.onClick = function () { if (eSt.sel > 0) showCue(eSt.sel - 1); };
      btnNext.onClick = function () { showCue(eSt.sel + 1); };

      // v1.22: галочка «быстрые» перерисовывает список с маркерами «(!)»
      chkCps.onChange = function () {
        var keepC = eSt.sel;
        loadEd();
        if (keepC >= 0 && keepC < lst.items.length) {
          try { lst.selection = lst.items[keepC]; } catch (eCC0) {}
        }
      };

      // v1.22: РАЗДЕЛИТЬ / СКЛЕИТЬ реплику
      btnSplit.onClick = function () {
        applyEdit();
        pushUndo();
        var i = eSt.sel;
        if (i < 0 || i >= eSt.cues.length) { alert("Сначала выбери реплику в списке.", SCRIPT_NAME); return; }
        var t = eSt.cues[i].text.replace(/\s+/g, " ");
        var words = trimStr(t).split(" ");
        if (words.length < 2) { alert("Нечего делить — в реплике одно слово.", SCRIPT_NAME); return; }
        var total = t.replace(/\s+/g, "").length;
        var acc = 0, cut = 1, best = Infinity;
        for (var w = 0; w < words.length - 1; w++) {
          acc += words[w].length + 1;
          var d = Math.abs(total / 2 - acc);
          if (d < best) { best = d; cut = w + 1; }
        }
        var left = words.slice(0, cut).join(" ");
        var right = words.slice(cut).join(" ");
        var lc = left.replace(/\s+/g, "").length, rc = right.replace(/\s+/g, "").length;
        var d0 = eSt.cues[i].end - eSt.cues[i].start;
        var mid = eSt.cues[i].start + d0 * (lc / Math.max(1, lc + rc));
        var keepStart = eSt.cues[i].start, keepEnd = eSt.cues[i].end;
        eSt.cues.splice(i, 1,
          { start: keepStart, end: mid, text: left },
          { start: mid, end: keepEnd, text: right });
        var keepSel = i;
        loadEd();
        showCue(keepSel);
      };
      btnMerge.onClick = function () {
        applyEdit();
        pushUndo();
        var i = eSt.sel;
        if (i < 0 || i >= eSt.cues.length) { alert("Сначала выбери реплику в списке.", SCRIPT_NAME); return; }
        if (i === 0) { alert("Некуда склеивать — это первая реплика.", SCRIPT_NAME); return; }
        var a = eSt.cues[i - 1], b = eSt.cues[i];
        a.text = trimStr(a.text + " " + b.text);
        a.end = b.end;
        eSt.cues.splice(i, 1);
        var keepSel = i - 1;
        loadEd();
        showCue(keepSel);
      };

      btnFind.onClick = function () {
        var q = edFind.text.toLowerCase();
        if (trimStr(q) === "") return;
        if (eSt.cues.length === 0) return;
        var fromI = eSt.sel + 1;
        for (var s1 = fromI; s1 < eSt.cues.length; s1++) {
          if (eSt.cues[s1].text.toLowerCase().indexOf(q) >= 0) { showCue(s1); return; }
        }
        for (var s2 = 0; s2 < fromI; s2++) {
          if (eSt.cues[s2].text.toLowerCase().indexOf(q) >= 0) { showCue(s2); return; }
        }
        alert("Не найдено: " + edFind.text, SCRIPT_NAME);
      };

      // v1.17: МАССОВАЯ ЗАМЕНА по всем репликам (регистр не важен)
      btnReplAll.onClick = function () {
        var qR = edFind.text;
        if (trimStr(qR) === "") {
          alert("Поле «Найти» пустое — напиши, что заменить.", SCRIPT_NAME);
          return;
        }
        if (eSt.cues.length === 0) return;
        applyEdit();
        pushUndo();
        var rR = edRepl.text;
        var qL = qR.toLowerCase();
        var cntR = 0;
        for (var iR = 0; iR < eSt.cues.length; iR++) {
          var origR = eSt.cues[iR].text;
          var lowR = origR.toLowerCase();
          var outR = "";
          var posR = 0;
          var hitR = lowR.indexOf(qL);
          var chR = false;
          while (hitR >= 0) {
            outR += origR.substring(posR, hitR) + rR;
            posR = hitR + qR.length;
            chR = true;
            cntR++;
            hitR = lowR.indexOf(qL, posR);
          }
          if (chR) {
            outR += origR.substring(posR);
            eSt.cues[iR].text = outR;
            lst.items[iR].subItems[1].text = truncateMid(outR.replace(/\n+/g, " "), 64);
            if (iR === eSt.sel) edTxt.text = outR.replace(/\n/g, "\r");
          }
        }
        // v1.23: журнал замен для «Словарь учится на правках» (до 50 пар)
        if (cntR > 0 && chkLearn.value && trimStr(rR) !== "") {
          try {
            var jR = loadPref("replJournal", "");
            var pairR = trimStr(qR) + "=" + trimStr(rR);
            var jListR = (jR === "") ? [] : jR.split("~~");
            var jFoundR = false;
            for (var jr = 0; jr < jListR.length; jr++) {
              if (jListR[jr] === pairR) { jFoundR = true; break; }
            }
            if (!jFoundR) {
              jListR.push(pairR);
              if (jListR.length > 50) jListR.shift();
              savePref("replJournal", jListR.join("~~"));
            }
          } catch (eJr) {}
        }
        alert(
          (cntR > 0) ? ("Заменено вхождений: " + cntR + ".\n\rНе забудь «Сохранить SRT», чтобы правка осталась и «Создать субтитры» взял новый текст.")
                     : "Вхождений не найдено: " + qR,
          SCRIPT_NAME
        );
      };

      btnSaveE.onClick = function () {
        applyEdit();
        if (!eSt.file || !eSt.file.exists) { alert("Файл не выбран или удалён.", SCRIPT_NAME); return; }
        if (eSt.cues.length === 0) { alert("В файле нет реплик.", SCRIPT_NAME); return; }
        var fW = new File(eSt.file.fsName);
        fW.encoding = "UTF-8";
        if (!fW.open("w")) { alert("Не удалось записать файл:\n\r" + fW.fsName, SCRIPT_NAME); return; }
        for (var i = 0; i < eSt.cues.length; i++) {
          fW.writeln("" + (i + 1));
          fW.writeln(fmtSrtTime(eSt.cues[i].start) + " --> " + fmtSrtTime(eSt.cues[i].end));
          fW.writeln(eSt.cues[i].text.replace(/\r\n/g, "\n").replace(/[\r]/g, "\n"));
          fW.writeln("");
        }
        fW.close();
        try { previewInto((ddEd.selection && ddEd.selection.index === 1) ? 2 : 1, eSt.file); } catch (piE2) {}
        alert("Сохранено:\n\r" + eSt.file.fsName + "\n\r(теперь «Создать субтитры» возьмёт правленный текст)", SCRIPT_NAME);
      };

      // v1.19.5: экспорт ASS — тот же стиль, что в панели, плюс «\k»-караоке
      btnAssE.onClick = function () {
        applyEdit();
        if (!eSt.file || !eSt.file.exists) { alert("Файл не выбран или удалён.", SCRIPT_NAME); return; }
        if (eSt.cues.length === 0) { alert("В файле нет реплик.", SCRIPT_NAME); return; }
        var isEnA = (ddEd.selection && ddEd.selection.index === 1);
        // kar-данные Whisper живут рядом с SRT ПЕРВОЙ дорожки (перевод — нет)
        var kfA = (!isEnA && /\.srt$/i.test(eSt.file.fsName)) ?
          new File(eSt.file.fsName.replace(/\.srt$/i, ".kar.json")) : null;
        var nA = eSt.cues.length;
        var rA = exportAssFile(eSt.file, eSt.cues, {
          font: (trimStr(edFont.text) !== "") ? trimStr(edFont.text) : "Arial",
          size: parseNumber(isEnA ? edSize2.text : edSize.text, 96),
          primary: (isEnA ? fill2Col : fillCol),
          karColor: [1, 0.88, 0.15],
          outlineColor: strokeCol,
          outlineW: chkStroke.value ? parseNumber(edStrokeW.text, 4) : 0,
          bgBar: chkBgBar.value,
          bottom: parseNumber(isEnA ? edBottom2.text : edBottom.text, 60),
          fadeSec: parseNumber(edFade.text, 0.15),
          playW: parseNumber(edW.text, 1920),
          playH: parseNumber(edH.text, 1080),
          karFile: kfA
        });
        if (!rA.ok) { alert("ASS не записан:\n\r" + rA.err, SCRIPT_NAME); return; }
        alert(
          "ASS сохранён:\n\r" + rA.path + "\n\r" +
          "Реплик: " + rA.all + ", с караоке-подсветкой: " + rA.kar +
          (rA.kar < rA.all ? "\n\r(без \\k остались реплики, слова которых не совпали с kar.json,\n\r либо kar-файла нет рядом с SRT «Файл 1»)" : "") +
          "\n\rОткрывай в VLC, DaVinci, Media Player Classic — подсветка слов будет \"живая\".",
          SCRIPT_NAME
        );
      };

      btnCreateE.onClick = function () {
        try { btnSaveE.onClick(); } catch (sE4) {}
        try { ed.hide(); } catch (hEd2) {}
        try { btnGo.onClick(); } catch (gE6) {}
      };

      ddEd.onChange = function () { loadEd(); };

      loadEd();
      ed.onResizing = ed.onResize = function () { this.layout.resize(); };
      ed.show();
    }

    btnEditor.onClick = function () {
      try { openSrtEditor(); } catch (edOpenE) {
        alert("Не удалось открыть редактор:\n" + edOpenE.toString(), SCRIPT_NAME);
      }
    };

    btnFile.onClick = function () {
      var startFolder = null;
      var savedFolder = loadPref("lastFolder", "");
      if (savedFolder !== "") {
        var sf = new Folder(savedFolder);
        if (sf.exists) startFolder = sf;
      }
      var f = File.openDialog("Выберите файл субтитров (.srt / .vtt)", startFolder, false);
      if (f) try { previewInto(1, f); savePref("lastFolder", folderOf(f)); } catch (err) {
        alert("Не удалось прочитать файл:\n" + err.toString(), SCRIPT_NAME);
      }
    };

    btnFile2.onClick = function () {
      var f = File.openDialog("Выберите файл субтитров (.srt / .vtt)");
      if (f) try { previewInto(2, f); } catch (err) {
        alert("Не удалось прочитать файл:\n" + err.toString(), SCRIPT_NAME);
      }
    };

    btnGo.onClick = function () {
      try { saveUiState(); } catch (eSU2) {}
      doImport({
        file: currentFile,
        file2: currentFile2,
        lastComp: lastComp,
        ddEnc: ddEnc,
        ddDest: ddDest,
        chkDual: chkDual,
        edW: edW, edH: edH, edFps: edFps,
        edFont: edFont, edSize: edSize,
        fillCol: fillCol, fill2Col: fill2Col,
        strokeCol: strokeCol,
        chkStroke: chkStroke, edStrokeW: edStrokeW,
        edBottom: edBottom,
        chkWrap: chkWrap, edWrap: edWrap,
        edFade: edFade,
        edOffset: edOffset, edOffset2: edOffset2,
        edSize2: edSize2, edBottom2: edBottom2,
        chkMarkers: chkMarkers, chkExtend: chkExtend,
        ddAnim: ddAnim, chkClean: chkClean, chkFit: chkFit, chkWords: chkWords,
        chkKaraoke: chkKaraoke, chkBgBar: chkBgBar,
        edMinDur: edMinDur, edGap: edGap, chkChain: chkChain, edEffects: edEffects,
        chkStutter: chkStutter, chkReplace: chkReplace, chkSmart: chkSmart,
        chkOutDown: chkOutDown, chkDedup: chkDedup,
        edRangeFrom: edRangeFrom, edRangeTo: edRangeTo,
        guide: updateGuide
      });
    };

    btnHelp.onClick = function () {
      alert(
        "КАК СДЕЛАТЬ СУБТИТРЫ ИЗ ВИДЕО\n" +
        "---------------------------------\n" +
        "1. Один раз: whisper/ffmpeg уже установлены на этом ПК.\n" +
        "\n" +
        "2. Блок «1 · ВИДЕО → SRT»: выберите видео, при желании\n" +
        "   «Комп с видео» — композиция с роликом; «Whisper → SRT» —\n" +
        "   расшифровка (проценты, время и ETA — в панели);\n" +
        "   «Загрузить SRT» — подхват готовых файлов.\n" +
        "\n" +
        "3. ВРЕМЯ РАБОТЫ (CPU): Whisper медленнее реального времени.\n" +
        "   Ориентир на CPU: small ≈40 мин на час видео, large ≈4-5 ч,\n" +
        "   turbo ≈1 ч. На твоей GPU (RTX 4060 Ti) всё быстрее в разы:\n" +
        "   small ≈3 мин/час, turbo ≈8-10, large ≈25-30.\n" +
        "   Для роликов Hunt оптимум small/turbo; large — максимум\n" +
        "   качества (первый запуск качает ~3 ГБ, надо подождать).\n" +
        "\n" +
        "4. Дорожки: файл 1 — RU (снизу, крупно), «Второй язык» +\n" +
        "   файл 2 — EN (мелко, сверху).\n" +
        "\n" +
        "5. Стиль: пресет в один клик (CapCut / TikTok / YouTube / Минимал)\n" +
        "   и фишки: чистка пунктуации, автоподгон под комп, анимация,\n" +
        "   «по одному слову», тайминг: «Мин. показ», «Пауза, кадр.»,\n" +
        "   «Вплотную» (субтитры без пауз, стык в стык), фон-полоса за\n" +
        "   текстом (читаемость на светлом видео, вкладка «Стиль»).\n" +
        "\n" +
        "6. «Создать субтитры» — фразы станут текстовыми слоями.\n" +
        "\n" +
        "Полезно:\n" +
        "   • рассинхрон — «Сдвиг» ±сек (у каждой дорожки свой);\n" +
        "   • кракозябры — кодировку windows-1251;\n" +
        "   • эффекты на ВСЕ текстовые слои — вкладка «Эффекты»:\n" +
        "     ПОИСК по всем установленным в AE (Deep Glow, Sapphire...);\n" +
        "     если эффект не установлен — скрипт не упадёт, покажет\n" +
        "     список не добавленных);\n" +
        "   • свои пресеты — «💾 Сохранить» во вкладке «Эффекты»:\n" +
        "     стиль + эффекты + тайминг, переживают перезапуск AE;\n" +
        "   • ПРИКРЕПИТЬ панель справа: открой через меню «Окно»\n" +
        "     (Auto Subtitles.jsx внизу списка) и потяни ярлык панели\n" +
        "     к правому краю AE до подсветки докинга, отпусти;\n" +
        "   • всё создаётся одной группой Undo (Ctrl+Z всё отменит).",
        SCRIPT_NAME + " — справка"
      );
    };

    win.onResizing = win.onResize = function () { this.layout.resize(); try { saveUiState(); } catch (eRz1) {} };

    // v1.20.1: ДИАГНОСТИКА КРАСКИ — пишет в %TEMP%\AutoSub_paint_probe.txt,
    // какие примитивы ScriptUI реально поддержал эта сборка (newPath/
    // fillPath/drawString/...). Если дизайн снова не виден — содержимое
    // файла покажет, чем ещё можно рисовать, не гадая.
    try {
      var probeF = new File(Folder.temp.fsName + "\\AutoSub_paint_probe.txt");
      if (probeF.open("w")) {
        var gp1 = stPresetHint.graphics;
        probeF.writeln("build=" + VERSION_STR + " " + ($.os || ""));
        probeF.writeln("newBrush=" + (typeof gp1.newBrush));
        probeF.writeln("newPen=" + (typeof gp1.newPen));
        probeF.writeln("newPath=" + (typeof gp1.newPath));
        probeF.writeln("rectPath=" + (typeof gp1.rectPath));
        probeF.writeln("fillPath=" + (typeof gp1.fillPath));
        probeF.writeln("drawString=" + (typeof gp1.drawString));
        probeF.writeln("measureString=" + (typeof gp1.measureString));
        probeF.writeln("drawImage=" + (typeof gp1.drawImage));
        probeF.close();
      }
    } catch (ePr1) {}

    if (win instanceof Window) {
      win.center();
      win.show();
    } else {
      win.layout.layout(true);
    }
    return win;
  }

  // ВКЛАДКА-ПАКЕТ: открывается через меню «Окно», thisObj здесь —
  // ДОКАБЕЛЬНАЯ панель AE. ВАЖНО: передаём именно thisObj, а не this —
  // внутри функции this указывает на глобальный объект сессии, из-за
  // чего контент панель уезжал в плавающее окно, а прикреплённый
  // таб оставался пустым (баг v1.13-v1.14.1).
  try {
    buildUI(thisObj);
  } catch (buildErr) {
    var msgB = "Auto Subtitles — ошибка построения панели:\n\r" + buildErr.toString() +
               "\n\r(строка " + (buildErr.line !== undefined ? buildErr.line : "?") + ")";
    try { alert(msgB, SCRIPT_NAME); } catch (eAB1) {}
    try {
      var errF = new File(Folder.temp.fsName + "\\AutoSub_panel_error.txt");
      errF.encoding = "UTF-8";
      if (errF.open("w")) {
        errF.writeln(buildErr.toString());
        errF.writeln("line: " + (buildErr.line !== undefined ? buildErr.line : "?"));
        errF.close();
      }
    } catch (eEF1) {}
  }

})(this);
