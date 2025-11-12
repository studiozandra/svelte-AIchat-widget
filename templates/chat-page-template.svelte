<!-- Copy this to your SvelteKit page (e.g., src/routes/+page.svelte) -->
<!-- Example usage of @studiozandra/svelte-ai-chat-widget -->

<script lang="ts">
	import { ChatWidget } from '@studiozandra/svelte-ai-chat-widget';

	// Optional: User context to send with each message
	const userContext = {
		userId: '123',
		role: 'user',
		pageUrl: typeof window !== 'undefined' ? window.location.href : ''
	};

	// Optional: Custom internationalization
	const i18n = {
		placeholder: 'Type your message...',
		title: 'AI Assistant',
		sendButton: 'Send',
		errorMessage: 'Something went wrong. Please try again.'
	};

	// Optional: Event handlers
	function handleOpen() {
		console.log('Chat opened');
	}

	function handleClose() {
		console.log('Chat closed');
	}

	function handleMessage(message: { role: string; content: string }) {
		console.log('Message:', message);
	}
</script>

<div class="page-container">
	<h1>Welcome to My App</h1>
	<p>Your page content goes here...</p>

	<!-- Chat Widget -->
	<ChatWidget
		sendMessageEndpoint="/api/chat/send"
		historyEndpoint="/api/chat/history"
		context={userContext}
		theme="light"
		{i18n}
		onopen={handleOpen}
		onclose={handleClose}
		onmessage={handleMessage}
	/>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}
</style>
