const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9231',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-mobile-hero')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9231/json/new', { method: 'PUT' });
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
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await sleep(1500);

  // Set the background to hero_poster.jpg (the exact 2 McLarens frame)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const v = document.querySelector('video');
        if (v) {
          v.pause();
          v.style.display = 'none';
        }
        const hero = document.getElementById('hero');
        if (hero) {
          hero.style.backgroundImage = 'url(/assets/hero_poster.jpg)';
          hero.style.backgroundSize = 'cover';
          hero.style.backgroundPosition = 'center top';
        }
        // Give comfortable header padding so logo is never clipped by island
        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '18px';
        }
        document.querySelectorAll(':focus').forEach(e => e.blur());
        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(500);

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 }
  });

  const outPath = 'C:\\EXOTICS\\.temp-mobile-hero-test.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Mobile hero captured with exact frame! Size:', fs.statSync(outPath).size);

  ws.close();
  p.kill();
}
run();

