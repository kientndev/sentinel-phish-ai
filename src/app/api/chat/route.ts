/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  vi: 'Vietnamese',
  ja: 'Japanese',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
};

export async function POST(req: Request) {
  try {
    const { messages, context, lang = 'en', aiMode = 'concise' } = await req.json();

    if (!messages || !context) {
      return NextResponse.json({ error: 'Messages and context are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY or GEMINI_API_KEY is not configured');
      return NextResponse.json({ error: 'API key is not configured.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const languageName = LANG_NAMES[lang] ?? 'English';

    const modeInstruction = aiMode === 'educational'
      ? `Use a Detailed/Educational tone. Explain concepts step-by-step, define technical terms in simple language, and use examples. This is for a classroom or educational demo, so be thorough and approachable.`
      : `Use a Direct/Concise tone. Give short, clear, professional answers. Avoid unnecessary elaboration.`;

    const systemInstruction = `You are the SentinelPhish AI Dialogue Agent, an expert cybersecurity assistant.
Your job is to explain the security analysis of the current website to the user in a helpful and calm tone.
IMPORTANT: You MUST respond ENTIRELY in ${languageName}. Do not use any other language.
Response Style: ${modeInstruction}

Here is the context of the website analysis:
URL: ${context.url}
Risk Score: ${context.score}/100
Status: ${context.status}
Domain Intel: Age: ${context.domainAge}, Registrar: ${context.registrar}
Heuristic Flags: ${(context.redFlags ?? []).join(', ')}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction
    });

    // Format messages for Gemini Chat
    const chatSequence = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const result = await model.generateContent(chatSequence);
    const responseText = result.response.text() || "";

    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate response' }, { status: 500 });
  }
}
