<script lang="ts">
	import type { Message } from '../types.js';

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();

	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="message-item" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
	<div class="message-content">
		{#if message.streaming}
			<div class="message-text streaming">
				{@html message.content}
				<span class="cursor">▊</span>
			</div>
		{:else}
			<div class="message-text">
				{@html message.content}
			</div>
		{/if}
		<div class="message-time">{formatTime(message.timestamp)}</div>
	</div>
</div>

<style>
	.message-item {
		display: flex;
		margin-bottom: 1rem;
		animation: slideIn 0.2s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message-item.user {
		justify-content: flex-end;
	}

	.message-item.assistant {
		justify-content: flex-start;
	}

	.message-content {
		max-width: 80%;
		padding: 0.75rem 1rem;
		border-radius: var(--chat-message-radius, 1rem);
	}

	.message-item.user .message-content {
		background: var(--chat-user-message-bg, #4f46e5);
		color: var(--chat-user-message-color, white);
		border-bottom-right-radius: 0.25rem;
	}

	.message-item.assistant .message-content {
		background: var(--chat-assistant-message-bg, #f3f4f6);
		color: var(--chat-assistant-message-color, #1f2937);
		border-bottom-left-radius: 0.25rem;
	}

	.message-text {
		font-size: 0.875rem;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.message-text.streaming .cursor {
		animation: blink 1s infinite;
		margin-left: 0.125rem;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	.message-time {
		font-size: 0.625rem;
		opacity: 0.7;
		margin-top: 0.25rem;
		text-align: right;
	}

	.message-item.assistant .message-time {
		text-align: left;
	}

	/* Markdown content styling */
	.message-text :global(p) {
		margin: 0.5rem 0;
	}

	.message-text :global(p:first-child) {
		margin-top: 0;
	}

	.message-text :global(p:last-child) {
		margin-bottom: 0;
	}

	.message-text :global(code) {
		background: var(--chat-code-bg, rgba(0, 0, 0, 0.1));
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.8125rem;
	}

	.message-item.user .message-text :global(code) {
		background: rgba(255, 255, 255, 0.2);
	}

	.message-text :global(pre) {
		background: var(--chat-code-block-bg, #1e293b);
		color: var(--chat-code-block-color, #e2e8f0);
		padding: 0.75rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 0.5rem 0;
	}

	.message-text :global(pre code) {
		background: none;
		padding: 0;
	}
</style>
