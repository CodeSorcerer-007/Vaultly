import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  // Confirm the request comes from a logged-in user for security.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { content, fileName } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Missing content." }, { status: 400 });
  }

  try {
    const text = content.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Couldn't find any readable text in this file." },
        { status: 422 }
      );
    }

    // Keep prompt size reasonable
    const truncated = text.slice(0, 20000);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You summarize documents clearly and concisely. Use plain language, 3-5 sentences or a short bullet list, and note the document's overall purpose.",
        },
        {
          role: "user",
          content: `Summarize this document titled "${fileName || "Unknown"}":\n\n${truncated}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("The AI didn't return a summary.");
    }

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error("Summarize error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong summarizing this file." },
      { status: 500 }
    );
  }
}
