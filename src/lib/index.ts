// Main exports
export { default as ChatWidget } from './ChatWidget.svelte';

// Type exports
export type { ChatWidgetProps, Message, ChatSession, HistoryResponse, SendMessageRequest } from './types.js';

// Store exports (for advanced use cases)
export { createChatStore } from './stores/chat.svelte.js';
export type { ChatStore } from './stores/chat.svelte.js';
