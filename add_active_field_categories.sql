-- Adicionar campo is_active na tabela lesson_categories
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campo is_active (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lesson_categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE lesson_categories ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'lesson_categories' 
ORDER BY ordinal_position;