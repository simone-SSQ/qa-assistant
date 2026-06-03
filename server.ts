import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client if API Key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!apiKey,
    });
  });

  // Sharpen a single or list of issue descriptions
  app.post('/api/sharpen-issue', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Gemini API key is not configured on the server. Please add it in Settings > Secrets.',
        });
      }

      const { description, category, severity } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const systemPrompt = `You are an elite, micro-detailed UI/UX Quality Assurance (QA) Designer with years of experience verifying web and mobile components against Figma designs.
Your job is to rewrite a draft issue description written by a peer into a highly professional, constructive, engineer-ready format.
Follow these rigid guidelines:
1. Make the text highly precise, objective, and clear. Avoid emotional or vague feedback like "looks bad" or "feels weird".
2. Use relative layout or pixel values wherever possible (e.g. "padding should be 16px, currently appears to be 12px" or "alignment is off by approx 4px to the left").
3. Make it highly action-oriented. Start with specific, concrete verbs (e.g., "Adjust", "Increase", "Update", "Correct", "Align", "Provide").
4. Keep it concise. High informational density is key.
5. Do NOT add any surrounding markdown block elements, introduction, or pleasantries. Output ONLY the polished description string.

Context:
Category: ${category || 'General Visual'}
Severity: ${severity || 'P2'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Draft issue description to polish: "${description}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
      });

      const improved = response.text?.trim() || description;
      res.json({ sharpened: improved });
    } catch (err: any) {
      console.error('Error in /api/sharpen-issue:', err);
      res.status(500).json({ error: err.message || 'Error generating sharpened content' });
    }
  });

  // Generate Report Summary based on component details and all reviews
  app.post('/api/generate-summary', async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          error: 'Gemini API key is not configured on the server. Please add it in Settings > Secrets.',
        });
      }

      const { componentName, categoriesList } = req.body;
      if (!componentName) {
        return res.status(400).json({ error: 'Component Name is required' });
      }

      const systemPrompt = `You are an elite UI Quality Assurance lead.
Your task is to write a powerful, objective, and professional 1-to-2 sentence overall summary that synthesizes a list of issues found during a design review.
The summary should evaluate the implementation quality (e.g. "The basic layout is sound, but fine details require polish") and direct the developer towards the highest-priority focus areas (such as fixing critical P1 text truncation, visual styling, or accessiblity failures).

Strict Rules:
1. Keep the output strictly to exactly 1 or 2 clear, scannable, high-impact sentences.
2. Address the engineer direct but constructing constructive criticism.
3. Keep it professional and focused on actionable engineering steps.
4. Output ONLY the 1-2 sentence paragraph. No introductories, no bullet points, and no quotes.`;

      const contents = `Component: ${componentName}
Issues discovered:
${JSON.stringify(categoriesList, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
        },
      });

      const summaryText = response.text?.trim() || 'Summary generation completed.';
      res.json({ summary: summaryText });
    } catch (err: any) {
      console.error('Error in /api/generate-summary:', err);
      res.status(500).json({ error: err.message || 'Error generating summary' });
    }
  });

  // Handle Vite middleware & static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
