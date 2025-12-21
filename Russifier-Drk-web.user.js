// ==UserScript==
// @name            Russifier Drk WEB
// @namespace       https://github.com/Xanixsl/Russifier-Drk-WEB
// @version         1.0.2-pre
// @description     Русификатор интерфейса Darmoshark.cc
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

(function () {
    'use strict';

    /* ================= CONFIG ================= */
    const CONFIG = {
        ENABLED_KEY: 'drk_enabled',
        DEBUG: false
    };

    let isEnabled = localStorage.getItem(CONFIG.ENABLED_KEY) !== '0';

    const log = (...a) => CONFIG.DEBUG && console.log('[DRK-RU', new Date().toISOString() + ']', ...a);

    /* ================= DICTIONARY (external) ================= */
    // Base raw URL for files in the repository. Adjust if repository moves.
    const BASE_RAW = 'https://raw.githubusercontent.com/Xanixsl/Russifier-Drk-WEB/refs/heads/main';

    // DICT will be populated by fetched JSON
    let DICT = {};

    /* =================== Storage helpers =================== */
    function hasGMStorage() {
        return typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
    }

    async function getStoredValue(key) {
        try {
            if (hasGMStorage()) {
                const v = GM_getValue(key);
                if (v && typeof v.then === 'function') {
                    return await v;
                }
                return v === undefined ? null : v;
            }

            const local = localStorage.getItem(key);
            return local === null ? null : local;
        } catch (e) {
            log('getStoredValue error for', key, e);
            return null;
        }
    }

    async function setStoredValue(key, value) {
        try {
            if (hasGMStorage()) {
                const res = GM_setValue(key, value);
                if (res && typeof res.then === 'function') {
                    await res;
                }
                return true;
            }

            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            log('setStoredValue error for', key, e);
            return false;
        }
    }

    // Observer instance to track if it's running
    let observerInstance = null;

    // Helper: fetch resource via GM_xmlhttpRequest and return Promise
    function fetchResource(path) {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'function') {
                // Try fetch as fallback (may be blocked by CORS)
                fetch(path).then(r => {
                    if (!r.ok) throw new Error('Network response not ok');
                    return r.text();
                }).then(resolve).catch(reject);
                return;
            }

            GM_xmlhttpRequest({
                method: 'GET',
                url: path,
                onload: function (res) {
                    if (res.status >= 200 && res.status < 300) {
                        resolve(res.responseText);
                    } else {
                        reject(new Error('Status ' + res.status));
                    }
                },
                onerror: function (err) {
                    reject(err);
                }
            });
        });
    }

    // Load language JSON and optional CSS from repository, then continue
    async function loadResources() {
        const langFile = 'ru.json';
        const langPath = BASE_RAW + '/lang/' + langFile;
        const cssPathCandidates = [
            BASE_RAW + '/src/style.css',
            BASE_RAW + '/style.css'
        ];

        log('loadResources start', { langFile, langPath });

        // Load the language file and cache it
        const cacheKey = 'drk_lang_file_' + langFile;
        try {
            const cached = await getStoredValue(cacheKey);
            if (cached) {
                log('Found cached language file for', langFile, 'size', (cached.length || 0));
            } else {
                log('No cache for', langFile, 'fetching from network:', langPath);
                const txt = await fetchResource(langPath);
                await setStoredValue(cacheKey, txt);
                log('Cached language file:', langFile);
            }
        } catch (e) {
            log('Error loading/caching', langFile, e);
        }

        // Now load the current language into DICT
        let cached = await getStoredValue(cacheKey);
        if (!cached) {
            log('No cache for current language, fetching:', langPath);
            try {
                const txt = await fetchResource(langPath);
                await setStoredValue(cacheKey, txt);
                cached = txt;
                log('Fetched and cached current language file');
            } catch (e) {
                log('Failed to fetch current language file:', e);
                DICT = {};
                return;
            }
        }
        try {
            const data = JSON.parse(cached);
            DICT = data;
            log('Loaded current language from cache:', langFile);
        } catch (e) {
            log('Failed to parse current language JSON:', e);
            DICT = {};
        }

        // Try to fetch CSS (first candidate that succeeds)
        let cssText = null;
        for (const p of cssPathCandidates) {
            try {
                log('Attempting to fetch CSS candidate:', p);
                cssText = await fetchResource(p);
                if (cssText) {
                    log('Fetched external CSS from', p);
                    break;
                }
            } catch (e) {
                log('CSS candidate failed:', p, e);
            }
        }

        if (cssText) {
            try {
                const style = document.createElement('style');
                style.id = 'drk-russifier-external-css';
                style.textContent = cssText;
                (document.head || document.documentElement).appendChild(style);
                log('Injected external CSS');
            } catch (e) {
                log('Failed to inject CSS', e);
            }
        }

        log('loadResources end', { langFile, dictSize: Object.keys(DICT).length });
    }

    function translateTextNode(node) {
        const raw = node.nodeValue;
        if (!raw) return;

        const text = raw.trim();
        if (!text) return;

        const tr = DICT[text];
        if (tr && tr !== text) {
            log('translateTextNode: replacing', text, '->', tr);
            node.nodeValue = tr;
        } else if (!tr) {
            log('translateTextNode: no translation for', text);
        }
    }

    function translateAttributes(el) {
        ['title', 'placeholder', 'aria-label'].forEach(attr => {
            const v = el.getAttribute && el.getAttribute(attr);
            if (v && DICT[v]) {
                log('translateAttributes:', attr, v, '->', DICT[v]);
                el.setAttribute(attr, DICT[v]);
            } else if (v) {
                log('translateAttributes: no translation for attribute', attr, v);
            }
        });
    }

    function translateDeep(node) {
        if (!node) return;

        if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;

        translateAttributes(node);
        node.childNodes.forEach(child => {
            translateDeep(child);
        });
    }

    /* ================= 🔥 FIX FOR g-select-box ================= */
    function fixSelectBoxes() {
        document.querySelectorAll('.g-select-box span').forEach(span => {
            const t = span.textContent.trim();
            if (DICT[t] && DICT[t] !== t) {
                log('fixSelectBoxes: replacing', t, '->', DICT[t]);
                span.textContent = DICT[t];
            }
        });
    }

    /* ================= APPLY ================= */
    function applyTranslation() {
        if (!isEnabled) return;
        log('applyTranslation: starting');
        translateDeep(document.body);
        fixSelectBoxes();
        log('applyTranslation: finished');
    }

    /* ================= OBSERVER ================= */
    function initObserver() {
        if (observerInstance) {
            log('initObserver: observer already running');
            return;
        }

        const observer = new MutationObserver(mutations => {
            if (!isEnabled) return;

            mutations.forEach(m => {
                if (m.type === 'characterData') {
                    translateTextNode(m.target);
                }

                if (m.type === 'childList') {
                    m.addedNodes.forEach(n => translateDeep(n));
                }
            });

            fixSelectBoxes();
        });

        observer.observe(document.documentElement, {
            subtree: true,
            childList: true,
            characterData: true
        });

        observerInstance = observer;
        log('initObserver: started');
    }

    function createToggleButton() {
        const btn = document.createElement('div');
        btn.id = 'drk-translate-toggle';
        btn.textContent = '🌐';
        btn.title = 'Включить / выключить перевод';

        // Add enabled class if translation is on
        if (isEnabled) {
            btn.classList.add('enabled');
        }

        btn.onclick = () => {
            isEnabled = !isEnabled;
            localStorage.setItem(CONFIG.ENABLED_KEY, isEnabled ? '1' : '0');

            if (isEnabled) {
                btn.classList.add('enabled');
                applyTranslation();
                if (!observerInstance) {
                    initObserver();
                }
            } else {
                btn.classList.remove('enabled');
                location.reload();
            }

            log('Toggle clicked. New state isEnabled=', isEnabled);
        };

        document.body.appendChild(btn);
        log('createToggleButton: added toggle to DOM');
    }

    /* ================= INIT ================= */
    function init() {
        log('init: starting initialization');
        createToggleButton();
        // Load external resources (language JSON and CSS) first,
        // then apply translations and start observer if enabled.
        loadResources().then(() => {
            if (isEnabled) {
                applyTranslation();
                initObserver();
            }
            log('Russifier Drk WEB 1.0.2-pre loaded');
        }).catch(() => {
            // If resource loading failed, still try to apply what we have
            if (isEnabled) {
                applyTranslation();
                initObserver();
            }
            log('Russifier Drk WEB 1.0.2-pre loaded (resources failed)');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

