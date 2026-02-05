// ============================================
// ENEMIES - Goomba, Koopa, and shell behavior
// ============================================

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = -1.5; // Move left by default
        this.vy = 0;
        this.direction = 'left';
        this.alive = true;
        this.active = false; // Only active when on screen
        this.activated = false; // Has been activated at least once
        this.animFrame = 0;
        this.animTimer = 0;
        this.onGround = false;
        this.hitWall = false;
        this.fellOff = false;
        this.isPlayer = false;

        // Type-specific properties
        switch (type) {
            case 'goomba':
                this.width = 20;
                this.height = 20;
                this.stompable = true;
                this.squished = false;
                this.squishTimer = 0;
                break;
            case 'koopa':
                this.width = 20;
                this.height = 28;
                this.stompable = true;
                this.inShell = false;
                this.shellMoving = false;
                this.shellSpeed = 8;
                break;
            case 'koopa_red':
                this.width = 20;
                this.height = 28;
                this.stompable = true;
                this.inShell = false;
                this.shellMoving = false;
                this.shellSpeed = 8;
                this.turnsAtEdge = true; // Red koopas don't walk off edges
                break;
        }
    }

    update(game) {
        if (!this.alive) return;

        // Activate when near the screen
        const screenLeft = Camera.x - 64;
        const screenRight = Camera.x + CANVAS_WIDTH + 64;

        if (!this.activated) {
            if (this.x > screenLeft && this.x < screenRight) {
                this.active = true;
                this.activated = true;
            }
        }

        if (!this.active) return;

        // Squished goomba countdown
        if (this.squished) {
            this.squishTimer--;
            if (this.squishTimer <= 0) {
                this.alive = false;
            }
            return;
        }

        // Animation
        this.animTimer++;
        if (this.animTimer > 10) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }

        // Shell behavior
        if (this.inShell && !this.shellMoving) {
            // Stationary shell - don't move
            this.vx = 0;
        } else if (this.inShell && this.shellMoving) {
            // Moving shell
            // vx is already set
        } else {
            // Normal movement - direction based on vx
            this.direction = this.vx < 0 ? 'left' : 'right';
        }

        // Red koopa edge detection
        if (this.turnsAtEdge && this.onGround && !this.inShell) {
            const checkX = this.vx > 0 ? this.x + this.width + 2 : this.x - 2;
            const checkY = this.y + this.height + 4;
            const tileBelow = Collision.getTile(game.currentLevel, checkX, checkY);
            if (!Collision.isSolid(tileBelow)) {
                this.vx = -this.vx;
                this.direction = this.vx < 0 ? 'left' : 'right';
            }
        }

        // Apply gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        // Resolve collisions
        Collision.resolveEntityTileCollision(this, game.currentLevel, null);

        // Reverse direction on wall hit
        if (this.hitWall) {
            this.vx = -this.vx;
            this.direction = this.vx < 0 ? 'left' : 'right';
        }

        // Remove if fell off level
        if (this.fellOff) {
            this.alive = false;
        }

        // Remove if way off screen (left)
        if (this.x < Camera.x - 200) {
            this.alive = false;
        }
    }

    stomp(player) {
        if (this.type === 'goomba') {
            this.squished = true;
            this.squishTimer = 30;
            this.height = 10;
            this.y += 10;
            AudioSystem.stomp();
            return 100;
        } else if (this.type === 'koopa' || this.type === 'koopa_red') {
            if (!this.inShell) {
                // Enter shell
                this.inShell = true;
                this.shellMoving = false;
                this.vx = 0;
                this.height = 16;
                this.y += 12;
                AudioSystem.stomp();
                return 100;
            } else if (!this.shellMoving) {
                // Kick shell
                this.shellMoving = true;
                if (player.x < this.x) {
                    this.vx = this.shellSpeed;
                } else {
                    this.vx = -this.shellSpeed;
                }
                AudioSystem.kick();
                return 200;
            }
        }
        return 0;
    }

    hitByShell() {
        this.alive = false;
        this.vy = -5;
        return 200;
    }

    hitFromBelow() {
        this.alive = false;
        this.vy = -5;
        this.vx = 2;
        AudioSystem.stomp();
        return 100;
    }

    draw(ctx, cameraX) {
        if (!this.alive || !this.active) return;

        const drawX = Math.round(this.x - cameraX);
        const drawY = Math.round(this.y);

        let sprite;

        if (this.type === 'goomba') {
            const frame = this.squished ? 2 : this.animFrame;
            sprite = SpriteSheet.getEnemySprite('goomba', frame, this.direction);
        } else if (this.type === 'koopa' || this.type === 'koopa_red') {
            if (this.inShell) {
                sprite = SpriteSheet.getEnemySprite('koopa_shell', 0, this.direction);
            } else {
                sprite = SpriteSheet.getEnemySprite('koopa', this.animFrame, this.direction);
            }
        }

        if (sprite) {
            const offsetX = (this.width - sprite.width) / 2;
            const offsetY = this.height - sprite.height;
            ctx.drawImage(sprite, drawX + offsetX, drawY + offsetY);
        }
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

// ---- FIREBALL ----
class Fireball {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.vx = direction === 'right' ? 6 : -6;
        this.vy = 0;
        this.width = 8;
        this.height = 8;
        this.alive = true;
        this.onGround = false;
        this.hitWall = false;
        this.fellOff = false;
        this.isPlayer = false;
        this.bounceForce = -5;
        this.lifetime = 180;
    }

    update(game) {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.alive = false;
            return;
        }

        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        Collision.resolveEntityTileCollision(this, game.currentLevel, null);

        // Bounce on ground
        if (this.onGround) {
            this.vy = this.bounceForce;
        }

        // Die on wall hit
        if (this.hitWall || this.fellOff) {
            this.alive = false;
        }

        // Check if off screen
        if (this.x < Camera.x - 50 || this.x > Camera.x + CANVAS_WIDTH + 50) {
            this.alive = false;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;
        ctx.save();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 4, this.y + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x - cameraX + 4, this.y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
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
