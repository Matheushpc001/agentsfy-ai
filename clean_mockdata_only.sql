-- Script para limpar APENAS os dados mockados (aulas de exemplo)
-- Execute este script no SQL Editor do Supabase

-- 1. Deletar aulas de exemplo (dados mockados)
DELETE FROM lessons 
WHERE title IN (
  'Bem-vindo à Plataforma',
  'Criando seu Primeiro Agente', 
  'Guia de Prompts Eficazes',
  'Conectando WhatsApp'
);

-- 2. Verificar quantas aulas restaram
SELECT 'lessons' as table_name, COUNT(*) as count FROM lessons
UNION ALL
SELECT 'lesson_categories' as table_name, COUNT(*) as count FROM lesson_categories;

-- 3. Mostrar categorias que existem (para você saber quais você tem)
SELECT name, description, icon, created_at FROM lesson_categories ORDER BY name;