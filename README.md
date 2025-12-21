# 🚢 Russifier Drk WEB

![Header](https://github.com/user-attachments/assets/2b3c171e-d41f-4955-acac-7018a0685bbb) 

> **Russifier Drk WEB** — русификатор интерфейса сайта Darmoshark.cc  
> Автоматический перевод элементов управления, меню и текстов сайта на русский язык.

![Badge](https://hitscounter.dev/api/hit?url=https%3A%2F%2Fgithub.com%2FXanixsl%2FRussifier-Drk-WEB&label=Visits&icon=person-fill&color=%238c68cd)

[![Version](https://img.shields.io/github/v/release/Xanixsl/Russifier-Drk-WEB?include_prereleases&label=Beta%20Version&style=flat-square)](https://github.com/Xanixsl/Russifier-Drk-WEB/releases)
[![Downloads](https://img.shields.io/github/downloads/Xanixsl/Russifier-Drk-WEB/total.svg?label=Downloads&style=flat-square)](https://raw.githubusercontent.com/Xanixsl/Russifier-Drk-WEB/main/Russifier-Drk-web.user.js)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📋 Описание

Пользовательский скрипт для автоматического перевода интерфейса сайта Darmoshark.cc с английского на русский язык. Скрипт работает в браузере через менеджеры пользовательских скриптов (Violentmonkey, Tampermonkey).

---

## ✨ Основные функции

- **Автоматический перевод** при загрузке страницы
- **Кнопка переключатель** 🌐 для включения/выключения перевода
- **Кэширование словарей** в localStorage/GM-хранилище
- **Обработка динамического контента** через MutationObserver
- **Перевод атрибутов**: title, placeholder, aria-label
- **Специальные фиксы** для проблемных элементов (`.g-select-box`)

---

## 📥 Установка

### Требования
- Браузер с установленным менеджером пользовательских скриптов:
  - [Violentmonkey](https://violentmonkey.github.io/get-it/)
  - [Tampermonkey](https://www.tampermonkey.net/)
  - [Greasemonkey](https://www.greasespot.net/)

### Установка
1. Установите менеджер скриптов
2. **[Нажмите для установки скрипта](https://github.com/Xanixsl/Russifier-Drk-WEB/raw/refs/heads/main/Russifier-Drk-web.user.js)**
3. Подтвердите установку

### Использование
1. Откройте сайт [Darmoshark.cc](https://www.darmoshark.cc)
2. Нажмите кнопку 🌐 в правом нижнем углу для управления переводом
3. Состояние сохраняется между сессиями

---

## ⚙️ Технические детали

### Архитектура скрипта

#### 1. **Метаданные (UserScript Headers)**
```javascript
// ==UserScript==
// @name            Russifier Drk WEB
// @version         1.0.1-pre
// @description     Русификатор интерфейса Darmoshark.cc
// @match           https://www.darmoshark.cc/*
// @grant           GM_getValue, GM_setValue, GM_xmlhttpRequest
// @run-at          document-start
// ==/UserScript==
```

#### 2. **Конфигурация**
```javascript
const CONFIG = {
    ENABLED_KEY: 'drk_enabled',  // Ключ для хранения состояния
    DEBUG: false                 // Режим отладки
};

let isEnabled = localStorage.getItem(CONFIG.ENABLED_KEY) !== '0';
```

#### 3. **Загрузка ресурсов**
- **Словарь**: Загружается из `https://raw.githubusercontent.com/Xanixsl/Russifier-Drk-WEB/main/lang/ru.json`
- **Кэширование**: Словарь кэшируется в localStorage/GM-хранилище
- **CSS стили**: Опциональная загрузка внешних стилей

```javascript
async function loadResources() {
    // Загрузка и кэширование словаря
    const cacheKey = 'drk_lang_file_ru.json';
    let cached = await getStoredValue(cacheKey);
    
    if (!cached) {
        // Если нет в кэше - загружаем с GitHub
        const txt = await fetchResource(langPath);
        await setStoredValue(cacheKey, txt);
        cached = txt;
    }
    
    DICT = JSON.parse(cached); // Парсим в объект переводов
}
```

#### 4. **Система перевода**

##### Перевод текстовых узлов:
```javascript
function translateTextNode(node) {
    const text = node.nodeValue.trim();
    const tr = DICT[text]; // Ищем перевод в словаре
    
    if (tr && tr !== text) {
        node.nodeValue = tr; // Заменяем текст
    }
}
```

##### Перевод атрибутов:
```javascript
function translateAttributes(el) {
    ['title', 'placeholder', 'aria-label'].forEach(attr => {
        const v = el.getAttribute(attr);
        if (v && DICT[v]) {
            el.setAttribute(attr, DICT[v]);
        }
    });
}
```

#### 5. **Обработка динамического контента**

```javascript
// MutationObserver отслеживает изменения DOM
const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        if (m.type === 'characterData') {
            translateTextNode(m.target); // Изменения в тексте
        }
        if (m.type === 'childList') {
            m.addedNodes.forEach(n => translateDeep(n)); // Новые элементы
        }
    });
    
    fixSelectBoxes(); // Специальная обработка проблемных элементов
});

// Начинаем отслеживание
observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true
});
```

#### 6. **Специальные фиксы**

```javascript
/* ================= 🔥 FIX FOR g-select-box ================= */
function fixSelectBoxes() {
    // Обработка элементов с классом .g-select-box
    document.querySelectorAll('.g-select-box span').forEach(span => {
        const t = span.textContent.trim();
        if (DICT[t] && DICT[t] !== t) {
            span.textContent = DICT[t]; // Замена текста
        }
    });
}
```

#### 7. **Пользовательский интерфейс**

```javascript
function createToggleButton() {
    const btn = document.createElement('div');
    btn.id = 'drk-translate-toggle';
    btn.textContent = '🌐';
    btn.title = 'Включить / выключить перевод';
    
    btn.onclick = () => {
        isEnabled = !isEnabled;
        localStorage.setItem(CONFIG.ENABLED_KEY, isEnabled ? '1' : '0');
        
        if (isEnabled) {
            // Включение перевода
            applyTranslation();
            initObserver();
        } else {
            // Выключение - перезагрузка страницы
            location.reload();
        }
    };
    
    document.body.appendChild(btn);
}
```

#### 8. **Инициализация**

```javascript
function init() {
    createToggleButton(); // Создаем кнопку управления
    
    loadResources().then(() => {
        if (isEnabled) {
            applyTranslation(); // Применяем перевод
            initObserver();     // Запускаем отслеживание
        }
    });
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
```

### Работа со словарем

**Структура словаря (ru.json):**
```json
{
    "Home": "Главная",
    "Settings": "Настройки",
    "Reset": "Сброс",
    "Import": "Импорт",
    "Export": "Экспорт"
}
```

**Принцип работы:**
1. Скрипт ищет точное совпадение текста в словаре
2. При нахождении совпадения заменяет текст на перевод
3. Кэширует словарь для уменьшения сетевых запросов

### Механизм хранения данных

#### localStorage:
- `drk_enabled`: '1' (включен) или '0' (выключен)
- `drk_lang_file_ru.json`: кэшированный словарь переводов

#### GM API (если доступно):
```javascript
// Проверка доступности GM API
function hasGMStorage() {
    return typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
}

// Универсальные функции работы с хранилищем
async function getStoredValue(key) {
    if (hasGMStorage()) {
        return GM_getValue(key); // Используем GM API
    }
    return localStorage.getItem(key); // Fallback на localStorage
}
```

### Обработка ошибок и отладка

```javascript
const log = (...a) => CONFIG.DEBUG && console.log('[DRK-RU]', ...a);

// Примеры логирования:
log('loadResources start', { langFile: 'ru.json' });
log('translateTextNode: replacing', text, '->', tr);
log('Failed to fetch current language file:', e);
```

---

## 🐛 Известные ограничения

1. **Статические переводы**: Требуется точное совпадение текста со словарем
2. **Динамические элементы**: Некоторые элементы могут требовать ручной обработки
3. **Производительность**: При большом количестве элементов может быть заметна задержка
4. **Обновления сайта**: При изменении структуры сайта может потребоваться обновление скрипта

---

## 📄 Лицензия

MIT License - смотрите файл [LICENSE](LICENSE) для деталей.
