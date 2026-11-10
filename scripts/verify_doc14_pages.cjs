const { execFileSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';
const htmlUrl = 'file:///C:/EXOTICS/_internal/presupuestos/14_propuesta_visual_cliente_whatsapp_sin_precio.html';

// Let's also check if each page card has clean alignment
const pages = [
  { name: 'doc14_page1_preview.png', y: 0 },
  { name: 'doc14_page2_preview.png', y: 1130 },
  { name: 'doc14_page3_preview.png', y: 2260 },
  { name: 'doc14_page4_preview.png', y: 3390 }
];

console.log('Capturing individual page previews...');
for (let i = 0; i < pages.length; i++) {
  const p = pages[i];
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1200,1130',
    '--screenshot=' + path.join(artifactDir, p.name),
    htmlUrl
  ]);
  console.log('Page preview checked:', p.name);
}
