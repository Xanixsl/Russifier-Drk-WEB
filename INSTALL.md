# INSTALL / DEVELOPERS GUIDE

This document describes how to work on Russifier Drk WEB locally, test changes, and prepare releases.

## Repository layout (suggested)

- Russifier-Drk-web-v1.0.1.js — main userscript (tag per release)
- src/style.css — optional external stylesheet for UI tweaks
- lang/ru.json — external dictionary (merged into built-in one)

## Local development

1. Clone the repo:
   git clone https://github.com/Xanixsl/Russifier-Drk-WEB.git

2. Edit the userscript file and resources (src/style.css, lang/ru.json).

3. Testing in browser:
   - Option A: Use a local static server (e.g. "npx http-server" in the repo root) and point Tampermonkey to your local raw URL.
   - Option B: Paste the script directly into a new userscript in Tampermonkey/Violentmonkey and save.

4. Open https://www.darmoshark.cc and verify:
   - Globe button (🌐) appears and respects dark/light theme
   - Toggle on: Russian translations apply for visible nodes and dynamic content
   - Toggle off: page reload restores original language
   - External CSS and ru.json load without CORS errors (check console)

## Coding style and linting

- Keep header metadata consistent (name, namespace, version, updateURL, downloadURL, license)
- Use strict mode; avoid blocking operations at document-start
- Prefer small, focused helpers (Logger, Storage, Translator)
- Avoid translating script/style/noscript; guard against large text nodes

## Release process

1. Bump version in header and in CONFIG.VERSION
2. Commit changes
3. Tag the release (e.g. v1.0.1) and push a GitHub Release with compiled .js
4. Ensure updateURL/downloadURL point to the new raw path
5. Update README with current version and links

## Testing checklist

- Translation coverage for main menus and settings
- Attribute translations (title, placeholder, aria-label, alt)
- MutationObserver translates newly added nodes
- LocalStorage keys persist and restore state
- No console errors in normal flow

## Issue tracking and support

- Report bugs: https://github.com/Xanixsl/Russifier-Drk-WEB/issues
- Discussions: https://github.com/Xanixsl/Russifier-Drk-WEB/discussions
- Official site: https://russifier-drk.ru/
