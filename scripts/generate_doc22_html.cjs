const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', '_internal', 'presupuestos', '21_propuesta_visual_cliente_whatsapp_sin_precio.html');
const destPath = path.join(__dirname, '..', '_internal', 'presupuestos', '22_propuesta_visual_cliente_whatsapp_sin_precio.html');

let html = fs.readFileSync(srcPath, 'utf8');

// Update titles and metadata
html = html.replace('Dossier Visual Oficial Nº 21', 'Dossier Visual Oficial Nº 22');
html = html.replace('Dossier Visual Nº 21 · Pantallas Completas 16:9', 'Dossier Visual Nº 22 · Textos Ejecutivos Ultracortos');
html = html.replace('20_propuesta_visual_cliente_whatsapp_sin_precio.html', '21_propuesta_visual_cliente_whatsapp_sin_precio.html');
html = html.replace('← Ver Histórico Nº 20', '← Ver Histórico Nº 21');
html = html.replace(/assets\/capturas_doc21\//g, 'assets/capturas_doc22/');

// Page 1 titles
html = html.replace(
  '<h2 class="page-title">01 — Portada Principal &amp; Sección 02 (Importaciones Recientes)</h2>',
  '<h2 class="page-title">01 — Portada Principal &amp; Entregas Recientes</h2>'
);
html = html.replace(
  '<p class="page-subtitle">IMPACTO VISUAL INICIAL Y PRUEBA SOCIAL INMEDIATA</p>',
  '<p class="page-subtitle">IMPACTO VISUAL Y PRUEBA SOCIAL INMEDIATA</p>'
);

// Shot 1
html = html.replace(
  '<span class="shot-badge">01 · PORTADA PRINCIPAL (DESKTOP COMPLETO 16:9)</span>',
  '<span class="shot-badge">01 · PORTADA PRINCIPAL (DESKTOP 16:9)</span>'
);
html = html.replace(
  'Fotograma cenital con los dos McLaren en ruta, navegación corporativa, titular «Conduce tus sueños», lema familiar y botones de acción directa sin ningún corte de pantalla.',
  'Fotograma cenital de los dos McLaren en ruta, cabecera corporativa y accesos a Stock e Importación.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> El comprador visualiza al instante los dos pilares del negocio (stock e importación a medida) con la estética europea solicitada.',
  '<strong>Problema resuelto:</strong> Distingue de inmediato Stock e Importación a la carta con estética europea.'
);

// Shot 2
html = html.replace(
  '<span class="shot-badge">02 · SECCIÓN (02) — IMPORTACIONES RECIENTES (BENTO COMPLETO)</span>',
  '<span class="shot-badge">02 · SECCIÓN (02) — IMPORTACIONES RECIENTES</span>'
);
html = html.replace(
  'Cabecera oficial «(02) — IMPORTACIONES RECIENTES · 6 UNIDADES» visible y despejada, con las 6 entregas editoriales (McLaren 750S, Cayenne GTS, Mercedes-AMG A35, BMW M240i, Golf R y Cayenne Hybrid).',
  'Malla editorial con 6 entregas reales (McLaren 750S, Cayenne GTS, AMG A35, M240i, Golf R y Cayenne Hybrid).'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> Muestra prueba social contrastada desde la portada para generar confianza inmediata en el comprador sin textos redundantes.',
  '<strong>Problema resuelto:</strong> Prueba social visible en portada que transmite solvencia y volumen real de entregas.'
);

// Page 2 titles
html = html.replace(
  '<h3 class="page-title">02 — Catálogo con Filtro Desplegable &amp; Ficha Showroom</h3>',
  '<h3 class="page-title">02 — Catálogo de Stock &amp; Ficha Showroom</h3>'
);
html = html.replace(
  '<p class="page-subtitle">BÚSQUEDA FLUIDA SIN RECARGAS Y CONVERSIÓN A WHATSAPP</p>',
  '<p class="page-subtitle">FILTRADO DINÁMICO Y CONVERSIÓN A WHATSAPP</p>'
);

// Shot 3
html = html.replace(
  '<span class="shot-badge">03 · CATÁLOGO DE STOCK (BANDEJA DE FILTROS DESPLEGABLE)</span>',
  '<span class="shot-badge">03 · CATÁLOGO DE STOCK (FILTROS DESPLEGABLES)</span>'
);
html = html.replace(
  'Bandeja de filtros desplegable e interactiva con 7 selectores simultáneos (Marca, Modelo, Etiqueta DGT, Combustible, Cambio, Estado y Ordenación). El comprador despliega los filtros con un clic para acotar el stock en tiempo real sin recargar.',
  'Bandeja desplegable con 7 selectores interactivos (Marca, Modelo, DGT, Combustible, Cambio, Estado y Ordenación).'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> El cliente filtra de inmediato la unidad buscada mediante el selector desplegable sin perder tiempo navegando listados largos.',
  '<strong>Problema resuelto:</strong> Filtrado instantáneo sin recargas para localizar unidades en segundos.'
);

// Shot 4
html = html.replace(
  '<span class="shot-badge">04 · FICHA SHOWROOM (CURADURÍA TÉCNICA &amp; RESERVA DIRECTA)</span>',
  '<span class="shot-badge">04 · FICHA SHOWROOM (CURADURÍA &amp; RESERVA)</span>'
);
html = html.replace(
  'Showroom interactivo completo: especificaciones técnicas detalladas, bloque pericial «¿Por qué hemos seleccionado esta unidad?» firmado por Marc, y botones de contacto directo para reserva inmediata.',
  'Especificaciones completas, bloque «¿Por qué seleccionamos esta unidad?» firmado por Marc y botón de reserva.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> Comunica el estado y valor del coche antes del precio, resolviendo dudas del comprador y canalizando el cierre hacia WhatsApp.',
  '<strong>Problema resuelto:</strong> Comunica procedencia y valor antes del precio, resolviendo dudas para el cierre.'
);

// Page 3 titles
html = html.replace(
  '<h3 class="page-title">03 — Importación a la Carta &amp; Portada Móvil iPhone</h3>',
  '<h3 class="page-title">03 — Importación a la Carta &amp; Portada Móvil</h3>'
);
html = html.replace(
  '<p class="page-subtitle">CANALIZACIÓN DE ENCARGOS Y ENCUADRE NATIVO RETINA</p>',
  '<p class="page-subtitle">ENCARGOS A MEDIDA Y VISTA RETINA VERTICAL</p>'
);

// Shot 5
html = html.replace(
  '<span class="shot-badge">05 · SERVICIO DE IMPORTACIÓN A LA CARTA (DESKTOP COMPLETO 16:9)</span>',
  '<span class="shot-badge">05 · SERVICIO DE IMPORTACIÓN (DESKTOP 16:9)</span>'
);
html = html.replace(
  'Composición completa 50/50: imagen pericial del McLaren 750S en red oficial a la izquierda y copy técnico a la derecha: «Cuéntanos qué coche buscas. Nosotros lo encontramos».',
  'Estructura 50/50: McLaren 750S en concesionario oficial europeo y formulario directo de encargo.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> Muestra el servicio de importación llave en mano con máxima nitidez, detallando peritaje in situ, transporte asegurado y matriculación.',
  '<strong>Problema resuelto:</strong> Detalla el servicio llave en mano (búsqueda, peritaje in situ, transporte y matriculación).'
);

// Shot 6
html = html.replace(
  '<span class="shot-badge">06 · EXPERIENCIA IPHONE RETINA (PORTADA VERTICAL)</span>',
  '<span class="shot-badge">06 · PORTADA RETINA EN IPHONE</span>'
);
html = html.replace(
  'Encuadre vertical optimizado para iPhone con el fotograma cenital de los dos McLaren, cabecera despejada y botones de llamada a la acción ergonómicos.',
  'Encuadre cenital vertical de los dos McLaren con navegación táctil adaptada a la mano.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> Más del 80% de los compradores acceden desde el móvil tras hablar por WhatsApp; disfrutan de una navegación fluida e inmersiva idéntica a una app nativa.',
  '<strong>Problema resuelto:</strong> Experiencia fluida tipo app nativa para el comprador que accede desde WhatsApp o Instagram.'
);

// Page 4 titles
html = html.replace(
  '<h3 class="page-title">04 — Catálogo en Móvil &amp; Reserva en iPhone</h3>',
  '<h3 class="page-title">04 — Catálogo Móvil &amp; Reserva Directa</h3>'
);
html = html.replace(
  '<p class="page-subtitle">CATÁLOGO ERGONÓMICO Y CIERRE INMEDIATO POR WHATSAPP</p>',
  '<p class="page-subtitle">ERGONOMÍA TÁCTIL Y CIERRE INMEDIATO</p>'
);

// Shot 7
html = html.replace(
  '<span class="shot-badge">07 · CATÁLOGO EN IPHONE (TARJETAS DE VEHÍCULO)</span>',
  '<span class="shot-badge">07 · CATÁLOGO EN IPHONE (STOCK EDITORIAL)</span>'
);
html = html.replace(
  'Tarjetas editoriales con fotografía de alta definición, datos mecánicos tabulares (año, kilometraje, potencia, distintivo DGT) y distintivos de procedencia oficial.',
  'Tarjetas de stock con fotografía HD, specs mecánicas resumidas y distintivo de procedencia oficial.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> El comprador examina los coches en stock desde su teléfono con una visualización atractiva, limpia y optimizada para navegación vertical.',
  '<strong>Problema resuelto:</strong> Navegación ágil con fotos grandes y datos clave legibles con un solo pulgar.'
);

// Shot 8
html = html.replace(
  '<span class="shot-badge">08 · RESERVA &amp; ENLACE A WHATSAPP</span>',
  '<span class="shot-badge">08 · RESERVA DIRECTA EN IPHONE</span>'
);
html = html.replace(
  'Dock bar flotante inferior con botones «ME INTERESA» y «RESERVAR UNIDAD» fijos sobre la barra de inicio de Apple, completamente libre de avisos de cookies.',
  'Dock flotante inferior con botones fijos «ME INTERESA» y «RESERVAR UNIDAD» sobre la barra de inicio.'
);
html = html.replace(
  '<strong>Problema resuelto:</strong> Cero pérdidas de ventas: con un toque, el comprador inicia conversación con Marc con el modelo pre-cargado.',
  '<strong>Problema resuelto:</strong> Un solo toque inicia chat con Marc con el vehículo pre-cargado, sin fricción de cierre.'
);

fs.writeFileSync(destPath, html, 'utf8');
console.log('Doc 22 HTML generated successfully. Size:', html.length);

