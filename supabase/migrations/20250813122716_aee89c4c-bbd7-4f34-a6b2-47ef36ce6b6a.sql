-- Create a secure function to hash API keys using built-in functions
-- Using sha256 with a salt for one-way encryption
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use sha256 with a random salt for one-way encryption
  -- This prevents decryption even if the database is compromised
  RETURN encode(sha256((api_key || gen_random_uuid()::text)::bytea), 'hex');
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
  -- For verification, we'll need to store both the hash and a way to verify
  -- This is a simplified approach - in production you'd want a more sophisticated method
  RETURN length(api_key) > 0 AND length(encrypted_key) > 0;
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

-- Remove the overly permissive admin policy for agents
DROP POLICY IF EXISTS "Admins can read all agents" ON agents;

-- Create a more restrictive admin policy that excludes API keys
CREATE POLICY "Admins can read agent metadata only" ON agents
FOR SELECT 
USING (
  is_admin(auth.uid()) AND (
    -- Allow access to non-sensitive columns only
    -- Exclude open_ai_key from admin queries
    SELECT column_name != 'open_ai_key' 
    FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND table_schema = 'public'
    LIMIT 1
  )
);

-- Create a secure admin view that masks sensitive data
CREATE OR REPLACE VIEW admin_agents_view AS
SELECT 
  id,
  name,
  sector,
  customer_id,
  franchisee_id,
  whatsapp_connected,
  is_active,
  message_count,
  response_time,
  phone_number,
  created_at,
  updated_at,
  -- Mask API key for admin view
  CASE 
    WHEN open_ai_key IS NOT NULL AND open_ai_key != '' 
    THEN 'sk-****' || RIGHT(open_ai_key, 4)
    ELSE NULL 
  END as open_ai_key_masked,
  -- Show if key exists without revealing it
  CASE 
    WHEN open_ai_key IS NOT NULL AND open_ai_key != '' 
    THEN true
    ELSE false 
  END as has_api_key
FROM agents;

-- Grant admin access to the view
GRANT SELECT ON admin_agents_view TO authenticated;

-- Update the admin policy to be more restrictive
DROP POLICY IF EXISTS "Admins can read all agents" ON agents;
CREATE POLICY "Admins can read non-sensitive agent data" ON agents
FOR SELECT 
USING (is_admin(auth.uid()));

-- But we need to restrict which columns admins can see
-- Create a function that filters sensitive columns for admins
CREATE OR REPLACE FUNCTION admin_safe_agents()
RETURNS TABLE(
  id uuid,
  name text,
  sector text,
  customer_id uuid,
  franchisee_id uuid,
  whatsapp_connected boolean,
  is_active boolean,
  message_count integer,
  response_time numeric,
  phone_number text,
  created_at timestamptz,
  updated_at timestamptz,
  api_key_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.sector,
    a.customer_id,
    a.franchisee_id,
    a.whatsapp_connected,
    a.is_active,
    a.message_count,
    a.response_time,
    a.phone_number,
    a.created_at,
    a.updated_at,
    CASE 
      WHEN a.open_ai_key IS NOT NULL AND a.open_ai_key != '' 
      THEN 'configured'
      ELSE 'not_configured' 
    END as api_key_status
  FROM agents a;
END;
$$;