// ARQUIVO: src/components/evolution/EvolutionManagement.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, CheckCircle, Clock, Settings, Trash2,
  RefreshCw, Plus, Smartphone, Bot
} from "lucide-react";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import EvolutionBotSetup from "./EvolutionBotSetup";

interface EvolutionManagementProps {
  franchiseeId: string;
}

export default function EvolutionManagement({ franchiseeId }: EvolutionManagementProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  // ### ALTERAÇÃO 1: Renomear para clareza ###
  const [isBotEditOpen, setIsBotEditOpen] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedInstanceName, setSelectedInstanceName] = useState<string | null>(null);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const { 
    configs, globalConfigs, isLoading, isCreating,
    createInstance, connectInstance, disconnectInstance, 
    deleteInstance, refreshData
  } = useEvolutionAPI(franchiseeId);

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error("Nome da instância é obrigatório");
      return;
    }
    try {
      await createInstance(newInstanceName.trim());
      setNewInstanceName("");
      setIsCreateModalOpen(false);
      toast.success("Instância criada com sucesso! Agora configure a IA se necessário.");
    } catch (error) {
      toast.error("Erro ao criar instância");
    }
  };

  const handleGenerateQrCode = async (configId: string) => {
    setSelectedConfigId(configId);
    setIsGeneratingQr(true);
    setQrError(null);
    setCurrentQrCode(null);
    setIsQRModalOpen(true);
    try {
      const qrCodeData = await connectInstance(configId);
      if (qrCodeData) {
        let qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        setCurrentQrCode(qrCodeUrl);
      }
    } catch (error) {
      setQrError("Erro ao gerar QR code");
    } finally {
      setIsGeneratingQr(false);
    }
  };
  
  // ### ALTERAÇÃO 2: Renomear função para clareza ###
  const handleOpenBotEdit = (instanceName: string) => {
      setSelectedInstanceName(instanceName);
      setIsBotEditOpen(true);
  };
  
  // (O resto das funções como handleDelete, handleDisconnect permanecem iguais)
  const handleDelete = async (configId: string) => {
    if (!confirm("Tem certeza que deseja remover esta instância? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteInstance(configId);
      toast.success("Instância removida");
    } catch (error) {
      toast.error("Erro ao remover instância");
    }
  };
  
  const handleDisconnect = async (configId: string) => {
    try {
      await disconnectInstance(configId);
      toast.success("Instância desconectada");
    } catch (error) {
      toast.error("Erro ao desconectar instância");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'qr_ready': return Clock;
      default: return AlertCircle;
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><RefreshCw className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* CARD de Status e Criação de Instância (Manual) */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Instâncias WhatsApp</CardTitle>
              <CardDescription>Gerencie suas conexões. A criação de agentes agora cria instâncias automaticamente.</CardDescription>
            </div>
            {/* O botão de "Nova Instância" pode ser mantido para casos manuais/avançados */}
          </div>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8"><Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhuma instância criada ainda.</p></div>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => {
                const StatusIcon = getStatusIcon(config.status);
                return (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between mb-3">
                      <h3 className="font-medium">{config.instance_name}</h3>
                      <Badge variant={config.status === 'connected' ? 'default' : 'secondary'}><StatusIcon className="h-3 w-3 mr-1" />{config.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.status === 'connected' ? (
                        <>
                          {/* ### ALTERAÇÃO 3: Mudar botão e função chamada ### */}
                          <Button size="sm" onClick={() => handleOpenBotEdit(config.instance_name)}>
                            <Bot className="h-4 w-4 mr-2" />
                            Editar IA
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(config.id)}>Desconectar</Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleGenerateQrCode(config.id)}>Conectar</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(config.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Conectar WhatsApp</DialogTitle></DialogHeader>
          <WhatsAppQRCode isGenerating={isGeneratingQr} qrCodeUrl={currentQrCode || undefined} error={qrError || undefined} onRefresh={() => selectedConfigId && handleGenerateQrCode(selectedConfigId)} onConnect={() => { setIsQRModalOpen(false); toast.success("WhatsApp conectado!"); }} />
        </DialogContent>
      </Dialog>
      
      {/* ### ALTERAÇÃO 4: Usar o novo estado para abrir o modal de edição ### */}
      {selectedInstanceName && (
        <Dialog open={isBotEditOpen} onOpenChange={setIsBotEditOpen}>
            <DialogContent className="sm:max-w-2xl">
                 <EvolutionBotSetup 
                    instanceName={selectedInstanceName}
                    onSave={() => { setIsBotEditOpen(false); refreshData(); }}
                 />
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}