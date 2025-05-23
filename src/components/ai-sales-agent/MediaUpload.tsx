
import { Button } from "@/components/ui/button";
import { Image, Mic } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  hasImage: boolean;
  hasAudio: boolean;
  setHasImage: (hasImage: boolean) => void;
  setHasAudio: (hasAudio: boolean) => void;
}

export default function MediaUpload({ 
  hasImage, 
  hasAudio, 
  setHasImage, 
  setHasAudio 
}: MediaUploadProps) {
  const uploadImage = () => {
    // In a real implementation, this would open a file picker
    setHasImage(true);
    toast.success("Imagem carregada com sucesso.");
  };

  const uploadAudio = () => {
    // In a real implementation, this would open a file picker or recording interface
    setHasAudio(true);
    toast.success("Áudio carregado com sucesso.");
  };

  const removeMedia = (type: "image" | "audio") => {
    if (type === "image") {
      setHasImage(false);
      toast.info("Imagem removida.");
    } else {
      setHasAudio(false);
      toast.info("Áudio removido.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {!hasImage && (
        <Button variant="outline" size="sm" onClick={uploadImage}>
          <Image className="mr-1 h-4 w-4" /> Anexar Imagem
        </Button>
      )}
      
      {hasImage && (
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
          <Image className="h-4 w-4" />
          <span className="text-sm">imagem.jpg</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedia("image")}>
            <span>×</span>
          </Button>
        </div>
      )}
      
      {!hasAudio && (
        <Button variant="outline" size="sm" onClick={uploadAudio}>
          <Mic className="mr-1 h-4 w-4" /> Anexar Áudio
        </Button>
      )}
      
      {hasAudio && (
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
          <Mic className="h-4 w-4" />
          <span className="text-sm">audio.mp3</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedia("audio")}>
            <span>×</span>
          </Button>
        </div>
      )}
    </div>
  );
}
