
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CampaignForm from "./CampaignForm";
import CampaignProgress from "./CampaignProgress";
import { Campaign } from "@/types/campaign";

export default function CampaignTab() {
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [minutesBetweenMessages, setMinutesBetweenMessages] = useState("1");
  const [dailyLimit, setDailyLimit] = useState("50");
  const [hasImage, setHasImage] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  const startCampaign = () => {
    // Validate inputs
    if (!phoneNumbers.trim()) {
      toast.error("Adicione pelo menos um número de telefone.");
      return;
    }

    if (!campaignMessage.trim()) {
      toast.error("Adicione uma mensagem para a campanha.");
      return;
    }

    // Parse phone numbers (simple validation)
    const numbers = phoneNumbers.split("\n").map(n => n.trim()).filter(n => n);
    
    if (numbers.length === 0) {
      toast.error("Nenhum número válido encontrado.");
      return;
    }

    // Create a new campaign
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: `Campanha ${new Date().toLocaleDateString('pt-BR')}`,
      totalContacts: numbers.length,
      sentMessages: 0,
      failedMessages: 0,
      status: "running",
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    setActiveCampaign(newCampaign);
    toast.success(`Campanha iniciada! Enviando para ${numbers.length} contatos.`);
    
    // Simulate message sending progress
    simulateProgress(newCampaign, numbers.length);
  };

  const stopCampaign = () => {
    if (!activeCampaign) return;
    
    setActiveCampaign({
      ...activeCampaign,
      status: "paused"
    });
    
    toast.info("Campanha pausada.");
  };

  const resetCampaign = () => {
    setActiveCampaign(null);
  };

  const simulateProgress = (campaign: Campaign, total: number) => {
    // This is just a simulation - in a real app, this would track actual message sending
    let sent = 0;
    let failed = 0;
    
    const interval = setInterval(() => {
      // Simulate a message being sent
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Update campaign status
      setActiveCampaign(prev => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          sentMessages: sent,
          failedMessages: failed
        };
        
        // Check if campaign is complete
        if (sent + failed >= total) {
          clearInterval(interval);
          updated.status = "completed";
          updated.completedAt = new Date().toISOString();
          toast.success("Campanha concluída!");
        }
        
        return updated;
      });
      
    }, 1000); // Update every second for demo purposes
    
    // Cleanup interval if component unmounts
    return () => clearInterval(interval);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campanha de Mensagens</CardTitle>
        <CardDescription>
          Configure e inicie campanhas de envio automático de mensagens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeCampaign && activeCampaign.status !== "completed" ? (
          <CampaignProgress
            campaign={activeCampaign}
            stopCampaign={stopCampaign}
            startCampaign={startCampaign}
            resetCampaign={resetCampaign}
          />
        ) : (
          <CampaignForm
            phoneNumbers={phoneNumbers}
            setPhoneNumbers={setPhoneNumbers}
            campaignMessage={campaignMessage}
            setCampaignMessage={setCampaignMessage}
            minutesBetweenMessages={minutesBetweenMessages}
            setMinutesBetweenMessages={setMinutesBetweenMessages}
            dailyLimit={dailyLimit}
            setDailyLimit={setDailyLimit}
            hasImage={hasImage}
            setHasImage={setHasImage}
            hasAudio={hasAudio}
            setHasAudio={setHasAudio}
            onStartCampaign={startCampaign}
          />
        )}
      </CardContent>
    </Card>
  );
}
