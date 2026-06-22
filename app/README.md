# THE SYSTEM - Solo Leveling Fitness PWA

A gamified fitness transformation app inspired by Solo Leveling. Enter your stats, get a personalized RPG system with daily quests, XP, leveling, badges, weekly dungeons, and boss raids.

## Features

- Dynamic system generation based on your body stats & fitness level
- Daily quests that scale with your rank (E → S)
- XP & leveling system (100 XP per level)
- 6 ranks with weight targets and fitness progression
- Weekly dungeons (Saturday challenges)
- Monthly boss raids (fitness tests)
- 17+ badges and titles to earn
- Shadow Army (habit stacking system)
- Nutrition protocol that phases with your rank
- Streak tracking with penalties for missed days
- Weight logging with progress chart
- Full offline support (PWA)
- All data stored locally (no server needed)

## Setup

### Option 1: GitHub Pages (Recommended)

1. Push this repo to GitHub
2. Go to Settings → Pages → Source: `main` branch, `/app` folder (or root)
3. Your app is live at `https://yourusername.github.io/solo-leveling-system/`

### Option 2: Local

```bash
cd app
python3 -m http.server 8000
# Open http://localhost:8000
```

## Install as App

1. Open the URL in Chrome/Safari on your phone
2. Tap "Add to Home Screen" (or the install icon in address bar)
3. Done — it works like a native app

## Tech

- Pure HTML/CSS/JS — no frameworks, no build step
- Service Worker for offline caching
- localStorage for all data persistence
- PWA manifest for installability

## License

MIT — do whatever you want with it.
