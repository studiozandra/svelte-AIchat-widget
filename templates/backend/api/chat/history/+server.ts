/**
 * GET /api/chat/history
 * Retrieves conversation history for a given session
 * REQUIRES AUTHENTICATION: Users can only access their own chat history
 */

import type { RequestHandler } from './$types';
import { getMessages, getMessageCount, validateSessionOwnership } from '$lib/server/db';
import { auth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		// ADD: Authentication check - MUST BE FIRST
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session || !session.user) {
			return new Response(
				JSON.stringify({
					error: 'Authentication required. Please log in to view chat history.'
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Get verified user ID from session
		const authenticatedUserId = session.user.id;

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

		// ADD: Verify session belongs to authenticated user
		if (!validateSessionOwnership(sessionId, authenticatedUserId)) {
			return new Response(
				JSON.stringify({
					error: 'Unauthorized. You can only access your own chat history.'
				}),
				{
					status: 403,
					headers: { 'Content-Type': 'application/json' }
				}
			);
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
