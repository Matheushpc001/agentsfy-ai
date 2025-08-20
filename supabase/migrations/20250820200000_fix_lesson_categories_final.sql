-- Final fix for lesson_categories RLS policies and service role access

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can manage lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can insert lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can update lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can delete lesson categories" ON lesson_categories;

-- Create comprehensive policies that work with both authenticated users and service role
CREATE POLICY "Anyone can view lesson categories" 
ON lesson_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Service role and admins can insert lesson categories" 
ON lesson_categories 
FOR INSERT 
WITH CHECK (
  -- Allow service role (used by Edge Functions)
  current_setting('role') = 'service_role' OR
  -- Allow postgres superuser (fallback)
  session_user = 'postgres' OR
  -- Allow authenticated admin users
  (auth.uid() IS NOT NULL AND is_admin(auth.uid()))
);

CREATE POLICY "Service role and admins can update lesson categories" 
ON lesson_categories 
FOR UPDATE 
USING (
  current_setting('role') = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND is_admin(auth.uid()))
);

CREATE POLICY "Service role and admins can delete lesson categories" 
ON lesson_categories 
FOR DELETE 
USING (
  current_setting('role') = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND is_admin(auth.uid()))
);

-- Ensure the is_admin function exists and is accessible
-- Recreate the function to ensure it's properly defined
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id AND user_roles.role = 'admin'
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- Ensure the lesson_categories table has proper permissions for service role
GRANT ALL ON lesson_categories TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;