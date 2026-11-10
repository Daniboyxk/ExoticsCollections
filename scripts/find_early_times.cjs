const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9230',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-test-times-early')
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const res = await fetch('http://127.0.0.1:9230/json/new', { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await new Promise(r => setTimeout(r, 1500));

  for (let t = 0; t <= 3.5; t += 0.5) {
    await send('Runtime.evaluate', {
      expression: `(() => { const v = document.querySelector('video'); if (v) { v.pause(); v.currentTime = ${t}; } })()`
    });
    await new Promise(r => setTimeout(r, 400));
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 50, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 0.3 } });
    fs.writeFileSync(path.join(__dirname, '..', `.temp-test-${t}s.jpg`), Buffer.from(shot.data, 'base64'));
    console.log('Saved', t);
  }

  ws.close();
  p.kill();
}
run();

