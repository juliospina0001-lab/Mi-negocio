require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Servir frontend completo y estáticos
app.use(express.static(path.join(__dirname, '..')));

// Ruta oficial solicitada para la consola administrativa
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Prevención de caídas del servidor por excepciones no controladas
process.on('uncaughtException', (err) => {
  console.error('🛡️ [Servidor Protegido] Excepción interceptada con seguridad:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.warn('🛡️ [Servidor Protegido] Promesa rechazada interceptada:', reason);
});

// Configuración y persistencia en disco (JSON local en /backend/data)
const dataDir = path.join(__dirname, 'data');
const vehiclesFile = path.join(dataDir, 'vehicles.json');
const leadsFile = path.join(dataDir, 'leads.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadVehiclesFromFile() {
  try {
    ensureDataDir();
    if (fs.existsSync(vehiclesFile)) {
      const content = fs.readFileSync(vehiclesFile, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (err) {
    console.warn('⚠️ Error al leer vehicles.json local:', err.message);
  }
  return null;
}

function saveVehiclesToFile(list) {
  try {
    ensureDataDir();
    fs.writeFileSync(vehiclesFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Error al escribir vehicles.json local:', err.message);
  }
}

function loadLeadsFromFile() {
  try {
    ensureDataDir();
    if (fs.existsSync(leadsFile)) {
      const content = fs.readFileSync(leadsFile, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.warn('⚠️ Error al leer leads.json local:', err.message);
  }
  return null;
}

function saveLeadsToFile(list) {
  try {
    ensureDataDir();
    fs.writeFileSync(leadsFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Error al escribir leads.json local:', err.message);
  }
}

const purchasesFile = path.join(dataDir, 'purchases.json');

function loadPurchasesFromFile() {
  try {
    ensureDataDir();
    if (fs.existsSync(purchasesFile)) {
      const content = fs.readFileSync(purchasesFile, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.warn('⚠️ Error al leer purchases.json local:', err.message);
  }
  return null;
}

function savePurchasesToFile(list) {
  try {
    ensureDataDir();
    fs.writeFileSync(purchasesFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Error al escribir purchases.json local:', err.message);
  }
}

// Configuración Pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'mi_negocio',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'securepassword',
  connectionTimeoutMillis: 3000,
});

// Manejador del pool para evitar que errores en clientes o desconexiones tiren el servidor Node
pool.on('error', (err) => {
  console.warn('⚠️ [PostgreSQL Pool] Evento de desconexión o cliente inactivo (el backend continúa en modo archivo local):', err.message);
  isDbConnected = false;
});

let isDbConnected = false;

// Datos de fallback en memoria sincronizados con VEHICLES_DATA del frontend
let memoryVehicles = [
  {
    id: "model-3",
    name: "Model 3",
    version: "Long Range Dual Motor AWD",
    category: "Sedán",
    badge: "Eficiencia y Agilidad",
    price: 198000000,
    range_km: 629,
    acceleration_seconds: 4.4,
    top_speed_kmh: 201,
    drive: "Tracción integral Dual Motor (AWD)",
    power_hp: 498,
    cargo_volume: "682 L",
    charging_time: "Hasta 282 km en 15 min",
    availability: "Entrega estimada: 30 a 45 días",
    image: "assets/images/model-3.jpg",
    description: "Diseñado para ofrecer la máxima eficiencia aerodinámica, una aceleración electrizante y un habitáculo refinado con vidrio acústico de 360 grados y pantalla de 15.4 pulgadas."
  },
  {
    id: "model-y",
    name: "Model Y",
    version: "Performance All-Wheel Drive",
    category: "SUV",
    badge: "El Más Vendido del Mundo",
    price: 235000000,
    range_km: 533,
    acceleration_seconds: 3.7,
    top_speed_kmh: 250,
    drive: "Tracción integral Dual Motor (AWD)",
    power_hp: 534,
    cargo_volume: "2.158 L (asientos abatidos)",
    charging_time: "Hasta 241 km en 15 min",
    availability: "Entrega inmediata (Unidades limitadas)",
    image: "assets/images/model-y.jpg",
    description: "Espacio para cinco ocupantes con capacidad de carga masiva, posición de manejo elevada y centro de gravedad ultrabajo para una seguridad activa de 5 estrellas en todas las pruebas."
  },
  {
    id: "model-s",
    name: "Model S",
    version: "Plaid Tri-Motor All-Wheel Drive",
    category: "Deportivo",
    badge: "Aceleración Brutal",
    price: 430000000,
    range_km: 600,
    acceleration_seconds: 2.1,
    top_speed_kmh: 322,
    drive: "Tracción integral Tri-Motor Plaid",
    power_hp: 1020,
    cargo_volume: "793 L",
    charging_time: "Hasta 322 km en 15 min",
    availability: "Bajo pedido exclusivo",
    image: "assets/images/model-s.jpg",
    description: "El sedán de producción más veloz del planeta. 1.020 caballos de fuerza pura con vectorización de par dinámico y volante tipo Yoke opcional."
  },
  {
    id: "model-x",
    name: "Model X",
    version: "Plaid Tri-Motor Falcon Wing",
    category: "SUV",
    badge: "Lujo e Ingeniería",
    price: 485000000,
    range_km: 543,
    acceleration_seconds: 2.6,
    top_speed_kmh: 262,
    drive: "Tracción integral Tri-Motor Plaid",
    power_hp: 1020,
    cargo_volume: "2.577 L (máximo)",
    charging_time: "Hasta 282 km en 15 min",
    availability: "Importación directa",
    image: "assets/images/model-x.jpg",
    description: "La SUV definitiva con puertas Falcon Wing de doble bisagra, parabrisas panorámico integral y espacio suntuoso para hasta siete pasajeros adultos."
  },
  {
    id: "cybertruck",
    name: "Cybertruck",
    version: "Cyberbeast Tri-Motor AWD",
    category: "Pick-up",
    badge: "Exoesqueleto Blindado",
    price: 520000000,
    range_km: 515,
    acceleration_seconds: 2.7,
    top_speed_kmh: 209,
    drive: "Tracción integral Cyberbeast AWD",
    power_hp: 845,
    cargo_volume: "3.423 L (caja y frunk)",
    charging_time: "Hasta 218 km en 15 min",
    availability: "Lista de espera preferencial",
    image: "assets/images/cybertruck.jpg",
    description: "Construida con aleación de acero inoxidable ultraduro laminado en frío de 30X y cristales blindados Armor Glass. Capacidades off-road incomparables."
  }
];

let memoryLeads = [
  {
    id: "TSL-88219",
    name: "Carlos Mendoza",
    phone: "+57 310 445 9922",
    email: "carlos.mendoza@inversiones.com",
    vehicle_name: "Model Y",
    request_type: "quote",
    city: "bogota",
    comments: "Interesado en cotización con plan de financiamiento a 48 meses para dos unidades.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "TSL-74910",
    name: "Valentina Restrepo",
    phone: "+57 315 889 0012",
    email: "v.restrepo@luxurygroup.co",
    vehicle_name: "Model 3",
    request_type: "test-drive",
    city: "medellin",
    comments: "Solicito agendar prueba de manejo este sábado en la sede de El Poblado.",
    status: "contacted",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "TSL-65123",
    name: "Dr. Alejandro Morales",
    phone: "+57 320 771 4433",
    email: "amorales@clinicamoderna.com",
    vehicle_name: "Cybertruck",
    request_type: "corporate",
    city: "cali",
    comments: "Consulta sobre tiempos de entrega y exenciones arancelarias para vehículos 100% eléctricos.",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

let memoryUsers = [
  {
    id: 1,
    name: process.env.ADMIN_USER_NAME || "Julian O",
    email: process.env.ADMIN_EMAIL || "julian.o@tesla.com",
    role: "admin",
    privileges: "Acceso Total / Super Administrador",
    created_at: new Date().toISOString()
  }
];

// Cargar o sembrar en disco (garantiza cero pérdida de datos aunque no esté Docker/PostgreSQL)
const loadedVehicles = loadVehiclesFromFile();
if (loadedVehicles && loadedVehicles.length > 0) {
  memoryVehicles = loadedVehicles;
  console.log(`📁 [Disco] ${memoryVehicles.length} vehículos cargados desde backend/data/vehicles.json`);
} else {
  saveVehiclesToFile(memoryVehicles);
}

const loadedLeads = loadLeadsFromFile();
if (loadedLeads && loadedLeads.length > 0) {
  memoryLeads = loadedLeads;
  console.log(`📁 [Disco] ${memoryLeads.length} solicitudes cargadas desde backend/data/leads.json`);
} else {
  saveLeadsToFile(memoryLeads);
}

let memoryPurchases = [
  {
    orderNum: "TSL-ORD-88214",
    date: "27/10/2026, 18:30",
    customerName: "Carlos Restrepo Arango",
    customerDoc: "CC 71.392.810",
    customerPhone: "3124567890",
    customerEmail: "carlos.restrepo@empresa.com.co",
    customerCity: "Medellín",
    vehicleId: "model-y",
    vehicleName: "Model Y Dual Motor",
    vehicleVersion: "Long Range All-Wheel Drive",
    vehicleImage: "assets/images/model-y.jpg",
    basePrice: 245000000,
    isPromo: true,
    promoLabel: "¡OFERTA ESPECIAL!",
    includePapers: true,
    papersCost: 5200000,
    totalAmount: 250200000,
    status: "pending_authorization",
    statusLabel: "En Espera de Autorización",
    authorizedBy: null,
    authorizedAt: null
  },
  {
    orderNum: "TSL-ORD-76109",
    date: "26/10/2026, 14:15",
    customerName: "Camila Vargas Gómez",
    customerDoc: "CC 52.889.340",
    customerPhone: "3108923451",
    customerEmail: "camila.vargas@inversiones.co",
    customerCity: "Bogotá D.C.",
    vehicleId: "model-3",
    vehicleName: "Model 3",
    vehicleVersion: "Rear-Wheel Drive (Alta Eficiencia)",
    vehicleImage: "assets/images/model-3.jpg",
    basePrice: 198000000,
    isPromo: false,
    includePapers: true,
    papersCost: 5200000,
    totalAmount: 203200000,
    status: "authorized",
    statusLabel: "Autorizada por Asesor",
    authorizedBy: "Julian O",
    authorizedAt: "2026-10-26T14:35:00.000Z"
  }
];

const loadedPurchases = loadPurchasesFromFile();
if (loadedPurchases && loadedPurchases.length > 0) {
  memoryPurchases = loadedPurchases;
  console.log(`📁 [Disco] ${memoryPurchases.length} compras cargadas desde backend/data/purchases.json`);
} else {
  savePurchasesToFile(memoryPurchases);
}

// Inicialización de la base de datos PostgreSQL
const initDb = async () => {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log('✅ Conexión exitosa a PostgreSQL en Docker');

    // Tabla de Usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL DEFAULT 'Usuario',
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        privileges VARCHAR(100) DEFAULT 'Estándar',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Vehículos
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT,
        category TEXT,
        badge TEXT,
        price BIGINT,
        range_km INT,
        acceleration_seconds NUMERIC,
        top_speed_kmh INT,
        drive TEXT,
        power_hp INT,
        cargo_volume TEXT,
        charging_time TEXT,
        availability TEXT,
        image TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Leads / Solicitudes
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        vehicle_name TEXT,
        request_type TEXT,
        city TEXT,
        comments TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sembrar Administrador "Julian O"
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [process.env.ADMIN_EMAIL || 'julian.o@tesla.com']);
    if (adminCheck.rowCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, privileges) VALUES ($1, $2, $3, $4, $5)`,
        [process.env.ADMIN_USER_NAME || 'Julian O', process.env.ADMIN_EMAIL || 'julian.o@tesla.com', passwordHash, 'admin', 'Acceso Total / Super Administrador']
      );
      console.log('👑 Administrador "Julian O" registrado en PostgreSQL con privilegios totales.');
    }

    // Sembrar Vehículos iniciales si está vacía
    const vehCheck = await client.query('SELECT COUNT(*) FROM vehicles');
    if (parseInt(vehCheck.rows[0].count, 10) === 0) {
      for (const v of memoryVehicles) {
        await client.query(`
          INSERT INTO vehicles (id, name, version, category, badge, price, range_km, acceleration_seconds, top_speed_kmh, drive, power_hp, cargo_volume, charging_time, availability, image, description)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        `, [v.id, v.name, v.version, v.category, v.badge, v.price, v.range_km, v.acceleration_seconds, v.top_speed_kmh, v.drive, v.power_hp, v.cargo_volume, v.charging_time, v.availability, v.image, v.description]);
      }
      console.log('🚗 Catálogo inicial de vehículos sembrado en PostgreSQL.');
    }

    // Sembrar Leads iniciales si está vacía
    const leadsCheck = await client.query('SELECT COUNT(*) FROM leads');
    if (parseInt(leadsCheck.rows[0].count, 10) === 0) {
      for (const l of memoryLeads) {
        await client.query(`
          INSERT INTO leads (id, name, phone, email, vehicle_name, request_type, city, comments, status, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `, [l.id, l.name, l.phone, l.email, l.vehicle_name, l.request_type, l.city, l.comments, l.status, l.created_at]);
      }
      console.log('📋 Solicitudes y leads de muestra sembrados en PostgreSQL.');
    }

    client.release();
  } catch (err) {
    isDbConnected = false;
    console.warn('⚠️ Nota PostgreSQL: No se pudo conectar a PostgreSQL en localhost:5432 todavía.');
    console.warn('El backend continuará funcionando en modo memoria/fallback sin interrupción.');
  }
};

initDb();

// ==========================================
// ENDPOINTS DE LA API
// ==========================================

// Estado del sistema y administrador activo
app.get('/api/status', async (req, res) => {
  let dbStatus = isDbConnected ? 'connected' : 'connecting';
  let totalVehicles = memoryVehicles.length;
  let totalLeads = memoryLeads.length;

  if (isDbConnected) {
    try {
      const vRes = await pool.query('SELECT COUNT(*) FROM vehicles');
      const lRes = await pool.query('SELECT COUNT(*) FROM leads');
      totalVehicles = parseInt(vRes.rows[0].count, 10);
      totalLeads = parseInt(lRes.rows[0].count, 10);
    } catch (e) {
      dbStatus = 'fallback';
    }
  }

  res.json({
    status: 'ok',
    admin: {
      name: process.env.ADMIN_USER_NAME || "Julian O",
      email: process.env.ADMIN_EMAIL || "julian.o@tesla.com",
      role: "admin",
      privileges: "Super Administrador"
    },
    database: {
      engine: 'PostgreSQL 16 (Docker)',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'mi_negocio',
      status: dbStatus
    },
    counts: {
      vehicles: totalVehicles,
      leads: totalLeads,
      users: 1
    }
  });
});

// VEHÍCULOS (GET, POST, PUT, DELETE)
app.get('/api/vehicles', async (req, res) => {
  let list = [...memoryVehicles];
  if (isDbConnected) {
    try {
      const result = await pool.query('SELECT * FROM vehicles ORDER BY price ASC');
      if (result.rows.length > 0) {
        list = result.rows;
      }
    } catch (err) {
      console.error('Error consultando vehículos en BD:', err.message);
    }
  }

  // Normalizar propiedades para que sean 100% compatibles tanto con snake_case como con camelCase
  const normalizedList = list.map(v => {
    const defaultColors = [
      { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "none" },
      { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.7) contrast(1.2)" },
      { id: "ultra-red", name: "Rojo Ultra Multicapa", hex: "#A81017", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" }
    ];

    return {
      ...v,
      id: String(v.id),
      name: v.name,
      version: v.version || "",
      category: v.category || "Sedán",
      badge: v.badge || "",
      price: Number(v.price || 0),
      promo_label: v.promo_label || v.promoLabel || "",
      promoLabel: v.promoLabel || v.promo_label || "",
      promo_price: Number(v.promo_price || v.promoPrice || 0),
      promoPrice: Number(v.promoPrice || v.promo_price || 0),
      // Autonomía
      range_km: Number(v.range_km || v.rangeKm || 500),
      rangeKm: Number(v.rangeKm || v.range_km || 500),
      // Aceleración
      acceleration_seconds: Number(v.acceleration_seconds || v.accelerationSeconds || 3.5),
      accelerationSeconds: Number(v.accelerationSeconds || v.acceleration_seconds || 3.5),
      // Velocidad máxima
      top_speed_kmh: Number(v.top_speed_kmh || v.topSpeedKm || 220),
      topSpeedKm: Number(v.topSpeedKm || v.top_speed_kmh || 220),
      // Potencia
      power_hp: Number(v.power_hp || v.powerHp || 450),
      powerHp: Number(v.powerHp || v.power_hp || 450),
      // Volúmenes y tiempos
      cargo_volume: v.cargo_volume || v.cargoVolume || "600 L",
      cargoVolume: v.cargoVolume || v.cargo_volume || "600 L",
      charging_time: v.charging_time || v.chargingTime || "Hasta 250 km en 15 min",
      chargingTime: v.chargingTime || v.charging_time || "Hasta 250 km en 15 min",
      drive: v.drive || "Tracción integral Dual Motor (AWD)",
      availability: v.availability || "Disponible para entrega",
      image: v.image || "assets/images/model-3.jpg",
      description: v.description || "",
      featured: v.featured !== undefined ? Boolean(v.featured) : true,
      colors: Array.isArray(v.colors) && v.colors.length > 0 ? v.colors : defaultColors
    };
  });

  res.json(normalizedList);
});

app.post('/api/vehicles', async (req, res) => {
  const newVeh = {
    id: req.body.id || `veh-${Date.now()}`,
    name: req.body.name || 'Nuevo Modelo Tesla',
    version: req.body.version || 'Standard Range',
    category: req.body.category || 'Sedán',
    badge: req.body.badge || 'Nuevo Ingreso',
    price: Number(req.body.price) || 200000000,
    promo_label: req.body.promo_label || req.body.promoLabel || "",
    promoLabel: req.body.promoLabel || req.body.promo_label || "",
    promo_price: Number(req.body.promo_price || req.body.promoPrice || 0),
    promoPrice: Number(req.body.promoPrice || req.body.promo_price || 0),
    range_km: Number(req.body.range_km ?? req.body.rangeKm) || 500,
    rangeKm: Number(req.body.rangeKm ?? req.body.range_km) || 500,
    acceleration_seconds: Number(req.body.acceleration_seconds ?? req.body.accelerationSeconds) || 4.0,
    accelerationSeconds: Number(req.body.accelerationSeconds ?? req.body.acceleration_seconds) || 4.0,
    top_speed_kmh: Number(req.body.top_speed_kmh ?? req.body.topSpeedKm) || 220,
    topSpeedKm: Number(req.body.topSpeedKm ?? req.body.top_speed_kmh) || 220,
    drive: req.body.drive || 'AWD',
    power_hp: Number(req.body.power_hp ?? req.body.powerHp) || 450,
    powerHp: Number(req.body.powerHp ?? req.body.power_hp) || 450,
    cargo_volume: req.body.cargo_volume || req.body.cargoVolume || '600 L',
    cargoVolume: req.body.cargoVolume || req.body.cargo_volume || '600 L',
    charging_time: req.body.charging_time || req.body.chargingTime || 'Hasta 250 km en 15 min',
    chargingTime: req.body.chargingTime || req.body.charging_time || 'Hasta 250 km en 15 min',
    availability: req.body.availability || 'Disponible para pedido',
    image: req.body.image || 'assets/images/model-3.jpg',
    description: req.body.description || 'Vehículo eléctrico de alta gama con tecnología avanzada de piloto automático y máxima seguridad.',
    featured: true,
    colors: [
      { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "none" },
      { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.7) contrast(1.2)" },
      { id: "ultra-red", name: "Rojo Ultra Multicapa", hex: "#A81017", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" }
    ]
  };

  if (isDbConnected) {
    try {
      await pool.query(`
        INSERT INTO vehicles (id, name, version, category, badge, price, range_km, acceleration_seconds, top_speed_kmh, drive, power_hp, cargo_volume, charging_time, availability, image, description)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          availability = EXCLUDED.availability
      `, [newVeh.id, newVeh.name, newVeh.version, newVeh.category, newVeh.badge, newVeh.price, newVeh.range_km, newVeh.acceleration_seconds, newVeh.top_speed_kmh, newVeh.drive, newVeh.power_hp, newVeh.cargo_volume, newVeh.charging_time, newVeh.availability, newVeh.image, newVeh.description]);
    } catch (err) {
      console.error('Error insertando vehículo en BD:', err.message);
    }
  }

  memoryVehicles.unshift(newVeh);
  saveVehiclesToFile(memoryVehicles);
  console.log(`🚗 [BACKEND] Vehículo agregado: ${newVeh.name} ($${newVeh.price})`);
  res.status(201).json({ success: true, vehicle: newVeh });
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const idx = memoryVehicles.findIndex(v => v.id === id);

  const prev = idx !== -1 ? memoryVehicles[idx] : {};
  const updatedData = {
    ...req.body,
    price: Number(req.body.price || prev.price || 0),
    range_km: Number(req.body.range_km || req.body.rangeKm || prev.range_km || prev.rangeKm || 500),
    rangeKm: Number(req.body.rangeKm || req.body.range_km || prev.rangeKm || prev.range_km || 500),
    acceleration_seconds: Number(req.body.acceleration_seconds || req.body.accelerationSeconds || prev.acceleration_seconds || prev.accelerationSeconds || 3.5),
    accelerationSeconds: Number(req.body.accelerationSeconds || req.body.acceleration_seconds || prev.accelerationSeconds || prev.acceleration_seconds || 3.5),
    top_speed_kmh: Number(req.body.top_speed_kmh || req.body.topSpeedKm || prev.top_speed_kmh || prev.topSpeedKm || 220),
    topSpeedKm: Number(req.body.topSpeedKm || req.body.top_speed_kmh || prev.topSpeedKm || prev.top_speed_kmh || 220)
  };

  if (idx !== -1) {
    memoryVehicles[idx] = { ...memoryVehicles[idx], ...updatedData };
  } else {
    memoryVehicles.push({ id, ...updatedData });
  }
  saveVehiclesToFile(memoryVehicles);

  if (isDbConnected) {
    try {
      const v = memoryVehicles.find(x => x.id === id) || updatedData;
      await pool.query(`
        UPDATE vehicles SET 
          name = COALESCE($1, name),
          version = COALESCE($2, version),
          category = COALESCE($3, category),
          badge = COALESCE($4, badge),
          price = COALESCE($5, price),
          range_km = COALESCE($6, range_km),
          acceleration_seconds = COALESCE($7, acceleration_seconds),
          top_speed_kmh = COALESCE($8, top_speed_kmh),
          availability = COALESCE($9, availability),
          description = COALESCE($10, description)
        WHERE id = $11
      `, [v.name, v.version, v.category, v.badge, v.price, v.range_km, v.acceleration_seconds, v.top_speed_kmh, v.availability, v.description, id]);
    } catch (err) {
      console.error('Error actualizando vehículo en BD:', err.message);
    }
  }

  console.log(`✏️ [BACKEND] Vehículo modificado: ID ${id} -> Precio: $${updatedData.price}`);
  res.json({ success: true, message: 'Vehículo actualizado con éxito' });
});

app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  memoryVehicles = memoryVehicles.filter(v => v.id !== id);
  saveVehiclesToFile(memoryVehicles);

  if (isDbConnected) {
    try {
      await pool.query('DELETE FROM vehicles WHERE id=$1', [id]);
    } catch (err) {
      console.error('Error eliminando de BD:', err.message);
    }
  }

  console.log(`🗑️ [BACKEND] Vehículo eliminado: ID ${id}`);
  res.json({ success: true, message: 'Vehículo eliminado con éxito' });
});

// LEADS / SOLICITUDES (GET, POST, PUT, DELETE)
app.get('/api/leads', async (req, res) => {
  if (isDbConnected) {
    try {
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
    }
  }
  res.json(memoryLeads);
});

app.post('/api/leads', async (req, res) => {
  const newLead = {
    id: `TSL-${Math.floor(10000 + Math.random() * 90000)}`,
    name: req.body.name || 'Cliente Demostrativo',
    phone: req.body.phone || '',
    email: req.body.email || '',
    vehicle_name: req.body.vehicle_name || req.body.vehicleId || 'Tesla',
    request_type: req.body.request_type || 'test-drive',
    city: req.body.city || 'Bogotá D.C.',
    comments: req.body.comments || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (isDbConnected) {
    try {
      await pool.query(`
        INSERT INTO leads (id, name, phone, email, vehicle_name, request_type, city, comments, status, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `, [newLead.id, newLead.name, newLead.phone, newLead.email, newLead.vehicle_name, newLead.request_type, newLead.city, newLead.comments, newLead.status, newLead.created_at]);
    } catch (err) {
      console.error(err);
    }
  }

  memoryLeads.unshift(newLead);
  saveLeadsToFile(memoryLeads);
  res.status(201).json({ success: true, lead: newLead });
});

app.put('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const lead = memoryLeads.find(l => l.id === id);
  if (lead) lead.status = status;
  saveLeadsToFile(memoryLeads);

  if (isDbConnected) {
    try {
      await pool.query('UPDATE leads SET status=$1 WHERE id=$2', [status, id]);
    } catch (err) {
      console.error(err);
    }
  }

  res.json({ success: true, message: 'Estado del lead actualizado' });
});

app.delete('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  memoryLeads = memoryLeads.filter(l => l.id !== id);
  saveLeadsToFile(memoryLeads);

  if (isDbConnected) {
    try {
      await pool.query('DELETE FROM leads WHERE id=$1', [id]);
    } catch (err) {
      console.error(err);
    }
  }

  res.json({ success: true, message: 'Lead eliminado' });
});

// COMPRAS / ÓRDENES DE VEHÍCULOS (AUTORIZACIÓN ADMINISTRATIVA)
app.get('/api/purchases', (req, res) => {
  res.json(memoryPurchases);
});

app.post('/api/purchases', (req, res) => {
  const newOrder = {
    orderNum: req.body.orderNum || `TSL-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    date: req.body.date || new Date().toLocaleString('es-CO'),
    customerName: req.body.customerName || 'Cliente Comprador',
    customerDoc: req.body.customerDoc || '',
    customerPhone: req.body.customerPhone || '',
    customerEmail: req.body.customerEmail || '',
    customerCity: req.body.customerCity || 'Colombia',
    vehicleId: req.body.vehicleId || 'model-y',
    vehicleName: req.body.vehicleName || 'Tesla',
    vehicleVersion: req.body.vehicleVersion || '',
    vehicleImage: req.body.vehicleImage || 'assets/images/model-y.jpg',
    basePrice: Number(req.body.basePrice) || 0,
    isPromo: Boolean(req.body.isPromo),
    promoLabel: req.body.promoLabel || '',
    includePapers: Boolean(req.body.includePapers),
    papersCost: Number(req.body.papersCost) || 0,
    totalAmount: Number(req.body.totalAmount) || 0,
    status: req.body.status || 'pending_authorization',
    statusLabel: req.body.statusLabel || 'En Espera de Autorización',
    authorizedBy: req.body.authorizedBy || null,
    authorizedAt: req.body.authorizedAt || null
  };

  memoryPurchases.unshift(newOrder);
  savePurchasesToFile(memoryPurchases);
  console.log(`🛒 [BACKEND] Nueva orden de compra radicada: ${newOrder.orderNum} (${newOrder.customerName})`);
  res.status(201).json({ success: true, order: newOrder });
});

app.put('/api/purchases/:id/authorize', (req, res) => {
  const { id } = req.params;
  const order = memoryPurchases.find(p => p.orderNum === id);
  if (order) {
    order.status = 'authorized';
    order.statusLabel = 'Autorizada por Asesor de Administración';
    order.authorizedBy = req.body.authorizedBy || 'Julian O (Super Admin)';
    order.authorizedAt = new Date().toISOString();
    savePurchasesToFile(memoryPurchases);
    console.log(`✅ [BACKEND] Orden de compra ${id} autorizada por ${order.authorizedBy}`);
    return res.json({ success: true, order });
  }
  res.status(404).json({ success: false, message: 'Orden no encontrada' });
});

app.put('/api/purchases/:id/reject', (req, res) => {
  const { id } = req.params;
  const order = memoryPurchases.find(p => p.orderNum === id);
  if (order) {
    order.status = 'rejected';
    order.statusLabel = 'Rechazada por Administración';
    order.rejectedBy = req.body.rejectedBy || 'Julian O (Super Admin)';
    order.rejectedAt = new Date().toISOString();
    order.rejectedReason = req.body.rejectedReason || 'No cumple con los requisitos administrativos';
    savePurchasesToFile(memoryPurchases);
    console.log(`❌ [BACKEND] Orden de compra ${id} rechazada por ${order.rejectedBy}`);
    return res.json({ success: true, order });
  }
  res.status(404).json({ success: false, message: 'Orden no encontrada' });
});

app.delete('/api/purchases/:id', (req, res) => {
  const { id } = req.params;
  memoryPurchases = memoryPurchases.filter(p => p.orderNum !== id);
  savePurchasesToFile(memoryPurchases);
  res.json({ success: true, message: 'Orden eliminada' });
});

// USUARIOS
app.get('/api/users', (req, res) => {
  res.json(memoryUsers);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SERVIDOR TESLA PREMIUM SHOWROOM ACTIVO`);
  console.log(`🌐 Sitio Web Principal:  http://localhost:${port}/`);
  console.log(`👑 Consola Administrativa: http://localhost:${port}/admin`);
  console.log(`👤 Usuario Administrador:  ${process.env.ADMIN_USER_NAME || "Julian O"}`);
  console.log(`🐘 Base de datos:        PostgreSQL en Docker (puerto ${process.env.DB_PORT || 5432})`);
  console.log(`======================================================\n`);
});
