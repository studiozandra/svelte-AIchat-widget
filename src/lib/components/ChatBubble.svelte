<script lang="ts">
	interface Props {
		onclick: () => void;
		isOpen?: boolean;
	}

	let { onclick, isOpen = false }: Props = $props();
</script>

<button
	class="chat-bubble"
	onclick={onclick}
	aria-label="Open chat"
	title="Open chat"
	class:hidden={isOpen}
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
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
	</svg>
</button>

<style>
	.chat-bubble {
		position: fixed;
		bottom: var(--chat-bubble-bottom, 1.5rem);
		right: var(--chat-bubble-right, 1.5rem);
		width: var(--chat-bubble-size, 3.5rem);
		height: var(--chat-bubble-size, 3.5rem);
		border-radius: var(--chat-bubble-radius, 50%);
		background: var(--chat-bubble-bg, #4f46e5);
		color: var(--chat-bubble-color, white);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: all 0.2s ease-in-out;
		z-index: 9998;
	}

	.chat-bubble:hover {
		transform: scale(1.1);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.chat-bubble.hidden {
		display: none;
	}

	.chat-bubble svg {
		width: 1.75rem;
		height: 1.75rem;
	}
</style>
