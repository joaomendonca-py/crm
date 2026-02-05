// ============================================
// GAME ENGINE - Physics, Camera, Input, Collisions
// ============================================

const TILE_SIZE = 32;
const GRAVITY = 0.6;
const MAX_FALL_SPEED = 12;
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// ---- INPUT HANDLER ----
const Input = {
    keys: {},
    pressed: {},

    init() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.pressed[e.code] = true;
            }
            this.keys[e.code] = true;
            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    },

    isDown(key) {
        // Support multiple key bindings
        const bindings = {
            'left': ['ArrowLeft', 'KeyA'],
            'right': ['ArrowRight', 'KeyD'],
            'up': ['ArrowUp', 'KeyW', 'Space'],
            'down': ['ArrowDown', 'KeyS'],
            'run': ['ShiftLeft', 'ShiftRight'],
            'enter': ['Enter'],
            'pause': ['KeyP'],
        };

        if (bindings[key]) {
            return bindings[key].some(k => this.keys[k]);
        }
        return this.keys[key];
    },

    wasPressed(key) {
        const bindings = {
            'left': ['ArrowLeft', 'KeyA'],
            'right': ['ArrowRight', 'KeyD'],
            'up': ['ArrowUp', 'KeyW', 'Space'],
            'down': ['ArrowDown', 'KeyS'],
            'run': ['ShiftLeft', 'ShiftRight'],
            'enter': ['Enter'],
            'pause': ['KeyP'],
        };

        if (bindings[key]) {
            return bindings[key].some(k => this.pressed[k]);
        }
        return this.pressed[key];
    },

    clearPressed() {
        this.pressed = {};
    }
};

// ---- CAMERA ----
const Camera = {
    x: 0,
    y: 0,
    targetX: 0,
    levelWidth: 0,
    deadZone: CANVAS_WIDTH * 0.35,

    reset() {
        this.x = 0;
        this.y = 0;
    },

    update(playerX) {
        // Camera follows player but only scrolls right (classic Mario behavior)
        this.targetX = playerX - this.deadZone;

        if (this.targetX > this.x) {
            this.x = this.targetX;
        }

        // Clamp camera
        this.x = Math.max(0, Math.min(this.x, this.levelWidth * TILE_SIZE - CANVAS_WIDTH));
    }
};

// ---- COLLISION SYSTEM ----
const Collision = {
    // Check if two rectangles overlap
    rectOverlap(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },

    // Get tile at pixel position
    getTile(level, px, py) {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        if (tx < 0 || ty < 0 || ty >= level.grid.length || tx >= level.grid[0].length) {
            return 0;
        }
        return level.grid[ty][tx];
    },

    // Check if a tile is solid
    isSolid(tile) {
        return tile === 1 || tile === 2 || tile === 3 || tile === 4 ||
               tile === 5 || tile === 6 || tile === 7 || tile === 8 ||
               tile === 9 || tile === 10;
    },

    // Resolve entity collision with tiles
    resolveEntityTileCollision(entity, level, game) {
        // Horizontal collision
        let newX = entity.x + entity.vx;
        const hRect = {
            x: newX,
            y: entity.y,
            width: entity.width,
            height: entity.height
        };

        let hCollision = false;
        // Check corners and midpoints
        const checkPointsH = [
            { x: hRect.x, y: hRect.y + 2 },
            { x: hRect.x + hRect.width, y: hRect.y + 2 },
            { x: hRect.x, y: hRect.y + hRect.height - 2 },
            { x: hRect.x + hRect.width, y: hRect.y + hRect.height - 2 },
            { x: hRect.x, y: hRect.y + hRect.height / 2 },
            { x: hRect.x + hRect.width, y: hRect.y + hRect.height / 2 },
        ];

        for (const pt of checkPointsH) {
            const tile = this.getTile(level, pt.x, pt.y);
            if (this.isSolid(tile)) {
                hCollision = true;
                break;
            }
        }

        if (hCollision) {
            // Snap to tile edge
            if (entity.vx > 0) {
                newX = Math.floor((newX + entity.width) / TILE_SIZE) * TILE_SIZE - entity.width - 0.1;
            } else if (entity.vx < 0) {
                newX = Math.ceil(newX / TILE_SIZE) * TILE_SIZE + 0.1;
            }
            entity.vx = 0;
            entity.hitWall = true;
        } else {
            entity.hitWall = false;
        }
        entity.x = newX;

        // Vertical collision
        let newY = entity.y + entity.vy;
        const vRect = {
            x: entity.x + 2,
            y: newY,
            width: entity.width - 4,
            height: entity.height
        };

        let vCollision = false;
        let hitCeiling = false;
        const checkPointsV = [
            { x: vRect.x, y: vRect.y },
            { x: vRect.x + vRect.width, y: vRect.y },
            { x: vRect.x, y: vRect.y + vRect.height },
            { x: vRect.x + vRect.width, y: vRect.y + vRect.height },
            { x: vRect.x + vRect.width / 2, y: vRect.y },
            { x: vRect.x + vRect.width / 2, y: vRect.y + vRect.height },
        ];

        for (const pt of checkPointsV) {
            const tile = this.getTile(level, pt.x, pt.y);
            if (this.isSolid(tile)) {
                vCollision = true;
                if (pt.y <= entity.y) {
                    hitCeiling = true;
                    // Handle block hit
                    const tx = Math.floor(pt.x / TILE_SIZE);
                    const ty = Math.floor(pt.y / TILE_SIZE);
                    if (game && entity.isPlayer) {
                        game.onBlockHit(tx, ty, entity.big);
                    }
                }
                break;
            }
        }

        if (vCollision) {
            if (entity.vy > 0) {
                // Landing
                newY = Math.floor((newY + entity.height) / TILE_SIZE) * TILE_SIZE - entity.height;
                entity.onGround = true;
                entity.vy = 0;
            } else if (entity.vy < 0) {
                // Hit ceiling
                newY = Math.ceil(newY / TILE_SIZE) * TILE_SIZE;
                entity.vy = 0;
            }
        } else {
            entity.onGround = false;
        }
        entity.y = newY;

        // Check if entity fell out of level
        if (entity.y > level.grid.length * TILE_SIZE + 100) {
            entity.fellOff = true;
        }
    }
};

// ---- PARTICLE SYSTEM ----
class Particle {
    constructor(x, y, vx, vy, type, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.alive = true;
        this.rotation = 0;
        this.rotSpeed = (Math.random() - 0.5) * 0.3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += GRAVITY * 0.5;
        this.rotation += this.rotSpeed;
        this.lifetime--;
        if (this.lifetime <= 0) this.alive = false;
    }

    draw(ctx, cameraX) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x - cameraX, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'brick') {
            const sprite = SpriteSheet.getParticleSprite('brick');
            ctx.drawImage(sprite, -4, -4);
        } else if (this.type === 'coin_sparkle') {
            ctx.fillStyle = '#ffd700';
            const alpha = this.lifetime / this.maxLifetime;
            ctx.globalAlpha = alpha;
            ctx.fillRect(-2, -2, 4, 4);
            ctx.globalAlpha = 1;
        } else if (this.type === 'score') {
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            const alpha = this.lifetime / this.maxLifetime;
            ctx.globalAlpha = alpha;
            ctx.fillText(this.text || '', 0, 0);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, vx, vy, type, lifetime) {
        this.particles.push(new Particle(x, y, vx, vy, type, lifetime));
    }

    emitBrickBreak(x, y) {
        for (let i = 0; i < 4; i++) {
            const vx = (i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2);
            const vy = -(4 + Math.random() * 4) - (i < 2 ? 2 : 0);
            this.emit(x + (i % 2) * 16, y + Math.floor(i / 2) * 16, vx, vy, 'brick', 60);
        }
    }

    emitCoinFromBlock(x, y) {
        const p = new Particle(x + 8, y - 16, 0, -8, 'coin_collect', 30);
        p.draw = function(ctx, cameraX) {
            if (!this.alive) return;
            const frame = Math.floor((this.maxLifetime - this.lifetime) / 5) % 4;
            const sprite = SpriteSheet.getItemSprite('coin', frame < 3 ? frame : 1);
            ctx.drawImage(sprite, this.x - cameraX, this.y);
        };
        this.particles.push(p);
    }

    emitScore(x, y, text) {
        const p = new Particle(x, y, 0, -1.5, 'score', 40);
        p.text = text;
        this.particles.push(p);
    }

    update() {
        for (const p of this.particles) {
            p.update();
        }
        this.particles = this.particles.filter(p => p.alive);
    }

    draw(ctx, cameraX) {
        for (const p of this.particles) {
            p.draw(ctx, cameraX);
        }
    }

    clear() {
        this.particles = [];
    }
}
