const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc16';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('Launching headless Chrome with port 9224...');
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--remote-debugging-port=9224',
    '--user-data-dir=' + path.join(__dirname, '..', '.chrome-temp-16')
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      await fetch('http://127.0.0.1:9224/json/version');
      break;
    } catch (e) {
      await sleep(250);
    }
  }

  async function createCdpSession() {
    const res = await fetch('http://127.0.0.1:9224/json/new', { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { resolve, reject } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    async function close() {
      try {
        ws.close();
        await fetch(`http://127.0.0.1:9224/json/close/${target.id}`);
      } catch (e) {}
    }

    return { send, close };
  }

  // Common clean script to remove any focus rings or blue borders
  const cleanScript = `
    document.querySelectorAll(':focus').forEach(el => el.blur());
    const style = document.createElement('style');
    style.innerHTML = '* { outline: none !important; -webkit-focus-ring-color: transparent !important; } ::selection { background: transparent !important; }';
    document.head.appendChild(style);
  `;

  // 1. Desktop Portada
  {
    console.log('Capturing 01_desktop_portada.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
    await session.send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: cleanScript });
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 960, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, '01_desktop_portada.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 2. Desktop Section 2 of index.html ((02) — IMPORTACIONES RECIENTES)
  {
    console.log('Capturing 02_desktop_section2_index.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
    await session.send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: cleanScript });
    await session.send('Runtime.evaluate', {
      expression: `
        const sec = document.getElementById('importaciones');
        if (sec) {
          const top = sec.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top);
        }
      `
    });
    await sleep(800);
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 960, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, '02_desktop_section2_index.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 3. Desktop Stock Catalog
  {
    console.log('Capturing 03_desktop_stock_catalog.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
    await session.send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: cleanScript });
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 960, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, '03_desktop_stock_catalog.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 4. Desktop Car Detail
  {
    console.log('Capturing 04_desktop_car_detail.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
    await session.send('Page.navigate', { url: 'http://localhost:4000/car.html' });
    await sleep(1600);
    await session.send('Runtime.evaluate', { expression: cleanScript });
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 960, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, '04_desktop_car_detail.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 5. Desktop Importación Split 50/50 (Complete, Wide, not cropped)
  {
    console.log('Capturing 05_desktop_importacion.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
    await session.send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: cleanScript });
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 950, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, '05_desktop_importacion.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // Common mobile safe-area script (ensures logo is NOT clipped by Dynamic Island)
  const mobileSafeAreaScript = `
    ${cleanScript}
    const header = document.querySelector('.site-header');
    if (header) {
      header.style.paddingTop = '16px';
    }
  `;

  // 6. Mobile Portada iPhone (Safe Area top so logo is NOT clipped)
  {
    console.log('Capturing 06_mobile_portada.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await session.send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: mobileSafeAreaScript });
    await sleep(200);
    const shot = await session.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, '06_mobile_portada.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 7. Mobile Stock iPhone
  {
    console.log('Capturing 07_mobile_stock.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await session.send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: mobileSafeAreaScript });
    await session.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 230);' });
    await sleep(500);
    const shot = await session.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, '07_mobile_stock.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  // 8. Mobile Car Detail iPhone
  {
    console.log('Capturing 08_mobile_car.png...');
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await session.send('Page.navigate', { url: 'http://localhost:4000/car.html' });
    await sleep(1500);
    await session.send('Runtime.evaluate', { expression: mobileSafeAreaScript });
    await sleep(200);
    const shot = await session.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, '08_mobile_car.png'), Buffer.from(shot.data, 'base64'));
    await session.close();
  }

  chromeProcess.kill();
  console.log('All 8 fresh screenshots for Doc 16 captured successfully.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
