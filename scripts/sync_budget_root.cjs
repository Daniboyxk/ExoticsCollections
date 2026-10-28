const fs = require('fs');

let html = fs.readFileSync('c:/EXOTICS/presupuestos/07_presupuesto_maestro_dos_hojas_fases_proyecto.html', 'utf8');
html = html.replaceAll('../assets/logo_exotics.png', 'assets/logo_exotics.png');
html = html.replaceAll('href="../index.html"', 'href="index.html"');

fs.writeFileSync('c:/EXOTICS/presupuesto.html', html, 'utf8');
fs.copyFileSync('c:/EXOTICS/presupuestos/07_presupuesto_maestro_dos_hojas_fases_proyecto.pdf', 'c:/EXOTICS/presupuesto.pdf');
console.log('Successfully synchronized root presupuesto.html and presupuesto.pdf with document 07');
