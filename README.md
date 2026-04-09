# AI Chat Navigator v2.0

A universal conversation navigator sidebar for all major AI chat platforms — now with a sleek dark UI, token counter, keyboard shortcut customizer, and activate/deactivate toggle.

## What's New in v2.0
- **Dark monospace UI** — ChatSight-inspired design with per-platform accent colors
- **Token estimator** — Tracks total, user, and AI token counts live
- **Activate / Deactivate toggle** — Pause the navigator without closing it
- **Keyboard shortcut** — Default `Ctrl+Shift+M`, fully customizable in the sidebar
- **Prev / Next navigation** — Step through messages sequentially
- **Persistent state** — Remembers if you left the sidebar open, your active state, and your shortcut

## Supported Platforms
- **ChatGPT** (chatgpt.com)
- **Claude** (claude.ai)
- **Perplexity** (perplexity.ai)
- **Gemini** (gemini.google.com)
- **Grok** (grok.com / x.com)
- **Microsoft Copilot** (copilot.microsoft.com)
- **Mistral** (chat.mistral.ai)
- **Poe** (poe.com)
- **HuggingFace Chat** (huggingface.co)
- **Character.AI** (character.ai)
- **You.com** (you.com)
- **Phind** (phind.com)

## Features
- Jump to any message instantly with highlight animation
- Search all messages with inline highlight
- Filter by You / AI messages
- Token estimate per message and total (via char/4 approximation)
- Activate/Deactivate navigator without closing
- Customizable keyboard shortcut
- Prev / Next message step navigation
- Auto-updates as conversation grows
- Each platform has its own accent color
- Dark mode by default

---

## Installation

### Chrome / Edge / Brave / Opera (Manifest V3)
1. Unzip this folder
2. Go to `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `ai-navigator` folder
6. Visit any supported AI platform

### Firefox (Manifest V2)
1. Rename `manifest_firefox.json` → `manifest.json` (replace the existing one)
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file inside the `ai-navigator` folder

> For permanent Firefox install, the extension needs to be signed via AMO (addons.mozilla.org).

---

## Keyboard Shortcut
Default: `Ctrl + Shift + M`  
To change: Open the Navigator sidebar → click **Change** next to the shortcut → press your desired key combo.

---

## Updating
After making any code changes, go to `chrome://extensions` and click the **refresh icon** on the extension card, then reload the AI platform tab.
