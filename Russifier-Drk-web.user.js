// ==UserScript==
// @name            Russifier Drk WEB
// @namespace       https://github.com/Xanixsl/Russifier-Drk-WEB
// @version         1.0.1
// @description     Полный русификатор интерфейса Darmoshark.cc для тёмных тем. Переключатель перевода «вкл/выкл» с загрузкой внешних словарей и стилей.
// @author          Xanix
// @match           https://www.darmoshark.cc/*
// @icon            https://www.darmoshark.cc/favicon.ico
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @run-at          document-start
// @homepage        https://russifier-drk.ru/
// @supportURL      https://github.com/Xanixsl/Russifier-Drk-WEB/issues
// @updateURL       https://github.com/Xanixsl/Russifier-Drk-WEB/raw/refs/heads/main/Russifier-Drk-web.user.js
// @downloadURL     https://github.com/Xanixsl/Russifier-Drk-WEB/raw/refs/heads/main/Russifier-Drk-web.user.js
// @license         MIT
// @licenseURL      https://opensource.org/licenses/MIT
// @contributionURL https://github.com/Xanixsl/Russifier-Drk-WEB/discussions
// ==/UserScript==

(function() {
    'use strict';

    // ==================== КОНФИГУРАЦИЯ ====================
    const CONFIG = {
        VERSION: '1.0.0-pre',
        TARGET_SITE: 'darmoshark.cc',
        STORAGE_KEY: 'darmoshark-translator-lang',
        STORAGE_TOGGLE_KEY: 'darmoshark-translator-enabled',
        DEBUG_MODE: true,
        EXTERNAL_CSS: 'https://raw.githubusercontent.com/Xanixsl/Russifier-Drk-WEB/main/src/style.css',
        EXTERNAL_RU_JSON: 'https://raw.githubusercontent.com/Xanixsl/Russifier-Drk-WEB/main/lang/ru.json'
    };

    let currentLanguage = 'English';
    let translatedTexts = new Map();
    let isEnabled = true; // по умолчанию включён

    // ==================== ЗАГРУЗКА ВНЕШНИХ РЕСУРСОВ ====================
    async function loadExternalResources() {
        try {
            if (CONFIG.EXTERNAL_CSS) {
                const res = await fetch(CONFIG.EXTERNAL_CSS);
                if (res.ok) {
                    const css = await res.text();
                    const style = document.createElement('style');
                    style.id = 'darmoshark-external-style';
                    style.textContent = css;
                    document.head.appendChild(style);
                }
            }

            if (CONFIG.EXTERNAL_RU_JSON) {
                const r = await fetch(CONFIG.EXTERNAL_RU_JSON);
                if (r.ok) {
                    const ru = await r.json();
                    if (ru && typeof ru === 'object') {
                        translations['Русский'] = Object.assign({}, translations['Русский'] || {}, ru);
                    }
                }
            }
        } catch (e) {
            Logger.error('Ошибка при загрузке внешних ресурсов', e);
        }
    }

    function detectDarkTheme() {
        try {
            if (document.querySelector('.theme-switch.dark')) return true;
            if (document.body.classList.contains('dark')) return true;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
        } catch (e) { /* ignore */ }
        return false;
    }

    function updatePlanetColor(btn) {
        const dark = detectDarkTheme();
        btn.style.color = dark ? '#fff' : '#000';
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.boxShadow = 'none';
    }

    let mutationObserver = null;
    let translationStats = { total: 0, successful: 0, failed: 0 };

    // ==================== ЛОГИРОВАНИЕ ====================
    const Logger = {
        log: (msg, data = null) => {
            if (!CONFIG.DEBUG_MODE) return;
            const time = new Date().toLocaleTimeString('ru-RU');
            console.log(`%c[${time}] [DarmoTranslator] ${msg}`,'color:#2196F3;font-weight:bold;',data||'');
        },
        success: (msg, data = null) => {
            const time = new Date().toLocaleTimeString('ru-RU');
            console.log(`%c[${time}] ✓ ${msg}`,'color:#4CAF50;font-weight:bold;font-size:12px;',data||'');
        },
        warn: (msg, data = null) => {
            console.warn(`%c[DarmoTranslator] ⚠️ ${msg}`,'color:#FF9800;font-weight:bold;',data||'');
        },
        error: (msg, data = null) => {
            console.error(`%c[DarmoTranslator] ❌ ${msg}`,'color:#F44336;font-weight:bold;',data||'');
        },
        info: (msg, data = null) => {
            if (!CONFIG.DEBUG_MODE) return;
            console.info(`%c[DarmoTranslator] ℹ️ ${msg}`,'color:#00BCD4;font-weight:bold;',data||'');
        }
    };

    // ==================== ВСТРОЕННЫЙ СЛОВАРЬ ====================
    const translations = {
        English: {
            "Home": "Home", "Key": "Key", "Pointer": "Pointer", "Macro": "Macro", "Function": "Function", "System": "System",
            "English": "English", "Dark theme": "Dark theme", "Light theme": "Light theme", "Config List": "Config List",
            "USBLink": "USB Link", "Fully Charged": "Fully Charged", "Reset": "Reset", "Export": "Export", "Import": "Import",
            "Mouse Key Settings": "Mouse Key Settings", "Customize Buttons": "Customize Buttons", "Key 1": "1", "Left Click": "Left Click",
            "Key 2": "2", "Right Click": "Right Click", "Key 3": "3", "Middle Click": "Middle Click", "Key 4": "4", "Forward": "Forward",
            "Key 5": "5", "Backward": "Backward", "On Roller": "On Roller (Up)", "Scroll Up": "Scroll Up", "Under Roller": "On Roller (Down)",
            "Scroll Down": "Scroll Down", "Key2": "2", "Basic Mouse Function": "Basic Mouse Function", "Sensitivity": "Sensitivity",
            "Multimedia Buttons": "Multimedia Buttons", "Macro Key": "Macro Key", "System Shortcut Key": "System Shortcut Key",
            "Lighting Switch": "Lighting Switch", "Keyboard Combination Key": "Keyboard Combination Key", "Settings": "Settings",
            "Gaming Enhancement Key": "Gaming Enhancement Key", "Disable Button": "Disable Button", "Number of DPI Levels": "Number of DPI Levels",
            "X-Y Setting": "X-Y Setting", "Confirm": "Confirm", "Report Rate": "Report Rate", "125HZ": "125 Hz", "500HZ": "500 Hz",
            "1000HZ": "1000 Hz", "2000HZ": "2000 Hz", "4000HZ": "4000 Hz", "8000HZ": "8000 Hz", "Macro Custom Editor": "Macro Custom Editor",
            "Macro Name": "Macro Name", "Custom 1": "Custom 1", "Create": "Create", "Event List": "Event List", "Index": "Index",
            "Event": "Event", "Value": "Value", "Insert": "Insert", "Delete": "Delete", "Start REC": "Start", "Stop REC": "Stop",
            "Time Delay": "Time Delay", "No Delay": "No Delay", "Record Delay": "Record Delay", "Uniform Delay": "Uniform Delay",
            "Loops Setting": "Loops Setting", "Loop Until Key Release": "Loop Until Key Release", "Loop Until Any Key Press": "Loop Until Any Key Press",
            "Loop Until Trigger Key Press Again": "Loop Until Trigger Key Press Again", "Loop Count": "Loop Count", "Lift Off Distance": "Lift Off Distance",
            "Low": "Low", "Medium": "Medium", "High": "High", "Sensor Performance": "Sensor Performance", "Ripple Control": "Ripple Control",
            "Angle Snap": "Angle Snap", "Motion SyncOn": "Motion Sync On", "Scroll Direction Setting": "Scroll Direction Setting", "Reverse": "Reverse",
            "Angle Adjustment": "Angle Adjustment", "Esports Mode": "Esports Mode", "On": "On", "Off": "Off", "Overclocked Gaming Mode": "Overclocked Gaming Mode",
            "Debounce Time": "Debounce Time", "Sleep Time Setting": "Sleep Time Setting", "40Minute": "40 Minutes", "System Settings": "System Settings",
            "Mouse Firmware Version": "Mouse Firmware Version", "Receiver Firmware Version": "Receiver Firmware Version", "Driver Version": "Driver Version",
            "Factory Reset Setting": "Factory Reset Setting", "Pairing Settings": "Pairing Settings", "Go to Pairing": "Go to Pairing",
            "Left Click Lock": "Left Click Lock", "Lock": "Lock", "Unlock": "Unlock", "Connect": "Connect", "Volume+": "Volume+", "Volume-": "Volume-",
            "Mute": "Mute", "Play/Pause": "Play/Pause", "Previous": "Previous Track", "Next": "Next Track", "DPI Loop": "DPI Loop", "DPI +": "DPI +",
            "DPI -": "DPI -", "Brightness+": "Brightness+", "Brightness-": "Brightness-", "Calculator": "Calculator", "My Computer": "My Computer",
            "Open Homepage": "Open Homepage", "Mail": "Mail", "Refresh": "Refresh", "Switch Application": "Switch Application", "Copy": "Copy",
            "Cut": "Cut", "Paste": "Paste", "Scroll Right": "Scroll Right", "ScrollLeft": "Scroll Left", "Double-Click Left Button": "Double-Click Left Button",
            "Light Effect Switching": "Light Effect Switching", "Speed Switch": "Speed Switch", "Color Switch": "Color Switch", "Brightness Up": "Brightness Up",
            "Brightness Down": "Brightness Down", "Rename": "Rename", "Русский": "Russian",
            "Copyright © 2025.MySite Ltd.All Rights Reserved.": "Copyright © 2025. All Rights Reserved. "
        },
        Русский: {
            "Home": "Главная", "Key": "Кнопки", "Pointer": "Указатель", "Macro": "Макросы", "Function": "Функции", "System": "Система",
            "English": "Русский", "Dark theme": "Тёмная тема", "Light theme": "Светлая тема", "Config List": "Список конфигураций",
            "USBLink": "USB подключение", "Fully Charged": "Полностью заряжено", "Reset": "Сброс", "Export": "Экспорт", "Import": "Импорт",
            "Mouse Key Settings": "Настройки кнопок мыши", "Customize Buttons": "Настройка кнопок", "Key 1": "1", "Left Click": "Левая кнопка",
            "Key 2": "2", "Right Click": "Правая кнопка", "Key 3": "3", "Middle Click": "Средняя кнопка", "Key 4": "4", "Forward": "Вперёд",
            "Key 5": "5", "Backward": "Назад", "On Roller": "Колесико вверх", "Scroll Up": "Колесико вверх", "Under Roller": "Колесико вниз",
            "Scroll Down": "Колесико вниз", "Key2": "2", "Basic Mouse Function": "Базовые функции мыши", "Sensitivity": "Чувствительность",
            "Multimedia Buttons": "Мультимедиа кнопки", "Macro Key": "Макро кнопка", "System Shortcut Key": "Системная горячая клавиша",
            "Lighting Switch": "Переключатель подсветки", "Keyboard Combination Key": "Комбинация клавиш", "Settings": "Настройки",
            "Gaming Enhancement Key": "Клавиша для игровых улучшений", "Disable Button": "Отключить кнопку", "Number of DPI Levels": "Слои DPI",
            "X-Y Setting": "Настройка X-Y", "Confirm": "Да", "Report Rate": "Частота опроса", "125HZ": "125 Гц", "500HZ": "500 Гц",
            "1000HZ": "1000 Гц", "2000HZ": "2000 Гц", "4000HZ": "4000 Гц", "8000HZ": "8000 Гц", "Macro Custom Editor": "Редактор макросов",
            "Macro Name": "Имя макроса", "Custom 1": "Пользовательский 1", "Create": "Создать", "Event List": "Список событий", "Index": "индекс",
            "Event": "Событие", "Value": "Значение", "Insert": "Вставить", "Delete": "Удалить", "Start REC": "Начать", "Stop REC": "Остановить",
            "Time Delay": "Временная задержка", "No Delay": "Без задержки", "Record Delay": "Задержка записи", "Uniform Delay": "Равномерная задержка",
            "Loops Setting": "Настройка циклов", "Loop Until Key Release": "Цикл до отпускания клавиши", "Loop Until Any Key Press": "Цикл до любого нажатия",
            "Loop Until Trigger Key Press Again": "Цикл до повторного нажатия триггера", "Loop Count": "Количество циклов", "Lift Off Distance": "Высота отрыва",
            "Low": "Низкая", "Medium": "Средняя", "High": "Высокая", "Sensor Performance": "Производительность датчика", "Ripple Control": "Контроль пульсаций",
            "Angle Snap": "Привязка угла", "Motion SyncOn": "Синхронизация движения", "Scroll Direction Setting": "Настройка направления прокрутки",
            "Reverse": "Назад", "Angle Adjustment": "Регулировка угла", "Esports Mode": "Режим киберспорта", "On": "Вкл", "Off": "Выкл",
            "Overclocked Gaming Mode": "Режим разгона для игр", "Debounce Time": "Время подавления помех", "Sleep Time Setting": "Настройка времени сна",
            "40Minute": "40 минут", "System Settings": "Параметры системы", "Mouse Firmware Version": "Версия мышки",
            "Receiver Firmware Version": "Версия донгла", "Driver Version": "Версия драйвера", "Factory Reset Setting": "Сброс до заводских настроек",
            "Pairing Settings": "Параметры сопряжения", "Go to Pairing": "Перейти к сопряжению", "Left Click Lock": "Блокировка левой кнопки",
            "Lock": "Вкл.", "Unlock": "Выкл.", "Connect": "Подключиться", "Volume+": "Громкость +", "Volume-": "Громкость -",
            "Mute": "Отключить звук", "Play/Pause": "Воспроизведение/пауза", "Previous": "Предыдущий трек", "Next": "Следующий трек",
            "DPI Loop": "Цикл DPI", "DPI +": "DPI +", "DPI -": "DPI -", "Brightness+": "Яркость +", "Brightness-": "Яркость -",
            "Calculator": "Калькулятор", "My Computer": "Мой компьютер", "Open Homepage": "Открыть домашнюю страницу", "Mail": "Почта",
            "Refresh": "Обновить", "Switch Application": "Переключить приложение", "Copy": "Копировать", "Cut": "Вырезать", "Paste": "Вставить",
            "Scroll Right": "Прокрутка вправо", "ScrollLeft": "Прокрутка влево", "Double-Click Left Button": "Двойной клик левой кнопкой",
            "Light Effect Switching": "Переключение светового эффекта", "Speed Switch": "Переключение скорости", "Color Switch": "Переключение цвета",
            "Brightness Up": "Яркость выше", "Brightness Down": "Яркость ниже", "Rename": "Переименовать", "Русский": "Русский",
            "Copyright © 2025.MySite Ltd.All Rights Reserved.": "© 2025. Все права защищены."
        }
    };

    // ==================== ХРАНИЛИЩЕ ====================
    const Storage = {
        saveLanguage: (lang) => {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, lang);
            } catch (e) {
                Logger.error('Ошибка при сохранении языка', e);
            }
        },
        loadLanguage: () => {
            try {
                const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
                return saved || 'English';
            } catch (e) {
                Logger.error('Ошибка при загрузке языка', e);
                return 'English';
            }
        },
        saveEnabled: (val) => {
            try {
                localStorage.setItem(CONFIG.STORAGE_TOGGLE_KEY, val ? '1' : '0');
            } catch (e) {
                Logger.error('Ошибка при сохранении состояния переключателя', e);
            }
        },
        loadEnabled: () => {
            try {
                const v = localStorage.getItem(CONFIG.STORAGE_TOGGLE_KEY);
                if (v === null) return true;
                return v === '1';
            } catch (e) {
                Logger.error('Ошибка при загрузке состояния переключателя', e);
                return true;
            }
        }
    };

    // ==================== СИСТЕМА ПЕРЕВОДА ====================
    const Translator = {
        simplifyLabel: (s) => {
            if (!s) return s;
            const t = s.trim();
            const low = t.toLowerCase();
            const tokens = ['key','按键','按钮','ボタン','キー','button','键','按'];
            for (let tok of tokens) {
                if (low.includes(tok)) {
                    const m = t.match(/(\d+)/);
                    if (m) return m[1];
                }
            }
            return t;
        },
        translateDOM: (node, dict) => {
            if (!node) return;
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT' || node.id === 'darmoshark-translator-ui') {
                return;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text && text.length > 0 && text.length < 500) {
                    const found = dict[text];
                    if (found) {
                        node.textContent = found;
                        translatedTexts.set(text, found);
                    } else {
                        const simplified = Translator.simplifyLabel(text);
                        if (simplified && simplified !== text) {
                            node.textContent = simplified;
                            translatedTexts.set(text, simplified);
                        }
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Translator.translateAttributes(node, dict);
                for (let child of node.childNodes) {
                    Translator.translateDOM(child, dict);
                }
            }
        },
        translateAttributes: (element, dict) => {
            const attrs = ['title','placeholder','aria-label','data-tooltip','alt'];
            attrs.forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && value.length > 0) {
                    const translated = dict[value] || Translator.simplifyLabel(value);
                    if (translated && translated !== value) {
                        element.setAttribute(attr, translated);
                        translatedTexts.set(`[${attr}] ${value}`, translated);
                    }
                }
            });
        },
        applyTranslation: (lang) => {
            const dict = translations[lang];
            if (!dict) {
                Logger.warn(`Словарь для "${lang}" не найден`);
                return;
            }
            Logger.log(`=== ПЕРЕВОД НА ${lang.toUpperCase()} ===`);
            translatedTexts.clear();
            Translator.translateDOM(document.body, dict);
            Logger.success(`Переведено: ${translatedTexts.size} элементов`);
            currentLanguage = lang;
            Storage.saveLanguage(lang);
        }
    };

    // ==================== МИНИМАЛЬНЫЙ UI: ТОЛЬКО КНОПКА-ПЛАНЕТА ====================
    const UI = {
        createButton: () => {
            const btn = document.createElement('div');
            btn.id = 'darmoshark-btn-main';
            btn.innerHTML = '🌐';
            btn.title = 'Перевод Darmoshark (вкл/выкл)';

            btn.addEventListener('click', () => {
                isEnabled = !isEnabled;
                Storage.saveEnabled(isEnabled);
                if (isEnabled) {
                    Logger.success('Перевод включён');
                    Translator.applyTranslation('Русский');
                } else {
                    Logger.success('Перевод выключен, оригинальный язык восстановлен');
                    location.reload();
                }
            });

            try {
                updatePlanetColor(btn);
                const themeObserver = new MutationObserver(() => updatePlanetColor(btn));
                themeObserver.observe(document.body, { attributes: true, subtree: true, childList: true });
            } catch (e) { /* ignore */ }

            return btn;
        }
    };

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    const initialize = async () => {
        await loadExternalResources();

        currentLanguage = Storage.loadLanguage();
        isEnabled = Storage.loadEnabled();
        Logger.info(`Сохранённый язык: ${currentLanguage}`);
        Logger.info(`Перевод включён: ${isEnabled}`);

        const btn = UI.createButton();
        document.body.appendChild(btn);

        if (isEnabled && currentLanguage !== 'English') {
            Translator.applyTranslation(currentLanguage);
        }

        mutationObserver = new MutationObserver((mutations) => {
            if (isEnabled && currentLanguage !== 'English') {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const dict = translations[currentLanguage];
                                Translator.translateDOM(node, dict);
                            }
                        });
                    }
                });
            }
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();


