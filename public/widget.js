// Direct_Chat — floating widget (Shadow DOM, self-contained).
// Drop-in: <script src="/widget.js" async data-backend="https://chat.example.com"></script>
// data-backend: origin of the Direct_Chat backend (WS server). Defaults to
// the current page's origin when omitted (same-origin deployment).

(() => {
  if (window.__directChatLoaded) return;
  window.__directChatLoaded = true;

  const BACKEND_ORIGIN = (() => {
    const raw = document.currentScript?.dataset?.backend;
    if (!raw) return location.origin;
    try { return new URL(raw, location.href).origin; } catch { return location.origin; }
  })();

  const CID_KEY = 'direct_chat_cid';
  const OPEN_KEY = 'direct_chat_open';

  // Design tokens (Fiestalok-inspired)
  const TOKENS = {
    pink:   '#EC2D7E',
    pinkD:  '#C71F68',
    navy:   '#1F1B4D',
    navy2:  '#2A2563',
    cream:  '#F7F5F1',
    ink:    '#0F0E2C',
    muted:  '#6B6A86',
    line:   '#E7E3DC',
  };

  const host = document.createElement('div');
  host.id = 'direct-chat-host';
  host.style.cssText = 'all: initial; position: fixed; inset: auto 0 0 auto; z-index: 2147483000;';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host, * { box-sizing: border-box; }

    .bubble {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 60px;
      height: 60px;
      border-radius: 999px;
      background: ${TOKENS.pink};
      color: #fff;
      border: 0;
      cursor: pointer;
      display: grid;
      place-items: center;
      box-shadow: 0 10px 30px rgba(236, 45, 126, .35), 0 2px 6px rgba(0,0,0,.12);
      transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .bubble:hover { transform: translateY(-2px); background: ${TOKENS.pinkD}; }
    .bubble:active { transform: translateY(0); }
    .bubble svg { width: 26px; height: 26px; }

    .panel {
      position: fixed;
      right: 24px;
      bottom: 100px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 140px);
      background: ${TOKENS.cream};
      color: ${TOKENS.ink};
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(15, 14, 44, .25), 0 4px 12px rgba(15,14,44,.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', system-ui, sans-serif;
      transform-origin: bottom right;
      opacity: 0;
      transform: translateY(12px) scale(.98);
      pointer-events: none;
      transition: opacity .18s ease, transform .18s ease;
    }
    .panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .header {
      background: ${TOKENS.navy};
      color: #fff;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header .eyebrow {
      font-size: 10px;
      letter-spacing: .15em;
      font-weight: 600;
      color: ${TOKENS.pink};
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header h3 {
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 600;
      font-size: 20px;
      margin: 0;
      letter-spacing: -.01em;
    }
    .header .titles { flex: 1; }
    .header .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(255,255,255,.7);
      margin-top: 4px;
    }
    .dot { width: 7px; height: 7px; border-radius: 999px; background: #22C55E; box-shadow: 0 0 0 3px rgba(34,197,94,.22); }
    .dot.off { background: #9CA3AF; box-shadow: 0 0 0 3px rgba(156,163,175,.22); }
    .close {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,.75);
      width: 32px; height: 32px;
      border-radius: 999px;
      cursor: pointer;
      display: grid; place-items: center;
    }
    .close:hover { background: rgba(255,255,255,.08); color: #fff; }

    .log {
      flex: 1;
      overflow-y: auto;
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background:
        radial-gradient(ellipse at top, rgba(236,45,126,.04), transparent 60%),
        ${TOKENS.cream};
    }
    .log::-webkit-scrollbar { width: 8px; }
    .log::-webkit-scrollbar-thumb { background: ${TOKENS.line}; border-radius: 999px; }

    .row { display: flex; }
    .row.me { justify-content: flex-end; }
    .row.them { justify-content: flex-start; }

    .bubble-msg {
      max-width: 78%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .me .bubble-msg {
      background: ${TOKENS.pink};
      color: #fff;
      border-bottom-right-radius: 6px;
    }
    .them .bubble-msg {
      background: #fff;
      color: ${TOKENS.ink};
      border: 1px solid ${TOKENS.line};
      border-bottom-left-radius: 6px;
    }
    .sys {
      align-self: center;
      font-size: 11px;
      color: ${TOKENS.muted};
      background: rgba(31,27,77,.06);
      padding: 4px 10px;
      border-radius: 999px;
    }

    .intro {
      text-align: center;
      padding: 24px 12px 12px;
      color: ${TOKENS.muted};
    }
    .intro h4 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 18px;
      font-weight: 600;
      color: ${TOKENS.ink};
      margin: 0 0 6px;
    }
    .intro p { margin: 0; font-size: 13px; }

    form {
      border-top: 1px solid ${TOKENS.line};
      padding: 12px;
      display: flex;
      gap: 8px;
      background: #fff;
    }
    input {
      flex: 1;
      padding: 11px 14px;
      border: 1px solid ${TOKENS.line};
      border-radius: 999px;
      font-family: inherit;
      font-size: 14px;
      background: ${TOKENS.cream};
      color: ${TOKENS.ink};
      outline: none;
      transition: border-color .15s ease, background .15s ease;
    }
    input:focus { border-color: ${TOKENS.pink}; background: #fff; }
    input:disabled { opacity: .6; cursor: not-allowed; }

    .send {
      background: ${TOKENS.pink};
      color: #fff;
      border: 0;
      width: 42px; height: 42px;
      border-radius: 999px;
      cursor: pointer;
      display: grid; place-items: center;
      transition: background .15s ease, transform .1s ease;
    }
    .send:hover { background: ${TOKENS.pinkD}; }
    .send:active { transform: scale(.96); }
    .send:disabled { background: ${TOKENS.line}; cursor: not-allowed; }
    .send svg { width: 18px; height: 18px; }

    .footer {
      text-align: center;
      font-size: 10px;
      color: ${TOKENS.muted};
      padding: 6px 0 10px;
      background: #fff;
      letter-spacing: .02em;
    }

    /* Mobile: full-screen panel */
    @media (max-width: 520px) {
      .panel {
        right: 0; bottom: 0;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }
      .bubble { right: 16px; bottom: 16px; }
    }
  `;
  root.appendChild(style);

  const ICON_CHAT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>`;
  const ICON_CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  const ICON_SEND = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="header">
      <div class="titles">
        <div class="eyebrow">Support</div>
        <h3>Direct_Chat</h3>
        <div class="status"><span class="dot off" id="status-dot"></span><span id="status-text">hors-ligne</span></div>
      </div>
      <button class="close" id="close" aria-label="Fermer">${ICON_CLOSE}</button>
    </div>
    <div class="log" id="log">
      <div class="intro">
        <h4>Bonjour ✦</h4>
        <p>Posez votre question, nous vous répondons au plus vite.</p>
      </div>
    </div>
    <form id="form">
      <input id="input" type="text" autocomplete="off" placeholder="Écrivez un message…" maxlength="2000" disabled />
      <button class="send" id="send" type="submit" aria-label="Envoyer" disabled>${ICON_SEND}</button>
    </form>
    <div class="footer">Propulsé par Direct_Chat</div>
  `;
  root.appendChild(panel);

  const bubble = document.createElement('button');
  bubble.className = 'bubble';
  bubble.setAttribute('aria-label', 'Ouvrir le chat');
  bubble.innerHTML = ICON_CHAT;
  root.appendChild(bubble);

  const $ = (sel) => root.querySelector(sel);
  const logEl = $('#log');
  const form = $('#form');
  const input = $('#input');
  const sendBtn = $('#send');
  const closeBtn = $('#close');
  const statusDot = $('#status-dot');
  const statusText = $('#status-text');

  function setOpen(open) {
    panel.classList.toggle('open', open);
    bubble.innerHTML = open ? ICON_CLOSE : ICON_CHAT;
    bubble.setAttribute('aria-label', open ? 'Fermer le chat' : 'Ouvrir le chat');
    try { localStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch {}
    if (open) setTimeout(() => input.focus(), 150);
  }
  bubble.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  closeBtn.addEventListener('click', () => setOpen(false));

  // Restore open state
  try { if (localStorage.getItem(OPEN_KEY) === '1') setOpen(true); } catch {}

  // --- WS logic ---

  let ws = null;
  let backoff = 1000;
  let connected = false;

  function wsUrl() {
    const backend = new URL(BACKEND_ORIGIN);
    const proto = backend.protocol === 'https:' ? 'wss:' : 'ws:';
    let cid = '';
    try { cid = localStorage.getItem(CID_KEY) ?? ''; } catch {}
    return `${proto}//${backend.host}/ws${cid ? `?cid=${encodeURIComponent(cid)}` : ''}`;
  }

  function setStatus(state) {
    if (state === 'on') {
      statusDot.classList.remove('off');
      statusText.textContent = 'en ligne';
      connected = true;
      input.disabled = false;
      sendBtn.disabled = false;
    } else {
      statusDot.classList.add('off');
      statusText.textContent = state === 'reconnecting' ? 'reconnexion…' : 'hors-ligne';
      connected = false;
      input.disabled = true;
      sendBtn.disabled = true;
    }
  }

  function addBubble(kind, text) {
    // Remove intro once a real message arrives
    const intro = logEl.querySelector('.intro');
    if (intro) intro.remove();

    const row = document.createElement('div');
    row.className = `row ${kind}`;
    const b = document.createElement('div');
    b.className = 'bubble-msg';
    b.textContent = text;
    row.appendChild(b);
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function addSystem(text) {
    const s = document.createElement('div');
    s.className = 'sys';
    s.textContent = text;
    logEl.appendChild(s);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function connect() {
    setStatus('reconnecting');
    ws = new WebSocket(wsUrl());

    ws.addEventListener('open', () => {
      backoff = 1000;
      setStatus('on');
    });

    ws.addEventListener('message', (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      switch (m.type) {
        case 'hello':
          try { localStorage.setItem(CID_KEY, m.conversationId); } catch {}
          break;
        case 'msg':
          addBubble(m.from === 'visitor' ? 'me' : 'them', m.content);
          break;
        case 'error':
          addSystem(
            m.error === 'rate_limited' ? 'Trop de messages, patientez un instant.' :
            m.error === 'message_too_long' ? 'Message trop long.' :
            m.error === 'discord_unreachable' ? 'Service momentanément indisponible.' :
            `Erreur : ${m.error}`
          );
          break;
      }
    });

    ws.addEventListener('close', () => {
      setStatus('off');
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, 30000);
    });

    ws.addEventListener('error', () => { try { ws.close(); } catch {} });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content || !connected) return;
    ws.send(JSON.stringify({ type: 'msg', content }));
    input.value = '';
  });

  connect();
})();
