const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const targets = [
  {
    name: 'importacion_faq_desktop.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/importacion.html#faq'
  },
  {
    name: 'importacion_faq_mobile.png',
    size: '--window-size=390,950',
    url: 'http://localhost:4000/importacion.html#faq'
  }
];

for (const t of targets) {
  const outPath = `C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52\\${t.name}`;
  execFileSync(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    t.size,
    `--screenshot=${outPath}`,
    t.url
  ]);
  console.log(`Saved: ${t.name}`);
}

