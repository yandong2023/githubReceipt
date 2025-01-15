import { TranslationProvider } from '../types/provider';
import { TranslationError } from '../types';

export class DeepLTranslator implements TranslationProvider {
  private apiKey: string;
  private cache: Map<string, string>;
  readonly name = 'DeepL';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  private getCacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text}`;
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    // 检查缓存
    const cacheKey = this.getCacheKey(text, from, to);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text,
          source_lang: from.toUpperCase(),
          target_lang: to.toUpperCase(),
          formality: 'more'  // 使用更正式的翻译风格
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new TranslationError({
          type: 'TRANSLATION_ERROR',
          error: typeof errorData.error === 'object' && errorData.error !== null
            ? errorData.error.message || 'Unknown error'
            : 'API request failed'
        });
      }

      const result = await response.json();
      const translatedText = result.translations[0].text;

      // 缓存结果
      this.cache.set(cacheKey, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      throw new TranslationError({
        type: 'TRANSLATION_ERROR',
        error: `DeepL translation failed: ${error.message}`
      });
    }
  }

  async supportedLanguages(): Promise<string[]> {
    try {
      const response = await fetch('https://api-free.deepl.com/v2/languages', {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch supported languages: ${response.status}`);
      }

      const languages = await response.json();
      return languages.map(lang => lang.language.toLowerCase());
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      return ['en', 'zh']; // 返回基本支持的语言
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
} 