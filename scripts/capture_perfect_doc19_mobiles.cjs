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
    '--remote-debugging-port=9244',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-doc19-mobiles')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9244/json/new', { method: 'PUT' });
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

  const outDir = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc19';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. CAPTURE 06: Mobile Hero with 2 McLarens
  console.log('Capturing 06_mobile_portada.png...');
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await sleep(1800);

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';

        const v = document.querySelector('video');
        if (v) {
          const img = document.createElement('img');
          img.src = 'data:image/jpeg;base64,${b64}';
          img.className = 'hero-video-bg';
          img.style.objectFit = 'cover';
          img.style.objectPosition = 'center 20%';
          img.style.opacity = '1';
          img.style.zIndex = '1';
          v.replaceWith(img);
        }

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '32px';
        }

        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shot06 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } });
  fs.writeFileSync(path.join(outDir, '06_mobile_portada.png'), Buffer.from(shot06.data, 'base64'));
  console.log('06_mobile_portada.png captured! Size:', fs.statSync(path.join(outDir, '06_mobile_portada.png')).size);

  // 2. CAPTURE 07: Mobile Stock with filter tray open
  console.log('Capturing 07_mobile_stock.png...');
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
  await sleep(1800);

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '32px';
        }

        const btn = document.getElementById('btn-filter-toggle');
        if (btn) btn.click();

        // Scroll so the filter tray and selectors are prominently displayed
        window.scrollTo({ top: 180, behavior: 'instant' });

        const s = document.createElement('style');
        s.innerHTML = '* { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shot07 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } });
  fs.writeFileSync(path.join(outDir, '07_mobile_stock.png'), Buffer.from(shot07.data, 'base64'));
  console.log('07_mobile_stock.png captured! Size:', fs.statSync(path.join(outDir, '07_mobile_stock.png')).size);

  // Copy desktop captures and mobile car from doc18
  const src18 = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc18';
  fs.copyFileSync(path.join(src18, '01_desktop_portada.jpg'), path.join(outDir, '01_desktop_portada.jpg'));
  fs.copyFileSync(path.join(src18, '02_desktop_section2_index.png'), path.join(outDir, '02_desktop_section2_index.png'));
  fs.copyFileSync(path.join(src18, '03_desktop_stock_catalog.png'), path.join(outDir, '03_desktop_stock_catalog.png'));
  fs.copyFileSync(path.join(src18, '04_desktop_car_detail.png'), path.join(outDir, '04_desktop_car_detail.png'));
  fs.copyFileSync(path.join(src18, '05_desktop_importacion.png'), path.join(outDir, '05_desktop_importacion.png'));
  fs.copyFileSync(path.join(src18, '08_mobile_car.png'), path.join(outDir, '08_mobile_car.png'));

  console.log('All 8 files in capturas_doc19 ready!');
  fs.readdirSync(outDir).forEach(f => {
    console.log(f, fs.statSync(path.join(outDir, f)).size);
  });

  ws.close();
  p.kill();
}
run();

