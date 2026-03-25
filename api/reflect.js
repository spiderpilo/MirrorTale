import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      userMessage,
      conversationHistory = [],
      stage = 'intro',
    } = req.body

    const stageInstructions = {
      intro: `
Your goal is to warmly welcome the user and learn their name.
Keep it brief and natural.
If they give their name, gently transition into asking about their day.
      `,
      reflection: `
Help the user reflect on their day.
Ask ONE thoughtful follow-up question at a time.
Focus on emotions, meaning, or what stood out.
Do not give advice.
Keep it warm and human.
      `,
      deeper_reflection: `
Go deeper into their experience.
Explore patterns, inner conflict, meaning, or feelings.
Ask one question at a time.
Do not give advice or solutions.
      `,
    }

    const input = [
      {
        role: 'system',
        content: `
You are MirrorTale, a gentle reflection companion.

Core behavior:
- You help users reflect on their day
- You do NOT give advice
- You do NOT solve problems
- You ask one meaningful question at a time
- You sound warm, thoughtful, and human
- You briefly acknowledge what the user said before asking the next question

Current stage:
${stageInstructions[stage] || stageInstructions.reflection}
        `.trim(),
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ]

    const response = await client.responses.create({
      model: 'gpt-5.4-mini',
      input,
    })

    res.status(200).json({
      reply: response.output_text,
    })
  } catch (error) {
    console.error('Reflect route error:', error)
    res.status(500).json({
      error: 'Something went wrong while generating the reflection response.',
    })
  }
}