const { execFileSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlFile = 'file:///C:/EXOTICS/_internal/presupuestos/13_directrices_ultra_estrictas_luxury_informe.html';
const pdfFile = 'C:\\EXOTICS\\_internal\\presupuestos\\13_directrices_ultra_estrictas_luxury_informe.pdf';

execFileSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=' + pdfFile,
  htmlFile
]);
console.log('PDF 13 generated successfully.');

