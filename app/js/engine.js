/**
 * THE SYSTEM - Core Engine
 * Handles all game logic: XP, leveling, stats, rank progression
 */

const SystemEngine = {
    RANKS: ['E', 'D', 'C', 'B', 'A', 'S'],
    RANK_NAMES: {
        'E': 'Weakest Hunter',
        'D': 'The Awakened',
        'C': 'Proven Hunter',
        'B': 'Elite Hunter',
        'A': 'National Level',
        'S': 'Shadow Monarch',
    },
    XP_PER_LEVEL: 100,

    XP_REWARDS: {
        dailyQuestFull: 15,
        dailyQuestPartial: 8,
        weeklyDungeon: 50,
        bossRaidMin: 100,
        bossRaidGood: 150,
        bossRaidExcellent: 200,
        streak7: 30,
        streak30: 200,
        streak100: 500,
        kgLost: 50,
        newExercise: 25,
    },

    XP_PENALTIES: {
        missedDay: -10,
        missed2Days: -25,
        missed3Days: -50,
        binge: -15,
        skippedDungeon: -30,
    },

    calculateIdealWeight(heightCm, gender) {
        if (gender === 'M') {
            return Math.round(50 + 0.91 * (heightCm - 152.4));
        }
        return Math.round(45.5 + 0.91 * (heightCm - 152.4));
    },

    calculateBMR(weight, heightCm, age, gender) {
        if (gender === 'M') {
            return Math.round(10 * weight + 6.25 * heightCm - 5 * age + 5);
        }
        return Math.round(10 * weight + 6.25 * heightCm - 5 * age - 161);
    },

    calculateTDEE(bmr, activityLevel) {
        const multipliers = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725 };
        return Math.round(bmr * multipliers[activityLevel]);
    },

    determineStartingRank(maxPushups, maxSquats, maxPlank, maxRope, activityLevel) {
        let score = 0;
        score += Math.min(maxPushups / 10, 5);
        score += Math.min(maxSquats / 15, 5);
        score += Math.min(maxPlank / 30, 5);
        score += Math.min(maxRope / 30, 5);
        score += (activityLevel - 1) * 2;

        if (score < 5) return 'E';
        if (score < 10) return 'E';
        if (score < 16) return 'D';
        if (score < 22) return 'C';
        return 'B';
    },

    calculateStartingStats(player) {
        return {
            STR: Math.min(10, Math.max(1, Math.floor(player.maxPushups / 5))),
            AGI: Math.min(10, Math.max(1, Math.floor(player.maxRope / 15))),
            VIT: Math.min(10, Math.max(1, Math.floor(player.maxPlank / 10))),
            INT: 1,
            WIL: Math.max(1, player.activityLevel),
        };
    },

    generateRankMilestones(currentWeight, targetWeight, months) {
        const totalLoss = currentWeight - targetWeight;
        const weeks = months * 4;
        const weeksPerRank = weeks / 5;
        const milestones = [];

        for (let i = 0; i < 6; i++) {
            const rank = this.RANKS[i];
            let targetWt, weekStart, weekEnd;

            if (i < 5) {
                targetWt = Math.round((currentWeight - (totalLoss * (i + 1) / 5)) * 10) / 10;
                weekStart = Math.floor(i * weeksPerRank) + 1;
                weekEnd = Math.floor((i + 1) * weeksPerRank);
            } else {
                targetWt = targetWeight;
                weekStart = Math.floor(5 * weeksPerRank) + 1;
                weekEnd = weeks + 4;
            }

            milestones.push({ rank, targetWeight: targetWt, weekStart, weekEnd });
        }

        return milestones;
    },

    getCurrentWeek(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diff = now - start;
        return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
    },

    getCurrentRankFromWeek(milestones, week) {
        for (let i = milestones.length - 1; i >= 0; i--) {
            if (week >= milestones[i].weekStart) {
                return milestones[i].rank;
            }
        }
        return 'E';
    },

    getRankIndex(rank) {
        return this.RANKS.indexOf(rank);
    },

    addXP(gameState, amount, reason) {
        gameState.xp += amount;
        gameState.totalXP += Math.max(0, amount);

        const events = [];

        while (gameState.xp >= this.XP_PER_LEVEL) {
            gameState.xp -= this.XP_PER_LEVEL;
            gameState.level += 1;
            events.push({ type: 'level-up', level: gameState.level });
        }

        if (gameState.xp < 0) {
            gameState.xp = 0;
        }

        return events;
    },

    updateStats(gameState, questType) {
        const gain = 0.5;
        switch (questType) {
            case 'strength':
                gameState.stats.STR = Math.min(100, gameState.stats.STR + gain);
                break;
            case 'agility':
                gameState.stats.AGI = Math.min(100, gameState.stats.AGI + gain);
                break;
            case 'vitality':
                gameState.stats.VIT = Math.min(100, gameState.stats.VIT + gain);
                break;
            case 'intelligence':
                gameState.stats.INT = Math.min(100, gameState.stats.INT + gain);
                break;
            case 'willpower':
                gameState.stats.WIL = Math.min(100, gameState.stats.WIL + gain);
                break;
        }
    },

    calculateStreak(questLog) {
        if (!questLog || questLog.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sorted = [...questLog]
            .filter(q => q.completed)
            .map(q => {
                const d = new Date(q.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
            .sort((a, b) => b - a);

        if (sorted.length === 0) return 0;

        const unique = [...new Set(sorted)];
        const todayTime = today.getTime();
        const yesterdayTime = todayTime - 86400000;

        if (unique[0] !== todayTime && unique[0] !== yesterdayTime) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < unique.length; i++) {
            if (unique[i - 1] - unique[i] === 86400000) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    },

    getTodayString() {
        return new Date().toISOString().split('T')[0];
    },

    isSameDay(dateStr1, dateStr2) {
        return dateStr1 === dateStr2;
    },

    getDayOfWeek() {
        return new Date().getDay();
    },
};
