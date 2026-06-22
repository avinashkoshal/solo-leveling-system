/**
 * THE SYSTEM - Main Application
 * Handles state management, persistence, and app lifecycle
 */

let player = null;
let gameState = null;
let currentQuest = null;
let currentDungeon = null;
let currentBoss = null;
let badges = [];
let shadows = [];
let nutrition = null;
let activeTab = 'quest';
let todayEnergy = null;
let smartInsights = [];

const STORAGE_KEY = 'solo_leveling_system';

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

function saveState() {
    const data = { player, gameState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if (syncEnabled && currentUser) {
        CloudSync.saveToCloud(currentUser.uid, data);
    }
}

function initApp() {
    const saved = loadState();
    if (saved && saved.player && saved.gameState) {
        player = saved.player;
        gameState = saved.gameState;
        bootSequence(false);
    } else {
        bootSequence(true);
    }
}

function bootSequence(isNew) {
    const messages = [
        'Connecting to the System...',
        'Scanning dimensional gates...',
        'Verifying hunter credentials...',
        isNew ? 'New player detected...' : `Welcome back, ${player ? player.name : 'Hunter'}...`,
        'System online.',
    ];

    const loadingFill = document.getElementById('loading-fill');
    const bootMsg = document.getElementById('boot-msg');
    let i = 0;

    function showNext() {
        if (i < messages.length) {
            bootMsg.textContent = messages[i];
            loadingFill.style.width = ((i + 1) / messages.length * 100) + '%';
            i++;
            setTimeout(showNext, 600);
        } else {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.remove('active');
                if (isNew) {
                    document.getElementById('registration-screen').classList.add('active');
                } else {
                    startDashboard();
                }
            }, 500);
        }
    }

    showNext();
}

// Registration flow
function nextStep(current) {
    if (!validateStep(current)) return;

    const currentEl = document.querySelector(`.form-step[data-step="${current}"]`);
    const nextEl = document.querySelector(`.form-step[data-step="${current + 1}"]`);

    if (currentEl && nextEl) {
        currentEl.classList.remove('active');
        nextEl.classList.add('active');

        document.querySelector(`.step-dot[data-step="${current}"]`).classList.remove('active');
        document.querySelector(`.step-dot[data-step="${current}"]`).classList.add('done');
        document.querySelector(`.step-dot[data-step="${current + 1}"]`).classList.add('active');
    }

    if (current === 2) {
        const height = parseFloat(document.getElementById('reg-height').value);
        const gender = document.querySelector('input[name="gender"]:checked')?.value || 'M';
        const idealWeight = SystemEngine.calculateIdealWeight(height, gender);
        document.getElementById('weight-hint').textContent = `Recommended target: ${idealWeight}kg`;
        if (!document.getElementById('reg-target').value) {
            document.getElementById('reg-target').placeholder = idealWeight + 'kg';
        }
    }
}

function prevStep(current) {
    const currentEl = document.querySelector(`.form-step[data-step="${current}"]`);
    const prevEl = document.querySelector(`.form-step[data-step="${current - 1}"]`);

    if (currentEl && prevEl) {
        currentEl.classList.remove('active');
        prevEl.classList.add('active');

        document.querySelector(`.step-dot[data-step="${current}"]`).classList.remove('active');
        document.querySelector(`.step-dot[data-step="${current - 1}"]`).classList.remove('done');
        document.querySelector(`.step-dot[data-step="${current - 1}"]`).classList.add('active');
    }
}

function validateStep(step) {
    switch (step) {
        case 1: {
            const name = document.getElementById('reg-name').value.trim();
            const age = document.getElementById('reg-age').value;
            const gender = document.querySelector('input[name="gender"]:checked');
            if (!name || !age || !gender) {
                UI.showNotification('Complete all fields', '', 'xp');
                return false;
            }
            return true;
        }
        case 2: {
            const height = document.getElementById('reg-height').value;
            const weight = document.getElementById('reg-weight').value;
            if (!height || !weight) {
                UI.showNotification('Height and weight are required', '', 'xp');
                return false;
            }
            return true;
        }
        case 3: {
            const activity = document.querySelector('input[name="activity"]:checked');
            if (!activity) {
                UI.showNotification('Select your activity level', '', 'xp');
                return false;
            }
            return true;
        }
        case 4: {
            const equipment = document.querySelector('input[name="equipment"]:checked');
            if (!equipment) {
                UI.showNotification('Select your equipment', '', 'xp');
                return false;
            }
            return true;
        }
        case 5:
            return true;
        default:
            return true;
    }
}

function submitRegistration() {
    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const heightCm = parseFloat(document.getElementById('reg-height').value);
    const weight = parseFloat(document.getElementById('reg-weight').value);
    const activityLevel = parseInt(document.querySelector('input[name="activity"]:checked').value);
    const equipment = parseInt(document.querySelector('input[name="equipment"]:checked').value);
    const maxPushups = parseInt(document.getElementById('reg-pushups').value) || 0;
    const maxSquats = parseInt(document.getElementById('reg-squats').value) || 0;
    const maxPlank = parseInt(document.getElementById('reg-plank').value) || 0;
    const maxRope = parseInt(document.getElementById('reg-rope').value) || 0;

    let targetWeight = parseFloat(document.getElementById('reg-target').value);
    if (!targetWeight || targetWeight >= weight) {
        targetWeight = SystemEngine.calculateIdealWeight(heightCm, gender);
    }

    let months = parseInt(document.getElementById('reg-months').value);
    if (!months || months < 3) {
        const toLose = weight - targetWeight;
        months = Math.max(6, Math.min(12, Math.ceil(toLose / 2.5)));
    }

    player = {
        name,
        age,
        gender,
        heightCm,
        weight,
        targetWeight,
        activityLevel,
        equipment,
        maxPushups,
        maxSquats,
        maxPlank,
        maxRope,
        months,
        startDate: SystemEngine.getTodayString(),
    };

    const startRank = SystemEngine.determineStartingRank(maxPushups, maxSquats, maxPlank, maxRope, activityLevel);
    const startStats = SystemEngine.calculateStartingStats(player);

    gameState = {
        level: 1,
        xp: 0,
        totalXP: 0,
        rank: startRank,
        stats: startStats,
        currentWeight: weight,
        weightLog: [{ date: player.startDate, weight: weight }],
        questLog: [],
        todayQuest: null,
        dungeonsCleared: [],
        bossesCleared: [],
        earnedBadges: [],
        streak: 0,
    };

    saveState();

    document.getElementById('registration-screen').classList.remove('active');
    startDashboard();

    setTimeout(() => {
        UI.showNotification(
            `"Player ${name} — The System acknowledges you."`,
            `Rank: ${startRank} | Target: ${targetWeight}kg in ${months} months`,
            'level-up'
        );
    }, 500);
}

function startDashboard() {
    document.getElementById('dashboard-screen').classList.add('active');
    generateGameContent();
    updateTopBar();

    const today = SystemEngine.getTodayString();
    const alreadyCheckedIn = gameState.lastEnergyDate === today;

    if (!alreadyCheckedIn) {
        showEnergyCheckin();
    } else {
        todayEnergy = gameState.lastEnergyLevel || 3;
        applySmartQuest();
        showInsights();
        switchTab('quest');
    }
}

function generateGameContent() {
    const milestones = SystemEngine.generateRankMilestones(player.weight, player.targetWeight, player.months);
    const currentWeek = SystemEngine.getCurrentWeek(player.startDate);
    const currentRank = gameState.rank;

    currentQuest = QuestGenerator.generateDailyQuest(player, currentRank, gameState);

    const currentMilestone = milestones.find(m => m.rank === currentRank);
    currentDungeon = QuestGenerator.generateWeeklyDungeon(player, currentRank);
    currentBoss = QuestGenerator.generateBossRaid(player, currentRank, currentMilestone);
    badges = QuestGenerator.generateBadges(player);
    shadows = QuestGenerator.generateShadowArmy(player);
    nutrition = QuestGenerator.generateNutritionPlan(player);
}

function updateTopBar() {
    document.getElementById('dash-name').textContent = player.name;
    document.getElementById('dash-level').textContent = gameState.level;

    const rankBadge = document.getElementById('dash-rank');
    rankBadge.textContent = gameState.rank;
    rankBadge.className = `rank-badge rank-${gameState.rank.toLowerCase()}`;

    const xpPercent = (gameState.xp / SystemEngine.XP_PER_LEVEL) * 100;
    document.getElementById('dash-xp-fill').style.width = xpPercent + '%';
    document.getElementById('dash-xp').textContent = gameState.xp;
}

function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const content = document.getElementById('dashboard-content');
    const today = SystemEngine.getTodayString();

    let todayLog = gameState.questLog.find(q => q.date === today);

    switch (tab) {
        case 'quest':
            content.innerHTML = UI.renderQuestTab(currentQuest, todayLog, gameState);
            break;
        case 'stats':
            content.innerHTML = UI.renderStatsTab(gameState, player);
            break;
        case 'badges':
            content.innerHTML = UI.renderBadgesTab(badges, gameState.earnedBadges);
            break;
        case 'dungeon':
            content.innerHTML = UI.renderDungeonTab(currentDungeon, currentBoss, gameState);
            break;
        case 'profile':
            content.innerHTML = UI.renderProfileTab(player, gameState, shadows, nutrition);
            CloudSync.updateAuthUI();
            break;
    }
}

function toggleQuest(questId) {
    const today = SystemEngine.getTodayString();
    let todayLog = gameState.questLog.find(q => q.date === today);

    if (!todayLog) {
        todayLog = { date: today, completed: [], claimed: false, totalExercises: currentQuest.exercises.length };
        gameState.questLog.push(todayLog);
    }

    const idx = todayLog.completed.indexOf(questId);
    if (idx >= 0) {
        todayLog.completed.splice(idx, 1);
    } else {
        todayLog.completed.push(questId);

        const exercise = currentQuest.exercises.find(e => e.id === questId);
        if (exercise) {
            SystemEngine.updateStats(gameState, exercise.statType);
        }
    }

    saveState();
    checkBadges();
    switchTab('quest');
}

function claimDailyReward() {
    const today = SystemEngine.getTodayString();
    let todayLog = gameState.questLog.find(q => q.date === today);
    if (!todayLog || todayLog.claimed) return;

    todayLog.claimed = true;
    todayLog.completedAt = new Date().toISOString();
    const events = SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.dailyQuestFull, 'Daily Quest');

    saveState();
    updateTopBar();

    UI.showNotification(`+${SystemEngine.XP_REWARDS.dailyQuestFull} XP`, 'Daily Quest Complete!', 'xp');

    events.forEach(e => {
        if (e.type === 'level-up') {
            setTimeout(() => UI.showLevelUp(e.level), 800);
        }
    });

    checkStreak();
    checkBadges();
    switchTab('quest');
}

function claimPartialReward() {
    const today = SystemEngine.getTodayString();
    let todayLog = gameState.questLog.find(q => q.date === today);
    if (!todayLog || todayLog.claimed) return;

    todayLog.claimed = true;
    const events = SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.dailyQuestPartial, 'Partial Quest');

    saveState();
    updateTopBar();

    UI.showNotification(`+${SystemEngine.XP_REWARDS.dailyQuestPartial} XP`, 'Partial completion', 'xp');

    events.forEach(e => {
        if (e.type === 'level-up') {
            setTimeout(() => UI.showLevelUp(e.level), 800);
        }
    });

    checkBadges();
    switchTab('quest');
}

function clearDungeon() {
    const today = SystemEngine.getTodayString();
    if (gameState.dungeonsCleared.includes(today)) return;

    gameState.dungeonsCleared.push(today);
    const events = SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.weeklyDungeon, 'Weekly Dungeon');

    gameState.stats.VIT = Math.min(100, gameState.stats.VIT + 2);
    gameState.stats.STR = Math.min(100, gameState.stats.STR + 2);

    saveState();
    updateTopBar();

    UI.showNotification(`+${SystemEngine.XP_REWARDS.weeklyDungeon} XP`, `${currentDungeon.name} CLEARED!`, 'xp');

    events.forEach(e => {
        if (e.type === 'level-up') {
            setTimeout(() => UI.showLevelUp(e.level), 800);
        }
    });

    checkBadges();
    switchTab('dungeon');
}

function checkStreak() {
    const streak = SystemEngine.calculateStreak(gameState.questLog);
    gameState.streak = streak;

    if (streak === 7 && !gameState.earnedBadges.includes('streak_7')) {
        gameState.earnedBadges.push('streak_7');
        SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.streak7, '7-day streak');
        UI.showNotification('Badge Earned: Consistent!', '+30 XP Streak Bonus', 'level-up');
    }
    if (streak === 14 && !gameState.earnedBadges.includes('streak_14')) {
        gameState.earnedBadges.push('streak_14');
        UI.showNotification('Badge Earned: Iron Will!', 'Title: "The Persistent"', 'level-up');
    }
    if (streak === 30 && !gameState.earnedBadges.includes('streak_30')) {
        gameState.earnedBadges.push('streak_30');
        SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.streak30, '30-day streak');
        UI.showNotification('Badge Earned: Unstoppable!', '+200 XP', 'level-up');
    }
    if (streak === 100 && !gameState.earnedBadges.includes('streak_100')) {
        gameState.earnedBadges.push('streak_100');
        SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.streak100, '100-day streak');
        UI.showNotification('Badge Earned: Centurion!', 'Title: "The Relentless"', 'level-up');
    }

    saveState();
}

function checkBadges() {
    if (gameState.questLog.some(q => q.completed.length > 0) && !gameState.earnedBadges.includes('first_blood')) {
        gameState.earnedBadges.push('first_blood');
        UI.showNotification('Badge Earned: First Blood!', 'Your journey begins.', 'level-up');
    }

    if (gameState.dungeonsCleared.length >= 1 && !gameState.earnedBadges.includes('dungeon_1')) {
        gameState.earnedBadges.push('dungeon_1');
        UI.showNotification('Badge Earned: First Kill!', 'Dungeon conquered.', 'level-up');
    }

    if (gameState.dungeonsCleared.length >= 10 && !gameState.earnedBadges.includes('dungeon_10')) {
        gameState.earnedBadges.push('dungeon_10');
        UI.showNotification('Badge Earned: Dungeon Master!', 'Title: "Dungeon Conqueror"', 'level-up');
    }

    const weightLost = player.weight - gameState.currentWeight;
    if (weightLost >= 3 && !gameState.earnedBadges.includes('kg_3')) {
        gameState.earnedBadges.push('kg_3');
        UI.showNotification('Badge Earned: 3kg Club!', 'Bronze Scale', 'level-up');
    }
    if (weightLost >= 5 && !gameState.earnedBadges.includes('kg_5')) {
        gameState.earnedBadges.push('kg_5');
        UI.showNotification('Badge Earned: 5kg Club!', 'Silver Scale', 'level-up');
    }
    if (weightLost >= 10 && !gameState.earnedBadges.includes('kg_10')) {
        gameState.earnedBadges.push('kg_10');
        UI.showNotification('Badge Earned: 10kg Club!', 'Gold Scale!', 'level-up');
    }

    saveState();
}

// ===== SMART SYSTEM INTEGRATION =====

function showEnergyCheckin() {
    const rest = SmartSystem.shouldForceRest(gameState);
    if (rest.forceRest) {
        todayEnergy = 0;
        gameState.lastEnergyDate = SystemEngine.getTodayString();
        gameState.lastEnergyLevel = 0;
        saveState();
        showInsights();
        switchTab('quest');
        setTimeout(() => {
            UI.showNotification('Mandatory Rest Day', rest.message, 'level-up');
        }, 500);
        return;
    }

    document.getElementById('energy-checkin').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
}

function setEnergy(level) {
    todayEnergy = level;
    gameState.lastEnergyDate = SystemEngine.getTodayString();
    gameState.lastEnergyLevel = level;
    saveState();

    document.getElementById('energy-checkin').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';

    applySmartQuest();
    showInsights();
    switchTab('quest');

    const messages = {
        1: '"Even the weakest hunter can survive. Minimum quest activated."',
        2: '"Survival mode. Lighter quest — no shame in adapting."',
        3: '"Standard protocol. Execute."',
        4: '"Good energy detected. Push yourself today."',
        5: '"Maximum power. The System expects excellence."',
    };
    UI.showNotification(messages[level] || '', '', level >= 4 ? 'xp' : '');
}

function applySmartQuest() {
    if (!currentQuest) return;

    const diffMult = SmartSystem.getDifficultyMultiplier(gameState);

    const deload = SmartSystem.shouldDeload(gameState);
    if (deload.shouldDeload && !gameState.deloadAccepted) {
        currentQuest = QuestGenerator.generateDailyQuest(player, gameState.rank, gameState);
        currentQuest = SmartSystem.getDeloadQuest(currentQuest);
        return;
    }

    if (todayEnergy && todayEnergy < 3) {
        const result = SmartSystem.getEnergyQuest(todayEnergy, currentQuest);
        currentQuest = result.quest;
        return;
    }

    if (diffMult !== 1.0) {
        currentQuest.exercises = SmartSystem.applyDifficultyToQuest(currentQuest, diffMult);
    }
}

function showInsights() {
    smartInsights = SmartSystem.getDailyInsight(gameState, player);
    const bar = document.getElementById('insights-bar');

    if (smartInsights.length === 0) {
        bar.style.display = 'none';
        return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = smartInsights.map(insight => `
        <div class="insight-card ${insight.type}" onclick="handleInsight('${insight.type}')">
            <span class="insight-icon">${insight.icon}</span>
            <span class="insight-text">${insight.title}</span>
        </div>
    `).join('');
}

function handleInsight(type) {
    const insight = smartInsights.find(i => i.type === type);
    if (!insight) return;

    if (type === 'warning' && insight.data && insight.data.recommendations) {
        showPlateauModal(insight.data.recommendations);
    } else if (type === 'info' && insight.data && insight.data.shouldDeload) {
        acceptDeload();
    } else if (insight.message) {
        UI.showNotification(insight.title, insight.message, type);
    }
}

function showPlateauModal(recommendations) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal" style="max-width:400px;">
            <div class="modal-title">⚠️ Plateau Protocol</div>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.8rem;">Weight stalled for 2+ weeks. Try these:</p>
            <ul class="plateau-recs">
                ${recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
            <div class="modal-btns" style="margin-top:1rem;">
                <button class="modal-btn primary" onclick="this.closest('.modal-overlay').remove()">Got it</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function acceptDeload() {
    gameState.deloadAccepted = true;
    SmartSystem.markDeloadComplete(gameState);
    saveState();
    generateGameContent();
    applySmartQuest();
    switchTab('quest');
    UI.showNotification('Deload Week Active', 'Volume reduced 50% — recover and grow stronger', '');
}

function logPR(type, value) {
    const result = SmartSystem.checkAndUpdatePRs(gameState, type, value);
    if (result.newPR) {
        saveState();
        const events = SystemEngine.addXP(gameState, 25, 'New PR');
        UI.showNotification(`NEW PR: ${type}!`, `${result.oldValue} → ${result.newValue} (+25 XP)`, 'level-up');
        updateTopBar();
        events.forEach(e => {
            if (e.type === 'level-up') {
                setTimeout(() => UI.showLevelUp(e.level), 800);
            }
        });
    }
}

function showPRModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-title">Log Personal Record</div>
            <div class="form-group" style="margin-bottom:0.8rem;">
                <label style="font-size:0.75rem; color:var(--text-dim);">Type</label>
                <select id="pr-type" class="modal-input" style="margin-bottom:0;">
                    <option value="pushups">Push-ups (max in one go)</option>
                    <option value="squats">Squats (max in one go)</option>
                    <option value="plank">Plank (seconds)</option>
                    <option value="rope">Skip Rope (seconds)</option>
                    <option value="burpees">Burpees (max in one go)</option>
                    <option value="steps">Steps (single day)</option>
                </select>
            </div>
            <div class="form-group">
                <label style="font-size:0.75rem; color:var(--text-dim);">Value</label>
                <input class="modal-input" type="number" placeholder="Your record" id="pr-value" style="margin-bottom:0;">
            </div>
            <div class="modal-btns" style="margin-top:1rem;">
                <button class="modal-btn secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="modal-btn primary" onclick="submitPR()">Save PR</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#pr-value').focus();
}

function submitPR() {
    const type = document.querySelector('#pr-type').value;
    const value = parseInt(document.querySelector('#pr-value').value);
    if (!value || value <= 0) return;

    logPR(type, value);
    document.querySelector('.modal-overlay').remove();
    switchTab('stats');
}

function showWeightModal() {
    UI.showModal('Log Weight', 'number', 'Weight in kg', (val) => {
        const w = parseFloat(val);
        if (isNaN(w) || w < 30 || w > 200) return;

        const prevWeight = gameState.currentWeight;
        gameState.currentWeight = w;
        gameState.weightLog.push({ date: SystemEngine.getTodayString(), weight: w });

        if (prevWeight > w) {
            const kgLost = Math.floor(player.weight - w) - Math.floor(player.weight - prevWeight);
            if (kgLost > 0) {
                const events = SystemEngine.addXP(gameState, SystemEngine.XP_REWARDS.kgLost * kgLost, 'Weight loss');
                UI.showNotification(`+${SystemEngine.XP_REWARDS.kgLost * kgLost} XP`, `${(prevWeight - w).toFixed(1)}kg lost!`, 'xp');
                events.forEach(e => {
                    if (e.type === 'level-up') {
                        setTimeout(() => UI.showLevelUp(e.level), 800);
                    }
                });
            }
        }

        checkRankProgression();
        checkBadges();
        saveState();
        updateTopBar();
        switchTab('stats');
    });
}

function checkRankProgression() {
    const milestones = SystemEngine.generateRankMilestones(player.weight, player.targetWeight, player.months);
    const currentRankIdx = SystemEngine.getRankIndex(gameState.rank);

    if (currentRankIdx < 5) {
        const nextMilestone = milestones[currentRankIdx];
        if (gameState.currentWeight <= nextMilestone.targetWeight) {
            const newRank = SystemEngine.RANKS[currentRankIdx + 1];
            gameState.rank = newRank;
            generateGameContent();
            setTimeout(() => {
                UI.showLevelUp(gameState.level, newRank);
                UI.showNotification(
                    `RANK UP: ${newRank}-Rank!`,
                    `"${SystemEngine.RANK_NAMES[newRank]}"`,
                    'level-up'
                );
            }, 300);
        }
    }
}

function exportData() {
    const data = JSON.stringify({ player, gameState }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solo-leveling-${player.name}-${SystemEngine.getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showNotification('Data exported!', '', '');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.player && data.gameState) {
                    player = data.player;
                    gameState = data.gameState;
                    saveState();
                    generateGameContent();
                    applySmartQuest();
                    updateTopBar();
                    switchTab('profile');
                    UI.showNotification('Data imported!', 'Progress restored', 'xp');
                } else {
                    UI.showNotification('Invalid file', 'Must be a System export file', '');
                }
            } catch {
                UI.showNotification('Import failed', 'File is not valid JSON', '');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function showResetConfirm() {
    if (confirm('Are you sure? This will delete all progress. This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// Firebase Init
document.addEventListener('DOMContentLoaded', () => {
    CloudSync.init();
    initApp();
});
