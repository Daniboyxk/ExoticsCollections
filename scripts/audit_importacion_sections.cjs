const fs = require('fs');
const content = fs.readFileSync('c:/EXOTICS/src/importacion.html', 'utf-8');
const lines = content.split('\n');

console.log('--- SECCIONES Y ENCABEZADOS EN IMPORTACION.HTML ---');
lines.forEach((l, i) => {
  if (l.includes('<section') || l.includes('class="section-title') || l.includes('class="hero-title') || l.includes('id="sec-') || l.includes('<h2') || l.includes('<h3')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});

