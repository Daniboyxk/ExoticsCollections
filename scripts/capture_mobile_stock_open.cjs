const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9236',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-mobile-stock-open')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9236/json/new', { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    hasTouch: true
  });
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html?filters=open' });
  await sleep(2000);

  // Deploy tray, hide cookies, hide outlines, scroll into view
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';

        const tray = document.getElementById('filter-tray-container');
        const btn = document.getElementById('btn-filter-toggle');
        if (tray) {
          tray.classList.add('is-open');
          tray.setAttribute('aria-hidden', 'false');
        }
        if (btn) {
          btn.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }

        // Scroll to show the catalog-nav-header and filter tray clearly
        const navHeader = document.querySelector('.catalog-nav-header');
        if (navHeader) {
          navHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
        }

        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 },
    captureBeyondViewport: false
  });

  const out = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc18\\07_mobile_stock.png';
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('Mobile stock filter open captured! Size:', fs.statSync(out).size);

  ws.close();
  p.kill();
}
run();

