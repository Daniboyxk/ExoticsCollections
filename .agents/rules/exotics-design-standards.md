# Exotics Collections — Luxury Design & Brand Guidelines (v3.1)

## Core Brand Identity
- **Name**: Exotics Collections (by Marc Ibáñez, `@exoticsbcn`)
- **Stock Axiom**: «No buscamos cualquier coche. Buscamos la unidad perfecta»
- **Confidence Principle**: «Solo firmamos unidades que pondríamos en nuestro propio garaje»
- **Location & Contact**: Barcelona, España · `+34 697 46 41 04` · `info@exoticscollections.com`

## Ultra-Strict Aesthetic Rules — Obsidian & Champagne × Mechatronik (90/10)
1. **90% German Technical Monochrome + 10% Champagne Gold**:
   - Surfaces: Obsidian `#060709`, Graphite `#0b0d11`, Panel `#101319`, Elevated `#161a22`.
   - Borders: Architectural `1px` hairlines (`rgba(255,255,255,0.08)` to `0.10`), `0px` sharp corners across cards, buttons, and inputs.
   - Primary CTA Buttons (`.btn-primary` & `.btn-nav-concierge`): **Champagne Gold (`#d5ba8c`)** fill with **Obsidian (`#0a0a0a`)** text (`#e2c99d` on hover).
   - Secondary Instrument Accent (**Champagne Gold `#cbb084`**): Used for active navigation hairlines, `(01)–(06)` section indices, `Disponible` status pills, and curator seals.
   - **Zero Green Rule**: Avoid green (`#10b981`, `#22c55e`, etc.) across the entire platform; use Champagne Gold (`#cbb084`) for `Disponible` / positive states and Amber (`#f59e0b`) for `Reservado`.
   - **Navbar Seamlessness**: Never add a bottom hairline/border on `.site-header` that cuts across the Hero video; use a smooth dark top gradient (`::before`) and soft shadow on scroll.
   - **Developer Credit**: Preserve the personal signature `Diseño & Ingeniería · DanielZV Desarrollador Web` in `src/partials/footer.html`.
   - Visual benchmarks: *Mechatronik*, *Maison Automotive*, *Hollmann International*.

2. **Typography & Strict Roman Accents (Zero Cursivas / Zero Italics)**:
   - Editorial Serif Headings: `Cormorant Garamond` (loaded once via HTML `<link>`, never `@import`).
   - **Zero Cursivas Rule**: Any keyword or accent wrapped in `<em>` or highlighted in Champagne Gold (`#cbb084`) MUST have `font-style: normal;` (upright/roman cut). Never italicize titles or headings.
   - Technical Labels / Indices / Buttons: `Barlow Semi Condensed` uppercase with wide tracking (`0.14em` - `0.20em`).
   - UI & Body Copy: `Inter` with `font-variant-numeric: tabular-nums` on all prices, years, mileage, and calculator figures.
   - **Zero Emojis**: Absolute prohibition of emojis in code, production markup, UI labels, or formal executive reports.

3. **Photographic Integrity & Cinematic Stage**:
   - High-contrast natural vehicle imagery: never apply muddy dark scrims or low-contrast filters directly over the bodywork of the cars.
   - **Desktop Split 50/50 Seam**: In side-by-side hero compositions, the transition between image and text uses a directional `linear-gradient` mask dissolving the photo into solid Obsidian `#060709`, eliminating hard rectangular borders.
   - **Mobile 45vh Banner**: In smartphone viewports, vehicles crown the top 45vh with the editorial text floating cleanly over deep black below.

4. **iOS Safari WebKit & Mobile Ergonomics**:
   - Mandatory `viewport-fit=cover`, `-webkit-backdrop-filter` paired with `backdrop-filter`, and `16px` minimum font size on touch form inputs to prevent iOS auto-zoom.
   - Single-source-of-truth Header + Mobile Drawer (`src/partials/header.html`) and Footer (`src/partials/footer.html`).
   - Floating elements collision prevention: on `car.html` (`body.page-car`), hide `.floating-wa` below `1024px` so `.mobile-car-bar` never overlaps action buttons or footer links.

5. **Technical Vehicle Admission Criteria & Inviolable Data**:
   - Admission filters: strictly < 7 years old, < 90,000 certified km, 100% official brand dealer maintenance history.
   - In-situ peritaje: paint thickness micrometer test panel by panel and official OBD2 diagnostic telemetry.
   - Turnkey delivery in 10-15 business days with 12 months comprehensive European warranty without deductible.

6. **Confidential Isolation & Document Versioning Protocol**:
   - All budgets, financial models, and strategic reports reside exclusively in `_internal/presupuestos/`. Never output to `src/`, `public/`, or root.
   - Sequential immutable numbering: existing reports (`01_...` to `12_...`) must never be modified or overwritten. Each new request generates `NN+1` with both `.html` and `.pdf` formats.

7. **Team Roles**:
   - **Marc Ibáñez**: Fundador & Perito Principal (`/assets/image_about_us.jpg`)
   - **Fons**: Especialista Técnico & Auditoría Presencial
   - **Álex Beltrán**: Atención al Cliente, Operaciones & Entregas

## Mandatory Interactive & QA Protocol
1. **Always Audit for Errors**:
   - Verify Vite `npm run build` succeeds cleanly, Sanity CDN queries remain live-first (`apicdn.sanity.io`) with `/data/sanity_cache.json` fallback, and all dynamic strings pass through `escapeHtml()`.
2. **Always Ask 1 or 2 Steering Questions**:
   - Conclude responses with 1 or 2 concise, strategic steering questions with a `(Recomendado)` option when further decisions exist.
