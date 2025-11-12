/**
 * Database utility for managing chat sessions and messages
 * Uses SQLite for persistent storage
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface Message {
	id: string;
	session_id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export interface Session {
	id: string;
	user_id?: string;
	created_at: number;
	updated_at: number;
}

// Initialize database connection
const db = new Database('chat.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export function initDatabase() {
	// Create sessions table
	db.exec(`
		CREATE TABLE IF NOT EXISTS chat_sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);
	`);

	// Create messages table
	db.exec(`
		CREATE TABLE IF NOT EXISTS chat_messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
			content TEXT NOT NULL,
			timestamp INTEGER NOT NULL,
			FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
		);
	`);

	// Create indices for better query performance
	db.exec(`
		CREATE INDEX IF NOT EXISTS idx_messages_session
		ON chat_messages(session_id, timestamp DESC);
	`);

	db.exec(`
		CREATE INDEX IF NOT EXISTS idx_sessions_user
		ON chat_sessions(user_id, updated_at DESC);
	`);
}

/**
 * Get or create a chat session
 */
export function getOrCreateSession(sessionId?: string, userId?: string): string {
	if (sessionId) {
		// Check if session exists
		const session = db
			.prepare('SELECT id FROM chat_sessions WHERE id = ?')
			.get(sessionId) as Session | undefined;

		if (session) {
			return session.id;
		}
	}

	// Create new session
	const newSessionId = sessionId || randomUUID();
	const now = Date.now();

	db.prepare(
		'INSERT INTO chat_sessions (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
	).run(newSessionId, userId, now, now);

	return newSessionId;
}

/**
 * Save a message to the database
 */
export function saveMessage(
	sessionId: string,
	role: 'user' | 'assistant',
	content: string
): Message {
	const messageId = randomUUID();
	const timestamp = Date.now();

	db.prepare(
		'INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)'
	).run(messageId, sessionId, role, content, timestamp);

	// Update session's updated_at timestamp
	db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(timestamp, sessionId);

	return {
		id: messageId,
		session_id: sessionId,
		role,
		content,
		timestamp
	};
}

/**
 * Get messages for a session with pagination
 */
export function getMessages(
	sessionId: string,
	limit: number = 50,
	offset: number = 0
): Message[] {
	const messages = db
		.prepare(
			`SELECT id, session_id, role, content, timestamp
			FROM chat_messages
			WHERE session_id = ?
			ORDER BY timestamp ASC
			LIMIT ? OFFSET ?`
		)
		.all(sessionId, limit, offset) as Message[];

	return messages;
}

/**
 * Get conversation history for context (last N messages)
 */
export function getConversationHistory(
	sessionId: string,
	lastN: number = 10
): Array<{ role: 'user' | 'assistant'; content: string }> {
	const messages = db
		.prepare(
			`SELECT role, content
			FROM chat_messages
			WHERE session_id = ?
			ORDER BY timestamp DESC
			LIMIT ?`
		)
		.all(sessionId, lastN) as Array<{ role: 'user' | 'assistant'; content: string }>;

	// Reverse to get chronological order
	return messages.reverse();
}

/**
 * Delete old sessions (cleanup utility)
 */
export function deleteOldSessions(olderThanDays: number = 30): number {
	const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

	const result = db
		.prepare('DELETE FROM chat_sessions WHERE updated_at < ?')
		.run(cutoffTime);

	return result.changes;
}

/**
 * Get session count (for monitoring)
 */
export function getSessionCount(): number {
	const result = db.prepare('SELECT COUNT(*) as count FROM chat_sessions').get() as {
		count: number;
	};
	return result.count;
}

/**
 * Get message count for a session
 */
export function getMessageCount(sessionId: string): number {
	const result = db
		.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ?')
		.get(sessionId) as { count: number };
	return result.count;
}

/**
 * Validates that a session belongs to a specific user
 * Prevents users from accessing other users' chat sessions
 * @param sessionId - The session ID to validate
 * @param userId - The authenticated user ID
 * @returns true if session belongs to user, false otherwise
 */
export function validateSessionOwnership(sessionId: string, userId: string): boolean {
	const session = db
		.prepare('SELECT user_id FROM chat_sessions WHERE id = ?')
		.get(sessionId) as { user_id: string | null } | undefined;

	// Session doesn't exist or doesn't have a user_id
	if (!session || !session.user_id) {
		return false;
	}

	// Check if session belongs to the authenticated user
	return session.user_id === userId;
}

/**
 * Close database connection (call on server shutdown)
 */
export function closeDatabase() {
	db.close();
}

// Initialize database on import
initDatabase();

export default db;
