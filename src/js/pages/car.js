import { EXOTICS_CONFIG, escapeHtml } from '../config.js';
import { extractYouTubeId, fetchAllData } from '../sanity-client.js';
import { openVideoModal } from '../ui.js';

function injectVehicleJsonLd(car) {
  const existing = document.getElementById('vehicle-jsonld');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'vehicle-jsonld';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.name,
    brand: { '@type': 'Brand', name: car.brand },
    vehicleModelDate: car.year,
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    color: car.colorExt,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.numericKm || undefined,
      unitCode: 'KMT'
    },
    image: car.images.map((img) => img.full),
    offers: {
      '@type': 'Offer',
      price: car.numericPrice || undefined,
      priceCurrency: 'EUR',
      availability:
        car.availability === 'disponible'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
      seller: {
        '@type': 'AutoDealer',
        name: EXOTICS_CONFIG.brandName,
        telephone: EXOTICS_CONFIG.phoneDisplay
      }
    }
  });
  document.head.appendChild(script);
}

async function initCarDetailPage() {
  const showroomRoot = document.getElementById('car-showroom-root');
  if (!showroomRoot) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('id');

  const data = await fetchAllData();
  const cars = data.cars || [];

  // Match readable SEO slug first, with 100% backward compatibility for Sanity custom id and legacy UUID _id
  const normalizedReq = requestedId ? requestedId.trim().toLowerCase() : '';
  const car = requestedId
    ? cars.find((c) => c.slug === normalizedReq || c.id === requestedId || c.sanitySlug === normalizedReq)
    : cars[0];

  if (!car) {
    document.title = 'Unidad Entregada o No Disponible | Exotics Collections';
    const bc = document.getElementById('breadcrumb-car');
    if (bc) bc.textContent = 'Unidad Entregada';
    const mobileBar = document.getElementById('mobile-car-bar');
    if (mobileBar) mobileBar.style.display = 'none';

    showroomRoot.innerHTML = `
      <div class="sold-unit-state">
        <span class="status-chip status-chip--delivered">UNIDAD YA ENTREGADA O RETIRADA</span>
        <h1 class="editorial-serif-title" style="margin-top: 1rem;">Esta unidad ya tiene propietario</h1>
        <p class="editorial-lead" style="margin: 0.75rem auto 2rem;">
          Los vehículos verificados de Exotics Collections rotan con rapidez. Si buscabas esta configuración concreta, Marc Ibáñez puede rastrear una unidad gemela en la red oficial alemana y entregártela llave en mano en 10–15 días.
        </p>
        <div style="display: inline-flex; gap: 0.85rem; flex-wrap: wrap; justify-content: center;">
          <a href="importacion.html#solicitar-busqueda" class="btn-primary">ENCARGAR UNIDAD SIMILAR EN EUROPA ↗</a>
          <a href="stock.html" class="btn-secondary">VER STOCK DISPONIBLE ACTUAL</a>
        </div>
      </div>
    `;
    return;
  }

  // Normalize URL bar to clean human-readable slug & inject dynamic canonical link
  if (car.slug && requestedId !== car.slug && window.history?.replaceState) {
    const cleanSearch = `?id=${encodeURIComponent(car.slug)}`;
    window.history.replaceState(null, '', `${window.location.pathname}${cleanSearch}`);
  }

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute(
    'href',
    `https://exoticscollections.com/car?id=${encodeURIComponent(car.slug || car.id)}`
  );

  // Update Metadata & JSON-LD
  document.title = `${car.name} (${car.year}) | Exotics Collections`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `${car.name} · ${car.year} · ${car.km} · ${car.price}. Revisado bajo estándar Exotics Collections en Barcelona con 12 meses de garantía.`
    );
  }
  injectVehicleJsonLd(car);

  const bc = document.getElementById('breadcrumb-car');
  if (bc) bc.textContent = car.name;

  // Status Mapping
  const statusMap = {
    disponible: { text: 'DISPONIBLE PARA ENTREGA', chipClass: 'status-chip--avail' },
    reservado: { text: 'UNIDAD RESERVADA', chipClass: 'status-chip--reserved' },
    vendido: { text: 'UNIDAD ENTREGADA', chipClass: 'status-chip--sold' }
  };
  const st = statusMap[car.availability] || statusMap.disponible;

  // Commercial accuracy on price label
  const priceEyebrow = car.parsedDescription.hasSeparateTransferFee
    ? 'GARANTÍA 12 MESES INCLUIDA'
    : 'PRECIO LLAVE EN MANO';

  const interestUrl = EXOTICS_CONFIG.getCarWhatsAppUrl(car.name, car.price, window.location.href, 'interest');
  const reserveUrl = EXOTICS_CONFIG.getCarWhatsAppUrl(car.name, car.price, window.location.href, 'reserve');
  const videoId = extractYouTubeId(car.videoUrl);

  // Build Datenblatt 8 Technical Rows
  const specsRows = [
    { label: 'Año Matriculación', val: car.year },
    { label: 'Kilometraje Certificado', val: car.km },
    { label: 'Motorización / Potencia', val: car.engine },
    { label: 'Transmisión', val: car.transmission },
    { label: 'Combustible', val: car.fuel },
    { label: 'Distintivo Ambiental', val: car.dgtBadge },
    { label: 'Exterior / Interior', val: `${car.colorExt} / ${car.colorInt}` },
    { label: 'Régimen & Garantía', val: `${car.regime} · 12 Meses` }
  ];

  const paragraphsHtml = car.parsedDescription.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');

  function getDossierLabel(item) {
    const s = String(item || '').toLowerCase();
    if (/km|kil[oó]metro/i.test(s)) return 'Kilometraje Certificado';
    if (/itv/i.test(s)) return 'Inspección Técnica ITV';
    if (/mantenimiento|revisi[oó]n|aceite/i.test(s)) return 'Mantenimiento Mecánico';
    if (/distribuci[oó]n/i.test(s)) return 'Correa de Distribución';
    if (/4x4|reductora|tracci[oó]n/i.test(s)) return 'Sistema de Tracción';
    if (/c[aá]mara|aparcamiento|sensores?|park/i.test(s)) return 'Asistencia Aparcamiento';
    if (/nacional|propietario|titular/i.test(s)) return 'Procedencia & Historial';
    if (/garant[ií]a/i.test(s)) return 'Garantía Incluida';
    if (/entrega|listo|circular|revisado/i.test(s)) return 'Estado de Entrega';
    if (/techo|panor[aá]mico|sky/i.test(s)) return 'Techo & Carrocería';
    if (/asiento|calefactable|cuero|alcantara/i.test(s)) return 'Confort & Tapicería';
    if (/frenos?|discos?|pastillas?/i.test(s)) return 'Sistema de Frenado';
    if (/escape|v[aá]lvulas?|sonido/i.test(s)) return 'Línea de Escape';
    if (/neum[aá]tico|ruedas?|llantas?/i.test(s)) return 'Llantas & Neumáticos';
    if (/climatizador|aire|ac\b/i.test(s)) return 'Climatización';
    if (/cambio|dct|autom[aá]tico|manual/i.test(s)) return 'Transmisión';
    return 'Punto Verificado';
  }

  const secs = car.parsedDescription.sections || [];
  const allDossierItems = [];
  secs.forEach((sec) => {
    sec.items.forEach((item) => {
      allDossierItems.push({
        label: getDossierLabel(item),
        val: item
      });
    });
  });

  const deliveryCondVal = car.parsedDescription.transferFeeNote
    ? car.parsedDescription.transferFeeNote
    : 'Revisado · Gestión integral';

  if (!allDossierItems.some((r) => /Garantía/i.test(r.label))) {
    allDossierItems.push({ label: 'Garantía Incluida', val: '12 Meses Cobertura Europea' });
  }
  if (!allDossierItems.some((r) => /Entrega/i.test(r.label))) {
    allDossierItems.push({ label: 'Condiciones & Entrega', val: deliveryCondVal });
  }
  allDossierItems.push({ label: 'Protocolo Exotics', val: '150 Puntos de control peritados' });
  allDossierItems.push({ label: 'Diagnosis Centralitas', val: 'Diagnosis electrónica oficial sin averías registradas' });

  function isPortraitAsset(url) {
    const m = String(url || '').match(/-(\d+)x(\d+)\./);
    if (!m) return false;
    return parseInt(m[2], 10) > parseInt(m[1], 10);
  }

  const images = car.images;
  const previewThumbs = [];
  for (let i = 1; i < Math.min(5, images.length); i++) {
    previewThumbs.push({ index: i, img: images[i] });
  }
  while (previewThumbs.length < 4 && images.length > 0) {
    const idx = previewThumbs.length % images.length;
    previewThumbs.push({ index: idx, img: images[idx] });
  }

  showroomRoot.innerHTML = `
    <!-- 1. Multi-Angle Gallery Stage -->
    <div class="gallery-stage">
      <div class="gallery-main" id="gallery-main-wrap" title="Haz clic para abrir el visor de inspección">
        <div class="gallery-main__backdrop" id="gallery-backdrop"></div>
        <img
          id="main-gallery-img"
          class="gallery-main__img${isPortraitAsset(images[0].full) ? ' is-portrait' : ''}"
          src="${escapeHtml(images[0].full)}"
          alt="${escapeHtml(car.name)}"
        />

        <div class="gallery-counter-badge">
          <span id="gallery-curr">1</span> / <span id="gallery-tot">${images.length}</span> FOTOS
        </div>

        <button type="button" class="gallery-nav gallery-nav--prev" id="gallery-prev" aria-label="Fotografía anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button type="button" class="gallery-nav gallery-nav--next" id="gallery-next" aria-label="Fotografía siguiente">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div class="gallery-actions-bottom">
          ${
            videoId
              ? `<button type="button" class="gallery-pill-btn" id="btn-car-video">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span>VÍDEO</span>
                </button>`
              : ''
          }
          <button type="button" class="gallery-pill-btn" id="gallery-expand-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            <span>INSPECCIONAR (${images.length})</span>
          </button>
        </div>
      </div>

      <div class="gallery-thumbs-bento" id="gallery-thumbs-bento">
        ${previewThumbs
          .map((item, i) => {
            const isLast = i === previewThumbs.length - 1 && images.length > 4;
            return `
              <button
                type="button"
                class="gallery-thumb"
                data-index="${item.index}"
                data-open-all="${isLast ? 'true' : 'false'}"
                aria-label="${isLast ? `Abrir galería completa de ${images.length} fotografías` : `Ver ángulo ${item.index + 1}`}"
              >
                <img src="${escapeHtml(item.img.thumb)}" alt="${escapeHtml(car.name)} ángulo ${item.index + 1}" loading="lazy" />
                ${
                  isLast
                    ? `<div class="gallery-thumb__more">
                        <span>+ VER LAS ${images.length} FOTOS</span>
                      </div>`
                    : ''
                }
              </button>
            `;
          })
          .join('')}
      </div>
    </div>

    <!-- 2. Vehicle Identity Bar -->
    <div class="vehicle-identity">
      <div>
        <h1 class="vehicle-identity__title">${escapeHtml(car.name)}</h1>
        <div class="vehicle-identity__tagline">
          ${escapeHtml([car.year, car.regime.toUpperCase(), car.km, car.bodyType.toUpperCase()].filter(Boolean).join(' · '))}
        </div>
      </div>
      <div class="vehicle-identity__right">
        <span class="vehicle-identity__price-label">${escapeHtml(priceEyebrow)}</span>
        <div class="vehicle-identity__price">${escapeHtml(car.price)}</div>
        <div class="vehicle-identity__chips">
          <span class="status-chip ${st.chipClass}">
            <span class="status-dot"></span>
            <span>${st.text}</span>
          </span>
          <span class="dgt-chip">${escapeHtml(car.dgtBadge)}</span>
        </div>
      </div>
    </div>

    <!-- 3. Showroom Content + Sticky Concierge -->
    <div class="car-showroom-grid">
      <div class="car-left-stack">
        <!-- Criterio de Selección (Real Portrait of Marc Ibáñez) -->
        <section class="curator-card" aria-label="Criterio de Selección">
          <span class="curator-card__eyebrow">CRITERIO DE SELECCIÓN EXOTICS</span>
          <h2 class="curator-card__title">¿Por qué hemos seleccionado esta unidad?</h2>
          <p class="curator-card__quote">«${escapeHtml(car.whySelected)}»</p>
          <div class="curator-card__sig">
            <div class="curator-card__author">
              <img src="/assets/image_about_us.jpg" alt="Marc Ibáñez" class="curator-card__avatar" />
              <div>
                <div class="curator-card__name">Marc Ibáñez</div>
                <div class="curator-card__role">Fundador &amp; Perito Principal · Exotics Collections</div>
              </div>
            </div>
            <span class="curator-card__seal">✓ UNIDAD VERIFICADA</span>
          </div>
        </section>

        <!-- Especificaciones Técnicas -->
        <section aria-label="Ficha Técnica">
          <div class="section-index-bar" style="margin-bottom: 1rem;">
            <span>(01) — ESPECIFICACIONES TÉCNICAS</span>
            <span>DATOS DE FABRICANTE</span>
          </div>
          <h2 class="datenblatt-title">Ficha Técnica &amp; Trazabilidad</h2>
          <div class="datenblatt-grid">
            ${specsRows
              .map(
                (r) => `
              <div class="datenblatt-cell">
                <span class="datenblatt-cell__label">${escapeHtml(r.label)}</span>
                <span class="datenblatt-cell__val">${escapeHtml(r.val || '—')}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </section>

        <!-- (02) Estado, Mantenimiento y Equipamiento (Exact Datenblatt Matrix Style) -->
        <section aria-label="Historial y Equipamiento">
          <div class="section-index-bar" style="margin-bottom: 1rem;">
            <span>(02) — DOSSIER DE LA UNIDAD</span>
            <span>EQUIPAMIENTO &amp; MANTENIMIENTO</span>
          </div>
          <h2 class="datenblatt-title">Estado, Mantenimiento y Equipamiento</h2>

          ${
            car.parsedDescription.paragraphs.length
              ? `<div class="datenblatt-summary-box">
                  <div class="datenblatt-summary-head">
                    <span class="datenblatt-cell__label">Informe de Peritaje &amp; Conservación</span>
                    <span class="datenblatt-summary-badge">AUDITADO POR MARC IBÁÑEZ</span>
                  </div>
                  <div class="datenblatt-summary-text">
                    ${car.parsedDescription.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
                  </div>
                </div>`
              : ''
          }

          <div class="datenblatt-grid">
            ${allDossierItems
              .map(
                (r) => `
              <div class="datenblatt-cell">
                <span class="datenblatt-cell__label">${escapeHtml(r.label)}</span>
                <span class="datenblatt-cell__val">
                  <span class="datenblatt-check">✓</span> ${escapeHtml(r.val)}
                </span>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      </div>

      <!-- Sticky Right Concierge Sidebar -->
      <aside class="concierge-card" aria-label="Atención Directa">
        <span class="concierge-card__eyebrow">ATENCIÓN DIRECTA CON MARC IBÁÑEZ · BARCELONA</span>
        <h2 class="concierge-card__title">Gestionar Unidad con Marc</h2>
        <p class="concierge-card__desc">
          Trato directo 1 a 1 sin comerciales. Solicita vídeos en detalle, historial documental o cita privada.
        </p>

        <div class="concierge-quick-grid">
          <div class="concierge-quick-cell">
            <span>KILÓMETROS</span>
            <strong>${escapeHtml(car.km)}</strong>
          </div>
          <div class="concierge-quick-cell">
            <span>AÑO</span>
            <strong>${escapeHtml(car.year)}</strong>
          </div>
          <div class="concierge-quick-cell">
            <span>CAMBIO</span>
            <strong>${escapeHtml(car.transmission)}</strong>
          </div>
          <div class="concierge-quick-cell">
            <span>COMBUSTIBLE</span>
            <strong>${escapeHtml(car.fuel)}</strong>
          </div>
        </div>

        <div class="concierge-cta-stack">
          <a href="${escapeHtml(interestUrl)}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>ME INTERESA ESTA UNIDAD ↗</span>
          </a>
          <a href="${escapeHtml(reserveUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary">
            <span>RESERVAR UNIDAD</span>
          </a>
          <a href="importacion.html#solicitar-busqueda" class="concierge-sourcing-link">
            <span>¿Buscas otra configuración a la carta en Alemania?</span>
            <span>→</span>
          </a>
        </div>

        <ul class="concierge-trust-list">
          <li>Auditoría técnica in situ con informe y vídeo</li>
          <li>12 meses de garantía europea certificada</li>
        </ul>
      </aside>
    </div>
  `;

  // Populate Mobile Sticky Bar
  const mobilePrice = document.getElementById('mobile-car-price');
  const mobileBtn = document.getElementById('mobile-car-wa-btn');
  const mobileReserveBtn = document.getElementById('mobile-car-reserve-btn');
  if (mobilePrice) mobilePrice.textContent = car.price;
  if (mobileBtn) mobileBtn.href = interestUrl;
  if (mobileReserveBtn) mobileReserveBtn.href = reserveUrl;

  // Wire Video Walkaround Button
  const videoBtn = document.getElementById('btn-car-video');
  if (videoBtn && videoId) {
    videoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openVideoModal(videoId);
    });
  }

  // Wire Gallery + Lightbox (with Filmstrip, 2x Zoom, iOS Touch Swipe & Scoped Keyboard)
  let currentIndex = 0;
  const mainImg = document.getElementById('main-gallery-img');
  const currEl = document.getElementById('gallery-curr');
  const mainWrap = document.getElementById('gallery-main-wrap');
  const thumbsWrap = document.getElementById('gallery-thumbs-bento');

  const lightbox = document.getElementById('gallery-lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbFilmstrip = document.getElementById('lightbox-filmstrip');
  const lbZoomBtn = document.getElementById('lightbox-zoom');
  const lbCloseBtn = document.getElementById('lightbox-close');
  const lbPrevBtn = document.getElementById('lightbox-prev');
  const lbNextBtn = document.getElementById('lightbox-next');

  if (lbFilmstrip) {
    lbFilmstrip.innerHTML = images
      .map(
        (img, idx) => `
        <button type="button" class="lightbox__film-thumb" data-idx="${idx}" aria-label="Ir a foto ${idx + 1}">
          <img src="${escapeHtml(img.thumb)}" alt="" loading="lazy" />
        </button>
      `
      )
      .join('');

    lbFilmstrip.querySelectorAll('.lightbox__film-thumb').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActivePhoto(parseInt(btn.getAttribute('data-idx'), 10) || 0);
      });
    });
  }

  function setZoom(zoomed) {
    if (!lightbox) return;
    lightbox.classList.toggle('is-zoomed', zoomed);
    if (lbZoomBtn) lbZoomBtn.textContent = zoomed ? '1X' : 'ZOOM 2X';
  }

  function setActivePhoto(nextIdx) {
    if (!images.length) return;
    currentIndex = (nextIdx + images.length) % images.length;
    const active = images[currentIndex];

    if (currEl) currEl.textContent = String(currentIndex + 1);
    if (mainImg) {
      mainImg.src = active.full;
      mainImg.classList.toggle('is-portrait', isPortraitAsset(active.full));
    }

    // Preload adjacent image for snappy browsing
    const nextPreload = new Image();
    nextPreload.src = images[(currentIndex + 1) % images.length].full;

    if (thumbsWrap) {
      thumbsWrap.querySelectorAll('.gallery-thumb').forEach((t) => {
        const idx = parseInt(t.getAttribute('data-index'), 10);
        t.classList.toggle('is-active', idx === currentIndex);
      });
    }

    if (lightbox && lightbox.classList.contains('is-open')) {
      setZoom(false);
      if (lbImg) lbImg.src = active.full;
      if (lbCounter) lbCounter.textContent = `FOTOGRAFÍA ${currentIndex + 1} / ${images.length}`;
      if (lbFilmstrip) {
        lbFilmstrip.querySelectorAll('.lightbox__film-thumb').forEach((ft, idx) => {
          const activeThumb = idx === currentIndex;
          ft.classList.toggle('is-active', activeThumb);
          if (activeThumb) {
            ft.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        });
      }
    }
  }

  function openLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('is-open');
    document.body.classList.add('has-modal-open');
    setActivePhoto(currentIndex);
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    setZoom(false);
    lightbox.classList.remove('is-open');
    document.body.classList.remove('has-modal-open');
  }

  document.getElementById('gallery-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setActivePhoto(currentIndex - 1);
  });
  document.getElementById('gallery-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setActivePhoto(currentIndex + 1);
  });
  document.getElementById('gallery-expand-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox();
  });

  mainWrap?.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    openLightbox();
  });

  thumbsWrap?.querySelectorAll('.gallery-thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-open-all') === 'true') {
        openLightbox();
      } else {
        setActivePhoto(parseInt(btn.getAttribute('data-index'), 10) || 0);
      }
    });
  });

  lbCloseBtn?.addEventListener('click', closeLightbox);
  lbPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setActivePhoto(currentIndex - 1);
  });
  lbNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setActivePhoto(currentIndex + 1);
  });
  lbZoomBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setZoom(!lightbox.classList.contains('is-zoomed'));
  });
  lbImg?.addEventListener('click', (e) => {
    e.stopPropagation();
    setZoom(!lightbox.classList.contains('is-zoomed'));
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) {
      closeLightbox();
    }
  });

  // Touch Swipe Support for iPhone Safari (both on Main Stage and Lightbox)
  function bindHorizontalSwipe(el) {
    if (!el) return;
    let startX = 0;
    let startY = 0;
    el.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );
    el.addEventListener(
      'touchend',
      (e) => {
        if (!e.changedTouches.length || lightbox?.classList.contains('is-zoomed')) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          setActivePhoto(dx < 0 ? currentIndex + 1 : currentIndex - 1);
        }
      },
      { passive: true }
    );
  }

  bindHorizontalSwipe(mainWrap);
  bindHorizontalSwipe(lightbox);

  // Scoped Keyboard Navigation ONLY when Lightbox is open
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') setActivePhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') setActivePhoto(currentIndex + 1);
  });

  setActivePhoto(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarDetailPage);
} else {
  initCarDetailPage();
}

