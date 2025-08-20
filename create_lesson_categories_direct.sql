-- Execute este script diretamente no SQL Editor do Supabase
-- Script para criar a tabela lesson_categories

-- 1. Criar a tabela lesson_categories
CREATE TABLE IF NOT EXISTS lesson_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Anyone can view lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can manage lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can insert lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can update lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Admins can delete lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Service role and admins can insert lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Service role and admins can update lesson categories" ON lesson_categories;
DROP POLICY IF EXISTS "Service role and admins can delete lesson categories" ON lesson_categories;

-- 4. Criar políticas simples que funcionem
CREATE POLICY "lesson_categories_select_policy" 
ON lesson_categories 
FOR SELECT 
USING (true);

CREATE POLICY "lesson_categories_insert_policy" 
ON lesson_categories 
FOR INSERT 
WITH CHECK (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "lesson_categories_update_policy" 
ON lesson_categories 
FOR UPDATE 
USING (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "lesson_categories_delete_policy" 
ON lesson_categories 
FOR DELETE 
USING (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

-- 5. Conceder permissões
GRANT ALL ON lesson_categories TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 6. Inserir categorias padrão (apenas se a tabela estiver vazia)
INSERT INTO lesson_categories (name, description, icon) 
SELECT * FROM (VALUES
  ('Introdução', 'Aulas introdutórias sobre a plataforma', 'PlayCircle'),
  ('Configuração', 'Como configurar agentes e integrações', 'Settings'),
  ('WhatsApp', 'Integração e automação via WhatsApp', 'MessageCircle'),
  ('IA e Prompts', 'Criação e otimização de prompts', 'Brain'),
  ('Analytics', 'Análise de dados e relatórios', 'BarChart'),
  ('Vendas', 'Estratégias de vendas e conversão', 'TrendingUp'),
  ('Suporte', 'Suporte técnico e troubleshooting', 'HelpCircle')
) AS v(name, description, icon)
WHERE NOT EXISTS (SELECT 1 FROM lesson_categories LIMIT 1);

-- 7. Verificar se foi criado corretamente
SELECT * FROM lesson_categories ORDER BY created_at;