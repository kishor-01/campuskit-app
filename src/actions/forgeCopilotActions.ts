'use server';

import { auth } from '@/auth';
import { aiProvider } from '@/lib/ai-provider';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  const roleHierarchy: Record<string, number> = {
    VIEWER: 0, CONTRIBUTOR: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4,
  };
  const userLevel = roleHierarchy[user?.role ?? 'VIEWER'] ?? 0;
  if (!user || userLevel < roleHierarchy['ADMIN']) {
    throw new Error('Forbidden: Only admins can use the Forge Co-Pilot.');
  }
}

// ─── 1. Node Briefing Generator ───────────────────────────────────────────────
export async function generateNodeBriefingAction(
  roadmapTitle: string,
  nodeTitle: string,
  nodeType: string,
) {
  await requireAdmin();

  const prompt = `You are a Senior Staff Engineer writing a technical briefing for a developer learning ${roadmapTitle}. Write the briefing for the specific topic: ${nodeTitle}. The node type is ${nodeType}. RULES: 1. Do not use generic greetings. 2. Be direct, authoritative, and technical. 3. Explain the 'Why' and the 'How'. 4. Format using clean Markdown (bolding, inline code snippets). 5. Keep it between 100 and 150 words. Do NOT generate any affiliate links.`;

  try {
    const rawResult = await aiProvider.runWithFallback(prompt);
    return { success: true, briefing: rawResult.trim() };
  } catch (error: any) {
    console.error('[Co-Pilot] Briefing generation failed:', error);
    return { success: false, error: error.message || 'Failed to generate briefing.' };
  }
}

// ─── 1b. Node Briefing + Knowledge Check + Senior Insight (combined) ──────────
export async function generateNodeBriefingAndCheckAction(
  roadmapTitle: string,
  nodeTitle: string,
  nodeType: string,
) {
  await requireAdmin();

  const prompt = `You are a Senior Staff Engineer creating learning content for a developer studying "${roadmapTitle}". The topic is: "${nodeTitle}" (node type: ${nodeType}).

Respond with ONLY valid JSON in this exact structure — no markdown fences, no extra text:
{
  "briefing": "<100-150 word technical briefing in Markdown. Bold key terms, use inline code. Direct and authoritative. Explain the Why and the How.>",
  "knowledgeCheck": "<A single practical action-oriented sentence starting with a verb (e.g. 'Build...', 'Implement...', 'Explain...'). A concrete task proving mastery. No markdown.>",
  "seniorInsight": "<1-2 sentences of brutal production truth or interview reality. Start with 'In production...' or 'Interviewers will ask...' or 'Most engineers miss...'. Sound like an experienced Staff Engineer giving insider advice. No markdown, no fluff.>"
}`;

  try {
    const rawResult = await aiProvider.runWithFallback(prompt);
    // Strip any accidental markdown fences before parsing
    const cleaned = rawResult.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.briefing || !parsed.knowledgeCheck) throw new Error('Incomplete AI response');
    return {
      success: true,
      briefing: parsed.briefing as string,
      knowledgeCheck: parsed.knowledgeCheck as string,
      seniorInsight: (parsed.seniorInsight as string) || null,
    };
  } catch (error: any) {
    console.error('[Co-Pilot] Briefing+Check+Insight generation failed:', error);
    return { success: false, error: error.message || 'Failed to generate content.' };
  }
}

// ─── 2. Arsenal Resource Description Generator ────────────────────────────────
export async function generateArsenalDescriptionAction(
  resourceTitle: string,
  nodeTitle: string,
) {
  await requireAdmin();

  const prompt = `Write a punchy, 2-sentence pitch for a developer resource titled '${resourceTitle}' being used to learn '${nodeTitle}'. Tell them why it is elite and worth their time. No markdown. No bullet points. Just two direct sentences.`;

  try {
    const rawResult = await aiProvider.runWithFallback(prompt);
    return { success: true, description: rawResult.trim() };
  } catch (error: any) {
    console.error('[Co-Pilot] Arsenal description generation failed:', error);
    return { success: false, error: error.message || 'Failed to generate description.' };
  }
}

