import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import type { NextRequest } from "next/server"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { message, character, history } = await req.json()
    console.log("Received chat request for character:", character.name)
    console.log("Message:", message)

    if (!message || !character) {
      console.error("Invalid request format - missing message or character")
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemMessage = `${character.description}

Character Background: ${character.greeting}

IMPORTANT GUIDELINES:
- Keep conversations appropriate and respectful
- Avoid inappropriate, sexual, or harmful content
- If asked about inappropriate topics, politely redirect the conversation
- Stay in character while maintaining appropriate boundaries
- Be engaging and helpful within appropriate limits

You are having a conversation with a user. Respond naturally as ${character.name} while following community guidelines.`

    const messages = [
      { role: "system" as const, content: systemMessage },
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ]

    let result
    try {
      result = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        messages,
        temperature: 0.7,
        maxTokens: 500,
      })
    } catch (aiError: any) {
      console.error("Error calling Groq model:", aiError)
      if (aiError.message && (aiError.message.includes("API key") || aiError.message.includes("authentication"))) {
        return new Response(
          JSON.stringify({ error: "Groq API key is missing or invalid. Please check your environment variables." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
      return new Response(
        JSON.stringify({ error: `Failed to get response from Groq: ${aiError.message || "Unknown error"}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return new Response(JSON.stringify({ message: result.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Chat API request processing error:", error)
    return new Response(
      JSON.stringify({ error: `Failed to process chat request: ${error.message || "Unknown error"}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
