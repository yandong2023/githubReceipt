import { TranslationError } from '../types';

export class TranslationErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // ms

  static async withRetry<T>(
    operation: () => Promise<T>,
    context: { requestId?: string } = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.MAX_RETRIES) {
          throw new TranslationError({
            type: 'TRANSLATION_ERROR',
            error: lastError?.message || 'Unknown error'
          });
        }

        console.warn(`Retry attempt ${attempt} of ${this.MAX_RETRIES}...`);
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }

    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 