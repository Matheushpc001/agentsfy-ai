-- Remove a política de INSERT anterior que bloqueava a service_role.
DROP POLICY IF EXISTS "Admins can insert lesson categories" ON public.lesson_categories;

-- Cria uma nova política de INSERT que funciona tanto para usuários admin logados
-- quanto para a service_role (que opera como o usuário 'postgres').
CREATE POLICY "Admins can insert lesson categories"
ON public.lesson_categories
FOR INSERT
WITH CHECK (
  -- Permite a inserção se o usuário da sessão for o superusuário do banco (usado pela service_role)
  session_user = 'postgres' OR
  -- Ou se o usuário autenticado tiver a role de admin, verificado pela sua função RPC.
  is_admin(auth.uid())
);