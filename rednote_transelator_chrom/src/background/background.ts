import { TranslationRequest, TranslationResponse, TranslationError } from '../types';
import { DeepseekTranslator } from '../providers/DeepseekTranslator';

const translator = new DeepseekTranslator();

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  // 翻译选中文本
  chrome.contextMenus.create({
    id: 'translate-selection',
    title: '翻译选中文本',
    contexts: ['selection']
  });

  // 翻译整个段落
  chrome.contextMenus.create({
    id: 'translate-paragraph',
    title: '翻译整个段落',
    contexts: ['selection']
  });

  // 分隔线
  chrome.contextMenus.create({
    id: 'separator-1',
    type: 'separator',
    contexts: ['selection']
  });

  // 翻译并复制
  chrome.contextMenus.create({
    id: 'translate-and-copy',
    title: '翻译并复制结果',
    contexts: ['selection']
  });

  // 翻译并替换
  chrome.contextMenus.create({
    id: 'translate-and-replace',
    title: '翻译并替换原文',
    contexts: ['selection', 'editable']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  switch (info.menuItemId) {
    case 'translate-selection':
      handleTranslation(info.selectionText, tab.id, 'normal');
      break;

    case 'translate-paragraph':
      // 发送消息给 content script 获取整个段落
      chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PARAGRAPH',
        selectionText: info.selectionText
      });
      break;

    case 'translate-and-copy':
      handleTranslation(info.selectionText, tab.id, 'copy');
      break;

    case 'translate-and-replace':
      handleTranslation(info.selectionText, tab.id, 'replace');
      break;
  }
});

// 处理来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('%c后台收到消息', 'background: #222; color: #bada55', request);
  
  if (request.type === 'TRANSLATE') {
    const tabId = sender.tab?.id;
    if (!tabId) {
      console.error('No tab ID found');
      return;
    }

    // 使用实际的翻译器
    handleTranslation(request.text, tabId, 'normal')
      .then(() => {
        console.log('Translation handled successfully');
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Translation failed:', error);
        sendResponse({ success: false, error });
      });

    return true; // 保持消息通道开放以支持异步响应
  }
});

async function handleTranslation(
  text: string, 
  tabId: number, 
  mode: 'normal' | 'copy' | 'replace'
) {
  console.log('%c开始翻译', 'background: #222; color: #bada55', {
    text,
    tabId,
    mode,
    timestamp: new Date().toISOString()
  });

  try {
    const translatedText = await translator.translate(text, 'zh', 'en');
    console.log('%c翻译成功', 'background: #222; color: #bada55', {
      original: text,
      translated: translatedText
    });
    
    const response: TranslationResponse = {
      type: 'TRANSLATION_RESULT',
      result: {
        originalText: text,
        translatedText,
        from: 'zh',
        to: 'en',
        mode
      }
    };

    console.log('%c发送翻译结果到内容脚本', 'background: #222; color: #bada55', response);
    chrome.tabs.sendMessage(tabId, response);
  } catch (error) {
    console.error('%c翻译失败', 'background: #222; color: red', error);
    if (error instanceof TranslationError) {
      chrome.tabs.sendMessage(tabId, {
        type: 'TRANSLATION_ERROR',
        error: error.message
      });
    }
  }
}

// 添加快捷键监听
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'translate-selection') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab?.id) return;

    // 获取选中的文本
    chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
  }
}); 