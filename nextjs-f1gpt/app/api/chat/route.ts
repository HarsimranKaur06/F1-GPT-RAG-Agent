import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  namespace: process.env.ASTRA_DB_NAMESPACE!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages?.[messages.length - 1]?.content;

    let docContext = "";

    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    // Search Astra DB for relevant documents
    try {
      const collection = await db.collection(process.env.ASTRA_DB_COLLECTION!);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 5,
      });

      const documents = await cursor.toArray();
      docContext = documents.map(doc => doc.text).join("\n\n---\n\n");
    } catch (err) {
      console.error("Error querying Astra DB:", err);
      docContext = "";
    }

    // System prompt with Astra DB context
    const systemPrompt = {
      role: "system",
      content: `You are an expert Formula 1 assistant.
Use the following context to answer questions. If it's not relevant, use your own knowledge.

Context:
${docContext || "No additional context available."}

Conversation so far:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}
`,
    };

    // Stream OpenAI response
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [systemPrompt, ...messages.filter(m => m.role !== "system")],
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
