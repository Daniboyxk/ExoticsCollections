const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function connectChrome(port, dir) {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--user-data-dir=' + path.join(__dirname, '..', dir)
  ]);
  
  let res, t;
  for (let i = 0; i < 15; i++) {
    await sleep(400);
    try {
      res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) {
        t = await res.json();
        break;
      }
    } catch(e) {}
  }
  if (!t) throw new Error('Could not connect to Chrome on port ' + port);
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

  return { p, ws, send };
}

async function run() {
  const { p, ws, send } = await connectChrome(9250, '.temp-header-test-2');
  try {
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    
    // Top of Home
    await send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(2500);

    const shot1 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 260, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_current_top.png', Buffer.from(shot1.data, 'base64'));

    // Scrolled on Home
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 450);' });
    await sleep(800);
    const shot2 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 260, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_current_scrolled.png', Buffer.from(shot2.data, 'base64'));

    // Importacion page
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);
    const shot3 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 350, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_import_top.png', Buffer.from(shot3.data, 'base64'));

    console.log('Done capturing screenshots');
  } finally {
    ws.close();
    p.kill();
  }
}
run();
