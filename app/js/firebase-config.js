/**
 * THE SYSTEM - Firebase Integration
 * Guest mode (localStorage) + Google Sign-In for cloud sync
 */

const FirebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
};

let db = null;
let auth = null;
let currentUser = null;
let isGuest = true;
let syncEnabled = false;

const CloudSync = {
    async init() {
        if (FirebaseConfig.apiKey === "YOUR_API_KEY") {
            console.log('[System] Firebase not configured — running in offline mode');
            return;
        }

        try {
            const app = firebase.initializeApp(FirebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();

            db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

            auth.getRedirectResult().then((result) => {
                if (result && result.user) {
                    UI.showNotification(
                        `Signed in as ${result.user.displayName}`,
                        'Data will sync across devices',
                        'xp'
                    );
                }
            }).catch(() => {});

            auth.onAuthStateChanged((user) => {
                if (user) {
                    currentUser = user;
                    isGuest = false;
                    syncEnabled = true;
                    this.onSignIn(user);
                } else {
                    currentUser = null;
                    isGuest = true;
                    syncEnabled = false;
                }
                this.updateAuthUI();
                if (activeTab === 'profile' && typeof switchTab === 'function') {
                    switchTab('profile');
                }
            });
        } catch (e) {
            console.error('[System] Firebase init failed:', e);
        }
    },

    async signInWithGoogle() {
        if (!auth) {
            UI.showNotification('Firebase not configured', 'See setup instructions', '');
            return;
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                await auth.signInWithRedirect(provider);
            } else {
                const result = await auth.signInWithPopup(provider);
                UI.showNotification(
                    `Signed in as ${result.user.displayName}`,
                    'Data will sync across devices',
                    'xp'
                );
            }
        } catch (e) {
            if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
                const provider = new firebase.auth.GoogleAuthProvider();
                await auth.signInWithRedirect(provider);
            } else if (e.code !== 'auth/popup-closed-by-user') {
                UI.showNotification('Sign-in failed', e.message, '');
            }
        }
    },

    async signOut() {
        if (!auth) return;
        try {
            await auth.signOut();
            currentUser = null;
            isGuest = true;
            syncEnabled = false;
            this.updateAuthUI();
            UI.showNotification('Signed out', 'Data stays on this device (local only)', '');
        } catch (e) {
            console.error('[System] Sign out failed:', e);
        }
    },

    async onSignIn(user) {
        const cloudData = await this.loadFromCloud(user.uid);

        if (cloudData && cloudData.gameState) {
            const localData = loadState();
            if (localData && localData.gameState) {
                const cloudXP = cloudData.gameState.totalXP || 0;
                const localXP = localData.gameState.totalXP || 0;

                if (cloudXP > localXP) {
                    player = cloudData.player;
                    gameState = cloudData.gameState;
                    saveState();
                    generateGameContent();
                    applySmartQuest();
                    updateTopBar();
                    switchTab(activeTab);
                    UI.showNotification('Cloud data loaded', 'More progress found in cloud', 'xp');
                } else if (localXP > cloudXP) {
                    await this.saveToCloud(user.uid, { player, gameState });
                    UI.showNotification('Local data synced to cloud', '', '');
                }
            } else {
                player = cloudData.player;
                gameState = cloudData.gameState;
                saveState();
            }
        } else {
            if (player && gameState) {
                await this.saveToCloud(user.uid, { player, gameState });
            }
        }
    },

    async saveToCloud(uid, data) {
        if (!db || !uid) return;

        try {
            await db.collection('players').doc(uid).set({
                player: data.player,
                gameState: data.gameState,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                version: 2,
            }, { merge: true });
        } catch (e) {
            console.error('[System] Cloud save failed:', e);
        }
    },

    async loadFromCloud(uid) {
        if (!db || !uid) return null;

        try {
            const doc = await db.collection('players').doc(uid).get();
            if (doc.exists) {
                const data = doc.data();
                return { player: data.player, gameState: data.gameState };
            }
        } catch (e) {
            console.error('[System] Cloud load failed:', e);
        }
        return null;
    },

    async syncNow() {
        if (!syncEnabled || !currentUser) return;
        await this.saveToCloud(currentUser.uid, { player, gameState });
    },

    updateAuthUI() {
        const authSection = document.getElementById('auth-section');
        if (!authSection) return;

        const user = auth ? auth.currentUser : null;
        if (user) {
            currentUser = user;
            isGuest = false;
            syncEnabled = true;
        }

        if (!user) {
            authSection.innerHTML = `
                <div class="profile-section">
                    <div class="profile-section-title">Cloud Sync</div>
                    <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.8rem;">
                        <span style="font-size:1.5rem;">☁️</span>
                        <div>
                            <p style="font-size:0.85rem; color:var(--text-primary);">Guest Mode</p>
                            <p style="font-size:0.7rem; color:var(--text-dim);">Data stored locally only. Sign in to sync across devices.</p>
                        </div>
                    </div>
                    <button class="profile-action-btn" onclick="CloudSync.signInWithGoogle()" style="background:rgba(124,58,237,0.1); border-color:var(--accent-purple); color:var(--accent-purple); text-align:center;">
                        Sign in with Google
                    </button>
                </div>
            `;
        } else {
            const name = user.displayName || user.email;
            const photo = user.photoURL;
            authSection.innerHTML = `
                <div class="profile-section">
                    <div class="profile-section-title">Cloud Sync</div>
                    <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.8rem;">
                        ${photo ? `<img src="${photo}" style="width:32px; height:32px; border-radius:50%;">` : '<span style="font-size:1.5rem;">✅</span>'}
                        <div>
                            <p style="font-size:0.85rem; color:var(--text-primary);">${name}</p>
                            <p style="font-size:0.7rem; color:var(--accent-green);">Synced across devices</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <button class="profile-action-btn" onclick="CloudSync.syncNow()" style="flex:1; text-align:center;">Sync Now</button>
                        <button class="profile-action-btn" onclick="CloudSync.signOut()" style="flex:1; text-align:center; color:var(--text-dim);">Sign Out</button>
                    </div>
                </div>
            `;
        }
    },

    getStatus() {
        if (!auth || FirebaseConfig.apiKey === "YOUR_API_KEY") return 'offline';
        if (isGuest) return 'guest';
        return 'synced';
    },
};
