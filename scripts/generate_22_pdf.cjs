const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlFile = 'C:\\EXOTICS\\_internal\\presupuestos\\22_propuesta_visual_cliente_whatsapp_sin_precio.html';
const pdfFile = 'C:\\EXOTICS\\_internal\\presupuestos\\22_propuesta_visual_cliente_whatsapp_sin_precio.pdf';

const cmd = `"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="${pdfFile}" "file:///${htmlFile.replace(/\\/g, '/')}"`;

console.log('Generating Document 22 PDF...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFile)) {
  const stats = fs.statSync(pdfFile);
  console.log(`Document 22 PDF generated successfully: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('Failed to generate Document 22 PDF.');
  process.exit(1);
}

