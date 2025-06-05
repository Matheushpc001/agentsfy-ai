
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Settings } from 'lucide-react';
import { useEvolutionAPI } from '@/hooks/useEvolutionAPI';

interface EvolutionAPISetupProps {
  franchiseeId: string;
  onConfigCreated?: (config: any) => void;
}

export default function EvolutionAPISetup({ franchiseeId, onConfigCreated }: EvolutionAPISetupProps) {
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);
  const [formData, setFormData] = useState({
    instanceName: '',
    apiUrl: '',
    apiKey: ''
  });

  const { createInstance, isCreating } = useEvolutionAPI(franchiseeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instanceName || !formData.apiUrl || !formData.apiKey) {
      return;
    }

    try {
      const config = await createInstance(formData.instanceName, formData.apiUrl, formData.apiKey);
      setFormData({ instanceName: '', apiUrl: '', apiKey: '' });
      setIsCreatingConfig(false);
      onConfigCreated?.(config);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (!isCreatingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração EvolutionAPI
          </CardTitle>
          <CardDescription>
            Configure sua instância da EvolutionAPI para integração com WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Para usar esta funcionalidade, você precisa ter uma instância da EvolutionAPI rodando.
              Visite a documentação para mais informações sobre como configurar.
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => setIsCreatingConfig(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Nova Instância
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Instância EvolutionAPI</CardTitle>
        <CardDescription>
          Preencha os dados para conectar sua instância da EvolutionAPI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nome da Instância</Label>
            <Input
              id="instanceName"
              placeholder="Ex: minha-empresa"
              value={formData.instanceName}
              onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">URL da API</Label>
            <Input
              id="apiUrl"
              placeholder="Ex: https://api.evolution.com"
              value={formData.apiUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Sua chave da API"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatingConfig(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Instância'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
