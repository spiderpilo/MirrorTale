## MirrorTale 🌙

An AI-powered reflection companion that turns your thoughts into a story.

## ✨ Overview

MirrorTale is an AI-driven reflection experience designed to help users process their thoughts through conversation—not advice.

Instead of telling users what to do, MirrorTale asks Socratic-style questions that guide them toward their own understanding. After the session, their reflections are transformed into a personalized, illustrated storybook.

## 🎯 Features
🧠 Socratic AI Reflection — guided, non-judgmental conversations
📖 Story Generation — turns reflections into a 7-page fairytale
🎨 AI Illustrations — generated visuals for each story page
📚 Interactive Storybook UI — smooth page transitions with animations
📸 Camera Integration — capture a photo for personalization
📄 Export as PDF — save meaningful stories
🧩 Tech Stack

### Frontend

React (Vite)
Framer Motion

### Backend

Node.js
Express

### AI

OpenAI GPT API (conversation + story generation)
Image generation API

## 🧠 How It Works
User starts a reflection session
AI asks thoughtful, open-ended questions
Responses are collected and structured
User clicks “Generate Story”
AI creates a narrative across 7 pages
Images are generated for each page
Story is displayed as an interactive book

## 🚀 Getting Started

1. Clone the repo
- git clone https://github.com/spiderpilo/MirrorTale
- cd mirrortale

2. Install dependencies
- npm install

Frontend
- npm install

Backend
- cd backend
- npm install

3. Set up environment variables

- Create a .env file inside the backend folder:

OPENAI_API_KEY=your_api_key_here
PORT=5001

4. Run the app

- Start backend
- cd backend
- npm run dev

You should see:

MirrorTale backend running on http://localhost:5001

- Start frontend
- npm run dev

Then open:

http://localhost:5173

## ⚠️ Notes
Make sure your OpenAI API key has sufficient credits
Image generation may take a few seconds per page
If you hit rate limits, reduce requests or reuse responses for demo

## 🧗 Challenges
Making AI feel natural instead of robotic
Maintaining story consistency across multiple pages
Handling dynamic UI with unpredictable AI outputs
Managing API limits during development

## 🏆 Accomplishments
Built a full AI pipeline (conversation → story → images)
Created a meaningful, user-centered experience
Designed a cohesive interactive storybook interface

## 📚 What We Learned
Prompt design heavily influences AI behavior
Multi-step AI pipelines require careful structuring
Designing for AI output requires flexible UI thinking

## 🔮 Future Improvements
Personalized memory across sessions
Multiple story modes (light, dark, ominous themes)
Improved image consistency
Mobile optimization

## 💡 Vision
MirrorTale aims to make reflection something you can see, revisit, and understand—not just something you think about once and forget.


## 👨‍💻 Authors
Piolo Patag
Phuc Hoang

