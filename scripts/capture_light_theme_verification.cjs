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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-theme-verify-'));
  const port = 9342;
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
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    // 1. Contacto in Light Mode
    console.log('Capturing contacto in Light Mode...');
    await send('Page.navigate', { url: 'http://localhost:4000/contacto.html' });
    await sleep(1200);
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
      })()`
    });
    await sleep(500);
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'theme_light_contacto_fixed.png'), Buffer.from(shot.data, 'base64'));

    // 2. Contacto in Dark Mode
    console.log('Capturing contacto in Dark Mode...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.removeAttribute('data-theme');
      })()`
    });
    await sleep(400);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'theme_dark_contacto_fixed.png'), Buffer.from(shot.data, 'base64'));

    // 3. Stock in Light Mode
    console.log('Capturing stock in Light Mode...');
    await send('Page.navigate', { url: 'http://localhost:4000/stock.html' });
    await sleep(1500);
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
        window.scrollTo({ top: 380, behavior: 'instant' });
      })()`
    });
    await sleep(600);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'theme_light_stock_cards_fixed.png'), Buffer.from(shot.data, 'base64'));

    // 4. Importacion FAQs in Light Mode
    console.log('Capturing importacion FAQs in Light Mode...');
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(1500);
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
        const el = document.getElementById('heading-faq');
        if (el) el.scrollIntoView({ behavior: 'instant' });
      })()`
    });
    await sleep(600);
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'theme_light_importacion_faqs_fixed.png'), Buffer.from(shot.data, 'base64'));

    // 5. Header Toggle in Dark and Light mode
    console.log('Capturing header theme toggle in Dark and Light...');
    await send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(1200);
    // Dark header
    shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 110, scale: 2 }
    });
    fs.writeFileSync(path.join(artifactDir, 'header_toggle_dark.png'), Buffer.from(shot.data, 'base64'));

    // Light header
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      })()`
    });
    await sleep(400);
    shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 110, scale: 2 }
    });
    fs.writeFileSync(path.join(artifactDir, 'header_toggle_light.png'), Buffer.from(shot.data, 'base64'));

    console.log('All verification captures completed successfully!');
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

