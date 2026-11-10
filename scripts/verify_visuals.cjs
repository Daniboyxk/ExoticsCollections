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
  const { p, ws, send } = await connectChrome(9255, '.temp-verify-visuals');
  try {
    await send('Page.enable');
    
    // 1. Desktop 1440x900 - Home top
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:4000/' });
    await sleep(2200);

    const shotHomeTop = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 260, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_home_seamless_top.png', Buffer.from(shotHomeTop.data, 'base64'));

    // 2. Desktop - Importacion page hero & header top
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);

    const shotImportTop = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 350, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_import_seamless_top.png', Buffer.from(shotImportTop.data, 'base64'));

    // 3. Desktop - Importacion scrolled down (header over content)
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 520);' });
    await sleep(600);
    const shotImportScrolled = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 1440, height: 220, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/header_import_scrolled.png', Buffer.from(shotImportScrolled.data, 'base64'));

    // 4. Form inputs & selects capture
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('.mechatronik-form-pane');
          if (form) form.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()
      `
    });
    await sleep(600);

    // Hover on req-budget
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('req-budget');
          if (el) el.focus();
        })()
      `
    });
    await sleep(400);

    const formBox = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('.mechatronik-form-pane');
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: r.width + 40, height: r.height + 40 };
        })()
      `,
      returnByValue: true
    });

    if (formBox && formBox.result && formBox.result.value) {
      const b = formBox.result.value;
      const shotForm = await send('Page.captureScreenshot', {
        clip: { x: b.x, y: b.y, width: b.width, height: b.height, scale: 2 }
      });
      fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_form_selects_hover.png', Buffer.from(shotForm.data, 'base64'));
    }

    // 5. Mobile iPhone 14 Pro (393 x 852)
    await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 3, mobile: true });
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);

    const shotMobileHero = await send('Page.captureScreenshot', {
      clip: { x: 0, y: 0, width: 393, height: 650, scale: 2 }
    });
    fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/import_mobile_seamless.png', Buffer.from(shotMobileHero.data, 'base64'));

    console.log('All visual verification screenshots generated successfully!');
  } finally {
    ws.close();
    p.kill();
  }
}

run();

