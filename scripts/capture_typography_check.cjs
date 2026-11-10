const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const targets = [
  {
    name: 'verify_home_hero_clean.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/'
  },
  {
    name: 'verify_importacion_clean.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/importacion.html'
  }
];

const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';

for (const t of targets) {
  const outPath = `${artifactDir}\\${t.name}`;
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    t.size,
    `--screenshot=${outPath}`,
    t.url
  ]);
  console.log(`Captured ${t.name}`);
}
