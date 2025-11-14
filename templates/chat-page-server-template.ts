/**
 * Server-side authentication for the chatbot demo page
 * Ensures only authenticated users can access the chatbot
 */

import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	// Check if user is authenticated
	const session = await auth.api.getSession({
		headers: request.headers
	});

	// Redirect to login if not authenticated
	if (!session || !session.user) {
		throw redirect(302, '/login');
	}

	// Return user data to the page
	return {
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name
		}
	};
};
