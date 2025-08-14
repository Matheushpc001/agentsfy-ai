-- Migration to add Google Calendar integration

-- Adicionar colunas para Google Calendar ao perfil do franchisee
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_calendar_email TEXT;

-- Criar tabela para configurações do Google Calendar por cliente
CREATE TABLE IF NOT EXISTS google_calendar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  google_calendar_id TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(franchisee_id, customer_id)
);

-- Criar tabela de agendamentos integrados
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  google_event_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies para google_calendar_configs
ALTER TABLE google_calendar_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Franchisees can manage their own Google Calendar configs" ON google_calendar_configs
FOR ALL USING (
  franchisee_id = auth.uid() OR
  is_admin(auth.uid())
);

-- RLS policies para appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relevant appointments" ON appointments
FOR SELECT USING (
  is_admin(auth.uid()) OR
  franchisee_id = auth.uid() OR
  customer_id = auth.uid()
);

CREATE POLICY "Franchisees can manage appointments" ON appointments
FOR ALL USING (
  franchisee_id = auth.uid() OR
  is_admin(auth.uid())
);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_google_calendar_configs_updated_at BEFORE UPDATE ON google_calendar_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();