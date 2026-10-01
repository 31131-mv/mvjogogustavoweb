/**
 * RE:TIME - Storage System
 * Manages save data with localStorage, fallbacks, and progress resetting.
 */
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'RETIME_SAVE_DATA_V1';
        this.data = this.getDefaults();
        this.load();
    }

    getDefaults() {
        return {
            unlockedLevels: [1],
            stars: {},      // { 1: 3, 2: 2, ... }
            fragments: {},  // { 1: 3, 2: 1, ... }
            bestTimes: {},  // { 1: 18.4, ... }
            settings: {
                screenShake: true,
                crtEffect: true
            }
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.unlockedLevels)) {
                    this.data = {
                        ...this.getDefaults(),
                        ...parsed,
                        settings: {
                            ...this.getDefaults().settings,
                            ...(parsed.settings || {})
                        }
                    };
                    // Ensure Level 1 is always unlocked
                    if (!this.data.unlockedLevels.includes(1)) {
                        this.data.unlockedLevels.push(1);
                    }
                    return;
                }
            }
        } catch (e) {
            console.warn('StorageManager: Failed to load from localStorage. Using defaults.', e);
        }
        this.data = this.getDefaults();
        this.save();
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('StorageManager: Could not save progress to localStorage.', e);
        }
    }

    isLevelUnlocked(levelId) {
        return this.data.unlockedLevels.includes(levelId);
    }

    unlockLevel(levelId) {
        if (!this.data.unlockedLevels.includes(levelId) && levelId <= 15) {
            this.data.unlockedLevels.push(levelId);
            this.save();
        }
    }

    recordLevelResult(levelId, starsEarned, fragmentsCount, timeTaken) {
        // Record stars (keep maximum)
        const currentStars = this.data.stars[levelId] || 0;
        if (starsEarned > currentStars) {
            this.data.stars[levelId] = starsEarned;
        }

        // Record fragments (keep maximum)
        const currentFrags = this.data.fragments[levelId] || 0;
        if (fragmentsCount > currentFrags) {
            this.data.fragments[levelId] = fragmentsCount;
        }

        // Record best time (keep minimum)
        const currentBestTime = this.data.bestTimes[levelId];
        if (currentBestTime === undefined || timeTaken < currentBestTime) {
            this.data.bestTimes[levelId] = parseFloat(timeTaken.toFixed(1));
        }

        // Unlock next level if valid
        if (levelId < 15) {
            this.unlockLevel(levelId + 1);
        }

        this.save();
    }

    getLevelInfo(levelId) {
        return {
            unlocked: this.isLevelUnlocked(levelId),
            stars: this.data.stars[levelId] || 0,
            fragments: this.data.fragments[levelId] || 0,
            bestTime: this.data.bestTimes[levelId] || null
        };
    }

    getTotalStars() {
        return Object.values(this.data.stars).reduce((sum, val) => sum + val, 0);
    }

    getTotalFragments() {
        return Object.values(this.data.fragments).reduce((sum, val) => sum + val, 0);
    }

    resetProgress() {
        this.data = this.getDefaults();
        this.save();
    }
}

// Global storage instance
const Storage = new StorageManager();
