-- Habilita a Row-Level Security (RLS) para a tabela de clientes,
-- garantindo que as políticas de acesso sejam aplicadas.
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (se existirem) para evitar conflitos.
DROP POLICY IF EXISTS "Franchisees can manage their own customers" ON public.customers;
DROP POLICY IF EXISTS "Customers can see and update their own data" ON public.customers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers;


-- Política para Franqueados:
-- Permite que usuários com a role ''franchisee'' gerenciem (SELECT, INSERT, UPDATE, DELETE)
-- apenas os clientes que pertencem a eles (franchisee_id corresponde ao seu UID).
CREATE POLICY "Franchisees can manage their own customers"
ON public.customers
FOR ALL
TO authenticated
USING (
  (get_my_claim(''user_role''))::text = ''franchisee'' AND
  franchisee_id = auth.uid()
)
WITH CHECK (
  (get_my_claim(''user_role''))::text = ''franchisee'' AND
  franchisee_id = auth.uid()
);

-- Política para Clientes:
-- Permite que usuários com a role ''customer'' vejam e atualizem
-- apenas seus próprios dados (o id do cliente corresponde ao seu UID).
CREATE POLICY "Customers can see and update their own data"
ON public.customers
FOR SELECT, UPDATE
TO authenticated
USING (
  (get_my_claim(''user_role''))::text = ''customer'' AND
  id = auth.uid()
)
WITH CHECK (
  (get_my_claim(''user_role''))::text = ''customer'' AND
  id = auth.uid()
);

