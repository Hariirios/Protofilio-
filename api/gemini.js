// api/gemini.js
// This file runs securely on Vercel's server

const fetch = require('node-fetch');

// Vercel makes the GEMINI_API_KEY environment variable available here
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        // Extract the user message and context from the client request body
        const { userMessage, context } = req.body;

        // Validate input
        if (!userMessage) {
            res.status(400).json({ error: 'Missing userMessage in request body' });
            return;
        }

        // Build the request body for the Gemini API
        const apiBody = JSON.stringify({
            contents: [{
                parts: [
                    { text: context + "\n\nUser: " + userMessage + "\nAssistant:" }
                ]
            }]
        });

        // Call the official Gemini API using the secure key from the environment variable
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: apiBody
        });
        
        const data = await response.json();

        // Send the response back to your client-side JavaScript
        res.status(200).json(data);

    } catch (error) {
        console.error('Gemini API Proxy Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI service.' });
    }
};