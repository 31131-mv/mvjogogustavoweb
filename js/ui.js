/**
 * RE:TIME - UI and Menu Manager
 * Coordinates DOM overlays, modals, level selection grid, star displays,
 * pause screens, game over, and victory screens.
 */

class UIManager {
    constructor(game) {
        this.game = game;

        // Overlay containers
        this.mainMenu = document.getElementById('main-menu');
        this.levelSelectMenu = document.getElementById('level-select-menu');
        this.howToPlayMenu = document.getElementById('how-to-play-menu');
        this.optionsMenu = document.getElementById('options-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverMenu = document.getElementById('game-over-menu');
        this.levelCompleteMenu = document.getElementById('level-complete-menu');
        this.gameClearedMenu = document.getElementById('game-cleared-menu');

        this.levelGridContainer = document.getElementById('level-grid');
        this.setupEventListeners();
    }

    hideAllOverlays() {
        const menus = [
            this.mainMenu,
            this.levelSelectMenu,
            this.howToPlayMenu,
            this.optionsMenu,
            this.pauseMenu,
            this.gameOverMenu,
            this.levelCompleteMenu,
            this.gameClearedMenu
        ];
        menus.forEach(menu => {
            if (menu) menu.classList.add('hidden');
        });
    }

    showMainMenu() {
        this.hideAllOverlays();
        if (this.mainMenu) this.mainMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.MENU);
    }

    showLevelSelect() {
        this.hideAllOverlays();
        this.populateLevelGrid();
        if (this.levelSelectMenu) this.levelSelectMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.LEVEL_SELECT);
    }

    showHowToPlay() {
        this.hideAllOverlays();
        if (this.howToPlayMenu) this.howToPlayMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.HOW_TO_PLAY);
    }

    showOptions() {
        this.hideAllOverlays();
        if (this.optionsMenu) this.optionsMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.OPTIONS);
    }

    showPause() {
        if (this.pauseMenu) this.pauseMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.PAUSED);
    }

    hidePause() {
        if (this.pauseMenu) this.pauseMenu.classList.add('hidden');
        this.game.setState(CONSTANTS.STATES.PLAYING);
    }

    showGameOver() {
        this.hideAllOverlays();
        if (this.gameOverMenu) this.gameOverMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.GAME_OVER);
    }

    showLevelComplete(levelId, starsEarned, fragsCount, timeTaken, parTime) {
        this.hideAllOverlays();
        if (!this.levelCompleteMenu) return;

        // Update stats
        document.getElementById('lc-sector-title').textContent = `SETOR ${levelId.toString().padStart(2, '0')}`;
        document.getElementById('lc-time').textContent = `${timeTaken.toFixed(1)}s (Par: ${parTime}s)`;
        document.getElementById('lc-fragments').textContent = `${fragsCount} / 3`;

        // Update stars visuals
        for (let i = 1; i <= 3; i++) {
            const starElem = document.getElementById(`lc-star-${i}`);
            if (starElem) {
                if (i <= starsEarned) {
                    starElem.classList.add('earned');
                    starElem.classList.remove('unearned');
                } else {
                    starElem.classList.remove('earned');
                    starElem.classList.add('unearned');
                }
            }
        }

        // Adjust Next Level button if it was the last level
        const nextBtn = document.getElementById('btn-lc-next');
        if (nextBtn) {
            if (levelId >= 15) {
                nextBtn.textContent = 'FINALIZAR JORNADA';
            } else {
                nextBtn.textContent = 'PRÓXIMA FASE >>';
            }
        }

        this.levelCompleteMenu.classList.remove('hidden');
        this.game.setState(CONSTANTS.STATES.LEVEL_COMPLETE);
    }

    showGameCleared() {
        this.hideAllOverlays();
        if (!this.gameClearedMenu) return;

        const totalStars = Storage.getTotalStars();
        const totalFrags = Storage.getTotalFragments();

        document.getElementById('gc-total-stars').textContent = `${totalStars} / 45`;
        document.getElementById('gc-total-fragments').textContent = `${totalFrags} / 45`;

        this.gameClearedMenu.classList.remove('hidden');
    }

    populateLevelGrid() {
        if (!this.levelGridContainer) return;
        this.levelGridContainer.innerHTML = '';

        CONSTANTS.CHAPTERS.forEach(chap => {
            // Chapter section container
            const chapDiv = document.createElement('div');
            chapDiv.className = 'chapter-section';

            const chapTitle = document.createElement('h3');
            chapTitle.className = 'chapter-title';
            chapTitle.textContent = chap.title;
            chapDiv.appendChild(chapTitle);

            const gridDiv = document.createElement('div');
            gridDiv.className = 'chapter-grid';

            for (let id = chap.range[0]; id <= chap.range[1]; id++) {
                const info = Storage.getLevelInfo(id);
                const levelData = LEVELS.find(l => l.id === id);

                const card = document.createElement('button');
                card.className = `level-card ${info.unlocked ? 'unlocked' : 'locked'}`;
                card.disabled = !info.unlocked;

                if (info.unlocked) {
                    const starsHtml = '★'.repeat(info.stars) + '☆'.repeat(3 - info.stars);
                    card.innerHTML = `
                        <div class="lc-num">${id.toString().padStart(2, '0')}</div>
                        <div class="lc-name">${levelData ? levelData.title : ''}</div>
                        <div class="lc-stars">${starsHtml}</div>
                        <div class="lc-best">${info.bestTime ? `${info.bestTime}s` : '--'}</div>
                    `;
                    card.addEventListener('click', () => {
                        this.hideAllOverlays();
                        this.game.loadLevel(id);
                    });
                } else {
                    card.innerHTML = `
                        <div class="lc-num">${id.toString().padStart(2, '0')}</div>
                        <div class="lc-locked-icon">🔒</div>
                        <div class="lc-name">BLOQUEADO</div>
                    `;
                }

                gridDiv.appendChild(card);
            }

            chapDiv.appendChild(gridDiv);
            this.levelGridContainer.appendChild(chapDiv);
        });
    }

    setupEventListeners() {
        // Main Menu
        document.getElementById('btn-play')?.addEventListener('click', () => {
            this.hideAllOverlays();
            // Continue highest unlocked or level 1
            const highest = Math.max(...Storage.data.unlockedLevels);
            this.game.loadLevel(highest || 1);
        });

        document.getElementById('btn-level-select')?.addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
            this.showHowToPlay();
        });

        document.getElementById('btn-options')?.addEventListener('click', () => {
            this.showOptions();
        });

        // Back to Menu buttons
        document.querySelectorAll('.btn-back-to-menu').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showMainMenu();
            });
        });

        // Pause Menu
        document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
            this.hidePause();
        });

        document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
            this.hideAllOverlays();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-pause-level-select')?.addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
            this.showMainMenu();
        });

        // Game Over Menu
        document.getElementById('btn-go-retry')?.addEventListener('click', () => {
            this.hideAllOverlays();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-go-level-select')?.addEventListener('click', () => {
            this.showLevelSelect();
        });

        document.getElementById('btn-go-menu')?.addEventListener('click', () => {
            this.showMainMenu();
        });

        // Level Complete Menu
        document.getElementById('btn-lc-next')?.addEventListener('click', () => {
            this.hideAllOverlays();
            const currentId = this.game.currentLevel ? this.game.currentLevel.id : 1;
            if (currentId >= 15) {
                this.showGameCleared();
            } else {
                this.game.loadLevel(currentId + 1);
            }
        });

        document.getElementById('btn-lc-retry')?.addEventListener('click', () => {
            this.hideAllOverlays();
            this.game.restartCurrentLevel();
        });

        document.getElementById('btn-lc-menu')?.addEventListener('click', () => {
            this.showMainMenu();
        });

        // Options: Reset progress
        document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja apagar todo o progresso do jogo? Esta ação não pode ser desfeita.')) {
                Storage.resetProgress();
                alert('Progresso resetado com sucesso!');
                this.showMainMenu();
            }
        });

        // Game Cleared victory screen button
        document.getElementById('btn-gc-menu')?.addEventListener('click', () => {
            this.showMainMenu();
        });
    }
}
