
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Settings, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GlobalConfig {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  manager_url?: string;
  global_api_key?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GlobalEvolutionConfig() {
  const [configs, setConfigs] = useState<GlobalConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    api_url: '',
    api_key: '',
    manager_url: '',
    global_api_key: '',
    is_active: true
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('evolution_global_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações globais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    if (!formData.name || !formData.api_url || !formData.api_key) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('evolution_global_configs')
        .insert([{
          name: formData.name,
          api_url: formData.api_url,
          api_key: formData.api_key,
          manager_url: formData.manager_url || null,
          global_api_key: formData.global_api_key || null,
          is_active: formData.is_active
        }]);

      if (error) throw error;

      toast.success('Configuração criada com sucesso!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        api_url: '',
        api_key: '',
        manager_url: '',
        global_api_key: '',
        is_active: true
      });
      await loadConfigs();
    } catch (error) {
      console.error('Erro ao criar configuração:', error);
      toast.error('Erro ao criar configuração');
    }
  };

  const handleToggleActive = async (configId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('evolution_global_configs')
        .update({ is_active: !currentActive })
        .eq('id', configId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      await loadConfigs();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('evolution_global_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast.success('Configuração excluída com sucesso!');
      await loadConfigs();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast.error('Erro ao excluir configuração');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Configuração Global Evolution API</h1>
          <p className="text-muted-foreground">
            Configure as credenciais globais da Evolution API que serão usadas pelos franqueados
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Configuração Global</CardTitle>
            <CardDescription>
              Configure uma nova instância da Evolution API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Configuração *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Servidor Principal"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_url">URL da API *</Label>
                <Input
                  id="api_url"
                  value={formData.api_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_url: e.target.value }))}
                  placeholder="https://yourdomain.com/yourserver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">Chave da API *</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Sua chave da API"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_url">URL do Manager</Label>
                <Input
                  id="manager_url"
                  value={formData.manager_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_url: e.target.value }))}
                  placeholder="https://yourdomain.com/yourmanager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="global_api_key">Chave Global da API</Label>
                <Input
                  id="global_api_key"
                  type="password"
                  value={formData.global_api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, global_api_key: e.target.value }))}
                  placeholder="Chave global (opcional)"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Configuração disponível para uso
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateConfig}>
                <Settings className="w-4 h-4 mr-2" />
                Criar Configuração
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {configs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma configuração global encontrada. Crie a primeira configuração.
              </p>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <Badge variant={config.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                    {config.is_active ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {config.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>
                  {config.api_url}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">API Key:</span>
                    <span className="ml-2 text-muted-foreground">
                      {config.api_key.substring(0, 8)}***
                    </span>
                  </div>
                  {config.manager_url && (
                    <div className="text-sm">
                      <span className="font-medium">Manager:</span>
                      <span className="ml-2 text-muted-foreground">{config.manager_url}</span>
                    </div>
                  )}
                  {config.global_api_key && (
                    <div className="text-sm">
                      <span className="font-medium">Global Key:</span>
                      <span className="ml-2 text-muted-foreground">Configurada</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(config.id, config.is_active)}
                  >
                    {config.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
