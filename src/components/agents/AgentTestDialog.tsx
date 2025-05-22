
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Agent, Message } from "@/types";

interface AgentTestDialogProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentTestDialog({ agent, isOpen, onClose }: AgentTestDialogProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  if (!agent) return null;

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message,
      timestamp: new Date().toISOString(),
      sender: "user",
      agentId: agent.id,
      isAi: false
    };
    
    setMessages([...messages, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: generateAgentResponse(message, agent),
        timestamp: new Date().toISOString(),
        sender: "agent",
        agentId: agent.id,
        isAi: true
      };
      
      setMessages(prevMessages => [...prevMessages, agentResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAgentResponse = (userMessage: string, agent: Agent) => {
    // Simple response generator for testing
    const responses = [
      `Como agente de ${agent.sector}, posso ajudar com isso.`,
      `Obrigado por sua mensagem. Estou aqui para ajudar com questões de ${agent.sector}.`,
      `Entendi sua dúvida sobre ${userMessage.substring(0, 20)}... Posso esclarecer isso para você.`,
      `Agradecemos seu contato. Vou analisar sua solicitação relacionada a ${agent.sector}.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            Testar Agente de IA
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Digite uma mensagem para ver como o agente "{agent.name}" responderá.
          </p>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="bg-muted/30 p-2 rounded-md text-center text-sm">
            <h3 className="font-medium">Conversa de Teste</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 opacity-20" />
                <p>Digite uma mensagem para iniciar a conversa de teste.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isAi ? "justify-start" : "justify-end"}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isAi 
                        ? "bg-muted text-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Digite uma mensagem para testar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
            
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Bot className="h-3 w-3 mr-1" />
              <span>Modelo: GPT-4</span>
              <p className="ml-auto">
                Este é um ambiente de teste. As mensagens não serão salvas ou enviadas para clientes reais.
              </p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="mt-2" onClick={onClose}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
