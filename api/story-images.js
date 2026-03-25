import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { pages = [] } = req.body;

    const pagesWithImages = await Promise.all(
      pages.map(async (page) => {
        const image = await client.images.generate({
          model: "gpt-image-1.5",
          prompt: page.imagePrompt,
          size: "1024x1024",
        });

        return {
          ...page,
          image: `data:image/png;base64,${image.data[0].b64_json}`,
        };
      })
    );

    res.json({ pages: pagesWithImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image generation failed" });
  }
}