/**
 * RE:TIME - Pixel Art Canvas Renderer & Visual Effects
 * Renders futuristic lab backgrounds, sci-fi tile geometry, dynamic lighting,
 * CRT scanlines, chromatic rewind distortion, and in-game HUD.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.bgStars = [];
        this.initBackground();

        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.glitchTimer = 0;
    }

    initBackground() {
        this.bgStars = [];
        for (let i = 0; i < 40; i++) {
            this.bgStars.push({
                x: Math.random() * CONSTANTS.CANVAS_WIDTH,
                y: Math.random() * CONSTANTS.CANVAS_HEIGHT,
                size: Math.random() > 0.6 ? 2 : 1,
                speed: 0.15 + Math.random() * 0.3,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    shake(intensity = 6, duration = 12) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    clear() {
        this.ctx.fillStyle = CONSTANTS.COLORS.BG_DARK;
        this.ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);
    }

    drawLabBackground(world) {
        const ctx = this.ctx;
        const width = CONSTANTS.CANVAS_WIDTH;
        const height = CONSTANTS.CANVAS_HEIGHT;

        // 1. Cybernetic Grid
        ctx.save();
        ctx.strokeStyle = CONSTANTS.COLORS.GRID;
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 2. Parallax Lab Machinery & Pillars in background
        ctx.fillStyle = '#0d1222';
        // Background structural columns
        for (let x = 64; x < width; x += 192) {
            ctx.fillRect(x, 32, 48, height - 64);
            // Glowing conduit pipe running down column
            ctx.fillStyle = CONSTANTS.COLORS.PURPLE_GLOW;
            ctx.fillRect(x + 22, 32, 4, height - 64);
            ctx.fillStyle = '#0d1222';
        }

        // 3. Ambient dust motes floating in lab
        for (const star of this.bgStars) {
            star.pulse += 0.04;
            const alpha = 0.2 + Math.sin(star.pulse) * 0.15;
            ctx.fillStyle = `rgba(0, 243, 255, ${alpha})`;
            ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        }

        ctx.restore();
    }

    drawSolids(solids) {
        const ctx = this.ctx;
        for (const solid of solids) {
            const px = Math.floor(solid.x);
            const py = Math.floor(solid.y);
            const w = solid.width;
            const h = solid.height;

            // Base plate
            ctx.fillStyle = '#131a2e';
            ctx.fillRect(px, py, w, h);

            // Bevel highlights
            ctx.fillStyle = '#1e2947';
            ctx.fillRect(px, py, w, 2); // Top border
            ctx.fillRect(px, py, 2, h); // Left border

            ctx.fillStyle = '#080c16';
            ctx.fillRect(px, py + h - 2, w, 2); // Bottom border
            ctx.fillRect(px + w - 2, py, 2, h); // Right border

            // Panel seams
            ctx.strokeStyle = '#0b0f1d';
            ctx.lineWidth = 1;
            for (let x = px + 32; x < px + w; x += 32) {
                ctx.beginPath();
                ctx.moveTo(x, py);
                ctx.lineTo(x, py + h);
                ctx.stroke();
            }
            for (let y = py + 32; y < py + h; y += 32) {
                ctx.beginPath();
                ctx.moveTo(px, y);
                ctx.lineTo(px + w, y);
                ctx.stroke();
            }

            // Tech bolt rivets at corners
            ctx.fillStyle = '#2d3d66';
            for (let x = px + 6; x < px + w; x += 32) {
                for (let y = py + 6; y < py + h; y += 32) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }
    }

    drawHUD(world) {
        const ctx = this.ctx;
        const level = world.currentLevel;
        if (!level) return;

        ctx.save();

        // Top HUD Header Bar (Cyberpunk Translucent Glass)
        ctx.fillStyle = 'rgba(8, 10, 20, 0.85)';
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, 42);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 42);
        ctx.lineTo(CONSTANTS.CANVAS_WIDTH, 42);
        ctx.stroke();

        // 1. Sector Title & ID
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        ctx.fillText(`SETOR ${level.id.toString().padStart(2, '0')}: ${level.title.toUpperCase()}`, 16, 26);

        // 2. Lives / Battery Units
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.TEXT_MUTED;
        ctx.fillText('VIDAS:', 340, 26);

        for (let i = 0; i < CONSTANTS.GAMEPLAY.INITIAL_LIVES; i++) {
            const lx = 390 + i * 22;
            const ly = 14;
            const isAlive = i < world.player.lives;

            // Battery shell
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(lx, ly, 16, 14);
            ctx.fillStyle = '#475569';
            ctx.fillRect(lx + 16, ly + 3, 2, 8); // Tip

            if (isAlive) {
                ctx.fillStyle = CONSTANTS.COLORS.GREEN;
                ctx.fillRect(lx + 2, ly + 2, 12, 10);
            }
        }

        // 3. Temporal Energy Gauge (Rewind Fuel)
        const energyPct = world.rewindEngine.getEnergyPercent();
        const recordedSec = world.rewindEngine.getRecordedSeconds();

        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = world.rewindEngine.isRewinding ? CONSTANTS.COLORS.PURPLE_BRIGHT : CONSTANTS.COLORS.CYAN;
        ctx.fillText(`ENERGIA [R]: ${recordedSec}s`, 500, 26);

        // Energy Bar Container
        const barX = 660;
        const barY = 16;
        const barW = 120;
        const barH = 12;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = world.rewindEngine.isRewinding ? CONSTANTS.COLORS.PURPLE_BRIGHT : CONSTANTS.COLORS.CYAN;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Fill Bar
        const fillW = Math.floor((energyPct / 100) * (barW - 4));
        const barGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
        barGrad.addColorStop(0, CONSTANTS.COLORS.CYAN);
        barGrad.addColorStop(1, CONSTANTS.COLORS.PURPLE_BRIGHT);

        ctx.fillStyle = barGrad;
        ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);

        // 4. Temporal Fragments Counter (Chrono-Shards)
        const collectedCount = world.fragments.filter(f => f.collected).length;
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.TEXT_MUTED;
        ctx.fillText('FRAGMENTOS:', 800, 26);

        for (let i = 0; i < 3; i++) {
            const fx = 890 + i * 20;
            const fy = 21;
            const hasFrag = i < collectedCount;

            ctx.save();
            ctx.fillStyle = hasFrag ? CONSTANTS.COLORS.CYAN : '#334155';
            ctx.beginPath();
            ctx.moveTo(fx, fy - 6);
            ctx.lineTo(fx + 6, fy);
            ctx.lineTo(fx, fy + 6);
            ctx.lineTo(fx - 6, fy);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // 5. Timer
        const timeSec = (world.levelTimer / 60).toFixed(1);
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.WHITE;
        ctx.fillText(`TEMPO: ${timeSec}s`, 960, 26);

        // 6. Level Hint (Bottom ribbon)
        if (level.hint && world.levelTimer < 480) { // Shows for first 8 seconds
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(0, CONSTANTS.CANVAS_HEIGHT - 28, CONSTANTS.CANVAS_WIDTH, 28);
            ctx.font = '13px "Courier New", monospace';
            ctx.fillStyle = CONSTANTS.COLORS.CYAN;
            ctx.textAlign = 'center';
            ctx.fillText(`DICA: ${level.hint}`, CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT - 10);
            ctx.textAlign = 'start';
        }

        ctx.restore();
    }

    applyRewindDistortion(recordedSec) {
        const ctx = this.ctx;
        const width = CONSTANTS.CANVAS_WIDTH;
        const height = CONSTANTS.CANVAS_HEIGHT;

        ctx.save();

        // 1. Purple/Cyan Chromatic Vignette
        const grad = ctx.createRadialGradient(
            width / 2, height / 2, height / 3,
            width / 2, height / 2, width / 1.5
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(184, 66, 255, 0.35)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // 2. Horizontal CRT Scanlines
        ctx.fillStyle = 'rgba(0, 243, 255, 0.08)';
        for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1.5);
        }

        // 3. Temporal Timecode Overlay
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        ctx.shadowColor = CONSTANTS.COLORS.CYAN;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.fillText(`<< REWIND REVERSO [ -${recordedSec}s ]`, width / 2, 75);

        // Subtitle
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = CONSTANTS.COLORS.PURPLE_BRIGHT;
        ctx.fillText('SOLTE [R] PARA RETOMAR O FLUXO TEMPORAL', width / 2, 95);

        ctx.restore();
    }

    render(world) {
        const ctx = this.ctx;

        // Apply screen shake if active
        ctx.save();
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            const ox = (Math.random() - 0.5) * this.shakeIntensity;
            const oy = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(ox, oy);
        }

        // Background
        this.clear();
        this.drawLabBackground(world);

        // Solid geometry
        this.drawSolids(world.solids);

        // Blast doors (pass solid rects)
        for (const door of world.doors) {
            door.draw(ctx);
        }

        // Checkpoints
        for (const cp of world.checkpoints) {
            cp.draw(ctx);
        }

        // Pressure Buttons
        for (const btn of world.buttons) {
            btn.draw(ctx);
        }

        // Pushable Boxes
        for (const box of world.boxes) {
            box.draw(ctx);
        }

        // Moving Platforms
        for (const plat of world.movingPlatforms) {
            plat.draw(ctx);
        }

        // Crumbling Platforms
        for (const crumb of world.crumblingPlatforms) {
            crumb.draw(ctx);
        }

        // Spikes
        for (const spk of world.spikes) {
            spk.draw(ctx);
        }

        // Lasers
        for (const laser of world.lasers) {
            laser.draw(ctx);
        }

        // Temporal Fragments
        for (const frag of world.fragments) {
            frag.draw(ctx);
        }

        // Exit Chrono-Portal
        if (world.exitPortal) {
            world.exitPortal.draw(ctx);
        }

        // Enemies
        for (const drone of world.securityDrones) {
            drone.draw(ctx);
        }
        for (const chaser of world.chaserDrones) {
            chaser.draw(ctx);
        }

        // Particles
        world.particles.draw(ctx);

        // Player Robot
        world.player.draw(ctx, world.rewindEngine.isRewinding);

        // HUD
        this.drawHUD(world);

        // Rewind distortion filter
        if (world.rewindEngine.isRewinding) {
            this.applyRewindDistortion(world.rewindEngine.getRecordedSeconds());
        }

        ctx.restore();
    }
}
