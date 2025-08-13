-- Fix the evolution config function with correct column names
CREATE OR REPLACE FUNCTION public.get_active_evolution_config(franchisee_id_param uuid)
RETURNS TABLE(id uuid, instance_name text, status text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    e.id,
    e.instance_name,
    e.status
  FROM public.evolution_api_configs e
  WHERE e.franchisee_id = franchisee_id_param
    AND e.status = 'connected'
  ORDER BY e.created_at DESC
  LIMIT 1;
$$;

-- Fix other existing functions that need search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_ai_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Trigger para processar mensagens automaticamente
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 
    NEW.email
  );
  
  -- Criar role padrão como 'customer'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;