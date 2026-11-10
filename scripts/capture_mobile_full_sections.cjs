const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mobile-sections-'));
  const port = 9350;
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`
  ]);

  let target;
  for (let i = 0; i < 25; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) {
        target = await res.json();
        break;
      }
    } catch (_) {}
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let reqId = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data.result);
      callbacks.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    const shots = [
      { name: 'm_home_bento', url: 'http://localhost:4000/', scroll: 900 },
      { name: 'm_home_footer', url: 'http://localhost:4000/', scroll: 3200 },
      { name: 'm_import_form', url: 'http://localhost:4000/importacion.html', scroll: 600 },
      { name: 'm_import_method', url: 'http://localhost:4000/importacion.html', scroll: 1500 },
      { name: 'm_import_faqs', url: 'http://localhost:4000/importacion.html', scroll: 2600 },
      { name: 'm_stock_cards', url: 'http://localhost:4000/stock.html', scroll: 400 },
      { name: 'm_contacto_cards', url: 'http://localhost:4000/contacto.html', scroll: 200 },
      { name: 'm_about_team', url: 'http://localhost:4000/sobre-nosotros.html', scroll: 800 }
    ];

    for (const s of shots) {
      console.log(`Navigating to ${s.url} @ ${s.scroll}...`);
      await send('Page.navigate', { url: s.url });
      await sleep(1200);
      await send('Runtime.evaluate', {
        expression: `(() => {
          document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
          window.scrollTo({ top: ${s.scroll}, behavior: 'instant' });
        })()`
      });
      await sleep(500);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, `${s.name}.png`), Buffer.from(shot.data, 'base64'));
    }

    console.log('Mobile section captures complete!');
  } finally {
    ws.close();
    p.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

