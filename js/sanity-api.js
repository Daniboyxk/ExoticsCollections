/**
 * Exotics Collections - Sanity API Client & Data Provider
 * Connects to Sanity Project: bjo8yvrn, Dataset: production
 * Enriched with Luxury Bento Grid metadata, Curator's notes & Environmental badges
 */
(function(window) {
  'use strict';

  var cfg = window.EXOTICS_CONFIG || {};
  var projectId = (cfg.sanity && cfg.sanity.projectId) || 'bjo8yvrn';
  var dataset = (cfg.sanity && cfg.sanity.dataset) || 'production';
  var apiVersion = (cfg.sanity && cfg.sanity.apiVersion) || 'v2024-01-01';

  var SANITY_ENDPOINT = 'https://' + projectId + '.api.sanity.io/' + apiVersion + '/data/query/' + dataset;

  // Video metadata cache for known Exotics Bcn videos
  var VIDEO_METADATA = {
    '7T5Bi2N6lM8': {
      title: 'No compres un Porsche en España SIN VER este vídeo',
      tag: 'Importación Porsche Zentrum',
      duration: '18:42',
      highlight: 'Proceso de inspección in situ en Alemania, comprobación de micras y ahorro real frente a compra nacional.'
    },
    '57lDEV87lY4': {
      title: 'Comprar un Porsche Taycan en Alemania y cruzar Europa ¿Error o acierto?',
      tag: 'Road Trip 1.800 km',
      duration: '22:15',
      highlight: 'Cruzando Europa de vuelta a Barcelona con un Taycan 4S Cross Turismo verificado en Centro Oficial.'
    },
    'lqyuV96Q5M0': {
      title: 'Así es mi día a día IMPORTANDO coches de LUJO',
      tag: 'Día a Día & Logística',
      duration: '15:30',
      highlight: 'Inspecciones técnicas, diagnosis OBD, transporte cubierto y entrega personalizada.'
    }
  };

  /**
   * Curated reasons why Marc & team selected each unit (The Curator's Note)
   */
  var CURATOR_SELECTION_NOTES = {
    'bba61ca8-57e3-4fa8-93d5-6a0f9e83d1f1': {
      whySelected: 'Buscábamos la unidad definitiva de I30 N: restyling de 280 CV con cambio DCT de 8 velocidades y carrocería Fastback Shadow Grey. Rigurosamente de serie, con 42.000 km certificados en casa oficial, frenos y neumáticos en estado impecable. Ofrece sensaciones de superdeportivo con la fiabilidad y garantía que exigiríamos para nosotros mismos.',
      badge: 'Unidad de Autor',
      highlightExtra: 'DCT 8 Vel. · 280 CV · Techo Panorámico Sky · Chasis Electrónico N',
      priority: 1
    },
    '7e1dc26f-9aca-4a2d-b52b-ba7ea8b935cd': {
      whySelected: 'Los 4x4 auténticos con reductora mecánica son cada vez más escasos. Esta unidad destaca por tener tan solo 80.000 km reales comprobados, chasis y bajos impolutos sin óxido y un estado de conservación interior impropio de su año.',
      badge: '4x4 Puro Verificado',
      highlightExtra: '80.000 km Reales · Tracción 4x4 con Reductora · Sin Óxido',
      priority: 2
    },
    '127c1c61-31e4-4e33-b3ab-a5ed8e0265ab': {
      whySelected: 'Una auténtica cápsula del tiempo: tan solo 38.200 km certificados con Etiqueta Medioambiental C de la DGT. Motor 1.4 gasolina atmosférico de cuatro cilindros con una suavidad y fiabilidad legendarias.',
      badge: 'Bajo Kilometraje Récord',
      highlightExtra: '38.200 km Reales · Etiqueta C · Historial Demostrable',
      priority: 3
    },
    'cb08c7c7-3c79-4507-bee4-e366ffb7a39e': {
      whySelected: 'No nos conformamos con cualquier familiar diésel. Seleccionamos esta unidad Limited por su transparencia y mantenimiento preventivo integral: kit de distribución nuevo, compresor de AC sustituido, discos y pastillas nuevos a estrenar, y carrocería pulida al detalle. Máxima habitabilidad y consumo de 4.4 l/100km sin sorpresas.',
      badge: 'Mantenimiento Integral',
      highlightExtra: 'Distribución Nueva · Frenos a Estrenar · Keyless · GPS',
      priority: 4
    },
    '3d904610-daee-42f3-8b5f-31358f42c058': {
      whySelected: 'Seleccionado por su kilometraje contenido (67.000 km) y estado de mecánica y tapicería muy cuidado. Cero holguras, embrague en perfecto punto y listo para rodar con Etiqueta C.',
      badge: 'Selección Diaria',
      highlightExtra: '67.000 km · Gasolina · Mantenimiento Reciente · Etiqueta C',
      priority: 5
    },
    '3eb8d661-a990-4782-9869-319dde3d1e19': {
      whySelected: 'Unidad de mantenimiento continuo con mecánica contrastada 1.4 gasolina y etiqueta ambiental C. Ideal para movilidad urbana fiable con costes de mantenimiento mínimos.',
      badge: 'Fiabilidad Urbana',
      highlightExtra: 'Motor 1.4 Gasolina · Mantenimiento al Día · Etiqueta C',
      priority: 6
    },
    'bd064873-ec4e-448d-a17c-bc436456b6dd': {
      whySelected: 'Elegido por la contrastada fiabilidad del bloque 1.6 TDCi y su historial regular. Un coche cómodo, seguro y con consumos ínfimos para devorar kilómetros con tranquilidad.',
      badge: 'Eficiencia Diésel',
      highlightExtra: 'Motor 1.6 TDCi · Mantenimiento al Día · Consumo 4.2 L',
      priority: 7
    },
    '7ee72258-ab61-4b6b-8852-e8492483b092': {
      whySelected: 'Unidad de acceso seleccionada estrictamente por su bajo coste de mantenimiento, mecánica 1.4 de gran robustez y menos de 95.000 km reales.',
      badge: 'Ocasión Verificada',
      highlightExtra: '93.000 km · Acabado Trend · Revisión Completa',
      priority: 8
    }
  };

  /**
   * Helper: Builds Sanity CDN Image URL
   */
  function buildImageUrl(ref, options) {
    if (!ref) return 'assets/hero_poster.jpg';
    if (typeof ref !== 'string') {
      if (ref.asset && ref.asset._ref) ref = ref.asset._ref;
      else if (ref.ref) ref = ref.ref;
      else return 'assets/hero_poster.jpg';
    }
    if (ref.indexOf('http://') === 0 || ref.indexOf('https://') === 0) return ref;

    var match = ref.match(/^image-([a-f0-9]+)-([0-9]+x[0-9]+)-([a-z0-9]+)$/i);
    if (!match) return 'assets/hero_poster.jpg';

    var assetId = match[1];
    var dims = match[2];
    var format = match[3];

    var url = 'https://cdn.sanity.io/images/' + projectId + '/' + dataset + '/' + assetId + '-' + dims + '.' + format;
    var params = [];

    if (options) {
      if (options.width) params.push('w=' + options.width);
      if (options.height) params.push('h=' + options.height);
      if (options.quality) params.push('q=' + options.quality);
      if (options.fit) params.push('fit=' + options.fit);
      if (options.auto !== false) params.push('auto=format');
    } else {
      params.push('auto=format');
    }

    if (params.length) url += '?' + params.join('&');
    return url;
  }

  /**
   * Helper: Extracts clean Brand from car name / brand_model
   */
  function extractBrand(car) {
    var raw = (car.brand_model || car.name || '').trim();
    if (/volkswagen|vw/i.test(raw)) return 'Volkswagen';
    if (/mercedes|amg/i.test(raw)) return 'Mercedes-Benz';
    if (/audi/i.test(raw)) return 'Audi';
    if (/bmw/i.test(raw)) return 'BMW';
    if (/porsche/i.test(raw)) return 'Porsche';
    if (/hyundai/i.test(raw)) return 'Hyundai';
    if (/renault/i.test(raw)) return 'Renault';
    if (/suzuki/i.test(raw)) return 'Suzuki';
    if (/opel/i.test(raw)) return 'Opel';
    if (/ford/i.test(raw)) return 'Ford';
    if (/ferrari/i.test(raw)) return 'Ferrari';
    if (/lamborghini/i.test(raw)) return 'Lamborghini';
    var firstWord = raw.split(/[\s-]+/)[0];
    return firstWord || 'Exotics';
  }

  /**
   * Helper: Calculates DGT Environmental Badge
   */
  function getDGTBadge(car) {
    var desc = (car.description || '') + ' ' + (car.fuel || '') + ' ' + (car.name || '');
    if (/etiqueta 0|cero emisiones|el[eé]ctrico|phev/i.test(desc)) return '0 Emisiones';
    if (/etiqueta eco|h[ií]brido|mild.hybrid/i.test(desc)) return 'ECO';
    if (/etiqueta c/i.test(desc)) return 'Etiqueta C';
    if (/etiqueta b/i.test(desc)) return 'Etiqueta B';

    var year = parseInt(car.year, 10) || 2007;
    var isDiesel = /di[eé]sel/i.test(car.fuel || '');

    if (!isDiesel) {
      return year >= 2006 ? 'Etiqueta C' : 'Etiqueta B';
    } else {
      return year >= 2014 ? 'Etiqueta C' : 'Etiqueta B';
    }
  }

  /**
   * Extracts YouTube Video ID
   */
  function extractYouTubeId(url) {
    if (!url) return '';
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : '';
  }

  /**
   * Main query execution
   */
  var cachedData = null;

  async function fetchAllData(forceRefresh) {
    if (cachedData && !forceRefresh) return cachedData;

    var result = null;

    // Strategy 1: Load pre-cached JSON from local server (ultra fast, eliminates CORS completely)
    try {
      var cacheRes = await fetch('data/sanity_cache.json?v=' + Date.now());
      if (cacheRes.ok) {
        result = await cacheRes.json();
      }
    } catch (e) {
      // ignore
    }

    // Strategy 2: If local file didn't resolve, query live Sanity endpoint
    if (!result || !result.cars || !result.cars.length) {
      var groq = `{
        "cars": *[_type == "car"] | order(_createdAt desc){
          _id,
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

      var queryUrl = SANITY_ENDPOINT + '?query=' + encodeURIComponent(groq);

      try {
        var res = await fetch(queryUrl);
        if (res.ok) {
          var json = await res.json();
          result = json.result || {};
        }
      } catch (err) {
        console.warn('Sanity API direct fetch error (likely CORS):', err);
      }
    }

    // Strategy 3: Built-in full static dataset fallback if network is completely offline
    if (!result || !result.cars || !result.cars.length) {
      return getFallbackData();
    }

    // 1. Process Cars
    var rawCars = result.cars || [];

    // Sort cars: Priority order (Hyundai I30 N first, then Vitara, etc.)
    rawCars.sort(function(a, b) {
      var pA = (CURATOR_SELECTION_NOTES[a._id] && CURATOR_SELECTION_NOTES[a._id].priority) || 99;
      var pB = (CURATOR_SELECTION_NOTES[b._id] && CURATOR_SELECTION_NOTES[b._id].priority) || 99;
      return pA - pB;
    });

    var cars = rawCars.map(function(car, idx) {
      var rawAvail = String(car.availability || '').toLowerCase();
      var isReserved = rawAvail.indexOf('reser') !== -1;
      var imageUrls = (car.images || []).map(function(ref) {
        return {
          thumb: buildImageUrl(ref, { width: 900, quality: 82 }),
          full: buildImageUrl(ref, { width: 1920, quality: 90 })
        };
      });

      // Fallback if no images
      if (!imageUrls.length) {
        imageUrls.push({
          thumb: 'assets/hero_poster.jpg',
          full: 'assets/hero_poster.jpg'
        });
      }

      // Determine category
      var cat = 'selection';
      var nameLower = (car.name || '').toLowerCase() + ' ' + (car.brand_model || '').toLowerCase();
      if (nameLower.indexOf('ferrari') >= 0 || nameLower.indexOf('mclaren') >= 0 || nameLower.indexOf('lamborghini') >= 0 || nameLower.indexOf('porsche') >= 0) {
        cat = 'supercar';
      } else if (nameLower.indexOf('bmw m') >= 0 || nameLower.indexOf('amg') >= 0 || nameLower.indexOf('rs') >= 0 || nameLower.indexOf('i30 n') >= 0) {
        cat = 'performance';
      } else {
        cat = 'selection';
      }

      // Curator notes & highlights
      var curatorMeta = CURATOR_SELECTION_NOTES[car._id] || {
        whySelected: 'Unidad seleccionada tras rigurosa diagnosis OBD, peritaje de micras de pintura y comprobación de historial oficial. Coches que compraríamos para nuestro propio garaje personal.',
        badge: 'Selección Exotics',
        highlightExtra: 'Revisión Certificada · 12 Meses Garantía · Historial Verificado'
      };

      var brand = extractBrand(car);
      var badgeDgt = getDGTBadge(car);

      // Bento Card Layout Span:
      // Index 0 (Hyundai I30 N): Flagship Hero (2 cols wide on desktop)
      // Index 1 (Suzuki Vitara): Panoramic (2 cols wide)
      // Others: Elegant 1-col cards
      var bentoSpan = 'standard';
      if (idx === 0) bentoSpan = 'hero';
      else if (idx === 1) bentoSpan = 'panoramic';

      return {
        id: car._id,
        name: car.name || car.brand_model || 'Vehículo Exotics',
        brand: brand,
        brandModel: car.brand_model || car.name || '',
        price: car.price || 'Consultar',
        availability: isReserved ? 'reservado' : 'disponible',
        category: cat,
        km: car.km || '—',
        year: car.year || '—',
        description: car.description || '',
        fuel: car.fuel || 'Gasolina',
        engine: car.engine || '—',
        transmission: car.transmission || 'Manual',
        seats: car.seats || '5',
        colorExt: car.exterior_color || '—',
        colorInt: car.interior_color || '—',
        dgtBadge: badgeDgt,
        whySelected: curatorMeta.whySelected,
        curatorBadge: curatorMeta.badge,
        highlightExtra: curatorMeta.highlightExtra,
        images: imageUrls,
        coverImage: imageUrls[0] ? imageUrls[0].thumb : 'assets/hero_poster.jpg',
        bentoSpan: bentoSpan,
        videoUrl: (idx === 0) ? 'https://www.youtube.com/watch?v=lqyuV96Q5M0' : ''
      };
    });

    // 2. Process Delivered / Imported Client Showcase Units
    var imports = (result.imports || []).map(function(item, idx) {
      var title = item.title || item.name || 'Importación a la carta';
      var imgUrl = item.imageRef ? buildImageUrl(item.imageRef, { width: 1000, quality: 82 }) : 'assets/hero_poster.jpg';
      return {
        id: item._id,
        title: title,
        description: item.shortDescription || 'Vehículo seleccionado e importado desde red oficial en Europa. Peritaje técnico in situ, verificación de micras y entrega llave en mano.',
        image: imgUrl,
        bentoSpan: (idx === 0 || idx === 3) ? 'wide' : 'standard',
        deliveryBadge: 'Entrega Realizada'
      };
    });

    // 3. Process YouTube Videos
    var youtubeVideos = (result.youtube || []).map(function(v) {
      var vid = extractYouTubeId(v.youtubeUrl);
      var meta = VIDEO_METADATA[vid] || {};
      return {
        id: vid,
        url: v.youtubeUrl,
        title: meta.title || 'Importación y prueba con Marc Ibáñez | Exotics Bcn',
        tag: meta.tag || 'Exotics Collections',
        duration: meta.duration || 'YouTube',
        highlight: meta.highlight || 'Conoce el proceso de importación transparente en Exotics Collections.',
        thumb: vid ? 'https://i.ytimg.com/vi/' + vid + '/maxresdefault.jpg' : 'assets/hero_poster.jpg'
      };
    });

    cachedData = {
      cars: cars,
      imports: imports,
      youtube: youtubeVideos
    };

    return cachedData;
  }

  /**
   * Complete Fallback Dataset with all 8 real cars from Sanity & 12 deliveries
   */
  function getFallbackData() {
    var rawCarsFallback = [
      {
        id: 'bba61ca8-57e3-4fa8-93d5-6a0f9e83d1f1',
        name: 'Hyundai I30 N Performance Fastback Sky DCT',
        brand: 'Hyundai',
        brandModel: 'Hyundai I30 N',
        price: '35.990€',
        availability: 'disponible',
        category: 'performance',
        km: '42.000 km',
        year: '2021',
        fuel: 'Gasolina',
        transmission: 'Automático DCT 8 vel.',
        seats: '5',
        dgtBadge: 'Etiqueta C',
        curatorBadge: 'Unidad de Autor',
        highlightExtra: 'DCT 8 Vel. · 280 CV · Techo Panorámico Sky · Chasis Electrónico N',
        whySelected: 'Buscábamos la unidad definitiva de I30 N: restyling de 280 CV con cambio DCT de 8 velocidades y carrocería Fastback Shadow Grey. Rigurosamente de serie, con 42.000 km certificados en casa oficial, frenos y neumáticos en estado impecable. Ofrece sensaciones de superdeportivo con la fiabilidad y garantía que exigiríamos para nosotros mismos.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/2a7885435afa5c0f57050d84718d2959c8f20de1-1819x2048.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/2a7885435afa5c0f57050d84718d2959c8f20de1-1819x2048.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/2a7885435afa5c0f57050d84718d2959c8f20de1-1819x2048.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'hero'
      },
      {
        id: '7e1dc26f-9aca-4a2d-b52b-ba7ea8b935cd',
        name: 'Suzuki Vitara 1.6 VVT 4x4',
        brand: 'Suzuki',
        brandModel: 'Suzuki Vitara',
        price: '11.990€',
        availability: 'disponible',
        category: 'selection',
        km: '80.000 km',
        year: '2005',
        fuel: 'Gasolina',
        transmission: 'Manual con Reductora',
        seats: '5',
        dgtBadge: 'Etiqueta B',
        curatorBadge: '4x4 Puro Verificado',
        highlightExtra: '80.000 km Reales · Tracción 4x4 con Reductora · Chasis Sin Óxido',
        whySelected: 'Los 4x4 auténticos con reductora mecánica son cada vez más escasos. Esta unidad destaca por tener tan solo 80.000 km reales comprobados, chasis y bajos impolutos sin óxido y un estado de conservación interior impropio de su año.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/f8d15f96645e466bfa632ce1fdb47efeeb27413e-4284x5712.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/f8d15f96645e466bfa632ce1fdb47efeeb27413e-4284x5712.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/f8d15f96645e466bfa632ce1fdb47efeeb27413e-4284x5712.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'panoramic'
      },
      {
        id: '127c1c61-31e4-4e33-b3ab-a5ed8e0265ab',
        name: 'Volkswagen Polo 1.4 GT (38.200 km)',
        brand: 'Volkswagen',
        brandModel: 'Volkswagen Polo',
        price: '6.490€',
        availability: 'disponible',
        category: 'selection',
        km: '38.200 km',
        year: '2007',
        fuel: 'Gasolina',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta C',
        curatorBadge: 'Bajo Kilometraje Récord',
        highlightExtra: '38.200 km Reales · Etiqueta C · Historial Demostrable',
        whySelected: 'Una auténtica cápsula del tiempo: tan solo 38.200 km certificados con Etiqueta Medioambiental C de la DGT. Motor 1.4 gasolina atmosférico de cuatro cilindros con una suavidad y fiabilidad legendarias.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/149e2e3711a02441bddc2e6325fe4c22fc3fd285-4284x5712.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/149e2e3711a02441bddc2e6325fe4c22fc3fd285-4284x5712.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/149e2e3711a02441bddc2e6325fe4c22fc3fd285-4284x5712.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      },
      {
        id: 'cb08c7c7-3c79-4507-bee4-e366ffb7a39e',
        name: 'Renault Mégane Sport Tourer Limited',
        brand: 'Renault',
        brandModel: 'Renault Mégane',
        price: '5.990€',
        availability: 'disponible',
        category: 'selection',
        km: '196.200 km',
        year: '2015',
        fuel: 'Diesel',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta C',
        curatorBadge: 'Mantenimiento Integral',
        highlightExtra: 'Distribución Nueva · Frenos a Estrenar · Keyless · GPS',
        whySelected: 'No nos conformamos con cualquier familiar diésel. Seleccionamos esta unidad Limited por su transparencia y mantenimiento preventivo integral: kit de distribución nuevo, compresor de AC sustituido, discos y pastillas nuevos a estrenar.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/a4f23ee6551fe549ce52dffb27121a7133631cd0-4284x5712.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/a4f23ee6551fe549ce52dffb27121a7133631cd0-4284x5712.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/a4f23ee6551fe549ce52dffb27121a7133631cd0-4284x5712.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      },
      {
        id: '3d904610-daee-42f3-8b5f-31358f42c058',
        name: 'Opel Corsa 1.2 Gasolina',
        brand: 'Opel',
        brandModel: 'Opel Corsa',
        price: '5.690€',
        availability: 'disponible',
        category: 'selection',
        km: '67.668 km',
        year: '2007',
        fuel: 'Gasolina',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta C',
        curatorBadge: 'Selección Diaria',
        highlightExtra: '67.000 km · Gasolina · Mantenimiento Reciente · Etiqueta C',
        whySelected: 'Seleccionado por su kilometraje contenido (67.000 km) y estado de mecánica y tapicería muy cuidado. Cero holguras, embrague en perfecto punto y listo para rodar.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/7c6859df76dba691b1867bdd7f5a5e7e02ada8a4-1536x2048.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/7c6859df76dba691b1867bdd7f5a5e7e02ada8a4-1536x2048.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/7c6859df76dba691b1867bdd7f5a5e7e02ada8a4-1536x2048.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      },
      {
        id: '3eb8d661-a990-4782-9869-319dde3d1e19',
        name: 'Volkswagen Polo 1.4 Trend',
        brand: 'Volkswagen',
        brandModel: 'Volkswagen Polo',
        price: '5.490€',
        availability: 'disponible',
        category: 'selection',
        km: '135.000 km',
        year: '2008',
        fuel: 'Gasolina',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta C',
        curatorBadge: 'Fiabilidad Urbana',
        highlightExtra: 'Motor 1.4 Gasolina · Mantenimiento al Día · Etiqueta C',
        whySelected: 'Unidad de mantenimiento continuo con mecánica contrastada 1.4 gasolina y etiqueta ambiental C. Ideal para movilidad urbana fiable con costes de mantenimiento mínimos.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/5616d400fd3b0a1993397c293bee6542ea0bacfb-1536x2048.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/5616d400fd3b0a1993397c293bee6542ea0bacfb-1536x2048.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/5616d400fd3b0a1993397c293bee6542ea0bacfb-1536x2048.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      },
      {
        id: 'bd064873-ec4e-448d-a17c-bc436456b6dd',
        name: 'Ford Fiesta 1.6 TDCi',
        brand: 'Ford',
        brandModel: 'Ford Fiesta',
        price: '4.990€',
        availability: 'disponible',
        category: 'selection',
        km: '148.000 km',
        year: '2009',
        fuel: 'Diesel',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta B',
        curatorBadge: 'Eficiencia Diésel',
        highlightExtra: 'Motor 1.6 TDCi · Mantenimiento al Día · Consumo 4.2 L',
        whySelected: 'Elegido por la contrastada fiabilidad del bloque 1.6 TDCi y su historial regular. Un coche cómodo, seguro y con consumos ínfimos para devorar kilómetros con tranquilidad.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/1eff4b538799f71c183c4f09a58d1c81ca8e000d-4284x5712.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/1eff4b538799f71c183c4f09a58d1c81ca8e000d-4284x5712.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/1eff4b538799f71c183c4f09a58d1c81ca8e000d-4284x5712.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      },
      {
        id: '7ee72258-ab61-4b6b-8852-e8492483b092',
        name: 'Ford Fiesta 1.4 Trend',
        brand: 'Ford',
        brandModel: 'Ford Fiesta',
        price: '3.690€',
        availability: 'disponible',
        category: 'selection',
        km: '93.000 km',
        year: '2004',
        fuel: 'Gasolina',
        transmission: 'Manual',
        seats: '5',
        dgtBadge: 'Etiqueta B',
        curatorBadge: 'Ocasión Verificada',
        highlightExtra: '93.000 km · Acabado Trend · Revisión Completa',
        whySelected: 'Unidad de acceso seleccionada estrictamente por su bajo coste de mantenimiento, mecánica 1.4 de gran robustez y menos de 95.000 km reales.',
        coverImage: 'https://cdn.sanity.io/images/bjo8yvrn/production/8d9236970b743ff844c4c1e0c3e7e139d2c81067-1640x2048.jpg?w=900&auto=format',
        images: [
          { thumb: 'https://cdn.sanity.io/images/bjo8yvrn/production/8d9236970b743ff844c4c1e0c3e7e139d2c81067-1640x2048.jpg?w=900&auto=format', full: 'https://cdn.sanity.io/images/bjo8yvrn/production/8d9236970b743ff844c4c1e0c3e7e139d2c81067-1640x2048.jpg?w=1920&auto=format' }
        ],
        bentoSpan: 'standard'
      }
    ];

    var rawImportsFallback = [
      {
        id: 'fc4b49d8-2a4a-4284-8236-0b4bde9444ef',
        title: 'Porsche Cayman GT4 "Sports Cup"',
        description: 'Fran y su familia ya disfrutan de su Porsche Cayman GT4 \'Sports Cup\', comprado en Centro Porsche oficial y con tan solo 8.000 km.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/04bd2efdc20c093ee00e1e66e8824f067e6d2141-3213x5712.jpg?w=1000&auto=format',
        bentoSpan: 'wide',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '49f62a9d-edbe-431a-b258-5ca47436c7c3',
        title: 'McLaren 750S Coupé',
        description: 'Configuración a medida e importación con verificación exhaustiva bajo chasis en concesionario oficial.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/8a0284ffcfa3af6f469e7ca81c64268889f5ef65-3213x5712.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '2079f12f-f429-4f19-b86a-160eba92dce2',
        title: 'Porsche Taycan 4S Cross Turismo',
        description: 'Miguel quería una configuración muy específica: pantalla copiloto e interior beige. 20 días después ya disfruta de su coche.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/53e8f39d5524f3f4c8bf3db71fea6fadaedf8b5f-1290x715.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '4f9ecde0-3a1f-49ba-b132-2b76ce5342a9',
        title: 'Audi SQ7 V8 4.0 TFSI',
        description: 'Joaquín nos contactó para encontrar la unidad perfecta de SQ7 V8 en Alemania, con peritaje in situ y matriculación completa.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/e2c84f4bcf76c61dda3d827bb6746929dfc0000a-4284x5712.jpg?w=1000&auto=format',
        bentoSpan: 'wide',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '1703aecb-9464-494a-a8e8-2c062064ccaa',
        title: 'BMW M2 G82 Coupé',
        description: 'Importación directa desde BMW M Zentrum en Múnich. Verificación telemática oficial y transporte asegurado en camión cerrado.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/0794b99e7fe506892d00368bf89d3bffcb79771e-4896x3672.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '2e3ef27b-a698-45aa-a402-72608fae230f',
        title: 'Porsche Cayenne GTS Coupé 2025',
        description: 'Unidad de reestreno oficial con menos de 10.000 km y garantía Porsche Approved internacional.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/5c02799d285ab5cc4b008adfe88a62fddc094a9b-3213x5712.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '6d217467-a31b-497e-86fc-d95f3babfe95',
        title: 'BMW M240i xDrive',
        description: 'Vehículo importado a la carta cumpliendo estrictamente con el pliego de condiciones de equipamiento solicitado por el comprador.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/f205e8c165e645a9929d3032ae6f1b6e0659e870-4284x5712.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '412dbc17-5767-4f80-928e-a95753270937',
        title: 'Mercedes-AMG A35 4MATIC',
        description: 'Seleccionado en concesionario oficial Mercedes-Benz con libro digital al día y paquete aerodinámico AMG.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/dcf3686c8a2e4c584c3e1e1ec5fd17603f035291-2048x1153.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '0b689784-9ea5-4f7d-9877-bbb159ada4ae',
        title: 'Volkswagen Golf 8 R (20 Aniversario)',
        description: 'Edición limitada 333 CV con escape Akrapovič y paquete Performance R importado desde Alemania.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/588f69775b88f0b23120bed4ed3687610ad6c2c6-3213x5712.jpg?w=1000&auto=format',
        bentoSpan: 'standard',
        deliveryBadge: 'Entrega Realizada'
      },
      {
        id: '72fa6608-e52f-4100-84d9-fa7c6ebdef05',
        title: 'Doble Entrega Oficial: Audi SQ7 & Cayenne Coupé',
        description: 'Gestión coordinada para cliente particular: dos unidades de alta gama auditadas e importadas simultáneamente.',
        image: 'https://cdn.sanity.io/images/bjo8yvrn/production/8bd05b7eafc10071551c13786e06588e5c854858-4032x3024.jpg?w=1000&auto=format',
        bentoSpan: 'wide',
        deliveryBadge: 'Entrega Realizada'
      }
    ];

    var rawYoutubeFallback = [
      {
        id: '7T5Bi2N6lM8',
        url: 'https://www.youtube.com/watch?v=7T5Bi2N6lM8',
        title: 'No compres un Porsche en España SIN VER este vídeo',
        tag: 'Importación Porsche Zentrum',
        duration: '18:42',
        highlight: 'Proceso de inspección in situ en Alemania, comprobación de micras y ahorro real frente a compra nacional.',
        thumb: 'https://i.ytimg.com/vi/7T5Bi2N6lM8/maxresdefault.jpg'
      },
      {
        id: '57lDEV87lY4',
        url: 'https://www.youtube.com/watch?v=57lDEV87lY4',
        title: 'Comprar un Porsche Taycan en Alemania y cruzar Europa ¿Error o acierto?',
        tag: 'Road Trip 1.800 km',
        duration: '22:15',
        highlight: 'Cruzando Europa de vuelta a Barcelona con un Taycan 4S Cross Turismo verificado en Centro Oficial.',
        thumb: 'https://i.ytimg.com/vi/57lDEV87lY4/maxresdefault.jpg'
      },
      {
        id: 'lqyuV96Q5M0',
        url: 'https://www.youtube.com/watch?v=lqyuV96Q5M0',
        title: 'Así es mi día a día IMPORTANDO coches de LUJO',
        tag: 'Día a Día & Logística',
        duration: '15:30',
        highlight: 'Inspecciones técnicas, diagnosis OBD, transporte cubierto y entrega personalizada.',
        thumb: 'https://i.ytimg.com/vi/lqyuV96Q5M0/maxresdefault.jpg'
      }
    ];

    cachedData = {
      cars: rawCarsFallback,
      imports: rawImportsFallback,
      youtube: rawYoutubeFallback
    };

    return cachedData;
  }

  window.ExoticsSanity = {
    fetchAllData: fetchAllData,
    buildImageUrl: buildImageUrl,
    extractYouTubeId: extractYouTubeId
  };

})(window);
