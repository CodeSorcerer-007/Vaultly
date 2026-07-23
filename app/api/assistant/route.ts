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

  const { query, filesMetadata } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  try {
    const systemPrompt = `You are an AI assistant for a local file management system called Vaultly.
Your job is to understand the user's natural language query and help them manage their files.

You will be provided with a JSON list of the user's files (metadata only, no content).
You must return a raw JSON object (and ONLY JSON, no markdown formatting) with the following structure:
{
  "answer": "A friendly, conversational response summarizing what you found or suggesting an action.",
  "matchedFileIds": ["id1", "id2"], // An array of file IDs that are relevant to the query (empty if none).
  "actionSuggested": "cleanup" | "organize" | "rename" | "summarize" | null // Suggest an action if appropriate.
}

If the user asks to find something, identify the relevant files based on their name, category, or tags, and return their IDs.
If the user asks about duplicates, junk files, or large files, you can suggest the "cleanup" action.
Keep your 'answer' concise and helpful.`;

    const userPrompt = `User Query: "${query}"

Here is the JSON list of the user's file metadata:
${JSON.stringify(filesMetadata)}

Remember, reply ONLY with valid JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1, // Low temperature for more deterministic JSON output
      response_format: { type: "json_object" }
    });

    const aiResponseContent = completion.choices[0]?.message?.content?.trim();

    if (!aiResponseContent) {
      throw new Error("The AI didn't return a valid response.");
    }

    const parsedResponse = JSON.parse(aiResponseContent);
    return NextResponse.json(parsedResponse);
  } catch (err: any) {
    console.error("AI Assistant error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong processing your query." },
      { status: 500 }
    );
  }
}
