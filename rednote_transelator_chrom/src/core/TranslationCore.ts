import { 
  TranslationProvider,
  TranslationResult,
  TranslationError
} from '../types';
import { EventManager } from './EventManager';

export class TranslationCore {
    private provider: TranslationProvider;
    private eventManager: EventManager;

    constructor(provider: TranslationProvider) {
        this.provider = provider;
        this.eventManager = EventManager.getInstance();
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        // 监听翻译请求事件
        this.eventManager.subscribe('translation:request', async (data) => {
            const { text, requestId } = data;
            try {
                this.eventManager.emit('translation:start', { requestId });
                const result = await this.translate(text);
                this.eventManager.emit('translation:success', { requestId, result });
            } catch (error) {
                this.eventManager.emit('translation:error', { requestId, error });
            }
        });
    }

    public async translate(text: string): Promise<TranslationResult> {
        if (!text.trim()) {
            throw new TranslationError({ type: 'VALIDATION_ERROR', error: 'Translation text cannot be empty' });
        }

        try {
            const result = await this.provider.translate(text, 'zh', 'en');
            return {
                originalText: text,
                translatedText: result,
                from: 'zh',
                to: 'en',
                mode: 'normal'
            };
        } catch (error) {
            console.error('Translation failed:', error);
            throw new TranslationError({ 
                type: 'TRANSLATION_ERROR', 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    public setProvider(provider: TranslationProvider): void {
        this.provider = provider;
    }

    public getProvider(): TranslationProvider {
        return this.provider;
    }
} 