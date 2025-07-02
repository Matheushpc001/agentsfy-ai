import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Smartphone, Wifi, Clock } from "lucide-react";
import WhatsAppQRCode from "@/components/whatsapp/WhatsAppQRCode";
import { Agent, Customer } from "@/types";
import { useEvolutionAPI } from "@/hooks/useEvolutionAPI";
import { toast } from "sonner";
import { useAuthCheck } from "@/hooks/useAuthCheck";

interface WhatsAppConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  agent: Agent | null;
  customer: Customer | null;
}

export default function WhatsAppConnectionModal({
  isOpen,
  onClose,
  onConnect,
  agent,
  customer
}: WhatsAppConnectionModalProps) {
  const { user } = useAuthCheck();
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<'loading' | 'instructions' | 'qr' | 'connecting' | 'connected' | 'error'>('loading');
  const [evolutionConfigId, setEvolutionConfigId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const { configs, aiAgents, connectInstance, checkInstanceStatus, globalConfigs, createAgentWithAutoInstance, refreshData } = useEvolutionAPI(user?.id);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && agent) {
      console.log('🚀 Modal opened for agent:', agent.id);
      setConnectionStep('loading');
      setQrError(null);
      setCurrentQrCode(null);
      setEvolutionConfigId(null);
      setRetryCount(0);
      setIsCreatingInstance(false);
      setIsCheckingStatus(false);
      
      // Clear any existing interval
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
        statusCheckInterval.current = null;
      }
      
      // Small delay to allow data to load
      setTimeout(() => {
        initializeEvolutionConfig();
      }, 500);
    }
  }, [isOpen, agent?.id]);

  // Cleanup interval on unmount or modal close
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
        statusCheckInterval.current = null;
      }
    };
  }, []);

  const startStatusChecking = (configId: string) => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    console.log('🔄 Iniciando verificação de status MELHORADA para:', configId);
    setIsCheckingStatus(true);

    // Primeira verificação imediatamente
    checkInstanceStatus(configId)
      .then(statusData => {
        console.log('📊 Status inicial:', statusData);
        if (statusData && statusData.status === 'connected') {
          handleConnectionSuccess();
          return;
        }
      })
      .catch(error => console.error('❌ Erro na verificação inicial:', error));

    // Configurar polling mais agressivo (a cada 1.5 segundos)
    statusCheckInterval.current = setInterval(async () => {
      try {
        console.log('🔍 Verificando status automaticamente...');
        const statusData = await checkInstanceStatus(configId);
        
        console.log('📊 Status retornado no polling:', statusData);
        
        if (statusData && statusData.status === 'connected') {
          console.log('🎉 CONEXÃO WHATSAPP DETECTADA NO POLLING!');
          handleConnectionSuccess();
        } else {
          console.log('⏳ Ainda aguardando conexão. Status atual:', statusData?.status);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status no polling:', error);
        // Continuar tentando em caso de erro temporário
      }
    }, 1500); // Polling mais rápido: 1.5 segundos
  };

  const handleConnectionSuccess = () => {
    console.log('🎉 Executando handleConnectionSuccess');
    
    // Parar o polling
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = null;
    }
    
    setIsCheckingStatus(false);
    setConnectionStep('connected');
    
    // Mostrar toast de sucesso
    toast.success('🎉 WhatsApp conectado com sucesso!');
    
    // Aguardar um pouco para o usuário ver a mensagem e fechar automaticamente
    setTimeout(() => {
      onConnect();
      onClose();
    }, 2500);
  };

  const initializeEvolutionConfig = async () => {
    if (!agent || !user?.id || isCreatingInstance) {
      console.log('Cannot initialize - missing data or already creating');
      return;
    }

    console.log('Initializing Evolution config for agent:', agent.id);
    setConnectionStep('loading');
    setQrError(null);
    
    try {
      // Verificar se há configuração global
      if (globalConfigs.length === 0) {
        console.log('No global configs found');
        setQrError('EvolutionAPI não configurada. Entre em contato com o administrador.');
        setConnectionStep('error');
        return;
      }

      // Primeiro, refresh dos dados para garantir estado atualizado
      await refreshData();

      // Encontrar configuração AI Agent existente para este agente
      const aiAgent = aiAgents.find(ai => ai.agent_id === agent.id);
      
      if (aiAgent && aiAgent.evolution_config_id) {
        console.log('Found existing AI Agent configuration:', aiAgent.evolution_config_id);
        setEvolutionConfigId(aiAgent.evolution_config_id);
        setConnectionStep('instructions');
        return;
      }

      // Procurar por configuração Evolution existente para este usuário
      const existingConfig = configs.find(c => c.instance_name.includes(agent.id));
      
      if (existingConfig) {
        console.log('Found existing Evolution config:', existingConfig.id);
        setEvolutionConfigId(existingConfig.id);
        setConnectionStep('instructions');
        return;
      }

      // Se não existe, criar nova instância (apenas uma vez)
      if (!isCreatingInstance) {
        console.log('Creating new Evolution instance for agent:', agent.id);
        setIsCreatingInstance(true);
        
        try {
          const evolutionConfig = await createAgentWithAutoInstance(
            agent.id, 
            agent.name, 
            agent.phoneNumber
          );
          
          if (evolutionConfig && evolutionConfig.id) {
            console.log('Successfully created Evolution config:', evolutionConfig.id);
            setEvolutionConfigId(evolutionConfig.id);
            setConnectionStep('instructions');
            toast.success('Instância WhatsApp criada automaticamente');
            
            // Refresh data after creation
            await refreshData();
          } else {
            throw new Error('Falha ao criar instância automática');
          }
        } catch (error) {
          console.error('Error creating automatic instance:', error);
          setQrError('Erro ao criar instância automática. Tente novamente ou entre em contato com o suporte.');
          setConnectionStep('error');
        } finally {
          setIsCreatingInstance(false);
        }
      }
    } catch (error) {
      console.error('Error initializing Evolution config:', error);
      setQrError('Erro ao inicializar configuração EvolutionAPI');
      setConnectionStep('error');
      setIsCreatingInstance(false);
    }
  };

  const handleGenerateQrCode = async () => {
    if (!evolutionConfigId) {
      setQrError('Configuração EvolutionAPI não encontrada');
      return;
    }

    setIsGeneratingQr(true);
    setConnectionStep('qr');
    setQrError(null);
    setCurrentQrCode(null);
    
    try {
      console.log('🎯 Generating QR code with EvolutionAPI for config:', evolutionConfigId);
      
      const qrCodeData = await connectInstance(evolutionConfigId);
      
      if (qrCodeData) {
        // Tratar diferentes formatos de QR code da EvolutionAPI
        let qrCodeUrl = qrCodeData;
        
        // Se for base64, converter para data URL
        if (typeof qrCodeData === 'string' && !qrCodeData.startsWith('data:') && !qrCodeData.startsWith('http')) {
          qrCodeUrl = `data:image/png;base64,${qrCodeData}`;
        }
        
        setCurrentQrCode(qrCodeUrl);
        setRetryCount(0);
        console.log('✅ QR code generated successfully');
        toast.success('QR code gerado! Escaneie com o WhatsApp.');
        
        // Iniciar verificação de status mais agressiva
        startStatusChecking(evolutionConfigId);
      } else {
        throw new Error('QR code não foi retornado pela EvolutionAPI');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setQrError(`Erro ao gerar QR code: ${errorMessage}`);
      setRetryCount(prev => prev + 1);
      
      if (retryCount < 2) {
        toast.error('Erro ao conectar. Tentando novamente em 3 segundos...');
        setTimeout(() => {
          handleGenerateQrCode();
        }, 3000);
      } else {
        toast.error('Erro ao conectar com EvolutionAPI após várias tentativas');
      }
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleConnect = () => {
    setConnectionStep('connecting');
    onConnect();
  };

  const handleRetryConnection = () => {
    setQrError(null);
    setCurrentQrCode(null);
    setRetryCount(0);
    setEvolutionConfigId(null);
    setIsCreatingInstance(false);
    setIsCheckingStatus(false);
    
    // Parar verificação de status
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = null;
    }
    
    initializeEvolutionConfig();
  };

  const handleClose = () => {
    // Parar verificação de status
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = null;
    }
    
    setIsCheckingStatus(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (connectionStep) {
      case 'loading':
        return (
          <div className="space-y-4 text-center">
            <Clock className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
            <div>
              <h4 className="font-medium">
                {isCreatingInstance ? 'Criando instância...' : 'Configurando...'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isCreatingInstance 
                  ? 'Criando instância automática para o agente' 
                  : 'Verificando configurações existentes'
                }
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {qrError}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Informações do Agente:</h4>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{customer?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Agente:</span>
                  <span className="text-sm font-medium">{agent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium text-red-600">Erro na Configuração</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'instructions':
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Instância WhatsApp configurada automaticamente. Clique em "Conectar WhatsApp" para gerar o QR code.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Informações do Agente:</h4>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{customer?.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Agente:</span>
                  <span className="text-sm font-medium">{agent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Setor:</span>
                  <span className="text-sm font-medium">{agent?.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status API:</span>
                  <span className="text-sm font-medium text-green-600">Configurada</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Como conectar:</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Clique em "Conectar WhatsApp" para gerar o QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>Abra o WhatsApp no celular</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>Vá em Configurações → WhatsApp Web/Desktop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                  <span>Escaneie o código QR</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">5</span>
                  <span>🎉 O sistema detectará automaticamente a conexão!</span>
                </li>
              </ol>
            </div>
          </div>
        );
      
      case 'qr':
        return (
          <div className="space-y-4">
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                {qrError 
                  ? "Erro ao conectar com EvolutionAPI. Verifique a configuração."
                  : isCheckingStatus 
                    ? "🔍 Escaneie o código QR com o WhatsApp. Sistema verificando conexão automaticamente a cada 1,5s..."
                    : "Escaneie o código QR com o WhatsApp."
                }
              </AlertDescription>
            </Alert>
            
            {isCheckingStatus && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    🔄 Detectando conexão automática...
                  </span>
                </div>
              </div>
            )}
            
            <WhatsAppQRCode
              isGenerating={isGeneratingQr}
              qrCodeUrl={currentQrCode || undefined}
              error={qrError || undefined}
              onRefresh={handleGenerateQrCode}
              onConnect={handleConnect}
              className="flex justify-center"
            />
          </div>
        );
      
      case 'connecting':
        return (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto animate-pulse" />
            <div>
              <h4 className="font-medium">Conectando...</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Estabelecendo conexão com o WhatsApp via EvolutionAPI
              </p>
            </div>
          </div>
        );

      case 'connected':
        return (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h4 className="font-medium text-green-600">🎉 WhatsApp Conectado!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Conexão estabelecida com sucesso. Fechando automaticamente...
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (connectionStep) {
      case 'loading':
        return isCreatingInstance ? 'Criando Instância' : 'Configurando Instância';
      case 'error':
        return 'Erro na Configuração';
      case 'instructions':
        return 'Conectar Agente ao WhatsApp';
      case 'qr':
        return 'Escaneie o QR Code';
      case 'connecting':
        return 'Conectando WhatsApp';
      case 'connected':
        return 'Conectado com Sucesso!';
      default:
        return 'Conectar WhatsApp';
    }
  };

  const getDialogDescription = () => {
    switch (connectionStep) {
      case 'loading':
        return isCreatingInstance 
          ? 'Criando instância automática da EvolutionAPI para o agente...'
          : 'Verificando configurações existentes...';
      case 'error':
        return 'Erro na configuração. Verifique se a EvolutionAPI está configurada corretamente.';
      case 'instructions':
        return 'Instância configurada automaticamente. Pronto para conectar ao WhatsApp.';
      case 'qr':
        return isCheckingStatus 
          ? 'QR Code gerado. Escaneie e o sistema detectará automaticamente sua conexão a cada 1,5 segundos.'
          : 'QR Code gerado. Use o WhatsApp do celular para escanear.';
      case 'connecting':
        return 'Estabelecendo conexão com o WhatsApp...';
      case 'connected':
        return 'WhatsApp conectado com sucesso! O modal será fechado automaticamente.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {connectionStep === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Fechar
              </Button>
              <Button onClick={handleRetryConnection} className="w-full sm:w-auto">
                Tentar Novamente
              </Button>
            </>
          )}

          {connectionStep === 'instructions' && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Configurar depois
              </Button>
              <Button onClick={handleGenerateQrCode} className="w-full sm:w-auto">
                Conectar WhatsApp
              </Button>
            </>
          )}
          
          {connectionStep === 'qr' && (
            <>
              <Button variant="outline" onClick={() => setConnectionStep('instructions')} className="w-full sm:w-auto">
                Voltar
              </Button>
              {qrError && (
                <Button onClick={handleRetryConnection} className="w-full sm:w-auto">
                  Tentar Novamente
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Configurar depois
              </Button>
            </>
          )}
          
          {(connectionStep === 'connecting' || connectionStep === 'connected') && (
            <Button variant="outline" onClick={handleClose} disabled={connectionStep === 'connected'} className="w-full sm:w-auto">
              {connectionStep === 'connected' ? 'Fechando...' : 'Conectando...'}
            </Button>
          )}

          {connectionStep === 'loading' && (
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
