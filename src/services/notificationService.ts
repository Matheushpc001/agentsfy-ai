
import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  success(message: string, options?: NotificationOptions) {
    toast.success(options?.title || 'Sucesso', {
      description: options?.description || message,
      duration: options?.duration,
      action: options?.action,
    });
  }

  error(message: string, options?: NotificationOptions) {
    toast.error(options?.title || 'Erro', {
      description: options?.description || message,
      duration: options?.duration,
      action: options?.action,
    });
  }

  warning(message: string, options?: NotificationOptions) {
    toast.warning(options?.title || 'Atenção', {
      description: options?.description || message,
      duration: options?.duration,
      action: options?.action,
    });
  }

  info(message: string, options?: NotificationOptions) {
    toast.info(options?.title || 'Informação', {
      description: options?.description || message,
      duration: options?.duration,
      action: options?.action,
    });
  }

  loading(message: string, options?: { description?: string }) {
    return toast.loading(message, {
      description: options?.description,
    });
  }

  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Notificações específicas do sistema
  agentCreated(agentName: string) {
    this.success(`Agente "${agentName}" criado com sucesso!`);
  }

  agentUpdated(agentName: string) {
    this.success(`Agente "${agentName}" atualizado com sucesso!`);
  }

  agentDeleted(agentName: string) {
    this.success(`Agente "${agentName}" excluído com sucesso!`);
  }

  whatsappConnected(agentName: string) {
    this.success('WhatsApp conectado', {
      description: `O agente "${agentName}" foi conectado ao WhatsApp com sucesso!`,
    });
  }

  formValidationError() {
    this.error('Erro de validação', {
      description: 'Por favor, corrija os erros no formulário antes de continuar.',
    });
  }

  networkError() {
    this.error('Erro de conexão', {
      description: 'Verifique sua conexão com a internet e tente novamente.',
      action: {
        label: 'Tentar novamente',
        onClick: () => window.location.reload(),
      },
    });
  }

  unexpectedError() {
    this.error('Erro inesperado', {
      description: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
      action: {
        label: 'Recarregar página',
        onClick: () => window.location.reload(),
      },
    });
  }
}

export const notificationService = new NotificationService();
