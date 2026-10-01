/**
 * RE:TIME - Interactive World Objects & Hazards
 * Implements: Solid Tiles, Moving Platforms, Crumbling Platforms,
 * Pushable Boxes, Pressure Buttons, Blast Doors, Lasers, Spikes,
 * Checkpoints, Collectible Fragments, and Exit Portals.
 */

// Helper: AABB collision
function checkOverlap(r1, r2) {
    return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
    );
}

// 1. Moving Platform
class MovingPlatform {
    constructor(id, x, y, width, height, endX, endY, speed = 1.2) {
        this.id = id;
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.progress = 0; // 0 to 1
        this.direction = 1; // 1: forward, -1: reverse
        this.dx = 0;
        this.dy = 0;
    }

    update() {
        const prevX = this.x;
        const prevY = this.y;

        const dist = Math.hypot(this.endX - this.startX, this.endY - this.startY);
        if (dist > 0) {
            const step = this.speed / dist;
            this.progress += step * this.direction;

            if (this.progress >= 1) {
                this.progress = 1;
                this.direction = -1;
            } else if (this.progress <= 0) {
                this.progress = 0;
                this.direction = 1;
            }

            this.x = this.startX + (this.endX - this.startX) * this.progress;
            this.y = this.startY + (this.endY - this.startY) * this.progress;
        }

        this.dx = this.x - prevX;
        this.dy = this.y - prevY;
    }

    captureState() {
        return {
            x: this.x,
            y: this.y,
            progress: this.progress,
            direction: this.direction,
            dx: this.dx,
            dy: this.dy
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.x = snap.x;
        this.y = snap.y;
        this.progress = snap.progress;
        this.direction = snap.direction;
        this.dx = snap.dx;
        this.dy = snap.dy;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py, this.width, this.height);

        // Tech track border & neon strip
        ctx.strokeStyle = CONSTANTS.COLORS.CYAN;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 1, py + 1, this.width - 2, this.height - 2);

        // Interior glow bar
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        ctx.fillRect(px + 4, py + Math.floor(this.height / 2) - 1, this.width - 8, 2);

        // Chevron movement arrows
        ctx.fillStyle = '#ffffff';
        const mid = px + Math.floor(this.width / 2);
        ctx.fillRect(mid - 3, py + 3, 2, 2);
        ctx.fillRect(mid + 1, py + 3, 2, 2);
    }
}

// 2. Crumbling Platform (Disappearing)
class CrumblingPlatform {
    constructor(id, x, y, width = 32, height = 16) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
        this.isCrumbling = false;
        this.timer = 0;
        this.respawnTimer = 0;
    }

    trigger() {
        if (this.isActive && !this.isCrumbling) {
            this.isCrumbling = true;
            this.timer = CONSTANTS.GAMEPLAY.CRUMBLE_DELAY;
        }
    }

    update() {
        if (this.isCrumbling) {
            this.timer--;
            if (this.timer <= 0) {
                this.isActive = false;
                this.isCrumbling = false;
                this.respawnTimer = CONSTANTS.GAMEPLAY.CRUMBLE_RESPAWN;
            }
        } else if (!this.isActive) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                this.isActive = true;
                this.isCrumbling = false;
            }
        }
    }

    captureState() {
        return {
            isActive: this.isActive,
            isCrumbling: this.isCrumbling,
            timer: this.timer,
            respawnTimer: this.respawnTimer
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.isActive = snap.isActive;
        this.isCrumbling = snap.isCrumbling;
        this.timer = snap.timer;
        this.respawnTimer = snap.respawnTimer;
    }

    draw(ctx) {
        if (!this.isActive) {
            // Ghost outline when reforming
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 123, 0, 0.25)';
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
            ctx.restore();
            return;
        }

        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        // Shake if crumbling
        const shakeX = this.isCrumbling ? (Math.random() - 0.5) * 3 : 0;
        const shakeY = this.isCrumbling ? (Math.random() - 0.5) * 2 : 0;

        ctx.fillStyle = this.isCrumbling ? '#ff4d6d' : '#8b5cf6';
        ctx.fillRect(px + shakeX, py + shakeY, this.width, this.height);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + shakeX + 2, py + shakeY + 2, this.width - 4, 2);

        // Warning hash marks
        ctx.fillStyle = '#1e1b4b';
        for (let i = 4; i < this.width - 4; i += 8) {
            ctx.fillRect(px + shakeX + i, py + shakeY + 5, 4, this.height - 8);
        }
    }
}

// 3. Pushable Box
class PushableBox {
    constructor(id, x, y, width = 28, height = 28) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.onPlatform = null;
    }

    tryPush(pushVx, solids, otherBoxes) {
        const targetX = this.x + (pushVx > 0 ? 2 : -2);

        // Check if movement is blocked by solids
        for (const solid of solids) {
            if (checkOverlap({ x: targetX, y: this.y, width: this.width, height: this.height }, solid)) {
                return false;
            }
        }

        // Check if blocked by another box
        for (const box of otherBoxes) {
            if (box !== this && checkOverlap({ x: targetX, y: this.y, width: this.width, height: this.height }, box)) {
                return false;
            }
        }

        // Move box
        this.x = targetX;
        return true;
    }

    update(solids, movingPlatforms, otherBoxes) {
        // Gravity
        this.vy += CONSTANTS.PHYSICS.GRAVITY;
        if (this.vy > CONSTANTS.PHYSICS.MAX_FALL) {
            this.vy = CONSTANTS.PHYSICS.MAX_FALL;
        }

        this.y += this.vy;
        this.onGround = false;
        this.onPlatform = null;

        // Vertical collision with solids
        for (const solid of solids) {
            if (checkOverlap(this, solid)) {
                if (this.vy > 0) {
                    this.y = solid.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0) {
                    this.y = solid.y + solid.height;
                    this.vy = 0;
                }
            }
        }

        // Vertical collision with other boxes
        for (const box of otherBoxes) {
            if (box !== this && checkOverlap(this, box)) {
                if (this.vy > 0) {
                    this.y = box.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }

        // Vertical collision with moving platforms
        for (const plat of movingPlatforms) {
            if (checkOverlap(this, plat)) {
                if (this.vy >= 0 && (this.y - this.vy + this.height) <= plat.y + 6) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.onPlatform = plat;
                }
            }
        }

        // Carry with platform if resting on one
        if (this.onPlatform) {
            this.x += this.onPlatform.dx;
            this.y += this.onPlatform.dy;
        }
    }

    captureState() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            onGround: this.onGround
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.x = snap.x;
        this.y = snap.y;
        this.vx = snap.vx;
        this.vy = snap.vy;
        this.onGround = snap.onGround;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        // Metallic frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(px, py, this.width, this.height);

        // Inset panel
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 3, py + 3, this.width - 6, this.height - 6);

        // Cybernetic circuit cross
        ctx.strokeStyle = CONSTANTS.COLORS.ORANGE;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 4, py + 4);
        ctx.lineTo(px + this.width - 4, py + this.height - 4);
        ctx.moveTo(px + this.width - 4, py + 4);
        ctx.lineTo(px + 4, py + this.height - 4);
        ctx.stroke();

        // Corner rivets
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(px + 2, py + 2, 2, 2);
        ctx.fillRect(px + this.width - 4, py + 2, 2, 2);
        ctx.fillRect(px + 2, py + this.height - 4, 2, 2);
        ctx.fillRect(px + this.width - 4, py + this.height - 4, 2, 2);
    }
}

// 4. Pressure Button
class PressureButton {
    constructor(id, x, y, targetId, width = 32, height = 8) {
        this.id = id;
        this.targetId = targetId;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPressed = false;
    }

    update(player, boxes) {
        // Detect if player or any box is on top
        const padBox = { x: this.x + 2, y: this.y - 4, width: this.width - 4, height: 6 };
        let pressed = checkOverlap(player, padBox);

        if (!pressed) {
            for (const box of boxes) {
                if (checkOverlap(box, padBox)) {
                    pressed = true;
                    break;
                }
            }
        }

        this.isPressed = pressed;
    }

    captureState() {
        return { isPressed: this.isPressed };
    }

    restoreState(snap) {
        if (!snap) return;
        this.isPressed = snap.isPressed;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        // Base plate
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, py + 4, this.width, 4);

        // Movable top button
        const buttonY = this.isPressed ? py + 5 : py + 1;
        const buttonH = this.isPressed ? 3 : 5;

        ctx.fillStyle = this.isPressed ? CONSTANTS.COLORS.GREEN : CONSTANTS.COLORS.ORANGE;
        ctx.fillRect(px + 4, buttonY, this.width - 8, buttonH);

        // Core indicator light
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + Math.floor(this.width / 2) - 3, buttonY + 1, 6, 2);
    }
}

// 5. Blast Door
class BlastDoor {
    constructor(id, x, y, width = 16, height = 64) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isOpen = false;
        this.openProgress = 0; // 0 = fully closed, 1 = fully open
    }

    update(buttons) {
        // Find controlling button
        const btn = buttons.find(b => b.targetId === this.id);
        const shouldBeOpen = btn ? btn.isPressed : false;

        if (shouldBeOpen && this.openProgress < 1) {
            this.openProgress = Math.min(1, this.openProgress + 0.1);
        } else if (!shouldBeOpen && this.openProgress > 0) {
            this.openProgress = Math.max(0, this.openProgress - 0.1);
        }

        this.isOpen = this.openProgress >= 0.95;
    }

    // Treat as solid when not fully opened
    getSolidRect() {
        if (this.openProgress >= 0.85) return null;
        const currentH = this.height * (1 - this.openProgress);
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: currentH
        };
    }

    captureState() {
        return {
            isOpen: this.isOpen,
            openProgress: this.openProgress
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.isOpen = snap.isOpen;
        this.openProgress = snap.openProgress;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);
        const currentH = Math.floor(this.height * (1 - this.openProgress));

        // Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px - 2, py, this.width + 4, 4); // Top header
        ctx.fillRect(px - 2, py + this.height - 4, this.width + 4, 4); // Bottom sill

        if (currentH > 2) {
            // Door panel
            ctx.fillStyle = '#334155';
            ctx.fillRect(px, py, this.width, currentH);

            // Warning stripes
            ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
            for (let y = py + 4; y < py + currentH - 4; y += 10) {
                ctx.fillRect(px + 2, y, this.width - 4, 4);
            }
        }
    }
}

// 6. Laser Emitter & Beam
class LaserHazard {
    constructor(id, x, y, width, height, cyclePeriod = 0, initialDelay = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cyclePeriod = cyclePeriod; // 0 = constant ON, > 0 = pulsing
        this.timer = initialDelay;
        this.isActive = true;
    }

    update() {
        if (this.cyclePeriod > 0) {
            this.timer++;
            // Active during first half of cycle
            const mod = this.timer % this.cyclePeriod;
            this.isActive = mod < (this.cyclePeriod * 0.6);
        }
    }

    captureState() {
        return {
            timer: this.timer,
            isActive: this.isActive
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.timer = snap.timer;
        this.isActive = snap.isActive;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        if (!this.isActive) {
            // Faint guide beam
            ctx.save();
            ctx.fillStyle = 'rgba(255, 45, 85, 0.1)';
            ctx.fillRect(px, py, this.width, this.height);
            ctx.restore();
            return;
        }

        // Active laser core
        ctx.save();
        ctx.shadowColor = CONSTANTS.COLORS.RED;
        ctx.shadowBlur = 10;
        ctx.fillStyle = CONSTANTS.COLORS.RED;
        ctx.fillRect(px, py, this.width, this.height);

        // White hot center beam
        ctx.fillStyle = '#ffffff';
        if (this.width > this.height) {
            ctx.fillRect(px, py + Math.floor(this.height / 2) - 1, this.width, 2);
        } else {
            ctx.fillRect(px + Math.floor(this.width / 2) - 1, py, 2, this.height);
        }
        ctx.restore();
    }
}

// 7. Spikes
class Spikes {
    constructor(x, y, width, height, orientation = 'UP') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.orientation = orientation; // UP, DOWN, LEFT, RIGHT
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;

        const count = Math.floor(this.width / 8);
        for (let i = 0; i < count; i++) {
            const sx = px + i * 8;
            ctx.beginPath();
            if (this.orientation === 'UP') {
                ctx.moveTo(sx, py + this.height);
                ctx.lineTo(sx + 4, py);
                ctx.lineTo(sx + 8, py + this.height);
            } else if (this.orientation === 'DOWN') {
                ctx.moveTo(sx, py);
                ctx.lineTo(sx + 4, py + this.height);
                ctx.lineTo(sx + 8, py);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

// 8. Temporal Fragment (Collectible Chrono-Shard)
class TemporalFragment {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.collected = false;
        this.bobTimer = Math.random() * 100;
    }

    update() {
        this.bobTimer += 0.05;
    }

    captureState() {
        return { collected: this.collected };
    }

    restoreState(snap) {
        if (!snap) return;
        this.collected = snap.collected;
    }

    draw(ctx) {
        if (this.collected) return;

        const px = Math.floor(this.x);
        const py = Math.floor(this.y + Math.sin(this.bobTimer) * 3);

        ctx.save();
        ctx.shadowColor = CONSTANTS.COLORS.CYAN;
        ctx.shadowBlur = 8;

        // Glowing Chrono Diamond
        ctx.fillStyle = CONSTANTS.COLORS.CYAN;
        ctx.beginPath();
        ctx.moveTo(px + 8, py);
        ctx.lineTo(px + 14, py + 8);
        ctx.lineTo(px + 8, py + 16);
        ctx.lineTo(px + 2, py + 8);
        ctx.closePath();
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 6, py + 6, 4, 4);

        ctx.restore();
    }
}

// 9. Exit Chrono-Portal
class ExitPortal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 54;
        this.animTimer = 0;
    }

    update() {
        this.animTimer += 0.08;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        ctx.save();
        // Swirling Portal Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, py, this.width, this.height);

        // Neon outline
        ctx.strokeStyle = CONSTANTS.COLORS.CYAN;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, this.width - 4, this.height - 4);

        // Chrono Vortex Rings
        const vortexGrad = ctx.createLinearGradient(px, py, px + this.width, py + this.height);
        vortexGrad.addColorStop(0, CONSTANTS.COLORS.CYAN);
        vortexGrad.addColorStop(0.5, CONSTANTS.COLORS.PURPLE_BRIGHT);
        vortexGrad.addColorStop(1, CONSTANTS.COLORS.CYAN);

        ctx.fillStyle = vortexGrad;
        ctx.fillRect(px + 6, py + 6, this.width - 12, this.height - 12);

        // Animated swirling scanline
        const scanY = py + 8 + ((Math.sin(this.animTimer) + 1) / 2) * (this.height - 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 8, Math.floor(scanY), this.width - 16, 3);

        ctx.restore();
    }
}

// 10. Checkpoint Terminal
class Checkpoint {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 36;
        this.activated = false;
        this.pulse = 0;
    }

    activate(particles) {
        if (!this.activated) {
            this.activated = true;
            if (particles) {
                particles.spawnCheckpointWave(this.x + this.width / 2, this.y + this.height / 2);
            }
        }
    }

    update() {
        if (this.activated) {
            this.pulse += 0.08;
        }
    }

    captureState() {
        return { activated: this.activated };
    }

    restoreState(snap) {
        if (!snap) return;
        this.activated = snap.activated;
    }

    draw(ctx) {
        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        // Terminal pillar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 4, py + 8, 16, 28);

        // Terminal head
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, py, 24, 12);

        // Screen display
        const screenColor = this.activated ? CONSTANTS.COLORS.GREEN : CONSTANTS.COLORS.ORANGE;
        ctx.fillStyle = screenColor;
        ctx.fillRect(px + 4, py + 2, 16, 8);

        // Screen icon
        ctx.fillStyle = '#ffffff';
        if (this.activated) {
            ctx.fillRect(px + 8, py + 4, 8, 4); // Checkmark or status bar
        } else {
            ctx.fillRect(px + 10, py + 4, 4, 4); // Standby dot
        }
    }
}
