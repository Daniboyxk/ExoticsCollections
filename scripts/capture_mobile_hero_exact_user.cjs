const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const userImg = fs.readFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/.user_uploaded/media_1793467000480_dcb7d54f.jpg');
  const b64 = userImg.toString('base64');

  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9237',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-mobile-hero-b64')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9237/json/new', { method: 'PUT' });
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
  await sleep(1800);

  // Inject exact user background image, hide video, hide cookie banner, style cleanly
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';

        const v = document.querySelector('video');
        if (v) { v.pause(); v.style.display = 'none'; }

        const hero = document.getElementById('hero');
        if (hero) {
          hero.style.backgroundImage = 'url("data:image/jpeg;base64,${b64}")';
          hero.style.backgroundSize = 'cover';
          hero.style.backgroundPosition = 'center 15%';
          hero.style.backgroundRepeat = 'no-repeat';
        }

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '16px';
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

  const out = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc18\\06_mobile_portada.png';
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('Mobile hero with exact user image captured! Size:', fs.statSync(out).size);

  ws.close();
  p.kill();
}
run();

