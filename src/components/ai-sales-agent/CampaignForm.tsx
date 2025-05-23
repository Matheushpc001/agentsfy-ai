
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Play, Upload } from "lucide-react";
import { toast } from "sonner";
import MediaUpload from "./MediaUpload";

interface CampaignFormProps {
  phoneNumbers: string;
  setPhoneNumbers: (value: string) => void;
  campaignMessage: string;
  setCampaignMessage: (value: string) => void;
  minutesBetweenMessages: string;
  setMinutesBetweenMessages: (value: string) => void;
  dailyLimit: string;
  setDailyLimit: (value: string) => void;
  hasImage: boolean;
  setHasImage: (hasImage: boolean) => void;
  hasAudio: boolean;
  setHasAudio: (hasAudio: boolean) => void;
  onStartCampaign: () => void;
}

export default function CampaignForm({
  phoneNumbers,
  setPhoneNumbers,
  campaignMessage,
  setCampaignMessage,
  minutesBetweenMessages,
  setMinutesBetweenMessages,
  dailyLimit,
  setDailyLimit,
  hasImage,
  setHasImage,
  hasAudio,
  setHasAudio,
  onStartCampaign
}: CampaignFormProps) {
  const handlePhoneNumbersPaste = () => {
    navigator.clipboard.readText().then(text => {
      setPhoneNumbers(text);
      
      // Count numbers
      const count = text.split("\n").filter(line => line.trim().length > 0).length;
      if (count > 0) {
        toast.success(`${count} números adicionados!`);
      }
    }).catch(err => {
      toast.error("Erro ao colar da área de transferência.");
    });
  };

  return (
    <div className="space-y-6">
      {/* Phone numbers */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumbers">Lista de Números</Label>
        <div className="relative">
          <Textarea
            id="phoneNumbers"
            placeholder="Cole aqui a lista de números (um por linha)"
            rows={6}
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            className="pr-24"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="absolute right-2 top-2"
            onClick={handlePhoneNumbersPaste}
          >
            <Upload className="mr-1 h-4 w-4" /> Colar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Insira um número por linha. Formato: país + DDD + número (Ex: 5511999999999)
        </p>
      </div>
      
      {/* Campaign message */}
      <div className="space-y-2">
        <Label htmlFor="campaignMessage">Mensagem</Label>
        <Textarea
          id="campaignMessage"
          placeholder="Digite a mensagem que será enviada para os contatos..."
          rows={6}
          value={campaignMessage}
          onChange={(e) => setCampaignMessage(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Use {'{nome}'} para personalizar com o nome do contato (se disponível).
        </p>
        
        {/* Attach media controls */}
        <MediaUpload
          hasImage={hasImage}
          hasAudio={hasAudio}
          setHasImage={setHasImage}
          setHasAudio={setHasAudio}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="interval">Tempo Entre Mensagens (minutos)</Label>
          <Input
            id="interval"
            type="number"
            min="0.5"
            step="0.5"
            value={minutesBetweenMessages}
            onChange={(e) => setMinutesBetweenMessages(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Tempo de espera entre cada mensagem enviada.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dailyLimit">Limite Diário</Label>
          <Input
            id="dailyLimit"
            type="number"
            min="1"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Número máximo de mensagens enviadas por dia.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onStartCampaign}>
          <Play className="mr-2 h-4 w-4" />
          Iniciar Campanha
        </Button>
      </div>
    </div>
  );
}
