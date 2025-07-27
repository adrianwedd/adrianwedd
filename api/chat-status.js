// API endpoint to check chat response status and retrieve responses
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { sessionId } = req.query;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        
        // Check if response file exists in the repo
        const responseUrl = `https://raw.githubusercontent.com/adrianwedd/adrianwedd/main/chat-responses/response-${sessionId}.json`;
        const executionUrl = `https://raw.githubusercontent.com/adrianwedd/adrianwedd/main/chat-responses/execution-${sessionId}.json`;
        
        try {
            // Try to fetch the response file
            const responseFileResponse = await fetch(responseUrl);
            
            if (responseFileResponse.ok) {
                const responseData = await responseFileResponse.json();
                
                // Try to fetch the execution log to get the actual AI response
                const executionResponse = await fetch(executionUrl);
                
                if (executionResponse.ok) {
                    const executionData = await executionResponse.json();
                    
                    // Extract the last assistant message
                    const assistantMessages = executionData.filter(msg => msg.role === 'assistant');
                    const lastResponse = assistantMessages[assistantMessages.length - 1];
                    
                    return res.status(200).json({
                        status: 'completed',
                        sessionId: sessionId,
                        response: lastResponse ? lastResponse.content : 'No response generated',
                        timestamp: responseData.timestamp,
                        userMessage: responseData.user_message
                    });
                } else {
                    return res.status(200).json({
                        status: 'processing',
                        sessionId: sessionId,
                        message: 'Response file found but execution log not ready yet...'
                    });
                }
            } else {
                // Response file doesn't exist yet
                return res.status(200).json({
                    status: 'processing',
                    sessionId: sessionId,
                    message: 'AI persona is still thinking...'
                });
            }
        } catch (fetchError) {
            // File doesn't exist or other fetch error
            return res.status(200).json({
                status: 'processing',
                sessionId: sessionId,
                message: 'Waiting for AI response...'
            });
        }
        
    } catch (error) {
        console.error('Chat status API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}