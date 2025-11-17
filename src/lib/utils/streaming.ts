export async function streamResponse(
	response: Response,
	onChunk: (chunk: string) => void,
	onComplete: () => void,
	onError: (error: Error) => void
): Promise<void> {
	if (!response.ok) {
		// Try to get the actual error message from the response
		try {
			const errorData = await response.json();
			const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
			onError(new Error(errorMessage));
		} catch {
			onError(new Error(`HTTP error! status: ${response.status}`));
		}
		return;
	}

	const reader = response.body?.getReader();
	if (!reader) {
		onError(new Error('Response body is not readable'));
		return;
	}

	const decoder = new TextDecoder();

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				onComplete();
				break;
			}

			const chunk = decoder.decode(value, { stream: true });
			const lines = chunk.split('\n');

			for (const line of lines) {
				const trimmedLine = line.trim();
				if (trimmedLine.startsWith('data: ')) {
					const data = trimmedLine.slice(6);
					if (data === '[DONE]') {
						onComplete();
						return;
					}
					try {
						// Try to parse as JSON first (for structured SSE)
						const parsed = JSON.parse(data);

						// Check if this is a done signal
						if (parsed.done === true) {
							onComplete();
							return;
						}

						// Only pass content to onChunk, not control messages
						const content = parsed.chunk || parsed.content || parsed.text;
						if (content) {
							onChunk(content);
						}
					} catch {
						// If not JSON, treat as plain text
						onChunk(data);
					}
				} else if (trimmedLine && !trimmedLine.startsWith(':')) {
					// Handle non-SSE formatted streams
					onChunk(trimmedLine);
				}
			}
		}
	} catch (error) {
		onError(error instanceof Error ? error : new Error('Streaming error'));
	} finally {
		reader.releaseLock();
	}
}
