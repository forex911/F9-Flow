/**
 * F9 Flow — Popup Control Layer
 */
(() => {
  'use strict';

  const _br = typeof browser !== 'undefined' ? browser : chrome;
  const $ = (id) => document.getElementById(id);

  let isActive = true;
  let currentShortcut = 'F9';
  let listeningForShortcut = false;

  const storage = {
    get(key, fallback) {
      return new Promise(resolve => {
        try {
          if (_br?.storage?.local) {
            _br.storage.local.get([key], r => resolve(r[key] !== undefined ? r[key] : fallback));
          } else resolve(fallback);
        } catch { resolve(fallback); }
      });
    },
    set(key, value) {
      try { if (_br?.storage?.local) _br.storage.local.set({ [key]: value }); } catch {}
    }
  };

  function notifyContentScript(message) {
    try {
      _br.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs?.[0]?.id) _br.tabs.sendMessage(tabs[0].id, message).catch(() => {});
      });
    } catch {}
  }

  function updateActionButton() {
    const btn = $('action-btn');
    const label = $('action-label');
    
    if (isActive) {
      btn.style.background = 'rgba(255,255,255,0.05)';
      btn.style.color = '#fff';
      label.textContent = 'Disable F9 Flow';
      btn.style.border = '1px solid rgba(255,255,255,0.1)';
    } else {
      btn.style.background = '#C70039';
      btn.style.color = '#fff';
      label.textContent = 'Enable F9 Flow';
      btn.style.border = '1px solid #900C3F';
    }
  }

  function toggleActive() {
    isActive = !isActive;
    storage.set('ain_active', isActive);
    updateActionButton();
    notifyContentScript({ action: 'setActive', value: isActive });
  }

  function startShortcutCapture() {
    if (listeningForShortcut) return;
    listeningForShortcut = true;

    const btn = $('change-shortcut-btn');
    btn.textContent = 'Listening...';
    btn.style.color = '#f0a030';

    const onKey = (e) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      e.preventDefault();

      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Meta');

      let keyToSet = e.key.toUpperCase();
      if (e.key === ' ') keyToSet = 'SPACE';
      parts.push(keyToSet);

      currentShortcut = parts.join('+');
      storage.set('ain_shortcut', currentShortcut);
      $('shortcut-display').textContent = currentShortcut;

      listeningForShortcut = false;
      btn.textContent = 'Change';
      btn.style.color = '#fff';
      document.removeEventListener('keydown', onKey);

      notifyContentScript({ action: 'updateShortcut', value: currentShortcut });
    };

    document.addEventListener('keydown', onKey);
  }

  async function init() {
    const [active, shortcut] = await Promise.all([
      storage.get('ain_active', true),
      storage.get('ain_shortcut', 'F9'),
    ]);

    isActive = active !== false;
    currentShortcut = shortcut || 'F9';

    updateActionButton();
    $('shortcut-display').textContent = currentShortcut;

    $('action-btn').addEventListener('click', toggleActive);
    $('change-shortcut-btn').addEventListener('click', startShortcutCapture);
    
    // Popup Update Notification UI
    const pendingVer = await storage.get('ain_pending_update_ver', null);
    const pendingUrl = await storage.get('ain_pending_update_url', null);
    if (pendingVer && pendingUrl) {
       const upd = $('pop-upd');
       if (upd) {
           upd.style.display = 'flex';
           $('pop-upd-txt').textContent = `v${pendingVer} is ready!`;
           upd.addEventListener('click', () => { window.open(pendingUrl, '_blank'); });
       }
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
