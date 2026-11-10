const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-shot-'));
  const port = 9310;
  console.log('Spawning Chrome with temp dir:', tempDir);
  
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`
  ]);
  
  let res, t;
  for (let i = 0; i < 25; i++) {
    await sleep(300);
    try {
      res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) { t = await res.json(); break; }
    } catch(e) {}
  }
  if (!t) {
    p.kill();
    throw new Error('Could not connect to Chrome debugging port');
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
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1.5, mobile: false });
    
    // 1. Hero filling entire screen 1 (no section 2 visible)
    console.log('Navigating to importacion.html...');
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2200);

    console.log('Capturing screen 1...');
    const shotScreen1 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 900, scale: 1.5 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_hero_fullscreen_exact.png', Buffer.from(shotScreen1.data, 'base64'));

    // 2. Scrolled directly to Section 2 (#solicitar-busqueda)
    console.log('Scrolling to section 2...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sec = document.getElementById('solicitar-busqueda');
          if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
        })()
      `
    });
    await sleep(800);

    console.log('Capturing section 2...');
    const shotScreen2 = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 900, scale: 1.5 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_sec2_fits_screen.png', Buffer.from(shotScreen2.data, 'base64'));

    // 3. New Contact Page
    console.log('Navigating to contacto.html...');
    await send('Page.navigate', { url: 'http://localhost:4000/contacto.html' });
    await sleep(2200);

    console.log('Capturing contacto.html...');
    const shotContacto = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 900, scale: 1.5 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/contacto_page_desktop.png', Buffer.from(shotContacto.data, 'base64'));

    console.log('All screenshots captured successfully!');
  } finally {
    ws.close();
    p.kill();
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
  }
}

run();
