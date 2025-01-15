import { TranslationProvider, TranslationError } from '../types';

export class DeepseekTranslator implements TranslationProvider {
  private static readonly API_KEY = 'sk-08a7a7fecaad40869406f20f2d5e185d';
  private cache: Map<string, string>;
  readonly name = 'Deepseek';
  private isTestMode = true;

  constructor() {
    this.cache = new Map();
    console.log('DeepseekTranslator initialized');
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    console.log('DeepseekTranslator.translate called:', { text, from, to });

    if (!text?.trim()) {
      throw new TranslationError({
        type: 'TRANSLATION_ERROR',
        error: '翻译文本不能为空'
      });
    }

    if (this.isTestMode) {
      console.log('Using test mode translation');
      if (to === 'en') {
        return `[English] ${text}`;
      } else if (to === 'zh') {
        return `[中文] ${text}`;
      } else {
        return `[${to}] ${text}`;
      }
    }

    const cacheKey = this.getCacheKey(text, from, to);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      console.log('Cache hit:', cachedResult);
      return cachedResult;
    }

    try {
      console.log('Making API request to Deepseek...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DeepseekTranslator.API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text from ${from} to ${to}. Only return the translated text without any explanations or additional information.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deepseek API error:', errorText);
        throw new TranslationError({
          type: 'TRANSLATION_ERROR',
          error: `Deepseek API error: ${errorText}`
        });
      }

      const result = await response.json();
      console.log('Deepseek API result:', result);

      if (!result.choices?.[0]?.message?.content) {
        throw new TranslationError({
          type: 'TRANSLATION_ERROR',
          error: 'Invalid response from Deepseek API'
        });
      }

      const translatedText = result.choices[0].message.content.trim();
      this.cache.set(cacheKey, translatedText);

      console.log('Translation successful:', translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      if (error instanceof TranslationError) {
        throw error;
      }
      throw new TranslationError({
        type: 'TRANSLATION_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text}`;
  }

  async supportedLanguages(): Promise<string[]> {
    return ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'];
  }

  clearCache(): void {
    this.cache.clear();
  }
} 