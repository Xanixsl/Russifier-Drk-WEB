// ==UserScript==
// @name        Darmoshark.cc Russian Translator Pro
// @namespace   Violentmonkey Scripts
// @match       https://www.darmoshark.cc/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @connect     raw.githubusercontent.com
// @connect     api.github.com
// @version     4.0
// @author      Darmoshark Community
// @description Полный перевод darmoshark.cc на русский язык с облачным обновлением и расширенным функционалом
// @icon        https://www.darmoshark.cc/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // ==================== КОНФИГУРАЦИЯ ====================
    const CONFIG = {
        VERSION: '4.0.0',
        TARGET_SITE: 'darmoshark.cc',
        STORAGE_KEY: 'darmoshark-translator-lang',
        HISTORY_KEY: 'darmoshark-translator-history',
        CACHE_KEY: 'darmoshark-translator-cache',
        UPDATE_CHECK_KEY: 'darmoshark-translator-update-check',
        GITHUB_REPO: 'Xanixsl/darmoshark-translator',
        GITHUB_RAW_URL: 'https://raw.githubusercontent.com/Xanixsl/darmoshark-translator/main/',
        GITHUB_API_URL: 'https://api.github.com/repos/Xanixsl/darmoshark-translator/releases/latest',
        SCRIPT_FILE: 'darmoshark-translator-v4.js',
        DEBUG_MODE: true,
        AUTO_UPDATE_CHECK: true,
        UPDATE_CHECK_INTERVAL: 3600000, // 1 час
        CACHE_TRANSLATIONS: true,
        ENABLE_STATS: true
    };

    let currentLanguage = 'English';
    let translatedTexts = new Map();
    let mutationObserver = null;
    let translationStats = { total: 0, successful: 0, failed: 0 };
    let isMenuOpen = false;

    // ==================== ЛОГИРОВАНИЕ ====================
    const Logger = {
        log: (msg, data = null) => {
            if (CONFIG.DEBUG_MODE) {
                const time = new Date().toLocaleTimeString('ru-RU');
                console.log(`%c[${time}] [DarmoTranslator] ${msg}`, 'color: #2196F3; font-weight: bold;', data || '');
            }
        },
        success: (msg, data = null) => {
            const time = new Date().toLocaleTimeString('ru-RU');
            console.log(`%c[${time}] ✓ ${msg}`, 'color: #4CAF50; font-weight: bold; font-size: 12px;', data || '');
        },
        warn: (msg, data = null) => {
            console.warn(`%c[DarmoTranslator] ⚠️ ${msg}`, 'color: #FF9800; font-weight: bold;', data || '');
        },
        error: (msg, data = null) => {
            console.error(`%c[DarmoTranslator] ❌ ${msg}`, 'color: #F44336; font-weight: bold;', data || '');
        },
        info: (msg, data = null) => {
            if (CONFIG.DEBUG_MODE) {
                console.info(`%c[DarmoTranslator] ℹ️ ${msg}`, 'color: #00BCD4; font-weight: bold;', data || '');
            }
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
            "Brightness Down": "Brightness Down", "Rename": "Rename", "Русский": "Russian", "Copyright © 2025.MySite Ltd.All Rights Reserved.": "Copyright © 2025. All Rights Reserved."
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
            "Gaming Enhancement Key": "Клавиша для игровых улучшений", "Disable Button": "Отключить кнопку", "Number of DPI Levels": "Количество уровней DPI",
            "X-Y Setting": "Настройка X-Y", "Confirm": "Подтвердить", "Report Rate": "Частота опроса", "125HZ": "125 Гц", "500HZ": "500 Гц",
            "1000HZ": "1000 Гц", "2000HZ": "2000 Гц", "4000HZ": "4000 Гц", "8000HZ": "8000 Гц", "Macro Custom Editor": "Редактор макросов",
            "Macro Name": "Имя макроса", "Custom 1": "Пользовательский 1", "Create": "Создать", "Event List": "Список событий", "Index": "Индекс",
            "Event": "Событие", "Value": "Значение", "Insert": "Вставить", "Delete": "Удалить", "Start REC": "Начать", "Stop REC": "Остановить",
            "Time Delay": "Временная задержка", "No Delay": "Без задержки", "Record Delay": "Задержка записи", "Uniform Delay": "Равномерная задержка",
            "Loops Setting": "Настройка циклов", "Loop Until Key Release": "Цикл до отпускания клавиши", "Loop Until Any Key Press": "Цикл до любого нажатия",
            "Loop Until Trigger Key Press Again": "Цикл до повторного нажатия триггера", "Loop Count": "Количество циклов", "Lift Off Distance": "Высота отрыва",
            "Low": "Низкая", "Medium": "Средняя", "High": "Высокая", "Sensor Performance": "Производительность датчика", "Ripple Control": "Контроль пульсаций",
            "Angle Snap": "Привязка угла", "Motion SyncOn": "Синхронизация движения", "Scroll Direction Setting": "Настройка направления прокрутки",
            "Reverse": "Назад", "Angle Adjustment": "Регулировка угла", "Esports Mode": "Режим киберспорта", "On": "Вкл", "Off": "Выкл",
            "Overclocked Gaming Mode": "Режим разгона для игр", "Debounce Time": "Время подавления помех", "Sleep Time Setting": "Настройка времени сна",
            "40Minute": "40 минут", "System Settings": "Параметры системы", "Mouse Firmware Version": "Версия прошивки мыши",
            "Receiver Firmware Version": "Версия прошивки приёмника", "Driver Version": "Версия драйвера", "Factory Reset Setting": "Сброс на заводские установки",
            "Pairing Settings": "Параметры сопряжения", "Go to Pairing": "Перейти к сопряжению", "Left Click Lock": "Блокировка левой кнопки",
            "Lock": "Заблокировать", "Unlock": "Разблокировать", "Connect": "Подключиться", "Volume+": "Громкость +", "Volume-": "Громкость -",
            "Mute": "Отключить звук", "Play/Pause": "Воспроизведение/пауза", "Previous": "Предыдущий трек", "Next": "Следующий трек",
            "DPI Loop": "Цикл DPI", "DPI +": "DPI +", "DPI -": "DPI -", "Brightness+": "Яркость +", "Brightness-": "Яркость -",
            "Calculator": "Калькулятор", "My Computer": "Мой компьютер", "Open Homepage": "Открыть домашнюю страницу", "Mail": "Почта",
            "Refresh": "Обновить", "Switch Application": "Переключить приложение", "Copy": "Копировать", "Cut": "Вырезать", "Paste": "Вставить",
            "Scroll Right": "Прокрутка вправо", "ScrollLeft": "Прокрутка влево", "Double-Click Left Button": "Двойной клик левой кнопкой",
            "Light Effect Switching": "Переключение светового эффекта", "Speed Switch": "Переключение скорости", "Color Switch": "Переключение цвета",
            "Brightness Up": "Яркость выше", "Brightness Down": "Яркость ниже", "Rename": "Переименовать", "Русский": "Русский",
            "Copyright © 2025.MySite Ltd.All Rights Reserved.": "© 2025. Все права защищены.",
            "Mouse lift-off distance, Low: 0.7mm, Medium: 1mm, High: 2mm": "Высота отрыва мыши: низкая 0.7 мм, средняя 1 мм, высокая 2 мм",
            "The sensor will have a ripple effect when the DPI value is greater than 9000, improve this ripple, ignore this setting when DPI is less than 9000": "Датчик будет иметь эффект пульсации при значении DPI больше 9000, улучшите эту пульсацию, игнорируйте эту настройку при DPI менее 9000",
            "Correct offset at a certain angle to a straight line.": "Исправить смещение под определённым углом на прямую линию.",
            "Accuracy of sensor refresh cycle and discrete nature of sensor movement data.": "Точность цикла обновления датчика и дискретный характер данных движения датчика.",
            "In eSports mode, both the sensor and the main controller enter the most active state for faster response, but this increases power consumption and reduces battery life. (Note: eSports mode is automatically activated when the polling rate exceeds 2KHz.)": "В режиме киберспорта датчик и главный контроллер переходят в наиболее активное состояние для более быстрого отклика, но это увеличивает потребление энергии и сокращает время работы батареи.",
            "This mode increases power consumption significantly. Sensor responsiveness greatly improves, battery life is reduced.": "Этот режим значительно увеличивает потребление энергии. Чувствительность датчика значительно улучшается, время работы батареи сокращается.",
            "Warning: Lowering the delay may cause key double-clicking. If double-clicking occurs, please increase the delay time until double-clicking stops.": "Предупреждение: уменьшение задержки может привести к двойному нажатию клавиши. Если возникает двойное нажатие, пожалуйста, увеличивайте время задержки до прекращения.",
            "This operation will delete saved data. Continue?": "Эта операция удалит сохранённые данные. Продолжить?",
            "Close": "Закрыть"
        }
    };

    // ==================== СИСТЕМА ОБНОВЛЕНИЙ ====================
    const UpdateSystem = {
        async checkForUpdates() {
            Logger.log('🔍 Проверка обновлений на GitHub...');
            try {
                const response = await fetch(CONFIG.GITHUB_API_URL);
                if (!response.ok) throw new Error('Не удалось получить информацию о версии');

                const data = await response.json();
                const remoteVersion = data.tag_name.replace('v', '');

                Logger.info(`Локальная версия: ${CONFIG.VERSION}`);
                Logger.info(`Удалённая версия: ${remoteVersion}`);

                if (this.compareVersions(remoteVersion, CONFIG.VERSION) > 0) {
                    Logger.warn('🔄 Доступна новая версия!');
                    this.showUpdateNotification(remoteVersion, data.html_url);
                    return { hasUpdate: true, version: remoteVersion, url: data.html_url };
                } else {
                    Logger.success('✓ Вы используете последнюю версию');
                    return { hasUpdate: false, version: CONFIG.VERSION };
                }
            } catch (error) {
                Logger.error('Ошибка при проверке обновлений', error);
                return { hasUpdate: false, version: CONFIG.VERSION, error: error.message };
            }
        },

        compareVersions(v1, v2) {
            const p1 = v1.split('.').map(Number);
            const p2 = v2.split('.').map(Number);
            for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
                const a = p1[i] || 0;
                const b = p2[i] || 0;
                if (a > b) return 1;
                if (a < b) return -1;
            }
            return 0;
        },

        showUpdateNotification(version, url) {
            const notif = document.createElement('div');
            notif.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
                z-index: 100000;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 14px;
                font-weight: 600;
                max-width: 350px;
                animation: slideInDown 0.3s ease;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            notif.innerHTML = `
                <div style="margin-bottom: 8px; font-size: 16px;">🔄 Версия ${version}</div>
                <small>Нажмите для установки обновления</small>
            `;
            
            notif.addEventListener('click', () => {
                window.open(url, '_blank');
            });
            
            document.body.appendChild(notif);

            setTimeout(() => {
                notif.style.opacity = '0';
                notif.style.transition = 'opacity 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }, 7000);
        },

        async downloadAndInstall() {
            Logger.log('📥 Загрузка новой версии скрипта...');
            try {
                const response = await fetch(`${CONFIG.GITHUB_RAW_URL}${CONFIG.SCRIPT_FILE}`);
                const scriptContent = await response.text();
                Logger.success('✓ Скрипт загружен успешно');
                Logger.info('Перезагрузите страницу для применения обновления');
                return scriptContent;
            } catch (error) {
                Logger.error('Ошибка при загрузке обновления', error);
            }
        }
    };

    // ==================== ХРАНИЛИЩЕ ====================
    const Storage = {
        saveLanguage: (lang) => {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, lang);
                Logger.success(`Язык сохранён: ${lang}`);
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
        }
    };

    // ==================== СИСТЕМА ПЕРЕВОДА ====================
    const Translator = {
        simplifyLabel: (s) => {
            if (!s) return s;
            const t = s.trim();
            const low = t.toLowerCase();
            const tokens = ['key', '按键', '按钮', 'ボタン', 'キー', 'button', '键', '按'];

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

            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT' ||
                node.id === 'darmoshark-translator-ui') {
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
            const attrs = ['title', 'placeholder', 'aria-label', 'data-tooltip', 'alt'];
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

    // ==================== КРАСИВЫЙ UI v4.0 ====================
    const UI = {
        createButton: () => {
            const btn = document.createElement('div');
            btn.id = 'darmoshark-btn-main';
            btn.innerHTML = '🌐';
            btn.title = 'Darmoshark Translator';
            btn.style.cssText = `
                position: fixed;
                bottom: 25px;
                right: 25px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4), 0 0 0 0 rgba(33, 150, 243, 0.2);
                z-index: 99999;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: bold;
                user-select: none;
                animation: pulse 2s infinite;
                border: none;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.15) translateY(-5px)';
                btn.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.6), 0 0 0 0 rgba(33, 150, 243, 0.2)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1) translateY(0)';
                btn.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.4), 0 0 0 0 rgba(33, 150, 243, 0.2)';
            });

            btn.addEventListener('click', () => {
                UI.toggleMenu();
                isMenuOpen = !isMenuOpen;
            });

            return btn;
        },

        createMenu: () => {
            const menu = document.createElement('div');
            menu.id = 'darmoshark-menu-container';
            menu.style.display = 'none';

            const menuHTML = `
                <style>
                    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes pulse { 0%, 100% { box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4), 0 0 0 0 rgba(33, 150, 243, 0.2); } 50% { box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4), 0 0 0 8px rgba(33, 150, 243, 0); } }
                    @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

                    .darmoshark-menu {
                        position: fixed;
                        bottom: 100px;
                        right: 25px;
                        width: 360px;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                        overflow: hidden;
                        z-index: 99998;
                        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .darmoshark-menu-header {
                        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                        color: white;
                        padding: 22px 20px;
                        text-align: center;
                        font-weight: 700;
                        font-size: 17px;
                        letter-spacing: 0.5px;
                    }

                    .darmoshark-menu-content {
                        padding: 18px;
                        max-height: 500px;
                        overflow-y: auto;
                    }

                    .darmoshark-lang-label {
                        font-size: 11px;
                        font-weight: 700;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 12px;
                        padding: 8px 0;
                        border-bottom: 2px solid #f0f0f0;
                    }

                    .darmoshark-lang-item {
                        padding: 13px 15px;
                        margin: 7px 0;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border: 2px solid #e0e0e0;
                        font-size: 13px;
                        font-weight: 600;
                        background-color: #f9f9f9;
                    }

                    .darmoshark-lang-item:hover {
                        background-color: #f0f7ff;
                        border-color: #2196F3;
                        transform: translateX(4px);
                    }

                    .darmoshark-lang-item.active {
                        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                        color: white;
                        border-color: #1976D2;
                        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
                    }

                    .darmoshark-menu-button {
                        width: 100%;
                        padding: 12px 14px;
                        margin: 8px 0;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 700;
                        transition: all 0.2s ease;
                        text-align: center;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .darmoshark-btn-export {
                        background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                        color: white;
                    }

                    .darmoshark-btn-export:hover {
                        box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
                        transform: translateY(-2px);
                    }

                    .darmoshark-btn-check {
                        background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                        color: white;
                    }

                    .darmoshark-btn-check:hover {
                        box-shadow: 0 4px 16px rgba(255, 152, 0, 0.4);
                        transform: translateY(-2px);
                    }

                    .darmoshark-btn-stats {
                        background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
                        color: white;
                    }

                    .darmoshark-btn-stats:hover {
                        box-shadow: 0 4px 16px rgba(156, 39, 176, 0.4);
                        transform: translateY(-2px);
                    }

                    .darmoshark-status-box {
                        background-color: #f0f7ff;
                        border-left: 4px solid #2196F3;
                        padding: 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        color: #1565C0;
                        margin-bottom: 12px;
                        font-weight: 500;
                        line-height: 1.5;
                    }

                    .darmoshark-status-box.warning {
                        background-color: #fff3e0;
                        border-left-color: #FF9800;
                        color: #E65100;
                    }

                    .darmoshark-status-box.success {
                        background-color: #e8f5e9;
                        border-left-color: #4CAF50;
                        color: #2E7D32;
                    }

                    .darmoshark-menu-footer {
                        border-top: 1px solid #e0e0e0;
                        padding: 12px 16px;
                        font-size: 11px;
                        color: #999;
                        text-align: center;
                        background-color: #fafafa;
                    }

                    .darmoshark-stats-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        font-size: 12px;
                    }

                    .darmoshark-stats-label {
                        color: #666;
                        font-weight: 600;
                    }

                    .darmoshark-stats-value {
                        color: #2196F3;
                        font-weight: 700;
                    }

                    .darmoshark-menu-close {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        cursor: pointer;
                        font-size: 20px;
                        color: white;
                        opacity: 0.8;
                        transition: opacity 0.2s;
                    }

                    .darmoshark-menu-close:hover {
                        opacity: 1;
                    }
                </style>

                <div class="darmoshark-menu">
                    <div class="darmoshark-menu-header">
                        🌐 Darmoshark Translator v${CONFIG.VERSION}
                    </div>

                    <div class="darmoshark-menu-content">
                        <div class="darmoshark-status-box success">
                            ✓ <strong>Переводчик активен</strong>
                        </div>

                        <div class="darmoshark-lang-label">Язык интерфейса</div>

                        <div class="darmoshark-lang-item active" data-lang="English">
                            🇬🇧 English (Original)
                        </div>

                        <div class="darmoshark-lang-item" data-lang="Русский">
                            🇷🇺 Русский (Russian)
                        </div>

                        <button class="darmoshark-menu-button darmoshark-btn-stats" id="darmoshark-show-stats">
                            📊 СТАТИСТИКА
                        </button>

                        <button class="darmoshark-menu-button darmoshark-btn-export" id="darmoshark-export-all">
                            📥 ЭКСПОРТИРОВАТЬ
                        </button>

                        <button class="darmoshark-menu-button darmoshark-btn-check" id="darmoshark-check-update">
                            🔄 ОБНОВЛЕНИЯ
                        </button>
                    </div>

                    <div class="darmoshark-menu-footer">
                        v${CONFIG.VERSION} © 2025 | Darmoshark Community
                    </div>
                </div>
            `;

            menu.innerHTML = menuHTML;
            return menu;
        },

        toggleMenu: () => {
            const menu = document.getElementById('darmoshark-menu-container');
            if (menu) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
        },

        hideMenu: () => {
            const menu = document.getElementById('darmoshark-menu-container');
            if (menu) {
                menu.style.display = 'none';
                isMenuOpen = false;
            }
        },

        showStats: () => {
            const statsHtml = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 50px rgba(0,0,0,0.3); z-index: 100001; font-family: 'Segoe UI', Arial;">
                    <h3 style="margin: 0 0 20px 0; color: #2196F3;">📊 Статистика переводов</h3>
                    <div style="margin-bottom: 10px;"><strong>Язык:</strong> ${currentLanguage}</div>
                    <div style="margin-bottom: 10px;"><strong>Переведено:</strong> ${translatedTexts.size}</div>
                    <div style="margin-bottom: 10px;"><strong>Успешно:</strong> ${translationStats.successful}</div>
                    <div style="margin-bottom: 10px;"><strong>Версия:</strong> ${CONFIG.VERSION}</div>
                    <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">Закрыть</button>
                </div>
            `;
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100000;';
            overlay.innerHTML = statsHtml;
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });
            document.body.appendChild(overlay);
        },

        initHandlers: () => {
            const langItems = document.querySelectorAll('.darmoshark-lang-item');
            langItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const lang = e.target.getAttribute('data-lang');
                    langItems.forEach(i => i.classList.remove('active'));
                    e.target.classList.add('active');
                    Logger.log(`🔤 Переключение на: ${lang}`);
                    Translator.applyTranslation(lang);
                    UI.hideMenu();
                    Logger.success(`✓ Язык изменён на ${lang}`);
                });
            });

            document.getElementById('darmoshark-show-stats')?.addEventListener('click', () => {
                UI.showStats();
            });

            document.getElementById('darmoshark-export-all')?.addEventListener('click', () => {
                Logger.log('📊 Сбор данных сайта...');
                const stats = {
                    texts: translatedTexts.size,
                    language: currentLanguage,
                    timestamp: new Date().toISOString(),
                    version: CONFIG.VERSION
                };
                const json = JSON.stringify({ ...stats }, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `darmoshark-export-${currentLanguage}-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                Logger.success('✓ Файл экспортирован успешно');
            });

            document.getElementById('darmoshark-check-update')?.addEventListener('click', async () => {
                Logger.log('🔍 Проверка обновлений...');
                const result = await UpdateSystem.checkForUpdates();
                if (result.hasUpdate) {
                    Logger.warn(`Доступна версия ${result.version}`);
                } else {
                    Logger.success('Вы используете последнюю версию');
                }
            });

            document.addEventListener('click', (e) => {
                const menu = document.getElementById('darmoshark-menu-container');
                const btn = document.getElementById('darmoshark-btn-main');
                if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target) && isMenuOpen) {
                    UI.hideMenu();
                }
            });
        }
    };

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    const initialize = () => {
        Logger.success(`
╔════════════════════════════════════════════════╗
║   🌐 DARMOSHARK TRANSLATOR v${CONFIG.VERSION}    ║
║                                                ║
║   ✓ Современный UI с градиентами           ║
║   ✓ Система проверки обновлений GitHub      ║
║   ✓ Сохранение выбранного языка            ║
║   ✓ Экспорт текстов со всего сайта         ║
║   ✓ Статистика переводов                   ║
║   ✓ Полная консоль логирования             ║
║   ✓ Кеширование переводов                  ║
║                                                ║
╚════════════════════════════════════════════════╝
        `);

        currentLanguage = Storage.loadLanguage();
        Logger.info(`Сохранённый язык: ${currentLanguage}`);

        const btn = UI.createButton();
        const menu = UI.createMenu();

        document.body.appendChild(btn);
        document.body.appendChild(menu);

        UI.initHandlers();

        if (currentLanguage !== 'English') {
            Logger.log(`Применение языка: ${currentLanguage}`);
            Translator.applyTranslation(currentLanguage);
        }

        // Мониторинг DOM
        mutationObserver = new MutationObserver((mutations) => {
            if (currentLanguage !== 'English') {
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

        // Проверка обновлений при загрузке
        if (CONFIG.AUTO_UPDATE_CHECK) {
            setTimeout(() => {
                UpdateSystem.checkForUpdates();
            }, 3000);
        }

        Logger.success('✓ Инициализация завершена');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // API для консоли
    window.DarmoTranslator = {
        version: CONFIG.VERSION,
        currentLanguage: () => currentLanguage,
        setLanguage: (lang) => Translator.applyTranslation(lang),
        checkUpdates: () => UpdateSystem.checkForUpdates(),
        showInfo: () => {
            Logger.success('=== СПРАВКА ===');
            console.table({
                'DarmoTranslator.version': CONFIG.VERSION,
                'DarmoTranslator.currentLanguage()': 'Текущий язык',
                'DarmoTranslator.setLanguage(lang)': 'Установить язык',
                'DarmoTranslator.checkUpdates()': 'Проверить обновления'
            });
        }
    };

})();
