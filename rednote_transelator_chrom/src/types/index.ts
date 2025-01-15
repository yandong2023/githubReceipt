// 基础翻译类型
export interface TranslationProvider {
  name: string;
  translate(text: string, from: string, to: string): Promise<string>;
  supportedLanguages(): Promise<string[]>;
  clearCache?(): void;
}

// 翻译结果类型
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  from: string;
  to: string;
  mode: 'normal' | 'copy' | 'replace';
}

// 消息响应类型
export interface TranslationResponse {
  type: 'TRANSLATION_RESULT';
  result: TranslationResult;
}

// 错误类型
export class TranslationError extends Error {
  constructor(public details: {
    type: 'TRANSLATION_ERROR';
    error: string;
  }) {
    super(details.error);
    this.name = 'TranslationError';
  }
}

export interface TranslationRequest {
  text: string;
  requestId?: string;
  mode?: 'normal' | 'copy' | 'replace';
} 