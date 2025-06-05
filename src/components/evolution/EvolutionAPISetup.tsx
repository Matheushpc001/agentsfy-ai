
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, TestTube, Zap } from "lucide-react";
import { toast } from "sonner";

interface GlobalConfig {
  id: string;
  name: string;
  api_url: string;
  is_active: boolean;
}

interface EvolutionAPISetupProps {
  globalConfigs: GlobalConfig[];
  onTestConnection: (globalConfigId: string) => Promise<any>;
  onCreateInstance: (instanceName: string, globalConfigId: string) => Promise<any>;
  isCreating: boolean;
}

export default function EvolutionAPISetup({ 
  globalConfigs,
  onTestConnection, 
  onCreateInstance, 
  isCreating 
}: EvolutionAPISetupProps) {
  const [formData, setFormData] = useState({
    selectedGlobalConfig: '',
    instanceName: ''
  });

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset connection status when changing global config
    if (field === 'selectedGlobalConfig') {
      setConnectionStatus('idle');
    }
  };

  const testConnection = async () => {
    if (!formData.selectedGlobalConfig) {
      toast.error('Selecione uma configuração global');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('testing');

    try {
      await onTestConnection(formData.selectedGlobalConfig);
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  const createInstance = async () => {
    if (!formData.instanceName || !formData.selectedGlobalConfig) {
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
        formData.selectedGlobalConfig
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

  const selectedConfig = globalConfigs.find(config => config.id === formData.selectedGlobalConfig);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Configuração da EvolutionAPI
          </CardTitle>
          <CardDescription>
            Selecione uma configuração global e crie sua instância WhatsApp
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {globalConfigs.length === 0 ? (
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-muted-foreground">
                Nenhuma configuração global disponível. Entre em contato com o administrador.
              </p>
            </div>
          ) : (
            <>
              {/* Seleção de Configuração Global */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Configuração Global</h3>
                  {getConnectionStatusBadge()}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="globalConfig">Configuração Disponível *</Label>
                  <Select 
                    value={formData.selectedGlobalConfig} 
                    onValueChange={(value) => handleChange('selectedGlobalConfig', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma configuração" />
                    </SelectTrigger>
                    <SelectContent>
                      {globalConfigs.map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{config.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {config.api_url}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedConfig && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">URL da API:</span> {selectedConfig.api_url}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={testConnection} 
                  disabled={isTesting || !formData.selectedGlobalConfig}
                  variant="outline"
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testando Conexão...' : 'Testar Conexão'}
                </Button>
              </div>

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
            </>
          )}

          {/* Informações de ajuda */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como usar:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Selecione uma configuração global disponível</li>
              <li>2. Teste a conexão com o servidor</li>
              <li>3. Crie uma nova instância para seu WhatsApp</li>
              <li>4. Configure agentes IA na aba correspondente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
