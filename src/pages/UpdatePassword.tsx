// src/pages/UpdatePassword.tsx

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Bot, Eye, EyeOff, Check, X, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
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

  // Função para avaliar a força da senha
  const evaluatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 20;
    if (pass.length >= 12) score += 10;
    if (/[a-z]/.test(pass)) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;
    return score;
  };

  // Função para verificar se a senha é válida
  const isPasswordValid = (pass: string) => {
    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(pass);
    
    return {
      length: pass.length >= minLength,
      lowercase: hasLowerCase,
      uppercase: hasUpperCase,
      numbers: hasNumbers,
      special: hasSpecialChar,
      isValid: pass.length >= minLength && hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChar
    };
  };

  // Atualizar score da senha quando ela mudar
  useEffect(() => {
    if (password) {
      setPasswordScore(evaluatePasswordStrength(password));
    } else {
      setPasswordScore(0);
    }
  }, [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    
    const validation = isPasswordValid(password);
    if (!validation.isValid) {
      toast.error("A senha não atende aos critérios de segurança.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Senha definida com sucesso! Você será redirecionado para o login.");
      // Redireciona para a página de login para que o usuário possa entrar com a nova senha.
      setTimeout(() => navigate('/auth'), 1500);

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
          <Bot size={32} className="mx-auto text-primary mb-2" />
          <CardTitle className="text-2xl">Defina sua Senha</CardTitle>
          <CardDescription className="text-base">
            Crie uma senha forte e segura para proteger sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de nova senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Nova Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Indicador de força da senha */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Força da senha:</span>
                    <Progress value={passwordScore} className="flex-1 h-2" />
                    <span className="text-xs font-medium">
                      {passwordScore < 40 ? '❌ Fraca' : 
                       passwordScore < 70 ? '⚠️ Média' : 
                       passwordScore < 90 ? '✅ Forte' : '🛡️ Muito Forte'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Campo de confirmação */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirme a Senha</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Indicador de senhas coincidentes */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {password === confirmPassword ? (
                    <><Check size={14} className="text-green-600" /> <span className="text-green-600">Senhas coincidem</span></>
                  ) : (
                    <><X size={14} className="text-red-600" /> <span className="text-red-600">Senhas não coincidem</span></>
                  )}
                </div>
              )}
            </div>

            {/* Regras de senha */}
            {password && (
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-800 mb-2">Sua senha deve conter:</p>
                    {Object.entries({
                      length: 'Mínimo de 8 caracteres',
                      lowercase: 'Pelo menos uma letra minúscula',
                      uppercase: 'Pelo menos uma letra maiúscula', 
                      numbers: 'Pelo menos um número',
                      special: 'Pelo menos um caractere especial (!@#$%^&*)'
                    }).map(([key, label]) => {
                      const validation = isPasswordValid(password);
                      const isValid = validation[key as keyof typeof validation];
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          {isValid ? (
                            <Check size={12} className="text-green-600" />
                          ) : (
                            <X size={12} className="text-red-600" />
                          )}
                          <span className={isValid ? 'text-green-700' : 'text-red-700'}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || !isPasswordValid(password).isValid}
            >
              {isLoading ? "Salvando..." : "Salvar e Acessar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}