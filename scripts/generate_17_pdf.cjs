const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlFile = 'file:///C:/EXOTICS/_internal/presupuestos/17_propuesta_visual_cliente_whatsapp_sin_precio.html';
const pdfFile = 'C:\\EXOTICS\\_internal\\presupuestos\\17_propuesta_visual_cliente_whatsapp_sin_precio.pdf';

execFileSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=' + pdfFile,
  htmlFile
]);
console.log('PDF 17 generated successfully.');

