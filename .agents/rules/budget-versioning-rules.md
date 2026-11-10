# Reglas de Versionado Incremental y Blindaje Confidencial de Presupuestos — Exotics Collections

## 🔒 Directiva Obligatoria 1: Blindaje Fuera de Raíz Pública (`_internal/presupuestos/`)
1. **PROHIBIDO CREAR PRESUPUESTOS EN `src/`, `public/`, `dist/` O LA RAÍZ DEL PROYECTO**:
   - Todos los presupuestos, estudios de mercado, márgenes internos y plantillas económicas residen **exclusivamente** en `c:\EXOTICS\_internal\presupuestos\`.
   - Jamás vuelvas a copiar `presupuesto.html` ni `presupuesto.pdf` en la raíz del proyecto ni dentro de carpetas servidas por Vite (`src/` o `public/`), para impedir cualquier filtración de la Hoja 2 confidencial en despliegues públicos.

## 🔒 Directiva Obligatoria 2: Versionado Secuencial Inmutable
1. **PROHIBIDO SOBREESCRIBIR O EDITAR VERSIONES ANTERIORES**:
   - Bajo ninguna circunstancia se modificarán, renombrarán ni sobreescribirán los archivos numerados existentes en `c:\EXOTICS\_internal\presupuestos\` (`01_...` hasta `08_...` y sucesivos).
   - El historial de presupuestos es un registro comercial y de auditoría inmutable.

2. **CREACIÓN INCREMENTAL AUTOMÁTICA (`npm run budget:new`)**:
   - Cada vez que el usuario solicite un nuevo presupuesto, revisión económica o actualización de alcance:
     1. Se inspeccionará `c:\EXOTICS\_internal\presupuestos\` para obtener el índice más alto existente `NN`.
     2. Se creará la nueva versión con el índice inmediatamente posterior `NN + 1` (ej. tras `08`, la siguiente es `09`).
     3. Se generarán ambos formatos en `c:\EXOTICS\_internal\presupuestos\`:
        - `<NN+1>_presupuesto_<slug>.html`
        - `<NN+1>_presupuesto_<slug>.pdf` (vía Chrome/Edge Headless).

3. **ADAPTACIÓN CONTINUA AL ALCANCE DEL CÓDIGO**:
   - Cada nueva versión reflejará fielmente la arquitectura real implementada (build Vite v3.0, Sanity CDN en vivo, catálogo segmentado, calculadora IEDMT, optimización WebKit iOS), manteniendo estructura en 2 hojas (Hoja 1 cliente oficial para Marc Ibáñez + Hoja 2 anexo confidencial interno) y registrándose al final de `c:\EXOTICS\_internal\presupuestos\README.md`.
