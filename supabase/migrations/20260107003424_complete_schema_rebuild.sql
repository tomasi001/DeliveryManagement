-- NUCLEAR RESET (Start Fresh)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Restore standard permissions for the public schema
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 1. ENUMS
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'driver');
CREATE TYPE public.session_status AS ENUM ('active', 'ready_for_pickup', 'archived');
CREATE TYPE public.artwork_status AS ENUM ('in_stock', 'in_truck', 'delivered', 'returned');

-- 2. TABLES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role public.user_role DEFAULT 'driver'::public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  address TEXT NOT NULL,
  status public.session_status DEFAULT 'active'::public.session_status NOT NULL
);

CREATE TABLE public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  wac_code TEXT NOT NULL,
  artist TEXT,
  title TEXT,
  dimensions TEXT,
  status public.artwork_status DEFAULT 'in_stock'::public.artwork_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ESSENTIAL GRANTS (The missing link in previous attempts)
-- RLS policies only filter rows; they don't grant table access. We must explicit grant usage.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sessions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.artworks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.artworks TO service_role;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
-- Any authenticated user can read any profile (needed for role checks)
CREATE POLICY "Enable read access for all authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile
CREATE POLICY "Enable update for users based on email"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- POLICIES: SESSIONS
-- Authenticated users (Admins/Drivers) can see all sessions
CREATE POLICY "Enable read access for all authenticated users"
ON public.sessions FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert/update sessions
CREATE POLICY "Enable write access for authenticated users"
ON public.sessions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON public.sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- POLICIES: ARTWORKS
-- Authenticated users can see all artworks
CREATE POLICY "Enable read access for all authenticated users"
ON public.artworks FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert/update artworks
CREATE POLICY "Enable write access for authenticated users"
ON public.artworks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON public.artworks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 5. TRIGGER (The Bridge)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, 'unknown@example.com'), 
    CASE 
      WHEN NEW.email = 'tom.shields001@gmail.com' THEN 'super_admin'::public.user_role
      ELSE 'driver'::public.user_role
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

