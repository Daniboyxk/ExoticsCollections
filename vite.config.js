import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const partialsDir = resolve(__dirname, 'src/partials');

/**
 * Lightweight build-time HTML partials plugin (zero external dependencies).
 * Replaces <!-- @partial:header active="inicio" --> and <!-- @partial:footer -->
 * with single-source-of-truth markup and marks the active navigation item.
 */
function registerCleanUrlAndLegacyMiddleware(server) {
  const legacyRedirects = {
    '/sobre_nosotros': '/sobre-nosotros.html',
    '/politica-de-privacidad': '/legal.html#privacidad',
    '/terminos-y-condiciones': '/legal.html#condiciones',
    '/politica-de-cookies': '/legal.html#cookies'
  };
  const cleanPages = new Set(['/stock', '/car', '/importacion', '/sobre-nosotros', '/contacto', '/legal']);

  server.middlewares.use((req, res, next) => {
    if (!req.url) return next();
    const [pathname, qs] = req.url.split('?');
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    if (legacyRedirects[cleanPath]) {
      res.writeHead(301, { Location: legacyRedirects[cleanPath] + (qs ? `?${qs}` : '') });
      res.end();
      return;
    }

    if (cleanPages.has(cleanPath)) {
      req.url = `${cleanPath}.html${qs ? `?${qs}` : ''}`;
    }
    next();
  });
}

function exoticsHtmlPartialsPlugin() {
  return {
    name: 'exotics-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          /<!--\s*@partial:([a-z0-9_-]+)(?:\s+active="([a-z0-9_-]+)")?\s*-->/gi,
          (_, partialName, activeKey) => {
            const partialPath = resolve(partialsDir, `${partialName}.html`);
            if (!fs.existsSync(partialPath)) {
              throw new Error(`[exotics-partials] Missing partial: ${partialPath}`);
            }
            let content = fs.readFileSync(partialPath, 'utf-8');
            if (activeKey) {
              const navPattern = new RegExp(
                `(<a\\b[^>]*\\bdata-nav="${activeKey}"[^>]*\\bclass="[^"]*)"`,
                'g'
              );
              content = content.replace(navPattern, '$1 active" aria-current="page"');
            }
            return content;
          }
        );
      }
    },
    configureServer(server) {
      registerCleanUrlAndLegacyMiddleware(server);
      server.watcher.add(partialsDir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(partialsDir)) {
          server.ws.send({ type: 'full-reload', path: '*' });
        }
      });
    },
    configurePreviewServer(server) {
      registerCleanUrlAndLegacyMiddleware(server);
    }
  };
}

export default defineConfig({
  appType: 'mpa',
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [exoticsHtmlPartialsPlugin()],
  server: {
    port: 4000,
    strictPort: true,
    host: true
  },
  preview: {
    port: 4000,
    strictPort: true
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        stock: resolve(__dirname, 'src/stock.html'),
        car: resolve(__dirname, 'src/car.html'),
        importacion: resolve(__dirname, 'src/importacion.html'),
        sobreNosotros: resolve(__dirname, 'src/sobre-nosotros.html'),
        contacto: resolve(__dirname, 'src/contacto.html'),
        legal: resolve(__dirname, 'src/legal.html'),
        notFound: resolve(__dirname, 'src/404.html')
      }
    }
  }
});
