/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AI Navigator — Content Script  v2.3
 *
 * Minimal UI (F9 toggle) — pure timeline with prompts and AI responses.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
(() => {
  'use strict';
  if (window.__aiNavInjected) return;
  window.__aiNavInjected = true;

  const _br = (typeof browser !== 'undefined' && browser?.runtime)
    ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  // ══════════════════════════════════════════════════════════════════════════════
  //  PLATFORMS
  // ══════════════════════════════════════════════════════════════════════════════

  const PLATFORMS = {
    'chatgpt.com':'ChatGPT','chat.openai.com':'ChatGPT',
    'claude.ai':'Claude',
    'perplexity.ai':'Perplexity','www.perplexity.ai':'Perplexity',
    'gemini.google.com':'Gemini',
    'grok.com':'Grok','x.com':'Grok',
    'copilot.microsoft.com':'Copilot',
    'chat.mistral.ai':'Mistral',
    'huggingface.co':'HuggingFace',
    'poe.com':'Poe',
    'character.ai':'Character.AI',
    'you.com':'You.com',
    'phind.com':'Phind','www.phind.com':'Phind',
    'chat.deepseek.com':'DeepSeek','deepseek.com':'DeepSeek',
    'manus.im':'Manus','app.manus.im':'Manus',
  };

  const SCRAPERS = {
    ChatGPT: {
      containers: ['[data-testid^="conversation-turn"]','article[data-testid]','[class*="ConversationItem"]','div[data-message-author-role]'],
      userMatch:  ['[data-message-author-role="user"]'],
      aiMatch:    ['[data-message-author-role="assistant"]'],
      textSel:    ['.markdown', '.prose', '.whitespace-pre-wrap', 'p'],
    },
    Claude: {
      containers: ['[data-testid="user-message"]','[data-testid="assistant-message"]','.font-claude-message','.font-user-message','[class*="Message__"]'],
      userMatch:  ['[data-testid="user-message"]', '.font-user-message', '[class*="human"]', '[class*="Human"]'],
      aiMatch:    ['[data-testid="assistant-message"]', '.font-claude-message', '[class*="assistant"]', '[class*="Assistant"]'],
      textSel:    ['.prose', '[class*="prose"]', 'p', 'div'],
    },
    Gemini: {
      containers: ['user-query','model-response','.conversation-turn','message-content'],
      userMatch:  ['user-query', '.query-text', '[class*="user-query"]', '[class*="UserQuery"]'],
      aiMatch:    ['model-response', '.response-content', '[class*="model-response"]', '[class*="ModelResponse"]'],
      textSel:    ['.model-response-text', '.markdown', '.query-text', '.response-content', '.user-query-bubble-with-background', 'p', 'span'],
    },
    Perplexity: {
      containers: ['[class*="AnswerBlock"]','[class*="QueryBlock"]','[class*="Message"]','[data-testid*="message"]','.group'],
      userMatch:  ['[class*="query"]', '[class*="Query"]', '[class*="user"]'],
      aiMatch:    ['[class*="answer"]', '[class*="Answer"]', '[class*="prose"]'],
      textSel:    ['[class*="prose"]', '.break-words', 'p', 'div'],
    },
    Grok: {
      containers: ['[class*="message"]', '[class*="Message"]', '[data-testid*="message"]'],
      userMatch:  ['[class*="UserMessage"]', '[class*="user"]', '[data-testid*="user"]'],
      aiMatch:    ['[class*="AssistantMessage"]', '[class*="BotMessage"]', '[class*="assistant"]'],
      textSel:    ['[class*="prose"]', 'p', 'div'],
    },
    Copilot: {
      containers: ['[class*="message"]', '[class*="Message"]', 'cib-message'],
      userMatch:  ['[class*="user"]', '[data-content="user-message"]'],
      aiMatch:    ['[class*="bot"]', '[class*="assistant"]', '[data-content="ai-message"]'],
      textSel:    ['[class*="prose"]', 'p', '[class*="text"]'],
    },
    Mistral: {
      containers: ['[class*="Message"]', '[class*="message"]', '.group'],
      userMatch:  ['[class*="user"]', '[class*="human"]'],
      aiMatch:    ['[class*="assistant"]', '[class*="bot"]'],
      textSel:    ['.prose', 'p', 'div'],
    },
    HuggingFace: {
      containers: ['[class*="message"]', 'article'],
      userMatch:  ['[class*="user"]', '[data-role="user"]'],
      aiMatch:    ['[class*="assistant"]', '[data-role="assistant"]'],
      textSel:    ['[class*="prose"]', 'p', 'div'],
    },
    Poe: {
      containers: ['[class*="Message_row"]', '[class*="ChatMessage"]', '[class*="message"]', 'section', 'article', '.chat-message'],
      userMatch:  ['[class*="human"]', '[class*="userText"]', '[class*="Message_human"]', '[data-chat-message-type="human"]', '[class*="user"]'],
      aiMatch:    ['[class*="bot"]', '[class*="botText"]', '[class*="Message_bot"]', '[data-chat-message-type="bot"]', '[class*="assistant"]', '[class*="Markdown"]'],
      textSel:    ['[class*="Markdown"]', '[class*="prose"]', 'p', 'div'],
    },
    'Character.AI': {
      containers: ['[class*="msg"]', '[class*="message"]'],
      userMatch:  ['[class*="humanText"]', '[class*="user-message"]'],
      aiMatch:    ['[class*="characterText"]', '[class*="bot-message"]'],
      textSel:    ['p', 'div'],
    },
    'You.com': {
      containers: ['[class*="chatMessage"]', '[class*="ChatMessage"]', '.group'],
      userMatch:  ['[class*="userQuery"]', '[class*="user_query"]'],
      aiMatch:    ['[class*="answer"]', '[class*="response"]'],
      textSel:    ['[class*="prose"]', 'p', 'div'],
    },
    Phind: {
      containers: ['[class*="message"]', '[class*="Message"]', '.group'],
      userMatch:  ['[class*="user"]', '[class*="query"]'],
      aiMatch:    ['[class*="assistant"]', '[class*="answer"]'],
      textSel:    ['[class*="prose"]', 'p', 'div'],
    },
    DeepSeek: {
      containers: ['[class*="message"]', '[class*="chat-block"]', 'article', 'div[class^="f8"]', 'div[class^="f9"]', 'div[class^="dad"]'],
      userMatch:  ['[class*="user"]', '[class*="User"]', '[class*="human"]'],
      aiMatch:    ['[class*="assistant"]', '[class*="Assistant"]', '[class*="bot"]', '.ds-markdown', '.markdown'],
      textSel:    ['.prose', '[class*="prose"]', '.md-code-block', '.ds-markdown', 'p', 'div'],
    },
    Manus: {
      containers: ['.simplebar-content-wrapper > div > div', '[role="region"][aria-label*="scroll"] > div > div', '[class*="message"]', '[class*="Message"]', '.chat-item'],
      userMatch:  ['[class*="justify-end"]', '[class*="user"]', '[class*="User"]', '[class*="human"]'],
      aiMatch:    ['[class*="justify-start"]', '[class*="assistant"]', '[class*="bot"]', '[class*="agent"]', '.markdown-body'],
      textSel:    ['.tiptap', '[class*="prose"]', '.markdown-body', 'p', 'span', 'div'],
    },
  };

  const host     = location.hostname.replace(/^www\./, '');
  const platform = PLATFORMS[host] || PLATFORMS[location.hostname] || 'AI Chat';

  const cfg      = SCRAPERS[platform] || SCRAPERS.ChatGPT;

  const COLORS = {
    ChatGPT:'#ffffffff',Claude:'#d97757',Perplexity:'#20808d',
    Gemini:'#4285f4',Grok:'#7d7d7db2',Copilot:'#0091ff70',
    Mistral:'#f7501f',HuggingFace:'#ff9a00',Poe:'#6c5ce7',
    'Character.AI':'#888','You.com':'#7c3aed',Phind:'#0ea5e9',
    DeepSeek:'#4d83ff',Manus:'#6366f1',
  };
  const accent = COLORS[platform] || '#4b5563';

  // ══════════════════════════════════════════════════════════════════════════════
  //  UTILITIES
  // ══════════════════════════════════════════════════════════════════════════════

  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function fmtTok(n) {
    if (n >= 10000) return (n/1000).toFixed(0)+'k';
    if (n >= 1000)  return (n/1000).toFixed(1)+'k';
    return String(n);
  }

  // Storage
  function storeGet(k, fb) {
    return new Promise(r => {
      try { _br?.storage?.local ? _br.storage.local.get([k], d => r(d[k] ?? fb)) : r(fb); }
      catch { r(fb); }
    });
  }
  function storeSet(k, v) { try { _br?.storage?.local?.set({[k]:v}); } catch {} }

  // ══════════════════════════════════════════════════════════════════════════════
  //  SCRAPER — accurate extraction
  // ══════════════════════════════════════════════════════════════════════════════

  function qs(parent, sel) { try { return parent.querySelector(sel); } catch { return null; } }
  function qsa(sel) { try { return [...document.querySelectorAll(sel)]; } catch { return []; } }
  function matches(el, sel) { try { return el.matches(sel); } catch { return false; } }

  function matchesAny(el, sels) {
    return sels.some(s => matches(el, s) || qs(el, s));
  }

  function extractText(el) {
    for (const sel of cfg.textSel) {
      const node = qs(el, sel);
      if (node) {
        let t = (node.innerText || node.textContent || '').trim();
        t = t.replace(/^You said[\s:]*/i, '');
        if (t.length > 2) return t;
      }
    }
    let t = (el.innerText || el.textContent || '').trim();
    return t.replace(/^You said[\s:]*/i, '');
  }

  function scrapeMessages() {
    const messages = [];

    // ─── PERPLEXITY EXCLUSIVE: Isolate from sidebar garbage ───
    // Perplexity utility classes often falsely match the sidebar ('History', 'Discover').
    // We isolate extraction to the .scrollable-container and target exact user bubbles.
    if (platform === 'Perplexity') {
       const chatContainer = document.querySelector('.scrollable-container') || document.querySelector('main');
       if (chatContainer) {
           const seenTexts = new Set();

           // Primary anchor: 'Edit query' buttons reliably target user prompts
           const editBtns = chatContainer.querySelectorAll('[aria-label="Edit query"], button:has(svg)');
           const userBlocks = [];
           
           editBtns.forEach(btn => {
               if (btn.getAttribute('aria-label') === 'Edit query') {
                   const block = btn.closest('.group') || btn.parentElement?.parentElement?.parentElement;
                   if (block && !block.closest('#ain-panel')) userBlocks.push(block);
               }
           });

           // Fallback: Check right-aligned bubble styling (shared links don't have edit buttons)
           if (userBlocks.length === 0) {
               chatContainer.querySelectorAll('div, span, p').forEach(el => {
                   if (el.closest('#ain-panel') || el.children.length > 5) return;
                   const cls = (el.className || '').toString();
                   if (cls.includes('justify-end') || cls.includes('ml-auto') || cls.includes('bg-offsetPlus')) {
                       userBlocks.push(el);
                   }
               });
           }

           userBlocks.forEach(block => {
               let text = (block.innerText || '').trim();
               // Strip out ui strings that leak in
               text = text.replace(/Edit query/gi, '').replace(/Copilot/gi, '').trim();
               if (text.length < 2 || seenTexts.has(text)) return;
               
               // Avoid sidebar elements just in case they slipped through
               if (['History', 'Discover', 'New thread', 'Sign up'].includes(text)) return;

               seenTexts.add(text);
               messages.push({
                   index: messages.length,
                   role: 'user',
                   fullText: text,
                   element: block,
                   tokens: Math.ceil(text.length / 4)
               });
           });

           if (messages.length > 0) return messages;
       }
    }

    // ─── DEEPSEEK EXCLUSIVE: Scrape Native Navigator Directly ───
    // DeepSeek has a native outline navigator on the right side that lists all user prompts.
    // We reverse-engineer it: find the best matching container and extract prompt text from it.
    if (platform === 'DeepSeek') {
       let bestNav = null;
       let bestScore = 0;

       qsa('div').forEach(el => {
           if (el.closest('#ain-panel') || el.id === 'ain-panel') return;
           if (el.querySelector('.ds-markdown, .ds-markdown--block, .markdown, code, pre')) return;
           if (el.children.length < 3) return;

           const rect = el.getBoundingClientRect();
           if (rect.left <= window.innerWidth * 0.5) return;
           if (rect.width > 350) return;
           if (rect.top < 60) return;
           if (rect.height < 30) return;

           const children = Array.from(el.children);
           const textContents = children.map(child => (child.innerText || '').trim());
           const validCount = textContents.filter(t => t.length > 1 && t.length < 200).length;

           if (validCount >= 3 && validCount / children.length >= 0.5) {
               if (validCount > bestScore) {
                   bestScore = validCount;
                   bestNav = el;
               }
           }
       });

       if (bestNav) {
           Array.from(bestNav.children).forEach((child) => {
               let text = (child.innerText || '').trim();
               if (!text || text.length < 1) return;
               text = text.replace(/\s*[-–—]+\s*$/, '').trim();
               if (text.length < 1) return;
               messages.push({
                   index: messages.length,
                   role: 'user',
                   fullText: text,
                   element: child,
                   tokens: Math.ceil(text.length / 4)
               });
           });

           if (messages.length > 0) return messages;
       }
    }

    // ─── MANUS EXCLUSIVE: Walk simplebar-content-wrapper for user prompts ───
    // Manus uses Tailwind utility classes with no stable message/user/assistant selectors.
    // User messages are right-aligned bubbles; AI messages start with "manus" branding.
    if (platform === 'Manus') {
       let chatContainer = document.querySelector('.simplebar-content-wrapper');
       if (!chatContainer) chatContainer = document.querySelector('[role="region"][aria-label*="scroll"]');
       if (!chatContainer) chatContainer = document.querySelector('[class*="simplebar"]');

       if (chatContainer) {
           const allBlocks = chatContainer.querySelectorAll('div, span, p');
           const seenTexts = new Set();

           allBlocks.forEach(el => {
               if (el.closest('#ain-panel')) return;
               if (el.children.length > 5) return;

               const text = (el.innerText || '').trim();
               if (text.length < 2 || text.length > 500) return;
               if (seenTexts.has(text)) return;

               // Method 1: Tailwind class check for right-alignment
               const chain = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement].filter(Boolean);
               let isRightAligned = false;

               for (const node of chain) {
                   const cls = (node.className || '').toString();
                   if (cls.includes('justify-end') || cls.includes('items-end') || cls.includes('text-right') || cls.includes('ml-auto') || cls.includes('self-end')) {
                       isRightAligned = true;
                       break;
                   }
               }

               // Method 2: Positional check — user bubbles are in the right portion
               if (!isRightAligned) {
                   const rect = el.getBoundingClientRect();
                   const containerRect = chatContainer.getBoundingClientRect();
                   const containerCenter = containerRect.left + containerRect.width / 2;
                   if (rect.right > containerRect.right - 80 && rect.left > containerCenter && rect.width < containerRect.width * 0.7 && rect.height > 10 && rect.height < 200) {
                       isRightAligned = true;
                   }
               }

               if (!isRightAligned) return;

               // Filter out non-message elements
               if (text.match(/^\d{1,2}:\d{2}$/) || text.length < 3) return;
               if (el.querySelector('button, input, svg')) return;
               const parentText = (el.parentElement?.innerText || '').toLowerCase();
               if (parentText.startsWith('manus')) return;

               seenTexts.add(text);
               messages.push({
                   index: messages.length,
                   role: 'user',
                   fullText: text,
                   element: el,
                   tokens: Math.ceil(text.length / 4)
               });
           });

           if (messages.length > 0) return messages;
       }
    }

    // ─── Normal scraping logic ───

    let turns = [];

    // Step 1: Find message containers
    for (const sel of cfg.containers) {
      const found = qsa(sel);
      if (found.length > 0) {
        if (turns.length === 0) {
          turns = found;
        } else {
          const existing = new Set(turns);
          found.forEach(el => { if (!existing.has(el)) turns.push(el); });
        }
        if (platform !== 'Gemini' && platform !== 'Claude') break;
      }
    }

    // Step 2: Fallback
    if (!turns.length) {
      const seen = new Set();
      [...cfg.userMatch, ...cfg.aiMatch].forEach(sel => {
        qsa(sel).forEach(el => {
          const container = el.closest('article, section, [class*="message"], [class*="Message"], [class*="turn"], .group, [class*="conversation"]') || el.parentElement || el;
          if (!seen.has(container)) { seen.add(container); turns.push(container); }
        });
      });
    }

    // Step 2.5: Deep inference — infer siblings around known AI messages
    if (turns.length > 0 && turns.length < 200) {
      const knownAIs = turns.filter(t => matchesAny(t, cfg.aiMatch));
      knownAIs.forEach(aiElem => {
        const parent = aiElem.parentElement;
        if (parent) {
          Array.from(parent.children).forEach(child => {
            if (!turns.includes(child) && (child.innerText || '').trim().length > 2) {
              turns.push(child);
            }
          });
        }
      });
    }

    // Step 3: Generic
    if (!turns.length) {
      for (const sel of ['article', 'section', '[class*="message"]', '[class*="turn"]', '[class*="conversation"]', '[class*="bubble"]', '[class*="chat"]']) {
        const found = qsa(sel).filter(el => {
          const text = (el.innerText || '').trim();
          return (text.length > 10 && text.length < 50000) || el.querySelector('img');
        });
        if (found.length >= 2) { turns = found; break; }
      }
    }

    // Sort by DOM
    turns.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return  1;
      return 0;
    });

    // Dedup
    const deduped = [];
    turns.forEach(el => {
      if (!deduped.some(existing => existing.contains(el))) {
        for (let i = deduped.length - 1; i >= 0; i--) {
          if (el.contains(deduped[i])) deduped.splice(i, 1);
        }
        deduped.push(el);
      }
    });

    // Extract
    deduped.forEach((turn) => {
      if (turn.closest('#ain-panel') || turn.id === 'ain-panel') return;

      let isUser = matchesAny(turn, cfg.userMatch) || turn.getAttribute('data-message-author-role') === 'user';
      let isAI   = matchesAny(turn, cfg.aiMatch) || turn.getAttribute('data-message-author-role') === 'assistant';

      if (!isUser && !isAI) {
        if (matchesAny(turn, ['.markdown', '.ds-markdown', '.prose', '.markdown-body', 'code', 'pre', '[class*="bot"]', '[class*="Assistant"]', '[class*="assistant"]', '[class*="agent"]', '[class*="Markdown"]'])) {
          isAI = true;
        } else {
          isUser = true;
        }
      }

      let text = extractText(turn);

      if (text.length < 2) {
        if (turn.querySelector('img')) {
          text = "[Image Attachment]";
        } else {
          return;
        }
      }

      const role = isUser ? 'user' : isAI ? 'assistant' : null;
      if (role !== 'user') return; // STRICTLY drop AI messages

      const tokens = Math.ceil(text.length / 4);
      messages.push({ index: messages.length, role, fullText: text, element: turn, tokens });
    });

    return messages;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  STATE
  // ══════════════════════════════════════════════════════════════════════════════

  let panel = null;
  let isOpen = false;
  let allMsgs = [];
  let mutTimer = null;
  let isRendering = false;
  let lastHash = '';
  let hasRenderedOnce = false;

  // ══════════════════════════════════════════════════════════════════════════════
  //  STYLES
  // ══════════════════════════════════════════════════════════════════════════════

  function injectCSS() {
    if (document.getElementById('ain-css')) return;
    const s = document.createElement('style');
    s.id = 'ain-css';
    s.textContent = /*css*/`
      #ain-panel {
        position: fixed !important;
        top: 100px !important;
        right: 16px !important;
        width: 180px !important;
        height: 520px;
        min-width: 180px !important;
        min-height: 200px !important;
        max-height: calc(100vh - 90px) !important;
        background: #212121 !important;
        border: 1px solid #333 !important;
        border-radius: 12px !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        color: #fff !important;
        resize: vertical !important;
        overflow: hidden !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        transform: translateX(120%) !important;
        opacity: 0 !important;
        transition: transform .3s cubic-bezier(.4,0,.2,1), opacity .25s cubic-bezier(.4,0,.2,1) !important;
        -webkit-font-smoothing: antialiased !important;
        box-sizing: border-box !important;
      }
      #ain-panel * { box-sizing: border-box !important; }
      #ain-panel.ain-open { transform: translateX(0) !important; opacity: 1 !important; }

      .ain-hdr-stats {
        padding: 20px 24px 16px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        color: #888 !important;
        flex-shrink: 0 !important;
      }

      .ain-sc {
        flex: 1 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding: 4px 24px 24px !important;
        position: relative !important;
        scroll-behavior: smooth !important;
      }
      .ain-sc::-webkit-scrollbar { width: 4px !important; }
      .ain-sc::-webkit-scrollbar-track { background: transparent !important; }
      .ain-sc::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1) !important; border-radius: 999px !important; }
      .ain-sc::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2) !important; }

      .ain-ls {
        position: relative !important;
        padding-left: 20px !important;
      }
      .ain-ls::before {
        content: '' !important;
        position: absolute !important;
        left: 4px !important;
        top: 8px !important;
        bottom: 0 !important;
        width: 1px !important;
        background: #3a3a3a !important;
        z-index: 0 !important;
      }
      .ain-ls:has(.ain-em)::before { display: none !important; }

      .ain-it {
        position: relative !important;
        margin-bottom: 24px !important;
        cursor: pointer !important;
        opacity: 0.8 !important;
        transition: opacity .15s !important;
      }
      .ain-it:hover { opacity: 1 !important; }
      .ain-it.ain-active { opacity: 1 !important; }
      .ain-it.ain-active .ain-dot { transform: scale(1.3) !important; box-shadow: 0 0 12px currentColor, 0 0 0 4px #212121 !important; }

      #ain-panel:not(.ain-ready) .ain-it {
        animation: ain-in .28s cubic-bezier(.4,0,.2,1) both !important;
      }
      @keyframes ain-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ain-dot {
        position: absolute !important;
        left: -20px !important;
        top: 5px !important;
        width: 9px !important;
        height: 9px !important;
        border-radius: 50% !important;
        z-index: 2 !important;
        box-shadow: 0 0 0 4px #212121 !important;
        transition: transform .4s cubic-bezier(.2,.2,.2,.2), box-shadow .4s cubic-bezier(.4,0,.2,1) !important;
      }
      .ain-dot-u { background: ${accent} !important; }
      .ain-dot-a { background: ${accent} !important; }

      .ain-txt {
        font-size: 13px !important;
        line-height: 1.5 !important;
        color: #b3b3b3 !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 4 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        word-break: break-word !important;
        transition: color .2s !important;
      }
      .ain-it.ain-active .ain-txt { color: #ffffff !important; font-weight: 500 !important; }

      .ain-em {
        padding-top: 140px !important;
        margin-left: -20px !important;
        color: #5c5c72 !important;
        font-size: 13px !important;
        text-align: center !important;
      }
    `;
    document.head.appendChild(s);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  BUILD DOM
  // ══════════════════════════════════════════════════════════════════════════════

  function buildPanel() {
    const d = document.createElement('div');
    d.id = 'ain-panel';
    d.innerHTML = `
      <div class="ain-hdr-stats" id="ain-stats">0 Prompts • 0 Tokens</div>
      <div class="ain-sc" id="ain-sc">
        <div class="ain-ls" id="ain-ls">
          <div class="ain-em">Loading messages…</div>
        </div>
      </div>
    `;
    return d;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  function render(force) {
    const ls = document.getElementById('ain-ls');
    if (!ls) return;

    const hash = allMsgs.map(m => `${m.index}:${m.role}:${m.tokens}`).join('|');
    if (!force && hash === lastHash) return;
    lastHash = hash;

    const prompts = allMsgs.filter(m => m.role === 'user');
    const uT = prompts.reduce((s,m) => s + m.tokens, 0);

    const statsEl = document.getElementById('ain-stats');
    if (statsEl) {
      statsEl.textContent = `${prompts.length} Prompts • ${fmtTok(uT)} Tokens`;
    }

    isRendering = true;

    if (!allMsgs.length) {
      ls.innerHTML = `<div class="ain-em">No messages detected.</div>`;
      isRendering = false;
      return;
    }

    ls.innerHTML = allMsgs.map((m, i) => {
      const r = m.role[0];
      const delay = hasRenderedOnce ? '' : ` style="animation-delay:${Math.min(i*25,400)}ms"`;
      return `
        <div class="ain-it" data-i="${m.index}"${delay}>
          <div class="ain-dot ain-dot-${r}"></div>
          <div class="ain-txt">${esc(m.fullText)}</div>
        </div>`;
    }).join('');

    if (!hasRenderedOnce) {
      hasRenderedOnce = true;
      requestAnimationFrame(() => {
        setTimeout(() => panel?.classList.add('ain-ready'), 500);
      });
    }

    // Click handlers
    ls.querySelectorAll('.ain-it').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.i, 10);
        const msg = allMsgs.find(m => m.index === idx);
        if (!msg?.element) return;

        ls.querySelectorAll('.ain-active').forEach(el => el.classList.remove('ain-active'));
        item.classList.add('ain-active');
        setTimeout(() => item.classList.remove('ain-active'), 1200);

        // For DeepSeek, msg.element is the native navigator item — always use scanScroll.
        if (platform !== 'DeepSeek' && msg.element && msg.element.isConnected) {
            // For Manus, use the simplebar scroller context
            if (platform === 'Manus') {
                const simpleBar = document.querySelector('.simplebar-content-wrapper');
                if (simpleBar) {
                    const elRect = msg.element.getBoundingClientRect();
                    const sbRect = simpleBar.getBoundingClientRect();
                    const offsetTop = elRect.top - sbRect.top + simpleBar.scrollTop;
                    simpleBar.scrollTo({ top: offsetTop - sbRect.height / 2 + elRect.height / 2, behavior: 'smooth' });
                    return;
                }
            }
            msg.element.scrollIntoView({ behavior:'smooth', block:'start', inline:'nearest' });
            return;
        }

        // Element is unmounted (Virtual DOM) OR DeepSeek — iteratively scroll to find it
        let scrollers = qsa('div, main').filter(el => el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 300);
        if (platform === 'Manus') {
            const sb = document.querySelector('.simplebar-content-wrapper');
            if (sb) scrollers = [sb, ...scrollers.filter(s => s !== sb)];
        } else if (platform === 'Perplexity') {
            const sb = document.querySelector('.scrollable-container');
            if (sb) scrollers = [sb, ...scrollers.filter(s => s !== sb)];
        }
        let scroller = scrollers.sort((a,b) => b.scrollHeight - a.scrollHeight)[0] || window;

        const targetClean = msg.fullText.slice(0, 100).toLowerCase().replace(/\s+/g, '');
        let direction = -1;

        const activeMsg = allMsgs.filter(m => m.element && m.element.isConnected)[0];
        if (activeMsg) direction = msg.index < activeMsg.index ? -1 : 1;

        let attempts = 0;
        function scanScroll() {
            attempts++;
            if (attempts > 300) return;

            let foundEl = null;
            if (platform === 'Manus') {
                const cc = document.querySelector('.simplebar-content-wrapper');
                if (cc) {
                    cc.querySelectorAll('div, span, p').forEach(el => {
                        if (foundEl) return;
                        const text = (el.innerText || '').trim().slice(0, 100).toLowerCase().replace(/\s+/g, '');
                        if (text && text === targetClean && el.children.length <= 5) foundEl = el;
                    });
                }
            } else {
                const containerSel = cfg.containers && cfg.containers.length ? cfg.containers.join(', ') : 'article, [class*="message"]';
                qsa(containerSel).forEach(turn => {
                   if (foundEl || !turn.getBoundingClientRect().height) return;
                   let text = extractText(turn).slice(0, 100).toLowerCase().replace(/\s+/g, '');
                   if (text && text === targetClean) foundEl = turn;
                });
            }

            if (foundEl) {
               foundEl.scrollIntoView({ behavior:'smooth', block:'center' });
               if (platform !== 'DeepSeek') msg.element = foundEl;
               return;
            }

            if (scroller === window) {
               window.scrollBy(0, direction * 400);
            } else {
               scroller.scrollTop += direction * 400;
            }
            requestAnimationFrame(scanScroll);
        }
        scanScroll();
      });
    });

    setTimeout(() => { isRendering = false; }, 50);
  }

  function refresh() {
    const current = scrapeMessages();
    if (!current.length) {
       if (allMsgs.length) render();
       return;
    }

    if (!allMsgs.length) {
      allMsgs = current;
      allMsgs.forEach((m, i) => m.index = i);
      render();
      return;
    }

    // Virtual Scrolling alignment — align current DOM messages against stored memory buffer
    let rootCIdx = -1;
    let rootAIdx = -1;
    for (let c = 0; c < current.length; c++) {
      for (let a = Math.max(0, allMsgs.length - 20); a < allMsgs.length; a++) {
         if (current[c].fullText === allMsgs[a].fullText) { rootCIdx = c; rootAIdx = a; break; }
      }
      if (rootCIdx !== -1) break;
    }

    if (rootCIdx === -1) {
      for (let c = 0; c < current.length; c++) {
        for (let a = 0; a < allMsgs.length; a++) {
           if (current[c].fullText === allMsgs[a].fullText) { rootCIdx = c; rootAIdx = a; break; }
        }
        if (rootCIdx !== -1) break;
      }
    }

    let changed = false;

    if (rootCIdx === -1) {
      allMsgs = allMsgs.concat(current);
      changed = true;
    } else {
      const beforeC = current.slice(0, rootCIdx);
      const novelBefore = beforeC.filter(c => !allMsgs.slice(0, rootAIdx).some(a => a.fullText === c.fullText));
      if (novelBefore.length) {
        allMsgs.splice(rootAIdx, 0, ...novelBefore);
        rootAIdx += novelBefore.length;
        changed = true;
      }

      let currentAIdx = rootAIdx;
      for (let i = rootCIdx; i < current.length; i++) {
        const cMsg = current[i];
        let found = -1;
        for (let a = currentAIdx; a < allMsgs.length; a++) {
           if (allMsgs[a].fullText === cMsg.fullText) { found = a; break; }
        }
        if (found !== -1) {
           if (allMsgs[found].element !== cMsg.element) {
              allMsgs[found].element = cMsg.element;
              changed = true;
           }
           currentAIdx = found + 1;
        } else {
           allMsgs.splice(currentAIdx, 0, cMsg);
           currentAIdx++;
           changed = true;
        }
      }
    }

    if (changed) {
      allMsgs.forEach((m, i) => m.index = i);
      render();
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  OPEN / CLOSE / TOGGLE
  // ══════════════════════════════════════════════════════════════════════════════

  function open()   { if(isOpen)return; isOpen=true; panel.classList.add('ain-open'); storeSet('ain_open',true); refresh(); }
  function close()  { if(!isOpen)return; isOpen=false; panel.classList.remove('ain-open'); storeSet('ain_open',false); }
  function toggle() { isOpen ? close() : open(); }

  // ══════════════════════════════════════════════════════════════════════════════
  //  EVENTS
  // ══════════════════════════════════════════════════════════════════════════════

  let currentShortcut = 'F9';
  storeGet('ain_shortcut', 'F9').then(s => currentShortcut = s);

  function wire() {
    document.addEventListener('keydown', e => {
      if (!e.key) return;

      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');

      let k = e.key.toUpperCase();
      if (e.key === ' ') k = 'SPACE';
      parts.push(k);

      if (parts.join('+') === currentShortcut.toUpperCase()) { e.preventDefault(); toggle(); }
      else if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); }
    });

    try {
      _br?.runtime?.onMessage?.addListener(msg => {
        if (msg.action === 'setActive' && !msg.value) close();
        if (msg.action === 'updateShortcut') currentShortcut = msg.value;
      });
    } catch{}
  }

  // ══════════════════════════════════════════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════════════════════════════════════════

  function inject() {
    document.getElementById('ain-panel')?.remove();
    document.getElementById('ain-css')?.remove();

    injectCSS();
    panel = buildPanel();
    document.body.appendChild(panel);
    wire();

    storeGet('ain_open', false).then(was => { if(was) setTimeout(open, 600); });

    const obs = new MutationObserver((mutations) => {
      if (isRendering) return;
      const external = mutations.some(m => {
        const t = m.target;
        return t && !t.closest?.('#ain-panel') && t.id !== 'ain-panel';
      });
      if (!external) return;

      clearTimeout(mutTimer);
      mutTimer = setTimeout(() => { if(isOpen) refresh(); }, 1200);
    });
    obs.observe(document.body, { childList:true, subtree:true });
  }

  // Boot
  let retries = 0;
  function boot() {
    if (document.body) inject();
    else if (retries++ < 20) setTimeout(boot, 300);
  }

  // SPA nav detection
  let lastPath = location.pathname + location.search;
  new MutationObserver(() => {
    const cur = location.pathname + location.search;
    if (cur !== lastPath) {
      lastPath = cur;
      // Completely wipe the memory buffer on chat change
      allMsgs = [];
      lastHash = '';
      hasRenderedOnce = false;
      
      setTimeout(() => {
        if (!document.getElementById('ain-panel')) {
          inject();
        } else if (isOpen) {
          refresh();
        }
      }, 1000);
    }
  }).observe(document.documentElement, { childList:true, subtree:true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
