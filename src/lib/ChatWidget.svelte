<script lang="ts">
	import type { ChatWidgetProps, HistoryResponse, SendMessageRequest } from './types.js';
	import type { Snippet } from 'svelte';
	import { createChatStore } from './stores/chat.svelte.js';
	import ChatBubble from './components/ChatBubble.svelte';
	import ChatWindow from './components/ChatWindow.svelte';
	import { streamResponse } from './utils/streaming.js';
	import { parseMarkdown } from './utils/markdown.js';
	import { onMount } from 'svelte';

	interface Props extends ChatWidgetProps {
		header?: Snippet;
		footer?: Snippet;
		onopen?: () => void;
		onclose?: () => void;
		onmessage?: (message: { role: string; content: string }) => void;
	}

	let {
		sendMessageEndpoint,
		historyEndpoint,
		context,
		i18n = {
			placeholder: 'Type a message...',
			title: 'Chat',
			sendButton: 'Send',
			errorMessage: 'Something went wrong. Please try again.'
		},
		theme = 'light',
		header,
		footer,
		onopen,
		onclose,
		onmessage
	}: Props = $props();

	const store = createChatStore();

	// Apply theme
	let themeClass = $derived(theme === 'light' || theme === 'dark' ? `chat-theme-${theme}` : theme);

	// Fetch conversation history on mount
	onMount(async () => {
		await fetchHistory();
	});

	async function fetchHistory() {
		try {
			const url = new URL(historyEndpoint, window.location.origin);
			url.searchParams.set('sessionId', store.sessionId);
			url.searchParams.set('limit', '50');
			url.searchParams.set('offset', '0');

			const response = await fetch(url.toString());
			if (!response.ok) return;

			const data: HistoryResponse = await response.json();
			if (data.messages && data.messages.length > 0) {
				store.setMessages(data.messages);
			}
		} catch (error) {
			// Silently fail - no history available
			console.error('Failed to fetch history:', error);
		}
	}

	async function handleSendMessage(message: string) {
		// Add user message to the chat
		store.addMessage({
			role: 'user',
			content: message
		});

		onmessage?.({ role: 'user', content: message });

		store.setLoading(true);
		store.clearError();

		// Create assistant message for streaming
		const assistantMessage = store.addMessage({
			role: 'assistant',
			content: '',
			streaming: true
		});

		try {
			const requestBody: SendMessageRequest = {
				message,
				sessionId: store.sessionId,
				context
			};

			const response = await fetch(sendMessageEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			let fullContent = '';

			await streamResponse(
				response,
				(chunk: string) => {
					fullContent += chunk;
					store.updateMessage(assistantMessage.id, {
						content: parseMarkdown(fullContent),
						streaming: true
					});
				},
				() => {
					store.updateMessage(assistantMessage.id, {
						content: parseMarkdown(fullContent),
						streaming: false
					});
					store.setLoading(false);
					onmessage?.({ role: 'assistant', content: fullContent });
				},
				(error: Error) => {
					console.error('Streaming error:', error);
					store.setError(i18n.errorMessage || 'Something went wrong. Please try again.');
					store.setLoading(false);
					// Remove the failed message
					store.setMessages(store.messages.filter((m) => m.id !== assistantMessage.id));
				}
			);
		} catch (error) {
			console.error('Failed to send message:', error);
			store.setError(i18n.errorMessage || 'Something went wrong. Please try again.');
			store.setLoading(false);
			// Remove the failed message
			store.setMessages(store.messages.filter((m) => m.id !== assistantMessage.id));
		}
	}

	function handleOpen() {
		store.open();
		onopen?.();
	}

	function handleClose() {
		store.close();
		onclose?.();
	}

	function handleEscapeKey(event: KeyboardEvent) {
		if (event.key === 'Escape' && store.isOpen) {
			handleClose();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleEscapeKey);
		return () => {
			window.removeEventListener('keydown', handleEscapeKey);
		};
	});
</script>

<div class="chat-widget-container {themeClass}">
	<ChatBubble onclick={handleOpen} isOpen={store.isOpen} />

	{#if store.isOpen}
		<ChatWindow
			{store}
			title={i18n.title}
			placeholder={i18n.placeholder}
			sendButton={i18n.sendButton}
			onClose={handleClose}
			onSend={handleSendMessage}
			{header}
			{footer}
		/>
	{/if}
</div>

<style>
	.chat-widget-container {
		font-family: var(--chat-font-family, system-ui, -apple-system, sans-serif);
	}

	/* Light theme (default) */
	.chat-theme-light {
		--chat-bubble-bg: #4f46e5;
		--chat-bubble-color: white;
		--chat-window-bg: white;
		--chat-header-bg: #4f46e5;
		--chat-header-color: white;
		--chat-messages-bg: #fafafa;
		--chat-user-message-bg: #4f46e5;
		--chat-user-message-color: white;
		--chat-assistant-message-bg: #f3f4f6;
		--chat-assistant-message-color: #1f2937;
		--chat-input-bg: white;
		--chat-input-color: #1f2937;
		--chat-input-border: #e5e7eb;
		--chat-input-focus-border: #4f46e5;
		--chat-send-button-bg: #4f46e5;
		--chat-send-button-color: white;
		--chat-send-button-hover-bg: #4338ca;
		--chat-empty-color: #9ca3af;
		--chat-error-bg: #fef2f2;
		--chat-error-color: #991b1b;
		--chat-error-border: #fecaca;
		--chat-code-bg: rgba(0, 0, 0, 0.1);
		--chat-code-block-bg: #1e293b;
		--chat-code-block-color: #e2e8f0;
	}

	/* Dark theme */
	.chat-theme-dark {
		--chat-bubble-bg: #6366f1;
		--chat-bubble-color: white;
		--chat-window-bg: #1f2937;
		--chat-header-bg: #6366f1;
		--chat-header-color: white;
		--chat-messages-bg: #111827;
		--chat-user-message-bg: #6366f1;
		--chat-user-message-color: white;
		--chat-assistant-message-bg: #374151;
		--chat-assistant-message-color: #f9fafb;
		--chat-input-bg: #374151;
		--chat-input-color: #f9fafb;
		--chat-input-border: #4b5563;
		--chat-input-focus-border: #6366f1;
		--chat-send-button-bg: #6366f1;
		--chat-send-button-color: white;
		--chat-send-button-hover-bg: #4f46e5;
		--chat-empty-color: #6b7280;
		--chat-error-bg: #7f1d1d;
		--chat-error-color: #fecaca;
		--chat-error-border: #991b1b;
		--chat-code-bg: rgba(255, 255, 255, 0.1);
		--chat-code-block-bg: #0f172a;
		--chat-code-block-color: #e2e8f0;
	}

	/* Global styles injected by the widget */
	:global(.chat-widget-container *) {
		box-sizing: border-box;
	}
</style>
