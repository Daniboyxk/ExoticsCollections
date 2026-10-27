---
name: luxury-bento-catalog
description: >-
  Expert guidelines, UI patterns, and Sanity CMS data workflows for designing and managing
  high-end automotive Bento Grid catalogs and bespoke European vehicle import platforms.
  Use this skill whenever working on vehicle catalogs, stock grids, luxury dealer UI, or import funnels.
---

# Luxury Automotive Bento Grid & Catalog Skill

This skill defines the technical, visual, and editorial standards for **Exotics Collections**, inspired by Europe's premier exotic dealerships:
- **Maison Automotive (Barcelona)**: Deep noir palette (`#060709`, `#0A0A0A`), champagne gold accents, private showroom exclusivity, and editorial serif touches.
- **Hollmann International (Germany)**: International import prestige, collection-driven hierarchy, multi-spec transparency.
- **Mechatronik (Germany)**: Technical inspection rigor, minimal lateral status bands, video walkaround integration.
- **C. de Salamanca & SuperVettura**: White-glove concierge WhatsApp routing, certified pre-owned verification seals.

---

## 1. Brand Philosophy & Core Tone

- **The Garage Standard**: *"Coches que seleccionaríamos para nuestros familiares"* / *"Como si fuera nuestro garaje personal"*.
- **The Core Axiom**: *"No buscamos cualquier coche. Buscamos la unidad perfecta"*.
- **Margin vs. Quality**: Never prioritize short-term profit margins over vehicle integrity, provenance, and long-term customer trust.
- **The Slogan**: *"Exclusividad, diseño y fiabilidad"*.
- **Import Slogan**: *"Encuentra tu nuevo coche en cualquier parte de Europa"*.

---

## 2. Bento Grid Layout Anatomy

The Bento Grid organizes diverse inventory items into an asymmetrical, harmonious hierarchy:

### Grid Configuration
- **Columns**: 3 columns on desktop (`grid-template-columns: repeat(3, 1fr)`), 2 on tablet, 1 on mobile.
- **Aspect Ratios**:
  - `Hero Bento Card`: Spans 2 columns or 2 rows (`col-span-2 row-span-2`), widescreen 16:9 imagery, full specs bar, quote badge.
  - `Panoramic Card`: Spans 2 columns (`col-span-2`), horizontal split with vehicle specs and high-contrast pricing.
  - `Standard Card`: 1 column, vertical editorial format, edge-to-edge photography, micro-pills.
  - `Infocard / Utility Tile`: Highlights the *Importación a la Carta* funnel, YouTube peritaje behind-the-scenes, or technical criteria.

### Card Elements
1. **Lateral Status Ribbon**:
   - Replace chunky overlays with an ultra-clean vertical micro-band on the left border:
     - **Disponible**: Accent emerald `#10b981` (pulsing indicator dot).
     - **Reservado**: Warm amber/gold `#d4a359`.
     - **Entregado**: Subtle cool slate `#64748b`.
2. **Micro-Specs Bar**:
   - Year | Kilometers | Transmission | Fuel | Environmental Badge (0, ECO, C).
3. **Curator's Note Badge**:
   - Highlight on flagship cards: *"Unidad seleccionada por Marc Ibáñez"*.
4. **Action Pair**:
   - Primary: **«Me interesa esta unidad»** (Direct WhatsApp link with prefilled context).
   - Secondary: **«Reservar unidad»** / **«Ver Ficha Completa»**.

---

## 3. Rigorous Vehicle Selection Criteria

When showcasing vehicles or filtering import candidates:
- **Age**: Under 7 years old.
- **Mileage**: Strictly under 90.000 km.
- **Provenance**: Official dealer network (Porsche Zentrum, BMW M, Audi Sport, Mercedes-AMG).
- **Inspection Checklist**:
  - Complete OBD electronic diagnostics (no error codes, launch control counter verification).
  - Paint gauge thickness inspection (micras de pintura) across all panels to detect repaints/accidents.
  - Complete physical service booklet and certified digital dealer log.
  - Chassis underbody and suspension inspection.
  - Dynamic road test on German Autobahn / highway.

---

## 4. Single Vehicle Detail (`car.html`)

Every vehicle page must feature:
1. **Dedicated Section: «¿Por qué hemos seleccionado esta unidad?»**:
   - Premium boxed container with dark glassmorphism and subtle gold border.
   - Explains the specific uniqueness of the chassis (e.g. rare color, full carbon pack, single owner, zero over-revs).
2. **Video Showcase**:
   - Dynamic video walkthrough or YouTube test drive embed.
3. **Dual CTAs**:
   - `btn-interest`: «Me interesa esta unidad»
   - `btn-reserve`: «Reservar unidad»
4. **WhatsApp Prefill Format**:
   ```javascript
   "Hola Marc, estoy interesado en el vehículo " + carName + " (" + price + ") de Exotics Collections. ¿Sigue disponible? Me gustaría recibir más fotos y detalles."
   ```

---

## 5. Team & Concierge Roles

- **Marc Ibáñez**: Founder, lead curator, inspection specialist, YouTuber (`@exoticsbcn`).
- **Fons**: Master technician & peritaje specialist in Germany/Europe.
- **Beltrán**: Customer care & client concierge (*"Acompañamiento y atención al cliente para hacer los procesos más fluidos"*).
