-- Change default user role from 'customer' to 'franchisee'
-- Update the handle_new_user function to assign 'franchisee' role by default

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Criar perfil do usuário
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 
    NEW.email
  );
  
  -- Criar role padrão como 'franchisee' ao invés de 'customer'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'franchisee');
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();