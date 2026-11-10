const { execFileSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\DANIBOYXK\\.gemini\\antigravity\\brain\\88bd2602-c8fd-4415-90f3-ff7c89614d52';
const htmlUrl = 'file:///C:/EXOTICS/_internal/presupuestos/16_propuesta_visual_cliente_whatsapp_sin_precio.html';

// Capture full preview of doc 16
execFileSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1200,4800',
  '--screenshot=' + path.join(artifactDir, 'doc16_full_preview.png'),
  htmlUrl
]);

console.log('Doc 16 full preview captured successfully.');

