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
app.use(express.json({ limit: '50mb' }))

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

async function buildAppearanceProfile(userPhoto, userName) {
  if (!userPhoto) {
    return `${userName || 'The protagonist'} has gentle, storybook-style features and should remain visually consistent across every illustration.`
  }

  const response = await client.responses.create({
    model: 'gpt-5.4',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `
You are creating a character appearance profile for a storybook illustrator.

Look at the user's selfie and write one tight paragraph that describes:
- face shape
- hair color and hairstyle
- skin tone
- approximate age impression
- notable visual traits
- a calm, neutral description suitable for a whimsical or dark-fantasy children's storybook

Do NOT identify the person.
Do NOT mention camera angle or photo quality.
Do NOT speculate wildly.
Keep it concrete and reusable for consistent illustration generation.
            `.trim(),
          },
          {
            type: 'input_image',
            image_url: userPhoto,
          },
        ],
      },
    ],
  })

  return response.output_text
}

app.post('/api/story', async (req, res) => {
  try {
    const {
      conversationHistory = [],
      userName = 'Traveler',
      userPhoto = '',
      storyMood = 'gentle',
    } = req.body

    const appearanceProfile = await buildAppearanceProfile(userPhoto, userName)

    const moodInstructions =
      storyMood === 'ominous'
        ? `
TONE:
- dark fantasy
- eerie and suspenseful
- haunting but beautiful
- monsters, shadow creatures, ominous beings, or surreal threats are allowed
- emotionally intense, cinematic, mysterious
- no graphic gore
- no body horror
- no extreme violence

THEME DIRECTION:
Favor worlds like:
- abandoned towers
- whispering forests
- black seas
- moonlit ruins
- storm kingdoms
- caves with ancient watchers
- haunted valleys
- forgotten railways
- eerie libraries
- ash-covered villages
`
        : `
TONE:
- warm, magical, reflective
- whimsical and emotionally safe
- gentle wonder
- soft, hopeful, symbolic
- no scary monsters as central threats

THEME DIRECTION:
Favor worlds like:
- hidden gardens
- floating islands
- moonlit seas
- orchards
- starlit libraries
- windmill villages
- sky bridges
- flower meadows
- coral kingdoms
- snowy villages
`

    const storyResponse = await client.responses.create({
      model: 'gpt-5.4',
      input: [
        {
          role: 'system',
          content: `
You are MirrorTale, a storytelling engine.

Your job:
- Turn the user's reflection into a fairytale-style story
- Make it symbolic, emotionally meaningful, and visually coherent
- Do NOT give advice
- Do NOT sound clinical

CRITICAL GOALS:
1. Create ONE consistent main character for the entire story
2. Create ONE consistent world/theme for the entire story
3. Avoid overusing the same motifs across different stories
4. Only use lantern imagery if it genuinely fits the user's reflection

${moodInstructions}

OUTPUT RULES:
- Exactly 7 pages
- Each page must include:
  1. "text" (2 to 4 sentences)
  2. "imagePrompt" (clear illustration prompt for that page)
- Include a beginning, middle, and end
- Use soft, storybook-style language
- Keep visual continuity across pages
- If storyMood is ominous, the story may be scary, but it must remain imaginative and non-graphic

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
Story mood: ${storyMood}

Appearance profile derived from the user's selfie:
${appearanceProfile}

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
      appearanceProfile,
      storyMood,
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
      appearanceProfile = '',
      storyMood = 'gentle',
      pages = [],
    } = req.body

    if (!pages.length) {
      return res.status(400).json({ error: 'No pages provided.' })
    }

    const moodImageRules =
      storyMood === 'ominous'
        ? `
VISUAL MOOD:
- dark fantasy
- eerie lighting
- shadowy monsters or ominous creatures may appear
- suspenseful, haunting atmosphere
- non-graphic
- beautiful and cinematic rather than gory
`
        : `
VISUAL MOOD:
- warm fantasy
- soft light
- magical and reflective
- gentle and wonder-filled
`

    const pagesWithImages = await Promise.all(
      pages.map(async (page, index) => {
        const prompt = `
Create a children's storybook illustration for page ${index + 1} of 7.

GLOBAL STORY CONSISTENCY:
Title: ${title}
Theme: ${theme}
Setting: ${setting}

LOCKED VISUAL IDENTITY FROM USER SELFIE:
${appearanceProfile}

LOCKED STORY CHARACTER:
${characterDescription}

LOCKED ILLUSTRATION STYLE:
${styleGuide}

${moodImageRules}

PAGE-SPECIFIC SCENE:
${page.imagePrompt}

IMPORTANT RULES:
- The main character should visually resemble the same person described in the selfie-derived appearance profile
- Keep the same face, hair, and overall identity across all pages
- Keep the same world and style across all pages
- No text inside the image
- Painterly storybook feel
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
      appearanceProfile,
      storyMood,
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