export interface ChatWidgetProps {
	// Required endpoint for sending messages
	sendMessageEndpoint: string;

	// Required endpoint for fetching conversation history
	historyEndpoint: string;

	// Optional object containing user/page context to be sent with each request
	context?: Record<string, unknown>;

	// Object for customizing UI text for internationalization
	i18n?: {
		placeholder: string;
		title: string;
		sendButton?: string;
		errorMessage?: string;
	};

	// Optional theme object or class name for custom styling
	theme?: 'light' | 'dark' | string;
}

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	streaming?: boolean;
}

export interface ChatSession {
	sessionId: string;
	messages: Message[];
	isLoading: boolean;
	error: string | null;
}

export interface HistoryResponse {
	messages: Message[];
	hasMore: boolean;
}

export interface SendMessageRequest {
	message: string;
	sessionId?: string;
	context?: Record<string, unknown>;
}
