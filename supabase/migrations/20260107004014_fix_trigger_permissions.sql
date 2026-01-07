-- 1. Drop existing trigger/function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create the function with simplified, robust logic
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Determine role based on email
  IF NEW.email = 'tom.shields001@gmail.com' THEN
    assigned_role := 'super_admin'::public.user_role;
  ELSE
    assigned_role := 'driver'::public.user_role;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, assigned_role)
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER means this runs as the database owner (superuser), 
-- bypassing RLS on the profiles table during insert.

-- 3. Grant execute permission explicitly (Critical for Auth hooks)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- 4. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill missing profiles for existing users
-- This fixes the 3 users you already created who have no profiles.
INSERT INTO public.profiles (id, email, role)
SELECT 
  id, 
  email, 
  CASE 
    WHEN email = 'tom.shields001@gmail.com' THEN 'super_admin'::public.user_role 
    ELSE 'driver'::public.user_role 
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

