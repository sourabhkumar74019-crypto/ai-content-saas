import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate', async (req, res) => {
  try {
    const { tool, prompt, tone } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let systemInstruction = `You are an expert AI content generator for ${tool || 'general content'}. Tone: ${tone || 'professional'}.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `${systemInstruction}\n\nUser Prompt: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
