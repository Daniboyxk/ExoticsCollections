const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9247',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-prev-20')
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const res = await fetch('http://127.0.0.1:9247/json/new', { method: 'PUT' });
  const t = await res.json();
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

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 1200, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'file:///C:/EXOTICS/_internal/presupuestos/20_propuesta_visual_cliente_whatsapp_sin_precio.html' });
  await new Promise(r => setTimeout(r, 1600));

  const cards = await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('.page-card')).map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
      })
    `,
    returnByValue: true
  });

  const rects = cards.result.value;
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 },
      captureBeyondViewport: true
    });
    fs.writeFileSync(path.join(artifactDir, `doc20_page${i + 1}_preview.png`), Buffer.from(shot.data, 'base64'));
    console.log(`Doc 20 Page ${i + 1} captured!`);
  }

  ws.close();
  p.kill();
}
run();

