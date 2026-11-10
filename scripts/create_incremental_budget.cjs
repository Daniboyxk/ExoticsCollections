const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PRESUPUESTOS_DIR = path.join(ROOT_DIR, '_internal', 'presupuestos');
const TEMPLATE_PATH = path.join(PRESUPUESTOS_DIR, 'template_maestro.html');

function findChromeExecutable() {
  const candidates = [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];
  return candidates.find((p) => p && fs.existsSync(p)) || null;
}

function getNextBudgetNumber() {
  if (!fs.existsSync(PRESUPUESTOS_DIR)) return 1;
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
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`No se encontró la plantilla maestra en ${TEMPLATE_PATH}`);
  }

  const nextNum = getNextBudgetNumber();
  const nextNumStr = String(nextNum).padStart(2, '0');
  const dateStr = formatDateSpanish();
  const slug = `${customSlug}${nextNum}`;

  const targetHtmlName = `${nextNumStr}_presupuesto_${slug}.html`;
  const targetPdfName = `${nextNumStr}_presupuesto_${slug}.pdf`;
  const targetHtmlPath = path.join(PRESUPUESTOS_DIR, targetHtmlName);
  const targetPdfPath = path.join(PRESUPUESTOS_DIR, targetPdfName);

  console.log(`[Budget Engine] Creando versión inmutable ${nextNumStr}: ${targetHtmlName}...`);

  let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  html = html.replaceAll('assets/logo_exotics.png', '../assets/logo_exotics.png');
  html = html.replace(/Ref:\s*<strong>PROP-2026-EXOTICS-[^<]+<\/strong>/g, `Ref: <strong>PROP-2026-EXOTICS-${nextNumStr}</strong>`);
  html = html.replace(/Fecha:\s*<strong>[^<]+<\/strong>/g, `Fecha: <strong>${dateStr}</strong>`);

  fs.writeFileSync(targetHtmlPath, html, 'utf8');
  console.log(`[Budget Engine] HTML guardado en: ${targetHtmlPath}`);

  const chromeExe = findChromeExecutable();
  if (chromeExe) {
    try {
      const fileUrl = 'file:///' + targetHtmlPath.replace(/\\/g, '/');
      execFileSync(chromeExe, [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        `--print-to-pdf=${targetPdfPath}`,
        fileUrl
      ], { stdio: 'inherit' });
      console.log(`[Budget Engine] PDF compilado en: ${targetPdfPath}`);
    } catch (err) {
      console.error('[Budget Engine] Error al generar PDF:', err.message);
    }
  } else {
    console.warn('[Budget Engine] Chrome no encontrado; PDF omitido.');
  }

  const readmePath = path.join(PRESUPUESTOS_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    const newRow = `| **${nextNumStr}** | \`PROP-2026-EXOTICS-${nextNumStr}\` | ${new Date().toLocaleDateString('es-ES')} | **1.850,00 €** (+ 79 €/mes opc.) | **2.238,50 €** | [HTML](./${targetHtmlName}) · [PDF](./${targetPdfName}) | **Presupuesto Nº ${nextNumStr}**: ${customNotes || 'Iteración incremental con mejoras de arquitectura y producción.'} |`;
    readme = readme.replace(/\n---\n\n## /m, `\n${newRow}\n\n---\n\n## `);
    fs.writeFileSync(readmePath, readme, 'utf8');
  }

  return { nextNumStr, targetHtmlName, targetPdfName };
}

if (require.main === module) {
  const slugArg = process.argv[2] || 'actualizado_v';
  const notesArg = process.argv[3] || '';
  generateIncrementalBudget(slugArg, notesArg);
}

module.exports = { generateIncrementalBudget, getNextBudgetNumber };
