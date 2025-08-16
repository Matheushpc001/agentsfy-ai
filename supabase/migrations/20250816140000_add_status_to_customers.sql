-- Adiciona a coluna 'status' à tabela 'customers' para gerenciamento de ativação/desativação.

ALTER TABLE public.customers
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

COMMENT ON COLUMN public.customers.status IS 'Status do cliente, por exemplo: active, inactive';
