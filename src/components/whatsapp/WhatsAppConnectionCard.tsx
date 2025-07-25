// src/components/whatsapp/WhatsAppConnectionCard.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent } from "@/types";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import { useAuthCheck } from "@/hooks/useAuthCheck";

interface WhatsAppConnectionCardProps {
  agent: Agent;
  onRefresh?: (agent: Agent) => void;
}

export default function WhatsAppConnectionCard({ agent, onRefresh }: WhatsAppConnectionCardProps) {
  const { user } = useAuthCheck();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // --- INÍCIO DA CORREÇÃO 1: Renomear estado para clareza ---
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  // --- FIM DA CORREÇÃO 1 ---
  const [qrError, setQrError] = useState<string | null>(null);
  
  const { connectInstance, globalConfigs, createAgentWithAutoInstance } = useEvolutionAPI(user?.id);

  const handleGenerateQR = async () => {
    if (!user?.id) {
      setQrError('Usuário não autenticado');
      return;
    }

    if (globalConfigs.length === 0) {
      setQrError('EvolutionAPI não configurada. Entre em contato com o administrador.');
      return;
    }

    let evolutionConfigId: string | undefined;
    try {
      // Simplificado para sempre tentar criar/obter a instância
      // A função createAgentWithAutoInstance deve ser idempotente ou encontrar a existente
      toast.loading('Verificando instância WhatsApp...');
      const evolutionConfig = await createAgentWithAutoInstance(
        agent.id, 
        agent.name, 
        agent.phoneNumber
      );
      evolutionConfigId = evolutionConfig.id;
      toast.dismiss();
    } catch (error) {
      console.error('Erro ao obter/criar instância automática:', error);
      toast.dismiss();
      setQrError('Erro ao preparar instância automática. Tente novamente.');
      return;
    }

    if (!evolutionConfigId) {
        setQrError('Não foi possível obter um ID de configuração para a instância.');
        return;
    }

    setIsGenerating(true);
    setQrError(null);
    setQrCodeData(null); // Limpa o QR anterior
    
    try {
      console.log('Gerando QR para agente:', agent.id, 'com config:', evolutionConfigId);
      
      const responseQrCodeData = await connectInstance(evolutionConfigId);
      
      if (responseQrCodeData) {
        // --- INÍCIO DA CORREÇÃO 2: Apenas armazena o dado bruto ---
        // A lógica de formatação para data:image/png;base64, foi movida para dentro do WhatsAppQRCode
        setQrCodeData(responseQrCodeData); 
        // --- FIM DA CORREÇÃO 2 ---
        toast.success('QR code gerado! Escaneie com o WhatsApp.');
      } else {
        // Isso pode acontecer se a instância já estiver conectada, por exemplo.
        toast.info('QR code não foi retornado. Verificando status...');
        if(onRefresh) onRefresh(agent); // Força uma atualização do status
        setIsModalOpen(false); // Fecha o modal pois não há QR para mostrar
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setQrError(`Erro ao gerar QR code: ${errorMessage}`);
      toast.error('Erro ao conectar com EvolutionAPI');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleConnect = () => {
    setTimeout(() => {
      setIsModalOpen(false);
      if (onRefresh) onRefresh(agent);
      toast.success("Conexão realizada com sucesso!");
    }, 1000);
  };
  
  const openModalAndGenerateQR = () => {
    setIsModalOpen(true);
    // Gera o QR Code assim que o modal abre
    handleGenerateQR();
  }
  
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">WhatsApp Conexão</CardTitle>
          <CardDescription>
            Status da conexão do WhatsApp com EvolutionAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-muted-foreground">{agent.sector}</p>
            </div>
            
            {agent.whatsappConnected ? (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                <span className="text-sm">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">Desconectado</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant={agent.whatsappConnected ? "outline" : "default"}
            className="w-full"
            onClick={openModalAndGenerateQR} // Ação de clique atualizada
            disabled={globalConfigs.length === 0}
          >
            {agent.whatsappConnected ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconectar WhatsApp
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                {globalConfigs.length === 0 ? 'EvolutionAPI não configurada' : 'Conectar WhatsApp'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              {globalConfigs.length === 0 
                ? "EvolutionAPI não configurada. Entre em contato com o administrador."
                : "Escaneie o QR Code com o WhatsApp do seu cliente."
              }
            </DialogDescription>
          </DialogHeader>
          
          {globalConfigs.length > 0 && (
            // --- INÍCIO DA CORREÇÃO 3: Usar a prop correta ---
            <WhatsAppQRCode
              isGenerating={isGenerating}
              qrCodeData={qrCodeData || undefined} 
              error={qrError || undefined}
              onRefresh={handleGenerateQR}
              onConnect={handleConnect}
              className="my-4"
            />
            // --- FIM DA CORREÇÃO 3 ---
          )}
          
          {globalConfigs.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                EvolutionAPI não configurada globalmente.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Entre em contato com o administrador para ativar a integração.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}