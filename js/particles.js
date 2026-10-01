/**
 * RE:TIME - Particle System
 * Fast, lightweight 2D pixel particles for impacts, jumps, rewind effects, and ambient lab dust.
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 250;
    }

    reset() {
        this.particles = [];
    }

    add(x, y, vx, vy, color, size, life, shape = 'square', fade = true) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Remove oldest
        }
        this.particles.push({
            x, y, vx, vy,
            color,
            size,
            maxLife: life,
            life: life,
            shape,
            fade
        });
    }

    // Quick presets
    spawnDust(x, y, count = 4, dir = 0) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 1.5 - dir * 0.8;
            const vy = -Math.random() * 1.2;
            const size = Math.random() > 0.5 ? 2 : 3;
            this.add(x, y, vx, vy, 'rgba(160, 200, 255, 0.6)', size, 18 + Math.random() * 10);
        }
    }

    spawnJumpParticles(x, y) {
        for (let i = 0; i < 6; i++) {
            const vx = (Math.random() - 0.5) * 3;
            const vy = Math.random() * 1.2;
            this.add(x, y, vx, vy, 'rgba(0, 243, 255, 0.8)', 2, 20 + Math.random() * 8);
        }
    }

    spawnGlitchBurst(x, y, count = 15, color = '#ff2d55') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() > 0.4 ? 3 : 2;
            this.add(x, y, vx, vy, color, size, 25 + Math.random() * 15);
        }
    }

    spawnRewindPulse(x, y) {
        // Reverse spiral particle sucked inward
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 30;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const vx = (x - px) * 0.12;
        const vy = (y - py) * 0.12;
        this.add(px, py, vx, vy, Math.random() > 0.5 ? CONSTANTS.COLORS.CYAN : CONSTANTS.COLORS.PURPLE_BRIGHT, 2, 16);
    }

    spawnFragmentCollect(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 3.0;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.add(x, y, vx, vy, CONSTANTS.COLORS.CYAN, 3, 30 + Math.random() * 15);
        }
    }

    spawnCheckpointWave(x, y) {
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const vx = Math.cos(angle) * 2;
            const vy = Math.sin(angle) * 2;
            this.add(x, y, vx, vy, CONSTANTS.COLORS.GREEN, 3, 25);
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = p.fade ? (p.life / p.maxLife) : 1;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            ctx.fillStyle = p.color;

            if (p.shape === 'square') {
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            } else if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}
