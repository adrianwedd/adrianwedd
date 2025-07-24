// Serverless function for triggering LLM chat via GitHub Actions
// Deploy to Vercel, Netlify, or similar

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Generate session ID if not provided
        const session = sessionId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Trigger GitHub Actions workflow via repository dispatch
        const githubResponse = await fetch('https://api.github.com/repos/adrianwedd/adrianwedd/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'llm-chat',
                client_payload: {
                    message: message,
                    session_id: session,
                    timestamp: new Date().toISOString(),
                    user_agent: req.headers['user-agent'] || 'Terminal Interface'
                }
            })
        });
        
        if (!githubResponse.ok) {
            const errorText = await githubResponse.text();
            console.error('GitHub API error:', errorText);
            return res.status(500).json({ 
                error: 'Failed to trigger AI response',
                details: errorText
            });
        }
        
        // Return immediate response - client will poll for the actual AI response
        return res.status(200).json({
            status: 'processing',
            sessionId: session,
            message: 'AI persona is thinking... Check back in a moment.',
            estimatedWaitTime: 30 // seconds
        });
        
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}

// Alternative: If using Node.js/Express
/*
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.post('/api/chat', async (req, res) => {
    // Same logic as above
});

app.listen(3000, () => {
    console.log('Chat API running on port 3000');
});
*/