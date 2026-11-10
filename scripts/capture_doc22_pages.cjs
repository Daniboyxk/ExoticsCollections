const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9249',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-prev-22')
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const res = await fetch('http://127.0.0.1:9249/json/new', { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 6000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'file:///C:/EXOTICS/_internal/presupuestos/22_propuesta_visual_cliente_whatsapp_sin_precio.html' });
  await new Promise(r => setTimeout(r, 2000));

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
  console.log('Found cards:', rects.length);

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), scale: 1 }
    });
    const out = path.join(artifactDir, `doc22_page${i + 1}_preview.png`);
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(`Page ${i + 1} written (${fs.statSync(out).size} bytes):`, out);
  }

  p.kill();
  process.exit(0);
}

run().catch(console.error);

