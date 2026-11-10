const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9235',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-sec2-clean')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9235/json/new', { method: 'PUT' });
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
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await sleep(2000);

  // Clean elements: hide header, hide cookie banner, remove focus outlines
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const header = document.querySelector('.site-header');
        if (header) header.style.display = 'none';
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';
        const modal = document.querySelector('.modal-backdrop');
        if (modal) modal.style.display = 'none';

        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);

        const sec = document.getElementById('importaciones');
        if (sec) {
          sec.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      })()
    `
  });
  await sleep(600);

  // Measure section exact rect
  const rectRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.getElementById('importaciones');
        const r = sec.getBoundingClientRect();
        return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
      })()
    `,
    returnByValue: true
  });
  console.log('Section 2 rect:', rectRes.result.value);
  const rect = rectRes.result.value;

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: rect.y, width: 1920, height: Math.min(rect.height, 1080), scale: 1 },
    captureBeyondViewport: true
  });

  const out = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc18\\02_desktop_section2_index.png';
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('Clean Section 2 captured! Size:', fs.statSync(out).size);

  ws.close();
  p.kill();
}
run();

