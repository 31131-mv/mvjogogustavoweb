/**
 * RE:TIME - Core Game Coordinator & State Machine
 * Manages game loop, fixed physics tick, state transitions, entity updates,
 * collision resolution, hazards, and level completion sequences.
 */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.rewindEngine = new RewindEngine();
        this.particles = new ParticleSystem();

        // Input state
        this.input = {
            keys: {},
            justPressed: {}
        };

        // State Machine
        this.state = CONSTANTS.STATES.MENU;

        // Current world entities
        this.currentLevel = null;
        this.levelTimer = 0;
        this.player = new Player(64, 440);

        this.solids = [];
        this.spikes = [];
        this.movingPlatforms = [];
        this.crumblingPlatforms = [];
        this.boxes = [];
        this.buttons = [];
        this.doors = [];
        this.lasers = [];
        this.securityDrones = [];
        this.chaserDrones = [];
        this.checkpoints = [];
        this.fragments = [];
        this.exitPortal = null;

        // UI Manager (initialized later by main)
        this.ui = null;

        this.setupInputListeners();
    }

    setUI(ui) {
        this.ui = ui;
    }

    setState(newState) {
        this.state = newState;
    }

    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            // Prevent default scrolling for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            if (!this.input.keys[e.code]) {
                this.input.justPressed[e.code] = true;
            }
            this.input.keys[e.code] = true;

            // Handle Escape for pause toggle
            if (e.code === 'Escape') {
                if (this.state === CONSTANTS.STATES.PLAYING || this.state === CONSTANTS.STATES.REWINDING) {
                    if (this.ui) this.ui.showPause();
                } else if (this.state === CONSTANTS.STATES.PAUSED) {
                    if (this.ui) this.ui.hidePause();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        // Unfocus safety: clear input if window loses focus
        window.addEventListener('blur', () => {
            this.input.keys = {};
            this.input.justPressed = {};
        });
    }

    loadLevel(levelId) {
        const levelData = LEVELS.find(l => l.id === levelId);
        if (!levelData) {
            console.error(`Game: Level ${levelId} not found!`);
            return;
        }

        // 1. Clean previous entities and state
        this.currentLevel = levelData;
        this.levelTimer = 0;
        this.particles.reset();
        this.rewindEngine.reset();

        // 2. Setup Player
        this.player.reset(levelData.spawn.x, levelData.spawn.y, true);

        // 3. Load Solids
        this.solids = levelData.solids.map(s => ({ ...s }));

        // 4. Load Spikes
        this.spikes = levelData.spikes.map(s => new Spikes(s.x, s.y, s.width, s.height, s.orientation));

        // 5. Load Moving Platforms
        this.movingPlatforms = levelData.movingPlatforms.map(p =>
            new MovingPlatform(p.id, p.x, p.y, p.width, p.height, p.endX, p.endY, p.speed)
        );

        // 6. Load Crumbling Platforms
        this.crumblingPlatforms = levelData.crumblingPlatforms.map(c =>
            new CrumblingPlatform(c.id, c.x, c.y, c.width, c.height)
        );

        // 7. Load Boxes
        this.boxes = levelData.boxes.map(b => new PushableBox(b.id, b.x, b.y));

        // 8. Load Buttons
        this.buttons = levelData.buttons.map(b =>
            new PressureButton(b.id, b.x, b.y, b.targetId, b.width, b.height)
        );

        // 9. Load Doors
        this.doors = levelData.doors.map(d =>
            new BlastDoor(d.id, d.x, d.y, d.width, d.height)
        );

        // 10. Load Lasers
        this.lasers = levelData.lasers.map(l =>
            new LaserHazard(l.id, l.x, l.y, l.width, l.height, l.cyclePeriod, l.initialDelay)
        );

        // 11. Load Security Drones
        this.securityDrones = levelData.securityDrones.map(d =>
            new SecurityDrone(d.id, d.x, d.y, d.minX, d.maxX, d.speed)
        );

        // 12. Load Chaser Drones
        this.chaserDrones = levelData.chaserDrones.map(d =>
            new ChaserDrone(d.id, d.x, d.y, d.detectionRadius, d.speed)
        );

        // 13. Load Checkpoints
        this.checkpoints = levelData.checkpoints.map(cp => new Checkpoint(cp.id, cp.x, cp.y));

        // 14. Load Fragments
        this.fragments = levelData.fragments.map(f => new TemporalFragment(f.id, f.x, f.y));

        // 15. Load Exit Portal
        this.exitPortal = new ExitPortal(levelData.exit.x, levelData.exit.y);

        // Start playing
        this.setState(CONSTANTS.STATES.PLAYING);
    }

    restartCurrentLevel() {
        if (this.currentLevel) {
            this.loadLevel(this.currentLevel.id);
        }
    }

    update() {
        // Skip world updates if not playing or rewinding
        if (this.state !== CONSTANTS.STATES.PLAYING && this.state !== CONSTANTS.STATES.REWINDING) {
            // Keep background animations moving in menu
            if (this.state === CONSTANTS.STATES.MENU) {
                this.particles.update();
            }
            this.input.justPressed = {};
            return;
        }

        // --- REWIND MECHANIC ---
        const rewindHeld = this.input.keys['KeyR'];

        if (rewindHeld && (this.state === CONSTANTS.STATES.PLAYING || this.state === CONSTANTS.STATES.REWINDING)) {
            const hasMore = this.rewindEngine.stepBack(this);
            if (hasMore) {
                this.state = CONSTANTS.STATES.REWINDING;
                // Spawn reverse particles
                if (Math.random() > 0.3) {
                    this.particles.spawnRewindPulse(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2
                    );
                }
            } else {
                this.state = CONSTANTS.STATES.PLAYING;
            }
            this.input.justPressed = {};
            return;
        } else if (this.state === CONSTANTS.STATES.REWINDING) {
            // Released R: instantly resume normal play
            this.state = CONSTANTS.STATES.PLAYING;
            this.rewindEngine.isRewinding = false;
        }

        // --- NORMAL GAMEPLAY UPDATE ---
        this.levelTimer++;

        // 1. Gather all active solid collision boundaries (blocks + closed blast doors)
        const activeSolids = [...this.solids];
        for (const door of this.doors) {
            const doorSolid = door.getSolidRect();
            if (doorSolid) {
                activeSolids.push(doorSolid);
            }
        }

        // 2. Update Platforms
        for (const plat of this.movingPlatforms) {
            plat.update();
        }
        for (const crumb of this.crumblingPlatforms) {
            crumb.update();
        }

        // 3. Update Boxes
        for (const box of this.boxes) {
            box.update(activeSolids, this.movingPlatforms, this.boxes);
        }

        // 4. Update Buttons & Doors
        for (const btn of this.buttons) {
            btn.update(this.player, this.boxes);
        }
        for (const door of this.doors) {
            door.update(this.buttons);
        }

        // 5. Update Lasers
        for (const laser of this.lasers) {
            laser.update();
        }

        // 6. Update Enemies
        for (const drone of this.securityDrones) {
            drone.update();
        }
        for (const chaser of this.chaserDrones) {
            chaser.update(this.player, activeSolids);
        }

        // 7. Update Particles
        this.particles.update();

        // 8. Update Checkpoints & Fragments
        for (const cp of this.checkpoints) {
            cp.update();
            if (checkOverlap(this.player, cp)) {
                if (!cp.activated) {
                    cp.activate(this.particles);
                    this.player.setCheckpoint(cp.x, cp.y);
                }
            }
        }

        for (const frag of this.fragments) {
            frag.update();
            if (!frag.collected && checkOverlap(this.player, frag)) {
                frag.collected = true;
                this.particles.spawnFragmentCollect(frag.x + frag.width / 2, frag.y + frag.height / 2);
            }
        }

        // 9. Update Portal
        if (this.exitPortal) {
            this.exitPortal.update();
        }

        // 10. Update Player
        this.player.handleInput(this.input);
        this.player.update(
            activeSolids,
            this.movingPlatforms,
            this.boxes,
            this.crumblingPlatforms,
            this.particles
        );

        // 11. Hazard Collisions
        // Spikes
        for (const spk of this.spikes) {
            if (checkOverlap(this.player, spk)) {
                this.handlePlayerDamage();
                break;
            }
        }

        // Active Lasers
        for (const laser of this.lasers) {
            if (laser.isActive && checkOverlap(this.player, laser)) {
                this.handlePlayerDamage();
                break;
            }
        }

        // Security Drones
        for (const drone of this.securityDrones) {
            if (checkOverlap(this.player, drone)) {
                this.handlePlayerDamage();
                break;
            }
        }

        // Chaser Drones
        for (const chaser of this.chaserDrones) {
            if (checkOverlap(this.player, chaser)) {
                this.handlePlayerDamage();
                break;
            }
        }

        // 12. Check Level Exit Victory
        if (this.state === CONSTANTS.STATES.PLAYING && this.exitPortal && checkOverlap(this.player, this.exitPortal)) {
            this.handleLevelComplete();
            return;
        }

        // 13. Record state history for Rewind
        if (this.state === CONSTANTS.STATES.PLAYING) {
            this.rewindEngine.record(this);
        }

        // Clear one-shot input triggers
        this.input.justPressed = {};
    }

    handlePlayerDamage() {
        const result = this.player.takeDamage(this.particles);
        if (result === 'GAME_OVER') {
            this.renderer.shake(10, 20);
            this.setState(CONSTANTS.STATES.GAME_OVER);
            if (this.ui) this.ui.showGameOver();
        } else if (result === 'RESPAWN') {
            this.renderer.shake(6, 12);
        }
    }

    handleLevelComplete() {
        // Transition to LEVEL_COMPLETE safely
        this.setState(CONSTANTS.STATES.LEVEL_COMPLETE);

        const currentId = this.currentLevel.id;
        const timeSec = this.levelTimer / 60;
        const parTime = this.currentLevel.parTime;

        // Calculate stars
        let stars = 1; // 1 star for completion
        if (timeSec <= parTime) stars++; // 1 star for par time
        const fragsCollected = this.fragments.filter(f => f.collected).length;
        if (fragsCollected === 3) stars++; // 1 star for all fragments

        // Save progress
        Storage.recordLevelResult(currentId, stars, fragsCollected, timeSec);

        // Show UI modal
        if (this.ui) {
            this.ui.showLevelComplete(currentId, stars, fragsCollected, timeSec, parTime);
        }
    }

    render() {
        this.renderer.render(this);
    }
}
