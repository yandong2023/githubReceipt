import { TranslationProvider } from '../types/provider';

export class GoogleTranslator implements TranslationProvider {
  readonly name = 'Google';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text'
      })
    });

    const result = await response.json();
    return result.data.translations[0].translatedText;
  }
} 