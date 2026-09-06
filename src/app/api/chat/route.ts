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
    const body = await req.json();
    const { messages, context, scanContext, lang = 'en', aiMode = 'concise' } = body;
    const activeContext = context || scanContext || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
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

    const systemInstruction = `You are SentinelShield AI / SentinelPhish AI, an expert cybersecurity and phishing detection advisor.
Your job is to explain the security analysis of the current website to the user in a helpful, calm, and authoritative tone.
IMPORTANT: You MUST respond ENTIRELY in ${languageName}. Do not use any other language.
Response Style: ${modeInstruction}

Here is the context of the website analysis:
URL: ${activeContext.url || activeContext.targetUrl || 'N/A'}
Risk Score: ${activeContext.score !== undefined ? activeContext.score : (activeContext.riskScore ?? 'N/A')}/100
Status: ${activeContext.status || 'N/A'}
Domain Intel: Age: ${activeContext.domainAge || 'N/A'}, Registrar: ${activeContext.registrar || 'N/A'}
Heuristic Flags: ${(activeContext.redFlags ?? activeContext.threatDetails ?? []).join(', ') || 'None'}`;

    // Map frontend messages to valid Gemini Content objects
    // Note: Gemini roles are strictly "user" and "model" (NOT "assistant" or "system")
    const formattedContents = messages
      .filter((m: any) => m && (m.content || m.text))
      .map((msg: { role: string; content?: string; text?: string }) => ({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.text || '' }],
      }));

    // Ensure the conversation starts with a user message
    while (formattedContents.length > 0 && formattedContents[0].role === 'model') {
      formattedContents.shift();
    }

    if (formattedContents.length === 0) {
      return NextResponse.json({ error: 'At least one user message is required' }, { status: 400 });
    }

    // Merge consecutive turns with the same role into a single Content object
    const mergedContents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of formattedContents) {
      const last = mergedContents[mergedContents.length - 1];
      if (last && last.role === msg.role) {
        last.parts.push(...msg.parts);
      } else {
        mergedContents.push({
          role: msg.role,
          parts: [...msg.parts],
        });
      }
    }

    // Modern Gemini model candidate cascade (auto-fallbacks if a model is deprecated/retired on v1beta)
    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.5-pro",
      "gemini-1.5-pro-latest",
      "gemini-pro",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    let responseText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent({
          contents: mergedContents,
        });

        responseText = result.response.text() || '';
        if (responseText) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Advisor Chat] Model "${modelName}" failed:`, err.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All candidate Gemini models failed to generate content');
    }

    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    console.error('Advisor chat error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate response' }, { status: 500 });
  }
}

