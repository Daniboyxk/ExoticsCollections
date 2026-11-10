const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const targets = [
  {
    name: 'importacion_hero_snapped_960.png',
    size: '--window-size=960,1050',
    url: 'http://localhost:4000/importacion.html'
  },
  {
    name: 'importacion_hero_mobile_390.png',
    size: '--window-size=390,844',
    url: 'http://localhost:4000/importacion.html'
  },
  {
    name: 'importacion_hero_desktop_1920.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/importacion.html'
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

