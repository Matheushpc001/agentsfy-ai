
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, TestTube, Zap } from "lucide-react";
import { toast } from "sonner";

interface EvolutionAPISetupProps {
  onTestConnection: (apiUrl: string, apiKey: string, globalApiKey?: string) => Promise<any>;
  onCreateInstance: (instanceName: string, apiUrl: string, apiKey: string, managerUrl?: string, globalApiKey?: string) => Promise<any>;
  isCreating: boolean;
}

export default function EvolutionAPISetup({ 
  onTestConnection, 
  onCreateInstance, 
  isCreating 
}: EvolutionAPISetupProps) {
  const [formData, setFormData] = useState({
    apiUrl: 'https://yourdomain.com/yourserver',
    apiKey: '',
    managerUrl: 'https://yourdomain.com/yourmanager',
    globalApiKey: '',
    instanceName: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset connection status when changing connection details
    if (['apiUrl', 'apiKey', 'globalApiKey'].includes(field)) {
      setConnectionStatus('idle');
    }
  };

  const testConnection = async () => {
    if (!formData.apiUrl || !formData.apiKey) {
      toast.error('Preencha a URL da API e a chave da API');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('testing');

    try {
      await onTestConnection(formData.apiUrl, formData.apiKey, formData.globalApiKey);
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const createInstance = async () => {
    if (!formData.instanceName || !formData.apiUrl || !formData.apiKey) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (connectionStatus !== 'success') {
      toast.error('Teste a conexão primeiro');
      return;
    }

    try {
      await onCreateInstance(
        formData.instanceName,
        formData.apiUrl,
        formData.apiKey,
        formData.managerUrl || undefined,
        formData.globalApiKey || undefined
      );
      
      // Reset form after successful creation
      setFormData(prev => ({ ...prev, instanceName: '' }));
    } catch (error) {
      console.error('Erro ao criar instância:', error);
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Testando</Badge>;
      case 'success':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configuração da EvolutionAPI
          </CardTitle>
          <CardDescription>
            Configure sua instância da EvolutionAPI para integração com WhatsApp
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configurações de Conexão */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Configurações de Conexão</h3>
              {getConnectionStatusBadge()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">URL da API *</Label>
                <Input
                  id="apiUrl"
                  value={formData.apiUrl}
                  onChange={(e) => handleChange('apiUrl', e.target.value)}
                  placeholder="https://yourdomain.com/yourserver"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="Sua chave da API"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerUrl">URL do Manager (Opcional)</Label>
                <Input
                  id="managerUrl"
                  value={formData.managerUrl}
                  onChange={(e) => handleChange('managerUrl', e.target.value)}
                  placeholder="https://yourdomain.com/yourmanager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="globalApiKey">Chave Global da API (Opcional)</Label>
                <Input
                  id="globalApiKey"
                  type="password"
                  value={formData.globalApiKey}
                  onChange={(e) => handleChange('globalApiKey', e.target.value)}
                  placeholder="Chave global para múltiplas instâncias"
                />
              </div>
            </div>

            <Button 
              onClick={testConnection} 
              disabled={isTesting || !formData.apiUrl || !formData.apiKey}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? 'Testando Conexão...' : 'Testar Conexão'}
            </Button>
          </div>

          <Separator />

          {/* Criação de Instância */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Criar Nova Instância</h3>
            
            <div className="space-y-2">
              <Label htmlFor="instanceName">Nome da Instância *</Label>
              <Input
                id="instanceName"
                value={formData.instanceName}
                onChange={(e) => handleChange('instanceName', e.target.value)}
                placeholder="minha-instancia-whatsapp"
              />
            </div>

            <Button 
              onClick={createInstance}
              disabled={isCreating || connectionStatus !== 'success' || !formData.instanceName}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando Instância...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Criar Instância
                </>
              )}
            </Button>
          </div>

          {/* Informações de ajuda */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como configurar:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Insira a URL da sua EvolutionAPI</li>
              <li>2. Configure a chave da API</li>
              <li>3. Teste a conexão</li>
              <li>4. Crie uma nova instância</li>
              <li>5. Configure agentes IA na aba correspondente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
