-- Script de correção para problemas de categorias de lições
-- Execute este script diretamente no SQL Editor do Supabase

-- 1. Verificar se a tabela lesson_categories existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'lesson_categories'
);

-- 2. Verificar se a função is_admin existe
SELECT EXISTS (
   SELECT FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name = 'is_admin'
);

-- 3. Verificar políticas RLS atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'lesson_categories';

-- 4. Aplicar correções das políticas RLS
DROP POLICY IF EXISTS "Anyone can view lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can manage lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can insert lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can update lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can delete lesson categories" ON lesson_categories;

-- 5. Criar políticas corrigidas
CREATE POLICY "Anyone can view lesson categories" 
ON lesson_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Service role and admins can insert lesson categories" 
ON lesson_categories 
FOR INSERT 
WITH CHECK (
  current_setting('role') = 'service_role' OR
  session_user = 'postgres' OR
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

-- 6. Garantir que a função is_admin está correta
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

-- 7. Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
GRANT ALL ON lesson_categories TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 8. Verificar se as políticas foram aplicadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'lesson_categories';

-- 9. Testar inserção com dados de exemplo (remova os comentários para testar)
-- INSERT INTO lesson_categories (name, description, icon) 
-- VALUES ('Teste', 'Categoria de teste', 'Settings');

-- 10. Verificar dados existentes
SELECT * FROM lesson_categories ORDER BY created_at;