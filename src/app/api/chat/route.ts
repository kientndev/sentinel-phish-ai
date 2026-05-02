/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
      return NextResponse.json({ error: 'GOOGLE_API_KEY or GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    // Format messages for Gemini Chat
    const chatSequence = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatSequence,
      config: {
        systemInstruction
      }
    });

    const responseText = response.text || "";
    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
