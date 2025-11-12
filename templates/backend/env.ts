/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present
 */

/**
 * Validates and returns environment variables
 * Throws an error if required variables are missing
 */
export function validateEnv() {
	const requiredVars = ['ANTHROPIC_API_KEY'];
	const missing: string[] = [];

	for (const varName of requiredVars) {
		if (!process.env[varName]) {
			missing.push(varName);
		}
	}

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(', ')}\n` +
				'Please create a .env file in your project root with these variables.\n' +
				'See .env.example for reference.'
		);
	}
}

/**
 * Get environment configuration with defaults
 */
export function getEnvConfig() {
	validateEnv();

	return {
		// Anthropic API Configuration
		anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
		anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',

		// Rate limiting configuration
		rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
		rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),

		// Database configuration
		databasePath: process.env.DATABASE_PATH || 'chat.db',

		// Max tokens for AI responses
		maxTokens: parseInt(process.env.MAX_TOKENS || '2048'),

		// System prompt (optional)
		systemPrompt:
			process.env.SYSTEM_PROMPT ||
			'You are a helpful AI assistant. Provide concise, accurate, and friendly responses.',

		// Enable debug mode
		debugMode: process.env.DEBUG === 'true'
	};
}

/**
 * Type-safe environment configuration
 */
export type EnvConfig = ReturnType<typeof getEnvConfig>;
