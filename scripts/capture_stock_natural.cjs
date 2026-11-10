const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9243',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-real-mobile-stock')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9243/json/new', { method: 'PUT' });
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
    deviceScaleFactor: 2,
    mobile: true,
    hasTouch: true
  });
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
  await sleep(2000);

  // Click the filter button naturally like a real user!
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';

        const btn = document.getElementById('btn-filter-toggle');
        if (btn) btn.click();

        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  // Take full viewport screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\EXOTICS\\.temp-stock-natural-top.png', Buffer.from(shot.data, 'base64'));
  console.log('Natural stock top captured! Size:', fs.statSync('C:\\EXOTICS\\.temp-stock-natural-top.png').size);

  // Now scroll naturally just 180px so filter tray is fully centered and prominent
  await send('Runtime.evaluate', {
    expression: 'window.scrollTo({ top: 160, behavior: "instant" });'
  });
  await sleep(400);

  const shotScrolled = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\EXOTICS\\.temp-stock-natural-scrolled.png', Buffer.from(shotScrolled.data, 'base64'));
  console.log('Natural stock scrolled captured! Size:', fs.statSync('C:\\EXOTICS\\.temp-stock-natural-scrolled.png').size);

  ws.close();
  p.kill();
}
run();

