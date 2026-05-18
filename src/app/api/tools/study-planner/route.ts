import { NextRequest, NextResponse } from "next/server";
import { aiProvider, ProviderOverloadedError } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { subjects, examDate, studyHours } = await req.json();

    if (!subjects || !examDate || !studyHours) {
      return NextResponse.json(
        { error: "Subjects, exam date, and study hours are required." },
        { status: 400 }
      );
    }

    if (!aiProvider.hasKeys) {
      return NextResponse.json(
        { error: "AI provider is not configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    const prompt = `
You are an expert Academic Coach. 
Create a detailed, spaced-repetition study schedule based on the following parameters.

Subjects to Study: ${subjects}
Target Exam Date: ${examDate}
Available Study Hours per Day: ${studyHours}

Return the schedule STRICTLY in JSON format. Do not include markdown formatting like \`\`\`json.
The JSON object must have exactly the following structure:
{
  "summary": "<string, a brief motivating summary of the plan>",
  "weeklyRoutine": [
    {
      "day": "<string, e.g., 'Monday'>",
      "focus": "<string, primary subject or topic>",
      "tasks": ["<string, specific task 1>", "<string, specific task 2>"]
    }
  ],
  "milestones": [
    {
      "title": "<string, e.g., 'Mock Exam 1'>",
      "timing": "<string, e.g., '2 weeks before exam'>"
    }
  ],
  "tips": ["<string>", "<string>"]
}

Ensure the weekly routine covers 7 days (Monday through Sunday).
`;

    const parsedJson = await aiProvider.runWithFallbackJSON(prompt);
    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Study Planner Route Error:", error);

    if (error instanceof ProviderOverloadedError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  }
}
