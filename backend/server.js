import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const port = process.env.PORT || 5001

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.use(cors())
app.use(express.json({ limit: '25mb' }))

app.get('/', (req, res) => {
  res.json({ message: 'MirrorTale backend is running' })
})

app.post('/api/reflect', async (req, res) => {
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

    res.json({
      reply: response.output_text,
    })
  } catch (error) {
    console.error('Reflect route error:', error)
    res.status(500).json({
      error: 'Something went wrong while generating the reflection response.',
    })
  }
})

app.post('/api/story', async (req, res) => {
  try {
    const { conversationHistory = [], userName = 'Traveler' } = req.body

    const storyResponse = await client.responses.create({
      model: 'gpt-5.4',
      input: [
        {
          role: 'system',
          content: `
You are MirrorTale, a storytelling engine.

Your job:
- Turn the user's reflection into a fairytale-style story
- Make it symbolic, warm, emotionally meaningful, and visually coherent
- Do NOT give advice
- Do NOT sound clinical

CRITICAL GOALS:
1. Create ONE consistent main character for the entire story
2. Create ONE consistent world/theme for the entire story
3. Avoid overusing the same motifs across different stories
4. Do NOT default to lantern + forest unless it genuinely fits the user's reflection

THEME VARIETY:
Choose the story world based on the emotional tone of the reflection.
Possible themes/settings include:
- moonlit sea
- floating islands
- hidden garden
- snowy mountain village
- rain-soaked city of paper umbrellas
- desert of glass dunes
- clocktower town
- starlit library
- valley of birds
- coral kingdom
- forgotten railway
- hillside orchard
- mirror lake
- candlelit theatre
- sky bridge kingdom
- gentle storm coast
- mountain temple path
- underground glowing cave
- meadow of giant flowers
- old village of windmills

You may use other original themes too.
Only use lantern imagery if it truly fits the emotional arc.

CHARACTER CONSISTENCY:
Create a single protagonist and keep them visually consistent across all pages.
Lock:
- age impression
- hairstyle
- hair color
- face shape
- clothing
- signature accessory
- overall vibe

STYLE CONSISTENCY:
Create a single illustration style for the whole story.
Keep it consistent across all pages.

OUTPUT RULES:
- Exactly 7 pages
- Each page must include:
  1. "text" (2 to 4 sentences)
  2. "imagePrompt" (clear illustration prompt for that page)
- Include a beginning, middle, and end
- The main character should loosely reflect the user
- Use soft, storybook-style language
- Keep visual continuity across pages

Return ONLY valid JSON in this exact format:
{
  "title": "Story title here",
  "theme": "short theme label",
  "setting": "one sentence describing the story world",
  "characterDescription": "one detailed paragraph describing the protagonist consistently",
  "styleGuide": "one detailed paragraph describing the illustration style consistently",
  "pages": [
    {
      "text": "Page 1 text",
      "imagePrompt": "Illustration prompt for page 1"
    },
    {
      "text": "Page 2 text",
      "imagePrompt": "Illustration prompt for page 2"
    },
    {
      "text": "Page 3 text",
      "imagePrompt": "Illustration prompt for page 3"
    },
    {
      "text": "Page 4 text",
      "imagePrompt": "Illustration prompt for page 4"
    },
    {
      "text": "Page 5 text",
      "imagePrompt": "Illustration prompt for page 5"
    },
    {
      "text": "Page 6 text",
      "imagePrompt": "Illustration prompt for page 6"
    },
    {
      "text": "Page 7 text",
      "imagePrompt": "Illustration prompt for page 7"
    }
  ]
}
          `.trim(),
        },
        {
          role: 'user',
          content: `
User name: ${userName}

Conversation history:
${JSON.stringify(conversationHistory, null, 2)}
          `.trim(),
        },
      ],
    })

    const rawText = storyResponse.output_text

    let parsedStory

    try {
      parsedStory = JSON.parse(rawText)
    } catch (parseError) {
      console.error('Story JSON parse error:', parseError)
      console.error('Raw response:', rawText)
      return res.status(500).json({ error: 'Failed to parse story JSON.' })
    }

    res.json({
      title: parsedStory.title,
      theme: parsedStory.theme,
      setting: parsedStory.setting,
      characterDescription: parsedStory.characterDescription,
      styleGuide: parsedStory.styleGuide,
      pages: parsedStory.pages,
    })
  } catch (error) {
    console.error('Story route error:', error)
    res.status(500).json({
      error: 'Story generation failed.',
    })
  }
})

app.post('/api/story-images', async (req, res) => {
  try {
    const {
      title = '',
      theme = '',
      setting = '',
      characterDescription = '',
      styleGuide = '',
      pages = [],
    } = req.body

    if (!pages.length) {
      return res.status(400).json({ error: 'No pages provided.' })
    }

    const pagesWithImages = await Promise.all(
      pages.map(async (page, index) => {
        const prompt = `
Create a children's storybook illustration for page ${index + 1} of 7.

GLOBAL STORY CONSISTENCY:
Title: ${title}
Theme: ${theme}
Setting: ${setting}

LOCKED MAIN CHARACTER:
${characterDescription}

LOCKED ILLUSTRATION STYLE:
${styleGuide}

PAGE-SPECIFIC SCENE:
${page.imagePrompt}

IMPORTANT CONSISTENCY RULES:
- The main character must look like the SAME person as in every other page
- Keep the same face, hair, clothing, body proportions, and signature accessory
- Keep the same visual world and mood across the whole book
- Do not introduce a totally different character design
- Do not switch to a different art style
- Do not add text, captions, or lettering inside the image

IMAGE STYLE:
- whimsical storybook illustration
- painterly
- warm and emotionally gentle
- visually rich but clean
- suitable for all ages
        `.trim()

        const imageResult = await client.images.generate({
          model: 'gpt-image-1.5',
          prompt,
          size: '1024x1024',
        })

        const base64Image = imageResult.data?.[0]?.b64_json

        if (!base64Image) {
          throw new Error('Image generation returned no image data.')
        }

        return {
          ...page,
          image: `data:image/png;base64,${base64Image}`,
        }
      })
    )

    res.json({
      title,
      theme,
      setting,
      characterDescription,
      styleGuide,
      pages: pagesWithImages,
    })
  } catch (error) {
    console.error('Story image route error:', error)
    res.status(500).json({
      error: 'Failed to generate story images.',
    })
  }
})

app.listen(port, () => {
  console.log(`MirrorTale backend running on http://localhost:${port}`)
})