import { EXOTICS_CONFIG } from '../config.js';
import '../ui.js';

function formatEur(n) {
  return `${Math.round(n).toLocaleString('es-ES')} €`;
}

function initImportacionPage() {
  // 1. Interactive Turnkey Import Cost Estimator
  const priceInput = document.getElementById('calc-german-price');
  const priceLabel = document.getElementById('calc-german-price-val');
  const co2Select = document.getElementById('calc-co2-rate');
  const outTransport = document.getElementById('calc-out-transport');
  const outItv = document.getElementById('calc-out-itv');
  const outIedmt = document.getElementById('calc-out-iedmt');
  const outFee = document.getElementById('calc-out-fee');
  const outTotal = document.getElementById('calc-out-total');
  const applyBtn = document.getElementById('calc-apply-to-form');

  const budgetInput = document.getElementById('req-budget');

  function updateCalculator() {
    if (!priceInput) return;
    const basePrice = parseInt(priceInput.value, 10) || 65000;
    const co2Rate = parseFloat(co2Select?.value || '0.0975');

    const transport = basePrice >= 110000 ? 1850 : 1450; // Enclosed vs standard insured carrier
    const itvHomologacion = 690;
    // Approximate Spanish IEDMT based on deprecated/average BOE taxable base (~62% of market value)
    const iedmtApprox = Math.round(basePrice * 0.62 * co2Rate);
    const conciergeFee = 1950;
    const totalTurnkey = basePrice + transport + itvHomologacion + iedmtApprox + conciergeFee;

    if (priceLabel) priceLabel.textContent = formatEur(basePrice);
    if (outTransport) outTransport.textContent = formatEur(transport);
    if (outItv) outItv.textContent = formatEur(itvHomologacion);
    if (outIedmt) outIedmt.textContent = formatEur(iedmtApprox);
    if (outFee) outFee.textContent = formatEur(conciergeFee);
    if (outTotal) outTotal.textContent = formatEur(totalTurnkey);

    return totalTurnkey;
  }

  if (priceInput) {
    priceInput.addEventListener('input', updateCalculator);
    co2Select?.addEventListener('change', updateCalculator);
    updateCalculator();

    applyBtn?.addEventListener('click', () => {
      const total = updateCalculator();
      if (budgetInput && total) {
        const valText = `${formatEur(total)} llave en mano (calculado)`;
        if (budgetInput.tagName === 'SELECT') {
          let opt = Array.from(budgetInput.options).find(o => o.value === valText);
          if (!opt) {
            opt = new Option(valText, valText);
            budgetInput.add(opt);
          }
          budgetInput.value = valText;
        } else {
          budgetInput.value = valText;
        }
        budgetInput.focus();
      }
    });
  }

  // 2. Concierge Import Request Form -> Brand Chips + Official WhatsApp Helper + Visual Confirmation
  const form = document.getElementById('import-request-form');
  const feedback = document.getElementById('import-form-feedback');
  const feedbackLink = document.getElementById('import-feedback-link');
  const carInput = document.getElementById('req-car');
  const brandChips = document.querySelectorAll('.brand-chip');

  if (brandChips.length > 0 && carInput) {
    brandChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const brand = chip.getAttribute('data-brand') || chip.textContent.trim();
        brandChips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        // Autofill or prefix into car model field
        if (!carInput.value || carInput.value === 'Porsche' || carInput.value === 'BMW M' || carInput.value === 'Mercedes-AMG' || carInput.value === 'Audi Sport' || carInput.value === 'McLaren' || carInput.value === 'Range Rover') {
          carInput.value = `${brand} `;
        } else if (!carInput.value.toLowerCase().includes(brand.toLowerCase())) {
          carInput.value = `${brand} ${carInput.value}`.trim();
        }
        carInput.focus();
      });
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const brandModel = carInput?.value.trim() || '';
      const year = document.getElementById('req-year')?.value.trim() || 'Indiferente';
      const km = document.getElementById('req-km')?.value.trim() || 'Indiferente';
      const budget = document.getElementById('req-budget')?.value.trim() || 'A consultar';
      const name = document.getElementById('req-name')?.value.trim() || '';
      const phone = document.getElementById('req-phone')?.value.trim() || '';
      const extras = document.getElementById('req-details')?.value.trim() || 'Sin especificar';

      const yearFormatted = (km && km !== 'Indiferente') ? `${year} (${km})` : year;
      const enrichedExtras = phone ? `${extras} (Teléfono de contacto: ${phone})` : extras;

      const waUrl = EXOTICS_CONFIG.getImportWhatsAppUrl({
        name,
        brandModel,
        year: yearFormatted,
        budget,
        extras: enrichedExtras
      });

      if (feedback && feedbackLink) {
        feedbackLink.setAttribute('href', waUrl);
        feedback.classList.add('is-visible');
      }

      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImportacionPage);
} else {
  initImportacionPage();
}

