const fs = require('fs');

const checks = [
  // 1. STOCK
  {
    category: 'STOCK',
    title: 'Frase garaje / selección',
    file: 'src/stock.html',
    regex: /No buscamos cualquier coche.*Buscamos la unidad perfecta/s
  },
  {
    category: 'STOCK',
    title: 'No priorizamos margen sino estado',
    file: 'src/stock.html',
    regex: /No priorizamos el margen de beneficio/i
  },
  {
    category: 'STOCK',
    title: 'Selector Stock y Últimas Entregas',
    file: 'src/stock.html',
    regex: /Últimas entregas/i
  },
  {
    category: 'STOCK',
    title: 'Filtros (marca, año, km, etiqueta, combustible, cambio...)',
    file: 'src/stock.html',
    regex: /filtro|combustible|etiqueta/i
  },
  // CAR.JS
  {
    category: 'CAR',
    title: 'Por qué hemos seleccionado esa unidad',
    file: 'src/js/pages/car.js',
    regex: /por qué hemos seleccionado/i
  },
  {
    category: 'CAR',
    title: 'Botón Me interesa esta unidad y Reservar',
    file: 'src/js/pages/car.js',
    regex: /Me interesa esta unidad/i
  },
  {
    category: 'CAR',
    title: 'Espacio para vídeo del coche',
    file: 'src/js/pages/car.js',
    regex: /video|vídeo/i
  },
  // IMPORTACION
  {
    category: 'IMPORTACION',
    title: 'Encuentra tu nuevo coche en cualquier parte de Europa',
    file: 'src/importacion.html',
    regex: /Encuentra tu nuevo coche en cualquier parte de Europa/i
  },
  {
    category: 'IMPORTACION',
    title: 'Requisitos (< 7 años, < 90.000 km)',
    file: 'src/importacion.html',
    regex: /7 años|90\.000/i
  },
  {
    category: 'IMPORTACION',
    title: 'Botón Solicitar búsqueda',
    file: 'src/importacion.html',
    regex: /Solicitar búsqueda/i
  },
  {
    category: 'IMPORTACION',
    title: 'Vídeo o peritaje con Fons',
    file: 'src/importacion.html',
    regex: /Fons/i
  },
  // HOME
  {
    category: 'HOME',
    title: 'Botón Encuentra tu próximo coche que lleva a importación',
    file: 'src/index.html',
    regex: /Encuentra tu próximo coche/i
  },
  {
    category: 'HOME',
    title: 'Coches que seleccionaríamos para nuestros familiares',
    file: 'src/index.html',
    regex: /familiares/i
  },
  {
    category: 'HOME',
    title: 'Vehículos seleccionados e importación a medida desde toda Europa',
    file: 'src/index.html',
    regex: /Vehículos seleccionados e importación a medida desde toda Europa/i
  },
  // SOBRE NOSOTROS
  {
    category: 'SOBRE NOSOTROS',
    title: 'Exclusividad, diseño y fiabilidad',
    file: 'src/sobre-nosotros.html',
    regex: /Exclusividad, diseño y fiabilidad/i
  },
  {
    category: 'SOBRE NOSOTROS',
    title: 'Beltrán: atención al cliente / procesos más fluidos',
    file: 'src/sobre-nosotros.html',
    regex: /procesos más fluidos|atención al cliente/i
  },
  {
    category: 'SOBRE NOSOTROS',
    title: 'Borrado facilitar el cierre de ventas',
    file: 'src/sobre-nosotros.html',
    negRegex: /facilitar el cierre de ventas/i
  }
];

console.log('--- AUDITORÍA DETALLADA DEL BRIEFING DE WHATSAPP ---');
let passed = 0;
let total = checks.length;

checks.forEach(c => {
  if (!fs.existsSync(c.file)) {
    console.log(`[FAIL] ${c.category} - ${c.title}: File ${c.file} not found`);
    return;
  }
  const content = fs.readFileSync(c.file, 'utf8');
  let ok = false;
  if (c.regex) {
    ok = c.regex.test(content);
  } else if (c.negRegex) {
    ok = !c.negRegex.test(content);
  }
  if (ok) {
    passed++;
    console.log(`[PASS] ${c.category}: ${c.title}`);
  } else {
    console.log(`[FAIL] ${c.category}: ${c.title} -> MISSING OR INCOMPLETE IN ${c.file}`);
  }
});

console.log(`\nResultado: ${passed} / ${total} criterios verificados.`);
