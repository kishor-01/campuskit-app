import { NextRequest, NextResponse } from "next/server";
import { aiProvider, ProviderOverloadedError } from "@/lib/ai-provider";
const pdfParse = require("pdf-parse");
import * as mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const documentFile = formData.get("document") as File | null;
    let textContent = formData.get("textContent") as string | null;

    if (!documentFile && (!textContent || !textContent.trim())) {
      return NextResponse.json(
        { error: "Please provide either a document file or paste text to analyze." },
        { status: 400 }
      );
    }

    if (!aiProvider.hasKeys) {
      return NextResponse.json(
        { error: "AI provider is not configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    // 1. Parse the File if provided
    let extractedText = textContent || "";
    if (documentFile) {
      const fileBuffer = Buffer.from(await documentFile.arrayBuffer());
      const mimeType = documentFile.type;
      const fileName = documentFile.name.toLowerCase();

      if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        try {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
        } catch (err) {
          console.error("PDF Parse Error:", err);
          return NextResponse.json({ error: "Failed to parse PDF file." }, { status: 400 });
        }
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx") || fileName.endsWith(".doc")
      ) {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } catch (err) {
          console.error("DOCX Parse Error:", err);
          return NextResponse.json({ error: "Failed to parse Word document." }, { status: 400 });
        }
      } else {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF or DOCX." },
          { status: 400 }
        );
      }
    }

    // Clean up text
    extractedText = extractedText.replace(/\s+/g, " ").trim();
    if (extractedText.length < 50) {
      return NextResponse.json(
        { error: "The provided text is too short to analyze accurately. Please provide more content." },
        { status: 400 }
      );
    }

    // Limit text length to prevent token overflow (e.g., first ~30k chars)
    extractedText = extractedText.slice(0, 30000);

    // 2. Call Gemini API via AIProvider
    const prompt = `
You are an expert Academic Integrity and AI Content Detection Engine.
Analyze the following text for originality, potential plagiarism, and the likelihood of it being AI-generated (e.g., by ChatGPT, Claude, etc.).

Return the analysis STRICTLY in JSON format. Do not include markdown formatting like \`\`\`json.
The JSON object must have exactly the following structure:
{
  "originalityScore": <number between 0 and 100, where 100 means fully original/human, and 0 means fully copied/AI>,
  "aiProbabilityScore": <number between 0 and 100 representing the likelihood it was AI-generated>,
  "verdict": "<string, a short 1-2 sentence final verdict on the text's integrity>",
  "flaggedPassages": [
    {
      "text": "<string, a short snippet of the suspicious text>",
      "reason": "<string, why it was flagged (e.g., 'Highly matches typical AI phrasing' or 'Common boilerplate/plagiarized phrasing')>"
    }
  ],
  "recommendations": ["<string>", "<string>"]
}

--- DOCUMENT TEXT TO ANALYZE ---
${extractedText}
`;

    const parsedJson = await aiProvider.runWithFallbackJSON(prompt);
    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Plagiarism Checker Route Error:", error);

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
