const puppeteer = require('puppeteer');
const path = require('path');

const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const targets = [
    { name: 'importacion_hero_1080p.png', width: 1920, height: 1080 },
    { name: 'importacion_hero_snapped_960.png', width: 960, height: 1000 },
    { name: 'importacion_hero_mobile_390.png', width: 390, height: 844 }
  ];

  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.width, height: t.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4000/importacion.html', { waitUntil: 'networkidle0', timeout: 15000 });
    // wait a moment for any font or transition
    await new Promise(r => setTimeout(r, 600));

    // Capture the top hero + first section
    await page.screenshot({
      path: path.join(artifactDir, t.name),
      clip: { x: 0, y: 0, width: t.width, height: Math.min(t.height, 950) }
    });
    await page.close();
  }

  await browser.close();
  console.log('Screenshots captured successfully.');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

