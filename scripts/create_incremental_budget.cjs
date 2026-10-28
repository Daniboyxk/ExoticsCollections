const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRESUPUESTOS_DIR = 'C:\\EXOTICS\\presupuestos';
const ROOT_DIR = 'C:\\EXOTICS';

function getNextBudgetNumber() {
  const files = fs.readdirSync(PRESUPUESTOS_DIR);
  let maxNum = 0;
  for (const f of files) {
    const match = f.match(/^(\d+)_.+/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return maxNum + 1;
}

function formatDateSpanish(date = new Date()) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

function generateIncrementalBudget(customSlug = 'actualizado_v', customNotes = '') {
  const nextNum = getNextBudgetNumber();
  const nextNumStr = String(nextNum).padStart(2, '0');
  const dateStr = formatDateSpanish();
  const slug = `${customSlug}${nextNum}`;
  
  const targetHtmlName = `${nextNumStr}_presupuesto_${slug}.html`;
  const targetPdfName = `${nextNumStr}_presupuesto_${slug}.pdf`;
  const targetHtmlPath = path.join(PRESUPUESTOS_DIR, targetHtmlName);
  const targetPdfPath = path.join(PRESUPUESTOS_DIR, targetPdfName);
  
  console.log(`[Budget Engine] Creating version ${nextNumStr}: ${targetHtmlName}...`);

  // Read template from root presupuesto.html
  let html = fs.readFileSync(path.join(ROOT_DIR, 'presupuesto.html'), 'utf8');

  // Update relative asset paths for presupuestos/ folder
  html = html.replaceAll('assets/logo_exotics.png', '../assets/logo_exotics.png');
  html = html.replaceAll('href="index.html"', 'href="../index.html"');

  // Update Reference Code and Date in HTML
  html = html.replace(/Ref:\s*<strong>PROP-2026-EXOTICS-[^<]+<\/strong>/g, `Ref: <strong>PROP-2026-EXOTICS-${nextNumStr}</strong>`);
  html = html.replace(/Fecha:\s*<strong>[^<]+<\/strong>/g, `Fecha: <strong>${dateStr}</strong>`);

  fs.writeFileSync(targetHtmlPath, html, 'utf8');
  console.log(`[Budget Engine] Saved HTML: ${targetHtmlPath}`);

  // Compile PDF via Headless Chrome
  console.log(`[Budget Engine] Compiling PDF via Chrome Headless...`);
  const chromeCmd = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--headless', '--no-sandbox', '--disable-gpu', '--print-to-pdf=${targetPdfPath}', 'http://localhost:4000/presupuestos/${targetHtmlName}' -Wait -NoNewWindow`;
  
  try {
    execSync(`powershell -Command "${chromeCmd}"`, { stdio: 'inherit' });
    console.log(`[Budget Engine] Successfully compiled PDF: ${targetPdfPath}`);
  } catch (err) {
    console.error(`[Budget Engine] Error compiling PDF:`, err.message);
  }

  // Update README.md
  const readmePath = path.join(PRESUPUESTOS_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const newRow = `| **${nextNumStr}** | \`PROP-2026-EXOTICS-${nextNumStr}\` | ${new Date().toLocaleDateString('es-ES')} | **1.850,00 €** (+ 79 €/mes opc.) | **2.238,50 €** | [HTML](file:///c:/EXOTICS/presupuestos/${targetHtmlName}) · [PDF](file:///c:/EXOTICS/presupuestos/${targetPdfName}) | **Presupuesto Actualizado Nº ${nextNumStr}**: ${customNotes || 'Versión incremental con las últimas características del catálogo editorial y arquitectura multi-página.'} |\n`;
    
    // Insert before the separator
    readme = readme.replace(/\n---\n\n## 🎯 Resumen/, `\n${newRow}\n---\n\n## 🎯 Resumen`);
    fs.writeFileSync(readmePath, readme, 'utf8');
    console.log(`[Budget Engine] Updated README.md index table.`);
  }

  return { nextNumStr, targetHtmlName, targetPdfName };
}

if (require.main === module) {
  const slugArg = process.argv[2] || 'actualizado_v';
  const notesArg = process.argv[3] || '';
  generateIncrementalBudget(slugArg, notesArg);
}

module.exports = { generateIncrementalBudget, getNextBudgetNumber };
