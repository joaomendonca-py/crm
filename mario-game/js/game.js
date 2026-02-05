// ============================================
// MAIN GAME - Core loop, state management, rendering
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.state = 'title'; // title, playing, paused, gameover, levelcomplete, dying
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.player = null;
        this.fireballs = [];
        this.particles = new ParticleSystem();
        this.timeRemaining = 400;
        this.timeTimer = 0;

        // UI elements
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.levelCompleteScreen = document.getElementById('level-complete-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.scoreDisplay = document.getElementById('score-value');
        this.coinsDisplay = document.getElementById('coins-value');
        this.worldDisplay = document.getElementById('world-value');
        this.timeDisplay = document.getElementById('time-value');
        this.livesDisplay = document.getElementById('lives-value');

        // Initialize systems
        Input.init();
        AudioSystem.init();

        // Load levels
        this.levels = LevelData.getLevels();

        // Start game loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedStep = 1000 / 60; // 60 FPS
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    // ---- GAME LOOP ----
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Avoid spiral of death
        this.accumulator += Math.min(deltaTime, 100);

        while (this.accumulator >= this.fixedStep) {
            this.update();
            Input.clearPressed();
            this.accumulator -= this.fixedStep;
        }

        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    // ---- UPDATE ----
    update() {
        switch (this.state) {
            case 'title':
                if (Input.wasPressed('enter')) {
                    this.startGame();
                }
                break;

            case 'playing':
                this.updatePlaying();
                break;

            case 'paused':
                if (Input.wasPressed('pause')) {
                    this.resumeGame();
                }
                break;

            case 'gameover':
                if (Input.wasPressed('enter')) {
                    this.resetGame();
                }
                break;

            case 'dying':
                this.player.update(this);
                if (this.player.deathTimer <= -60) {
                    this.onPlayerDeath();
                }
                break;

            case 'levelcomplete':
                // Wait for animation then auto-advance
                break;
        }
    }

    updatePlaying() {
        // Pause
        if (Input.wasPressed('pause')) {
            this.pauseGame();
            return;
        }

        // Resume audio context on first interaction
        AudioSystem.resume();

        // Update timer
        this.timeTimer++;
        if (this.timeTimer >= 24) { // ~2.5 seconds per game second
            this.timeTimer = 0;
            this.timeRemaining--;
            if (this.timeRemaining <= 0) {
                this.player.die();
                this.state = 'dying';
                return;
            }
        }

        // Update player
        this.player.update(this);

        // Check if player died
        if (this.player.dead && this.state === 'playing') {
            this.state = 'dying';
            return;
        }

        // Update camera
        Camera.levelWidth = this.currentLevel.width;
        Camera.update(this.player.x);

        // Update enemies
        for (const enemy of this.currentLevel.enemies) {
            enemy.update(this);
        }

        // Remove dead enemies
        this.currentLevel.enemies = this.currentLevel.enemies.filter(e => e.alive || (e.squished && e.squishTimer > 0));

        // Update items
        for (const item of this.currentLevel.items) {
            item.update(this);
        }

        // Update fireballs
        for (const fb of this.fireballs) {
            fb.update(this);
        }
        this.fireballs = this.fireballs.filter(fb => fb.alive);

        // Update particles
        this.particles.update();

        // ---- COLLISION CHECKS ----
        this.checkPlayerEnemyCollisions();
        this.checkPlayerItemCollisions();
        this.checkFireballEnemyCollisions();
        this.checkShellEnemyCollisions();
        this.checkFlagCollision();

        // Fireball shooting
        if (this.player.hasFire && Input.wasPressed('run') && this.fireballs.length < 2) {
            const fbX = this.player.direction === 'right' ? this.player.x + this.player.width : this.player.x - 8;
            const fbY = this.player.y + this.player.height / 2;
            this.fireballs.push(new Fireball(fbX, fbY, this.player.direction));
            AudioSystem.fireball();
        }

        // Update UI
        this.updateUI();
    }

    // ---- COLLISION DETECTION ----
    checkPlayerEnemyCollisions() {
        const playerBounds = this.player.getBounds();

        for (const enemy of this.currentLevel.enemies) {
            if (!enemy.alive || !enemy.active || enemy.squished) continue;

            // Skip stationary shells
            if (enemy.inShell && !enemy.shellMoving) {
                // Can kick shell
                const eb = enemy.getBounds();
                if (Collision.rectOverlap(playerBounds, eb)) {
                    const score = enemy.stomp(this.player);
                    this.addScore(score);
                    this.particles.emitScore(enemy.x, enemy.y - 10, String(score));
                }
                continue;
            }

            const enemyBounds = enemy.getBounds();
            if (!Collision.rectOverlap(playerBounds, enemyBounds)) continue;

            // Check if player is jumping on enemy
            if (this.player.vy > 0 && this.player.y + this.player.height - 8 < enemy.y + enemy.height / 2 && enemy.stompable) {
                // Stomp!
                const score = enemy.stomp(this.player);
                this.addScore(score);
                this.particles.emitScore(enemy.x, enemy.y - 10, String(score));
                // Bounce
                this.player.vy = -7;
                this.player.onGround = false;
            } else if (this.player.starPower) {
                // Star power kills enemy
                enemy.hitFromBelow();
                this.addScore(200);
                this.particles.emitScore(enemy.x, enemy.y - 10, '200');
            } else {
                // Player takes damage
                this.player.shrink();
            }
        }
    }

    checkPlayerItemCollisions() {
        const playerBounds = this.player.getBounds();

        for (const item of this.currentLevel.items) {
            if (!item.alive || item.collected || item.emerging) continue;
            const itemBounds = item.getBounds();
            if (Collision.rectOverlap(playerBounds, itemBounds)) {
                item.collect(this.player, this);
            }
        }
    }

    checkFireballEnemyCollisions() {
        for (const fb of this.fireballs) {
            if (!fb.alive) continue;
            const fbBounds = fb.getBounds();

            for (const enemy of this.currentLevel.enemies) {
                if (!enemy.alive || !enemy.active || enemy.squished) continue;
                const eb = enemy.getBounds();
                if (Collision.rectOverlap(fbBounds, eb)) {
                    enemy.hitFromBelow();
                    fb.alive = false;
                    this.addScore(200);
                    this.particles.emitScore(enemy.x, enemy.y - 10, '200');
                    break;
                }
            }
        }
    }

    checkShellEnemyCollisions() {
        for (const shell of this.currentLevel.enemies) {
            if (!shell.alive || !shell.inShell || !shell.shellMoving) continue;
            const shellBounds = shell.getBounds();

            for (const enemy of this.currentLevel.enemies) {
                if (enemy === shell || !enemy.alive || !enemy.active || enemy.squished) continue;
                const eb = enemy.getBounds();
                if (Collision.rectOverlap(shellBounds, eb)) {
                    const score = enemy.hitByShell();
                    this.addScore(score);
                    this.particles.emitScore(enemy.x, enemy.y - 10, String(score));
                }
            }
        }
    }

    checkFlagCollision() {
        if (!this.currentLevel.flagPos) return;
        const fp = this.currentLevel.flagPos;
        const flagX = fp.x * TILE_SIZE;
        const flagTopY = fp.y * TILE_SIZE;
        const flagBottomY = (this.currentLevel.height - 2) * TILE_SIZE;

        if (this.player.x + this.player.width >= flagX &&
            this.player.x <= flagX + TILE_SIZE) {
            this.player.startFlagAnimation(flagX, flagBottomY);
            this.state = 'levelcomplete';

            // Score bonus based on time
            const timeBonus = this.timeRemaining * 50;
            this.addScore(timeBonus);
            AudioSystem.levelComplete();
        }
    }

    // ---- BLOCK HIT HANDLING ----
    onBlockHit(tx, ty, isBig) {
        if (ty < 0 || ty >= this.currentLevel.grid.length) return;
        if (tx < 0 || tx >= this.currentLevel.grid[0].length) return;

        const tile = this.currentLevel.grid[ty][tx];
        const blockKey = `${tx},${ty}`;

        if (tile === 3 || tile === 4 || tile === 5) {
            // Question block
            if (BlockState.isUsed(tx, ty)) return;
            BlockState.markUsed(tx, ty);
            this.currentLevel.grid[ty][tx] = 10; // Used block

            const contents = this.currentLevel.blockContents[blockKey] || 'coin';
            this.spawnFromBlock(tx, ty, contents);
            AudioSystem.coin();
        } else if (tile === 2) {
            // Brick block
            if (isBig) {
                // Break the brick
                this.currentLevel.grid[ty][tx] = 0;
                this.particles.emitBrickBreak(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16);
                AudioSystem.breakBlock();
            } else {
                // Bump animation (small mario can't break bricks)
                AudioSystem.bump();
            }
        } else if (tile === 14) {
            // Brick with coin inside
            if (BlockState.isUsed(tx, ty)) {
                // Already used, treat as regular brick
                if (isBig) {
                    this.currentLevel.grid[ty][tx] = 0;
                    this.particles.emitBrickBreak(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16);
                    AudioSystem.breakBlock();
                } else {
                    AudioSystem.bump();
                }
            } else {
                BlockState.markUsed(tx, ty);
                this.currentLevel.grid[ty][tx] = 10;
                this.spawnFromBlock(tx, ty, 'coin');
                AudioSystem.coin();
            }
        }

        // Bump enemies on top of hit block
        for (const enemy of this.currentLevel.enemies) {
            if (!enemy.alive || !enemy.active) continue;
            const etx = Math.floor((enemy.x + enemy.width / 2) / TILE_SIZE);
            const ety = Math.floor(enemy.y / TILE_SIZE);
            if (etx === tx && ety === ty - 1) {
                enemy.hitFromBelow();
                this.addScore(100);
                this.particles.emitScore(enemy.x, enemy.y - 10, '100');
            }
        }
    }

    spawnFromBlock(tx, ty, contents) {
        const x = tx * TILE_SIZE + 6;
        const y = ty * TILE_SIZE;

        switch (contents) {
            case 'coin':
                this.coins++;
                this.addScore(200);
                this.particles.emitCoinFromBlock(tx * TILE_SIZE, ty * TILE_SIZE);
                this.particles.emitScore(tx * TILE_SIZE, ty * TILE_SIZE - 20, '200');
                if (this.coins >= 100) {
                    this.coins = 0;
                    this.lives++;
                    AudioSystem.oneUp();
                }
                break;
            case 'mushroom':
                const mush = new Item(x, y, this.player.big ? 'fireflower' : 'mushroom');
                mush.startEmerge(y);
                this.currentLevel.items.push(mush);
                break;
            case 'fireflower':
                const flower = new Item(x, y, this.player.big ? 'fireflower' : 'mushroom');
                flower.startEmerge(y);
                this.currentLevel.items.push(flower);
                break;
            case 'star':
                const star = new Item(x, y, 'star');
                star.startEmerge(y);
                this.currentLevel.items.push(star);
                break;
            case '1up':
                const oneUp = new Item(x, y, '1up');
                oneUp.startEmerge(y);
                this.currentLevel.items.push(oneUp);
                break;
        }
    }

    // ---- GAME STATE MANAGEMENT ----
    startGame() {
        this.startScreen.classList.add('hidden');
        this.loadLevel(0);
        this.state = 'playing';
        AudioSystem.resume();
        AudioSystem.startOverworldMusic();

        // Fade out controls HUD after 8 seconds
        const hud = document.getElementById('controls-hud');
        if (hud) {
            setTimeout(() => { hud.classList.add('fade-out'); }, 8000);
        }
    }

    loadLevel(index) {
        this.currentLevelIndex = index;

        // Regenerate levels to reset state
        this.levels = LevelData.getLevels();
        this.currentLevel = this.levels[index];

        const start = this.currentLevel.playerStart;
        this.player = new Player(start.x * TILE_SIZE, start.y * TILE_SIZE);

        this.fireballs = [];
        this.particles.clear();
        BlockState.reset();
        Camera.reset();

        this.timeRemaining = this.currentLevel.timeLimit;
        this.timeTimer = 0;

        // Set canvas background
        this.canvas.style.backgroundColor = this.currentLevel.skyColor;

        // Restart music for new level
        if (this.state === 'playing') {
            AudioSystem.startOverworldMusic();
        }
    }

    completeLevel() {
        const levelScoreEl = document.getElementById('level-score-bonus');
        levelScoreEl.textContent = `Time Bonus: ${this.timeRemaining * 50}`;
        this.levelCompleteScreen.classList.remove('hidden');

        setTimeout(() => {
            this.levelCompleteScreen.classList.add('hidden');
            if (this.currentLevelIndex < this.levels.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
                this.state = 'playing';
            } else {
                // Game complete - show credits then restart
                this.showGameComplete();
            }
        }, 3000);
    }

    showGameComplete() {
        const levelScoreEl = document.getElementById('level-score-bonus');
        levelScoreEl.textContent = `CONGRATULATIONS! Final Score: ${this.score}`;
        this.levelCompleteScreen.querySelector('h1').textContent = 'YOU WIN!';
        this.levelCompleteScreen.classList.remove('hidden');

        setTimeout(() => {
            this.levelCompleteScreen.classList.add('hidden');
            this.levelCompleteScreen.querySelector('h1').textContent = 'LEVEL COMPLETE!';
            this.resetGame();
        }, 5000);
    }

    onPlayerDeath() {
        this.lives--;
        if (this.lives <= 0) {
            this.state = 'gameover';
            this.gameOverScreen.classList.remove('hidden');
            AudioSystem.gameOver();
        } else {
            // Restart current level
            this.loadLevel(this.currentLevelIndex);
            this.state = 'playing';
        }
    }

    pauseGame() {
        this.state = 'paused';
        this.pauseScreen.classList.remove('hidden');
        AudioSystem.pause();
        AudioSystem.stopMusic();
    }

    resumeGame() {
        this.state = 'playing';
        this.pauseScreen.classList.add('hidden');
        AudioSystem.pause();
        AudioSystem.startOverworldMusic();
    }

    resetGame() {
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.gameOverScreen.classList.add('hidden');
        this.levelCompleteScreen.classList.add('hidden');
        this.loadLevel(0);
        this.state = 'playing';
    }

    addScore(points) {
        this.score += points;
    }

    // ---- UPDATE UI ----
    updateUI() {
        this.scoreDisplay.textContent = String(this.score).padStart(6, '0');
        this.coinsDisplay.textContent = `x${String(this.coins).padStart(2, '0')}`;
        this.worldDisplay.textContent = this.currentLevel.name;
        this.timeDisplay.textContent = String(Math.max(0, this.timeRemaining));
        this.livesDisplay.textContent = String(this.lives);
    }

    // ---- RENDER ----
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.state === 'title') return;

        if (!this.currentLevel) return;

        // Set sky color
        ctx.fillStyle = this.currentLevel.skyColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw background decorations
        this.drawBackground(ctx);

        // Draw tiles
        this.drawTiles(ctx);

        // Draw items
        for (const item of this.currentLevel.items) {
            item.draw(ctx, Camera.x);
        }

        // Draw enemies
        for (const enemy of this.currentLevel.enemies) {
            enemy.draw(ctx, Camera.x);
        }

        // Draw fireballs
        for (const fb of this.fireballs) {
            fb.draw(ctx, Camera.x);
        }

        // Draw player
        if (this.player) {
            this.player.draw(ctx, Camera.x);
        }

        // Draw particles
        this.particles.draw(ctx, Camera.x);
    }

    drawBackground(ctx) {
        const decos = LevelData.getDecorations(this.currentLevelIndex);
        if (!decos) return;

        // Draw hills
        if (decos.hills) {
            for (const hill of decos.hills) {
                const screenX = hill.x - Camera.x * 0.5; // Parallax
                if (screenX > -200 && screenX < CANVAS_WIDTH + 100) {
                    const sprite = SpriteSheet.getBackgroundSprite('hill');
                    ctx.drawImage(sprite, screenX, hill.y);
                }
            }
        }

        // Draw bushes
        if (decos.bushes) {
            for (const bush of decos.bushes) {
                const screenX = bush.x - Camera.x * 0.8;
                if (screenX > -100 && screenX < CANVAS_WIDTH + 100) {
                    const sprite = SpriteSheet.getBackgroundSprite('bush');
                    ctx.drawImage(sprite, screenX, bush.y);
                }
            }
        }

        // Draw clouds
        if (decos.clouds) {
            for (const cloud of decos.clouds) {
                const screenX = cloud.x - Camera.x * 0.3; // Slow parallax
                if (screenX > -100 && screenX < CANVAS_WIDTH + 100) {
                    const sprite = SpriteSheet.getBackgroundSprite('cloud');
                    ctx.drawImage(sprite, screenX, cloud.y);
                }
            }
        }
    }

    drawTiles(ctx) {
        const level = this.currentLevel;
        const startCol = Math.floor(Camera.x / TILE_SIZE);
        const endCol = startCol + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1;

        for (let y = 0; y < level.height; y++) {
            for (let x = startCol; x <= endCol && x < level.width; x++) {
                if (x < 0) continue;
                const tile = level.grid[y][x];
                if (tile === 0) continue;

                const drawX = x * TILE_SIZE - Camera.x;
                const drawY = y * TILE_SIZE;

                let sprite;
                switch (tile) {
                    case 1: sprite = SpriteSheet.getTileSprite('ground'); break;
                    case 2: sprite = SpriteSheet.getTileSprite('brick'); break;
                    case 3:
                    case 4:
                    case 5:
                        if (BlockState.isUsed(x, y)) {
                            sprite = SpriteSheet.getTileSprite('question_used');
                        } else {
                            sprite = SpriteSheet.getTileSprite('question');
                        }
                        break;
                    case 6: sprite = SpriteSheet.getTileSprite('pipe_top_left'); break;
                    case 7: sprite = SpriteSheet.getTileSprite('pipe_top_right'); break;
                    case 8: sprite = SpriteSheet.getTileSprite('pipe_left'); break;
                    case 9: sprite = SpriteSheet.getTileSprite('pipe_right'); break;
                    case 10: sprite = SpriteSheet.getTileSprite('question_used'); break;
                    case 11: sprite = SpriteSheet.getTileSprite('flagpole'); break;
                    case 12: sprite = SpriteSheet.getTileSprite('flag'); break;
                    case 13: sprite = SpriteSheet.getTileSprite('castle_block'); break;
                    case 14:
                        if (BlockState.isUsed(x, y)) {
                            sprite = SpriteSheet.getTileSprite('question_used');
                        } else {
                            sprite = SpriteSheet.getTileSprite('brick');
                        }
                        break;
                    case 15: break; // Invisible
                }

                if (sprite) {
                    ctx.drawImage(sprite, Math.round(drawX), drawY);
                }
            }
        }
    }
}

// ---- INITIALIZE GAME ----
window.addEventListener('load', () => {
    new Game();
});
