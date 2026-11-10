const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-ft-shot-'));
  const port = 9330;
  const p = spawn(chromePath, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${tempDir}`]);
  let t;
  for (let i = 0; i < 20; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) { t = await res.json(); break; }
    } catch(e) {}
  }
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

  try {
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(2000);

    await send('Runtime.evaluate', {
      expression: 'document.querySelector(".site-footer").scrollIntoView({ behavior: "instant", block: "end" });'
    });
    await sleep(600);

    const shot = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 550, width: 1440, height: 350, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/footer_compact_desktop.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved footer_compact_desktop.png');
  } finally {
    ws.close();
    p.kill();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
  }
}
run();

