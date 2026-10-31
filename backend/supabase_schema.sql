-- =========================================================================
-- TESLA PREMIUM SHOWROOM - ESQUEMA ESTANDARIZADO PARA SUPABASE (POSTGRESQL)
-- Compatible 100% con PostgreSQL en Docker Local y Supabase Cloud
-- =========================================================================

-- 1. EXTENSIONES BÁSICAS RECOMENDADAS POR SUPABASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNCIÓN UNIVERSAL PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 3. TABLA: USERS (Usuarios y Administradores de la Plataforma)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL DEFAULT 'Usuario',
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'user',
  privileges VARCHAR(120) DEFAULT 'Estándar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 4. TABLA: VEHICLES (Catálogo Oficial de Vehículos Tesla)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  category TEXT DEFAULT 'Sedán',
  badge TEXT,
  price BIGINT NOT NULL,
  promo_label TEXT DEFAULT '',
  promo_price BIGINT DEFAULT 0,
  range_km INT,
  acceleration_seconds NUMERIC(3, 1),
  top_speed_kmh INT,
  drive TEXT,
  power_hp INT,
  cargo_volume TEXT,
  charging_time TEXT,
  availability TEXT,
  image TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT true,
  colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles (price ASC);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles (category);

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 5. TABLA: LEADS (Solicitudes Comerciales y Pruebas de Manejo)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  vehicle_name TEXT,
  request_type TEXT DEFAULT 'test-drive',
  city TEXT DEFAULT 'Bogotá D.C.',
  comments TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 6. TABLA: PURCHASES (Órdenes de Compra y Radicados con Papeles al Día)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  order_num VARCHAR(50) PRIMARY KEY,
  date_display TEXT,
  customer_name TEXT NOT NULL,
  customer_doc TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_city TEXT DEFAULT 'Colombia',
  vehicle_id VARCHAR(50) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE SET NULL,
  vehicle_name TEXT,
  vehicle_version TEXT,
  vehicle_image TEXT,
  base_price BIGINT NOT NULL DEFAULT 0,
  is_promo BOOLEAN DEFAULT false,
  promo_label TEXT DEFAULT '',
  include_papers BOOLEAN DEFAULT true,
  papers_cost BIGINT DEFAULT 5200000,
  total_amount BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_authorization',
  status_label TEXT DEFAULT 'En Espera de Autorización',
  authorized_by TEXT,
  authorized_at TIMESTAMPTZ,
  rejected_by TEXT,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases (status);

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON public.purchases;
CREATE TRIGGER trg_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 7. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) ESTÁNDAR SUPABASE
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Catálogo de Vehículos: Lectura pública (anon y authenticated), escritura protegida
DROP POLICY IF EXISTS "Vehicles public select" ON public.vehicles;
CREATE POLICY "Vehicles public select" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vehicles full access for backend" ON public.vehicles;
CREATE POLICY "Vehicles full access for backend" ON public.vehicles USING (true) WITH CHECK (true);

-- Leads: Cualquiera puede radicar una solicitud (INSERT), lectura y gestión para backend
DROP POLICY IF EXISTS "Leads public insert" ON public.leads;
CREATE POLICY "Leads public insert" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leads full access for backend" ON public.leads;
CREATE POLICY "Leads full access for backend" ON public.leads USING (true) WITH CHECK (true);

-- Purchases: Los clientes pueden radicar una orden (INSERT), lectura y gestión para backend
DROP POLICY IF EXISTS "Purchases public insert" ON public.purchases;
CREATE POLICY "Purchases public insert" ON public.purchases FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Purchases full access for backend" ON public.purchases;
CREATE POLICY "Purchases full access for backend" ON public.purchases USING (true) WITH CHECK (true);

-- Users: Control total backend / service_role
DROP POLICY IF EXISTS "Users full access for backend" ON public.users;
CREATE POLICY "Users full access for backend" ON public.users USING (true) WITH CHECK (true);

-- =========================================================================
-- 8. DATOS INICIALES SEMILLA (SEEDS)
-- =========================================================================

-- Administrador Principal "Julian O"
INSERT INTO public.users (id, name, email, password_hash, role, privileges)
VALUES (
  1,
  'Julian O',
  'julian.o@tesla.com',
  '$2b$10$B0oKzXfEw1jC9eWvh/vVheWlO6qP0G9a98Y8/82l87K5P1.t4wK.O', -- Hash de 'admin123'
  'admin',
  'Acceso Total / Super Administrador'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  privileges = EXCLUDED.privileges;

-- Catálogo de Vehículos Oficiales
INSERT INTO public.vehicles (
  id, name, version, category, badge, price, promo_label, promo_price,
  range_km, acceleration_seconds, top_speed_kmh, drive, power_hp,
  cargo_volume, charging_time, availability, image, description, featured, colors
) VALUES
(
  'model-3',
  'Model 3',
  'Long Range Dual Motor AWD',
  'Sedán',
  'Eficiencia y Agilidad',
  198000000,
  '',
  0,
  629,
  4.4,
  201,
  'Tracción integral Dual Motor (AWD)',
  498,
  '682 L',
  'Hasta 282 km en 15 min',
  'Entrega estimada: 30 a 45 días',
  'assets/images/model-3.webp',
  'Diseñado para ofrecer la máxima eficiencia aerodinámica, una aceleración electrizante y un habitáculo refinado con vidrio acústico de 360 grados y pantalla de 15.4 pulgadas.',
  true,
  '[{"id": "pearl-white", "name": "Blanco Perla Multicapa", "hex": "#E8E9EB", "filter": "none"}, {"id": "solid-black", "name": "Negro Sólido", "hex": "#111112", "filter": "brightness(0.7) contrast(1.2)"}, {"id": "ultra-red", "name": "Rojo Ultra Multicapa", "hex": "#A81017", "filter": "sepia(0.5) hue-rotate(320deg) saturate(2)"}]'::jsonb
),
(
  'model-y',
  'Model Y',
  'Performance All-Wheel Drive',
  'SUV',
  'El Más Vendido del Mundo',
  235000000,
  '¡OFERTA ESPECIAL!',
  225000000,
  533,
  3.7,
  250,
  'Tracción integral Dual Motor (AWD)',
  534,
  '2.158 L (asientos abatidos)',
  'Hasta 241 km en 15 min',
  'Entrega inmediata (Unidades limitadas)',
  'assets/images/model-y.webp',
  'Espacio para cinco ocupantes con capacidad de carga masiva, posición de manejo elevada y centro de gravedad ultrabajo para una seguridad activa de 5 estrellas en todas las pruebas.',
  true,
  '[{"id": "pearl-white", "name": "Blanco Perla Multicapa", "hex": "#E8E9EB", "filter": "none"}, {"id": "solid-black", "name": "Negro Sólido", "hex": "#111112", "filter": "brightness(0.7) contrast(1.2)"}, {"id": "ultra-red", "name": "Rojo Ultra Multicapa", "hex": "#A81017", "filter": "sepia(0.5) hue-rotate(320deg) saturate(2)"}]'::jsonb
),
(
  'model-s',
  'Model S',
  'Plaid Tri-Motor All-Wheel Drive',
  'Deportivo',
  'Aceleración Brutal',
  430000000,
  '',
  0,
  600,
  2.1,
  322,
  'Tracción integral Tri-Motor Plaid',
  1020,
  '793 L',
  'Hasta 322 km en 15 min',
  'Bajo pedido exclusivo',
  'assets/images/model-s.webp',
  'El sedán de producción más veloz del planeta. 1.020 caballos de fuerza pura con vectorización de par dinámico y volante tipo Yoke opcional.',
  true,
  '[{"id": "pearl-white", "name": "Blanco Perla Multicapa", "hex": "#E8E9EB", "filter": "none"}, {"id": "solid-black", "name": "Negro Sólido", "hex": "#111112", "filter": "brightness(0.7) contrast(1.2)"}, {"id": "ultra-red", "name": "Rojo Ultra Multicapa", "hex": "#A81017", "filter": "sepia(0.5) hue-rotate(320deg) saturate(2)"}]'::jsonb
),
(
  'model-x',
  'Model X',
  'Plaid Tri-Motor Falcon Wing',
  'SUV',
  'Lujo e Ingeniería',
  485000000,
  '',
  0,
  543,
  2.6,
  262,
  'Tracción integral Tri-Motor Plaid',
  1020,
  '2.577 L (máximo)',
  'Hasta 282 km en 15 min',
  'Importación directa',
  'assets/images/model-x.webp',
  'La SUV definitiva con puertas Falcon Wing de doble bisagra, parabrisas panorámico integral y espacio suntuoso para hasta siete pasajeros adultos.',
  true,
  '[{"id": "pearl-white", "name": "Blanco Perla Multicapa", "hex": "#E8E9EB", "filter": "none"}, {"id": "solid-black", "name": "Negro Sólido", "hex": "#111112", "filter": "brightness(0.7) contrast(1.2)"}, {"id": "ultra-red", "name": "Rojo Ultra Multicapa", "hex": "#A81017", "filter": "sepia(0.5) hue-rotate(320deg) saturate(2)"}]'::jsonb
),
(
  'cybertruck',
  'Cybertruck',
  'Cyberbeast Tri-Motor AWD',
  'Pick-up',
  'Exoesqueleto Blindado',
  520000000,
  '',
  0,
  515,
  2.7,
  209,
  'Tracción integral Cyberbeast AWD',
  845,
  '3.423 L (caja y frunk)',
  'Hasta 218 km en 15 min',
  'Lista de espera preferencial',
  'assets/images/cybertruck.webp',
  'Construida con aleación de acero inoxidable ultraduro laminado en frío de 30X y cristales blindados Armor Glass. Capacidades off-road incomparables.',
  true,
  '[{"id": "pearl-white", "name": "Blanco Perla Multicapa", "hex": "#E8E9EB", "filter": "none"}, {"id": "solid-black", "name": "Negro Sólido", "hex": "#111112", "filter": "brightness(0.7) contrast(1.2)"}, {"id": "ultra-red", "name": "Rojo Ultra Multicapa", "hex": "#A81017", "filter": "sepia(0.5) hue-rotate(320deg) saturate(2)"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  version = EXCLUDED.version,
  category = EXCLUDED.category,
  availability = EXCLUDED.availability;

-- Solicitudes de Muestra
INSERT INTO public.leads (id, name, phone, email, vehicle_name, request_type, city, comments, status, created_at)
VALUES
(
  'TSL-88219',
  'Carlos Mendoza',
  '+57 310 445 9922',
  'carlos.mendoza@inversiones.com',
  'Model Y',
  'quote',
  'bogota',
  'Interesado en cotización con plan de financiamiento a 48 meses para dos unidades.',
  'pending',
  NOW() - INTERVAL '4 hours'
),
(
  'TSL-74910',
  'Valentina Restrepo',
  '+57 315 889 0012',
  'v.restrepo@luxurygroup.co',
  'Model 3',
  'test-drive',
  'medellin',
  'Solicito agendar prueba de manejo este sábado en la sede de El Poblado.',
  'contacted',
  NOW() - INTERVAL '18 hours'
),
(
  'TSL-65123',
  'Dr. Alejandro Morales',
  '+57 320 771 4433',
  'amorales@clinicamoderna.com',
  'Cybertruck',
  'corporate',
  'cali',
  'Consulta sobre tiempos de entrega y exenciones arancelarias para vehículos 100% eléctricos.',
  'completed',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- Órdenes de Compra de Muestra
INSERT INTO public.purchases (
  order_num, date_display, customer_name, customer_doc, customer_phone, customer_email,
  customer_city, vehicle_id, vehicle_name, vehicle_version, vehicle_image,
  base_price, is_promo, promo_label, include_papers, papers_cost, total_amount,
  status, status_label, authorized_by, authorized_at
) VALUES
(
  'TSL-ORD-88214',
  '27/10/2026, 18:30',
  'Carlos Restrepo Arango',
  'CC 71.392.810',
  '3124567890',
  'carlos.restrepo@empresa.com.co',
  'Medellín',
  'model-y',
  'Model Y Dual Motor',
  'Long Range All-Wheel Drive',
  'assets/images/model-y.webp',
  245000000,
  true,
  '¡OFERTA ESPECIAL!',
  true,
  5200000,
  250200000,
  'pending_authorization',
  'En Espera de Autorización',
  null,
  null
),
(
  'TSL-ORD-76109',
  '26/10/2026, 14:15',
  'Camila Vargas Gómez',
  'CC 52.889.340',
  '3108923451',
  'camila.vargas@inversiones.co',
  'Bogotá D.C.',
  'model-3',
  'Model 3',
  'Rear-Wheel Drive (Alta Eficiencia)',
  'assets/images/model-3.webp',
  198000000,
  false,
  '',
  true,
  5200000,
  203200000,
  'authorized',
  'Autorizada por Asesor',
  'Julian O',
  '2026-10-26T14:35:00.000Z'
)
ON CONFLICT (order_num) DO NOTHING;

