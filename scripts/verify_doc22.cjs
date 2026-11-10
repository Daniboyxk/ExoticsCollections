const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', '_internal', 'presupuestos', '22_propuesta_visual_cliente_whatsapp_sin_precio.html'), 'utf8');

const regex = /<span class="shot-badge">([\s\S]*?)<\/span>[\s\S]*?<p class="shot-caption"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<div class="shot-solution"[^>]*>([\s\S]*?)<\/div>/g;

let count = 0;
let m;
while ((m = regex.exec(html)) !== null) {
  count++;
  console.log(`=== SHOT ${count} ===`);
  console.log('BADGE:', m[1].trim());
  console.log('CAPTION:', m[2].trim());
  console.log('SOLUTION:', m[3].replace(/<[^>]+>/g, '').trim());
}
console.log('Total shots matched:', count);

