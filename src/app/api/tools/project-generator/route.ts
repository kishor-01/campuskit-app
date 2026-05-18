import { NextRequest, NextResponse } from "next/server";
import { aiProvider, ProviderOverloadedError } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { skills, interests, difficulty } = await req.json();

    if (!skills || !interests) {
      return NextResponse.json(
        { error: "Skills and interests are required." },
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
You are an expert Software Engineer and Mentor. 
Generate 3 detailed project blueprints based on the following student profile.
The projects should be impressive for a resume and highly educational.

Crucially, you must build for a Senior Engineering perspective. Every project must include an Architectural Decision Record (ADR) milestone. Explain *why* you chose a specific database, caching strategy, or architectural pattern (e.g., 'Choosing Redis for pub/sub to ensure real-time inventory updates'). We are building architects, not just coders.
Furthermore, include a Production Checklist in the milestones involving Unit Testing with Vitest, Dockerization, and a CI/CD Pipeline blueprint using GitHub Actions.

Skills: ${skills}
Interests/Domain: ${interests}
Difficulty Level: ${difficulty || 'Intermediate'}

Return the analysis STRICTLY in JSON format. Do not include markdown formatting like \`\`\`json.
The JSON object must have exactly the following structure:
{
  "projects": [
    {
      "title": "<string, catchy project title>",
      "description": "<string, 2-3 sentences explaining what it is and why it's useful>",
      "techStack": ["<string>", ...],
      "milestones": ["<string>", ...]
    }
  ]
}
`;

    const parsedJson = await aiProvider.runWithFallbackJSON(prompt);
    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Project Generator Route Error:", error);

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
