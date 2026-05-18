import { NextRequest, NextResponse } from "next/server";
import { aiProvider, ProviderOverloadedError } from "@/lib/ai-provider";
// Use require() because pdf-parse's default export doesn't resolve correctly
// via ES import in Next.js Webpack bundling
const pdfParse = require("pdf-parse");
import * as mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;

    if (!resumeFile || !jobDescription) {
      return NextResponse.json(
        { error: "Resume file and Job Description are required." },
        { status: 400 }
      );
    }

    if (!aiProvider.hasKeys) {
      return NextResponse.json(
        { error: "AI provider is not configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    // 1. Parse the Resume File
    let resumeText = "";
    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const mimeType = resumeFile.type;
    const fileName = resumeFile.name.toLowerCase();

    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const pdfData = await pdfParse(fileBuffer);
        resumeText = pdfData.text;
      } catch (err) {
        console.error("PDF Parse Error:", err);
        return NextResponse.json({ error: "Failed to parse PDF file." }, { status: 400 });
      }
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = result.value;
      } catch (err) {
        console.error("DOCX Parse Error:", err);
        return NextResponse.json({ error: "Failed to parse DOCX file." }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX." },
        { status: 400 }
      );
    }

    // Clean up parsed text a bit
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    // 2. Call Gemini API via AIProvider
    const prompt = `
You are an expert Applicant Tracking System (ATS) and a Senior Technical Recruiter.
Analyze the following resume against the provided job description.
Return the analysis strictly in JSON format. Do not include markdown formatting like \`\`\`json.

The JSON object must have exactly the following structure:
{
  "matchScore": <number between 0 and 100 representing percentage match>,
  "matchedKeywords": ["<string>", ...],
  "missingKeywords": ["<string>", ...],
  "summary": "<string, a 2-3 sentence summary of their fit>",
  "actionableTips": ["<string>", ...]
}

--- JOB DESCRIPTION ---
${jobDescription}

--- RESUME TEXT ---
${resumeText}
`;

    const parsedJson = await aiProvider.runWithFallbackJSON(prompt);
    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("ATS Route Error:", error);

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
