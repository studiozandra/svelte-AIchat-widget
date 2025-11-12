/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
	key: string,
	maxRequests: number,
	windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
	const now = Date.now();
	const entry = store.get(key);

	// Clean up expired entries periodically
	if (Math.random() < 0.01) {
		cleanupExpiredEntries(now);
	}

	if (!entry || now >= entry.resetTime) {
		// First request or window has expired
		const resetTime = now + windowMs;
		store.set(key, { count: 1, resetTime });
		return { allowed: true, remaining: maxRequests - 1, resetTime };
	}

	if (entry.count < maxRequests) {
		// Within limit
		entry.count++;
		store.set(key, entry);
		return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
	}

	// Rate limit exceeded
	return { allowed: false, remaining: 0, resetTime: entry.resetTime };
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(now: number) {
	for (const [key, entry] of store.entries()) {
		if (now >= entry.resetTime) {
			store.delete(key);
		}
	}
}

/**
 * Reset rate limit for a specific key (useful for testing)
 */
export function resetRateLimit(key: string) {
	store.delete(key);
}

/**
 * Clear all rate limit data
 */
export function clearAllRateLimits() {
	store.clear();
}
