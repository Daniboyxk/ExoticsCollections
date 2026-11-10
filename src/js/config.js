/**
 * Exotics Collections — Global Configuration & Formatting Utilities
 * Founder & Curator: Marc Ibáñez (@exoticsbcn)
 * Design Language: Obsidian & Champagne × Mechatronik (90/10 Precision)
 */

export const EXOTICS_CONFIG = {
  brandName: 'Exotics Collections',
  founder: 'Marc Ibáñez',
  phoneDisplay: '+34 697 46 41 04',
  whatsappNumber: '34697464104',
  email: 'info@exoticscollections.com',
  location: 'Barcelona, España',
  siteUrl: 'https://exoticscollections.com',

  slogans: {
    tagline: 'Exclusividad, diseño y fiabilidad',
    stock: 'No buscamos cualquier coche. Buscamos la unidad perfecta',
    familyConfidence: 'Coches que seleccionaríamos para nuestros familiares',
    import: 'Encuentra tu nuevo coche en cualquier parte de Europa',
    selectionOverMargin: 'No priorizamos el margen de beneficio, sino el estado del vehículo'
  },

  sanity: {
    projectId: 'bjo8yvrn',
    dataset: 'production',
    apiVersion: 'v2024-01-01',
    cdnBase: 'https://cdn.sanity.io'
  },

  socials: {
    youtube: 'https://www.youtube.com/@exoticsbcn',
    instagram: 'https://www.instagram.com/exoticscollections',
    tiktok: 'https://www.tiktok.com/@exoticscollections'
  },

  getWhatsAppUrl(message) {
    const text = encodeURIComponent(
      message ||
        'Hola Marc, he visto la web de Exotics Collections y me gustaría recibir asesoramiento personalizado.'
    );
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  },

  getCarWhatsAppUrl(carName, price, url, actionType = 'interest') {
    const cleanName = carName || 'vehículo en catálogo';
    const cleanPrice = price ? ` (${price})` : '';
    const linkLine = url ? `Ficha: ${url}\n\n` : '\n';

    const text =
      actionType === 'reserve'
        ? `Hola Marc, quiero RESERVAR formalmente la unidad ${cleanName}${cleanPrice} de Exotics Collections.\n${linkLine}¿Cuáles son los pasos para formalizar la reserva y la documentación?`
        : `Hola Marc, me interesa esta unidad: ${cleanName}${cleanPrice} de Exotics Collections.\n${linkLine}¿Sigue disponible? Me gustaría recibir más detalles e historial.`;

    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(text)}`;
  },

  getImportWhatsAppUrl(data = {}) {
    const lines = [
      'SOLICITUD DE BÚSQUEDA A LA CARTA — EXOTICS COLLECTIONS',
      `Hola Marc${data.name ? `, soy ${data.name}` : ''}. Busco importar una unidad verificada desde Europa:`,
      '',
      `• Marca / Modelo: ${data.brandModel || 'A consultar'}`,
      `• Año mínimo: ${data.year || 'Indiferente'}`,
      `• Presupuesto orientativo: ${data.budget || 'A consultar'}`,
      `• Régimen / Preferencias: ${data.extras || 'Configuración a convenir'}`,
      '',
      '¿Podemos revisar qué unidades oficiales hay disponibles y su desglose llave en mano?'
    ];
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
};

/**
 * Escapes untrusted strings before inserting into HTML templates (XSS protection).
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips diacritics/accents and lowercases text for accent-insensitive search & filtering.
 */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normalizes kilometer strings (e.g. "67.668" or "38.200km" -> "67.668 km").
 */
export function formatKm(rawKm) {
  const digits = String(rawKm ?? '').replace(/[^\d]/g, '');
  if (!digits) return '—';
  const num = parseInt(digits, 10);
  if (Number.isNaN(num)) return '—';
  return `${num.toLocaleString('es-ES')} km`;
}

/**
 * Formats price strings consistently (e.g. "35.990€" -> "35.990 €").
 */
export function formatPrice(rawPrice) {
  const str = String(rawPrice ?? '').trim();
  if (!str) return 'Consultar';
  const digits = str.replace(/[^\d]/g, '');
  if (!digits) return str;
  const num = parseInt(digits, 10);
  if (Number.isNaN(num) || num <= 0) return 'Consultar';
  return `${num.toLocaleString('es-ES')} €`;
}

export function parseNumeric(raw) {
  const digits = String(raw ?? '').replace(/[^\d]/g, '');
  return parseInt(digits, 10) || 0;
}

if (typeof window !== 'undefined') {
  window.EXOTICS_CONFIG = EXOTICS_CONFIG;
}

