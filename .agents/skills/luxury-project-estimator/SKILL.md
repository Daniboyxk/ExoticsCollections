---
name: luxury-project-estimator
description: Step-by-step workflow for generating incremental, sequentially numbered luxury budgets (01, 02, 03, 04, 05...), market studies, and maintenance proposals for Exotics Collections. Inspects workspace changes, compiles dual-sheet HTML and vector PDF without ever overwriting past versions.
---

# Luxury Project Estimator & Incremental Budget Skill

Use this skill whenever the user asks for a new budget, market study, cost estimation, maintenance proposal, or pricing update for **Exotics Collections**.

---

## 🔒 1. Core Rule: Immutable Sequential Numbering
**Never edit or overwrite previous numbered files in `c:\EXOTICS\presupuestos\`**.
Every iteration must preserve past files as an immutable paper trail:
1. Scan `c:\EXOTICS\presupuestos\` to find the highest existing index `NN` (e.g. `04`).
2. The new version must be `NN + 1` (e.g. `05`).
3. Filename convention:
   `c:\EXOTICS\presupuestos\05_presupuesto_<slug>.html`
   `c:\EXOTICS\presupuestos\05_presupuesto_<slug>.pdf`

---

## 🔍 2. Step-by-Step Generation Workflow

### Step 1: Detect Code Changes & Feature Scope
Before writing the proposal, inspect recent changes across the website:
- Check `git status` or file modification times.
- Note any new pages (`importacion.html`, `sobre-nosotros.html`, `car.html`).
- Note UI additions (e.g., collapsible filter tray on `stock.html`, editorial cover photography, safe-area iPhone dock bar).
- Adapt the module descriptions and hours accordingly.

### Step 2: Assemble the Dual-Sheet HTML Document
Ensure the document contains:
- **Sheet 1 (Client View — Marc Ibáñez)**:
  - Document Title, Reference code (e.g., `PROP-2026-EXOTICS-05`), current date in Spanish format.
  - Client & Agency party cards.
  - ROI Callout Banner (Amortización con 1 sola importación / venta cerrada).
  - 5 Modules breakdown with commercial value explained for Marc:
    - Módulo 1: Dirección de Arte & Editorial Design System (350 €).
    - Módulo 2: Catálogo Editorial de Stock con Filtros Desplegables & Bento de Entregas (450 €).
    - Módulo 3: Conexión con Sanity.io CMS & Ficha de Coche (`car.html`) (500 €).
    - Módulo 4: Embudo de Conversión WhatsApp Directo & Páginas de Importación y Sobre Nosotros (300 €).
    - Módulo 5: Optimización Móvil iPhone (WebKit Dock Bar), Performance & SEO Local (250 €).
  - Economic summary: 1.850,00 € Base + 21% IVA (388,50 €) = 2.238,50 €.
  - Optional Plan A: Mantenimiento Técnico & Rendimiento VIP (79,00 €/mes + IVA).
  - Payment milestones (40% start, 30% prototype, 30% live delivery) & signatures.
- **Sheet 2 (Internal Developer View — Confidential)**:
  - Hours breakdown (~28 hours at ~66 €/h).
  - Technical justification and margin analysis (95% net profit margin on the 79 €/mo retainer).
  - Monthly WhatsApp retention script for Marc.

### Step 3: Vector PDF Generation via Headless Chrome
Execute the command:
```powershell
powershell -Command "Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--headless', '--no-sandbox', '--disable-gpu', '--print-to-pdf=C:\EXOTICS\presupuestos\<NN>_presupuesto_<slug>.pdf', 'http://localhost:4000/presupuestos/<NN>_presupuesto_<slug>.html' -Wait -NoNewWindow"
```

### Step 4: Synchronize Master & Update README
1. Copy the new HTML content to `c:\EXOTICS\presupuesto.html` (adapting `../assets` to `assets`).
2. Copy the new PDF to `c:\EXOTICS\presupuesto.pdf`.
3. Add a new row to the table in `c:\EXOTICS\presupuestos\README.md` with the new version number, date, amount, links, and summary.
