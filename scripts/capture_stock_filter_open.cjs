const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9232',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-stock-filter')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9232/json/new', { method: 'PUT' });
  const t = await res.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.id && cb.has(d.id)) { cb.get(d.id)(d.result); cb.delete(d.id); }
  };
  function send(m, params = {}) {
    return new Promise(r => { const i = id++; cb.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params })); });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html?filters=open' });
  await sleep(2200);

  // Make sure the tray is open, remove focus, and scroll slightly so the header and the filter tray are prominently visible
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tray = document.getElementById('filter-tray-container');
        const btn = document.getElementById('btn-filter-toggle');
        if (tray && btn) {
          tray.classList.add('is-open');
          btn.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          tray.setAttribute('aria-hidden', 'false');
        }
        // Scroll so the filter tray and top of cars are perfectly framed
        const navHeader = document.querySelector('.catalog-nav-header');
        if (navHeader) {
          navHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
        document.querySelectorAll(':focus').forEach(e => e.blur());
        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(800);

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  const outPath = 'C:\\EXOTICS\\.temp-stock-filter-open.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Stock filter open captured! Size:', fs.statSync(outPath).size);

  ws.close();
  p.kill();
}
run();

