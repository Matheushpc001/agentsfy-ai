
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent } from "@/types";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";

interface WhatsAppConnectionCardProps {
  agent: Agent;
  onRefresh?: (agent: Agent) => void;
}

export default function WhatsAppConnectionCard({ agent, onRefresh }: WhatsAppConnectionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  
  const { configs, aiAgents, connectInstance } = useEvolutionAPI();

  const handleGenerateQR = async () => {
    // Find the AI agent configuration for this agent
    const aiAgent = aiAgents.find(ai => ai.agent_id === agent.id);
    const evolutionConfigId = aiAgent?.evolution_config_id;

    if (!evolutionConfigId) {
      setQrError('Agente não possui instância EvolutionAPI configurada');
      return;
    }

    setIsGenerating(true);
    setQrError(null);
    
    try {
      console.log('Generating QR for agent:', agent.id, 'with config:', evolutionConfigId);
      
      const qrCodeData = await connectInstance(evolutionConfigId);
      
      if (qrCodeData) {
        // Handle different QR code formats
        let qrCodeUrl = qrCodeData;
        if (typeof qrCodeData === 'string' && !qrCodeData.startsWith('data:') && !qrCodeData.startsWith('http')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        }
        setQrCodeUrl(qrCodeUrl);
      } else {
        throw new Error('QR code não foi retornado pela EvolutionAPI');
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
            onClick={() => setIsModalOpen(true)}
          >
            {agent.whatsappConnected ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconectar WhatsApp
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Conectar WhatsApp
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
              Conecte usando a EvolutionAPI para WhatsApp real.
            </DialogDescription>
          </DialogHeader>
          
          <WhatsAppQRCode
            isGenerating={isGenerating}
            qrCodeUrl={qrCodeUrl || undefined}
            error={qrError || undefined}
            onRefresh={handleGenerateQR}
            onConnect={handleConnect}
            className="my-4"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
