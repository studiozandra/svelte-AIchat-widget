<script lang="ts">
	import type { ChatStore } from '../stores/chat.svelte';
	import type { Snippet } from 'svelte';
	import MessageItem from './MessageItem.svelte';

	interface Props {
		store: ChatStore;
		title: string;
		placeholder: string;
		sendButton?: string;
		onClose: () => void;
		onSend: (message: string) => void;
		header?: Snippet;
		footer?: Snippet;
	}

	let {
		store,
		title,
		placeholder,
		sendButton = 'Send',
		onClose,
		onSend,
		header,
		footer
	}: Props = $props();

	let inputValue = $state('');
	let messagesContainer: HTMLDivElement;

	function handleSubmit(e: Event) {
		e.preventDefault();
		const message = inputValue.trim();
		if (!message || store.isLoading) return;

		onSend(message);
		inputValue = '';
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	}

	$effect(() => {
		// Auto-scroll to bottom when new messages arrive
		if (messagesContainer && store.messages.length > 0) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});
</script>

<div class="chat-window">
	<div class="chat-header">
		{#if header}
			{@render header()}
		{:else}
			<div class="chat-title">{title}</div>
		{/if}
		<button class="close-button" onclick={onClose} aria-label="Close chat" title="Close chat">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>

	<div class="chat-messages" bind:this={messagesContainer}>
		{#if store.messages.length === 0}
			<div class="empty-state">
				<p>Start a conversation!</p>
			</div>
		{:else}
			{#each store.messages as message (message.id)}
				<MessageItem {message} />
			{/each}
		{/if}

		{#if store.isLoading && store.messages[store.messages.length - 1]?.role !== 'assistant'}
			<div class="typing-indicator">
				<span></span>
				<span></span>
				<span></span>
			</div>
		{/if}
	</div>

	{#if store.error}
		<div class="error-banner">
			<span>{store.error}</span>
			<button onclick={() => store.clearError()} aria-label="Dismiss error">×</button>
		</div>
	{/if}

	<div class="chat-input-container">
		{#if footer}
			{@render footer()}
		{/if}
		<form onsubmit={handleSubmit} class="chat-input-form">
			<input
				type="text"
				bind:value={inputValue}
				onkeydown={handleKeyDown}
				{placeholder}
				disabled={store.isLoading}
				class="chat-input"
				aria-label="Message input"
			/>
			<button
				type="submit"
				disabled={!inputValue.trim() || store.isLoading}
				class="send-button"
				aria-label={sendButton}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="22" y1="2" x2="11" y2="13"></line>
					<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
				</svg>
			</button>
		</form>
	</div>
</div>

<style>
	.chat-window {
		position: fixed;
		bottom: var(--chat-window-bottom, 1.5rem);
		right: var(--chat-window-right, 1.5rem);
		width: var(--chat-window-width, 24rem);
		height: var(--chat-window-height, 32rem);
		max-height: calc(100vh - 3rem);
		background: var(--chat-window-bg, white);
		border-radius: var(--chat-window-radius, 1rem);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		z-index: 9999;
		overflow: hidden;
	}

	@media (max-width: 640px) {
		.chat-window {
			bottom: 0;
			right: 0;
			left: 0;
			width: 100%;
			height: 100vh;
			max-height: 100vh;
			border-radius: 0;
		}
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: var(--chat-header-bg, #4f46e5);
		color: var(--chat-header-color, white);
		border-top-left-radius: var(--chat-window-radius, 1rem);
		border-top-right-radius: var(--chat-window-radius, 1rem);
	}

	@media (max-width: 640px) {
		.chat-header {
			border-radius: 0;
		}
	}

	.chat-title {
		font-size: 1rem;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.close-button:hover {
		opacity: 1;
	}

	.close-button svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		background: var(--chat-messages-bg, #fafafa);
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--chat-empty-color, #9ca3af);
		font-size: 0.875rem;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		background: var(--chat-assistant-message-bg, #f3f4f6);
		color: var(--chat-assistant-message-color, #1f2937);
		border-radius: var(--chat-message-radius, 1rem);
		border-bottom-left-radius: 0.25rem;
		width: fit-content;
		max-width: 80%;
	}

	.typing-indicator span {
		width: 0.5rem;
		height: 0.5rem;
		background: currentColor;
		border-radius: 50%;
		opacity: 0.4;
		animation: typing 1.4s infinite;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typing {
		0%,
		60%,
		100% {
			opacity: 0.4;
		}
		30% {
			opacity: 1;
		}
	}

	.error-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--chat-error-bg, #fef2f2);
		color: var(--chat-error-color, #991b1b);
		font-size: 0.875rem;
		border-top: 1px solid var(--chat-error-border, #fecaca);
	}

	.error-banner button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: 1.25rem;
		line-height: 1;
		padding: 0;
		margin-left: 0.5rem;
		opacity: 0.7;
	}

	.error-banner button:hover {
		opacity: 1;
	}

	.chat-input-container {
		border-top: 1px solid var(--chat-input-border, #e5e7eb);
		background: var(--chat-window-bg, white);
		border-bottom-left-radius: var(--chat-window-radius, 1rem);
		border-bottom-right-radius: var(--chat-window-radius, 1rem);
	}

	@media (max-width: 640px) {
		.chat-input-container {
			border-radius: 0;
		}
	}

	.chat-input-form {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
	}

	.chat-input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--chat-input-border, #e5e7eb);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.2s;
		background: var(--chat-input-bg, white);
		color: var(--chat-input-color, #1f2937);
	}

	.chat-input:focus {
		border-color: var(--chat-input-focus-border, #4f46e5);
	}

	.chat-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.send-button {
		background: var(--chat-send-button-bg, #4f46e5);
		color: var(--chat-send-button-color, white);
		border: none;
		border-radius: 0.5rem;
		padding: 0.75rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.send-button:hover:not(:disabled) {
		background: var(--chat-send-button-hover-bg, #4338ca);
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.send-button svg {
		width: 1.25rem;
		height: 1.25rem;
	}
</style>
