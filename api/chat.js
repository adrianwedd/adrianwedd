export const config = {
  runtime: 'edge', // Edge runtime is required for streaming
};

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, system, max_tokens } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: max_tokens || 1024,
        messages: messages,
        system: system, // Pass system prompt if provided
        stream: true, // Enable streaming
      }),
    });

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.text();
      console.error('Anthropic API Error:', error);
      return new Response(JSON.stringify({ error: 'AI Provider Error', details: error }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Create a TransformStream to process the SSE events from Anthropic
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last partial line

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const event = JSON.parse(data);
                  // Extract text delta
                  if (event.type === 'content_block_delta' && event.delta?.text) {
                    controller.enqueue(new TextEncoder().encode(event.delta.text));
                  }
                } catch (e) {
                  // Ignore parse errors for keep-alives etc
                }
              }
            }
          }
        } catch (err) {
          console.error('Stream processing error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}