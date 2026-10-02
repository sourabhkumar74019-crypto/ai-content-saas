import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve frontend HTML, CSS, JS files

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// AI Content Generation Route
app.post('/api/generate', async (req, res) => {
    try {
        const { tool, prompt, tone } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Construct System Context based on selected tool and tone
        let systemInstruction = `You are an expert AI content writer. Tone: ${tone}. `;
        
        if (tool === 'caption') {
            systemInstruction += 'Write engaging social media captions with relevant emojis and targeted hashtags.';
        } else if (tool === 'blog') {
            systemInstruction += 'Write a detailed blog post outline and catchy introduction with clear headings.';
        } else if (tool === 'email') {
            systemInstruction += 'Write a high-converting cold email with a compelling subject line and call to action.';
        } else {
            systemInstruction += 'Write high-converting ad copy for Facebook & Google with main headline and primary text.';
        }

        const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        res.json({ result: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate content. Please check your API key or try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
