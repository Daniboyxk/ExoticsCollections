/**
 * Exotics Collections — Sanity Live-First Client & Mechatronik Data Normalizer
 * Strategy:
 *   1. Live Sanity API CDN (apicdn.sanity.io) with fast timeout -> instant Studio updates
 *   2. Static /data/sanity_cache.json fallback -> zero downtime if offline/blocked
 *   3. Built-in emergency fallback dataset
 */

import { EXOTICS_CONFIG, formatKm, formatPrice, normalizeText, parseNumeric } from './config.js';

const { projectId, dataset, apiVersion } = EXOTICS_CONFIG.sanity;
const SANITY_CDN_QUERY_URL = `https://${projectId}.apicdn.sanity.io/${apiVersion}/data/query/${dataset}`;

const GROQ_ALL = `{
  "cars": *[_type == "car"] | order(_createdAt desc){
    _id,
    id,
    "slug": coalesce(id, slug.current),
    name,
    brand_model,
    price,
    availability,
    km,
    year,
    description,
    fuel,
    engine,
    seats,
    transmission,
    exterior_color,
    interior_color,
    regime,
    type,
    videoUrl,
    youtubeUrl,
    "images": images[].asset._ref
  },
  "imports": *[_type in ["importacion", "contactGalleryItem"]] | order(_createdAt desc){
    _id,
    _type,
    name,
    title,
    shortDescription,
    "imageRef": coalesce(image.asset._ref, images[0].asset._ref)
  },
  "youtube": *[_type == "youtubeVideo"] | order(order asc, _createdAt desc){
    _id,
    youtubeUrl,
    order
  }
}`;

const VIDEO_METADATA = {
  '7T5Bi2N6lM8': {
    title: 'No compres un Porsche en España SIN VER este vídeo',
    tag: 'Auditoría Porsche Zentrum',
    duration: '18:42',
    highlight: 'Inspección in situ en Alemania, medición de micras panel a panel y ahorro real frente a mercado nacional.'
  },
  '57lDEV87lY4': {
    title: 'Comprar un Porsche Taycan en Alemania y cruzar Europa ¿Error o acierto?',
    tag: 'Ruta 1.800 km · Taycan 4S',
    duration: '22:15',
    highlight: 'Cruzando Europa hacia Barcelona con un Taycan 4S Cross Turismo verificado en Centro Oficial Porsche.'
  },
  'lqyuV96Q5M0': {
    title: 'Así es mi día a día IMPORTANDO coches de LUJO',
    tag: 'Ingeniería & Logística',
    duration: '15:30',
    highlight: 'Diagnosis electrónica OBD, verificación bajo chasis con Fons, transporte cerrado y entrega llave en mano.'
  }
};

const CURATOR_SELECTION_NOTES = {
  'bba61ca8-57e3-4fa8-93d5-6a0f9e83d1f1': {
    whySelected:
      'Buscábamos la configuración definitiva de i30 N: restyling de 280 CV con transmisión DCT de 8 relaciones, techo panorámico Sky y carrocería Fastback en Shadow Grey. Unidad de único propietario con mantenimiento íntegro en red oficial Hyundai y diagnosis electrónica oficial sin averías.',
    badge: 'Unidad Performance',
    highlightExtra: 'DCT 8 Vel. · 280 CV · Paquete Sky · Diferencial e-LSD',
    priority: 1,
    videoUrl: 'https://www.youtube.com/watch?v=lqyuV96Q5M0'
  },
  '7e1dc26f-9aca-4a2d-b52b-ba7ea8b935cd': {
    whySelected:
      'Los 4x4 puros con reductora mecánica y bajo kilometraje son cada vez más difíciles de hallar sin corrosión. Seleccionamos este Grand Vitara nacional por sus 80.000 km reales demostrables, bajos libres de óxido e ITV vigente hasta 2027.',
    badge: '4x4 con Reductora',
    highlightExtra: '80.000 km Certificados · Reductora 4x4 · Nacional',
    priority: 2
  },
  '127c1c61-31e4-4e33-b3ab-a5ed8e0265ab': {
    whySelected:
      'Unidad excepcional por trazabilidad: único propietario desde estreno, libro sellado, distribución recién sustituida y un kilometraje certificado extraordinariamente bajo para su generación con Distintivo C.',
    badge: 'Único Propietario',
    highlightExtra: 'Acabado GT · Libro Sellado · Distintivo C',
    priority: 3
  },
  'cb08c7c7-3c79-4507-bee4-e366ffb7a39e': {
    whySelected:
      'Seleccionado tras completar una puesta a punto preventiva integral: distribución reciente, compresor de climatización nuevo, discos y pastillas delanteros a estrenar y carrocería descontaminada y pulida.',
    badge: 'Revisión Integral',
    highlightExtra: 'Distribución Hecha · Frenos Nuevos · Keyless & GPS',
    priority: 4
  },
  '3d904610-daee-42f3-8b5f-31358f42c058': {
    whySelected:
      'Compacto gasolina con tan solo 67.668 km reales y mantenimiento recién ejecutado (aceite, filtros, bujías, discos y pastillas nuevos). Mecánica atmosférica sencilla con etiqueta medioambiental C.',
    badge: 'Bajo Kilometraje',
    highlightExtra: '67.668 km · Frenos y Revisión Nuevos · Etiqueta C',
    priority: 5
  },
  '3eb8d661-a990-4782-9869-319dde3d1e19': {
    whySelected:
      'Edición United de 5 puertas equipada con Apple CarPlay, Android Auto y cámara trasera. Mecánica 1.4 gasolina contrastada, revisada y lista para uso diario con etiqueta C.',
    badge: 'Selección Urbana',
    highlightExtra: '5 Puertas · CarPlay & Cámara · Etiqueta C',
    priority: 6
  },
  'bd064873-ec4e-448d-a17c-bc436456b6dd': {
    whySelected:
      'Bloque 1.6 TDCi reconocido por su longevidad y consumo mínimo. Unidad recién revisada y entregada con ITV en vigor hasta 2027 y garantía de 12 meses.',
    badge: 'ITV hasta 2027',
    highlightExtra: '1.6 TDCi 90 CV · 5 Puertas · Revisión Reciente',
    priority: 7
  },
  '7ee72258-ab61-4b6b-8852-e8492483b092': {
    whySelected:
      'Único propietario con 93.000 km reales y preparación mecánica recién completada: kit de distribución con bomba de agua, cuatro neumáticos nuevos y frenos nuevos.',
    badge: 'Distribución Nueva',
    highlightExtra: '1 Propietario · 4 Neumáticos y Frenos Nuevos',
    priority: 8
  }
};

export function buildImageUrl(ref, options = {}) {
  if (!ref) return '/assets/hero_poster.jpg';
  if (typeof ref !== 'string') {
    ref = ref?.asset?._ref || ref?.ref || '';
  }
  if (!ref) return '/assets/hero_poster.jpg';
  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) return ref;
  if (ref.startsWith('assets/')) return `/${ref}`;

  const match = ref.match(/^image-([a-f0-9]+)-([0-9]+x[0-9]+)-([a-z0-9]+)$/i);
  if (!match) return '/assets/hero_poster.jpg';

  const [, assetId, dims, format] = match;
  const params = new URLSearchParams();
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  if (options.quality) params.set('q', String(options.quality));
  if (options.fit) params.set('fit', options.fit);
  if (options.auto !== false) params.set('auto', 'format');

  const qs = params.toString();
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dims}.${format}${qs ? `?${qs}` : ''}`;
}

export function extractYouTubeId(url) {
  if (!url) return '';
  const match = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : '';
}

function extractBrand(car) {
  const raw = `${car.brand_model || ''} ${car.name || ''}`.trim();
  if (/volkswagen|\bvw\b/i.test(raw)) return 'Volkswagen';
  if (/mercedes|amg/i.test(raw)) return 'Mercedes-AMG';
  if (/audi/i.test(raw)) return 'Audi';
  if (/bmw/i.test(raw)) return 'BMW';
  if (/porsche/i.test(raw)) return 'Porsche';
  if (/mclaren/i.test(raw)) return 'McLaren';
  if (/hyundai/i.test(raw)) return 'Hyundai';
  if (/renault/i.test(raw)) return 'Renault';
  if (/suzuki/i.test(raw)) return 'Suzuki';
  if (/opel/i.test(raw)) return 'Opel';
  if (/ford/i.test(raw)) return 'Ford';
  if (/ferrari/i.test(raw)) return 'Ferrari';
  if (/lamborghini/i.test(raw)) return 'Lamborghini';
  return raw.split(/[\s-]+/)[0] || 'Exotics';
}

function normalizeFuel(rawFuel) {
  const norm = normalizeText(rawFuel).replace(/,?\s*etiqueta\s*[a-z0-9]+/gi, '').trim();
  if (!norm) return 'Gasolina';
  if (norm.includes('gasolin') || norm.includes('petrol') || norm.includes('benzin')) return 'Gasolina';
  if (norm.includes('diesel') || norm.includes('tdci') || norm.includes('dci') || norm.includes('tdi')) return 'Diésel';
  if (norm.includes('hibrid') || norm.includes('hybrid') || norm.includes('phev')) return 'Híbrido';
  if (norm.includes('electr') || norm.includes('ev')) return 'Eléctrico';
  return String(rawFuel).trim();
}

function normalizeTransmission(rawGear) {
  const str = String(rawGear || '').trim();
  const norm = normalizeText(str);
  if (!norm) return 'Manual';
  if (norm.includes('auto') || norm.includes('dct') || norm.includes('pdk') || norm.includes('dsg') || norm.includes('tiptronic')) {
    return str.includes('DCT') ? 'Automático DCT' : str.includes('PDK') ? 'Automático PDK' : 'Automático';
  }
  return 'Manual';
}

function normalizeEngine(rawEngine) {
  const clean = String(rawEngine || '')
    .replace(/,?\s*etiqueta\s*[a-z0-9]+/gi, '')
    .replace(/\bcv\b/gi, 'CV')
    .trim();
  return clean || '—';
}

function normalizeAvailability(rawAvail) {
  const norm = normalizeText(rawAvail);
  if (norm.includes('vend') || norm.includes('entreg') || norm.includes('no disp') || norm.includes('sold')) {
    return 'vendido';
  }
  if (norm.includes('reser')) {
    return 'reservado';
  }
  return 'disponible';
}

function getDGTBadge(car) {
  const corpus = `${car.description || ''} ${car.fuel || ''} ${car.engine || ''} ${car.name || ''}`;
  if (/etiqueta\s*0|cero\s*emisiones|100%\s*el[eé]ctrico|\bphev\b/i.test(corpus)) return '0 Emisiones';
  if (/etiqueta\s*eco|\beco\b|mild[\s-]?hybrid/i.test(corpus)) return 'ECO';
  if (/etiqueta\s*c|distintivo\s*ambiental:?\s*c/i.test(corpus)) return 'Etiqueta C';
  if (/etiqueta\s*b|distintivo\s*ambiental:?\s*b/i.test(corpus)) return 'Etiqueta B';

  const year = parseInt(car.year, 10) || 2007;
  const fuel = normalizeFuel(car.fuel);
  if (fuel === 'Eléctrico') return '0 Emisiones';
  if (fuel === 'Híbrido') return 'ECO';
  if (fuel === 'Diésel') return year >= 2014 ? 'Etiqueta C' : 'Etiqueta B';
  return year >= 2006 ? 'Etiqueta C' : 'Etiqueta B';
}

/**
 * Classifies inventory cleanly into 'performance' (High-end / Sport / Supercar) vs 'daily' (Verified Daily Occasion).
 * Fixes the substring bug where 'Opel Corsa' matched 'rs'.
 */
function classifySegment(car, numericPrice) {
  const text = `${car.name || ''} ${car.brand_model || ''} ${car.engine || ''}`;
  const isExoticBrand = /\b(ferrari|mclaren|lamborghini|porsche|aston\s*martin|maserati|bentley|lotus|alpine)\b/i.test(text);
  const isPerformanceTrim =
    /\b(bmw\s*m\d*|m2|m3|m4|m5|m8|m240i|amg|audi\s*rs\d*|rs3|rs4|rs6|rsq8|sq7|sq8|gt3|gt4|taycan|cayenne|i30\s*n|golf\s*\d*\s*r|type\s*r|cupra\s*vz)\b/i.test(
      text
    );

  if (isExoticBrand || isPerformanceTrim || numericPrice >= 25000) {
    return 'performance';
  }
  return 'daily';
}

/**
 * Parses raw Sanity plain-text descriptions (removing loud emojis and structuring sections cleanly
 * like a German Mechatronik technical dossier).
 */
export function parseCarDescription(rawDescription = '') {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
  const lines = String(rawDescription || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(emojiRegex, '').trim());

  const introParagraphs = [];
  const sections = [];
  let currentSection = null;
  let transferFeeNote = '';

  const headingPattern =
    /^(mantenimiento[^:]*|equipamiento[^:]*|datos del veh[ií]culo[^:]*|caracter[ií]sticas[^:]*|condiciones[^:]*):?$/i;

  for (const line of lines) {
    if (!line) continue;

    // Skip redundant shouty footer lines or repeated price lines
    if (/^exotics collections$/i.test(line) || /^conduce tus sue[ñn]os/i.test(line)) continue;
    if (/^¡?ya disponible en exotics/i.test(line)) continue;
    if (/^contacta (con nosotros|para m[aá]s)/i.test(line)) continue;

    if (/cambio de (nombre|titularidad)/i.test(line)) {
      transferFeeNote = line.replace(/^[-•*]\s*/, '');
    }

    if (headingPattern.test(line)) {
      const cleanTitle = line.replace(/:$/, '').trim();
      currentSection = { title: cleanTitle, items: [] };
      sections.push(currentSection);
      continue;
    }

    const bulletMatch = line.match(/^(?:[•\-*]|\d+\.)\s*(.+)$/);
    if (bulletMatch) {
      if (!currentSection) {
        currentSection = { title: 'Especificaciones & Detalles Verificados', items: [] };
        sections.push(currentSection);
      }
      currentSection.items.push(bulletMatch[1].replace(/\.$/, '').trim());
      continue;
    }

    // Short key:value metadata lines at top of some Sanity entries
    if (/^(a[ñn]o|kil[oó]metros|motor|acabado|carrocer[ií]a|color|propietarios|distintivo|precio)\s*:/i.test(line)) {
      continue;
    }

    if (currentSection && line.length < 75 && !line.endsWith('.')) {
      currentSection.items.push(line);
    } else if (introParagraphs.length < 4) {
      // Avoid repeating ALL-CAPS title line
      if (introParagraphs.length === 0 && line === line.toUpperCase() && line.length > 18) {
        continue;
      }
      introParagraphs.push(line);
    }
  }

  return {
    paragraphs: introParagraphs,
    sections: sections.filter((s) => s.items.length > 0),
    hasSeparateTransferFee: Boolean(transferFeeNote),
    transferFeeNote
  };
}

function toSlug(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function transformDataset(result) {
  const rawCars = [...(result.cars || [])];

  rawCars.sort((a, b) => {
    const pA = CURATOR_SELECTION_NOTES[a._id]?.priority ?? 50;
    const pB = CURATOR_SELECTION_NOTES[b._id]?.priority ?? 50;
    if (pA !== pB) return pA - pB;
    return parseNumeric(b.price) - parseNumeric(a.price);
  });

  const usedSlugs = new Set();

  const cars = rawCars.map((car) => {
    const numericPrice = parseNumeric(car.price);
    const segment = classifySegment(car, numericPrice);
    const availability = normalizeAvailability(car.availability);
    const curatorMeta = CURATOR_SELECTION_NOTES[car._id] || {
      whySelected:
        'Unidad verificada bajo protocolo Exotics Collections: comprobación de kilometraje, diagnosis electrónica de módulos, inspección estructural y entrega con 12 meses de garantía.',
      badge: segment === 'performance' ? 'Selección Performance' : 'Ocasión Verificada',
      highlightExtra: 'Historial Verificado · Revisión Completa · 12 Meses Garantía'
    };

    const imageUrls = (car.images || [])
      .filter(Boolean)
      .map((ref) => ({
        thumb: buildImageUrl(ref, { width: 960, quality: 84 }),
        full: buildImageUrl(ref, { width: 1920, quality: 90 })
      }));

    if (!imageUrls.length) {
      imageUrls.push({ thumb: '/assets/hero_poster.jpg', full: '/assets/hero_poster.jpg' });
    }

    const parsedDesc = parseCarDescription(car.description || '');
    const rawRegime = String(car.regime || '').trim();
    const regime = rawRegime || (segment === 'performance' ? 'Historial Oficial' : 'Nacional');
    const cleanName = String(car.name || car.brand_model || 'Vehículo Exotics').replace(/\s+/g, ' ').trim();
    const cleanYear = String(car.year || '—').trim();

    const rawSanitySlug = toSlug(car.slug || car.id || '');
    const baseSlug = rawSanitySlug || toSlug(`${cleanName}-${cleanYear !== '—' ? cleanYear : ''}`) || car._id;
    let uniqueSlug = baseSlug;
    if (usedSlugs.has(uniqueSlug)) {
      const withYear =
        cleanYear !== '—' && !uniqueSlug.endsWith(`-${cleanYear}`) ? `${uniqueSlug}-${cleanYear}` : `${uniqueSlug}-2`;
      uniqueSlug = usedSlugs.has(withYear) ? `${baseSlug}-${String(car._id).slice(0, 6)}` : withYear;
    }
    usedSlugs.add(uniqueSlug);

    return {
      id: car._id,
      slug: uniqueSlug,
      sanitySlug: rawSanitySlug,
      name: cleanName,
      brand: extractBrand(car),
      brandModel: String(car.brand_model || car.name || '').trim(),
      price: formatPrice(car.price),
      numericPrice,
      availability,
      segment, // 'performance' | 'daily'
      km: formatKm(car.km),
      numericKm: parseNumeric(car.km),
      year: cleanYear,
      numericYear: parseInt(car.year, 10) || 0,
      regime,
      bodyType: String(car.type || 'Turismo').trim(),
      fuel: normalizeFuel(car.fuel),
      engine: normalizeEngine(car.engine),
      transmission: normalizeTransmission(car.transmission),
      seats: String(car.seats || '5').trim(),
      colorExt: String(car.exterior_color || '—').trim(),
      colorInt: String(car.interior_color || '—').trim(),
      dgtBadge: getDGTBadge(car),
      description: car.description || '',
      parsedDescription: parsedDesc,
      whySelected: curatorMeta.whySelected,
      curatorBadge: curatorMeta.badge,
      highlightExtra: curatorMeta.highlightExtra,
      images: imageUrls,
      coverImage: imageUrls[0].thumb,
      hoverImage: imageUrls[1] ? imageUrls[1].thumb : imageUrls[0].thumb,
      videoUrl: car.videoUrl || car.youtubeUrl || curatorMeta.videoUrl || ''
    };
  });

  const imports = (result.imports || []).map((item) => {
    const rawTitle = String(item.title || item.name || 'Importación Europea').trim();
    // Clean redundant prefix words for cleaner card titles while preserving model clarity
    const cleanTitle = rawTitle
      .replace(/^Importaci[oó]n\s+(para\s+stock\s+propio|a\s+la\s+carta)\s+/i, '')
      .replace(/^Importaci[oó]n\s+/i, '')
      .replace(/^Entrega\s+/i, '')
      .trim();

    const isBespoke = /carta|cliente|joaqu[ií]n|miguel|fran/i.test(`${rawTitle} ${item.shortDescription || ''}`);

    return {
      id: item._id,
      title: cleanTitle || rawTitle,
      rawTitle,
      tag: isBespoke ? 'A LA CARTA · ENTREGADO' : 'IMPORTACIÓN OFICIAL',
      description:
        (item.shortDescription && item.shortDescription.trim()) ||
        'Unidad localizada en red oficial europea, auditada presencialmente con medidor de micras y diagnosis OBD2, entregada llave en mano.',
      image: item.imageRef ? buildImageUrl(item.imageRef, { width: 1100, quality: 85 }) : '/assets/hero_poster.jpg'
    };
  });

  const youtube = (result.youtube || []).map((v) => {
    const vid = extractYouTubeId(v.youtubeUrl);
    const meta = VIDEO_METADATA[vid] || {};
    return {
      id: vid,
      url: v.youtubeUrl || EXOTICS_CONFIG.socials.youtube,
      title: meta.title || 'Auditoría e Importación en Directo | Exotics Bcn',
      tag: meta.tag || 'Exotics Collections',
      duration: meta.duration || '4K',
      highlight:
        meta.highlight ||
        'Inspección técnica en concesionario oficial europeo, prueba en Autobahn y entrega llave en mano.',
      thumb: vid ? `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg` : '/assets/hero_poster.jpg',
      fallbackThumb: vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : '/assets/hero_poster.jpg'
    };
  });

  return { cars, imports, youtube };
}

let memoryCache = null;

async function fetchWithTimeout(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllData(forceRefresh = false) {
  if (memoryCache && !forceRefresh) return memoryCache;

  let rawResult = null;

  // 1. LIVE SANITY CDN FIRST (ensures Marc's Sanity Studio updates appear in real time)
  try {
    const queryUrl = `${SANITY_CDN_QUERY_URL}?query=${encodeURIComponent(GROQ_ALL)}`;
    const liveRes = await fetchWithTimeout(queryUrl, 4500);
    if (liveRes.ok) {
      const json = await liveRes.json();
      if (json?.result && (Array.isArray(json.result.cars) || Array.isArray(json.result.imports))) {
        rawResult = json.result;
      }
    }
  } catch (_) {
    // Fallback to static snapshot silently
  }

  // 2. STATIC FALLBACK SNAPSHOT (/data/sanity_cache.json) IF OFFLINE OR BLOCKED
  if (!rawResult) {
    try {
      const fallbackRes = await fetch('/data/sanity_cache.json');
      if (fallbackRes.ok) {
        rawResult = await fallbackRes.json();
      }
    } catch (_) {
      // Ignore
    }
  }

  // 3. Minimal emergency dataset if both network and static JSON fail
  if (!rawResult) {
    rawResult = { cars: [], imports: [], youtube: [] };
  }

  memoryCache = transformDataset(rawResult);
  return memoryCache;
}

