
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Mic, X, Paperclip, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@/types";

interface AgentChatInterfaceProps {
  agentId: string;
  agentName: string;
  messages?: Message[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  allowVoiceInput?: boolean;
  allowAttachments?: boolean;
  className?: string;
}

export default function AgentChatInterface({
  agentId,
  agentName,
  messages = [],
  onSendMessage,
  isProcessing = false,
  allowVoiceInput = false,
  allowAttachments = false,
  className = ""
}: AgentChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Rolagem automática para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    // Simulação de gravação de voz
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage("[Mensagem de voz]");
      }, 3000);
    }
  };
  
  // Formatação de timestamp para exibição
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Cabeçalho do chat */}
      <div className="bg-muted px-4 py-3 flex items-center border-b">
        <Bot className="h-5 w-5 mr-2 text-primary" />
        <div>
          <h3 className="font-medium">{agentName}</h3>
          <p className="text-xs text-muted-foreground">ID: {agentId}</p>
        </div>
      </div>
      
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.isAi ? "justify-start" : "justify-end"} mb-2`}
            >
              <div 
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.isAi 
                    ? "bg-muted text-foreground" 
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p>{message.content}</p>
                <div className={`text-xs mt-1 ${message.isAi ? "text-muted-foreground" : "text-primary-foreground/80"}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="font-medium mb-1">Nenhuma mensagem</h3>
            <p className="text-sm">Envie uma mensagem para iniciar a conversa com o agente.</p>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex justify-start mb-2">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-2 items-center h-6">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Área de entrada de mensagem */}
      <div className="p-3 border-t">
        {isRecording && (
          <div className="mb-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm">Gravando áudio...</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full" 
              onClick={() => setIsRecording(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {allowAttachments && (
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
          
          <Input
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || isRecording}
            className="flex-1"
          />
          
          {allowVoiceInput && (
            <Button 
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              onClick={toggleRecording}
              disabled={isProcessing}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing || isRecording}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
