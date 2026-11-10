const { execFileSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\EXOTICS\\_internal\\presupuestos\\assets\\capturas_doc14';

const captures = [
  // 1. Desktop Portada
  {
    name: '01_desktop_portada.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/'
  },
  // 2. Desktop Stock & Filtros
  {
    name: '02_desktop_stock_filtros.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/stock.html'
  },
  // 3. Desktop Ficha de Vehículo
  {
    name: '03_desktop_car_ficha.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/car.html'
  },
  // 4. Desktop Importación a la carta (Split 50/50 + Formulario)
  {
    name: '04_desktop_importacion_hero.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/importacion.html'
  },
  // 5. Desktop Sobre Nosotros & Equipo (Marc, Fons, Beltrán)
  {
    name: '05_desktop_sobre_nosotros.png',
    size: '--window-size=1920,1080',
    url: 'http://localhost:4000/sobre-nosotros.html'
  },
  // 6. Mobile iPhone: Portada & Navegación
  {
    name: '06_mobile_portada.png',
    size: '--window-size=390,844',
    url: 'http://localhost:4000/'
  },
  // 7. Mobile iPhone: Catálogo Stock & Filtros
  {
    name: '07_mobile_stock.png',
    size: '--window-size=390,844',
    url: 'http://localhost:4000/stock.html'
  },
  // 8. Mobile iPhone: Ficha & Reserva Directa
  {
    name: '08_mobile_car.png',
    size: '--window-size=390,844',
    url: 'http://localhost:4000/car.html'
  }
];

for (const c of captures) {
  const filePath = path.join(outDir, c.name);
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    c.size,
    '--screenshot=' + filePath,
    c.url
  ]);
  console.log('Captured:', c.name);
}
console.log('All 8 captures finished.');

