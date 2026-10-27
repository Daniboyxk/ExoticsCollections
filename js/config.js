/**
 * Exotics Collections - Global Configuration & Philosophy
 * Founder & Curator: Marc Ibáñez (@exoticsbcn)
 * Slogan: "Exclusividad, diseño y fiabilidad"
 * Stock Axiom: "No buscamos cualquier coche. Buscamos la unidad perfecta"
 * Confidence Axiom: "Coches que seleccionaríamos para nuestros familiares"
 * Import Axiom: "Encuentra tu nuevo coche en cualquier parte de Europa"
 * CMS: Sanity.io (bjo8yvrn / production)
 */
window.EXOTICS_CONFIG = {
  brandName: "Exotics Collections",
  founder: "Marc Ibáñez",
  phoneDisplay: "+34 697 46 41 04",
  whatsappNumber: "34697464104",
  email: "info@exoticscollections.com",
  location: "Barcelona, España",

  slogans: {
    tagline: "Exclusividad, diseño y fiabilidad",
    stock: "No buscamos cualquier coche. Buscamos la unidad perfecta",
    familyConfidence: "Coches que seleccionaríamos para nuestros familiares",
    import: "Encuentra tu nuevo coche en cualquier parte de Europa",
    selectionOverMargin: "No priorizamos el margen de beneficio, sino el estado del vehículo"
  },

  importCriteria: [
    { title: "Menos de 7 años", desc: "Unidades modernas de reestreno, evitando obsolescencia técnica." },
    { title: "Menos de 90.000 km", desc: "Kilometraje estrictamente certificado en bases de datos oficiales." },
    { title: "Historial Oficial Completo", desc: "Mantenimiento 100% sellado en red oficial (Porsche, BMW M, Audi Sport...)." },
    { title: "Auditoría In Situ & OBD", desc: "Peritaje de micras de pintura, diagnosis electrónica y cero golpes estructurales." },
    { title: "Garantía Europea 12 Meses", desc: "Cobertura completa llave en mano con matriculación definitiva en España." }
  ],

  sanity: {
    projectId: "bjo8yvrn",
    dataset: "production",
    apiVersion: "v2024-01-01",
    useCdn: true,
    cdnBase: "https://cdn.sanity.io"
  },

  socials: {
    youtube: "https://www.youtube.com/@exoticsbcn",
    instagram: "https://www.instagram.com/exoticscollections",
    tiktok: "https://www.tiktok.com/@exoticscollections"
  },

  /**
   * Generates a pre-filled WhatsApp link
   */
  getWhatsAppUrl: function(message) {
    var text = encodeURIComponent(message || "Hola Marc, he visto la web de Exotics Collections y me gustaría recibir asesoramiento para un vehículo.");
    return "https://wa.me/" + this.whatsappNumber + "?text=" + text;
  },

  /**
   * WhatsApp link for a specific car inquiry with action types
   * @param {string} carName
   * @param {string} price
   * @param {string} url
   * @param {'interest'|'reserve'} actionType
   */
  getCarWhatsAppUrl: function(carName, price, url, actionType) {
    var text = "";
    if (actionType === 'reserve') {
      text = "Hola Marc, quiero *RESERVAR formalmente* la unidad " + (carName || "") + 
        (price ? " (" + price + ")" : "") + " de Exotics Collections.\n" +
        (url ? "Enlace: " + url + "\n\n" : "\n") +
        "¿Cuáles son los pasos para formalizar la reserva y la documentación?";
    } else {
      // Default: "Me interesa esta unidad"
      text = "Hola Marc, *me interesa esta unidad*: " + (carName || "") + 
        (price ? " (" + price + ")" : "") + " de Exotics Collections.\n" +
        (url ? "Enlace: " + url + "\n\n" : "\n") +
        "¿Sigue disponible? Me gustaría recibir más fotos, el historial y conocer los detalles.";
    }
    return "https://wa.me/" + this.whatsappNumber + "?text=" + encodeURIComponent(text);
  },

  /**
   * WhatsApp link for a custom import request
   */
  getImportWhatsAppUrl: function(data) {
    var lines = [
      "🏁 *SOLICITUD DE BÚSQUEDA A LA CARTA - EXOTICS COLLECTIONS*",
      "Hola Marc, quiero que me ayudéis a buscar y traer un coche desde cualquier parte de Europa:",
      "",
      "• *Marca / Modelo:* " + (data.brandModel || "A consultar"),
      "• *Presupuesto aprox:* " + (data.budget || "A consultar"),
      "• *Año mínimo:* " + (data.year || "Indiferente"),
      "• *Combustible / Cambio:* " + (data.fuel || "Indiferente"),
      "• *Extras / Requisitos:* " + (data.extras || "Sin especificar"),
      "",
      "¿Podemos agendar una llamada o revisar qué unidades verificadas hay disponibles?"
    ];
    return "https://wa.me/" + this.whatsappNumber + "?text=" + encodeURIComponent(lines.join("\n"));
  }
};
