import OpenAI from "openai"
import { NextResponse } from "next/server"
import { professionDescriptions } from "../../../types/profession-test"

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(request: Request) {
    const { answers } = await request.json()

    const prompt = `
    Based on the following user answers to a military profession test, suggest the most suitable military professions. 
    Provide a brief explanation for each suggestion.

    User Answers:
    ${JSON.stringify(answers, null, 2)}

    Available Military Professions:
    ${Object.entries(professionDescriptions)
            .map(([key, value]) => `${key}: ${value.title} - ${value.description}`)
            .join("\n")}

    Please provide your suggestions in the following format:
    1. [Profession Key]: Brief explanation
    2. [Profession Key]: Brief explanation
    3. [Profession Key]: Brief explanation

    Respond in Ukrainian language.
  `

    try {
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant specialized in military career guidance.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        })

        const aiSuggestions = completion.choices[0].message.content

        return NextResponse.json({ suggestions: aiSuggestions })
    } catch (error) {
        console.error("Error calling OpenAI:", error)
        return NextResponse.json({ error: "Failed to process the request" }, { status: 500 })
    }
}

