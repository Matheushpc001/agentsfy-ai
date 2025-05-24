
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  retryCondition?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryCondition = (error) => error.name === 'NetworkError' || error.status >= 500
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(error)) {
        break;
      }

      // Calculate delay (with exponential backoff if enabled)
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

export function createRetryableFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: RetryOptions
) {
  return (...args: T): Promise<R> => {
    return withRetry(() => fn(...args), options);
  };
}
