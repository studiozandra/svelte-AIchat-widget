import type { Message } from '../types.js';

const SESSION_STORAGE_KEY = 'chat-widget-session-id';

function generateSessionId(): string {
	return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredSessionId(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(SESSION_STORAGE_KEY);
}

function storeSessionId(sessionId: string): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function createChatStore() {
	let sessionId = $state(getStoredSessionId() || generateSessionId());
	let messages = $state<Message[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let isOpen = $state(false);

	// Store session ID when it changes
	$effect(() => {
		storeSessionId(sessionId);
	});

	function addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
		const newMessage: Message = {
			...message,
			id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			timestamp: Date.now()
		};
		messages = [...messages, newMessage];
		return newMessage;
	}

	function updateMessage(id: string, updates: Partial<Message>) {
		messages = messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg));
	}

	function setMessages(newMessages: Message[]) {
		messages = newMessages;
	}

	function setLoading(loading: boolean) {
		isLoading = loading;
	}

	function setError(errorMessage: string | null) {
		error = errorMessage;
	}

	function clearError() {
		error = null;
	}

	function toggleOpen() {
		isOpen = !isOpen;
	}

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}

	function resetSession() {
		sessionId = generateSessionId();
		messages = [];
		error = null;
		isLoading = false;
	}

	return {
		get sessionId() {
			return sessionId;
		},
		get messages() {
			return messages;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get isOpen() {
			return isOpen;
		},
		addMessage,
		updateMessage,
		setMessages,
		setLoading,
		setError,
		clearError,
		toggleOpen,
		open,
		close,
		resetSession
	};
}

export type ChatStore = ReturnType<typeof createChatStore>;
