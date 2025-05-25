
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative" translate="no">
      <div className="absolute inset-0 gradient-bg opacity-5 z-0" />
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md shadow-lg z-10" translate="no">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Bot size={28} className="text-white" />
          </div>
          <CardTitle className="text-2xl" translate="no">AgentsFy</CardTitle>
          <CardDescription className="text-muted-foreground" translate="no">
            Plataforma de microfranquias para agentes de IA no WhatsApp
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium" translate="no">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                autoComplete="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                disabled={isLoading} 
                required 
                translate="no"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium" translate="no">
                  Senha
                </label>
                <a href="#" className="text-xs text-primary hover:underline" translate="no">
                  Esqueceu a senha?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                autoComplete="current-password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={isLoading} 
                required 
                translate="no"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading} translate="no">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground" translate="no">
            <p translate="no">
              Credenciais de demonstração:
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="p-1 rounded bg-muted" translate="no">
                <strong translate="no">Admin:</strong> admin@example.com / admin123
              </div>
              <div className="p-1 rounded bg-muted" translate="no">
                <strong translate="no">Franqueado:</strong> joao@example.com / joao123
              </div>
              <div className="p-1 rounded bg-muted" translate="no">
                <strong translate="no">Cliente:</strong> maria@example.com / maria123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
