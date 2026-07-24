import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { fileUrl, mimeType, fileName } = await req.json();

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  try {
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Couldn't fetch the file.");

    let text = "";

    if (mimeType?.includes("pdf") || fileName?.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      text = await fileRes.text();
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Couldn't find any readable text in this file." },
        { status: 422 }
      );
    }

    // Keep prompt size reasonable — Groq handles large context, but a demo
    // doesn't need to send an entire book.
    const truncated = text.slice(0, 20000);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You summarize documents clearly and concisely for someone deciding whether to read the full thing. Use plain language, 3-5 sentences or a short bullet list, and note the document's overall purpose.",
        },
        {
          role: "user",
          content: `Summarize this document titled "${fileName}":\n\n${truncated}`,
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
