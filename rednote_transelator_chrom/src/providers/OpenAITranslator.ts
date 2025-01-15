import { TranslationProvider } from '../types/provider';

export class OpenAITranslator implements TranslationProvider {
  readonly name = 'OpenAI';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate from ${from} to ${to}.`
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const result = await response.json();
    return result.choices[0].message.content;
  }
} 