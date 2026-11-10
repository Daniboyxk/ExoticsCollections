const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-computed-check-'));
  const port = 9338;
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
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(1500);

    const comp = await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const el = document.getElementById('imp-hero-title');
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          textShadow: s.textShadow,
          classList: Array.from(el.classList),
          parentTag: el.parentElement.tagName
        };
      })()`,
      returnByValue: true
    });
    console.log('Computed for #imp-hero-title:', comp.result.value);

    await send('Page.navigate', { url: 'http://localhost:4000/contacto.html' });
    await sleep(1500);
    const comp2 = await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const el = document.querySelector('.hero-title');
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          textShadow: s.textShadow
        };
      })()`,
      returnByValue: true
    });
    console.log('Computed for contacto .hero-title:', comp2.result.value);
  } finally {
    ws.close();
    p.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

run();

