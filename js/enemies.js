/**
 * RE:TIME - Enemies System
 * Implements:
 * 1. Security Drone (Patrols fixed boundaries, predictable, damage on touch)
 * 2. Chaser Drone (Detects player proximity/LOS, enters aggressive pursuit, rewind counterable)
 */

class SecurityDrone {
    constructor(id, x, y, minX, maxX, speed = 1.6) {
        this.id = id;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 20;
        this.minX = minX;
        this.maxX = maxX;
        this.speed = speed;
        this.direction = 1; // 1: Right, -1: Left
        this.bobTimer = Math.random() * 50;
    }

    update() {
        this.bobTimer += 0.08;
        this.x += this.speed * this.direction;

        // Turn around at patrol limits
        if (this.x >= this.maxX) {
            this.x = this.maxX;
            this.direction = -1;
        } else if (this.x <= this.minX) {
            this.x = this.minX;
            this.direction = 1;
        }
    }

    captureState() {
        return {
            x: this.x,
            y: this.y,
            direction: this.direction,
            bobTimer: this.bobTimer
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.x = snap.x;
        this.y = snap.y;
        this.direction = snap.direction;
        this.bobTimer = snap.bobTimer;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y + Math.sin(this.bobTimer) * 2.5);

        ctx.save();

        // Hull / Armor Shell
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 4, py + 2, 16, 12);

        // Security Blue-Cyan Trim
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        ctx.fillRect(px + 2, py + 5, 20, 3);

        // Eye Scanner
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        const eyeOffset = this.direction === 1 ? 12 : 6;
        ctx.fillRect(px + eyeOffset, py + 6, 6, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + eyeOffset + (this.direction === 1 ? 3 : 1), py + 7, 2, 2);

        // Twin Antigravity Thrusters
        ctx.fillStyle = '#475569';
        ctx.fillRect(px + 4, py + 14, 4, 3);
        ctx.fillRect(px + 16, py + 14, 4, 3);

        // Thruster Glow
        ctx.fillStyle = CONSTANTS.COLORS.CYAN_DIM;
        ctx.fillRect(px + 5, py + 17, 2, 2);
        ctx.fillRect(px + 17, py + 17, 2, 2);

        ctx.restore();
    }
}

class ChaserDrone {
    constructor(id, x, y, detectionRadius = 240, speed = 2.0) {
        this.id = id;
        this.homeX = x;
        this.homeY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 24;
        this.height = 22;
        this.detectionRadius = detectionRadius;
        this.speed = speed;
        this.isChasing = false;
        this.alertPulse = 0;
        this.bobTimer = Math.random() * 50;
    }

    update(player, solids) {
        this.bobTimer += 0.08;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        const dist = Math.hypot(playerCenterX - centerX, playerCenterY - centerY);

        // Detect player
        if (dist < this.detectionRadius && !player.isDead) {
            this.isChasing = true;
            this.alertPulse += 0.15;

            // Move towards player
            const angle = Math.atan2(playerCenterY - centerY, playerCenterX - centerX);
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        } else {
            this.isChasing = false;
            // Float back slowly towards home position
            const homeDist = Math.hypot(this.homeX - this.x, this.homeY - this.y);
            if (homeDist > 4) {
                const angle = Math.atan2(this.homeY - this.y, this.homeX - this.x);
                this.vx = Math.cos(angle) * (this.speed * 0.4);
                this.vy = Math.sin(angle) * (this.speed * 0.4);
            } else {
                this.vx = 0;
                this.vy = 0;
            }
        }

        // Apply movement with wall collision avoidance
        const nextX = this.x + this.vx;
        const nextY = this.y + this.vy;

        let blockedX = false;
        let blockedY = false;

        for (const solid of solids) {
            if (checkOverlap({ x: nextX, y: this.y, width: this.width, height: this.height }, solid)) {
                blockedX = true;
            }
            if (checkOverlap({ x: this.x, y: nextY, width: this.width, height: this.height }, solid)) {
                blockedY = true;
            }
        }

        if (!blockedX) this.x = nextX;
        if (!blockedY) this.y = nextY;
    }

    captureState() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            isChasing: this.isChasing,
            alertPulse: this.alertPulse,
            bobTimer: this.bobTimer
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.x = snap.x;
        this.y = snap.y;
        this.vx = snap.vx;
        this.vy = snap.vy;
        this.isChasing = snap.isChasing;
        this.alertPulse = snap.alertPulse;
        this.bobTimer = snap.bobTimer;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y + Math.sin(this.bobTimer) * 2);

        ctx.save();

        // Warning Detection Cone / Ring if chasing
        if (this.isChasing) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 45, 85, 0.25)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(px + 12, py + 11, 24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Armored Red/Graphite Chaser Shell
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 2, py + 3, 20, 14);

        // Danger Armor Plating
        ctx.fillStyle = this.isChasing ? CONSTANTS.COLORS.RED : CONSTANTS.COLORS.ORANGE;
        ctx.fillRect(px + 4, py + 1, 16, 3);

        // Menacing Optical Eye
        ctx.fillStyle = this.isChasing ? CONSTANTS.COLORS.RED : CONSTANTS.COLORS.ORANGE;
        ctx.fillRect(px + 8, py + 6, 8, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 10, py + 7, 4, 4);

        // Jet Boosters
        ctx.fillStyle = '#334155';
        ctx.fillRect(px, py + 7, 3, 6);
        ctx.fillRect(px + 21, py + 7, 3, 6);

        // Afterburner Flame when chasing
        if (this.isChasing) {
            ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
            ctx.fillRect(px + 10, py + 18, 4, 4 + Math.floor(Math.random() * 3));
        }

        ctx.restore();
    }
}
