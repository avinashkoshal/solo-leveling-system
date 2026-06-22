/**
 * THE SYSTEM - Smart Intelligence Layer
 * Adaptive difficulty, plateau detection, energy management,
 * PR tracking, predictions, weekly review, deload, smart rest
 */

const SmartSystem = {

    // ===== AUTO-DIFFICULTY SCALING =====
    analyzePerformance(gameState, days = 7) {
        const recent = gameState.questLog.slice(-days);
        if (recent.length === 0) return { rate: 0, trend: 'neutral' };

        const completionRates = recent.map(q => {
            if (!q.totalExercises) return 0;
            return q.completed.length / q.totalExercises;
        });

        const avgRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

        let trend = 'neutral';
        if (completionRates.length >= 5) {
            const firstHalf = completionRates.slice(0, Math.floor(completionRates.length / 2));
            const secondHalf = completionRates.slice(Math.floor(completionRates.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (secondAvg - firstAvg > 0.1) trend = 'improving';
            else if (firstAvg - secondAvg > 0.1) trend = 'declining';
        }

        return { rate: avgRate, trend };
    },

    getDifficultyMultiplier(gameState) {
        const { rate, trend } = this.analyzePerformance(gameState, 7);
        let multiplier = gameState.difficultyMult || 1.0;

        if (rate >= 1.0 && gameState.questLog.slice(-7).length >= 7) {
            multiplier = Math.min(1.5, multiplier + 0.1);
        } else if (rate < 0.5 && gameState.questLog.slice(-3).length >= 3) {
            multiplier = Math.max(0.6, multiplier - 0.1);
        }

        gameState.difficultyMult = Math.round(multiplier * 100) / 100;
        return multiplier;
    },

    applyDifficultyToQuest(quest, multiplier) {
        return quest.exercises.map(ex => {
            const numMatch = ex.text.match(/^(\d+)\s/);
            if (numMatch) {
                const base = parseInt(numMatch[1]);
                const adjusted = Math.round(base * multiplier);
                return { ...ex, text: ex.text.replace(/^\d+/, adjusted), baseReps: base };
            }
            return ex;
        });
    },

    // ===== PLATEAU DETECTION =====
    detectPlateau(gameState) {
        const log = gameState.weightLog || [];
        if (log.length < 3) return { isPlateaued: false };

        const recent = log.slice(-14);
        if (recent.length < 4) return { isPlateaued: false };

        const twoWeeksAgo = recent[0].weight;
        const now = recent[recent.length - 1].weight;
        const change = Math.abs(twoWeeksAgo - now);

        const isPlateaued = change < 0.5 && recent.length >= 7;

        let recommendations = [];
        if (isPlateaued) {
            recommendations = [
                'Increase daily steps by 2,000 for next 2 weeks',
                'Add one extra 5-min cardio session on alternate days',
                'Re-track calories strictly for 1 week (portions may have crept up)',
                'Consider a diet break: eat at maintenance for 5-7 days, then resume deficit',
                'Ensure sleep is 7+ hours (cortisol from sleep deprivation stalls fat loss)',
            ];
        }

        return {
            isPlateaued,
            daysSinceChange: recent.length,
            change,
            recommendations,
        };
    },

    // ===== ENERGY CHECK-IN =====
    getEnergyQuest(energyLevel, baseQuest) {
        if (energyLevel >= 4) {
            return { mode: 'normal', quest: baseQuest, message: 'Full power. Destroy this quest.' };
        }

        if (energyLevel === 3) {
            return { mode: 'normal', quest: baseQuest, message: 'Steady. Standard quest today.' };
        }

        if (energyLevel === 2) {
            const lightQuest = {
                ...baseQuest,
                exercises: baseQuest.exercises.map(ex => {
                    const numMatch = ex.text.match(/^(\d+)\s/);
                    if (numMatch) {
                        const reduced = Math.round(parseInt(numMatch[1]) * 0.6);
                        return { ...ex, text: ex.text.replace(/^\d+/, reduced) };
                    }
                    return ex;
                }),
                timeEstimate: Math.round(baseQuest.timeEstimate * 0.6),
            };
            return { mode: 'light', quest: lightQuest, message: 'Survival mode activated. Lighter quest, no penalty.' };
        }

        // Energy 1: Minimum viable quest
        const minQuest = {
            exercises: [
                { text: '10 Squats (any form)', statType: 'strength', id: 'squats' },
                { text: '10 Push-ups (any form)', statType: 'strength', id: 'pushups' },
                { text: '30s Plank', statType: 'vitality', id: 'plank' },
                { text: 'Walk: 2,000 steps', statType: 'agility', id: 'steps' },
                { text: 'Water: 2L', statType: 'intelligence', id: 'water' },
                { text: 'Sleep: 7+ hours', statType: 'willpower', id: 'sleep' },
            ],
            timeEstimate: 10,
        };
        return { mode: 'minimum', quest: minQuest, message: 'Rest protocol. Minimum quest — just show up. No penalty.' };
    },

    // ===== SMART SCHEDULING =====
    analyzeMissPatterns(gameState) {
        const log = gameState.questLog || [];
        if (log.length < 14) return { suggestedRestDay: 0, patterns: null };

        const dayMisses = [0, 0, 0, 0, 0, 0, 0];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        log.forEach(entry => {
            const day = new Date(entry.date).getDay();
            dayCounts[day]++;
            if (!entry.completed || entry.completed.length === 0) {
                dayMisses[day]++;
            }
        });

        let worstDay = 0;
        let worstRate = 0;
        for (let i = 0; i < 7; i++) {
            if (dayCounts[i] > 0) {
                const missRate = dayMisses[i] / dayCounts[i];
                if (missRate > worstRate) {
                    worstRate = missRate;
                    worstDay = i;
                }
            }
        }

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return {
            suggestedRestDay: worstDay,
            suggestedRestDayName: dayNames[worstDay],
            missRate: worstRate,
            patterns: { dayMisses, dayCounts },
        };
    },

    getWorkoutTimePattern(gameState) {
        const log = gameState.questLog || [];
        const times = log.filter(q => q.completedAt).map(q => {
            const d = new Date(q.completedAt);
            return d.getHours();
        });

        if (times.length < 7) return null;

        const hourCounts = {};
        times.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });

        let peakHour = 0;
        let peakCount = 0;
        for (const [hour, count] of Object.entries(hourCounts)) {
            if (count > peakCount) {
                peakCount = count;
                peakHour = parseInt(hour);
            }
        }

        return { peakHour, formatted: `${peakHour}:00 - ${peakHour + 1}:00` };
    },

    // ===== PERSONAL RECORDS =====
    checkAndUpdatePRs(gameState, prType, value) {
        if (!gameState.personalRecords) gameState.personalRecords = {};

        const current = gameState.personalRecords[prType] || 0;
        if (value > current) {
            const oldPR = current;
            gameState.personalRecords[prType] = value;
            return { newPR: true, oldValue: oldPR, newValue: value, type: prType };
        }
        return { newPR: false };
    },

    getPRDisplay(gameState) {
        const prs = gameState.personalRecords || {};
        return {
            pushups: prs.pushups || 0,
            squats: prs.squats || 0,
            plank: prs.plank || 0,
            rope: prs.rope || 0,
            burpees: prs.burpees || 0,
            steps: prs.steps || 0,
        };
    },

    // ===== PREDICTED GOAL DATE =====
    predictGoalDate(gameState, player) {
        const log = gameState.weightLog || [];
        if (log.length < 3) return { predicted: null, message: 'Need more data (log weight for 3+ weeks)' };

        const fourWeeksAgo = log.slice(-28);
        if (fourWeeksAgo.length < 2) return { predicted: null, message: 'Need more weight entries' };

        const first = fourWeeksAgo[0];
        const last = fourWeeksAgo[fourWeeksAgo.length - 1];

        const daysBetween = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
        if (daysBetween < 7) return { predicted: null, message: 'Need at least 1 week of data' };

        const weightChange = first.weight - last.weight;
        const ratePerDay = weightChange / daysBetween;

        if (ratePerDay <= 0) {
            return { predicted: null, message: 'Weight trending up — focus on deficit', ratePerWeek: Math.round(ratePerDay * 7 * 100) / 100 };
        }

        const remaining = gameState.currentWeight - player.targetWeight;
        if (remaining <= 0) {
            return { predicted: 'ACHIEVED', message: 'Target reached!', ratePerWeek: Math.round(ratePerDay * 7 * 100) / 100 };
        }

        const daysToGoal = remaining / ratePerDay;
        const goalDate = new Date();
        goalDate.setDate(goalDate.getDate() + Math.ceil(daysToGoal));

        const ratePerWeek = Math.round(ratePerDay * 7 * 100) / 100;

        let pace = 'on-track';
        if (ratePerWeek > 1.0) pace = 'fast';
        if (ratePerWeek < 0.3) pace = 'slow';

        return {
            predicted: goalDate.toISOString().split('T')[0],
            daysRemaining: Math.ceil(daysToGoal),
            ratePerWeek,
            pace,
            message: `At ${ratePerWeek}kg/week, target by ${goalDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        };
    },

    // ===== WEEKLY REVIEW =====
    generateWeeklyReview(gameState, player) {
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const thisWeekLogs = (gameState.questLog || []).filter(q => q.date >= weekAgoStr);
        const completedDays = thisWeekLogs.filter(q => q.claimed).length;
        const totalExercisesCompleted = thisWeekLogs.reduce((sum, q) => sum + (q.completed ? q.completed.length : 0), 0);

        const weekWeights = (gameState.weightLog || []).filter(w => w.date >= weekAgoStr);
        let weightChange = 0;
        if (weekWeights.length >= 2) {
            weightChange = weekWeights[0].weight - weekWeights[weekWeights.length - 1].weight;
        }

        const completionRate = thisWeekLogs.length > 0
            ? thisWeekLogs.reduce((sum, q) => {
                if (!q.totalExercises) return sum;
                return sum + (q.completed.length / q.totalExercises);
            }, 0) / Math.max(thisWeekLogs.length, 1)
            : 0;

        let grade, gradeColor;
        if (completionRate >= 0.95 && completedDays >= 6) { grade = 'S'; gradeColor = '#ef4444'; }
        else if (completionRate >= 0.85 && completedDays >= 5) { grade = 'A'; gradeColor = '#f59e0b'; }
        else if (completionRate >= 0.70 && completedDays >= 4) { grade = 'B'; gradeColor = '#8b5cf6'; }
        else if (completionRate >= 0.50 && completedDays >= 3) { grade = 'C'; gradeColor = '#3b82f6'; }
        else { grade = 'D'; gradeColor = '#6b7280'; }

        const dungeonCleared = (gameState.dungeonsCleared || []).some(d => d >= weekAgoStr);

        const xpThisWeek = completedDays * SystemEngine.XP_REWARDS.dailyQuestFull +
            (dungeonCleared ? SystemEngine.XP_REWARDS.weeklyDungeon : 0);

        return {
            grade,
            gradeColor,
            completedDays,
            totalDays: 7,
            completionRate: Math.round(completionRate * 100),
            totalExercisesCompleted,
            weightChange: Math.round(weightChange * 10) / 10,
            dungeonCleared,
            xpEarned: xpThisWeek,
            streak: SystemEngine.calculateStreak(gameState.questLog),
            highlights: this.getWeekHighlights(gameState, weekAgoStr),
        };
    },

    getWeekHighlights(gameState, since) {
        const highlights = [];
        const streak = SystemEngine.calculateStreak(gameState.questLog);

        if (streak >= 7) highlights.push(`🔥 ${streak}-day streak maintained`);

        const recentBadges = (gameState.earnedBadges || []).slice(-3);
        if (recentBadges.length > 0) highlights.push(`🏆 Badges earned this period`);

        const log = gameState.weightLog || [];
        if (log.length >= 2) {
            const last = log[log.length - 1].weight;
            const prev = log[log.length - 2].weight;
            if (prev > last) highlights.push(`⬇️ Weight down ${(prev - last).toFixed(1)}kg`);
        }

        if (highlights.length === 0) highlights.push('Keep pushing — consistency is the key');

        return highlights;
    },

    // ===== DELOAD WEEK =====
    shouldDeload(gameState) {
        if (!gameState.lastDeloadWeek) gameState.lastDeloadWeek = 0;

        const currentWeek = SystemEngine.getCurrentWeek(gameState.questLog[0]?.date || new Date().toISOString());
        const weeksSinceDeload = currentWeek - gameState.lastDeloadWeek;

        if (weeksSinceDeload >= 4) {
            const { rate } = this.analyzePerformance(gameState, 7);
            if (rate < 0.7 || weeksSinceDeload >= 5) {
                return {
                    shouldDeload: true,
                    reason: weeksSinceDeload >= 5
                        ? 'Every 4-5 weeks, your body needs recovery to grow stronger'
                        : 'Performance declining — recovery week recommended',
                    weeksSince: weeksSinceDeload,
                };
            }
        }

        return { shouldDeload: false, weeksSince: weeksSinceDeload };
    },

    getDeloadQuest(baseQuest) {
        return {
            ...baseQuest,
            exercises: baseQuest.exercises.map(ex => {
                const numMatch = ex.text.match(/^(\d+)\s/);
                if (numMatch) {
                    const reduced = Math.round(parseInt(numMatch[1]) * 0.5);
                    return { ...ex, text: ex.text.replace(/^\d+/, reduced) };
                }
                return ex;
            }),
            timeEstimate: Math.round(baseQuest.timeEstimate * 0.5),
            isDeload: true,
        };
    },

    markDeloadComplete(gameState) {
        const currentWeek = SystemEngine.getCurrentWeek(gameState.questLog[0]?.date || new Date().toISOString());
        gameState.lastDeloadWeek = currentWeek;
    },

    // ===== REST DAY INTELLIGENCE =====
    shouldForceRest(gameState) {
        const log = gameState.questLog || [];
        if (log.length < 6) return { forceRest: false };

        const recent = log.slice(-6);
        const consecutiveWorkouts = recent.filter(q => q.completed && q.completed.length > 0).length;

        if (consecutiveWorkouts >= 6) {
            return {
                forceRest: true,
                message: '6 days straight — System mandates recovery. No penalty.',
                daysWorked: consecutiveWorkouts,
            };
        }

        return { forceRest: false };
    },

    // ===== SMART INSIGHTS =====
    getDailyInsight(gameState, player) {
        const insights = [];

        // Plateau check
        const plateau = this.detectPlateau(gameState);
        if (plateau.isPlateaued) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Plateau Detected',
                message: 'Weight stalled for 2+ weeks',
                action: 'View recommendations',
                data: plateau,
            });
        }

        // Deload check
        const deload = this.shouldDeload(gameState);
        if (deload.shouldDeload) {
            insights.push({
                type: 'info',
                icon: '🔄',
                title: 'Deload Week',
                message: deload.reason,
                action: 'Accept deload',
                data: deload,
            });
        }

        // Rest day check
        const rest = this.shouldForceRest(gameState);
        if (rest.forceRest) {
            insights.push({
                type: 'rest',
                icon: '😴',
                title: 'Mandatory Rest',
                message: rest.message,
                action: null,
                data: rest,
            });
        }

        // Streak milestone approaching
        const streak = SystemEngine.calculateStreak(gameState.questLog);
        const nextMilestone = [7, 14, 30, 50, 100].find(m => m > streak && m - streak <= 3);
        if (nextMilestone) {
            insights.push({
                type: 'motivation',
                icon: '🔥',
                title: `${nextMilestone - streak} days to ${nextMilestone}-day streak!`,
                message: 'Keep going — badge incoming',
                action: null,
            });
        }

        // Prediction
        const prediction = this.predictGoalDate(gameState, player);
        if (prediction.predicted && prediction.predicted !== 'ACHIEVED') {
            insights.push({
                type: 'info',
                icon: '📈',
                title: 'Goal Prediction',
                message: prediction.message,
                action: null,
                data: prediction,
            });
        }

        // Performance trend
        const perf = this.analyzePerformance(gameState, 7);
        if (perf.trend === 'improving' && perf.rate > 0.8) {
            insights.push({
                type: 'success',
                icon: '📊',
                title: 'Performance Rising',
                message: 'You\'re getting stronger. System may increase difficulty.',
                action: null,
            });
        }

        return insights;
    },
};
