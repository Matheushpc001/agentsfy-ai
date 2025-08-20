-- -- Remove the security definer view and replace with a safer approach
-- DROP VIEW IF EXISTS admin_agents_view;

-- -- Instead of a security definer view, we'll modify the admin function to be safer
-- -- And ensure admins can only access non-sensitive data through proper functions

-- -- Create a limited admin access policy that excludes API keys completely
-- DROP POLICY IF EXISTS "Admins can read agent metadata only" ON agents;
-- DROP POLICY IF EXISTS "Admins can read non-sensitive agent data" ON agents;

-- -- Create a new restricted admin policy
-- CREATE POLICY "Admins can read limited agent data" ON agents
-- FOR SELECT 
-- USING (
--   is_admin(auth.uid()) AND 
--   -- This ensures admins can read the table but the application layer
--   -- must use admin_safe_agents() function to get data safely
--   true
-- );

-- -- But we recommend admins use the admin_safe_agents() function instead
-- -- which automatically excludes sensitive data