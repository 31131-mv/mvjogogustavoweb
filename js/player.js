/**
 * RE:TIME - Player Character Controller
 * Small experimental robot with crisp AABB collision, coyote time, jump buffering,
 * state history capture/restoration, and procedural pixel art rendering.
 */
class Player {
    constructor(x, y) {
        this.width = 20;
        this.height = 28;
        this.spawnX = x;
        this.spawnY = y;
        this.checkpointX = x;
        this.checkpointY = y;

        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;

        this.facing = 1; // 1: Right, -1: Left
        this.onGround = false;
        this.onPlatform = null; // Reference to moving platform if standing on one
        this.coyoteCounter = 0;
        this.jumpBufferCounter = 0;
        this.jumpHeld = false;

        this.lives = CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        this.invulnerableTimer = 0;
        this.isDead = false;

        // Animation state
        this.animTimer = 0;
        this.animFrame = 0;
        this.state = 'IDLE'; // IDLE, RUN, JUMP, FALL, REWIND, DEAD

        // Visual afterimage trail for rewind
        this.trail = [];
    }

    reset(x, y, resetCheckpoint = true) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1;
        this.onGround = false;
        this.onPlatform = null;
        this.coyoteCounter = 0;
        this.jumpBufferCounter = 0;
        this.jumpHeld = false;
        this.invulnerableTimer = 0;
        this.isDead = false;
        this.state = 'IDLE';
        this.trail = [];

        if (resetCheckpoint) {
            this.spawnX = x;
            this.spawnY = y;
            this.checkpointX = x;
            this.checkpointY = y;
            this.lives = CONSTANTS.GAMEPLAY.INITIAL_LIVES;
        }
    }

    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
    }

    respawnAtCheckpoint() {
        this.x = this.checkpointX;
        this.y = this.checkpointY;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.onPlatform = null;
        this.invulnerableTimer = CONSTANTS.GAMEPLAY.INVULNERABLE_TIME;
        this.isDead = false;
        this.state = 'IDLE';
        this.trail = [];
    }

    handleInput(input) {
        if (this.isDead) return;

        // Horizontal movement intent
        const moveLeft = input.keys['KeyA'] || input.keys['ArrowLeft'];
        const moveRight = input.keys['KeyD'] || input.keys['ArrowRight'];

        const accel = this.onGround ? CONSTANTS.PHYSICS.PLAYER_ACCEL : CONSTANTS.PHYSICS.PLAYER_ACCEL * 0.75;
        const decel = this.onGround ? CONSTANTS.PHYSICS.PLAYER_DECEL : CONSTANTS.PHYSICS.AIR_DECEL;
        const maxSpd = CONSTANTS.PHYSICS.PLAYER_SPEED;

        if (moveLeft && !moveRight) {
            this.vx = Math.max(this.vx - accel, -maxSpd);
            this.facing = -1;
        } else if (moveRight && !moveLeft) {
            this.vx = Math.min(this.vx + accel, maxSpd);
            this.facing = 1;
        } else {
            // Apply friction/deceleration
            if (this.vx > 0) {
                this.vx = Math.max(0, this.vx - decel);
            } else if (this.vx < 0) {
                this.vx = Math.min(0, this.vx + decel);
            }
        }

        // Jump input & buffering
        const jumpPressed = input.justPressed['Space'] || input.justPressed['ArrowUp'] || input.justPressed['KeyW'];
        this.jumpHeld = input.keys['Space'] || input.keys['ArrowUp'] || input.keys['KeyW'];

        if (jumpPressed) {
            this.jumpBufferCounter = CONSTANTS.PHYSICS.JUMP_BUFFER;
        }
    }

    update(solids, movingPlatforms, boxes, crumblingPlatforms, particles) {
        if (this.isDead) return;

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer--;
        }

        // Jump buffering and Coyote Time countdowns
        if (this.jumpBufferCounter > 0) this.jumpBufferCounter--;
        if (this.coyoteCounter > 0) this.coyoteCounter--;

        // Jump execution
        if (this.jumpBufferCounter > 0 && (this.onGround || this.coyoteCounter > 0)) {
            this.vy = CONSTANTS.PHYSICS.JUMP_FORCE;
            this.onGround = false;
            this.coyoteCounter = 0;
            this.jumpBufferCounter = 0;
            this.onPlatform = null;
            if (particles) {
                particles.spawnJumpParticles(this.x + this.width / 2, this.y + this.height);
            }
        }

        // Variable jump height: cut jump short if space is released
        if (!this.jumpHeld && this.vy < -2.5) {
            this.vy *= CONSTANTS.PHYSICS.VARIABLE_JUMP_FALL_MULT;
        }

        // Apply gravity
        this.vy += CONSTANTS.PHYSICS.GRAVITY;
        if (this.vy > CONSTANTS.PHYSICS.MAX_FALL) {
            this.vy = CONSTANTS.PHYSICS.MAX_FALL;
        }

        // Remember previous ground state for landing particles
        const wasOnGround = this.onGround;

        // --- 1. HORIZONTAL MOVEMENT & RESOLUTION ---
        this.x += this.vx;

        // Check horizontal collision with solid world tiles / doors
        for (const solid of solids) {
            if (this.checkAABB(this.x, this.y, this.width, this.height, solid.x, solid.y, solid.width, solid.height)) {
                if (this.vx > 0) {
                    this.x = solid.x - this.width;
                } else if (this.vx < 0) {
                    this.x = solid.x + solid.width;
                }
                this.vx = 0;
                break;
            }
        }

        // Check horizontal collision with pushable boxes
        for (const box of boxes) {
            if (this.checkAABB(this.x, this.y, this.width, this.height, box.x, box.y, box.width, box.height)) {
                if (this.vx > 0) {
                    // Try pushing box right
                    const canPush = box.tryPush(this.vx, solids, boxes);
                    if (canPush) {
                        this.vx = Math.min(this.vx, CONSTANTS.PHYSICS.BOX_PUSH_SPEED);
                    } else {
                        this.x = box.x - this.width;
                        this.vx = 0;
                    }
                } else if (this.vx < 0) {
                    // Try pushing box left
                    const canPush = box.tryPush(this.vx, solids, boxes);
                    if (canPush) {
                        this.vx = Math.max(this.vx, -CONSTANTS.PHYSICS.BOX_PUSH_SPEED);
                    } else {
                        this.x = box.x + box.width;
                        this.vx = 0;
                    }
                }
            }
        }

        // --- 2. VERTICAL MOVEMENT & RESOLUTION ---
        this.y += this.vy;
        this.onGround = false;
        this.onPlatform = null;

        // Check vertical collision with solids
        for (const solid of solids) {
            if (this.checkAABB(this.x, this.y, this.width, this.height, solid.x, solid.y, solid.width, solid.height)) {
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

        // Check vertical collision with boxes (standing on top or hitting from bottom)
        for (const box of boxes) {
            if (this.checkAABB(this.x, this.y, this.width, this.height, box.x, box.y, box.width, box.height)) {
                if (this.vy > 0 && (this.y - this.vy + this.height) <= box.y + 4) {
                    this.y = box.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0) {
                    this.y = box.y + box.height;
                    this.vy = 0;
                }
            }
        }

        // Check collision with moving platforms
        for (const plat of movingPlatforms) {
            if (this.checkAABB(this.x, this.y, this.width, this.height, plat.x, plat.y, plat.width, plat.height)) {
                // Landing on platform from above
                if (this.vy >= 0 && (this.y - this.vy + this.height) <= plat.y + 8) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    this.onPlatform = plat;
                }
            }
        }

        // Check collision with crumbling platforms
        for (const crumb of crumblingPlatforms) {
            if (crumb.isActive && this.checkAABB(this.x, this.y, this.width, this.height, crumb.x, crumb.y, crumb.width, crumb.height)) {
                if (this.vy >= 0 && (this.y - this.vy + this.height) <= crumb.y + 8) {
                    this.y = crumb.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                    crumb.trigger();
                }
            }
        }

        // If standing on moving platform, attach to its delta movement
        if (this.onPlatform) {
            this.x += this.onPlatform.dx;
            this.y += this.onPlatform.dy;
        }

        // Ground state management & coyote time
        if (this.onGround) {
            this.coyoteCounter = CONSTANTS.PHYSICS.COYOTE_TIME;
            if (!wasOnGround && particles && this.vy >= 0) {
                particles.spawnDust(this.x + this.width / 2, this.y + this.height, 4);
            }
        }

        // Boundary checks (screen bounds)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        } else if (this.x + this.width > CONSTANTS.CANVAS_WIDTH) {
            this.x = CONSTANTS.CANVAS_WIDTH - this.width;
            this.vx = 0;
        }

        // Bottom pit hazard: falling off screen causes damage
        if (this.y > CONSTANTS.CANVAS_HEIGHT + 10) {
            this.takeDamage(particles);
        }

        // Animation state update
        this.updateAnimation(particles);
    }

    updateAnimation(particles) {
        if (!this.onGround) {
            this.state = this.vy < 0 ? 'JUMP' : 'FALL';
        } else if (Math.abs(this.vx) > 0.3) {
            this.state = 'RUN';
            this.animTimer++;
            if (this.animTimer % 8 === 0) {
                this.animFrame = (this.animFrame + 1) % 4;
                if (particles && Math.random() > 0.4) {
                    particles.spawnDust(this.x + this.width / 2, this.y + this.height, 1, this.facing);
                }
            }
        } else {
            this.state = 'IDLE';
            this.animTimer++;
            if (this.animTimer % 20 === 0) {
                this.animFrame = (this.animFrame + 1) % 2;
            }
        }
    }

    takeDamage(particles) {
        if (this.invulnerableTimer > 0 || this.isDead) return false;

        this.lives--;
        if (particles) {
            particles.spawnGlitchBurst(this.x + this.width / 2, this.y + this.height / 2, 20, CONSTANTS.COLORS.RED);
        }

        if (this.lives <= 0) {
            this.isDead = true;
            this.state = 'DEAD';
            return 'GAME_OVER';
        } else {
            this.respawnAtCheckpoint();
            return 'RESPAWN';
        }
    }

    checkAABB(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (
            x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2
        );
    }

    captureState() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            facing: this.facing,
            onGround: this.onGround,
            lives: this.lives,
            invulnerableTimer: this.invulnerableTimer,
            state: this.state,
            animFrame: this.animFrame
        };
    }

    restoreState(snap) {
        if (!snap) return;
        this.x = snap.x;
        this.y = snap.y;
        this.vx = snap.vx;
        this.vy = snap.vy;
        this.facing = snap.facing;
        this.onGround = snap.onGround;
        this.lives = snap.lives;
        this.invulnerableTimer = snap.invulnerableTimer;
        this.state = 'REWIND';
        this.animFrame = snap.animFrame;
        this.isDead = false;

        // Record trailing afterimage for temporal effect
        this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
        if (this.trail.length > 5) this.trail.shift();
    }

    draw(ctx, isRewinding = false) {
        // Draw rewind afterimages
        if (this.trail.length > 0) {
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                t.alpha *= 0.8;
                ctx.save();
                ctx.globalAlpha = t.alpha * 0.5;
                ctx.fillStyle = CONSTANTS.COLORS.CYAN;
                ctx.fillRect(Math.floor(t.x), Math.floor(t.y), this.width, this.height);
                ctx.restore();
            }
            this.trail = this.trail.filter(t => t.alpha > 0.05);
        }

        // Invulnerability flicker
        if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
            return; // Skip rendering frame for flicker effect
        }

        const px = Math.floor(this.x);
        const py = Math.floor(this.y);

        ctx.save();

        // If rewinding, add chromatic glow effect
        if (isRewinding) {
            ctx.shadowColor = CONSTANTS.COLORS.CYAN;
            ctx.shadowBlur = 10;
        }

        // Direction orientation
        const isFlipped = this.facing === -1;
        if (isFlipped) {
            ctx.translate(px + this.width, py);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(px, py);
        }

        // Draw Little Robot Character (Pixel Art)
        // 1. Antenna
        ctx.fillStyle = isRewinding ? CONSTANTS.COLORS.PURPLE_BRIGHT : CONSTANTS.COLORS.CYAN;
        ctx.fillRect(9, 0, 2, 4); // Stem
        ctx.fillRect(8, 0, 4, 2); // Blinking top light

        // 2. Head / Chassis
        ctx.fillStyle = '#1e293b'; // Dark titanium
        ctx.fillRect(4, 4, 12, 9);
        ctx.fillStyle = '#0f172a'; // Shading
        ctx.fillRect(4, 11, 12, 2);

        // 3. Cyber Visor / Eye
        const eyeColor = isRewinding ? CONSTANTS.COLORS.PURPLE_BRIGHT : (this.isDead ? CONSTANTS.COLORS.RED : CONSTANTS.COLORS.CYAN);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(10, 6, 5, 4);
        ctx.fillStyle = '#ffffff'; // Specular highlight
        ctx.fillRect(12, 7, 2, 2);

        // 4. Neck / Core Joint
        ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
        ctx.fillRect(7, 13, 6, 2);

        // 5. Torso / Power Battery
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, 15, 14, 8);
        // Chest glowing power cell
        ctx.fillStyle = isRewinding ? CONSTANTS.COLORS.PURPLE : CONSTANTS.COLORS.CYAN;
        ctx.fillRect(7, 17, 6, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 18, 4, 1);

        // 6. Thrusters / Legs
        ctx.fillStyle = '#334155';
        if (this.state === 'RUN') {
            const step = this.animFrame % 2;
            if (step === 0) {
                ctx.fillRect(4, 23, 4, 5); // Left leg forward
                ctx.fillRect(12, 22, 4, 6); // Right leg back
            } else {
                ctx.fillRect(4, 22, 4, 6);
                ctx.fillRect(12, 23, 4, 5);
            }
        } else if (this.state === 'JUMP' || this.state === 'FALL') {
            // Legs tucked up with jet flare
            ctx.fillRect(5, 23, 4, 3);
            ctx.fillRect(11, 23, 4, 3);
            // Jet exhaust flame
            ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
            ctx.fillRect(6, 26, 2, 2 + Math.floor(Math.random() * 3));
            ctx.fillRect(12, 26, 2, 2 + Math.floor(Math.random() * 3));
        } else {
            // Idle stance
            const bob = (this.animFrame === 1) ? 1 : 0;
            ctx.fillRect(4, 23 + bob, 4, 5 - bob);
            ctx.fillRect(12, 23 + bob, 4, 5 - bob);
        }

        // 7. Shoulders / Arm
        ctx.fillStyle = '#475569';
        ctx.fillRect(isFlipped ? 13 : 2, 16, 3, 6);

        ctx.restore();
    }
}
