import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are a professional tax consultant assistant for an Indian CA firm.
Draft formal replies to Income Tax and GST notices on behalf of the firm.
 
Rules:
- Formal legal language appropriate for Indian tax authorities
- Reference correct section numbers and legal provisions
- 3 to 5 paragraphs, concise but complete
- End with a line requesting appropriate relief
- Plain paragraphs only — no bullet points, no subject line, no salutation, no signature`;

export async function POST(req: NextRequest) {
  try {
    const { fileBase64, mimeType } = await req.json();

    if (!fileBase64 || !mimeType) {
      return new Response("Missing fileBase64 or mimeType", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContentStream([
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType,
        },
      },
      {
        text: `${SYSTEM_PROMPT}\n\nThe notice document is attached above. Draft a formal reply based on its contents.`,
      },
    ]);

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({ delta: { text } });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          const errData = JSON.stringify({ error: "Stream error" });
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
