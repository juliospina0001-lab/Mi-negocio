-- =========================================================================
-- TESLA SHOWROOM - EXTENSIÓN SUPABASE AUTH & POLÍTICAS RLS (PROFILES)
-- =========================================================================

-- 1. TABLA PÚBLICA DE PERFILES VINCULADA A auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL DEFAULT 'Usuario Tesla',
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'user', -- 'admin' o 'user'
  phone VARCHAR(50) DEFAULT '',
  city VARCHAR(100) DEFAULT 'Bogotá D.C.',
  preferred_model VARCHAR(50) DEFAULT 'model-3',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. DISPARADOR DE ACTUALIZACIÓN DE TIMESTAMP
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. FUNCIÓN Y TRIGGER PARA SINCRONIZACIÓN AUTOMÁTICA AL REGISTRARSE EN auth.users
-- Nota de seguridad: Lee el rol desde raw_app_meta_data para evitar manipulación de cliente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone, city, preferred_model)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario Tesla'),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Bogotá D.C.'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_model', 'model-3')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. HABILITAR ROW LEVEL SECURITY (RLS) EN PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden ver su propio perfil
DROP POLICY IF EXISTS "Profiles view own" ON public.profiles;
CREATE POLICY "Profiles view own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- Los usuarios pueden editar únicamente su propio perfil
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Los administradores pueden consultar todos los perfiles de usuarios
DROP POLICY IF EXISTS "Profiles admin view all" ON public.profiles;
CREATE POLICY "Profiles admin view all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5. AGREGAR COLUMNA user_id EN PURCHASES Y LEADS PARA ENLACE CON auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.purchases ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. POLÍTICAS RLS PROTEGIDAS PARA PURCHASES Y LEADS CON BASE EN auth.uid()
-- Compras: El usuario propietario o el administrador pueden ver la orden
DROP POLICY IF EXISTS "Purchases user or admin view" ON public.purchases;
CREATE POLICY "Purchases user or admin view"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Compras: Solo administradores pueden autorizar o rechazar (UPDATE)
DROP POLICY IF EXISTS "Purchases admin update" ON public.purchases;
CREATE POLICY "Purchases admin update"
  ON public.purchases FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Leads: El usuario propietario o el administrador pueden ver las solicitudes
DROP POLICY IF EXISTS "Leads user or admin view" ON public.leads;
CREATE POLICY "Leads user or admin view"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

