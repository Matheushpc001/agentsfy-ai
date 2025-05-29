
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateAgentModalHeaderProps {
  editing?: boolean;
}

export default function CreateAgentModalHeader({ editing }: CreateAgentModalHeaderProps) {
  return (
    <DialogHeader className="p-6 pb-2 flex-shrink-0">
      <DialogTitle>{editing ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
    </DialogHeader>
  );
}
