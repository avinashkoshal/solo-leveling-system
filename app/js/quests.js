/**
 * THE SYSTEM - Quest Generator
 * Dynamically generates quests based on player profile and rank
 */

const QuestGenerator = {
    PUSHUP_TYPES: [
        'Wall Push-ups',
        'Knee Push-ups',
        'Full Push-ups',
        'Full Push-ups (wide + regular)',
        'Push-ups (wide, diamond, regular)',
        'Advanced Push-ups (archer, decline)',
    ],

    generateDailyQuest(player, rank, gameState) {
        const rankIndex = SystemEngine.getRankIndex(rank);
        const mult = 1 + (rankIndex * 0.5);

        const pushupBase = Math.max(5, Math.floor(player.maxPushups / 2));
        const squatBase = Math.max(10, Math.floor(player.maxSquats / 2));
        const plankBase = Math.max(15, Math.floor(player.maxPlank / 2));
        const ropeBase = Math.max(30, Math.floor(player.maxRope / 2));
        const stepsBase = player.activityLevel <= 2 ? 3000 : 5000;

        const hasRope = player.equipment >= 2;
        const hasBands = player.equipment === 3 || player.equipment === 5;
        const hasBar = player.equipment === 4 || player.equipment === 5;

        const pushups = Math.round(pushupBase * mult);
        const squats = Math.round(squatBase * mult);
        const plankSec = Math.round(plankBase * mult);
        const ropeSec = hasRope ? Math.round(ropeBase * mult) : 0;
        const steps = stepsBase + (rankIndex * 1500);
        const water = Math.round((2.0 + rankIndex * 0.3) * 10) / 10;

        const exercises = [];

        const pushupType = this.PUSHUP_TYPES[Math.min(rankIndex, this.PUSHUP_TYPES.length - 1)];
        exercises.push({
            text: `${pushups} ${pushupType}`,
            statType: 'strength',
            id: 'pushups',
        });

        const squatVariant = rankIndex < 2 ? 'Bodyweight Squats' : 'Squats (regular + sumo)';
        exercises.push({
            text: `${squats} ${squatVariant}`,
            statType: 'strength',
            id: 'squats',
        });

        if (rankIndex >= 1) {
            const lunges = Math.round(squats * 0.4);
            exercises.push({
                text: `${lunges} Lunges (each leg)`,
                statType: 'strength',
                id: 'lunges',
            });
        }

        if (rankIndex >= 2) {
            exercises.push({
                text: `${Math.round(squats * 0.3)} Glute Bridges`,
                statType: 'strength',
                id: 'bridges',
            });
        }

        if (rankIndex >= 3) {
            const burpees = Math.max(5, Math.round(pushups * 0.3));
            const mod = rankIndex === 3 ? ' (modified)' : '';
            exercises.push({
                text: `${burpees} Burpees${mod}`,
                statType: 'agility',
                id: 'burpees',
            });
        }

        if (rankIndex >= 3 && hasBar) {
            exercises.push({
                text: `${Math.max(3, rankIndex * 2)} Pull-up attempts`,
                statType: 'strength',
                id: 'pullups',
            });
        }

        if (rankIndex >= 2 && hasBands) {
            exercises.push({
                text: `${Math.round(pushups * 0.4)} Band Rows`,
                statType: 'strength',
                id: 'bandrows',
            });
        }

        if (hasRope && ropeSec > 0) {
            const ropeStr = this.formatDuration(ropeSec);
            const interval = rankIndex < 2 ? ' (breaks OK)' : ` (${30 + rankIndex * 10}s on / 15s rest)`;
            exercises.push({
                text: `Skip Rope: ${ropeStr}${interval}`,
                statType: 'agility',
                id: 'rope',
            });
        }

        exercises.push({
            text: `Plank: ${this.formatDuration(plankSec)}`,
            statType: 'vitality',
            id: 'plank',
        });

        if (rankIndex >= 2) {
            const sidePlank = Math.max(15, Math.round(plankSec / 3));
            exercises.push({
                text: `Side Plank: ${this.formatDuration(sidePlank)} each side`,
                statType: 'vitality',
                id: 'sideplank',
            });
        }

        if (rankIndex >= 3) {
            exercises.push({
                text: `Mountain Climbers: ${Math.max(10, rankIndex * 5)} each side`,
                statType: 'agility',
                id: 'mountainclimbers',
            });
        }

        exercises.push({
            text: `Walk: ${steps.toLocaleString()} steps`,
            statType: 'agility',
            id: 'steps',
        });

        exercises.push({
            text: `Water: ${water}L`,
            statType: 'intelligence',
            id: 'water',
        });

        exercises.push({
            text: 'Sleep: 7+ hours',
            statType: 'willpower',
            id: 'sleep',
        });

        if (rankIndex >= 1) {
            exercises.push({
                text: 'Track all meals',
                statType: 'intelligence',
                id: 'nutrition',
            });
        }

        return {
            exercises,
            timeEstimate: 20 + (rankIndex * 10),
        };
    },

    generateWeeklyDungeon(player, rank) {
        const rankIndex = SystemEngine.getRankIndex(rank);
        const hasRope = player.equipment >= 2;
        const pushupBase = Math.max(5, Math.floor(player.maxPushups / 2));
        const squatBase = Math.max(10, Math.floor(player.maxSquats / 2));
        const mult = 1 + (rankIndex * 0.4);
        const pushups = Math.round(pushupBase * mult);
        const squats = Math.round(squatBase * mult);
        const duration = 15 + (rankIndex * 8);

        const dungeonData = [
            {
                name: 'Goblin Cave',
                desc: 'Survive the goblin horde',
                structure: `${Math.max(3, 5)} rounds:\n` +
                    `  ${Math.max(5, Math.round(pushups / 2))} push-ups (any form)\n` +
                    `  ${Math.max(8, Math.round(squats / 2))} squats\n` +
                    `  ${hasRope ? '30s skipping' : '30s high knees'}\n` +
                    `  30s rest between rounds\n` +
                    `Target: Under ${duration} minutes`,
            },
            {
                name: 'Demon Castle - Floor 1',
                desc: 'Tabata of the damned',
                structure: `Tabata: 20s work / 10s rest, 8 rounds\n` +
                    `Exercises: Squats → Push-ups → ${hasRope ? 'Skipping' : 'High Knees'} → Plank\n` +
                    `3 sets total, 2 min rest between\n` +
                    `Target: Complete all 3 sets`,
            },
            {
                name: 'Red Gate',
                desc: 'No escape until cleared',
                structure: `AMRAP in ${duration} minutes:\n` +
                    `  ${pushups} push-ups\n` +
                    `  ${squats} squats\n` +
                    `  ${Math.round(squats * 0.5)} lunges\n` +
                    `  ${hasRope ? '1 min skip rope' : '1 min high knees'}\n` +
                    `  30s plank\n` +
                    `Goal: Beat your previous round count`,
            },
            {
                name: 'Demon Castle - Floor 100',
                desc: 'Endurance of a demon',
                structure: `${duration}-min circuit (rest when needed):\n` +
                    `  ${pushups} push-ups\n` +
                    `  ${squats} squats\n` +
                    `  ${Math.round(squats * 0.4)} lunges\n` +
                    `  ${Math.max(5, Math.round(pushups / 3))} burpees\n` +
                    `  ${hasRope ? '2 min skip rope' : '2 min jog in place'}\n` +
                    `  1 min plank\n` +
                    `Repeat until time is up`,
            },
            {
                name: 'Double Dungeon',
                desc: 'Where it all began',
                structure: `${duration}-min endurance:\n` +
                    `  ${hasRope ? '5 min skip rope' : '5 min jog in place'}\n` +
                    `  ${pushups} push-ups\n` +
                    `  ${squats} squats\n` +
                    `  ${Math.round(squats * 0.6)} lunges\n` +
                    `  ${Math.max(10, Math.round(pushups / 2))} burpees\n` +
                    `  1.5 min plank\n` +
                    `Repeat 3-4 times`,
            },
            {
                name: "Monarch's Throne",
                desc: 'Final proving ground',
                structure: `${duration}-min ultimate test:\n` +
                    `  ${pushups} push-ups (varied grips)\n` +
                    `  ${squats} squats (varied stances)\n` +
                    `  ${Math.round(squats * 0.5)} lunges\n` +
                    `  ${pushups} burpees\n` +
                    `  ${hasRope ? '8 min skip rope' : '8 min high intensity'}\n` +
                    `  2 min plank\n` +
                    `As many rounds as possible`,
            },
        ];

        const dungeon = dungeonData[rankIndex] || dungeonData[0];
        return { ...dungeon, duration, rank };
    },

    generateBossRaid(player, rank, milestone) {
        const rankIndex = SystemEngine.getRankIndex(rank);
        const mult = 1.5 + (rankIndex * 0.8);
        const hasRope = player.equipment >= 2;

        const pushupTarget = Math.round(player.maxPushups * mult);
        const squatTarget = Math.round(player.maxSquats * mult);
        const plankTarget = Math.round(player.maxPlank * mult);
        const ropeTarget = hasRope ? Math.round(player.maxRope * mult) : 0;

        const bossNames = [
            'King of the Swamp',
            'Cerberus',
            'Ice Elf Monarch',
            'Baran, Demon Monarch',
            'Frost Monarch',
            'Antares, Monarch of Destruction',
        ];

        const tests = [
            {
                name: 'Max Push-ups',
                minimum: Math.round(pushupTarget * 0.6),
                good: Math.round(pushupTarget * 0.8),
                excellent: pushupTarget,
            },
            {
                name: `Max Squats${rankIndex >= 2 ? ' (2 min)' : ''}`,
                minimum: Math.round(squatTarget * 0.6),
                good: Math.round(squatTarget * 0.8),
                excellent: squatTarget,
            },
            {
                name: 'Plank Hold',
                minimum: this.formatDuration(Math.round(plankTarget * 0.6)),
                good: this.formatDuration(Math.round(plankTarget * 0.8)),
                excellent: this.formatDuration(plankTarget),
            },
        ];

        if (hasRope && ropeTarget > 0) {
            tests.push({
                name: 'Skip Rope (continuous)',
                minimum: this.formatDuration(Math.round(ropeTarget * 0.6)),
                good: this.formatDuration(Math.round(ropeTarget * 0.8)),
                excellent: this.formatDuration(ropeTarget),
            });
        }

        if (rankIndex >= 2) {
            const burpeeTarget = Math.max(10, Math.round(pushupTarget * 0.4));
            tests.push({
                name: `Burpees (${rankIndex < 4 ? '2' : '3'} min)`,
                minimum: Math.round(burpeeTarget * 0.6),
                good: Math.round(burpeeTarget * 0.8),
                excellent: burpeeTarget,
            });
        }

        return {
            name: bossNames[rankIndex] || 'Unknown Boss',
            rank,
            month: rankIndex + 1,
            tests,
            weightTarget: milestone ? {
                minimum: milestone.targetWeight + 1.5,
                good: milestone.targetWeight + 0.5,
                excellent: milestone.targetWeight,
            } : null,
        };
    },

    generateShadowArmy(player) {
        const shadows = [
            { name: 'Igris', role: 'Knight', habit: 'Morning hydration (500ml on waking)', unlock: 'Day 1', week: 0 },
            { name: 'Iron', role: 'Tank', habit: 'Take stairs always', unlock: 'Week 2', week: 2 },
            { name: 'Tank', role: 'Mage', habit: 'No phone first 30 min', unlock: 'Week 3', week: 3 },
            { name: 'Tusk', role: 'Beast', habit: 'Replace 1 snack with protein', unlock: 'Week 4', week: 4 },
            { name: 'Beru', role: 'Marshal', habit: '10 min walk after meals', unlock: 'Week 6', week: 6 },
            { name: 'Bellion', role: 'Grand Marshal', habit: 'Sleep by 11 PM', unlock: 'Week 8', week: 8 },
            { name: 'Greed', role: 'Commander', habit: 'Meal prep Sundays', unlock: 'Week 10', week: 10 },
            { name: 'Kaisel', role: 'Dragon', habit: '5 min morning stretching', unlock: 'Week 12', week: 12 },
            { name: 'Marshal', role: 'Shadow', habit: player.age < 35 ? 'Cold shower (30s)' : 'End shower with cold water (15s)', unlock: 'Week 14', week: 14 },
            { name: 'Architect', role: 'System', habit: 'Weekly review (15 min Sunday)', unlock: 'Week 16', week: 16 },
        ];
        return shadows;
    },

    generateBadges(player) {
        const totalLoss = player.weight - player.targetWeight;

        const badges = [
            { id: 'first_blood', name: 'First Blood', icon: '🗡️', req: 'Complete first daily quest', category: 'milestone' },
            { id: 'streak_7', name: 'Consistent', icon: '🔥', req: '7-day streak', category: 'streak' },
            { id: 'streak_14', name: 'Iron Will', icon: '⚡', req: '14-day streak', category: 'streak' },
            { id: 'streak_30', name: 'Unstoppable', icon: '💎', req: '30-day streak', category: 'streak' },
            { id: 'streak_100', name: 'Centurion', icon: '👑', req: '100-day streak', category: 'streak' },
            { id: 'dungeon_1', name: 'First Kill', icon: '🚪', req: 'Clear first dungeon', category: 'dungeon' },
            { id: 'dungeon_10', name: 'Dungeon Master', icon: '🏰', req: 'Clear 10 dungeons', category: 'dungeon' },
            { id: 'boss_1', name: 'Giant Slayer', icon: '⚔️', req: 'Clear first boss raid', category: 'boss' },
            { id: 'boss_all', name: 'Monarch Slayer', icon: '🐉', req: 'Clear all boss raids', category: 'boss' },
            { id: 'kg_3', name: '3kg Club', icon: '🥉', req: 'Lose 3kg', category: 'weight' },
            { id: 'kg_5', name: '5kg Club', icon: '🥈', req: 'Lose 5kg', category: 'weight' },
            { id: 'kg_10', name: '10kg Club', icon: '🥇', req: 'Lose 10kg', category: 'weight' },
            { id: 'pushup_25', name: 'Push-up Initiate', icon: '💪', req: '25 consecutive push-ups', category: 'strength' },
            { id: 'pushup_50', name: 'Push-up King', icon: '🦾', req: '50 consecutive push-ups', category: 'strength' },
            { id: 'plank_2m', name: 'Plank Warrior', icon: '🧱', req: '2 min plank hold', category: 'strength' },
            { id: 'plank_4m', name: 'Plank God', icon: '🗿', req: '4 min plank hold', category: 'strength' },
        ];

        if (totalLoss >= 15) {
            badges.push({ id: 'kg_15', name: `${Math.round(totalLoss)}kg Club`, icon: '💎', req: `Reach ${player.targetWeight}kg`, category: 'weight' });
        }

        if (player.equipment >= 2) {
            badges.push({ id: 'rope_10m', name: 'Skip Lord', icon: '🪢', req: '10 min continuous skipping', category: 'strength' });
        }

        return badges;
    },

    generateNutritionPlan(player) {
        const bmr = SystemEngine.calculateBMR(player.weight, player.heightCm, player.age, player.gender);
        const tdee = SystemEngine.calculateTDEE(bmr, player.activityLevel);
        const deficit = tdee - 500;
        const proteinPerKg = player.gender === 'M' ? 1.6 : 1.4;
        const proteinTarget = Math.round(player.targetWeight * proteinPerKg);

        return {
            bmr,
            tdee,
            deficit,
            protein: proteinTarget,
            phases: [
                {
                    rank: 'E',
                    name: 'Awareness',
                    cal: 'No counting — just log everything',
                    rules: ['Cut sugary drinks', 'Fried food max 2x/week', 'Add protein to every meal'],
                },
                {
                    rank: 'D',
                    name: 'Structure',
                    cal: `~${deficit + 200} cal/day`,
                    rules: ['Start calorie tracking', 'No eating after 9 PM', 'Reduce carb portions 25%'],
                },
                {
                    rank: 'C',
                    name: 'Optimization',
                    cal: `${deficit}-${deficit + 150} cal/day`,
                    rules: ['Strict tracking', 'Meal prep ahead', '1 cheat meal/week (not day)'],
                },
                {
                    rank: 'B+',
                    name: 'Mastery',
                    cal: `${deficit - 200}-${deficit} cal/day`,
                    rules: ['Intuitive eating developing', '1 refeed day/week', 'Protein timing around workouts'],
                },
            ],
        };
    },

    formatDuration(seconds) {
        if (seconds >= 60) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
        }
        return `${seconds}s`;
    },
};
