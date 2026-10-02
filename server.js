import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

app.post('/api/generate', async (req, res) => {
  try {
    const { tool, prompt, tone } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Environment Variables.' });
    }

    const systemInstruction = `You are an expert AI content generator for ${tool || 'general content'}. Tone: ${tone || 'professional'}.`;
    
    // Using standard active model alias
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const fullPrompt = `${systemInstruction}\n\nUser Prompt: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error('Generation Error Details:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
