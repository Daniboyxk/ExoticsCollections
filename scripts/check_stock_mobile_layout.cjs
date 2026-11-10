const { spawn } = require('child_process');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9241',
    '--user-data-dir=' + path.join(__dirname, '..', '.temp-eval-stock-viewport')
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const res = await fetch('http://127.0.0.1:9241/json/new', { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:4000/stock.html?filters=open' });
  await new Promise(r => setTimeout(r, 1500));

  const info = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tray = document.getElementById('filter-tray-container');
        tray.classList.add('is-open');
        const header = document.querySelector('.site-header');
        header.style.paddingTop = '18px';
        return {
          titleTop: document.querySelector('.hero-editorial')?.getBoundingClientRect().top,
          navHeaderTop: document.querySelector('.catalog-nav-header')?.getBoundingClientRect().top,
          trayTop: tray.getBoundingClientRect().top,
          trayHeight: tray.getBoundingClientRect().height,
          trayBottom: tray.getBoundingClientRect().bottom
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Scroll 0 layout:', info.result.value);

  ws.close();
  p.kill();
}
run();

