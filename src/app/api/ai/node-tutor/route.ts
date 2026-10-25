// src/app/api/ai/node-tutor/route.ts
// Streaming AI mentor endpoint — powers the Co-Pilot tab in NodeDrawer
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Allow up to 60 seconds for streaming responses
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth guard — only logged-in users can call this
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const {
    messages,
    nodeTitle,
    briefing,
    seniorInsight,
  }: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    nodeTitle: string;
    briefing?: string;
    seniorInsight?: string;
  } = body;

  if (!messages || !nodeTitle) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Resolve first available Gemini API key (mirrors aiProvider key loading)
  let apiKey: string | undefined;
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim().length > 0) {
      apiKey = k.trim();
      break;
    }
  }
  if (!apiKey) {
    apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const systemPrompt = `You are an elite Staff Engineer mentoring a junior developer who is studying "${nodeTitle}".

Briefing context: "${briefing ?? 'No briefing provided.'}"
${seniorInsight ? `Senior Insight: "${seniorInsight}"` : ''}

RULES:
1. ONLY answer questions directly related to "${nodeTitle}" and its surrounding concepts.
2. If asked something unrelated, politely redirect back to the topic.
3. Guide and explain — do NOT write final production code for them. Give hints, pseudocode, and direction.
4. Be direct, authoritative, and practical like an experienced Staff Engineer.
5. Keep answers concise but dense with value. Use inline code backticks when appropriate.
6. If they seem confused, break it into smaller steps and ask a guiding question back.`;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
