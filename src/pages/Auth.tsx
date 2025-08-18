
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Eye, EyeOff } from "lucide-react"; // Importar ícones
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Novo estado
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Novo estado
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Novo estado
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos. Verifique suas credenciais.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Por favor, confirme seu email antes de fazer login.");
      } else {
        toast.error(error.message || "Falha ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      if (data.user?.email_confirmed_at) {
        toast.success("Conta criada com sucesso! Fazendo login...");
        // Auto login after successful signup
        await login(email, password);
        navigate("/dashboard");
      } else {
        toast.success("Conta criada! Verifique seu email para confirmar a conta.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes("User already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else {
        toast.error(error.message || "Erro ao criar conta.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <CardTitle className="text-2xl">AgentsFy</CardTitle>
          <CardDescription className="text-muted-foreground">
            Plataforma de microfranquias para agentes de IA no WhatsApp
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    autoComplete="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isLoading} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">
                    Senha
                  </label>
                  <div className="relative">
                    <Input 
                      id="login-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      autoComplete="current-password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      disabled={isLoading} 
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input 
                    id="signup-name" 
                    type="text" 
                    placeholder="Seu nome completo" 
                    autoComplete="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    disabled={isLoading} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    autoComplete="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isLoading} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Senha
                  </label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Mínimo 6 caracteres" 
                      autoComplete="new-password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      disabled={isLoading} 
                      required 
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Repita a senha" 
                      autoComplete="new-password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      disabled={isLoading} 
                      required 
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
