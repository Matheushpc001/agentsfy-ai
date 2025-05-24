
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorOptions {
  title?: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

interface AsyncErrorOptions extends ErrorOptions {
  onSuccess?: (result: any) => void;
  loadingMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((error: Error | string, options?: ErrorOptions) => {
    console.error('Error caught by useErrorHandler:', error);
    
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    toast.error(options?.title || 'Erro', {
      description: options?.description || errorMessage || 'Ocorreu um erro inesperado',
      action: options?.action && options?.actionLabel ? {
        label: options.actionLabel,
        onClick: options.action,
      } : undefined,
    });
  }, []);

  const handleAsyncError = useCallback(async function<T>(
    asyncFn: () => Promise<T>,
    options?: AsyncErrorOptions
  ): Promise<T | null> {
    try {
      if (options?.loadingMessage) {
        toast.loading(options.loadingMessage);
      }
      
      const result = await asyncFn();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
}
