-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar foreign keys
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_franchisee_id_fkey 
FOREIGN KEY (franchisee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Adicionar índices para performance
CREATE INDEX idx_appointments_franchisee_id ON public.appointments(franchisee_id);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Habilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Franchisees can manage their own appointments" 
ON public.appointments 
FOR ALL 
USING (franchisee_id = auth.uid())
WITH CHECK (franchisee_id = auth.uid());

CREATE POLICY "Customers can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (customer_id IN (
  SELECT id FROM public.customers WHERE id = auth.uid()
));

CREATE POLICY "Admins can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Criar tabela de configurações do Google Calendar se não existir
CREATE TABLE IF NOT EXISTS public.google_calendar_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID NOT NULL,
  customer_id UUID,
  google_calendar_id TEXT DEFAULT 'primary',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar foreign keys para google_calendar_configs
ALTER TABLE public.google_calendar_configs 
ADD CONSTRAINT google_calendar_configs_franchisee_id_fkey 
FOREIGN KEY (franchisee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.google_calendar_configs 
ADD CONSTRAINT google_calendar_configs_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Habilitar RLS para google_calendar_configs
ALTER TABLE public.google_calendar_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configurações do Google Calendar
CREATE POLICY "Franchisees can manage their Google Calendar configs" 
ON public.google_calendar_configs 
FOR ALL 
USING (franchisee_id = auth.uid())
WITH CHECK (franchisee_id = auth.uid());

CREATE POLICY "Customers can view their Google Calendar configs" 
ON public.google_calendar_configs 
FOR SELECT 
USING (customer_id = auth.uid());

-- Adicionar colunas de Google Calendar ao profiles se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_calendar_token') THEN
    ALTER TABLE public.profiles ADD COLUMN google_calendar_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_calendar_refresh_token') THEN
    ALTER TABLE public.profiles ADD COLUMN google_calendar_refresh_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_calendar_email') THEN
    ALTER TABLE public.profiles ADD COLUMN google_calendar_email TEXT;
  END IF;
END $$;

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_appointments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_appointments();

CREATE TRIGGER update_google_calendar_configs_updated_at
    BEFORE UPDATE ON public.google_calendar_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();