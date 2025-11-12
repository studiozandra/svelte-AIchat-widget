/**
 * GET /api/chat/history
 * Retrieves conversation history for a given session
 */

import type { RequestHandler } from './$types';
import { getMessages, getMessageCount } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Parse query parameters
		const sessionId = url.searchParams.get('sessionId');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Validate session ID
		if (!sessionId) {
			return new Response(JSON.stringify({ error: 'Session ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Validate limit (max 100)
		const validLimit = Math.min(Math.max(limit, 1), 100);

		// Validate offset
		const validOffset = Math.max(offset, 0);

		// Get messages
		const messages = getMessages(sessionId, validLimit, validOffset);

		// Check if there are more messages
		const totalCount = getMessageCount(sessionId);
		const hasMore = validOffset + messages.length < totalCount;

		// Format messages to match frontend interface
		const formattedMessages = messages.map((msg) => ({
			id: msg.id,
			role: msg.role,
			content: msg.content,
			timestamp: msg.timestamp
		}));

		// Return response
		return new Response(
			JSON.stringify({
				messages: formattedMessages,
				hasMore
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'private, no-cache'
				}
			}
		);
	} catch (error) {
		console.error('History fetch error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Failed to fetch history'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
