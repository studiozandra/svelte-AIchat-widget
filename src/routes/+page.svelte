<script lang="ts">
	import { ChatWidget } from '$lib/index.js';

	const userContext = {
		userId: '123',
		role: 'demo-user',
		pageUrl: typeof window !== 'undefined' ? window.location.href : ''
	};
</script>

<div class="container">
	<h1>AI Chat Widget Demo</h1>
	<p>Click the chat bubble in the bottom right corner to open the chat widget.</p>

	<div class="info">
		<h2>Test Configuration</h2>
		<ul>
			<li><strong>Send Endpoint:</strong> /api/chat/send</li>
			<li><strong>History Endpoint:</strong> /api/chat/history</li>
			<li><strong>Theme:</strong> light</li>
		</ul>
		<p class="note">
			<strong>Note:</strong> The chat widget requires backend API endpoints to function.
			Make sure you have implemented the required endpoints as described in the README.
		</p>
	</div>
</div>

<ChatWidget
	sendMessageEndpoint="/api/chat/send"
	historyEndpoint="/api/chat/history"
	context={userContext}
	theme="light"
/>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		color: #4f46e5;
		margin-bottom: 1rem;
	}

	.info {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-top: 2rem;
	}

	.info h2 {
		margin-top: 0;
		color: #1f2937;
		font-size: 1.25rem;
	}

	.info ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.info li {
		margin: 0.5rem 0;
	}

	.note {
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		padding: 1rem;
		margin-top: 1rem;
		border-radius: 4px;
	}
</style>
