/* ── FinCalc Pro — WebSocket Client ── */
(function () {
  let ws = null;
  let retryCount = 0;
  const MAX_RETRY = 12;

  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/ws`;

    try { ws = new WebSocket(url); }
    catch (e) { scheduleRetry(); return; }

    ws.addEventListener('open', () => {
      retryCount = 0;
      document.dispatchEvent(new CustomEvent('ws:open'));
    });

    ws.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        document.dispatchEvent(new CustomEvent('ws:market', { detail: data }));
      } catch (_) {}
    });

    ws.addEventListener('close', () => {
      document.dispatchEvent(new CustomEvent('ws:close'));
      scheduleRetry();
    });

    ws.addEventListener('error', () => { ws.close(); });
  }

  function scheduleRetry() {
    if (retryCount >= MAX_RETRY) return;
    const delay = Math.min(1000 * Math.pow(1.6, retryCount), 30000);
    retryCount++;
    setTimeout(connect, delay);
  }

  window.addEventListener('load', () => setTimeout(connect, 300));
})();
