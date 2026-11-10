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
  for (let i = 0; i < 20; i++) {
    await sleep(350);
    try {
      res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) { t = await res.json(); break; }
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
  const { p, ws, send } = await connectChrome(9270, '.temp-new-visuals');
  try {
    await send('Page.enable');
    
    // 1. Desktop 1440x900 - Split Hero aligned with logo & container
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);

    const shotHero = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 860, scale: 1.5 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_hero_aligned_logo.png', Buffer.from(shotHero.data, 'base64'));

    // 2. Form with 3 dropdowns & larger brand chips
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('.mechatronik-form-pane');
          if (form) form.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    await sleep(600);

    const boxForm = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('.mechatronik-form-pane');
          const r = form.getBoundingClientRect();
          return { x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 20 };
        })()
      `,
      returnByValue: true
    });

    if (boxForm && boxForm.result && boxForm.result.value) {
      const b = boxForm.result.value;
      const shotForm = await send('Page.captureScreenshot', {
        clip: { x: Math.max(0, b.x), y: Math.max(0, b.y), width: b.width, height: b.height, scale: 1.5 }
      });
      fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_form_three_selects.png', Buffer.from(shotForm.data, 'base64'));
    }

    // 3. Section 03 - Proceso 5 Fases Unificado
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sec = document.getElementById('proceso');
          if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
        })()
      `
    });
    await sleep(600);

    const shotProceso = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 600, scale: 1.5 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_proceso_unified.png', Buffer.from(shotProceso.data, 'base64'));

    // 4. Mobile iPhone 14 Pro
    await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);

    const shotMobile = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 393, height: 750, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_mobile_perfect_split.png', Buffer.from(shotMobile.data, 'base64'));

    console.log('Visual captures completed successfully');
  } finally {
    ws.close();
    p.kill();
  }
}

run();

