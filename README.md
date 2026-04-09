<div align="center">
  <img src="icons/icon128.png" width="80" height="80" alt="F9 Flow Icon"/>
  <h1>F9 Flow</h1>
  <p><strong>A beautifully uncompromising, minimalist command layer for AI platforms.</strong></p>
</div>

<br/>

**F9 Flow** (formerly AI Navigator) is an ultra-fast, universally compatible Chrome extension that injects a premium timeline and navigation sidebar into any major AI chat platform (ChatGPT, Claude, Perplexity, etc.).

By aggressively stripping away the noise of massive AI responses, F9 Flow distills your long, complex conversations down to a sleek, clickable timeline of just **your prompts**. Press down a single hotkey, jump backward instantly, and regain complete control of your context window.

## ✨ Product Showcase

### 🎛 The Unobtrusive Command Layer
The F9 Flow architecture stays out of your way until you need it. By default, tapping `F9` seamlessly slides in a minimalist, resizable dark-themed sidebar over the host page, giving you a top-level map of your entire conversation architecture. 

### ⚡ Lightning Fast Navigation
No more endless scrolling through walls of AI-generated text. The interface actively watches the DOM to extract, sanitize, and list every interaction you've had. Click on any prompt timeline dot to instantly smooth-scroll to that exact block of context in the chat.

### 🎨 Native Platform Aesthetics
F9 Flow seamlessly adapts its active states to match the primary branding accent color of the specific AI engine you are currently using — whether it's ChatGPT's teal, Claude's orange, or Gemini's blue.

### ⌨️ Fully Customizable Hotkeys
Your workflow is yours. With the cleanly designed extension popup, you can easily map the F9 Flow activation trigger to absolutely any shortcut combination (e.g. `Ctrl + Shift + A`, `Alt + M`).

---

## 🛠 Supported Platforms
The scraper intelligently maps the internal structures of over a dozen standard AI platforms, including:
- **ChatGPT** (`chatgpt.com`, `chat.openai.com`)
- **Claude** (`claude.ai`)
- **Perplexity** (`perplexity.ai`)
- **Gemini** (`gemini.google.com`)
- **Grok** (`grok.com`, `x.com`)
- **Copilot** (`copilot.microsoft.com`)
- **Mistral** (`chat.mistral.ai`)
- **HuggingFace** (`huggingface.co`)
- **Poe** (`poe.com`)

## ⚙️ How to Install
Since the project is built in highly-optimized Vanilla JS and CSS, it requires zero build steps to deploy locally:
1. Clone this repository or download the `.zip`.
2. Navigate to `chrome://extensions/` in your Chromium-based browser.
3. Enable **Developer Mode** in the top right corner.
4. Click **Load unpacked** and select the F9 Flow project directory.
5. Open an AI chat interface and press `F9` (or map your own hotkey via the extension popup).

## 💻 Tech Stack
- **JavaScript (Vanilla)** — Utilizes deep `MutationObserver` architecture to silently track DOM reflows and strictly filters out AI responses via Regex.
- **CSS3** — Custom, platform-agnostic styling heavily utilizing `!important` to sandbox the components away from overreaching AI platform stylesheets.
- **Manifest V3** — Modern Web Extension standards compliance.

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](../../issues). If you like the project, don't forget to leave a ⭐.
