export function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function parseMarkdown(text: string): string {
	let html = escapeHtml(text);

	// Code blocks (must come before inline code)
	html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
		const language = lang ? ` class="language-${escapeHtml(lang)}"` : '';
		return `<pre><code${language}>${code.trim()}</code></pre>`;
	});

	// Inline code
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Bold
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

	// Italic
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

	// Line breaks
	html = html.replace(/\n/g, '<br>');

	// Links
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

	return html;
}
