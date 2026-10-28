# Reglas de Versionado Incremental de Presupuestos — Exotics Collections

## 🔒 Directiva Obligatoria: Versionado Secuencial Inmutable
1. **PROHIBIDO SOBREESCRIBIR O EDITAR VERSIONES ANTERIORES**:
   - Bajo ninguna circunstancia se modificarán o sobreescribirán los archivos existentes numerados en `c:\EXOTICS\presupuestos\` (ej. `01_...`, `02_...`, `03_...`, `04_...`).
   - El historial de presupuestos es un registro legal y comercial inmutable para auditoría.

2. **CREACIÓN INCREMENTAL AUTOMÁTICA**:
   - Cada vez que el usuario solicite un nuevo presupuesto, revisión económica, actualización de alcance o cálculo de costes:
     1. Se inspeccionará `c:\EXOTICS\presupuestos\` para obtener el número más alto existente `NN`.
     2. Se creará la nueva versión con el índice inmediatamente posterior `NN + 1` (ej. si existen 01 al 04, la siguiente es **05**, luego **06**, etc.).
     3. Se generarán obligatoriamente los dos formatos:
        - `c:\EXOTICS\presupuestos\<NN+1>_presupuesto_<slug>.html`
        - `c:\EXOTICS\presupuestos\<NN+1>_presupuesto_<slug>.pdf` (vía Chrome Headless).

3. **ADAPTACIÓN CONTINUA AL ALCANCE DEL CÓDIGO**:
   - Cada nueva versión debe auto-adaptarse a los últimos cambios reales implementados en el proyecto (nuevas páginas creadas, filtros interactivos, componentes móviles WebKit, integración con Sanity, etc.).
   - Se debe incluir siempre:
     - Fecha actualizada en formato español.
     - Estructura en 2 hojas (Hoja 1 oficial para Marc Ibáñez + Hoja 2 anexo confidencial interno de horas y márgenes).
     - Justificación de ROI (amortización garantizada con 1 sola venta/importación).
     - Propuesta de Mantenimiento VIP Esencial (79 €/mes + IVA).

4. **ACTUALIZACIÓN DEL ÍNDICE MAESTRO**:
   - Toda nueva versión creada debe registrarse en la tabla de `c:\EXOTICS\presupuestos\README.md` sin alterar los registros pasados.
   - Los archivos de acceso rápido en la raíz (`presupuesto.html` y `presupuesto.pdf`) se sincronizarán siempre con la versión activa más reciente.
