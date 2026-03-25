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
      conversationHistory = [],
      userName = "Traveler",
      storyMood = "gentle",
    } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: [
        {
          role: "system",
          content: `Generate a 7-page storybook as JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({ conversationHistory, userName, storyMood }),
        },
      ],
    });

    const parsed = JSON.parse(response.output_text);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Story failed" });
  }
}