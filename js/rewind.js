/**
 * RE:TIME - Temporal Rewind Engine
 * Records comprehensive game state every tick (up to 5 seconds / 300 frames).
 * Rewinds backwards smoothly while holding R, restoring all entity states.
 */
class RewindEngine {
    constructor() {
        this.maxFrames = CONSTANTS.REWIND.MAX_FRAMES; // 300 frames = 5 seconds
        this.history = [];
        this.energy = CONSTANTS.REWIND.MAX_ENERGY;
        this.isRewinding = false;
        this.fractionalStep = 0;
    }

    reset() {
        this.history = [];
        this.energy = CONSTANTS.REWIND.MAX_ENERGY;
        this.isRewinding = false;
        this.fractionalStep = 0;
    }

    record(world) {
        if (this.isRewinding) return;

        // Capture deep snapshot of all active entities
        const snapshot = {
            player: world.player.captureState(),
            boxes: world.boxes.map(b => b.captureState()),
            movingPlatforms: world.movingPlatforms.map(p => p.captureState()),
            crumblingPlatforms: world.crumblingPlatforms.map(c => c.captureState()),
            buttons: world.buttons.map(btn => btn.captureState()),
            doors: world.doors.map(d => d.captureState()),
            lasers: world.lasers.map(l => l.captureState()),
            checkpoints: world.checkpoints.map(cp => cp.captureState()),
            fragments: world.fragments.map(f => f.captureState()),
            securityDrones: world.securityDrones.map(d => d.captureState()),
            chaserDrones: world.chaserDrones.map(d => d.captureState()),
            levelTimer: world.levelTimer
        };

        this.history.push(snapshot);

        // Keep buffer capped at 5 seconds
        if (this.history.length > this.maxFrames) {
            this.history.shift();
        }

        // Regenerate energy when not rewinding
        if (this.energy < CONSTANTS.REWIND.MAX_ENERGY) {
            this.energy = Math.min(
                CONSTANTS.REWIND.MAX_ENERGY,
                this.energy + (CONSTANTS.REWIND.RECOVERY_PER_SEC / 60)
            );
        }
    }

    stepBack(world) {
        if (this.history.length === 0 || this.energy <= 0) {
            this.isRewinding = false;
            return false;
        }

        this.isRewinding = true;

        // Energy consumption
        this.energy = Math.max(0, this.energy - (CONSTANTS.REWIND.DEPLETION_PER_SEC / 60));

        // Rewind speed stepping
        this.fractionalStep += CONSTANTS.REWIND.PLAYBACK_SPEED;
        const stepsToPop = Math.floor(this.fractionalStep);
        this.fractionalStep -= stepsToPop;

        let lastSnap = null;
        for (let i = 0; i < stepsToPop; i++) {
            if (this.history.length > 0) {
                lastSnap = this.history.pop();
            }
        }

        if (!lastSnap && this.history.length > 0) {
            lastSnap = this.history.pop();
        }

        if (lastSnap) {
            this.restore(world, lastSnap);
        }

        // Stop rewinding if history or energy exhausted
        if (this.history.length === 0 || this.energy <= 0) {
            this.isRewinding = false;
            return false;
        }

        return true;
    }

    restore(world, snapshot) {
        if (!snapshot) return;

        // 1. Restore Player
        world.player.restoreState(snapshot.player);

        // 2. Restore Boxes
        snapshot.boxes.forEach((snap, idx) => {
            if (world.boxes[idx]) world.boxes[idx].restoreState(snap);
        });

        // 3. Restore Moving Platforms
        snapshot.movingPlatforms.forEach((snap, idx) => {
            if (world.movingPlatforms[idx]) world.movingPlatforms[idx].restoreState(snap);
        });

        // 4. Restore Crumbling Platforms
        snapshot.crumblingPlatforms.forEach((snap, idx) => {
            if (world.crumblingPlatforms[idx]) world.crumblingPlatforms[idx].restoreState(snap);
        });

        // 5. Restore Buttons
        snapshot.buttons.forEach((snap, idx) => {
            if (world.buttons[idx]) world.buttons[idx].restoreState(snap);
        });

        // 6. Restore Doors
        snapshot.doors.forEach((snap, idx) => {
            if (world.doors[idx]) world.doors[idx].restoreState(snap);
        });

        // 7. Restore Lasers
        snapshot.lasers.forEach((snap, idx) => {
            if (world.lasers[idx]) world.lasers[idx].restoreState(snap);
        });

        // 8. Restore Checkpoints
        snapshot.checkpoints.forEach((snap, idx) => {
            if (world.checkpoints[idx]) world.checkpoints[idx].restoreState(snap);
        });

        // 9. Restore Fragments
        snapshot.fragments.forEach((snap, idx) => {
            if (world.fragments[idx]) world.fragments[idx].restoreState(snap);
        });

        // 10. Restore Enemies
        snapshot.securityDrones.forEach((snap, idx) => {
            if (world.securityDrones[idx]) world.securityDrones[idx].restoreState(snap);
        });

        snapshot.chaserDrones.forEach((snap, idx) => {
            if (world.chaserDrones[idx]) world.chaserDrones[idx].restoreState(snap);
        });

        // 11. Restore Timer
        if (snapshot.levelTimer !== undefined) {
            world.levelTimer = snapshot.levelTimer;
        }
    }

    getEnergyPercent() {
        return Math.max(0, Math.min(100, (this.energy / CONSTANTS.REWIND.MAX_ENERGY) * 100));
    }

    getRecordedSeconds() {
        return (this.history.length / CONSTANTS.REWIND.FPS).toFixed(1);
    }
}
