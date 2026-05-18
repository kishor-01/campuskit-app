// src/app/api/goals/generate-study-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { aiProvider, ProviderOverloadedError } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goalId } = await req.json();
    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required.' }, { status: 400 });
    }

    // Fetch goal with full context
    const goal = await prisma.goal.findUnique({
      where: { id: goalId, userId: session.user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                subTopics: {
                  orderBy: { order: 'asc' },
                  select: { title: true, isCompleted: true },
                },
              },
            },
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found.' }, { status: 404 });
    }

    if (!goal.targetDate) {
      return NextResponse.json(
        { error: 'Set a target date on this goal before generating a study plan.' },
        { status: 400 }
      );
    }

    if (!aiProvider.hasKeys) {
      return NextResponse.json(
        { error: 'AI provider is not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Build context string from milestones/topics
    const milestoneContext = goal.milestones
      .map((m) => {
        const topics = m.topics
          .map((t) => {
            const subs = t.subTopics
              .map((s) => `  - [${s.isCompleted ? 'DONE' : 'TODO'}] ${s.title}`)
              .join('\n');
            return `  Topic: ${t.title}\n${subs}`;
          })
          .join('\n');
        return `Milestone: ${m.title}\n${topics}`;
      })
      .join('\n\n');

    const daysUntilTarget = Math.ceil(
      (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
You are an expert Academic Coach and Study Strategist.
Create a detailed, personalized study plan for the following goal.

Goal Title: ${goal.title}
Target Date: ${goal.targetDate.toISOString().split('T')[0]} (${daysUntilTarget} days remaining)
Priority: ${goal.priority}

Current Progress Structure:
${milestoneContext || 'No milestones yet — create a general plan.'}

Return the schedule STRICTLY in JSON format. Do not include markdown formatting like \`\`\`json.
The JSON object must have exactly this structure:
{
  "summary": "<string, a brief motivating summary of the personalized plan>",
  "weeklyRoutine": [
    {
      "day": "<string, e.g., 'Monday'>",
      "focus": "<string, which milestone/topic to focus on>",
      "tasks": ["<string, specific task 1>", "<string, specific task 2>"]
    }
  ],
  "milestones": [
    {
      "title": "<string, checkpoint name>",
      "timing": "<string, e.g., 'Week 2'>"
    }
  ],
  "tips": ["<string>", "<string>"]
}

Rules:
- Cover 7 days (Monday through Sunday) in weeklyRoutine.
- Base the plan on the ACTUAL milestones/topics listed above.
- Mark already-completed items as review sessions, not new study.
- If ${daysUntilTarget} days is very short, compress the plan appropriately.
- If priority is CRITICAL, increase daily workload.
- Provide 3-5 actionable tips.
`;

    const parsedJson = await aiProvider.runWithFallbackJSON(prompt);

    // Store the plan persistently
    await prisma.goal.update({
      where: { id: goalId },
      data: { aiStudyPlan: parsedJson as any },
    });

    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error('Study Plan Generation Error:', error);

    if (error instanceof ProviderOverloadedError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during plan generation.' },
      { status: 500 }
    );
  }
}
