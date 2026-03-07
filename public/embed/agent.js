/* Velamini Embed Widget v1.0
 * Drop-in AI agent chat bubble for any webpage.
 * Reads config from <script data-agent-key="..." data-agent-name="..." ...>
 */
(function (w, d) {
  'use strict';

  /* ── Read config from script tag ─────────────────────────────── */
  var scripts = d.querySelectorAll('script[src*="embed/agent.js"]');
  var el = scripts[scripts.length - 1];
  if (!el) return;

  var agentKey  = el.getAttribute('data-agent-key')  || '';
  var agentName = el.getAttribute('data-agent-name') || 'AI Agent';
  var theme     = el.getAttribute('data-theme')      || 'auto';
  var apiBase   = el.getAttribute('data-api-base')   || '';

  if (!agentKey) { console.warn('[Velamini] data-agent-key is required'); return; }

  /* ── Session persistence ─────────────────────────────────────── */
  var SK = 'vela_sid_' + agentKey.slice(-8);
  var sessionId = null;
  try { sessionId = localStorage.getItem(SK); } catch (e) {}

  /* ── State ───────────────────────────────────────────────────── */
  var isOpen   = false;
  var loading  = false;
  var history  = [];

  /* ── Theme ───────────────────────────────────────────────────── */
  function detectDark() {
    if (theme === 'dark')  return true;
    if (theme === 'light') return false;
    try {
      return (
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        d.documentElement.classList.contains('dark') ||
        d.documentElement.getAttribute('data-theme') === 'dark'
      );
    } catch (e) { return false; }
  }

  /* ── CSS ─────────────────────────────────────────────────────── */
  var styleEl = d.createElement('style');
  styleEl.textContent = [
    /* Floating button — always bottom-right */
    '#vela-btn{position:fixed;bottom:24px;right:24px;z-index:2147483646;width:54px;height:54px;border-radius:50%;background:rgba(56,189,248,.62);border:none;cursor:pointer;box-shadow:0 4px 18px rgba(56,189,248,.22);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;outline:none;padding:0}',
    '#vela-btn:hover{transform:scale(1.08);box-shadow:0 8px 24px rgba(56,189,248,.32)}',
    '#vela-btn svg{pointer-events:none;flex-shrink:0}',
    /* Panel — always anchored bottom-right */
    '#vela-panel{position:fixed;bottom:90px;right:24px;z-index:2147483645;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100dvh - 110px);border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 64px rgba(0,0,0,.28);transform-origin:bottom right;transition:transform .22s cubic-bezier(.16,1,.3,1),opacity .18s ease}',
    '#vela-panel.vela-hidden{transform:scale(.85) translateY(16px);opacity:0;pointer-events:none}',
    /* Light */
    '#vela-panel.vl{background:#fff;border:1px solid #e2e8f0}',
    '#vela-panel.vl .vela-hd{background:#0ea5e9;color:#fff}',
    '#vela-panel.vl .vela-msgs{background:#f8fafc}',
    '#vela-panel.vl .vela-footer{background:#fff;border-top:1px solid #e8edf2}',
    '#vela-panel.vl .vela-inp{background:#f1f5f9;color:#0f172a;border:1px solid #e2e8f0}',
    '#vela-panel.vl .vela-bubble-bot{background:#fff;color:#0f172a;border:1px solid #e2e8f0}',
    '#vela-panel.vl .vela-bubble-usr{background:#0ea5e9;color:#fff}',
    '#vela-panel.vl .vela-typing{color:#64748b}',
    '#vela-panel.vl .vela-branding{color:#94a3b8}',
    /* Dark */
    '#vela-panel.vd{background:#0f1a24;border:1px solid #1e3448}',
    '#vela-panel.vd .vela-hd{background:#0a1520;color:#e8f4fd;border-bottom:1px solid #1e3448}',
    '#vela-panel.vd .vela-msgs{background:#0a0f14}',
    '#vela-panel.vd .vela-footer{background:#0f1a24;border-top:1px solid #1e3448}',
    '#vela-panel.vd .vela-inp{background:#0a1520;color:#e8f4fd;border:1px solid #1e3448}',
    '#vela-panel.vd .vela-bubble-bot{background:#111e2a;color:#e8f4fd;border:1px solid #1e3448}',
    '#vela-panel.vd .vela-bubble-usr{background:#0ea5e9;color:#fff}',
    '#vela-panel.vd .vela-typing{color:#7ea8c4}',
    '#vela-panel.vd .vela-branding{color:#3d6480}',
    /* Shared panel parts */
    '.vela-hd{padding:13px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}',
    '.vela-av{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:.04em}',
    '.vela-hd-info{flex:1;min-width:0}',
    '.vela-hd-name{font-size:.84rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}',
    '.vela-hd-status{font-size:.63rem;opacity:.75;margin-top:1px}',
    '.vela-close{background:none;border:none;cursor:pointer;opacity:.65;padding:4px;line-height:1;color:inherit;font-size:18px;transition:opacity .15s;flex-shrink:0}',
    '.vela-close:hover{opacity:1}',
    /* Messages */
    '.vela-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth}',
    '.vela-msgs::-webkit-scrollbar{width:3px}',
    '.vela-msgs::-webkit-scrollbar-thumb{background:rgba(56,189,248,.3);border-radius:3px}',
    '.vela-row{display:flex;max-width:84%}',
    '.vela-row-bot{align-self:flex-start}',
    '.vela-row-usr{align-self:flex-end}',
    '.vela-bubble-bot,.vela-bubble-usr{padding:9px 13px;border-radius:12px;font-size:.83rem;line-height:1.55;word-break:break-word;font-family:inherit}',
    '.vela-bubble-bot{border-bottom-left-radius:4px}',
    '.vela-bubble-usr{border-bottom-right-radius:4px}',
    '.vela-typing{font-size:.75rem;padding:6px 12px 2px;font-style:italic;opacity:.7;display:none}',
    '.vela-typing.vela-show{display:block}',
    /* Footer */
    '.vela-footer{padding:10px 12px;display:flex;align-items:flex-end;gap:8px;flex-shrink:0}',
    '.vela-inp{flex:1;border-radius:10px;padding:9px 12px;font-size:.83rem;outline:none;resize:none;font-family:inherit;line-height:1.45;transition:border-color .15s;min-height:38px;max-height:96px}',
    '.vela-inp:focus{border-color:#38bdf8!important}',
    '.vela-send{width:36px;height:36px;flex-shrink:0;border-radius:10px;border:none;background:#38bdf8;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s;padding:0}',
    '.vela-send:hover{opacity:.85}',
    '.vela-send:disabled{opacity:.4;cursor:default}',
    '.vela-branding{text-align:center;font-size:.6rem;padding:5px 0 7px;letter-spacing:.07em;flex-shrink:0}',
    /* Mobile: full-width drawer from bottom */
    '@media(max-width:480px){#vela-panel{bottom:0;right:0;left:0;width:100%;max-width:100%;border-bottom-left-radius:0;border-bottom-right-radius:0;max-height:82dvh}#vela-btn{bottom:16px;right:16px}}',
  ].join('');
  d.head.appendChild(styleEl);

  /* ── Build initials ──────────────────────────────────────────── */
  var initials = agentName.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase() || 'AI';

  /* ── Inject HTML ─────────────────────────────────────────────── */
  var root = d.createElement('div');
  root.id = 'vela-root';
  root.innerHTML =
    '<button id="vela-btn" aria-label="Chat with ' + agentName + '">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
      '</svg>' +
    '</button>' +
    '<div id="vela-panel" class="vela-hidden" role="dialog" aria-label="Chat with ' + agentName + '">' +
      '<div class="vela-hd">' +
        '<div class="vela-av">' + initials + '</div>' +
        '<div class="vela-hd-info">' +
          '<div class="vela-hd-name">' + agentName + '</div>' +
          '<div class="vela-hd-status">&#9679; Online</div>' +
        '</div>' +
        '<button class="vela-close" aria-label="Close">&#10005;</button>' +
      '</div>' +
      '<div class="vela-msgs" id="vela-msgs"></div>' +
      '<div class="vela-typing" id="vela-typing">' + agentName + ' is typing&#8230;</div>' +
      '<div class="vela-footer">' +
        '<textarea class="vela-inp" id="vela-inp" placeholder="Type a message\u2026" rows="1"></textarea>' +
        '<button class="vela-send" id="vela-send" aria-label="Send">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="vela-branding">Powered by Velamini</div>' +
    '</div>';
  d.body.appendChild(root);

  /* ── Grab refs ───────────────────────────────────────────────── */
  var btnEl    = d.getElementById('vela-btn');
  var panelEl  = d.getElementById('vela-panel');
  var msgsEl   = d.getElementById('vela-msgs');
  var inpEl    = d.getElementById('vela-inp');
  var sendEl   = d.getElementById('vela-send');
  var typingEl = d.getElementById('vela-typing');
  var closeEl  = panelEl.querySelector('.vela-close');

  /* ── Apply / watch theme ─────────────────────────────────────── */
  function applyTheme() {
    panelEl.classList.toggle('vd', detectDark());
    panelEl.classList.toggle('vl', !detectDark());
  }
  applyTheme();
  if (theme === 'auto') {
    try {
      w.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
      new MutationObserver(applyTheme).observe(d.documentElement, {
        attributes: true, attributeFilter: ['class', 'data-theme'],
      });
    } catch (e) {}
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  function addMsg(role, text) {
    var row = d.createElement('div');
    row.className = 'vela-row ' + (role === 'user' ? 'vela-row-usr' : 'vela-row-bot');
    var bubble = d.createElement('div');
    bubble.className = role === 'user' ? 'vela-bubble-usr' : 'vela-bubble-bot';
    bubble.textContent = text;
    row.appendChild(bubble);
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function scrollBottom() {
    setTimeout(function () { msgsEl.scrollTop = msgsEl.scrollHeight; }, 40);
  }

  /* ── Open / close panel ──────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    applyTheme();
    panelEl.classList.remove('vela-hidden');
    inpEl.focus();
    if (msgsEl.children.length === 0) {
      addMsg('bot', 'Hello! How can I help you today?');
    }
    scrollBottom();
  }

  function closePanel() {
    isOpen = false;
    panelEl.classList.add('vela-hidden');
  }

  btnEl.addEventListener('click', function () { isOpen ? closePanel() : openPanel(); });
  closeEl.addEventListener('click', closePanel);

  /* Pressing Escape closes the panel */
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── Send message ────────────────────────────────────────────── */
  function send() {
    if (loading) return;
    var text = inpEl.value.trim();
    if (!text) return;

    inpEl.value = '';
    inpEl.style.height = '';
    addMsg('user', text);
    history.push({ role: 'user', content: text });

    loading = true;
    sendEl.disabled = true;
    typingEl.classList.add('vela-show');
    scrollBottom();

    fetch(apiBase + '/api/agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Key': agentKey,
      },
      body: JSON.stringify({
        message: text,
        sessionId: sessionId,
        history: history.slice(0, -1).slice(-8), // send last 8 prior messages for context
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typingEl.classList.remove('vela-show');
        loading = false;
        sendEl.disabled = false;
        if (data.reply) {
          addMsg('bot', data.reply);
          history.push({ role: 'assistant', content: data.reply });
          if (data.sessionId && data.sessionId !== sessionId) {
            sessionId = data.sessionId;
            try { localStorage.setItem(SK, sessionId); } catch (e) {}
          }
        } else {
          addMsg('bot', data.error || 'Sorry, something went wrong.');
        }
        scrollBottom();
      })
      .catch(function () {
        typingEl.classList.remove('vela-show');
        loading = false;
        sendEl.disabled = false;
        addMsg('bot', 'Network error. Please check your connection and try again.');
        scrollBottom();
      });
  }

  sendEl.addEventListener('click', send);
  inpEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  /* Auto-resize textarea */
  inpEl.addEventListener('input', function () {
    this.style.height = '';
    this.style.height = Math.min(this.scrollHeight, 96) + 'px';
  });

}(window, document));
