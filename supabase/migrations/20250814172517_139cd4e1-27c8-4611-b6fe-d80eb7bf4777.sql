-- Corrigir funções sem search_path definido
CREATE OR REPLACE FUNCTION public.update_updated_at_appointments()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;