/**
 * Catálogo de datos - Tesla Premium Showroom
 * Datos estructurados según especificación técnica frontend
 * Nota: Precios y especificaciones son demostrativos y referenciales para Colombia (COP).
 */

const VEHICLES_DATA = [
  {
    id: "model-3",
    name: "Model 3",
    version: "Long Range Dual Motor AWD",
    category: "Sedán",
    badge: "Eficiencia y Agilidad",
    tagline: "El sedán eléctrico redefinido para el máximo dinamismo y confort silencioso.",
    description: "Diseñado para ofrecer la máxima eficiencia aerodinámica, una aceleración electrizante y un habitáculo refinado con vidrio acústico de 360 grados y pantalla de 15.4 pulgadas.",
    price: 198000000,
    currency: "COP",
    rangeKm: 629,
    accelerationSeconds: 4.4,
    topSpeedKm: 201,
    drive: "Tracción integral Dual Motor (AWD)",
    powerHp: 498,
    cargoVolume: "682 L",
    chargingTime: "Hasta 282 km en 15 min",
    image: "assets/images/model-3.jpg",
    featured: true,
    availability: "Entrega estimada: 30 a 45 días",
    colors: [
      { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "none" },
      { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.7) contrast(1.2)" },
      { id: "midnight-silver", name: "Gris Sigilo Metalizado", hex: "#4B4E53", filter: "hue-rotate(200deg) saturate(0.2) contrast(1.1)" },
      { id: "ultra-red", name: "Rojo Ultra Multicapa", hex: "#A81017", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" },
      { id: "deep-blue", name: "Azul Profundo Metalizado", hex: "#122A4E", filter: "sepia(0.6) hue-rotate(180deg) saturate(2)" }
    ],
    wheels: ["Ruedas Photon de 18\"", "Ruedas Nova de 19\""],
    interior: ["Negro Premium con detalles de aluminio", "Blanco Premium con madera ecológica"],
    highlights: [
      "Autonomía WLTP líder en su categoría de hasta 629 km",
      "Vidrios acústicos dobles para una cabina ultra silenciosa",
      "Iluminación ambiental envolvente personalizable",
      "Pantalla trasera de 8\" para pasajeros de la segunda fila",
      "Suspensión optimizada para confort en carreteras exigentes"
    ]
  },
  {
    id: "model-y",
    name: "Model Y",
    version: "Performance All-Wheel Drive",
    category: "SUV",
    badge: "El Más Vendido del Mundo",
    tagline: "La combinación perfecta entre versatilidad familiar, espacio y potencia superdeportiva.",
    description: "Espacio para cinco ocupantes con capacidad de carga masiva, posición de manejo elevada y centro de gravedad ultrabajo para una seguridad activa de 5 estrellas en todas las pruebas.",
    price: 235000000,
    currency: "COP",
    rangeKm: 533,
    accelerationSeconds: 3.7,
    topSpeedKm: 250,
    drive: "Tracción integral Dual Motor (AWD)",
    powerHp: 534,
    cargoVolume: "2.158 L (asientos abatidos)",
    chargingTime: "Hasta 261 km en 15 min",
    image: "assets/images/model-y.jpg",
    featured: true,
    availability: "Disponibilidad inmediata para entrega",
    colors: [
      { id: "midnight-silver", name: "Gris Sigilo Metalizado", hex: "#4B4E53", filter: "none" },
      { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "brightness(1.2) contrast(0.9)" },
      { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.65) contrast(1.2)" },
      { id: "ultra-red", name: "Rojo Cereza Profundo", hex: "#8A121A", filter: "sepia(0.5) hue-rotate(320deg) saturate(1.8)" },
      { id: "deep-blue", name: "Azul Océano Metalizado", hex: "#122A4E", filter: "sepia(0.6) hue-rotate(185deg) saturate(2)" }
    ],
    wheels: ["Ruedas Uberturbine de 21\"", "Ruedas Gemini oscuras de 19\""],
    interior: ["Negro Ébano Integral", "Blanco Glaciar Escandinavo"],
    highlights: [
      "Aceleración de superdeportivo: 0-100 km/h en tan solo 3.7 segundos",
      "Portón trasero eléctrico con boca de carga a ras de piso",
      "Frenos de alto rendimiento y alerón de fibra de carbono",
      "Modo Campamento con climatización continua y vista panorámica",
      "Compatibilidad total con portabicicletas y accesorios de aventura"
    ]
  },
  {
    id: "model-s",
    name: "Model S",
    version: "Plaid Tri-Motor",
    category: "Sedán",
    badge: "Hiperdeportivo de Lujo",
    tagline: "1.020 caballos de fuerza. El automóvil de producción con mayor aceleración de la historia.",
    description: "La cumbre del rendimiento automotriz. Tres motores independientes con rotores con funda de carbono que mantienen el par motor máximo sin desfallecer hasta los 322 km/h.",
    price: 430000000,
    currency: "COP",
    rangeKm: 600,
    accelerationSeconds: 2.1,
    topSpeedKm: 322,
    drive: "Tracción total Tri-Motor con vectorización de par",
    powerHp: 1020,
    cargoVolume: "793 L",
    chargingTime: "Hasta 300 km en 15 min",
    image: "assets/images/model-s.jpg",
    featured: true,
    availability: "Unidades limitadas bajo pedido exclusivo",
    colors: [
      { id: "solid-black", name: "Negro Obsidiana Plaid", hex: "#111112", filter: "none" },
      { id: "pearl-white", name: "Blanco Perla Cerámico", hex: "#E8E9EB", filter: "brightness(1.3) contrast(0.9)" },
      { id: "midnight-silver", name: "Plata Mercurio Metálico", hex: "#696E75", filter: "brightness(1.1) contrast(1.1)" },
      { id: "ultra-red", name: "Ultra Rojo Corsa", hex: "#B30F17", filter: "sepia(0.55) hue-rotate(320deg) saturate(2.2)" },
      { id: "deep-blue", name: "Azul Cobalto Nocturno", hex: "#0E2442", filter: "sepia(0.7) hue-rotate(190deg) saturate(2.2)" }
    ],
    wheels: ["Ruedas Arachnid de 21\"", "Ruedas Tempest de 19\""],
    interior: ["Yoke deportivo o volante clásico con cuero vegano", "Acabados en fibra de carbono real"],
    highlights: [
      "De 0 a 100 km/h en 2.1 segundos (cuarto de milla en 9.23 s)",
      "Pantalla cinematográfica inclinable de 17\" con 10 teraflops de potencia gráfica",
      "Sistema de audio de 22 altavoces con cancelación activa de ruido vial",
      "Suspensión neumática adaptativa predictiva con geolocalización",
      "Climatización de tres zonas invisible y ventilación de asientos delanteros"
    ]
  },
  {
    id: "model-x",
    name: "Model X",
    version: "Plaid Falcon Wings",
    category: "SUV",
    badge: "SUV de Alta Gama",
    tagline: "El SUV más potente del planeta con puertas traseras de ala de halcón inteligentes.",
    description: "Ingeniería aeronáutica aplicada al automóvil familiar de ultra lujo. Puertas Falcon Wing con sensores ultrasónicos capaces de abrirse en los espacios de estacionamiento más reducidos.",
    price: 475000000,
    currency: "COP",
    rangeKm: 543,
    accelerationSeconds: 2.6,
    topSpeedKm: 262,
    drive: "Tracción total Tri-Motor (AWD)",
    powerHp: 1020,
    cargoVolume: "2.614 L",
    chargingTime: "Hasta 270 km en 15 min",
    image: "assets/images/model-x.jpg",
    featured: false,
    availability: "Bajo pedido especial - Entrega personalizada",
    colors: [
      { id: "pearl-white", name: "Blanco Perla Escultural", hex: "#E8E9EB", filter: "none" },
      { id: "solid-black", name: "Negro Ébano Diamante", hex: "#111112", filter: "brightness(0.65) contrast(1.2)" },
      { id: "midnight-silver", name: "Gris Titanio Mate", hex: "#555A61", filter: "hue-rotate(200deg) saturate(0.3)" },
      { id: "ultra-red", name: "Rojo Rubí Metalizado", hex: "#9E0E15", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" },
      { id: "deep-blue", name: "Azul Zafiro Estelar", hex: "#10233D", filter: "sepia(0.65) hue-rotate(185deg) saturate(2)" }
    ],
    wheels: ["Ruedas Turbine de 22\"", "Ruedas Cyberstream de 20\""],
    interior: ["Configuración de 6 plazas individuales con capitanes", "Cuero vegano crema y ébano"],
    highlights: [
      "Puertas Falcon Wing con doble bisagra y radar de detección de obstáculos",
      "Parabrisas panorámico integral con el cristal continuo más grande del mundo",
      "Capacidad de remolque de hasta 2.250 kg homologada",
      "Filtro de aire de grado médico HEPA con modo de defensa contra armas biológicas",
      "Aceleración de 0 a 100 km/h en 2.6 segundos para 6 pasajeros"
    ]
  },
  {
    id: "cybertruck",
    name: "Cybertruck",
    version: "Cyberbeast Tri-Motor",
    category: "Pickup",
    badge: "Exoesqueleto de Acero",
    tagline: "Construido para cualquier planeta. Exoesqueleto de acero inoxidable ultraduro laminado en frío.",
    description: "Diseño futurista indestructible. Vidrio blindado Armor Glass, dirección electrónica por cable (Steer-by-Wire) en las cuatro ruedas y tomas de corriente bidireccionales integradas.",
    price: 495000000,
    currency: "COP",
    rangeKm: 515,
    accelerationSeconds: 2.7,
    topSpeedKm: 209,
    drive: "Tracción Cyberbeast Tri-Motor con bloqueo de diferencial",
    powerHp: 845,
    cargoVolume: "3.423 L (caja y compartimientos)",
    chargingTime: "Hasta 206 km en 15 min",
    image: "assets/images/cybertruck.jpg",
    featured: true,
    availability: "Reserva exclusiva para importación directa",
    colors: [
      { id: "raw-steel", name: "Acero Inoxidable Pulido Natural", hex: "#C0C3C8", filter: "none" },
      { id: "matte-black", name: "Envoltura Negro Satinado Mate", hex: "#1A1A1B", filter: "brightness(0.6) contrast(1.3)" },
      { id: "satin-stealth", name: "Gris Fantasma Blindado", hex: "#3A3D42", filter: "brightness(0.8) contrast(1.1)" }
    ],
    wheels: ["Ruedas Cyber de 20\" con cubiertas todoterreno"],
    interior: ["Habitáculo táctico minimalista con pantalla táctil de 18.5\""],
    highlights: [
      "Exoesqueleto de acero inoxidable Serie 30X ultra resistente a abolladuras",
      "Dirección electrónica en las cuatro ruedas con radio de giro menor al de un sedán",
      "Toma de corriente a bordo PowerShare (120V y 240V) de hasta 11.5 kW",
      "Cubierta motorizada de caja resistente al peso de una persona",
      "Suspensión neumática activa con hasta 43 cm de despeje al suelo"
    ]
  }
];

const EXPERIENCE_PILLARS = [
  {
    icon: "battery",
    title: "Autonomía y Carga",
    subtitle: "Libertad total en ruta",
    description: "Viaja con tranquilidad gracias a autonomías reales de hasta 629 km y compatibilidad con la red de recarga rápida que añade hasta 300 km en solo 15 minutos."
  },
  {
    icon: "shield",
    title: "Seguridad de 5 Estrellas",
    subtitle: "Protección integral",
    description: "Estructura de absorción de impactos reforzada, centro de gravedad ultrabajo por la posición de la batería y sistema de seguridad activa con evasión de obstáculos."
  },
  {
    icon: "cpu",
    title: "Piloto Automático y Visión",
    subtitle: "Inteligencia artificial",
    description: "Cámaras ópticas de 360 grados y procesadores de red neuronal capaces de detectar peatones, vehículos y ciclistas a cientos de metros en cualquier condición climática."
  },
  {
    icon: "zap",
    title: "Cero Emisiones, Máximo Par",
    subtitle: "Respuesta instantánea",
    description: "Par motor inmediato desde cero revoluciones. Sin cambios de marcha ni demoras, ofreciendo aceleraciones incomparables con el menor costo de mantenimiento por kilómetro."
  }
];

const FAQS_DATA = [
  {
    q: "¿Cuánto cuesta un carro Tesla en Colombia en pesos (COP)?",
    a: "Los precios referenciales demostrativos para Colombia inician desde $198.000.000 COP para el Model 3 Long Range AWD, $235.000.000 COP para el Model Y Performance AWD, $430.000.000 COP para el Model S Plaid Tri-Motor, $475.000.000 COP para el Model X Plaid y $495.000.000 COP para Cybertruck Cyberbeast."
  },
  {
    q: "¿Cuál es la autonomía de los vehículos Tesla en Colombia?",
    a: "La autonomía WLTP según el modelo es: Model 3 hasta 629 km, Model Y hasta 533 km, Model S Plaid hasta 600 km, Model X hasta 543 km y Cybertruck hasta 515 km con una sola carga completa."
  },
  {
    q: "¿Cómo se recarga un vehículo eléctrico en Colombia?",
    a: "Puedes recargarlo cómodamente en casa conectándolo a una toma de corriente convencional o instalando un Wall Connector de 220V que recarga la batería durante la noche (6 a 8 horas). Además, Colombia cuenta con una red creciente de cargadores rápidos públicos en las principales ciudades y corredores viales que recuperan hasta 300 km en 15 minutos."
  },
  {
    q: "¿Los vehículos Tesla tienen pico y placa o pagan impuestos en Colombia?",
    a: "En Colombia, según la Ley 1964 de 2019 de Movilidad Eléctrica, los vehículos 100% eléctricos están totalmente exentos de la restricción vehicular de Pico y Placa en Bogotá, Medellín, Cali y principales ciudades, además de contar con tarifas tributarias reducidas y aranceles preferenciales de importación."
  },
  {
    q: "¿Cómo funciona la compra con el paquete de papeles legales al día?",
    a: "La cotización formal permite incluir un paquete legal integral que comprende matrícula inicial ante el RUNT, SOAT vigente, impuesto departamental del año y trámite de placas metálicas para entrega inmediata listo para rodar."
  },
  {
    q: "¿Qué mantenimiento requiere un vehículo eléctrico?",
    a: "A diferencia de los vehículos de combustión, un vehículo eléctrico no requiere cambios de aceite, bujías, filtros de combustible ni correas de distribución. El mantenimiento preventivo se centra en rotación de neumáticos, líquido de frenos y reemplazo de filtros de cabina HEPA, reduciendo los costos de servicio hasta en un 70%."
  },
  {
    q: "¿Cómo funciona el simulador de financiación y cuotas mensuales?",
    a: "El simulador utiliza la fórmula financiera estándar de amortización fija mensual para calcular una cuota orientativa con base en el precio seleccionado, tu cuota inicial y el plazo deseado. Dicho cálculo tiene carácter netamente informativo y no constituye una aprobación formal de crédito."
  },
  {
    q: "¿Qué beneficios tributarios y legales tienen los autos eléctricos en Colombia?",
    a: "De acuerdo con la Ley 1964 de 2019 de Movilidad Eléctrica, los vehículos 100% eléctricos en Colombia gozan de un IVA reducido del 5% (frente al 19% estándar), impuesto vehicular anual con tope máximo del 1% del valor comercial, descuento del 10% en la tarifa del SOAT, exención arancelaria del 0% de importación (Decreto 1116) y exención permanente total de la restricción de Pico y Placa sin costo adicional."
  },
  {
    q: "¿Dónde están ubicados los puntos de carga rápida Tesla y estaciones públicas en Colombia?",
    a: "Colombia cuenta con una red de más de 200 puntos de recarga públicos y electrolineras activas en Bogotá (Zona Rosa, Usaquén, Chía), Medellín (El Poblado, Llanogrande), Cali y los principales corredores viales nacionales. Asimismo, cada vehículo incluye adaptador de carga Tipo 1 (J1772) y compatibilidad con cargadores Wall Connector residenciales de 220V para carga nocturna."
  }
];

const WHEELS_DETAILED_DATA = {
  "model-3": [
    {
      id: "photon-18",
      name: "Ruedas Photon de 18\"",
      diameter: "18 pulgadas (45.7 cm)",
      tire: "Michelin e-Primacy 235/45 R18 con espuma acústica",
      brakes: "Pinzas Flotantes de Alto Rendimiento",
      aero: "+25 km de Autonomía Extra",
      description: "Tapacubos aerodinámicos optimizados mediante túnel de viento virtual para reducir la resistencia al avance y elevar la autonomía.",
      spokesCount: 7,
      color: "#2a2b2e"
    },
    {
      id: "nova-19",
      name: "Ruedas Nova de 19\"",
      diameter: "19 pulgadas (48.3 cm)",
      tire: "Continental ProContact RX 235/40 R19",
      brakes: "Frenos Deportivos Asistidos",
      aero: "+10 km de Eficiencia Dinámica",
      description: "Diseño de aleación deportiva bi-tono con acabado pulido al diamante y aspas en corte direccional.",
      spokesCount: 10,
      color: "#4a4d52"
    }
  ],
  "model-y": [
    {
      id: "uberturbine-21",
      name: "Ruedas Uberturbine de 21\"",
      diameter: "21 pulgadas (53.3 cm)",
      tire: "Pirelli P Zero Elect 255/35 R21 Del / 275/35 R21 Tras",
      brakes: "Pinzas Monobloque Rojas Performance",
      aero: "+15 km y agarre lateral de 1.1G",
      description: "Forjadas con diseño en turbina que extrae activamente el calor del conjunto de frenos en conducción exigente.",
      spokesCount: 14,
      color: "#1f2022"
    },
    {
      id: "gemini-19",
      name: "Ruedas Gemini Oscuras de 19\"",
      diameter: "19 pulgadas (48.3 cm)",
      tire: "Hankook Ventus S1 evo3 EV 255/45 R19",
      brakes: "Frenos Regenerativos Dual Motor",
      aero: "+32 km de Autonomía Máxima",
      description: "Cubiertas modulares aerodinámicas en color gris antracita oscuro de bajo rozamiento para viajes largos.",
      spokesCount: 5,
      color: "#383a3f"
    }
  ],
  "model-s": [
    {
      id: "arachnid-21",
      name: "Ruedas Arachnid de 21\"",
      diameter: "21 pulgadas (53.3 cm)",
      tire: "Michelin Pilot Sport 4S Plaid Spec 265/35ZR21 / 295/30ZR21",
      brakes: "Frenos Carbocerámicos Plaid con Pinzas Rojas de 6 Pistones",
      aero: "Disipación Térmica de hasta 800°C",
      description: "Aleación ultraligera forjada con tecnología de competición aeroespacial para soportar más de 1.020 CV.",
      spokesCount: 10,
      color: "#18191a"
    },
    {
      id: "tempest-19",
      name: "Ruedas Tempest de 19\"",
      diameter: "19 pulgadas (48.3 cm)",
      tire: "Pirelli Cinturato P7 Elect 255/45 R19",
      brakes: "Pinzas Brembo Monobloque Plaid",
      aero: "+40 km de Alcance en Autopista",
      description: "Diseño de inserciones oscuras desarrollado para conseguir el récord de coeficiente aerodinámico de 0.208 Cd.",
      spokesCount: 5,
      color: "#2c2e33"
    }
  ],
  "model-x": [
    {
      id: "turbine-22",
      name: "Ruedas Turbine de 22\"",
      diameter: "22 pulgadas (55.9 cm)",
      tire: "Continental SportContact 6 265/35 R22 Del / 285/35 R22 Tras",
      brakes: "Pinzas Ventiladas de 4 Pistones Plaid",
      aero: "Estabilidad de Crucero a Alta Velocidad",
      description: "Imponentes rines de turbina escalonada que otorgan un porte agresivo, mayor adherencia y aplomo en autopista.",
      spokesCount: 12,
      color: "#222428"
    },
    {
      id: "cyberstream-20",
      name: "Ruedas Cyberstream de 20\"",
      diameter: "20 pulgadas (50.8 cm)",
      tire: "Michelin Latitude Sport 3 255/45 R20",
      brakes: "Frenos Asistidos con Regeneración Continua",
      aero: "+28 km de Autonomía en Viajes Largos",
      description: "Perfil aerodinámico balanceado para máxima absorción de imperfecciones en terrenos irregulares.",
      spokesCount: 8,
      color: "#3f4247"
    }
  ],
  "cybertruck": [
    {
      id: "cyber-20",
      name: "Ruedas Cyber de 20\" con Cubiertas Todoterreno",
      diameter: "20 pulgadas (50.8 cm) + Neumático 35\"",
      tire: "Goodyear Wrangler Territory RT 285/65 R20 (35\" Total)",
      brakes: "Frenos de Trabajo Pesado con Discos Ventilados de 380mm",
      aero: "Cubiertas de Goma Encastrables y Tracción Todo Clima",
      description: "Neumáticos todo terreno blindados de 35 pulgadas montados sobre rines de aleación con cubiertas poliméricas aerodinámicas desmontables.",
      spokesCount: 6,
      color: "#1a1b1d"
    }
  ]
};

// Exportación universal segura para navegador (window), Node.js (global) y CommonJS
if (typeof window !== "undefined") {
  window.VEHICLES_DATA = VEHICLES_DATA;
  if (typeof WHEELS_DETAILED_DATA !== "undefined") window.WHEELS_DETAILED_DATA = WHEELS_DETAILED_DATA;
  if (typeof FAQS_DATA !== "undefined") window.FAQS_DATA = FAQS_DATA;
}
if (typeof global !== "undefined") {
  global.VEHICLES_DATA = VEHICLES_DATA;
  if (typeof WHEELS_DETAILED_DATA !== "undefined") global.WHEELS_DETAILED_DATA = WHEELS_DETAILED_DATA;
  if (typeof FAQS_DATA !== "undefined") global.FAQS_DATA = FAQS_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { 
    VEHICLES_DATA, 
    WHEELS_DETAILED_DATA: typeof WHEELS_DETAILED_DATA !== "undefined" ? WHEELS_DETAILED_DATA : {},
    FAQS_DATA: typeof FAQS_DATA !== "undefined" ? FAQS_DATA : []
  };
}
