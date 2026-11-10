const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const outPath = `C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52\\importacion_form_scroll.png`;
execFileSync(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=1920,3800',
  `--screenshot=${outPath}`,
  'http://localhost:4000/importacion.html'
]);
console.log('Saved 1920x3800');
