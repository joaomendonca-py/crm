// ============================================
// PLAYER - Mario character with full physics
// ============================================

class Player {
    constructor(x, y) {
        this.reset(x, y);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 24;
        this.vx = 0;
        this.vy = 0;
        this.direction = 'right';
        this.onGround = false;
        this.isPlayer = true;
        this.big = false;
        this.hasFire = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.starPower = false;
        this.starTimer = 0;
        this.dead = false;
        this.deathTimer = 0;
        this.fellOff = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.state = 'stand'; // stand, run, jump, die
        this.hitWall = false;
        this.jumpHeld = false;
        this.jumpTimer = 0;
        this.maxJumpTime = 22;
        this.canJump = true;
        this.shrinking = false;
        this.shrinkTimer = 0;
        this.growing = false;
        this.growTimer = 0;
        this.pipeAnimation = false;
        this.flagAnimation = false;
        this.flagY = 0;

        // Physics constants
        this.accel = 0.15;
        this.decel = 0.2;
        this.maxSpeed = 3.5;
        this.runMaxSpeed = 5.5;
        this.jumpForce = -11;
        this.bigJumpForce = -12.5;
    }

    grow() {
        if (!this.big) {
            this.big = true;
            this.height = 40;
            this.y -= 16;
            this.growing = true;
            this.growTimer = 30;
            AudioSystem.powerUp();
        }
    }

    shrink() {
        if (this.big) {
            this.big = false;
            this.hasFire = false;
            this.height = 24;
            this.shrinking = true;
            this.shrinkTimer = 30;
            this.invincible = true;
            this.invincibleTimer = 90;
            AudioSystem.powerDown();
        } else {
            this.die();
        }
    }

    die() {
        if (this.dead || this.invincible) return;
        this.dead = true;
        this.state = 'die';
        this.vy = -10;
        this.vx = 0;
        this.deathTimer = 120;
        AudioSystem.die();
    }

    getFirePower() {
        if (this.big) {
            this.hasFire = true;
            AudioSystem.powerUp();
        }
    }

    activateStarPower() {
        this.starPower = true;
        this.starTimer = 600; // 10 seconds
        this.invincible = true;
        this.invincibleTimer = 600;
    }

    update(game) {
        if (this.dead) {
            this.deathTimer--;
            this.vy += GRAVITY;
            this.y += this.vy;
            return;
        }

        if (this.growing) {
            this.growTimer--;
            if (this.growTimer <= 0) this.growing = false;
            return;
        }

        if (this.shrinking) {
            this.shrinkTimer--;
            if (this.shrinkTimer <= 0) this.shrinking = false;
            return;
        }

        if (this.flagAnimation) {
            this.updateFlagAnimation(game);
            return;
        }

        if (this.pipeAnimation) return;

        // Invincibility timer
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.starPower = false;
            }
        }

        // Star power timer
        if (this.starPower) {
            this.starTimer--;
            if (this.starTimer <= 0) {
                this.starPower = false;
            }
        }

        // Horizontal movement
        const maxSpd = Input.isDown('run') ? this.runMaxSpeed : this.maxSpeed;

        if (Input.isDown('left')) {
            this.vx -= this.accel;
            this.direction = 'left';
            if (this.vx < -maxSpd) this.vx = -maxSpd;
        } else if (Input.isDown('right')) {
            this.vx += this.accel;
            this.direction = 'right';
            if (this.vx > maxSpd) this.vx = maxSpd;
        } else {
            // Decelerate
            if (this.vx > 0) {
                this.vx -= this.decel;
                if (this.vx < 0) this.vx = 0;
            } else if (this.vx < 0) {
                this.vx += this.decel;
                if (this.vx > 0) this.vx = 0;
            }
        }

        // Jumping
        if (Input.wasPressed('up') && this.onGround && this.canJump) {
            this.vy = this.big ? this.bigJumpForce : this.jumpForce;
            this.onGround = false;
            this.jumpHeld = true;
            this.jumpTimer = 0;
            this.canJump = false;
            if (this.big) {
                AudioSystem.bigJump();
            } else {
                AudioSystem.jump();
            }
        }

        if (!Input.isDown('up')) {
            this.canJump = true;
            this.jumpHeld = false;
        }

        // Variable jump height (hold jump for higher)
        if (this.jumpHeld && Input.isDown('up') && this.jumpTimer < this.maxJumpTime) {
            this.jumpTimer++;
            this.vy -= 0.45;
        }

        // Apply gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        // Resolve collisions with level
        Collision.resolveEntityTileCollision(this, game.currentLevel, game);

        // Prevent going left of camera
        if (this.x < Camera.x) {
            this.x = Camera.x;
            this.vx = 0;
        }

        // Update animation
        this.updateAnimation();

        // Check if fell off the level
        if (this.fellOff) {
            this.die();
            this.fellOff = false;
        }
    }

    updateAnimation() {
        if (this.dead) {
            this.state = 'die';
            return;
        }

        if (!this.onGround) {
            this.state = 'jump';
        } else if (Math.abs(this.vx) > 0.3) {
            this.state = 'run';
            this.animTimer++;
            if (this.animTimer > (8 - Math.abs(this.vx))) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 3;
            }
        } else {
            this.state = 'stand';
            this.animFrame = 0;
        }
    }

    updateFlagAnimation(game) {
        if (this.flagY < this.flagTargetY) {
            this.flagY += 3;
            this.y = this.flagY;
        } else {
            // Walk to castle
            this.flagAnimation = false;
            this.direction = 'right';
            this.vx = 2;
            this.state = 'run';

            // Complete level after short delay
            setTimeout(() => {
                game.completeLevel();
            }, 1500);
        }
    }

    startFlagAnimation(flagX, flagBottomY) {
        this.flagAnimation = true;
        this.x = flagX - 8;
        this.flagY = this.y;
        this.flagTargetY = flagBottomY - this.height;
        this.vx = 0;
        this.vy = 0;
        this.state = 'stand';
        AudioSystem.flagpole();
    }

    draw(ctx, cameraX) {
        if (this.dead && this.deathTimer <= 0) return;

        // Invincibility blink
        if (this.invincible && !this.starPower && Math.floor(this.invincibleTimer / 3) % 2 === 0) {
            return;
        }

        ctx.save();

        // Star power flash effect
        if (this.starPower) {
            const colors = ['#ff0', '#0f0', '#f00', '#00f'];
            const colorIndex = Math.floor(Date.now() / 50) % colors.length;
            ctx.shadowColor = colors[colorIndex];
            ctx.shadowBlur = 10;
        }

        // Growing/Shrinking flash
        if (this.growing || this.shrinking) {
            if (Math.floor(Date.now() / 50) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        const sprite = SpriteSheet.getMarioSprite(this.state, this.animFrame, this.direction, this.big);
        const drawX = Math.round(this.x - cameraX);
        const drawY = Math.round(this.y);

        // Center sprite on hitbox
        const offsetX = (this.width - sprite.width) / 2;
        const offsetY = this.height - sprite.height;

        ctx.drawImage(sprite, drawX + offsetX, drawY + offsetY);

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
