# Exotics Collections — Luxury Showroom & European Sourcing Platform

Plataforma digital para la boutique de vehículos seleccionados e importación de altas prestaciones **Exotics Collections** (Barcelona, España), liderada por **Marc Ibáñez**.

---

## 🏛️ Arquitectura del Proyecto

El repositorio está organizado bajo una estructura modular de grado empresarial:

```text
c:\EXOTICS\
├── .agents/                 # Plugins, subagentes especializados y reglas de diseño de lujo
│   ├── plugins/exotics-suite/   # Subagentes: luxury-design-auditor, iphone-luxury-auditor, luxury-project-estimator
│   └── skills/                  # Habilidades autónomas (luxury-aesthetic-auditor, iphone-luxury-auditor, luxury-bento-catalog)
├── assets/                  # Activos gráficos oficiales (logotipos, avatares de curaduría, fondos HD)
├── audits/                  # Auditorías de diseño, capturas de control de calidad y reportes de viewport
│   └── screenshots/             # Capturas de QA en escritorio y móviles (iPhone Safe-Area, Bento, etc.)
├── css/                     # Sistema de diseño CSS modular
│   └── main.css                 # Tokens de diseño, tipografía, componentes y layouts responsivos
├── data/                    # Capa de resiliencia y datos locales
│   └── sanity_cache.json        # Snapshot de contingencia con vehículos y metadatos de Sanity CMS
├── js/                      # Lógica de cliente y arquitectura de microservicios
│   ├── app.js                   # Orquestación de Bento Grids, modales y lógica de catálogo
│   ├── config.js                # Variables de entorno seguras, endpoints y configuración de WhatsApp
│   └── sanity-api.js            # Cliente de integración GROQ con reintentos y fallback automático
├── presupuestos/            # Propuestas comerciales versionadas y estudios de mercado
│   ├── 01_presupuesto_estudio_mercado_4850.html / .pdf
│   ├── 02_presupuesto_ajustado_esencial_1850.html / .pdf
│   ├── 03_modelos_mensualidad_pros_contras.html / .pdf
│   ├── 04_presupuesto_dos_hojas_cliente_y_desarrollador.html / .pdf
│   └── README.md                # Índice maestro de propuestas financieras y costes
├── scripts/                 # Herramientas de sincronización y utilidades de desarrollo
│   ├── fetch_sanity.js          # Extracción y regeneración de caché de Sanity Studio
│   ├── download_assets.js       # Descarga y verificación de activos remotos
│   └── open_site.cmd            # Lanzador rápido de entorno local
├── index.html               # Landing page principal, Bento Grid de entregas y funnel de captación
├── stock.html               # Catálogo completo de vehículos en stock con filtros dinámicos
├── car.html                 # Ficha individual de vehículo, galería HD y llamada a la acción dual
├── presupuesto.html         # Enlace canónico a la propuesta comercial activa
├── presupuesto.pdf          # Documento oficial del presupuesto en 2 hojas
├── server.cjs               # Servidor local Node.js para desarrollo y previsualización segura
└── package.json             # Manifiesto del proyecto y scripts estandarizados
```

---

## 🎨 Sistema de Diseño (Estándar Maison Automotive)

La identidad visual ha sido alineada con el benchmark estético de **Maison Automotive** ([maisonautomotive.es](https://maisonautomotive.es/)):

* **Tipografía Editorial:**
  * **Titulares y Display:** `Barlow Semi Condensed` (pesos 600 y 700 en mayúsculas, espaciado arquitectónico).
  * **Cuerpo y Fichas Técnicas:** `Inter` (pesos 300, 400 y 500, máxima legibilidad suiza).
* **Paleta de Color (*Titanium Platinum & Monochrome*):**
  * Fondo Obsidiana Mate: `#0A0A0A` / `#111111`
  * Biseles Perimetrales: Fino corte láser platino `1px solid rgba(255, 255, 255, 0.16)`
  * Botón Principal (CTA): Píldora en blanco puro (`#FFFFFF`) con tipografía oscura obsidiana.
  * Botón Secundario: Vidrio obsidiana con acento esmeralda WhatsApp (`#25D366`).
* **Optimización Mobile First:**
  * Viewport blindado para pantallas iPhone (`env(safe-area-inset-bottom)`).
  * Barra de conversión flotante fija en móviles (`.mobile-car-bar`).

---

## 🚀 Comandos de Desarrollo

```bash
# Iniciar servidor local de desarrollo (Puerto 4000)
npm start
# o bien:
node server.cjs

# Sincronizar catálogo y datos desde Sanity CMS
npm run sync:sanity

# Descargar activos multimedia oficiales
npm run sync:assets
```

---

## 🔐 Integración Segura con Sanity CMS

* La API de Sanity opera en modo **lectura pública (read-only)** sin tokens de escritura en el cliente.
* Si el servicio externo de Sanity experimenta latencia o falta de conexión, la plataforma activa de forma transparente el fallback local en `data/sanity_cache.json`, garantizando un tiempo de actividad (uptime) del 100%.
