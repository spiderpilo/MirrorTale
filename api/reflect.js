import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      userMessage,
      conversationHistory = [],
      stage = "intro",
    } = req.body;

    const stageInstructions = {
      intro: `Welcome user and learn their name briefly.`,
      reflection: `Ask ONE thoughtful question. No advice.`,
      deeper_reflection: `Go deeper emotionally. Still no advice.`,
    };

    const input = [
      {
        role: "system",
        content: `
You are MirrorTale, a gentle reflection companion.

- No advice
- Ask one question
- Be warm and human

${stageInstructions[stage] || stageInstructions.reflection}
        `,
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input,
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reflection failed" });
  }
}