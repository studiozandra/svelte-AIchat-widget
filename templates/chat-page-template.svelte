<!-- Copy this to your SvelteKit page (e.g., src/routes/+page.svelte) -->
<!-- Example usage of @studiozandra/svelte-ai-chat-widget -->

<script lang="ts">
	import { ChatWidget } from '@studiozandra/svelte-ai-chat-widget';

	// Optional: Context to send with each message
	// NOTE: Do NOT include userId - it's automatically extracted from your authenticated session
	const userContext = {
		pageUrl: typeof window !== 'undefined' ? window.location.href : '',
		// Add other non-sensitive context as needed
		userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
	};

	// Optional: Custom internationalization
	const i18n = {
		placeholder: 'Type your message...',
		title: 'AI Assistant',
		sendButton: 'Send',
		errorMessage: 'Something went wrong. Please try again.',
		// Add these for authentication
		authRequired: 'Please log in to use the chatbot',
		unauthorized: 'You are not authorized to access this chat'
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

	function handleError(error: { message: string; status?: number }) {
		console.error('Chat error:', error);
		// Handle 401 (auth required) and 403 (forbidden) errors
		if (error.status === 401) {
			// Redirect to login or show auth modal
			window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
		}
	}
</script>

<div class="page-container">
	<h1>Welcome to My App</h1>
	<p>Your page content goes here...</p>

	<!-- Chat Widget - Only works for authenticated users -->
	<ChatWidget
		sendMessageEndpoint="/api/chat/send"
		historyEndpoint="/api/chat/history"
		context={userContext}
		theme="light"
		{i18n}
		onopen={handleOpen}
		onclose={handleClose}
		onmessage={handleMessage}
		onerror={handleError}
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
