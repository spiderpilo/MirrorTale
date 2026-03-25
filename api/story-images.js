import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generatePageImage(prompt, pageNumber) {
  const imageResult = await client.images.generate({
    model: 'gpt-image-1.5',
    prompt,
    size: '1024x1024',
  })

  const base64Image = imageResult.data?.[0]?.b64_json

  if (!base64Image) {
    throw new Error(`Image generation returned no image data for page ${pageNumber}.`)
  }

  return `data:image/png;base64,${base64Image}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    const pagesWithImages = []

    for (let index = 0; index < pages.length; index++) {
      const page = pages[index]
      const pageNumber = index + 1

      const prompt = `
Create a children's storybook illustration for page ${pageNumber} of 7.

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

      try {
        let image = ''

        try {
          image = await generatePageImage(prompt, pageNumber)
        } catch (firstError) {
          console.error(`First image attempt failed for page ${pageNumber}:`, firstError)

          image = await generatePageImage(prompt, pageNumber)
        }

        pagesWithImages.push({
          ...page,
          image,
        })
      } catch (pageError) {
        console.error(`Story image route error on page ${pageNumber}:`, pageError)

        pagesWithImages.push({
          ...page,
          image: '',
          imageError: `Failed to generate image for page ${pageNumber}.`,
        })
      }
    }

    res.status(200).json({
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
}