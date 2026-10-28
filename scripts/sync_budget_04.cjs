const fs = require('fs');

let html = fs.readFileSync('c:/EXOTICS/presupuesto.html', 'utf8');
html = html.replaceAll('assets/logo_exotics.png', '../assets/logo_exotics.png');
html = html.replaceAll('href="index.html"', 'href="../index.html"');

fs.writeFileSync('c:/EXOTICS/presupuestos/04_presupuesto_dos_hojas_cliente_y_desarrollador.html', html, 'utf8');
console.log('Successfully synchronized 04_presupuesto_dos_hojas_cliente_y_desarrollador.html with UTF-8');
