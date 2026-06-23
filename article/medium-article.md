# I Built a Solo Leveling Fitness App That Punishes You for Skipping Workouts

*How I turned an anime obsession into a gamified PWA that generates personalized RPG quests to help you lose weight — and why it actually works.*

---

## The Problem: Gyms Are Boring, Willpower Is Finite

I am 28 years old, 90 kg, 5'7". I have tried gyms. I have tried running. I have tried YouTube workout videos at 6 AM. They all share the same fatal flaw — they rely entirely on willpower, and willpower is a depreciating asset.

But here is what I noticed: I can grind a video game for 14 hours straight without blinking. I can complete every quest in an RPG even when the reward is a meaningless badge. That is not willpower — that is *game design*.

If you have watched Solo Leveling, you know the concept. Sung Jin-Woo gets a "System" — an interface that gives him daily quests, tracks his stats, levels him up, and punishes him for non-compliance. He goes from the weakest hunter to the Shadow Monarch. What if that System existed in real life, but for fitness?

So I built it. A fully dynamic, personalized RPG fitness system as a Progressive Web App. No gym required. No subscription. Just open [arise.akeno.in](https://arise.akeno.in) on your phone, and the System chooses you.

---

## What THE SYSTEM Actually Does

This is not a todo-list with a progress bar slapped on top. It is a complete RPG engine that adapts to your body, your equipment, and your fitness level.

**The flow:**

```
[Boot Screen] → [Player Registration] → [Fitness Test] → [Rank Assignment]
     ↓                                                           ↓
[Daily Quests] ← [Smart AI Layer] ← [Performance Analysis] ← [XP Engine]
     ↓                                                           ↓
[Dungeons/Bosses] → [Badges & Titles] → [Shadow Army] → [Rank Promotion]
```

When you first open the app, you go through a multi-step registration: name, age, height, weight, gender, activity level, available equipment, and a fitness test (max push-ups, squats, plank hold, jump rope). From this data, the System calculates your BMR, TDEE, ideal weight, and assigns you a starting rank from E (Weakest Hunter) to B (Elite Hunter).

Everything after that — every single rep count, exercise type, step target, and water goal — is dynamically generated based on YOUR profile. No two players get the same quest.

---

## Architecture: Zero Dependencies, Zero Excuses

I made deliberate choices to keep this project lean and accessible:

```
app/
├── index.html          (Single page, all screens)
├── css/style.css       (Dark theme, purple/blue glow aesthetic)
├── js/
│   ├── engine.js       (XP, levels, ranks, stat calculations)
│   ├── quests.js       (Dynamic quest/dungeon/boss generation)
│   ├── smart.js        (AI layer — adaptive difficulty, predictions)
│   ├── firebase-config.js  (Cloud sync, Google auth)
│   ├── ui.js           (Screen rendering, animations)
│   └── app.js          (State management, event coordination)
├── sw.js               (Service worker for offline support)
└── manifest.json       (PWA install configuration)
```

**Why no React/Vue/Svelte?** Because a fitness app needs to load instantly on a phone with spotty gym Wi-Fi. Zero framework means zero bundle size overhead, no build step, no node_modules black hole. The entire app is under 100KB. It loads in under a second on 3G.

**Why a PWA over a native app?** Three reasons: (1) free hosting on Firebase, (2) no App Store review process or $99/year developer fee, and (3) the user installs it to their home screen with one tap — full screen, offline-capable, indistinguishable from native.

**Why Firebase?** The free Spark tier gives you Google authentication in one tap, Firestore with offline persistence built-in, and hosting with a custom domain. The guest-first approach means zero friction to start — you do not even need to sign in. Your data lives in localStorage until you optionally connect Google for cross-device sync.

---

## The RPG Engine: How XP, Ranks, and Progression Work

The core engine (`engine.js`) drives all progression logic. Here is the rank system:

| Rank | Title | Weight Target |
|------|-------|---------------|
| E | Weakest Hunter | Starting weight |
| D | The Awakened | -5 kg |
| C | Proven Hunter | -10 kg |
| B | Elite Hunter | -15 kg |
| A | National Level | -20 kg |
| S | Shadow Monarch | Ideal weight |

XP flows from everything you do:

```javascript
XP_REWARDS: {
    dailyQuestFull: 15,
    dailyQuestPartial: 8,
    weeklyDungeon: 50,
    bossRaidExcellent: 200,
    streak7: 30,
    streak30: 200,
    kgLost: 50,
    newExercise: 25,
},

XP_PENALTIES: {
    missedDay: -10,
    missed2Days: -25,
    missed3Days: -50,
    skippedDungeon: -30,
}
```

Every 100 XP, you level up. Levels within a rank unlock new exercises through the Skill Tree — ensuring you do not attempt archer push-ups when you should still be doing wall push-ups. This prevents injury and builds actual progressive overload.

The penalty system is what makes it stick. Miss a day? Lose 10 XP. Miss three? That is -50 XP and a potential level drop. In Solo Leveling, the System does not care if you are tired. Neither does this one.

---

## Dynamic Quest Generation: No Two Days Are the Same

The quest generator (`quests.js`) takes your fitness test results and scales them to your current rank:

```javascript
generateDailyQuest(player, rank, gameState) {
    const rankIndex = SystemEngine.getRankIndex(rank);
    const mult = 1 + (rankIndex * 0.5);

    const pushupBase = Math.max(5, Math.floor(player.maxPushups / 2));
    const squatBase = Math.max(10, Math.floor(player.maxSquats / 2));
    // ...dynamically builds exercise list based on rank and equipment
}
```

At Rank E, you get wall push-ups and bodyweight squats. By Rank A, the System prescribes archer push-ups, burpees, pull-ups (if you have a bar), and resistance band work. The exercise types themselves evolve — the same "push-up" slot cycles through six progressions from wall to decline.

**Weekly Dungeons** drop every Saturday. These are timed challenges named after Solo Leveling locations — Goblin Cave at Rank E, Red Gate at Rank C, Double Dungeon at Rank A. Complete them for 50 XP.

**Monthly Boss Raids** are fitness re-tests named after Monarchs. The King of the Swamp tests your max push-ups. Cerberus measures your plank hold. Antares is the final form — a full-body assessment that determines if you are ready for the next rank.

---

## The Smart Layer: Adaptive Intelligence Without a Server

The `smart.js` module is where the app transcends a simple tracker. It runs entirely client-side — no API calls, no server costs.

**Auto-difficulty scaling:** If you complete 100% of your quests for 7 consecutive days, the System increases your reps by 10%. Crushing everything too easily? The multiplier keeps climbing up to 1.5x. Struggling below 50%? It drops to 0.6x. No manual adjustment needed.

**Energy check-in:** Each morning, the System asks "How do you feel today?" on a 1-5 scale. At energy level 2, it generates a 60% intensity quest with no penalty for partial completion. At level 1, you get a minimum viable quest — 10 squats, 10 push-ups, 30-second plank. Just show up. No penalty.

```javascript
// Energy level 1: Minimum viable quest
const minQuest = {
    exercises: [
        { text: '10 Squats (any form)', id: 'squats' },
        { text: '10 Push-ups (any form)', id: 'pushups' },
        { text: '30s Plank', id: 'plank' },
        { text: 'Walk: 2,000 steps', id: 'steps' },
    ],
    timeEstimate: 10,
};
return { mode: 'minimum', quest: minQuest, 
         message: 'Rest protocol. Minimum quest — just show up.' };
```

This is crucial. Most fitness apps punish you equally for doing nothing and for doing the minimum. THE SYSTEM understands that showing up on your worst day is what builds the habit.

**Plateau detection:** The System monitors your weight log. If you stall for 2+ weeks (less than 0.5 kg change), it triggers a protocol with specific recommendations — increase steps, add cardio, audit portion sizes, or take a strategic diet break.

**Miss pattern analysis:** It tracks which day of the week you fail most often and suggests making that your designated rest day. Data-driven scheduling.

---

## The Gamification Layer: Shadows, Badges, and Bosses

**Shadow Army** is my favorite feature. In Solo Leveling, Sung Jin-Woo summons defeated enemies as shadow soldiers. In THE SYSTEM, each habit you build becomes a summoned shadow:

- **Igris** — Consistent workout completion (7-day streak)
- **Beru** — Nutrition tracking adherence
- **Bellion** — Sleep optimization

Your army grows as your habits solidify. Lose a streak? That shadow fades. It is a visual representation of habit stacking that makes consistency feel like power accumulation.

**17+ Badges and Titles** provide micro-dopamine throughout the journey: "First Blood" (first quest completed), "Iron Will" (7-day streak), "Shadow Monarch" (reaching S-Rank). Each one appears with a notification styled like the anime's system windows.

---

## Making It Installable: The PWA Setup

The service worker caches all assets on first visit:

```javascript
const CACHE_NAME = 'solo-leveling-v3';
const ASSETS = [
    './', './index.html', './css/style.css',
    './js/engine.js', './js/quests.js', './js/smart.js',
    './js/firebase-config.js', './js/ui.js', './js/app.js',
    './manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});
```

The fetch handler uses a cache-first strategy with network fallback. If you are offline (common during outdoor runs), the app works perfectly from cache. If the network is available, it updates the cache in the background.

The `manifest.json` declares standalone display mode, portrait orientation, and the dark theme color (`#0a0a1a`). On Android, Chrome prompts installation automatically. On iOS, users tap Share > Add to Home Screen.

---

## The Aesthetic: Dark Mode That Feels Like the Anime

The CSS uses custom properties to create the signature Solo Leveling atmosphere — deep navy backgrounds (`#0a0a1a`), purple glow effects, and blue accent highlights:

```css
:root {
    --bg-primary: #0a0a1a;
    --accent-purple: #7c3aed;
    --accent-blue: #3b82f6;
    --glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
}
```

The boot screen features a glitch-text animation on "THE SYSTEM" with a typing effect for boot messages — directly mimicking how the System appears to Jin-Woo in the manhwa. The registration screen uses card-style radio buttons and step-based progression to make data entry feel like character creation in an RPG.

---

## What I Learned Building This

1. **Game design is just UX with stakes.** The penalty system works because loss aversion is stronger than reward seeking. People will work harder to avoid losing XP than to gain it.

2. **Personalization beats templates.** A generic "do 50 push-ups" plan fails because it is either too easy or impossible. Starting from YOUR fitness test results means the difficulty is always in the productive zone.

3. **PWAs are criminally underrated.** Free hosting, offline support, installable, no app store bureaucracy. For personal projects and MVPs, there is zero reason to go native.

4. **The best framework is no framework.** Six JavaScript files, no build step, no dependency hell, no breaking changes from a library update. It just works, and it will work in 5 years without touching it.

---

## Try It Yourself

THE SYSTEM is live and open source:

- **Use it now:** [arise.akeno.in](https://arise.akeno.in) — open on your phone, add to home screen, begin
- **Star it on GitHub:** [github.com/avinashkoshal/solo-leveling-system](https://github.com/avinashkoshal/solo-leveling-system) — fork it, customize your own rank names, add your own exercises
- **Contribute:** PRs welcome for new dungeon types, boss raids, or exercise progressions

The System does not care about your excuses. It does not care if you are tired. It only cares if you complete the quest.

*Arise.*

---

*Avinash Koshal is an AWS Cloud Support Engineer and 7x AWS Certified builder who turns side projects into shipping products. Follow for more posts on cloud architecture, developer tools, and building things that solve your own problems.*

---
**Suggested Medium Tags:** Solo Leveling, Progressive Web App, Fitness App, JavaScript, Gamification
**Suggested cover image:** Dark navy background with purple glowing "THE SYSTEM" text in center (glitch effect), surrounded by floating RPG stat icons (STR, AGI, VIT) and a faint silhouette of a person leveling up. Style: minimalist anime UI meets terminal aesthetic.
**Estimated read time:** 9 minutes
