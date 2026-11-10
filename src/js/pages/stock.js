import { EXOTICS_CONFIG, escapeHtml, normalizeText } from '../config.js';
import { fetchAllData } from '../sanity-client.js';
import { observeReveals } from '../ui.js';

async function initStockPage() {
  const grid = document.getElementById('main-bento-grid');
  if (!grid) return;

  const tabStock = document.getElementById('tab-stock');
  const tabDeliveries = document.getElementById('tab-deliveries');
  const countStockEl = document.getElementById('count-stock');
  const countDeliveriesEl = document.getElementById('count-deliveries');
  const stockToolbar = document.getElementById('stock-filter-toolbar');

  const brandSelect = document.getElementById('stock-brand-select');
  const searchInput = document.getElementById('stock-search-input');
  const priceSelect = document.getElementById('stock-price-select');
  const yearSelect = document.getElementById('stock-year-select');
  const kmSelect = document.getElementById('stock-km-select');
  const fuelSelect = document.getElementById('stock-fuel-select');
  const gearSelect = document.getElementById('stock-gear-select');
  const badgeSelect = document.getElementById('stock-badge-select');
  const availSelect = document.getElementById('stock-avail-select');
  const sortSelect = document.getElementById('stock-sort-select');

  const btnMoreFilters = document.getElementById('btn-more-filters');
  const moreFiltersPopover = document.getElementById('more-filters-popover');
  const moreFiltersBadge = document.getElementById('more-filters-badge');
  const btnMoreReset = document.getElementById('btn-more-reset');
  const btnMoreApply = document.getElementById('btn-more-apply');
  const btnFilterReset = document.getElementById('btn-filter-reset');
  const stockCountLabel = document.getElementById('stock-count-label');

  const pillBrand = document.getElementById('pill-brand');
  const pillPrice = document.getElementById('pill-price');
  const pillYear = document.getElementById('pill-year');
  const pillKm = document.getElementById('pill-km');
  const pillSearch = document.getElementById('pill-search');
  const pillSort = document.getElementById('pill-sort');

  const brandLabel = document.getElementById('brand-pill-label');
  const priceLabel = document.getElementById('price-pill-label');
  const yearLabel = document.getElementById('year-pill-label');
  const kmLabel = document.getElementById('km-pill-label');
  const sortLabel = document.getElementById('sort-pill-label');

  const urlTab = new URLSearchParams(window.location.search).get('tab');
  let currentTab = urlTab === 'deliveries' ? 'deliveries' : 'stock';

  const data = await fetchAllData();
  const allCars = data.cars || [];
  const allImports = data.imports || [];

  if (countStockEl) countStockEl.textContent = String(allCars.length);
  if (countDeliveriesEl) countDeliveriesEl.textContent = String(allImports.length);

  // Populate Brand Dropdown
  const uniqueBrands = Array.from(new Set(allCars.map((c) => c.brand))).filter(Boolean).sort();
  uniqueBrands.forEach((brand) => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = brand;
    brandSelect?.appendChild(opt);
  });

  // Sync Pill UI (Labels, active classes, badge counters)
  function syncPillUI() {
    // Brand Pill
    if (brandSelect && brandLabel && pillBrand) {
      if (brandSelect.value === 'all') {
        brandLabel.textContent = 'Marca';
        pillBrand.classList.remove('is-active');
      } else {
        brandLabel.textContent = brandSelect.value;
        pillBrand.classList.add('is-active');
      }
    }

    // Price Pill
    if (priceSelect && priceLabel && pillPrice) {
      if (priceSelect.value === 'all') {
        priceLabel.textContent = 'Precio';
        pillPrice.classList.remove('is-active');
      } else {
        priceLabel.textContent = priceSelect.options[priceSelect.selectedIndex].text;
        pillPrice.classList.add('is-active');
      }
    }

    // Year Pill
    if (yearSelect && yearLabel && pillYear) {
      if (yearSelect.value === 'all') {
        yearLabel.textContent = 'Año';
        pillYear.classList.remove('is-active');
      } else {
        yearLabel.textContent = `Desde ${yearSelect.value}`;
        pillYear.classList.add('is-active');
      }
    }

    // Km Pill
    if (kmSelect && kmLabel && pillKm) {
      if (kmSelect.value === 'all') {
        kmLabel.textContent = 'Kilómetros';
        pillKm.classList.remove('is-active');
      } else {
        kmLabel.textContent = kmSelect.options[kmSelect.selectedIndex].text.replace('Hasta ', '< ');
        pillKm.classList.add('is-active');
      }
    }

    // Search / Model Pill
    if (searchInput && pillSearch) {
      pillSearch.classList.toggle('is-active', Boolean(searchInput.value.trim()));
    }

    // More Filters Popover Badge
    let moreCount = 0;
    if (fuelSelect && fuelSelect.value !== 'all') moreCount++;
    if (gearSelect && gearSelect.value !== 'all') moreCount++;
    if (badgeSelect && badgeSelect.value !== 'all') moreCount++;
    if (availSelect && availSelect.value !== 'all') moreCount++;

    if (moreFiltersBadge && btnMoreFilters) {
      if (moreCount > 0) {
        moreFiltersBadge.textContent = String(moreCount);
        moreFiltersBadge.style.display = 'inline-flex';
        btnMoreFilters.classList.add('is-active');
      } else {
        moreFiltersBadge.style.display = 'none';
        btnMoreFilters.classList.remove('is-active');
      }
    }

    // Sort Pill
    if (sortSelect && sortLabel && pillSort) {
      const sortText = sortSelect.options[sortSelect.selectedIndex].text.replace('Ordenar por: ', '');
      sortLabel.textContent = sortText;
      pillSort.classList.toggle('is-active', sortSelect.value !== 'newest');
    }

    // Reset button visibility
    const totalFiltersActive =
      (brandSelect && brandSelect.value !== 'all' ? 1 : 0) +
      (priceSelect && priceSelect.value !== 'all' ? 1 : 0) +
      (yearSelect && yearSelect.value !== 'all' ? 1 : 0) +
      (kmSelect && kmSelect.value !== 'all' ? 1 : 0) +
      (searchInput && searchInput.value.trim() ? 1 : 0) +
      moreCount;

    if (btnFilterReset) {
      btnFilterReset.style.display = totalFiltersActive > 0 ? 'inline-flex' : 'none';
    }
  }

  function renderStockBento() {
    syncPillUI();

    const q = normalizeText(searchInput ? searchInput.value : '');
    const brand = brandSelect ? brandSelect.value : 'all';
    const priceFilter = priceSelect ? priceSelect.value : 'all';
    const yearFilter = yearSelect ? yearSelect.value : 'all';
    const kmFilter = kmSelect ? kmSelect.value : 'all';
    const badge = badgeSelect ? badgeSelect.value : 'all';
    const fuel = normalizeText(fuelSelect ? fuelSelect.value : 'all');
    const gear = normalizeText(gearSelect ? gearSelect.value : 'all');
    const avail = availSelect ? availSelect.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'newest';

    const filtered = allCars.filter((car) => {
      // 1. Search Query (Model/Name/Engine/Description)
      const searchable = normalizeText(`${car.name} ${car.brandModel} ${car.engine} ${car.description}`);
      const matchSearch = !q || searchable.includes(q);

      // 2. Brand
      const matchBrand = brand === 'all' || car.brand === brand;

      // 3. Price
      let matchPrice = true;
      if (priceFilter === 'under-10k') matchPrice = car.numericPrice <= 10000;
      else if (priceFilter === '10k-20k') matchPrice = car.numericPrice > 10000 && car.numericPrice <= 20000;
      else if (priceFilter === '20k-40k') matchPrice = car.numericPrice > 20000 && car.numericPrice <= 40000;
      else if (priceFilter === 'over-40k') matchPrice = car.numericPrice > 40000;

      // 4. Year
      let matchYear = true;
      if (yearFilter !== 'all') {
        const minYear = parseInt(yearFilter, 10);
        if (!isNaN(minYear)) matchYear = car.numericYear >= minYear;
      }

      // 5. Kilómetros
      let matchKm = true;
      if (kmFilter === 'under-50k') matchKm = car.numericKm <= 50000;
      else if (kmFilter === 'under-80k') matchKm = car.numericKm <= 80000;
      else if (kmFilter === 'under-100k') matchKm = car.numericKm <= 100000;
      else if (kmFilter === 'under-150k') matchKm = car.numericKm <= 150000;

      // 6. DGT Badge
      const matchBadge = badge === 'all' || car.dgtBadge === badge;

      // 7. Fuel
      const matchFuel = fuel === 'all' || normalizeText(car.fuel).includes(fuel);

      // 8. Transmission
      const matchGear = gear === 'all' || normalizeText(car.transmission).includes(gear);

      // 9. Availability
      const matchAvail = avail === 'all' || car.availability === avail;

      return (
        matchSearch &&
        matchBrand &&
        matchPrice &&
        matchYear &&
        matchKm &&
        matchBadge &&
        matchFuel &&
        matchGear &&
        matchAvail
      );
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'price-asc') return a.numericPrice - b.numericPrice;
      if (sort === 'price-desc') return b.numericPrice - a.numericPrice;
      if (sort === 'km-asc') return a.numericKm - b.numericKm;
      if (sort === 'year-desc') return b.numericYear - a.numericYear;
      return 0;
    });

    // Update Counter Label
    if (stockCountLabel) {
      stockCountLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'unidad' : 'unidades'}`;
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="catalog-empty" style="grid-column: 1 / -1;">
          <span class="stock-dealer-card__badge stock-dealer-badge--reserved">BÚSQUEDA SIN COINCIDENCIAS</span>
          <h3 class="catalog-empty__title" style="margin-top: 1rem;">¿No encuentras el modelo exacto en stock?</h3>
          <p class="catalog-empty__desc">
            «No nos conformamos con cualquier coche». Dinos la configuración que buscas y Marc rastreará la red oficial europea para traértelo auditado in situ.
          </p>
          <div style="display: inline-flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 1.25rem;">
            <a href="importacion.html#solicitar-busqueda" class="btn-primary">Solicitar Búsqueda a la Carta ↗</a>
            <button type="button" class="btn-secondary" id="btn-empty-clear">Limpiar Filtros</button>
          </div>
        </div>
      `;
      document.getElementById('btn-empty-clear')?.addEventListener('click', resetAllFilters);
      return;
    }

    // Render 3-column Luxury Dealer Cards (Screenshot Benchmark + Year, Km, Specs)
    grid.innerHTML = filtered
      .map((car, idx) => {
        const carUrl = `car.html?id=${encodeURIComponent(car.slug || car.id)}`;
        const isFeaturedFirst = idx === 0 ? 'stock-dealer-card--featured' : '';

        // Status badge
        let badgeHtml = '';
        if (car.availability === 'reservado') {
          badgeHtml = `
            <div class="stock-dealer-card__badge-wrap">
              <span class="stock-dealer-card__badge stock-dealer-badge--reserved">RESERVADO</span>
            </div>
          `;
        } else if (car.availability === 'vendido') {
          badgeHtml = `
            <div class="stock-dealer-card__badge-wrap">
              <span class="stock-dealer-card__badge stock-dealer-badge--delivered">ENTREGADO</span>
            </div>
          `;
        }

        // Specs Line: Year · Km · Transmission · Fuel · DGT (Clean Mixed-Case)
        const specsItems = [car.year, car.km, car.transmission, car.fuel, car.dgtBadge].filter(Boolean);
        const specsHtml = specsItems
          .map((item, sIdx) => {
            let str = String(item).trim().replace(/\bKM\b/i, 'km');
            if (/^automático/i.test(str)) str = 'Automático DCT';
            else if (/^manual/i.test(str)) str = 'Manual';
            else if (/^gasolina/i.test(str)) str = 'Gasolina';
            else if (/^diésel|^diesel/i.test(str)) str = 'Diésel';
            else if (/^etiqueta/i.test(str)) str = str.replace(/etiqueta\s*([a-z0-9]+)/i, (_, b) => `Etiqueta ${b.toUpperCase()}`);
            const dot = sIdx < specsItems.length - 1 ? `<span class="spec-dot" aria-hidden="true">·</span>` : '';
            return `<span>${escapeHtml(str)}</span>${dot}`;
          })
          .join('');

        // Simplify catalog title for mobile / card ergonomics (Full title preserved on car.html)
        let displayTitle = car.name || '';
        if (/Hyundai i30 N/i.test(displayTitle)) {
          displayTitle = 'Hyundai i30 N Fastback';
        }

        return `
          <a
            href="${escapeHtml(carUrl)}"
            class="stock-dealer-card ${isFeaturedFirst}"
            data-reveal
            aria-label="Ver ficha de ${escapeHtml(car.name)} por ${escapeHtml(car.price || 'Consultar')}"
          >
            <div class="stock-dealer-card__media">
              <img
                class="stock-dealer-card__img"
                src="${escapeHtml(car.coverImage)}"
                alt="${escapeHtml(car.name)}"
                loading="${idx < 3 ? 'eager' : 'lazy'}"
              />
              ${badgeHtml}
            </div>

            <div class="stock-dealer-card__body">
              <div class="stock-dealer-card__header">
                <h3 class="stock-dealer-card__title">${escapeHtml(displayTitle)}</h3>
                <div class="stock-dealer-card__price-wrap">
                  <span class="stock-dealer-card__price">${escapeHtml(car.price || 'Consultar')}</span>
                  <span class="stock-dealer-card__arrow" aria-hidden="true">→</span>
                </div>
              </div>

              <div class="stock-dealer-card__specs">
                ${specsHtml}
              </div>
            </div>
          </a>
        `;
      })
      .join('');

    observeReveals(grid);
  }

  function renderDeliveriesBento() {
    if (stockCountLabel) {
      stockCountLabel.textContent = `${allImports.length} entregas`;
    }

    if (!allImports.length) {
      grid.innerHTML = `<div class="catalog-empty" style="grid-column: 1 / -1;"><p class="catalog-empty__desc">Cargando entregas recientes...</p></div>`;
      return;
    }

    grid.innerHTML = allImports
      .map((item, idx) => {
        const waDeliveryUrl = EXOTICS_CONFIG.getWhatsAppUrl(
          `Hola Marc, quiero información para importar una unidad similar a: ${item.title}`
        );

        return `
          <a
            href="${escapeHtml(waDeliveryUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="stock-dealer-card"
            data-reveal
            aria-label="Consultar entrega de ${escapeHtml(item.title)}"
          >
            <div class="stock-dealer-card__media">
              <img
                class="stock-dealer-card__img"
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.title)}"
                loading="${idx < 3 ? 'eager' : 'lazy'}"
              />
              <div class="stock-dealer-card__badge-wrap">
                <span class="stock-dealer-card__badge stock-dealer-badge--delivered">ENTREGA REALIZADA</span>
              </div>
            </div>

            <div class="stock-dealer-card__body">
              <div class="stock-dealer-card__header">
                <h3 class="stock-dealer-card__title">${escapeHtml(item.title)}</h3>
                <div class="stock-dealer-card__price-wrap">
                  <span class="stock-dealer-card__price" style="font-size: 0.95rem; color: var(--champagne);">A LA CARTA</span>
                  <span class="stock-dealer-card__arrow" aria-hidden="true">→</span>
                </div>
              </div>

              <div class="stock-dealer-card__specs">
                <span>Alemania</span>
                <span class="spec-dot" aria-hidden="true">·</span>
                <span>Auditoría In Situ</span>
                <span class="spec-dot" aria-hidden="true">·</span>
                <span>Gestión Llave en Mano</span>
              </div>
            </div>
          </a>
        `;
      })
      .join('');

    observeReveals(grid);
  }

  function setTab(nextTab) {
    currentTab = nextTab;
    const isStock = currentTab === 'stock';

    tabStock?.classList.toggle('active', isStock);
    tabStock?.setAttribute('aria-selected', isStock ? 'true' : 'false');
    tabDeliveries?.classList.toggle('active', !isStock);
    tabDeliveries?.setAttribute('aria-selected', !isStock ? 'true' : 'false');

    if (stockToolbar) {
      stockToolbar.style.display = isStock ? 'flex' : 'none';
    }

    if (isStock) {
      renderStockBento();
    } else {
      renderDeliveriesBento();
    }
  }

  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (brandSelect) brandSelect.value = 'all';
    if (priceSelect) priceSelect.value = 'all';
    if (yearSelect) yearSelect.value = 'all';
    if (kmSelect) kmSelect.value = 'all';
    if (fuelSelect) fuelSelect.value = 'all';
    if (gearSelect) gearSelect.value = 'all';
    if (badgeSelect) badgeSelect.value = 'all';
    if (availSelect) availSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    syncPillUI();
    renderStockBento();
  }

  // Event Listeners
  tabStock?.addEventListener('click', () => {
    if (currentTab !== 'stock') setTab('stock');
  });
  tabDeliveries?.addEventListener('click', () => {
    if (currentTab !== 'deliveries') setTab('deliveries');
  });

  btnFilterReset?.addEventListener('click', resetAllFilters);

  // Search input live filter
  searchInput?.addEventListener('input', renderStockBento);

  // Native dropdown changes
  [brandSelect, priceSelect, yearSelect, kmSelect, sortSelect].forEach((sel) => {
    sel?.addEventListener('change', renderStockBento);
  });

  // More Filters Popover Controls
  btnMoreFilters?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = moreFiltersPopover?.classList.contains('is-open');
    moreFiltersPopover?.classList.toggle('is-open', !isOpen);
    btnMoreFilters.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    moreFiltersPopover?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });

  document.addEventListener('click', (e) => {
    if (
      moreFiltersPopover &&
      !moreFiltersPopover.contains(e.target) &&
      btnMoreFilters &&
      !btnMoreFilters.contains(e.target)
    ) {
      moreFiltersPopover.classList.remove('is-open');
      btnMoreFilters.setAttribute('aria-expanded', 'false');
      moreFiltersPopover.setAttribute('aria-hidden', 'true');
    }
  });

  btnMoreApply?.addEventListener('click', () => {
    moreFiltersPopover?.classList.remove('is-open');
    btnMoreFilters?.setAttribute('aria-expanded', 'false');
    moreFiltersPopover?.setAttribute('aria-hidden', 'true');
    renderStockBento();
  });

  btnMoreReset?.addEventListener('click', () => {
    if (fuelSelect) fuelSelect.value = 'all';
    if (gearSelect) gearSelect.value = 'all';
    if (badgeSelect) badgeSelect.value = 'all';
    if (availSelect) availSelect.value = 'all';
    renderStockBento();
  });

  [fuelSelect, gearSelect, badgeSelect, availSelect].forEach((sel) => {
    sel?.addEventListener('change', renderStockBento);
  });

  setTab(currentTab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStockPage);
} else {
  initStockPage();
}
