/**
 * POST /api/chat/send
 * Handles sending messages to the AI and streaming responses back via SSE
 * REQUIRES AUTHENTICATION: Users must be logged in to access chatbot
 */

import Anthropic from '@anthropic-ai/sdk';
import type { RequestHandler } from './$types';
import { getEnvConfig } from '$lib/server/env';
import { getOrCreateSession, saveMessage, getConversationHistory } from '$lib/server/db';
import { checkRateLimit } from '$lib/server/rate-limit';
import { auth } from '$lib/server/auth';

const config = getEnvConfig();
const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		// ADD: Authentication check - MUST BE FIRST
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return new Response(
				JSON.stringify({
					error: 'Authentication required. Please log in to use the chatbot.'
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Get verified user ID from session (never trust client-provided userId)
		const authenticatedUserId = session.user.id;

		// Rate limiting
		const clientIp = getClientAddress();
		const rateLimit = checkRateLimit(
			clientIp,
			config.rateLimitRequests,
			config.rateLimitWindowMs
		);

		if (!rateLimit.allowed) {
			return new Response(
				JSON.stringify({
					error: 'Rate limit exceeded',
					resetTime: rateLimit.resetTime
				}),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'X-RateLimit-Limit': config.rateLimitRequests.toString(),
						'X-RateLimit-Remaining': '0',
						'X-RateLimit-Reset': rateLimit.resetTime.toString()
					}
				}
			);
		}

		// Parse request body
		const body = await request.json();
		const { message, sessionId: clientSessionId, context } = body;

		if (!message || typeof message !== 'string') {
			return new Response(JSON.stringify({ error: 'Message is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Validate message length
		if (message.length > 10000) {
			return new Response(JSON.stringify({ error: 'Message too long (max 10000 characters)' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// CHANGE: Use authenticated user ID, not client-provided
		// Get or create session tied to authenticated user
		const sessionId = getOrCreateSession(clientSessionId, authenticatedUserId);

		// Save user message
		saveMessage(sessionId, 'user', message);

		// Get conversation history for context
		const history = getConversationHistory(sessionId, 10);

		// Create SSE stream
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				function sendSSE(data: object) {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
				}

				try {
					// Build messages array with history
					const messages: Anthropic.MessageParam[] = history.map((msg) => ({
						role: msg.role,
						content: msg.content
					}));

					// Create streaming request to Anthropic
					const response = await anthropic.messages.create({
						model: config.anthropicModel,
						max_tokens: config.maxTokens,
						system: config.systemPrompt,
						messages,
						stream: true
					});

					let fullContent = '';

					// Stream the response
					for await (const event of response) {
						if (
							event.type === 'content_block_delta' &&
							event.delta.type === 'text_delta'
						) {
							const chunk = event.delta.text;
							fullContent += chunk;

							// Send chunk to client
							sendSSE({ chunk });
						}

						if (event.type === 'message_stop') {
							// Save complete assistant message
							saveMessage(sessionId, 'assistant', fullContent);

							// Send completion signal
							sendSSE({ done: true, sessionId });
						}
					}

					controller.close();
				} catch (error) {
					console.error('Streaming error:', error);

					const errorMessage =
						error instanceof Error ? error.message : 'An error occurred';

					sendSSE({
						error: errorMessage
					});

					controller.close();
				}
			}
		});

		// Return SSE stream
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'X-RateLimit-Limit': config.rateLimitRequests.toString(),
				'X-RateLimit-Remaining': rateLimit.remaining.toString(),
				'X-RateLimit-Reset': rateLimit.resetTime.toString()
			}
		});
	} catch (error) {
		console.error('Request error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Internal server error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
