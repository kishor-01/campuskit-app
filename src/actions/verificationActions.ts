// src/actions/verificationActions.ts
// AI-powered execution verification gate — prevents random-text cheating
'use server';

import { auth } from '@/auth';
import { aiProvider } from '@/lib/ai-provider';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerificationResult {
  passed: boolean;
  feedback: string;
}

// ─── verifyExecutionAction ────────────────────────────────────────────────────

/**
 * Sends the student's execution log + the task requirement to Gemini.
 * Returns a structured { passed: boolean, feedback: string } object.
 *
 * Uses the existing aiProvider singleton (multi-key rotation + fallback chain)
 * for consistency with the rest of the codebase — no extra dependencies needed.
 */
export async function verifyExecutionAction(
  submissionText: string,
  taskRequirement: string,
): Promise<{ success: true; passed: boolean; feedback: string } | { success: false; error: string }> {
  // Auth guard
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to verify your execution.' };
  }

  // Basic input validation
  if (!submissionText || submissionText.trim().length < 10) {
    return {
      success: true,
      passed: false,
      feedback: 'Your submission is too short. Describe what you actually did in your execution log.',
    };
  }

  if (!taskRequirement || taskRequirement.trim().length === 0) {
    return { success: false, error: 'No task requirement provided for verification.' };
  }

  const prompt = `You are a strict but fair Senior Engineer reviewing a student's work.

The student was asked to complete this task:
"${taskRequirement}"

They submitted this execution log:
"${submissionText.slice(0, 2000)}"

Evaluate carefully:
- If the submission is random text, gibberish, unrelated content, or clearly does not address the task → "passed" must be false.
- If the submission meaningfully attempts or completes the task → "passed" is true.
- Assess intent, not perfection.

Respond with ONLY valid JSON (no markdown fences, no extra text):
{"passed": <boolean>, "feedback": "<exactly 1 sentence of personalized, direct, clean feedback — address the student directly>"}`;

  try {
    const result = await aiProvider.runWithFallbackJSON<VerificationResult>(prompt);

    if (typeof result.passed !== 'boolean' || typeof result.feedback !== 'string') {
      throw new Error('Unexpected AI response shape');
    }

    return {
      success: true,
      passed: result.passed,
      feedback: result.feedback,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[verifyExecutionAction] AI verification failed:', msg);
    return { success: false, error: 'AI verification service is temporarily unavailable. Please try again.' };
  }
}
