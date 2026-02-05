// ============================================
// ITEMS - Coins, Mushrooms, Stars, Fire Flowers
// ============================================

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.width = 20;
        this.height = 20;
        this.alive = true;
        this.collected = false;
        this.onGround = false;
        this.hitWall = false;
        this.fellOff = false;
        this.isPlayer = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.emerging = false;
        this.emergeY = 0;
        this.emergeTargetY = 0;

        switch (type) {
            case 'coin':
                this.width = 16;
                this.height = 16;
                break;
            case 'mushroom':
                this.vx = 2;
                break;
            case '1up':
                this.vx = 2;
                break;
            case 'star':
                this.vx = 2;
                break;
            case 'fireflower':
                this.vx = 0; // Fire flowers don't move
                break;
        }
    }

    startEmerge(fromY) {
        this.emerging = true;
        this.emergeY = fromY;
        this.y = fromY;
        this.emergeTargetY = fromY - TILE_SIZE;
    }

    update(game) {
        if (!this.alive || this.collected) return;

        // Animation
        this.animTimer++;
        if (this.animTimer > 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 3;
        }

        // Emerging from block animation
        if (this.emerging) {
            this.y -= 1.5;
            if (this.y <= this.emergeTargetY) {
                this.y = this.emergeTargetY;
                this.emerging = false;
            }
            return;
        }

        // Static coins don't need physics
        if (this.type === 'coin') return;

        // Fire flowers don't move
        if (this.type === 'fireflower') return;

        // Apply gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        // Resolve collisions
        Collision.resolveEntityTileCollision(this, game.currentLevel, null);

        // Reverse on wall
        if (this.hitWall) {
            this.vx = -this.vx;
        }

        // Star bounces
        if (this.type === 'star' && this.onGround) {
            this.vy = -8;
        }

        // Remove if fell off
        if (this.fellOff) {
            this.alive = false;
        }

        // Remove if way off screen
        if (this.x < Camera.x - 200 || this.x > Camera.x + CANVAS_WIDTH + 200) {
            this.alive = false;
        }
    }

    collect(player, game) {
        if (this.collected || !this.alive || this.emerging) return;

        this.collected = true;
        this.alive = false;

        switch (this.type) {
            case 'coin':
                game.addScore(200);
                game.coins++;
                if (game.coins >= 100) {
                    game.coins = 0;
                    game.lives++;
                    AudioSystem.oneUp();
                } else {
                    AudioSystem.coin();
                }
                game.particles.emitScore(this.x, this.y, '200');
                break;

            case 'mushroom':
                if (!player.big) {
                    player.grow();
                    game.addScore(1000);
                    game.particles.emitScore(this.x, this.y, '1000');
                } else {
                    game.addScore(1000);
                    game.particles.emitScore(this.x, this.y, '1000');
                }
                break;

            case '1up':
                game.lives++;
                AudioSystem.oneUp();
                game.particles.emitScore(this.x, this.y, '1UP');
                break;

            case 'star':
                player.activateStarPower();
                game.addScore(1000);
                AudioSystem.powerUp();
                game.particles.emitScore(this.x, this.y, '1000');
                break;

            case 'fireflower':
                if (!player.big) {
                    player.grow();
                } else {
                    player.getFirePower();
                }
                game.addScore(1000);
                game.particles.emitScore(this.x, this.y, '1000');
                break;
        }
    }

    draw(ctx, cameraX) {
        if (!this.alive || this.collected) return;

        const drawX = Math.round(this.x - cameraX);
        const drawY = Math.round(this.y);

        // Clip if emerging
        if (this.emerging) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(drawX - 2, drawY, this.width + 4, this.emergeY - this.y + 2);
            ctx.clip();
        }

        const sprite = SpriteSheet.getItemSprite(this.type, this.animFrame);
        if (sprite) {
            const offsetX = (this.width - sprite.width) / 2;
            const offsetY = this.height - sprite.height;
            ctx.drawImage(sprite, drawX + offsetX, drawY + offsetY);
        }

        if (this.emerging) {
            ctx.restore();
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

// ---- COIN BLOCK DATA ----
// Tracks which blocks have been used
const BlockState = {
    usedBlocks: new Set(),

    markUsed(tx, ty) {
        this.usedBlocks.add(`${tx},${ty}`);
    },

    isUsed(tx, ty) {
        return this.usedBlocks.has(`${tx},${ty}`);
    },

    reset() {
        this.usedBlocks.clear();
    }
};
