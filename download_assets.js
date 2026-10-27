const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const filesToDownload = [
  { url: 'https://exoticscollections.com/images/logo_exotics.png', dest: 'logo_exotics.png' },
  { url: 'https://exoticscollections.com/images/image_about_us.jpg', dest: 'image_about_us.jpg' },
  { url: 'https://exoticscollections.com/videos/Foto_McLarens_Horizontal.jpg', dest: 'hero_poster.jpg' }
];

async function downloadFile(url, destName) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = path.join(ASSETS_DIR, destName);
    fs.writeFileSync(filePath, buffer);
    console.log(`Downloaded ${destName} (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`Failed to download ${url}:`, err.message);
  }
}

async function main() {
  for (const item of filesToDownload) {
    await downloadFile(item.url, item.dest);
  }
  console.log('Done downloading base assets.');
}

main();
