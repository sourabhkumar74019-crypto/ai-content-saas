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

// Model names to try sequentially
const MODEL_NAMES = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-flash'
];

app.post('/api/generate', async (req, res) => {
  try {
    const { tool, prompt, tone } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemInstruction = `You are an expert AI content generator for ${tool || 'general content'}. Tone: ${tone || 'professional'}.`;
    const fullPrompt = `${systemInstruction}\n\nUser Prompt: ${prompt}`;

    let text = null;
    let lastError = null;

    // Loop through available model names until one succeeds
    for (const modelName of MODEL_NAMES) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        text = response.text();
        if (text) break; // Success! Exit loop
      } catch (err) {
        lastError = err;
        console.log(`Failed with model ${modelName}, trying next...`);
      }
    }

    if (text) {
      return res.json({ result: text });
    } else {
      throw lastError || new Error('All models failed to generate content.');
    }

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
