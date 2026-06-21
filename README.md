# QuestLog App

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://questlog-app-pi.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

An RPG-themed daily to-do list — turn your real-life tasks into quests, earn XP, level up your character, and track your productivity in a gamified way.

## Live Demo

[questlog-app-pi.vercel.app](https://questlog-app-pi.vercel.app)

## Features

- Create tasks as RPG quests with XP reward values
- Earn XP and level up your character by completing quests
- Visual XP progress bar with level indicator
- Quest categories: Daily, Weekly, Side Quest
- Persistent progress via localStorage — no login needed
- AI-generated character portraits via the Vertex AI API
- Clean, RPG-inspired dark theme

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES6+) |
| Styling | Custom CSS with RPG theme |
| Storage | localStorage |
| Portraits | Vertex AI (Imagen API) |
| Deployment | Vercel |

## What This Code Shows

- Vanilla JS state management without a framework — pure DOM manipulation
- localStorage persistence with JSON serialization
- XP / leveling formula: level = floor(totalXP / 100)
- AI portrait generation via Vertex AI's Imagen API
- CSS custom properties and animations for the RPG visual theme

## Getting Started

```bash
git clone https://github.com/sonnymay/questlog-app.git
cd questlog-app
# Open index.html in your browser, or serve it locally:
npx serve .
```

## License

MIT
