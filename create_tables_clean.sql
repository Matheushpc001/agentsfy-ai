-- Script limpo para criar sistema de aulas (SEM dados de exemplo)
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela lesson_categories (se não existir)
CREATE TABLE IF NOT EXISTS lesson_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS na tabela lesson_categories
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

-- 4. Criar políticas para lesson_categories
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

-- 5. Criar tabela lessons (se não existir)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'ebook', 'material', 'quiz')),
  content_url TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES lesson_categories(id) ON DELETE CASCADE,
  duration_minutes INTEGER,
  file_size_mb DECIMAL,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Habilitar RLS na tabela lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas para lessons
CREATE POLICY "lessons_select_policy" 
ON lessons 
FOR SELECT 
USING (is_published = true OR current_setting('role', true) = 'service_role' OR session_user = 'postgres' OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
)));

CREATE POLICY "lessons_insert_policy" 
ON lessons 
FOR INSERT 
WITH CHECK (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "lessons_update_policy" 
ON lessons 
FOR UPDATE 
USING (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "lessons_delete_policy" 
ON lessons 
FOR DELETE 
USING (
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

-- 8. Criar tabela user_lesson_progress (se não existir)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 9. Habilitar RLS na tabela user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas para user_lesson_progress
CREATE POLICY "user_lesson_progress_policy" 
ON user_lesson_progress 
FOR ALL 
USING (
  user_id = auth.uid() OR
  current_setting('role', true) = 'service_role' OR
  session_user = 'postgres' OR
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

-- 11. Conceder permissões para service_role
GRANT ALL ON lesson_categories TO service_role;
GRANT ALL ON lessons TO service_role;
GRANT ALL ON user_lesson_progress TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 12. Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_lesson_categories_updated_at ON lesson_categories;
CREATE TRIGGER update_lesson_categories_updated_at 
  BEFORE UPDATE ON lesson_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER update_user_lesson_progress_updated_at 
  BEFORE UPDATE ON user_lesson_progress 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 14. Verificar se tudo foi criado corretamente
SELECT 'lesson_categories' as table_name, COUNT(*) as count FROM lesson_categories
UNION ALL
SELECT 'lessons' as table_name, COUNT(*) as count FROM lessons
UNION ALL
SELECT 'user_lesson_progress' as table_name, COUNT(*) as count FROM user_lesson_progress;