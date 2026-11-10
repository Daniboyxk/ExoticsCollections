const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function measure() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-ft-'));
  const port = 9325;
  const p = spawn(chromePath, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + port, '--user-data-dir=' + tempDir]);
  let t;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/new', { method: 'PUT' });
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

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:4000/' });
  await new Promise(r => setTimeout(r, 2000));

  const ft = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const footer = document.querySelector('.site-footer');
        const grid = document.querySelector('.footer-grid');
        const bottom = document.querySelector('.footer-bottom');
        const rFooter = footer.getBoundingClientRect();
        return {
          footerHeight: rFooter.height,
          footerPaddingTop: window.getComputedStyle(footer).paddingTop,
          footerPaddingBottom: window.getComputedStyle(footer).paddingBottom,
          gridPaddingBottom: window.getComputedStyle(grid).paddingBottom,
          bottomPaddingTop: window.getComputedStyle(bottom).paddingTop
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Footer measurements:', ft.result.value);
  ws.close();
  p.kill();
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
}
measure();

