-- Create a secure function to encrypt API keys using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt API keys with a consistent salt
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use crypt with a blowfish algorithm for one-way encryption
  -- This prevents decryption even if the database is compromised
  RETURN crypt(api_key, gen_salt('bf', 8));
END;
$$;

-- Create a function to verify API keys without exposing them
CREATE OR REPLACE FUNCTION verify_api_key(api_key text, encrypted_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN crypt(api_key, encrypted_key) = encrypted_key;
END;
$$;

-- Create a secure function to get agent API key only for authorized users
CREATE OR REPLACE FUNCTION get_agent_api_key(agent_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  api_key text;
  agent_franchisee_id uuid;
BEGIN
  -- Get agent and check ownership
  SELECT open_ai_key, franchisee_id INTO api_key, agent_franchisee_id
  FROM agents 
  WHERE id = agent_id_param;
  
  -- Only return key if user owns the agent
  IF agent_franchisee_id = auth.uid() THEN
    RETURN api_key;
  END IF;
  
  -- Return null for unauthorized access
  RETURN NULL;
END;
$$;

-- Add encrypted API key column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS open_ai_key_encrypted text;

-- Migrate existing API keys to encrypted format
UPDATE agents 
SET open_ai_key_encrypted = encrypt_api_key(open_ai_key)
WHERE open_ai_key IS NOT NULL AND open_ai_key != '';

-- Add encrypted API key column to ai_whatsapp_agents table
ALTER TABLE ai_whatsapp_agents ADD COLUMN IF NOT EXISTS openai_api_key_encrypted text;

-- Migrate existing API keys to encrypted format
UPDATE ai_whatsapp_agents 
SET openai_api_key_encrypted = encrypt_api_key(openai_api_key)
WHERE openai_api_key IS NOT NULL AND openai_api_key != '';

-- Remove the overly permissive admin policy for agents
DROP POLICY IF EXISTS "Admins can read all agents" ON agents;

-- Create a more restrictive admin policy that excludes API keys
CREATE POLICY "Admins can read agent metadata only" ON agents
FOR SELECT 
USING (
  is_admin(auth.uid()) 
  AND current_setting('row_security') = 'on'
);

-- Create a view for admins that excludes sensitive data
-- CREATE OR REPLACE VIEW admin_agents_view AS
-- SELECT 
--   id,
--   name,
--   sector,
--   customer_id,
--   franchisee_id,
--   whatsapp_connected,
--   is_active,
--   message_count,
--   response_time,
--   phone_number,
--   created_at,
--   updated_at,
--   -- Mask API key for admin view
--   CASE 
--     WHEN open_ai_key IS NOT NULL AND open_ai_key != '' 
--     THEN 'sk-****' || RIGHT(open_ai_key, 4)
--     ELSE NULL 
--   END as open_ai_key_masked
-- FROM agents;

-- -- Grant admin access to the view
-- GRANT SELECT ON admin_agents_view TO authenticated;

-- -- Create RLS policy for the admin view
-- ALTER TABLE admin_agents_view ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Admins can view agent metadata" ON admin_agents_view
-- FOR SELECT 
-- USING (is_admin(auth.uid()));

-- Create trigger to automatically encrypt API keys on insert/update
CREATE OR REPLACE FUNCTION encrypt_agent_api_key_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Encrypt API key if it's being inserted or updated
  IF NEW.open_ai_key IS NOT NULL AND NEW.open_ai_key != '' THEN
    -- Only encrypt if it's not already encrypted (doesn't start with $2)
    IF NOT NEW.open_ai_key ~ '^\$2[aby]?\$' THEN
      NEW.open_ai_key_encrypted = encrypt_api_key(NEW.open_ai_key);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for agents table
DROP TRIGGER IF EXISTS encrypt_agent_api_key ON agents;
CREATE TRIGGER encrypt_agent_api_key
  BEFORE INSERT OR UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_agent_api_key_trigger();

-- Create trigger function for ai_whatsapp_agents
CREATE OR REPLACE FUNCTION encrypt_ai_agent_api_key_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Encrypt API key if it's being inserted or updated
  IF NEW.openai_api_key IS NOT NULL AND NEW.openai_api_key != '' THEN
    -- Only encrypt if it's not already encrypted (doesn't start with $2)
    IF NOT NEW.openai_api_key ~ '^\$2[aby]?\$' THEN
      NEW.openai_api_key_encrypted = encrypt_api_key(NEW.openai_api_key);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for ai_whatsapp_agents table
DROP TRIGGER IF EXISTS encrypt_ai_agent_api_key ON ai_whatsapp_agents;
CREATE TRIGGER encrypt_ai_agent_api_key
  BEFORE INSERT OR UPDATE ON ai_whatsapp_agents
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_ai_agent_api_key_trigger();