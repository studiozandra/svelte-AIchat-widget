/**
 * Knowledge Base Search
 * Searches the knowledge base for relevant FAQs based on user input
 */

import knowledgeBase from './knowledge-base.json';

export interface FAQ {
	category: string;
	question: string;
	answer: string;
	keywords: string[];
}

export interface KnowledgeBase {
	company: string;
	description: string;
	faqs: FAQ[];
}

/**
 * Normalize text for better matching
 */
function normalizeText(text: string): string {
	return text.toLowerCase().trim();
}

/**
 * Calculate relevance score for an FAQ based on keyword matches
 */
function calculateRelevance(userMessage: string, faq: FAQ): number {
	const normalizedMessage = normalizeText(userMessage);
	const words = normalizedMessage.split(/\s+/);

	let score = 0;

	// Check each keyword
	for (const keyword of faq.keywords) {
		const normalizedKeyword = normalizeText(keyword);

		// Exact phrase match in message (highest score)
		if (normalizedMessage.includes(normalizedKeyword)) {
			score += 10;
		}

		// Individual word matches
		const keywordWords = normalizedKeyword.split(/\s+/);
		for (const keywordWord of keywordWords) {
			if (words.includes(keywordWord)) {
				score += 3;
			}
		}
	}

	// Check question text for matches (lower weight)
	const normalizedQuestion = normalizeText(faq.question);
	const questionWords = normalizedQuestion.split(/\s+/);
	for (const word of words) {
		if (word.length > 3 && questionWords.includes(word)) {
			score += 1;
		}
	}

	return score;
}

/**
 * Search knowledge base for relevant FAQs
 * @param userMessage - The user's message
 * @param maxResults - Maximum number of results to return (default: 3)
 * @param minScore - Minimum relevance score to include (default: 5)
 * @returns Array of relevant FAQs sorted by relevance
 */
export function searchKnowledgeBase(
	userMessage: string,
	maxResults: number = 3,
	minScore: number = 5
): FAQ[] {
	const kb = knowledgeBase as KnowledgeBase;

	// Calculate relevance scores for all FAQs
	const scoredFaqs = kb.faqs.map((faq) => ({
		faq,
		score: calculateRelevance(userMessage, faq)
	}));

	// Filter by minimum score and sort by relevance
	const relevantFaqs = scoredFaqs
		.filter((item) => item.score >= minScore)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults)
		.map((item) => item.faq);

	return relevantFaqs;
}

/**
 * Format knowledge base results for injection into system prompt
 */
export function formatKnowledgeForPrompt(faqs: FAQ[]): string {
	if (faqs.length === 0) {
		return '';
	}

	const formattedFaqs = faqs
		.map((faq, index) => {
			return `${index + 1}. **${faq.question}** (Category: ${faq.category})\n   ${faq.answer}`;
		})
		.join('\n\n');

	return `
RELEVANT KNOWLEDGE BASE INFORMATION:
The following information from our knowledge base may be relevant to the user's question:

${formattedFaqs}

INSTRUCTIONS:
- Use the knowledge base information above to answer the user's question accurately
- Only provide information that is explicitly stated in the knowledge base
- If the knowledge base doesn't contain relevant information, politely indicate that you don't have specific information on that topic
- Be conversational and helpful, but stick to the facts provided
- You may rephrase the knowledge base content to be more natural and conversational
`.trim();
}

/**
 * Get the company name from the knowledge base
 */
export function getCompanyName(): string {
	const kb = knowledgeBase as KnowledgeBase;
	return kb.company;
}
