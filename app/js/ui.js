/**
 * THE SYSTEM - UI Renderer
 * Handles all DOM rendering and interactions
 */

const UI = {
    showNotification(text, subText, type = '') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.innerHTML = `
            <div class="notification-text">${text}</div>
            ${subText ? `<div class="notification-sub">${subText}</div>` : ''}
        `;
        document.body.appendChild(notif);

        requestAnimationFrame(() => notif.classList.add('show'));
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 400);
        }, 2500);
    },

    showLevelUp(level, rankUp) {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay active';
        overlay.innerHTML = `
            <div class="level-up-text">LEVEL UP!</div>
            <div class="level-up-detail">Level ${level}</div>
            ${rankUp ? `<div class="rank-up-text">RANK UP → ${rankUp}-RANK!</div>` : ''}
        `;
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 3000);
    },

    renderQuestTab(quest, todayLog, gameState) {
        const streak = SystemEngine.calculateStreak(gameState.questLog);
        const completedCount = todayLog ? todayLog.completed.length : 0;
        const totalCount = quest.exercises.length;
        const allDone = completedCount === totalCount;
        const progress = totalCount > 0 ? (completedCount / totalCount * 100) : 0;

        const energyLevel = gameState.lastEnergyLevel || 3;
        const rest = SmartSystem.shouldForceRest(gameState);
        const deload = SmartSystem.shouldDeload(gameState);
        const diffMult = gameState.difficultyMult || 1.0;

        let modeLabel = '';
        if (rest.forceRest) {
            modeLabel = '<span style="color:var(--accent-blue); font-size:0.7rem; background:rgba(59,130,246,0.1); padding:0.2rem 0.5rem; border-radius:8px;">REST DAY</span>';
        } else if (quest.isDeload) {
            modeLabel = '<span style="color:var(--accent-blue); font-size:0.7rem; background:rgba(59,130,246,0.1); padding:0.2rem 0.5rem; border-radius:8px;">DELOAD WEEK</span>';
        } else if (energyLevel <= 2) {
            modeLabel = '<span style="color:var(--accent-gold); font-size:0.7rem; background:rgba(245,158,11,0.1); padding:0.2rem 0.5rem; border-radius:8px;">SURVIVAL MODE</span>';
        } else if (diffMult > 1.05) {
            modeLabel = `<span style="color:var(--accent-green); font-size:0.7rem; background:rgba(16,185,129,0.1); padding:0.2rem 0.5rem; border-radius:8px;">SCALED UP ×${diffMult.toFixed(1)}</span>`;
        } else if (diffMult < 0.95) {
            modeLabel = `<span style="color:var(--accent-gold); font-size:0.7rem; background:rgba(245,158,11,0.1); padding:0.2rem 0.5rem; border-radius:8px;">SCALED DOWN ×${diffMult.toFixed(1)}</span>`;
        }

        let html = `
            <div class="quest-header">
                <div class="quest-title">DAILY QUEST ${modeLabel}</div>
                <div class="streak-display">
                    <span class="streak-count">${streak}</span>
                    <span class="streak-label">day streak</span>
                </div>
            </div>
        `;

        if (deload.shouldDeload && !gameState.deloadAccepted) {
            html += `
                <div class="deload-banner">
                    <div class="deload-icon">🔄</div>
                    <div class="deload-text">
                        <div class="deload-title">Deload Week Recommended</div>
                        <div class="deload-desc">${deload.reason}</div>
                    </div>
                    <button class="modal-btn primary" style="padding:0.4rem 0.8rem; font-size:0.7rem;" onclick="acceptDeload()">Accept</button>
                </div>
            `;
        }

        html += `<div class="quest-list">`;

        quest.exercises.forEach((ex, i) => {
            const isCompleted = todayLog && todayLog.completed.includes(ex.id);
            html += `
                <div class="quest-item ${isCompleted ? 'completed' : ''}" onclick="toggleQuest('${ex.id}')">
                    <div class="quest-checkbox">${isCompleted ? '' : ''}</div>
                    <div class="quest-text">${ex.text}</div>
                </div>
            `;
        });

        html += `</div>`;

        html += `
            <div class="quest-progress">
                <div class="quest-progress-title">Quest Progress</div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="quest-progress-text">${completedCount}/${totalCount} completed</div>
            </div>
        `;

        if (allDone && todayLog && !todayLog.claimed) {
            html += `<button class="quest-complete-btn visible" onclick="claimDailyReward()">CLAIM REWARD (+${SystemEngine.XP_REWARDS.dailyQuestFull} XP)</button>`;
        } else if (completedCount > totalCount / 2 && !allDone) {
            html += `<button class="quest-complete-btn visible" style="background: linear-gradient(135deg, var(--accent-gold), #d97706);" onclick="claimPartialReward()">CLAIM PARTIAL (+${SystemEngine.XP_REWARDS.dailyQuestPartial} XP)</button>`;
        }

        html += `
            <div style="margin-top: 1rem; text-align: center;">
                <small style="color: var(--text-dim);">~${quest.timeEstimate} min estimated</small>
            </div>
        `;

        return html;
    },

    renderStatsTab(gameState, player) {
        const stats = gameState.stats;
        const maxStat = 100;
        const weightLost = Math.round((player.weight - gameState.currentWeight) * 10) / 10;
        const totalToLose = player.weight - player.targetWeight;
        const weightProgress = totalToLose > 0 ? Math.min(100, (weightLost / totalToLose) * 100) : 0;

        let chartHtml = '';
        if (gameState.weightLog && gameState.weightLog.length > 0) {
            const recent = gameState.weightLog.slice(-14);
            const maxW = Math.max(...recent.map(w => w.weight));
            const minW = Math.min(...recent.map(w => w.weight), player.targetWeight);
            const range = maxW - minW || 1;

            recent.forEach(w => {
                const height = ((w.weight - minW) / range) * 100;
                chartHtml += `<div class="weight-bar" style="height: ${Math.max(4, height)}%" data-weight="${w.weight}"></div>`;
            });
        }

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.STR.toFixed(1)}</div>
                    <div class="stat-label">Strength</div>
                    <div class="stat-bar-container"><div class="stat-bar-fill str" style="width: ${(stats.STR / maxStat) * 100}%"></div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.AGI.toFixed(1)}</div>
                    <div class="stat-label">Agility</div>
                    <div class="stat-bar-container"><div class="stat-bar-fill agi" style="width: ${(stats.AGI / maxStat) * 100}%"></div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.VIT.toFixed(1)}</div>
                    <div class="stat-label">Vitality</div>
                    <div class="stat-bar-container"><div class="stat-bar-fill vit" style="width: ${(stats.VIT / maxStat) * 100}%"></div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.INT.toFixed(1)}</div>
                    <div class="stat-label">Intelligence</div>
                    <div class="stat-bar-container"><div class="stat-bar-fill int" style="width: ${(stats.INT / maxStat) * 100}%"></div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.WIL.toFixed(1)}</div>
                    <div class="stat-label">Willpower</div>
                    <div class="stat-bar-container"><div class="stat-bar-fill wil" style="width: ${(stats.WIL / maxStat) * 100}%"></div></div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Math.round(stats.STR + stats.AGI + stats.VIT + stats.INT + stats.WIL)}</div>
                    <div class="stat-label">Total Power</div>
                </div>
            </div>

            <div class="weight-section">
                <div class="weight-section-title">Weight Progress</div>
                <div class="weight-display">
                    <div class="weight-current">${gameState.currentWeight}<small>kg</small></div>
                    <div class="weight-target">Target: ${player.targetWeight}kg</div>
                </div>
                <div class="weight-progress-bar">
                    <div class="weight-progress-fill" style="width: ${weightProgress}%"></div>
                </div>
                <div class="weight-stats">
                    <span>Lost: ${weightLost}kg</span>
                    <span>Remaining: ${Math.max(0, Math.round((gameState.currentWeight - player.targetWeight) * 10) / 10)}kg</span>
                </div>
                ${chartHtml ? `<div class="weight-chart">${chartHtml}</div>` : ''}
                <button class="weight-log-btn" onclick="showWeightModal()">+ Log Weight</button>
            </div>

            ${this.renderPrediction(gameState, player)}
            ${this.renderPRs(gameState)}
            ${this.renderWeeklyReview(gameState, player)}
        `;
    },

    renderPrediction(gameState, player) {
        const pred = SmartSystem.predictGoalDate(gameState, player);
        if (!pred.predicted) {
            return `<div class="prediction-card">
                <div class="prediction-label">Goal Prediction</div>
                <div class="prediction-rate">${pred.message}</div>
            </div>`;
        }

        if (pred.predicted === 'ACHIEVED') {
            return `<div class="prediction-card" style="border-color: var(--accent-green);">
                <div class="prediction-label">TARGET</div>
                <div class="prediction-date" style="color: var(--accent-green);">ACHIEVED</div>
            </div>`;
        }

        return `<div class="prediction-card">
            <div class="prediction-label">Predicted Goal Date</div>
            <div class="prediction-date">${new Date(pred.predicted).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div class="prediction-rate">${pred.ratePerWeek}kg/week · ${pred.daysRemaining} days remaining</div>
            <span class="prediction-pace ${pred.pace}">${pred.pace === 'on-track' ? 'On Track' : pred.pace === 'fast' ? 'Ahead of Schedule' : 'Needs Attention'}</span>
        </div>`;
    },

    renderPRs(gameState) {
        const prs = SmartSystem.getPRDisplay(gameState);
        const hasPRs = Object.values(prs).some(v => v > 0);
        if (!hasPRs) return '';

        return `<div class="weight-section">
            <div class="weight-section-title">Personal Records</div>
            <div class="pr-grid">
                ${prs.pushups ? `<div class="pr-card"><div class="pr-value">${prs.pushups}</div><div class="pr-label">Push-ups</div></div>` : ''}
                ${prs.squats ? `<div class="pr-card"><div class="pr-value">${prs.squats}</div><div class="pr-label">Squats</div></div>` : ''}
                ${prs.plank ? `<div class="pr-card"><div class="pr-value">${prs.plank}s</div><div class="pr-label">Plank</div></div>` : ''}
                ${prs.rope ? `<div class="pr-card"><div class="pr-value">${prs.rope}s</div><div class="pr-label">Rope</div></div>` : ''}
                ${prs.burpees ? `<div class="pr-card"><div class="pr-value">${prs.burpees}</div><div class="pr-label">Burpees</div></div>` : ''}
                ${prs.steps ? `<div class="pr-card"><div class="pr-value">${(prs.steps/1000).toFixed(1)}k</div><div class="pr-label">Steps</div></div>` : ''}
            </div>
            <button class="weight-log-btn" onclick="showPRModal()" style="margin-top:0.6rem;">+ Log New PR</button>
        </div>`;
    },

    renderWeeklyReview(gameState, player) {
        const review = SmartSystem.generateWeeklyReview(gameState, player);

        return `<div class="weekly-review">
            <div class="review-header">
                <div class="review-title">This Week</div>
                <div class="review-grade" style="color:${review.gradeColor}">${review.grade}</div>
            </div>
            <div class="review-stats">
                <div class="review-stat">
                    <div class="review-stat-value">${review.completedDays}/${review.totalDays}</div>
                    <div class="review-stat-label">Days</div>
                </div>
                <div class="review-stat">
                    <div class="review-stat-value">${review.completionRate}%</div>
                    <div class="review-stat-label">Completion</div>
                </div>
                <div class="review-stat">
                    <div class="review-stat-value">${review.weightChange > 0 ? '-' : '+'}${Math.abs(review.weightChange)}kg</div>
                    <div class="review-stat-label">Weight</div>
                </div>
            </div>
            <div class="review-stats">
                <div class="review-stat">
                    <div class="review-stat-value">${review.xpEarned}</div>
                    <div class="review-stat-label">XP Earned</div>
                </div>
                <div class="review-stat">
                    <div class="review-stat-value">${review.streak}</div>
                    <div class="review-stat-label">Streak</div>
                </div>
                <div class="review-stat">
                    <div class="review-stat-value">${review.dungeonCleared ? '✓' : '✗'}</div>
                    <div class="review-stat-label">Dungeon</div>
                </div>
            </div>
            ${review.highlights.length > 0 ? `
                <div class="review-highlights">
                    ${review.highlights.map(h => `<div class="review-highlight">${h}</div>`).join('')}
                </div>
            ` : ''}
        </div>`;
    },

    renderBadgesTab(badges, earnedBadges) {
        const categories = {
            'streak': 'Streak Badges',
            'milestone': 'Milestone Badges',
            'weight': 'Weight Loss Badges',
            'strength': 'Strength Badges',
            'dungeon': 'Dungeon Badges',
            'boss': 'Boss Badges',
        };

        let html = '';
        for (const [cat, title] of Object.entries(categories)) {
            const catBadges = badges.filter(b => b.category === cat);
            if (catBadges.length === 0) continue;

            html += `<div class="badges-section"><div class="badges-section-title">${title}</div><div class="badges-grid">`;
            catBadges.forEach(b => {
                const earned = earnedBadges.includes(b.id);
                html += `
                    <div class="badge-card ${earned ? 'earned' : ''}">
                        <div class="badge-icon">${b.icon}</div>
                        <div class="badge-name">${b.name}</div>
                        <div class="badge-req">${b.req}</div>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        return html;
    },

    renderDungeonTab(dungeon, boss, gameState) {
        const dayOfWeek = SystemEngine.getDayOfWeek();
        const isSaturday = dayOfWeek === 6;
        const today = SystemEngine.getTodayString();
        const dungeonCleared = gameState.dungeonsCleared && gameState.dungeonsCleared.includes(today);

        let dungeonStatus = 'locked';
        if (dungeonCleared) {
            dungeonStatus = 'cleared';
        } else if (isSaturday) {
            dungeonStatus = 'available';
        }

        const statusText = {
            'locked': 'Available Saturday',
            'available': 'ENTER DUNGEON',
            'cleared': 'CLEARED',
        };

        let html = `
            <div class="dungeon-card">
                <div class="dungeon-rank">${dungeon.rank}-Rank Dungeon</div>
                <div class="dungeon-name">${dungeon.name}</div>
                <div class="dungeon-desc">${dungeon.desc}</div>
                <div class="dungeon-structure">${dungeon.structure}</div>
                <div class="dungeon-duration">Duration: ~${dungeon.duration} min</div>
                <div class="dungeon-status ${dungeonStatus}">${statusText[dungeonStatus]}</div>
                ${dungeonStatus === 'available' ? `<button class="quest-complete-btn visible" style="margin-top:0.8rem;" onclick="clearDungeon()">CLEAR DUNGEON (+${SystemEngine.XP_REWARDS.weeklyDungeon} XP)</button>` : ''}
            </div>
        `;

        if (boss) {
            html += `
                <div class="boss-card">
                    <div class="boss-title">BOSS RAID — Month ${boss.month}</div>
                    <div class="boss-name">${boss.name}</div>
                    <div class="boss-tests">
            `;
            boss.tests.forEach(test => {
                html += `
                    <div class="boss-test-row">
                        <span class="boss-test-name">${test.name}</span>
                        <div class="boss-test-values">
                            <span class="boss-min">${test.minimum}</span>
                            <span class="boss-good">${test.good}</span>
                            <span class="boss-exc">${test.excellent}</span>
                        </div>
                    </div>
                `;
            });
            if (boss.weightTarget) {
                html += `
                    <div class="boss-test-row">
                        <span class="boss-test-name">Weight</span>
                        <div class="boss-test-values">
                            <span class="boss-min">≤${boss.weightTarget.minimum}kg</span>
                            <span class="boss-good">≤${boss.weightTarget.good}kg</span>
                            <span class="boss-exc">≤${boss.weightTarget.excellent}kg</span>
                        </div>
                    </div>
                `;
            }
            html += `</div></div>`;
        }

        return html;
    },

    renderProfileTab(player, gameState, shadows, nutrition) {
        const streak = SystemEngine.calculateStreak(gameState.questLog);
        const currentWeek = SystemEngine.getCurrentWeek(player.startDate);
        const rank = gameState.rank;
        const rankName = SystemEngine.RANK_NAMES[rank] || 'Hunter';

        const currentNutritionPhase = nutrition.phases.find(p => {
            const phaseRankIdx = SystemEngine.getRankIndex(p.rank.replace('+', ''));
            const currentRankIdx = SystemEngine.getRankIndex(rank);
            return phaseRankIdx <= currentRankIdx;
        }) || nutrition.phases[0];

        let shadowHtml = '';
        shadows.forEach(s => {
            const unlocked = currentWeek >= s.week;
            shadowHtml += `
                <div class="shadow-item ${unlocked ? '' : 'locked'}">
                    <span class="shadow-name">${s.name}</span>
                    <span class="shadow-habit">${s.habit}</span>
                </div>
            `;
        });

        return `
            <div class="profile-header">
                <div class="profile-rank-large">${rank}</div>
                <div class="profile-title">"${rankName}"</div>
                <div class="profile-name">${player.name}</div>
                <div class="profile-stats-row">
                    <div class="profile-stat">
                        <div class="profile-stat-value">${gameState.level}</div>
                        <div class="profile-stat-label">Level</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${streak}</div>
                        <div class="profile-stat-label">Streak</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${gameState.totalXP}</div>
                        <div class="profile-stat-label">Total XP</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">W${currentWeek}</div>
                        <div class="profile-stat-label">Week</div>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="profile-section-title">Nutrition Phase: ${currentNutritionPhase.name}</div>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.5rem;">Calories: ${currentNutritionPhase.cal}</p>
                ${currentNutritionPhase.rules.map(r => `<p style="font-size:0.8rem; color:var(--text-dim); padding:0.2rem 0;">• ${r}</p>`).join('')}
                <p style="font-size:0.8rem; color:var(--accent-cyan); margin-top:0.5rem;">Protein target: ${nutrition.protein}g/day | TDEE: ${nutrition.tdee} cal</p>
            </div>

            <div class="profile-section">
                <div class="profile-section-title">Shadow Army (${shadows.filter(s => currentWeek >= s.week).length}/${shadows.length} summoned)</div>
                ${shadowHtml}
            </div>

            <div id="auth-section"></div>

            <div class="profile-actions">
                <button class="profile-action-btn" onclick="exportData()">Export Data (JSON)</button>
                <button class="profile-action-btn" onclick="importData()">Import Data</button>
                <button class="profile-action-btn danger" onclick="showResetConfirm()">Reset System</button>
            </div>
        `;
    },

    showModal(title, inputType, placeholder, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-title">${title}</div>
                <input class="modal-input" type="${inputType}" placeholder="${placeholder}" id="modal-input-val">
                <div class="modal-btns">
                    <button class="modal-btn secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="modal-btn primary" id="modal-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#modal-input-val');
        input.focus();

        overlay.querySelector('#modal-confirm').onclick = () => {
            const val = input.value;
            if (val) onConfirm(val);
            overlay.remove();
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const val = input.value;
                if (val) onConfirm(val);
                overlay.remove();
            }
        };
    },
};
