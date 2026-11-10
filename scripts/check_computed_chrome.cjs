const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + path.join(__dirname, '..', '.chrome-temp-eval')
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      await fetch('http://127.0.0.1:9225/json/version');
      break;
    } catch (e) {
      await sleep(250);
    }
  }

  const res = await fetch('http://127.0.0.1:9225/json/new', { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
  await sleep(1500);

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('h1 em, h2 em, .editorial-serif-title em')).map(el => ({
        text: el.innerText.trim(),
        heading: el.parentElement.innerText.replace(/\\s+/g, ' ').trim(),
        fontStyle: window.getComputedStyle(el).fontStyle,
        color: window.getComputedStyle(el).color,
        fontWeight: window.getComputedStyle(el).fontWeight
      }))
    `,
    returnByValue: true
  });

  console.log('RESULTS:', JSON.stringify(evalRes.result.value, null, 2));

  ws.close();
  chromeProcess.kill();
}

run().catch(console.error);
