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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-subpages-light-'));
  const port = 9337;
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

    const pagesToCapture = [
      { name: 'importacion', url: 'http://localhost:4000/importacion.html' },
      { name: 'stock', url: 'http://localhost:4000/stock.html' },
      { name: 'contacto', url: 'http://localhost:4000/contacto.html' }
    ];

    for (const item of pagesToCapture) {
      console.log(`Navigating to ${item.url}...`);
      await send('Page.navigate', { url: item.url });
      await sleep(1500);

      // Force theme to light via localStorage and data-theme
      await send('Runtime.evaluate', {
        expression: `(() => {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('exotics_theme_mode', 'light');
          document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
          const darkLabel = document.querySelector('#theme-toggle .theme-toggle__label--dark');
          const lightLabel = document.querySelector('#theme-toggle .theme-toggle__label--light');
          if (darkLabel) darkLabel.classList.remove('is-active');
          if (lightLabel) lightLabel.classList.add('is-active');
        })()`
      });
      await sleep(500);

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(artifactDir, `theme_light_${item.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${outPath}`);
    }
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

