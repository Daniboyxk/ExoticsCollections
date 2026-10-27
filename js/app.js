/**
 * Exotics Collections - Main Application Logic
 * Integrates Sanity CMS data, Bento Grid presentation, lateral status ribbons,
 * Video modal, and bespoke European import funnel.
 */
document.addEventListener('DOMContentLoaded', async function() {
  'use strict';

  var cfg = window.EXOTICS_CONFIG || {};
  var sanity = window.ExoticsSanity;

  // Initialize Header Scroll Effect
  var header = document.querySelector('.site-header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Drawer
  var menuToggle = document.getElementById('menu-toggle');
  var mobileDrawer = document.getElementById('mobile-drawer');
  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', function() {
      mobileDrawer.classList.toggle('open');
    });
    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Video Modal Logic
  var videoModal = document.getElementById('video-modal');
  var videoIframe = document.getElementById('video-iframe');
  var videoClose = document.getElementById('video-modal-close');

  function openVideoModal(youtubeId) {
    if (!videoModal || !videoIframe || !youtubeId) return;
    videoIframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(youtubeId) + '?autoplay=1&rel=0';
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    videoModal.classList.remove('active');
    videoIframe.src = '';
    document.body.style.overflow = '';
  }

  if (videoClose) videoClose.addEventListener('click', closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener('click', function(e) {
      if (e.target === videoModal) closeVideoModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // Fetch Live Data from Sanity
  var data = null;
  try {
    data = await sanity.fetchAllData();
  } catch (err) {
    console.error('Error loading data:', err);
  }

  if (!data) return;

  // 1. Render Deliveries Showcase (Client requested: en esta parte solo casos reales o entregas en Europa)
  renderImportsShowcase(data.imports);

  // 2. Render YouTube Showcase Section (Now positioned at the end of the page)
  renderYouTubeShowcase(data.youtube);

  // 3. Initialize Interactive Import Funnel Form
  initImportForm();

  // 4. Initialize iPhone Bottom Dock Bar active state tracking
  var dockItems = document.querySelectorAll('.iphone-dock-item');
  dockItems.forEach(function(item) {
    item.addEventListener('click', function() {
      dockItems.forEach(function(d) { d.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  // Helper: Render YouTube Cards
  function renderYouTubeShowcase(videos) {
    var container = document.getElementById('youtube-grid');
    if (!container || !videos || !videos.length) return;

    container.innerHTML = videos.map(function(v) {
      return `
        <article class="yt-card" data-video-id="${v.id}">
          <div class="yt-thumb-wrap">
            <img class="yt-thumb" src="${v.thumb}" alt="${v.title}" loading="lazy" />
            <div class="yt-play-btn" title="Reproducir vídeo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            </div>
            <span class="yt-duration">${v.duration}</span>
          </div>
          <div class="yt-body">
            <div class="yt-tag">${v.tag}</div>
            <h3 class="yt-title">${v.title}</h3>
            <p class="yt-desc">${v.highlight}</p>
          </div>
        </article>
      `;
    }).join('');

    container.querySelectorAll('.yt-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var vid = card.getAttribute('data-video-id');
        if (vid) openVideoModal(vid);
      });
    });
  }

  // Helper: Render Home Bento Stock Grid
  function renderStockBentoGrid(cars) {
    var container = document.getElementById('featured-cars-grid');
    if (!container || !cars) return;

    var filterBtns = document.querySelectorAll('.filter-btn');
    var activeCategory = 'all';

    function getDgtBadgeClass(badge) {
      if (!badge) return 'badge-c';
      var b = badge.toLowerCase();
      if (b.indexOf('0') >= 0 || b.indexOf('cero') >= 0) return 'badge-zero';
      if (b.indexOf('eco') >= 0) return 'badge-eco';
      return 'badge-c';
    }

    function filterAndRender() {
      var filtered = cars.filter(function(car) {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'available') return car.availability === 'disponible';
        return car.category === activeCategory;
      });

      if (!filtered.length) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(14, 18, 26, 0.85); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
            <div class="badge-gold" style="margin-bottom: 0.75rem;">Garaje Exclusivo</div>
            <h3 style="color: #fff; font-size: 1.4rem; margin-bottom: 0.5rem;">Actualmente no hay unidades disponibles en esta categoría</h3>
            <p style="color: var(--text-secondary); max-width: 520px; margin: 0 auto 1.5rem;">
              «No buscamos cualquier coche. Buscamos la unidad perfecta». Pídenos la configuración que deseas y la localizamos en Europa.
            </p>
            <a href="#importacion" class="btn btn-gold">Solicitar Búsqueda a la Carta</a>
          </div>
        `;
        return;
      }

      container.className = 'bento-catalog-grid';
      container.innerHTML = filtered.map(function(car, idx) {
        var isAvail = car.availability === 'disponible';
        var statusModifier = isAvail ? 'bento-card--available' : 'bento-card--reserved';
        var pillModifier = isAvail ? 'bento-status-pill--available' : 'bento-status-pill--reserved';
        var statusText = isAvail ? 'Disponible' : 'Reservado';

        var carUrl = 'car.html?id=' + encodeURIComponent(car.id);
        var waInterestUrl = cfg.getCarWhatsAppUrl(car.name, car.price, window.location.origin + '/' + carUrl, 'interest');

        var spanClass = '';
        if (idx === 0) spanClass = 'bento-card--hero';
        else if (idx === 3) spanClass = 'bento-card--panoramic';

        var dgtBadgeClass = getDgtBadgeClass(car.dgtBadge);

        return `
          <article class="bento-card ${spanClass} ${statusModifier}">
            <a href="${carUrl}" class="bento-media" aria-label="Ver ficha de ${car.name}">
              <img class="bento-img" src="${car.coverImage}" alt="${car.name}" loading="lazy" />
              <div class="bento-media-overlay"></div>
              
              <div class="bento-top-badges">
                <div class="bento-status-pill ${pillModifier}">
                  <span class="pulse-dot"></span>
                  <span>${statusText}</span>
                </div>

                <div style="display: flex; gap: 0.4rem; align-items: center;">
                  <span class="bento-dgt-badge ${dgtBadgeClass}">${car.dgtBadge || 'Etiqueta C'}</span>
                  <span class="bento-dgt-badge" style="background: rgba(0,0,0,0.75); color: var(--gold-light);">${car.year}</span>
                </div>
              </div>
            </a>

            <div class="bento-body">
              <div class="bento-header">
                <span class="bento-eyebrow">${car.brand} · ${car.curatorBadge || 'Selección Oficial'}</span>
                <h3 class="bento-title">
                  <a href="${carUrl}" style="color: inherit; text-decoration: none;">${car.name}</a>
                </h3>

                <!-- Micro-Specs -->
                <div class="bento-specs-row">
                  <span class="bento-spec-tag">📍 ${car.km}</span>
                  <span class="bento-spec-tag">⚙️ ${car.transmission}</span>
                  <span class="bento-spec-tag">⛽ ${car.fuel}</span>
                </div>
              </div>

              <!-- Curator Note Snippet -->
              <div class="bento-curator-snippet">
                <span class="bento-curator-label">Por qué seleccionamos esta unidad:</span>
                «${car.whySelected ? (car.whySelected.length > 140 ? car.whySelected.substring(0, 140) + '…' : car.whySelected) : 'Revisado bajo criterios estrictos de conservación y fiabilidad mecánica.'}»
              </div>

              <div class="bento-footer">
                <div class="bento-price-wrap">
                  <span class="bento-price-label">Precio Todo Incluido</span>
                  <span class="bento-price">${car.price}</span>
                </div>

                <div class="bento-actions-group">
                  <a href="${waInterestUrl}" target="_blank" rel="noopener noreferrer" class="btn-interest" title="Consultar con Marc">
                    <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.53 0 .22 5.31.22 11.84c0 2.09.55 4.13 1.59 5.92L0 24l6.43-1.69a11.8 11.8 0 0 0 5.63 1.43h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.16-1.23-6.13-3.39-8.42zM12 21.75c-1.8 0-3.53-.48-5.04-1.38l-.36-.21-3.82 1 1.02-3.72-.23-.38A9.86 9.86 0 0 1 2.12 11.84C2.12 6.39 6.55 1.95 12 1.95s9.88 4.44 9.88 9.89-4.44 9.91-9.88 9.91z"/>
                    </svg>
                    <span>Me interesa esta unidad</span>
                  </a>

                  <a href="${carUrl}" class="btn btn-glass" style="padding: 0.55rem 0.95rem; font-size: 0.8125rem;">
                    <span>Ver Ficha</span>
                  </a>
                </div>
              </div>

            </div>
          </article>
        `;
      }).join('');
    }

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-filter') || 'all';
        filterAndRender();
      });
    });

    filterAndRender();
  }

  // Helper: Render Delivered Imports (Sober Luxury European Benchmark)
  function renderImportsShowcase(imports) {
    var container = document.getElementById('featured-deliveries-grid') || document.getElementById('imports-grid');
    if (!container || !imports || !imports.length) return;

    // Prioritize iconic high-performance supercar client deliveries
    var sorted = imports.slice().sort(function(a, b) {
      function getScore(item) {
        var txt = (item.title || item.name || '').toLowerCase() + ' ' + (item.description || '').toLowerCase();
        if (txt.indexOf('gt4') >= 0 || txt.indexOf('cayman') >= 0) return 1;
        if (txt.indexOf('750s') >= 0 || txt.indexOf('mclaren') >= 0) return 2;
        if (txt.indexOf('taycan') >= 0) return 3;
        if (txt.indexOf('sq7') >= 0) return 4;
        if (txt.indexOf('m2') >= 0) return 5;
        if (txt.indexOf('cayenne') >= 0) return 6;
        return 20;
      }
      return getScore(a) - getScore(b);
    });

    container.className = 'luxury-import-bento';
    container.innerHTML = sorted.slice(0, 6).map(function(item, idx) {
      var isHero = (idx === 0);
      var spanClass = isHero ? 'luxury-import-card--hero' : ((idx === 3) ? 'luxury-import-card--panoramic' : '');
      var title = item.title || item.name || 'Importación a la Carta';
      var titleLower = title.toLowerCase();

      // Custom Origin & Curated Specs per Vehicle Model
      var origin = 'Centro Oficial Alemania';
      var specs = ['Peritaje OBD In Situ', 'Historial Oficial Sellado', 'Entrega Llave en Mano'];

      if (titleLower.indexOf('gt4') >= 0 || titleLower.indexOf('cayman') >= 0) {
        origin = 'Centro Porsche Oficial';
        specs = ['420 CV Atmosférico', 'Solo 8.000 km Reales', 'Ahorro ~15% vs España', '10 Días Plazo'];
      } else if (titleLower.indexOf('750s') >= 0 || titleLower.indexOf('mclaren') >= 0) {
        origin = 'Concesionario Oficial McLaren';
        specs = ['750 CV V8 Biturbo', 'Configuración Bespoke', 'Peritaje de Micras', 'Matriculado ES'];
      } else if (titleLower.indexOf('taycan') >= 0) {
        origin = 'Porsche Zentrum Alemania';
        specs = ['Pantalla Copiloto & Beige', 'Etiqueta Cero', 'Ahorro ~18% vs España', 'Entrega 20 Días'];
      } else if (titleLower.indexOf('sq7') >= 0) {
        origin = 'Audi Zentrum Alemania';
        specs = ['507 CV V8 TFSI', '7 Plazas · Full Extras', 'Garantía Oficial Plus', 'Entrega Llave en Mano'];
      } else if (titleLower.indexOf('m2') >= 0) {
        origin = 'BMW Niederlassung';
        specs = ['460 CV TwinPower Turbo', 'Paquete M Driver', 'Frenos Competición', 'Reestreno Certificado'];
      } else if (titleLower.indexOf('cayenne') >= 0) {
        origin = 'Centro Porsche Oficial';
        specs = ['E-Hybrid 470 CV', 'Techo Panorámico', 'Historial Sellado', 'Etiqueta Cero'];
      }

      var waMsg = "Hola Marc, he visto en la web de Exotics Collections el caso de importación de " + title + " y me gustaría consultar la posibilidad de importar una unidad similar con presupuesto y opciones.";
      var waUrl = cfg.getWhatsAppUrl(waMsg);

      return `
        <article class="luxury-import-card ${spanClass}">
          <div class="luxury-import-media">
            <img class="luxury-import-img" src="${item.image}" alt="${title}" loading="lazy" />
            <div class="luxury-import-overlay"></div>
            
            <div class="luxury-import-badges">
              <span class="luxury-origin-pill">
                <span>🏛️</span>
                <span>${origin}</span>
              </span>
              <span class="luxury-delivery-pill">
                <span class="pulse-dot"></span>
                <span>Entrega Realizada</span>
              </span>
            </div>
          </div>

          <div class="luxury-import-body">
            <div>
              <span class="luxury-import-eyebrow">Caso Real Auditado In Situ</span>
              <h4 class="luxury-import-title">${title}</h4>
              <p class="luxury-import-desc">
                ${item.description}
              </p>

              <div class="luxury-import-specs">
                ${specs.map(function(s) {
                  return `<span class="luxury-spec-chip">✓ ${s}</span>`;
                }).join('')}
              </div>
            </div>

            <div class="luxury-import-footer">
              <div class="luxury-import-guarantee">
                <span>🛡️ Peritaje Fons & Marc</span>
                <span>·</span>
                <span>Matriculado España</span>
              </div>

              <a href="${waUrl}" target="_blank" rel="noopener" class="luxury-import-btn">
                <span>Consultar Unidad Similar</span>
                <svg style="width: 0.9rem; height: 0.9rem;" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.53 0 .22 5.31.22 11.84c0 2.09.55 4.13 1.59 5.92L0 24l6.43-1.69a11.8 11.8 0 0 0 5.63 1.43h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.16-1.23-6.13-3.39-8.42zM12 21.75c-1.8 0-3.53-.48-5.04-1.38l-.36-.21-3.82 1 1.02-3.72-.23-.38A9.86 9.86 0 0 1 2.12 11.84C2.12 6.39 6.55 1.95 12 1.95s9.88 4.44 9.88 9.89-4.44 9.91-9.88 9.91z"/>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Helper: Render Deliveries in Featured Bento Grid Container
  function renderHybridDeliveriesGrid(imports) {
    var container = document.getElementById('featured-cars-grid');
    if (!container || !imports || !imports.length) return;

    container.className = 'luxury-import-bento';
    container.innerHTML = imports.slice(0, 6).map(function(item, idx) {
      var isHero = (idx === 0);
      var spanClass = isHero ? 'luxury-import-card--hero' : ((idx === 3) ? 'luxury-import-card--panoramic' : '');
      var title = item.title || item.name || 'Importación Europa';
      var waMsg = "Hola Marc, he visto en la web la entrega de " + title + " y me gustaría consultar opciones para un coche similar.";
      var waUrl = cfg.getWhatsAppUrl(waMsg);

      return `
        <article class="luxury-import-card ${spanClass}">
          <div class="luxury-import-media">
            <img class="luxury-import-img" src="${item.image}" alt="${title}" loading="lazy" />
            <div class="luxury-import-overlay"></div>
            
            <div class="luxury-import-badges">
              <span class="luxury-origin-pill">
                <span>🏛️ Red Oficial</span>
              </span>
              <span class="luxury-delivery-pill">
                <span class="pulse-dot"></span>
                <span>Entrega Realizada</span>
              </span>
            </div>
          </div>

          <div class="luxury-import-body">
            <div>
              <span class="luxury-import-eyebrow">Caso Real · Red Oficial</span>
              <h4 class="luxury-import-title">${title}</h4>
              <p class="luxury-import-desc">
                ${item.description}
              </p>
            </div>

            <div class="luxury-import-footer">
              <div class="luxury-import-guarantee">
                <span>🛡️ Peritaje In Situ</span>
                <span>·</span>
                <span>Llave en Mano</span>
              </div>

              <a href="${waUrl}" target="_blank" rel="noopener" class="luxury-import-btn">
                <span>Consultar Similar</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Helper: Interactive Import Funnel Form with «Solicitar búsqueda»
  function initImportForm() {
    var form = document.getElementById('import-funnel-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var brandModel = document.getElementById('import-brand-model').value.trim();
      var budget = document.getElementById('import-budget').value.trim();
      var year = document.getElementById('import-year').value;
      var fuel = document.getElementById('import-fuel').value;
      var extras = document.getElementById('import-extras') ? document.getElementById('import-extras').value.trim() : '';

      var waUrl = cfg.getImportWhatsAppUrl({
        brandModel: brandModel || 'Superdeportivo / Deportivo',
        budget: budget || 'A valorar con Marc',
        year: year || 'Indiferente',
        fuel: fuel || 'Indiferente',
        extras: extras || 'Configuración a convenir'
      });

      window.open(waUrl, '_blank');
    });
  }

});
