const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const presupuestosDir = 'C:\\EXOTICS\\_internal\\presupuestos';

const htmlPath = path.join(presupuestosDir, '26_propuesta_humana_limpia_para_marc_5_paginas.html');
const pdfPath = path.join(presupuestosDir, '26_propuesta_humana_limpia_para_marc_5_paginas.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Propuesta Visual para Marc Ibáñez — Exotics Collections</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #060709;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      width: 210mm;
      height: 297mm;
      position: relative;
      page-break-after: always;
      padding: 24mm 22mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #060709;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .header__brand {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #cbb084;
    }
    .header__meta {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.4);
    }
    .title-block {
      margin-bottom: 18px;
    }
    .title {
      font-family: Georgia, serif;
      font-size: 26px;
      font-weight: 400;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .subtitle {
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.45;
      max-width: 95%;
    }
    .blocks-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex: 1;
    }
    .block {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .block__label {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #cbb084;
    }
    .block__img-wrap {
      width: 100%;
      height: 78mm;
      background: #0d0f14;
      border: 1px solid rgba(255, 255, 255, 0.09);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .block__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .block__desc {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.45;
    }
    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      flex: 1;
    }
    .grid-2col .block__img-wrap {
      height: 140mm;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 10px;
      margin-top: 12px;
      font-size: 9.5px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.35);
    }
    /* Page 5 specifics */
    .checklist {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 10px;
      flex: 1;
    }
    .check-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-left: 2px solid #cbb084;
      padding-left: 14px;
    }
    .check-item__num {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #cbb084;
    }
    .check-item__title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    .check-item__desc {
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.45;
    }
    .closing-box {
      background: rgba(203, 176, 132, 0.05);
      border: 1px solid rgba(203, 176, 132, 0.3);
      padding: 16px 20px;
      margin-top: 16px;
    }
    .closing-box__title {
      font-size: 13.5px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .closing-box__sub {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.65);
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1 -->
  <section class="page">
    <div>
      <div class="header">
        <span class="header__brand">EXOTICS COLLECTIONS</span>
        <span class="header__meta">PARA MARC IBÁÑEZ / 01</span>
      </div>
      <div class="title-block">
        <h1 class="title">Propuesta visual para tu web</h1>
        <p class="subtitle">
          Marc, he preparado esta versión limpia para que podamos revisar el resultado sobre algo concreto y funcionando. Antes de avanzar, confirmamos qué detalles prefieres ajustar y cuáles dejamos listos.
        </p>
      </div>
    </div>

    <div class="blocks-container">
      <div class="block">
        <span class="block__label">01 / INICIO: VÍDEO EDITORIAL Y ACCESO DIRECTO</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/clean_home_hero.png" alt="Hero de Portada" />
        </div>
        <p class="block__desc">
          Dos accesos principales: consultar el stock disponible o pedir una búsqueda a medida. El vídeo mantiene el protagonismo de los coches desde el primer segundo.
        </p>
      </div>

      <div class="block">
        <span class="block__label">02 / TRABAJOS Y UNIDADES EN PORTADA</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/clean_home_bento.png" alt="Bento de Entregas" />
        </div>
        <p class="block__desc">
          Una selección de entregas realizadas y unidades disponibles. El diseño limpio da todo el protagonismo a las fotografías y permite consultar cada modelo con un clic.
        </p>
      </div>
    </div>

    <div class="footer">
      <span>PROPUESTA VISUAL EXOTICS COLLECTIONS · BARCELONA</span>
      <span>1 / 5</span>
    </div>
  </section>

  <!-- PÁGINA 2 -->
  <section class="page">
    <div>
      <div class="header">
        <span class="header__brand">EXOTICS COLLECTIONS</span>
        <span class="header__meta">PARA MARC IBÁÑEZ / 02</span>
      </div>
      <div class="title-block">
        <h1 class="title">Del catálogo a la consulta directa</h1>
        <p class="subtitle">
          Así queda el recorrido pensado para que el cliente busque un vehículo, revise su ficha técnica y contacte contigo sin fricciones.
        </p>
      </div>
    </div>

    <div class="blocks-container">
      <div class="block">
        <span class="block__label">03 / BUSCAR Y FILTRAR EL STOCK</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/clean_stock_catalog.png" alt="Catálogo de Stock" />
        </div>
        <p class="block__desc">
          Barra horizontal discreta con filtros por marca, modelo, precio, año y kilómetros. Permite alternar con un toque entre el stock disponible y las últimas entregas.
        </p>
      </div>

      <div class="block">
        <span class="block__label">04 / LA INFORMACIÓN DE CADA UNIDAD</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/EXOTICS/_internal/presupuestos/assets/capturas_doc23/04_car_hyundai_hero.png" alt="Ficha de Coche" />
        </div>
        <p class="block__desc">
          Galería de fotografías, equipamiento detallado y por qué habéis seleccionado la unidad. Todo enfocado a abrir una conversación directa contigo por WhatsApp.
        </p>
      </div>
    </div>

    <div class="footer">
      <span>PROPUESTA VISUAL EXOTICS COLLECTIONS · BARCELONA</span>
      <span>2 / 5</span>
    </div>
  </section>

  <!-- PÁGINA 3 -->
  <section class="page">
    <div>
      <div class="header">
        <span class="header__brand">EXOTICS COLLECTIONS</span>
        <span class="header__meta">PARA MARC IBÁÑEZ / 03</span>
      </div>
      <div class="title-block">
        <h1 class="title">Importación a la carta y versión móvil</h1>
        <p class="subtitle">
          Una presentación clara del servicio de importación europea y cómo se adapta la experiencia a la pantalla del teléfono.
        </p>
      </div>
    </div>

    <div class="blocks-container">
      <div class="block">
        <span class="block__label">05 / SERVICIO DE IMPORTACIÓN A LA CARTA</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/clean_importacion_hero.png" alt="Importación a la Carta" />
        </div>
        <p class="block__desc">
          Composición a pantalla completa limpia y despejada. Explica con claridad que localizáis la unidad en concesión oficial, peritáis in situ con micras y entregáis llave en mano.
        </p>
      </div>

      <div class="block">
        <span class="block__label">06 / EXPERIENCIA EN TELÉFONOS MÓVILES</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/EXOTICS/_internal/presupuestos/assets/capturas_doc23/06_mobile_hero_exact.png" alt="Móvil iPhone" />
        </div>
        <p class="block__desc">
          Distribución vertical adaptada a pantallas estrechas. Tipografías legibles, botones grandes para el pulgar y navegación táctil sin fallos.
        </p>
      </div>
    </div>

    <div class="footer">
      <span>PROPUESTA VISUAL EXOTICS COLLECTIONS · BARCELONA</span>
      <span>3 / 5</span>
    </div>
  </section>

  <!-- PÁGINA 4 -->
  <section class="page">
    <div>
      <div class="header">
        <span class="header__brand">EXOTICS COLLECTIONS</span>
        <span class="header__meta">PARA MARC IBÁÑEZ / 04</span>
      </div>
      <div class="title-block">
        <h1 class="title">Atención directa y tema visual claro/oscuro</h1>
        <p class="subtitle">
          Opciones de contacto sin intermediarios y un conmutador de tema para quien prefiera leer sobre fondo claro.
        </p>
      </div>
    </div>

    <div class="blocks-container">
      <div class="block">
        <span class="block__label">07 / CANALES DIRECTOS DE CONTACTO Y CITA PREVIA</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/clean_contacto.png" alt="Contacto Directo" />
        </div>
        <p class="block__desc">
          Tarjetas sobrias y claras: acceso a tu WhatsApp oficial, solicitud de cita previa en Barcelona y datos telefónicos sin intermediarios.
        </p>
      </div>

      <div class="block">
        <span class="block__label">08 / CONMUTADOR VISUAL DE TEMA (OSCURO / CLARO)</span>
        <div class="block__img-wrap">
          <img class="block__img" src="C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/theme_light_chalk_pearl_desktop.png" alt="Tema Claro Chalk Pearl" />
        </div>
        <p class="block__desc">
          Hemos añadido un selector discreto con letras (OSCURO / CLARO) en la cabecera. Aplica un fondo alabastro cálido inspirado en el color Chalk de Porsche, con excelente lectura diurna.
        </p>
      </div>
    </div>

    <div class="footer">
      <span>PROPUESTA VISUAL EXOTICS COLLECTIONS · BARCELONA</span>
      <span>4 / 5</span>
    </div>
  </section>

  <!-- PÁGINA 5 -->
  <section class="page">
    <div>
      <div class="header">
        <span class="header__brand">EXOTICS COLLECTIONS</span>
        <span class="header__meta">PARA MARC IBÁÑEZ / 05</span>
      </div>
      <div class="title-block">
        <h1 class="title">Qué acordamos contigo para publicar</h1>
        <p class="subtitle">
          Esta propuesta sirve para cerrar contigo los últimos detalles. El objetivo es que la web quede exactamente a tu gusto antes del lanzamiento oficial.
        </p>
      </div>
    </div>

    <div class="checklist">
      <div class="check-item">
        <span class="check-item__num">01 / LO QUE PREFIERES CONSERVAR</span>
        <div class="check-item__title">Fotografías, coches y textos definitivos</div>
        <p class="check-item__desc">
          Confirmamos qué vehículos del catálogo inicial dejamos activos, cuáles figuran como entregados y qué datos técnicos prefieres matizar.
        </p>
      </div>

      <div class="check-item">
        <span class="check-item__num">02 / LO QUE QUIERES AJUSTAR O CAMBIAR</span>
        <div class="check-item__title">Ajustes a tu criterio antes de abrir al público</div>
        <p class="check-item__desc">
          Revisamos cualquier texto, número de contacto, enlaces de redes sociales o detalles de diseño que quieras afinar para que te sientas 100% cómodo.
        </p>
      </div>

      <div class="check-item">
        <span class="check-item__num">03 / CÓMO GESTIONARÁS EL DÍA A DÍA</span>
        <div class="check-item__title">Actualización de vehículos sencilla y rápida</div>
        <p class="check-item__desc">
          Concretamos el método más cómodo para que podáis subir coches nuevos, cambiar estados a «Reservado» o «Entregado», o si preferís que nos encarguemos nosotros con soporte directo.
        </p>
      </div>

      <div class="check-item">
        <span class="check-item__num">04 / PUBLICACIÓN Y PASO A PRODUCCIÓN</span>
        <div class="check-item__title">Lanzamiento en tu dominio oficial</div>
        <p class="check-item__desc">
          Con estos puntos claros, conectamos el dominio exoticscollections.com, activamos los certificados de seguridad y dejamos la web lista para recibir a vuestros clientes.
        </p>
      </div>
    </div>

    <div class="closing-box">
      <div class="closing-box__title">Para empezar: ¿qué partes de esta versión te encajan y cuáles prefieres afinar?</div>
      <div class="closing-box__sub">Hablamos sobre estos puntos y dejamos todo preparado para el lanzamiento oficial.</div>
    </div>

    <div class="footer">
      <span>PROPUESTA VISUAL EXOTICS COLLECTIONS · BARCELONA</span>
      <span>5 / 5</span>
    </div>
  </section>

</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Saved HTML to:', htmlPath);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-doc26-'));
try {
  console.log('Compiling PDF with Chrome headless...');
  const cmd = `"${chromePath}" --headless=new --disable-gpu --user-data-dir="${tempDir}" --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { stdio: 'inherit' });

  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`Successfully generated Doc 26 PDF: ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    throw new Error('PDF was not generated');
  }
} finally {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('Cleaned temp directory in os.tmpdir()');
  } catch (_) {}
}

