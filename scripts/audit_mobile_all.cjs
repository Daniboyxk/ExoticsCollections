const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mobile-audit-'));
  const port = 9348;
  const p = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`
  ]);

  let target;
  for (let i = 0; i < 25; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) {
        target = await res.json();
        break;
      }
    } catch (_) {}
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let reqId = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data.result);
      callbacks.delete(data.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    const pages = [
      { name: 'home', url: 'http://localhost:4000/' },
      { name: 'importacion', url: 'http://localhost:4000/importacion.html' },
      { name: 'stock', url: 'http://localhost:4000/stock.html' },
      { name: 'contacto', url: 'http://localhost:4000/contacto.html' },
      { name: 'sobre-nosotros', url: 'http://localhost:4000/sobre-nosotros.html' }
    ];

    const auditResults = [];

    for (const pg of pages) {
      console.log(`Auditing mobile page: ${pg.name}...`);
      await send('Page.navigate', { url: pg.url });
      await sleep(1400);

      const pageAudit = await send('Runtime.evaluate', {
        expression: `(() => {
          document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const hasHScroll = docW > winW + 1;

          // Find overflowing elements
          const overflowing = [];
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > winW + 2) {
              overflowing.push({
                tag: el.tagName,
                cls: el.className,
                id: el.id,
                right: Math.round(r.right),
                width: Math.round(r.width)
              });
            }
          });

          // Check inputs font-size
          const smallInputs = [];
          document.querySelectorAll('input, select, textarea').forEach(el => {
            const fs = parseFloat(window.getComputedStyle(el).fontSize);
            if (fs < 16) {
              smallInputs.push({
                tag: el.tagName,
                id: el.id,
                cls: el.className,
                fontSize: fs
              });
            }
          });

          // Check tap targets < 44x44
          const smallTaps = [];
          document.querySelectorAll('button, a.btn, a.btn-primary, a.btn-secondary, .theme-toggle, .menu-toggle').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40)) {
              smallTaps.push({
                tag: el.tagName,
                text: el.innerText.slice(0, 20),
                w: Math.round(r.width),
                h: Math.round(r.height)
              });
            }
          });

          return {
            docW,
            winW,
            hasHScroll,
            overflowCount: overflowing.length,
            overflowSample: overflowing.slice(0, 5),
            smallInputs,
            smallTaps
          };
        })()`,
        returnByValue: true
      });

      console.log(`Result for ${pg.name}:`, JSON.stringify(pageAudit.result.value, null, 2));
      auditResults.push({ page: pg.name, ...pageAudit.result.value });

      // Take screenshot of mobile top
      let shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, `mobile_${pg.name}_hero.png`), Buffer.from(shot.data, 'base64'));

      // Also take screenshot in Light Mode
      await send('Runtime.evaluate', {
        expression: `(() => {
          document.documentElement.setAttribute('data-theme', 'light');
        })()`
      });
      await sleep(350);
      shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(artifactDir, `mobile_${pg.name}_light_hero.png`), Buffer.from(shot.data, 'base64'));
    }

    fs.writeFileSync(
      path.join(artifactDir, 'mobile_audit_report.json'),
      JSON.stringify(auditResults, null, 2)
    );
    console.log('Mobile audit complete! Saved results to mobile_audit_report.json');
  } finally {
    ws.close();
    p.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

