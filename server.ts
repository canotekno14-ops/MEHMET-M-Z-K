import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Music Tutor Query Endpoint
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { prompt, language = 'tr', category = 'general', context = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please add your key in AI Studio Secrets panel.',
      });
    }

    const languageInstructionMap: Record<string, string> = {
      tr: 'Türkçe yanıt ver. Müzik terminolojisinde Solfej (Do-Re-Mi) isimlerini kullan. Detaylı, pedagojik, teşvik edici ve derinlemesine açıkla.',
      en: 'Answer in English. Use standard scientific/letter note names (C-D-E) or Solfège where appropriate. Provide exhaustive, textbook-level explanations.',
      de: 'Antworte auf Deutsch. Verwende die deutsche Notation (C-D-E-F-G-A-H, B für Bb). Gründlich, methodisch und fachlich präzise erklären.',
      ru: 'Отвечайте на русском языке. Используйте сольфеджио (До-Ре-Ми) и классическую русскую музыкальную терминологию.',
      ja: '日本語で回答してください。ドレミ音名および日本・西洋音楽理論の用語を正確に使用してください。',
      ar: 'أجب باللغة العربية. استخدم أسماء النغمات بالسولفيج (دو-ري-مي) والمقامات الشرقية والمصطلحات الموسيقية بدقة.',
      fa: 'به زبان فارسی پاسخ دهید. از نام‌های سلفژ (دو-ر-می) و تئوری موسیقی دستگاهی و غربی استفاده کنید.',
    };

    const langDirective = languageInstructionMap[language] || languageInstructionMap['tr'];

    const systemInstruction = `You are "MuseAcademy AI", the world's most advanced, comprehensive, and multilingual Music Theory, Violin, and Piano Education Masterclass Expert.
Your purpose is to provide elite-tier education from absolute beginner to concertmaster / concert pianist level.
Always adhere to these guidelines:
1. ${langDirective}
2. Output with visual UI/UX layout recommendations and animation hints where relevant (e.g. "[UI Recommendation: Visual wave expanding]", "[Fingerboard Note: String A, Position 3]").
3. When discussing instruments (Violin / Piano), provide concrete anatomical details, ergonomics (Taubman/Russian piano school, Galamian/Flesch violin school), exact physics/acoustics (Hz, partials, overtone series), and structured practice routines.
4. Format output using clean Markdown, tables for note frequencies/values, and structured steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Category: ${category}\nContext: ${JSON.stringify(context)}\nQuestion / Topic: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || '',
      language,
      category,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error processing AI response.',
    });
  }
});

// AI Custom Sight-Reading / Solfege Generator
app.post('/api/ai/generate-exercise', async (req, res) => {
  try {
    const { level = 'intermediate', clef = 'treble', timeSignature = '4/4', key = 'C', topic = 'intervals', language = 'tr' } = req.body;
    
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured.',
      });
    }

    const systemInstruction = `You are MuseAcademy AI's Exercise Generator. Generate a structured sight-reading and ear training exercise with pedagogical advice.`;

    const prompt = `Generate a sight-reading & ear training exercise for level: "${level}", clef: "${clef}", key: "${key}", timeSignature: "${timeSignature}", focus: "${topic}".
Respond in language: ${language}.
Include:
1. Pedagogical objective and rhythmic breakdown.
2. Note-by-note sequence with exact pitches (e.g. C4, E4, G4, C5), note values (quarter, half, etc.), and solfege syllables.
3. Intonation & ergonomics practice tips.
4. Harmonic/Structural analysis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({
      exercise: response.text || '',
    });
  } catch (error: any) {
    console.error('Exercise Gen Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite or Static Serving
async function startServer() {
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
    console.log(`MuseAcademy AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
