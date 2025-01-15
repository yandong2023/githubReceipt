export interface TranslationProvider {
  translate(text: string, from: string, to: string): Promise<string>;
  supportedLanguages?(): Promise<string[]>;
  name: string;
}

export interface TranslationConfig {
  provider: string;
  apiKey: string;
  defaultSourceLang: string;
  defaultTargetLang: string;
} 