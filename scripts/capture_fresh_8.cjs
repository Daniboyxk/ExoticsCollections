const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc15';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Chrome with debugging port 9222...');
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + path.join(__dirname, '..', '.chrome-temp')
  ]);

  // Wait for Chrome to be ready
  let version = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      version = await res.json();
      break;
    } catch (e) {
      await sleep(250);
    }
  }

  if (!version) {
    console.error('Failed to connect to Chrome CDP.');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Chrome CDP ready:', version.Browser);

  async function createCdpSession() {
    const res = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
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
        await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
      } catch (e) {}
    }

    return { send, close };
  }

  const tasks = [
    // 1. Desktop Portada
    {
      name: '01_desktop_portada.png',
      url: 'http://localhost:4000/',
      width: 1920,
      height: 1080,
      scale: 2,
      mobile: false,
      action: async (session) => {
        await sleep(1500);
      }
    },
    // 2. Desktop Stock Filtros Abiertos
    {
      name: '02_desktop_stock_filtros.png',
      url: 'http://localhost:4000/stock.html',
      width: 1920,
      height: 1080,
      scale: 2,
      mobile: false,
      action: async (session) => {
        await sleep(1200);
        await session.send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('btn-filter-toggle');
            if (btn) btn.click();
            const tray = document.getElementById('filter-tray-container');
            if (tray) {
              tray.classList.add('open');
              tray.style.display = 'block';
              tray.setAttribute('aria-hidden', 'false');
            }
          `
        });
        await sleep(600);
      }
    },
    // 3. Desktop Bento Grid
    {
      name: '03_desktop_stock_bento.png',
      url: 'http://localhost:4000/stock.html',
      width: 1920,
      height: 1080,
      scale: 2,
      mobile: false,
      action: async (session) => {
        await sleep(1200);
        await session.send('Runtime.evaluate', {
          expression: `window.scrollTo(0, 360);`
        });
        await sleep(600);
      }
    },
    // 4. Desktop Car Detail
    {
      name: '04_desktop_car_detail.png',
      url: 'http://localhost:4000/car.html',
      width: 1920,
      height: 1080,
      scale: 2,
      mobile: false,
      action: async (session) => {
        await sleep(1500);
      }
    },
    // 5. Desktop Importación Split 50/50
    {
      name: '05_desktop_importacion.png',
      url: 'http://localhost:4000/importacion.html',
      width: 1920,
      height: 1080,
      scale: 2,
      mobile: false,
      action: async (session) => {
        await sleep(1200);
      }
    },
    // 6. Mobile iPhone Portada
    {
      name: '06_mobile_portada.png',
      url: 'http://localhost:4000/',
      width: 390,
      height: 844,
      scale: 3,
      mobile: true,
      action: async (session) => {
        await sleep(1500);
      }
    },
    // 7. Mobile iPhone Stock & Filtros
    {
      name: '07_mobile_stock_filtros.png',
      url: 'http://localhost:4000/stock.html',
      width: 390,
      height: 844,
      scale: 3,
      mobile: true,
      action: async (session) => {
        await sleep(1200);
        await session.send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('btn-filter-toggle');
            if (btn) btn.click();
            const tray = document.getElementById('filter-tray-container');
            if (tray) {
              tray.classList.add('open');
              tray.style.display = 'block';
              tray.setAttribute('aria-hidden', 'false');
            }
          `
        });
        await sleep(600);
      }
    },
    // 8. Mobile iPhone Car Detail & Reserva
    {
      name: '08_mobile_car_detail.png',
      url: 'http://localhost:4000/car.html',
      width: 390,
      height: 844,
      scale: 3,
      mobile: true,
      action: async (session) => {
        await sleep(1500);
      }
    }
  ];

  for (const t of tasks) {
    console.log(`Capturing ${t.name}...`);
    const session = await createCdpSession();
    await session.send('Page.enable');
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: t.width,
      height: t.height,
      deviceScaleFactor: t.scale,
      mobile: t.mobile
    });

    await session.send('Page.navigate', { url: t.url });
    await t.action(session);

    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const buf = Buffer.from(shot.data, 'base64');
    const outPath = path.join(outDir, t.name);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved ${t.name} (${buf.length} bytes)`);
    await session.close();
  }

  chromeProcess.kill();
  console.log('All 8 fresh screenshots captured successfully via CDP.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

