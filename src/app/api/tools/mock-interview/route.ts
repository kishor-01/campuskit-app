// src/app/api/tools/mock-interview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { aiProvider, ProviderOverloadedError } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId } = body;

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID is required.' }, { status: 400 });
    }

    // Fetch the opportunity for context
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: {
        title: true,
        organization: true,
        description: true,
        type: true,
        skillsRequired: true,
        tier: true,
        difficulty: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 });
    }

    const skillsContext = opportunity.skillsRequired?.length > 0
      ? `Required skills: ${opportunity.skillsRequired.join(', ')}`
      : '';

    const prompt = `You are a senior technical interviewer at ${opportunity.organization}. Generate exactly 5 interview questions for the role: "${opportunity.title}".

Context:
- Organization: ${opportunity.organization}
- Role Type: ${opportunity.type}
- Difficulty Level: ${opportunity.difficulty}
- Tier: ${opportunity.tier}
${skillsContext}
- Job Description: ${opportunity.description.substring(0, 1500)}

Requirements:
1. Questions should be specific to ${opportunity.organization} and this role — not generic
2. Mix of technical and behavioral questions appropriate for the difficulty level
3. For TIER_1 organizations, include system design or architecture questions
4. Each question should test practical problem-solving ability
5. Consider what ${opportunity.organization} specifically values in candidates

Return a JSON object with this exact structure (no markdown fences):
{
  "questions": [
    "Question 1 text here",
    "Question 2 text here",
    "Question 3 text here",
    "Question 4 text here",
    "Question 5 text here"
  ]
}`;

    const result = await aiProvider.runWithFallbackJSON<{ questions: string[] }>(prompt);

    if (!result.questions || !Array.isArray(result.questions)) {
      return NextResponse.json({ error: 'Invalid AI response format.' }, { status: 500 });
    }

    return NextResponse.json({ questions: result.questions.slice(0, 5) });
  } catch (error: any) {
    if (error instanceof ProviderOverloadedError) {
      return NextResponse.json(
        { error: 'AI service is temporarily overloaded. Please try again in a few minutes.' },
        { status: 429 }
      );
    }
    console.error('Mock interview error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate interview questions.' },
      { status: 500 }
    );
  }
}
