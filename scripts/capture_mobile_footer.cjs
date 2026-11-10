const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testMobileFooter() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mob-ft-'));
  const port = 9339;
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + tmpDir,
    '--disable-gpu',
    '--no-first-run'
  ]);

  try {
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:4000/importacion.html' });
    await new Promise(r => setTimeout(r, 1500));

    const evalRes = await send('Runtime.evaluate', {
      expression: '(() => { const f = document.querySelector(".site-footer"); return f ? f.getBoundingClientRect().height : 0; })()'
    });
    console.log('Mobile footer height:', evalRes.result.value);

    await send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, document.body.scrollHeight)'
    });
    await new Promise(r => setTimeout(r, 500));

    const scr = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52\\footer_compact_mobile.png';
    fs.writeFileSync(outPath, Buffer.from(scr.data, 'base64'));
    console.log('Mobile screenshot saved to', outPath);

    ws.close();
  } finally {
    proc.kill();
    setTimeout(() => {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(e){}
    }, 500);
  }
}
testMobileFooter().catch(console.error);
