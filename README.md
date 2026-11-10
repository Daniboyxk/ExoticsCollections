# Exotics Collections — Plataforma Web Oficial (v3.0 Production Ready)

Plataforma web multipágina de alto rendimiento para **Exotics Collections** (Marc Ibáñez · Barcelona), diseñada bajo el sistema visual **Obsidian & Champagne × Mechatronik (90/10)** y conectada en tiempo real con **Sanity CDN** (`bjo8yvrn / production`).

---

## Arquitectura del Proyecto (`v3.0`)

```text
c:\EXOTICS
├── src/                         # Código fuente (HTML, parciales, CSS modular y JS ES Modules)
│   ├── index.html               # Portada editorial + Hero vídeo + Bento de entregas + YouTube
│   ├── stock.html               # Catálogo segmentado (Performance / Daily / Entregas / Todo)
│   ├── car.html                 # Showroom individual + Datenblatt + Dossier + Lightbox 2X
│   ├── importacion.html         # 5 etapas transparentes + Calculadora IEDMT + Encargo directo
│   ├── sobre-nosotros.html      # Marc Ibáñez, Fons y Beltrán + Ecosistema digital monocromo
│   ├── legal.html               # Aviso Legal (LSSI-CE), Privacidad (RGPD) y Condiciones
│   ├── 404.html                 # Página 404 de conserjería
│   ├── partials/                # Fuente única de verdad (header.html y footer.html)
│   ├── css/                     # Sistema de diseño modular (tokens, base, layout, components, pages/*)
│   └── js/                      # Cliente Sanity CDN live-first + controladores por vista
├── public/                      # Activos estáticos públicos copiados tal cual a dist/
│   ├── assets/                  # Logotipo oficial, retrato real de Marc y póster Hero
│   ├── data/sanity_cache.json   # Respaldo local automático ante caída de red
│   ├── _headers                 # Cabeceras de seguridad y caché para Cloudflare Pages / Netlify
│   ├── robots.txt               # Reglas de indexación SEO
│   └── sitemap.xml              # Mapa XML de URLs canónicas
├── scripts/                     # Utilidades CLI de mantenimiento e infraestructura
│   ├── fetch_sanity.cjs         # Sincroniza public/data/sanity_cache.json desde Sanity API
│   ├── download_assets.cjs      # Regenera activos base en public/assets/
│   └── create_incremental_budget.cjs # Generador incremental inmutable en _internal/presupuestos/
├── _internal/                   # 🔒 PRIVADO (ignorado por Git y jamás incluido en dist/)
│   └── presupuestos/            # Historial inmutable 01..NN (.html + .pdf) y plantilla maestra
├── dist/                        # Build final minificado y hasheado listo para producción
├── vercel.json                  # Cabeceras HTTP de seguridad y caché inmutable para Vercel
├── vite.config.js               # Compilador multipágina + inyector de parciales HTML
└── package.json                 # Scripts oficiales de desarrollo, build y sincronización
```

---

## Comandos Principales

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Levanta el servidor de desarrollo Vite en `http://localhost:4000` con recarga en caliente (incluyendo `src/partials/`). |
| `npm run build` | Compila, inyecta Header/Footer unificados, minifica y versiona CSS/JS en `dist/` listo para publicar. |
| `npm run preview` | Sirve localmente la carpeta de producción `dist/` en `http://localhost:4000` para verificación previa al despliegue. |
| `npm run sync:sanity` | Actualiza el respaldo offline `public/data/sanity_cache.json` consultando Sanity API en directo. |
| `npm run budget:new` | Genera un nuevo presupuesto secuencial (`NN+1`) dentro de `_internal/presupuestos/` sin tocar versiones previas ni exponer archivos en la raíz web. |

---

## Despliegue Seguro en Producción (Vercel / Cloudflare Pages)

1. Conecta el repositorio Git a **Vercel** o **Cloudflare Pages**.
2. Configuración de compilación:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Seguridad confidencial garantizada:
   - La carpeta `_internal/` está excluida en `.gitignore` y fuera del `root` (`src/`) y `publicDir` (`public/`) de Vite, por lo que **nunca** puede filtrarse en `dist/` ni servirse públicamente.
