// src/pages/CustomerPortalLogin.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Auth from './Auth'; // Reutilizaremos o componente de autenticação existente
import { Bot } from 'lucide-react';
import { Customer } from '@/types';

export default function CustomerPortalLogin() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId) {
        setError("ID do cliente não encontrado na URL.");
        setLoading(false);
        return;
      }

      try {

        const { data, error } = await supabase
          .from('customers')
          .select('business_name, email')
          .eq('id', customerId)
          .single();

        if (error) {
          throw new Error("Cliente não encontrado ou acesso negado.");
        }

        if (data) {
          setCustomer({
            id: customerId,
            businessName: data.business_name,
            email: data.email,
            name: '',
            role: 'customer',
            franchiseeId: '',
            agentCount: 0,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error("Erro ao buscar dados do cliente:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-center">
        <div>
          <h2 className="text-xl font-bold text-destructive">Acesso Inválido</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">Voltar para o início</a>
        </div>
      </div>
    );
  }
  

  return <Auth />;
}