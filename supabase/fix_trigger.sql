-- ════════════════════════════════════════════════════════════
-- FIX: Replace the trigger function with a safer version
-- Run this in Supabase SQL Editor → https://supabase.com/dashboard/project/tseigrvjogvvkuuezbvk/sql/new
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role user_role;
BEGIN
  -- Safely cast the role, default to 'salik' if invalid
  BEGIN
    _role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    _role := 'salik';
  END;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(_role, 'salik')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
