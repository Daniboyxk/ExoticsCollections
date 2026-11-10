const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9246',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-test-mobile-clean')
  ]);
  await sleep(1200);
  const res = await fetch('http://127.0.0.1:9246/json/new', { method: 'PUT' });
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

  // 1. CAPTURE 08: car.html on mobile WITHOUT COOKIES!
  console.log('Capturing car.html on mobile without cookies...');
  await send('Page.navigate', { url: 'http://localhost:4000/car.html' });
  await sleep(2200);

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Completely remove cookie banner
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();
        const cookieBackdrop = document.querySelector('.cookie-backdrop');
        if (cookieBackdrop) cookieBackdrop.remove();

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '28px';
          header.style.background = '#060709';
        }

        const s = document.createElement('style');
        s.innerHTML = '#cookie-banner, .cookie-banner { display: none !important; } * { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shot08 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } });
  fs.writeFileSync('C:\\EXOTICS\\.temp-car-clean.png', Buffer.from(shot08.data, 'base64'));
  console.log('Clean car.html captured! Size:', fs.statSync('C:\\EXOTICS\\.temp-car-clean.png').size);

  // 2. CAPTURE 07: stock.html on mobile showing the CAR CARDS (Visually stunning!)
  console.log('Capturing stock.html mobile car cards...');
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
  await sleep(2200);

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '28px';
          header.style.background = '#060709';
        }

        // Scroll directly to the first car in the grid!
        const firstCard = document.querySelector('.vehicle-card, .stock-card, .car-card');
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'instant', block: 'start' });
          window.scrollBy(0, -90); // offset so header doesn't cover top of card
        }

        const s = document.createElement('style');
        s.innerHTML = '#cookie-banner, .cookie-banner { display: none !important; } * { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shot07_cards = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } });
  fs.writeFileSync('C:\\EXOTICS\\.temp-stock-cards-clean.png', Buffer.from(shot07_cards.data, 'base64'));
  console.log('Clean stock cards captured! Size:', fs.statSync('C:\\EXOTICS\\.temp-stock-cards-clean.png').size);

  // Also test importacion.html on mobile (super attractive!)
  console.log('Capturing importacion.html mobile section...');
  await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
  await sleep(2200);

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();

        const header = document.querySelector('.site-header');
        if (header) {
          header.style.paddingTop = '28px';
          header.style.background = '#060709';
        }

        const s = document.createElement('style');
        s.innerHTML = '#cookie-banner, .cookie-banner { display: none !important; } * { outline: none !important; }';
        document.head.appendChild(s);
      })()
    `
  });
  await sleep(600);

  const shotImport = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } });
  fs.writeFileSync('C:\\EXOTICS\\.temp-import-mobile-clean.png', Buffer.from(shotImport.data, 'base64'));
  console.log('Clean importacion mobile captured! Size:', fs.statSync('C:\\EXOTICS\\.temp-import-mobile-clean.png').size);

  ws.close();
  p.kill();
}
run();

