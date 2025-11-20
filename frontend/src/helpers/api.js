const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const makeApiCall = async ({
  searchQuery,
  onResponseUpdate,
  onResponseStreamStart,
  onResponseStreamEnd,
  additionalContext,
}) => {
  let abortController = null;
  
  try {
    abortController = new AbortController();
    if (onResponseStreamStart) onResponseStreamStart();

    const response = await fetch(`${backendUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: searchQuery,
        context: additionalContext,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const decoder = new TextDecoder();
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Response body not found');
    }

    let accumulatedResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulatedResponse += parsed.content;
              onResponseUpdate(accumulatedResponse);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            // Skip invalid JSON - might be partial chunk
            continue;
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request aborted');
      return;
    }
    console.error('Error in makeApiCall:', error);
    throw error;
  } finally {
    if (onResponseStreamEnd) onResponseStreamEnd();
    if (abortController) abortController.abort();
  }
};
