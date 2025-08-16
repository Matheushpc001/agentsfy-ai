// src/pages/UpdatePassword.tsx

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // O cliente Supabase detecta o token na URL e dispara o evento
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Este evento é disparado quando o usuário clica no link de convite ou redefinição
      if (event === 'PASSWORD_RECOVERY' && session) {
        setIsAuthenticated(true);
        toast.info("Autenticação validada! Por favor, defina sua nova senha.");
      }
    });

    // Verifica se o evento já ocorreu e o usuário está pronto para definir a senha
    // Isso lida com casos de recarregamento da página
    if (supabase.auth.getSession()) {
        supabase.auth.getUser().then(({data}) => {
            if(data.user) {
                setIsAuthenticated(true);
            }
        })
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Senha definida com sucesso! Você será redirecionado.");
      // Fazer login automático após definir a senha
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error: any) {
      toast.error(error.message || "Não foi possível definir a senha.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando seu convite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Bot size={28} className="mx-auto text-primary" />
          <CardTitle>Defina sua Senha</CardTitle>
          <CardDescription>
            Crie uma senha segura para acessar seu portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password">Nova Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword">Confirme a Senha</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar e Acessar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}