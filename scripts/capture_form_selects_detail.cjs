const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9260',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-selects-detail')
  ]);
  
  let res, t;
  for (let i = 0; i < 20; i++) {
    await sleep(350);
    try {
      res = await fetch('http://127.0.0.1:9260/json/new', { method: 'PUT' });
      if (res.ok) { t = await res.json(); break; }
    } catch(e) {}
  }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.id && cb.has(d.id)) { cb.get(d.result); cb.delete(d.id); }
  };
  function send(m, params = {}) {
    return new Promise(r => { const i = id++; cb.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params })); });
  }

  try {
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await sleep(2000);

    // Scroll to the form inputs
    const box = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const formTwoCol = document.querySelector('.form-two-col');
          if (formTwoCol) {
            formTwoCol.scrollIntoView({ behavior: 'instant', block: 'center' });
            const r = formTwoCol.getBoundingClientRect();
            return { x: r.x - 20, y: r.y - 20, width: r.width + 40, height: r.height + 40 };
          }
          return null;
        })()
      `,
      returnByValue: true
    });

    if (box && box.result && box.result.value) {
      const b = box.result.value;
      const shot = await send('Page.captureScreenshot', {
        clip: { x: Math.max(0, b.x), y: Math.max(0, b.y), width: b.width, height: b.height, scale: 2 }
      });
      fs.writeFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/form_selects_detail.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved form_selects_detail.png');
    }
  } finally {
    ws.close();
    p.kill();
  }
}

run();

