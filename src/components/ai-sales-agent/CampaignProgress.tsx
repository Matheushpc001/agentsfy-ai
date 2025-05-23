
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Campaign } from "@/types/campaign";

interface CampaignProgressProps {
  campaign: Campaign;
  stopCampaign: () => void;
  startCampaign: () => void;
  resetCampaign: () => void;
}

export default function CampaignProgress({ 
  campaign, 
  stopCampaign, 
  startCampaign,
  resetCampaign
}: CampaignProgressProps) {
  const campaignProgress = Math.round(
    ((campaign.sentMessages + campaign.failedMessages) / campaign.totalContacts) * 100
  );

  return (
    <div className="space-y-6">
      {campaign.status === "completed" ? (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md">
          <h3 className="font-medium text-green-700 dark:text-green-300">Campanha Concluída!</h3>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {campaign.sentMessages} mensagens enviadas com sucesso. {campaign.failedMessages} falhas.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={resetCampaign}>
              Criar Nova Campanha
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Progresso da Campanha</h3>
              <span className="text-sm font-medium">{campaignProgress}%</span>
            </div>
            <Progress value={campaignProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Enviadas: {campaign.sentMessages}/{campaign.totalContacts}</span>
              <span>Falhas: {campaign.failedMessages}</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            {campaign.status === "running" ? (
              <Button variant="outline" onClick={stopCampaign}>
                <Pause className="mr-2 h-4 w-4" />
                Pausar Campanha
              </Button>
            ) : (
              <Button onClick={startCampaign}>
                <Play className="mr-2 h-4 w-4" />
                Retomar Campanha
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
