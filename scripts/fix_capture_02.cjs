const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const path = require('path');
const fs = require('fs');

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-check-02')
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const res = await fetch('http://127.0.0.1:9225/json/new', { method: 'PUT' });
  const t = await res.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const cb = new Map();
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.id && cb.has(d.id)) { cb.get(d.id)(d.result); cb.delete(d.id); }
  };
  function send(m, p = {}) {
    return new Promise(r => { const i = id++; cb.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await new Promise(r => setTimeout(r, 1800));

  const offset = await send('Runtime.evaluate', {
    expression: 'document.getElementById("importaciones").offsetTop'
  });
  const top = (offset.result && offset.result.value) || 920;
  console.log('Offset of #importaciones:', top);

  // Remove focus rings and outline
  await send('Runtime.evaluate', {
    expression: 'document.querySelectorAll(":focus").forEach(e => e.blur()); const s = document.createElement("style"); s.innerHTML = "* { outline: none !important; }"; document.head.appendChild(s);'
  });

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: top, width: 1920, height: 960, scale: 1 }
  });
  fs.writeFileSync('C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc16\\02_desktop_section2_index.png', Buffer.from(shot.data, 'base64'));
  console.log('02_desktop_section2_index.png re-captured properly!');

  ws.close();
  p.kill();
}
run();
