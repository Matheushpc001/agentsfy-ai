-- Migration to create lessons system

-- Criar tabela para categorias de aulas
CREATE TABLE IF NOT EXISTS lesson_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Nome do ícone Lucide
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para aulas
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'ebook', 'material', 'quiz')),
  content_url TEXT, -- URL do vídeo, PDF, etc.
  thumbnail_url TEXT,
  category_id UUID REFERENCES lesson_categories(id) ON DELETE CASCADE,
  duration_minutes INTEGER, -- Duração em minutos (para vídeos)
  file_size_mb DECIMAL, -- Tamanho do arquivo em MB
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0, -- Para ordenação
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela para progresso dos usuários
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT, -- Anotações do usuário
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Inserir categorias padrão
INSERT INTO lesson_categories (name, description, icon) VALUES
('Introdução', 'Aulas introdutórias sobre a plataforma', 'PlayCircle'),
('Configuração', 'Como configurar agentes e integrações', 'Settings'),
('WhatsApp', 'Integração e automação via WhatsApp', 'MessageCircle'),
('IA e Prompts', 'Criação e otimização de prompts', 'Brain'),
('Analytics', 'Análise de dados e relatórios', 'BarChart'),
('Vendas', 'Estratégias de vendas e conversão', 'TrendingUp'),
('Suporte', 'Suporte técnico e troubleshooting', 'HelpCircle');

-- Inserir aulas exemplo
INSERT INTO lessons (title, description, content_type, content_url, category_id, duration_minutes, is_published) VALUES
('Bem-vindo à Plataforma', 'Introdução geral sobre como usar a plataforma AgentsFy', 'video', 'https://example.com/intro-video', 
  (SELECT id FROM lesson_categories WHERE name = 'Introdução'), 15, true),
('Criando seu Primeiro Agente', 'Tutorial passo a passo para criar e configurar um agente IA', 'video', 'https://example.com/first-agent', 
  (SELECT id FROM lesson_categories WHERE name = 'Configuração'), 25, true),
('Guia de Prompts Eficazes', 'eBook com estratégias para criar prompts que convertem', 'ebook', 'https://example.com/prompts-guide.pdf', 
  (SELECT id FROM lesson_categories WHERE name = 'IA e Prompts'), NULL, true),
('Conectando WhatsApp', 'Como integrar sua conta WhatsApp com a Evolution API', 'video', 'https://example.com/whatsapp-setup', 
  (SELECT id FROM lesson_categories WHERE name = 'WhatsApp'), 20, true);

-- RLS policies
ALTER TABLE lesson_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Categorias são públicas para leitura
CREATE POLICY "Anyone can view lesson categories" ON lesson_categories
FOR SELECT USING (true);

-- Apenas admins podem gerenciar categorias
CREATE POLICY "Admins can manage lesson categories" ON lesson_categories
FOR ALL USING (is_admin(auth.uid()));

-- Aulas publicadas são públicas para leitura
CREATE POLICY "Anyone can view published lessons" ON lessons
FOR SELECT USING (is_published = true);

-- Apenas admins podem gerenciar aulas
CREATE POLICY "Admins can manage lessons" ON lessons
FOR ALL USING (is_admin(auth.uid()));

-- Usuários podem gerenciar seu próprio progresso
CREATE POLICY "Users can manage their own progress" ON user_lesson_progress
FOR ALL USING (user_id = auth.uid());

-- Admins podem ver progresso de todos
CREATE POLICY "Admins can view all progress" ON user_lesson_progress
FOR SELECT USING (is_admin(auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_lesson_categories_updated_at BEFORE UPDATE ON lesson_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();