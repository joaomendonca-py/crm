// ============================================
// LEVEL DESIGN SYSTEM
// Tile Legend:
// 0 = empty (sky)
// 1 = ground
// 2 = brick
// 3 = question block (coin)
// 4 = question block (mushroom/fireflower)
// 5 = question block (star)
// 6 = pipe top left
// 7 = pipe top right
// 8 = pipe body left
// 9 = pipe body right
// 10 = solid block (used question)
// 11 = flagpole
// 12 = flag top
// 13 = castle block
// 14 = brick (with coin)
// 15 = invisible block (1up)
// ============================================

const LevelData = {
    // Background decoration positions (relative to level)
    getDecorations(levelIndex) {
        const decorations = {
            0: {
                clouds: [
                    { x: 200, y: 60 },
                    { x: 600, y: 40 },
                    { x: 1100, y: 70 },
                    { x: 1800, y: 50 },
                    { x: 2400, y: 65 },
                    { x: 3000, y: 45 },
                    { x: 3600, y: 55 },
                    { x: 4200, y: 70 },
                    { x: 5000, y: 40 },
                    { x: 5800, y: 60 },
                    { x: 6500, y: 50 },
                ],
                hills: [
                    { x: 0, y: 520 },
                    { x: 800, y: 520 },
                    { x: 1900, y: 520 },
                    { x: 3200, y: 520 },
                    { x: 4500, y: 520 },
                    { x: 5500, y: 520 },
                ],
                bushes: [
                    { x: 300, y: 568 },
                    { x: 1200, y: 568 },
                    { x: 2200, y: 568 },
                    { x: 3500, y: 568 },
                    { x: 4800, y: 568 },
                    { x: 6000, y: 568 },
                ]
            },
            1: {
                clouds: [
                    { x: 150, y: 50 },
                    { x: 500, y: 35 },
                    { x: 1000, y: 60 },
                    { x: 1600, y: 45 },
                    { x: 2200, y: 55 },
                    { x: 3000, y: 40 },
                    { x: 3800, y: 65 },
                    { x: 4500, y: 50 },
                    { x: 5200, y: 70 },
                    { x: 6000, y: 45 },
                ],
                hills: [
                    { x: 100, y: 520 },
                    { x: 1000, y: 520 },
                    { x: 2500, y: 520 },
                    { x: 4000, y: 520 },
                    { x: 5500, y: 520 },
                ],
                bushes: [
                    { x: 400, y: 568 },
                    { x: 1400, y: 568 },
                    { x: 2800, y: 568 },
                    { x: 4200, y: 568 },
                    { x: 5600, y: 568 },
                ]
            },
            2: {
                clouds: [
                    { x: 100, y: 45 },
                    { x: 700, y: 60 },
                    { x: 1300, y: 40 },
                    { x: 2000, y: 55 },
                    { x: 2800, y: 50 },
                    { x: 3600, y: 65 },
                    { x: 4400, y: 45 },
                    { x: 5200, y: 60 },
                ],
                hills: [
                    { x: 200, y: 520 },
                    { x: 1500, y: 520 },
                    { x: 3000, y: 520 },
                    { x: 4800, y: 520 },
                ],
                bushes: [
                    { x: 500, y: 568 },
                    { x: 1800, y: 568 },
                    { x: 3300, y: 568 },
                    { x: 5000, y: 568 },
                ]
            }
        };
        return decorations[levelIndex] || decorations[0];
    },

    // Create level from a simpler string format
    createLevel(config) {
        const { width, height, groundHeight, platforms, enemies, items, pipes, flag, name, skyColor, timeLimit } = config;

        // Initialize empty grid
        const grid = [];
        for (let y = 0; y < height; y++) {
            grid.push(new Array(width).fill(0));
        }

        // Fill ground
        if (groundHeight) {
            for (let x = 0; x < width; x++) {
                // Check if this column has ground (gaps are defined separately)
                let hasGround = true;
                if (config.gaps) {
                    for (const gap of config.gaps) {
                        if (x >= gap.start && x < gap.start + gap.width) {
                            hasGround = false;
                            break;
                        }
                    }
                }
                if (hasGround) {
                    for (let y = height - groundHeight; y < height; y++) {
                        grid[y][x] = 1;
                    }
                }
            }
        }

        // Place platforms (blocks/bricks/question blocks)
        if (platforms) {
            for (const p of platforms) {
                for (let i = 0; i < p.width; i++) {
                    if (p.y >= 0 && p.y < height && p.x + i >= 0 && p.x + i < width) {
                        grid[p.y][p.x + i] = p.type || 2;
                    }
                }
            }
        }

        // Place pipes
        const pipeEntities = [];
        if (pipes) {
            for (const pipe of pipes) {
                const baseY = height - groundHeight - pipe.height;
                // Pipe top
                if (baseY >= 0 && baseY < height) {
                    grid[baseY][pipe.x] = 6;
                    grid[baseY][pipe.x + 1] = 7;
                }
                // Pipe body
                for (let py = 1; py < pipe.height; py++) {
                    if (baseY + py >= 0 && baseY + py < height) {
                        grid[baseY + py][pipe.x] = 8;
                        grid[baseY + py][pipe.x + 1] = 9;
                    }
                }
                pipeEntities.push({
                    x: pipe.x * TILE_SIZE,
                    y: baseY * TILE_SIZE,
                    width: TILE_SIZE * 2,
                    height: pipe.height * TILE_SIZE
                });
            }
        }

        // Place flag
        let flagPos = null;
        if (flag) {
            flagPos = { x: flag.x, y: height - groundHeight - flag.height };
            // Flagpole
            for (let fy = flagPos.y; fy < height - groundHeight; fy++) {
                grid[fy][flag.x] = 11;
            }
            // Flag at top
            if (flagPos.y >= 0) {
                grid[flagPos.y][flag.x] = 12;
            }
        }

        // Place castle blocks after flag
        if (config.castle) {
            const cx = config.castle.x;
            const cy = height - groundHeight;
            // Simple castle shape
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (cy - 5 + row >= 0) {
                        // Castle walls
                        if (row < 4 || (col !== 2)) {
                            grid[cy - 5 + row][cx + col] = 13;
                        }
                        // Battlements
                        if (row === 0 && (col === 0 || col === 2 || col === 4)) {
                            if (cy - 6 >= 0) {
                                grid[cy - 6][cx + col] = 13;
                            }
                        }
                    }
                }
            }
        }

        // Create enemy instances
        const enemyInstances = [];
        if (enemies) {
            for (const e of enemies) {
                const ex = e.x * TILE_SIZE;
                const ey = (e.y !== undefined ? e.y : height - groundHeight - 1) * TILE_SIZE;
                enemyInstances.push(new Enemy(ex, ey, e.type));
            }
        }

        // Create item instances (static coins and hidden items)
        const itemInstances = [];
        if (items) {
            for (const item of items) {
                if (item.static) {
                    const ix = item.x * TILE_SIZE + 8;
                    const iy = item.y * TILE_SIZE + 8;
                    itemInstances.push(new Item(ix, iy, item.type));
                }
            }
        }

        return {
            grid,
            width,
            height,
            enemies: enemyInstances,
            items: itemInstances,
            pipes: pipeEntities,
            flagPos,
            name: name || '1-1',
            skyColor: skyColor || '#6b8cff',
            timeLimit: timeLimit || 400,
            blockContents: config.blockContents || {},
            playerStart: config.playerStart || { x: 3, y: height - groundHeight - 2 }
        };
    },

    // ---- LEVEL 1-1 ----
    getLevel1() {
        return this.createLevel({
            width: 220,
            height: 19,
            groundHeight: 2,
            name: '1-1',
            skyColor: '#6b8cff',
            timeLimit: 400,
            playerStart: { x: 3, y: 15 },

            gaps: [
                { start: 69, width: 3 },
                { start: 86, width: 3 },
                { start: 153, width: 4 },
            ],

            platforms: [
                // Question blocks and bricks area 1
                { x: 16, y: 12, width: 1, type: 3 },
                { x: 20, y: 12, width: 1, type: 2 },
                { x: 21, y: 12, width: 1, type: 4 },
                { x: 22, y: 12, width: 1, type: 2 },
                { x: 23, y: 12, width: 1, type: 3 },
                { x: 24, y: 12, width: 1, type: 2 },
                { x: 22, y: 8, width: 1, type: 3 },

                // Block area 2
                { x: 77, y: 12, width: 1, type: 4 },
                { x: 78, y: 8, width: 3, type: 2 },
                { x: 80, y: 8, width: 1, type: 4 },

                { x: 91, y: 12, width: 1, type: 2 },
                { x: 94, y: 12, width: 3, type: 2 },
                { x: 94, y: 8, width: 1, type: 3 },
                { x: 100, y: 8, width: 2, type: 2 },
                { x: 101, y: 12, width: 1, type: 3 },

                // Stairs before gap
                { x: 134, y: 16, width: 4, type: 1 },
                { x: 135, y: 15, width: 3, type: 1 },
                { x: 136, y: 14, width: 2, type: 1 },
                { x: 137, y: 13, width: 1, type: 1 },

                // Stairs after gap
                { x: 140, y: 16, width: 4, type: 1 },
                { x: 140, y: 15, width: 3, type: 1 },
                { x: 140, y: 14, width: 2, type: 1 },
                { x: 140, y: 13, width: 1, type: 1 },

                // Stairs area 2
                { x: 148, y: 16, width: 5, type: 1 },
                { x: 149, y: 15, width: 4, type: 1 },
                { x: 150, y: 14, width: 3, type: 1 },
                { x: 151, y: 13, width: 2, type: 1 },

                { x: 157, y: 16, width: 4, type: 1 },
                { x: 158, y: 15, width: 3, type: 1 },
                { x: 159, y: 14, width: 2, type: 1 },
                { x: 160, y: 13, width: 1, type: 1 },

                // Blocks near end
                { x: 168, y: 12, width: 2, type: 2 },
                { x: 169, y: 12, width: 1, type: 3 },
                { x: 170, y: 12, width: 1, type: 2 },

                // High platforms
                { x: 106, y: 12, width: 3, type: 2 },
                { x: 109, y: 12, width: 1, type: 3 },
                { x: 119, y: 12, width: 1, type: 2 },
                { x: 121, y: 8, width: 3, type: 2 },
                { x: 128, y: 8, width: 1, type: 2 },
                { x: 129, y: 8, width: 1, type: 14 },
                { x: 130, y: 8, width: 1, type: 2 },
            ],

            pipes: [
                { x: 28, height: 2 },
                { x: 38, height: 3 },
                { x: 46, height: 4 },
                { x: 57, height: 4 },
                { x: 163, height: 2 },
            ],

            enemies: [
                { x: 22, type: 'goomba' },
                { x: 40, type: 'goomba' },
                { x: 51, type: 'goomba' },
                { x: 52, type: 'goomba' },
                { x: 80, type: 'koopa' },
                { x: 97, type: 'goomba' },
                { x: 99, type: 'goomba' },
                { x: 107, type: 'goomba' },
                { x: 109, type: 'goomba' },
                { x: 114, type: 'goomba' },
                { x: 116, type: 'goomba' },
                { x: 124, type: 'goomba' },
                { x: 126, type: 'goomba' },
                { x: 170, type: 'goomba' },
                { x: 172, type: 'goomba' },
            ],

            blockContents: {
                '16,12': 'coin',
                '21,12': 'mushroom',
                '23,12': 'coin',
                '22,8': 'coin',
                '77,12': 'mushroom',
                '80,8': 'star',
                '94,8': 'coin',
                '101,12': 'coin',
                '109,12': 'coin',
                '169,12': 'coin',
                '129,8': 'coin',
            },

            flag: { x: 198, height: 10 },
            castle: { x: 202 },
        });
    },

    // ---- LEVEL 1-2 ----
    getLevel2() {
        return this.createLevel({
            width: 240,
            height: 19,
            groundHeight: 2,
            name: '1-2',
            skyColor: '#6b8cff',
            timeLimit: 400,
            playerStart: { x: 3, y: 15 },

            gaps: [
                { start: 62, width: 2 },
                { start: 74, width: 3 },
                { start: 115, width: 2 },
                { start: 160, width: 5 },
            ],

            platforms: [
                // Starting area blocks
                { x: 12, y: 12, width: 1, type: 3 },
                { x: 15, y: 12, width: 5, type: 2 },
                { x: 17, y: 12, width: 1, type: 4 },
                { x: 15, y: 8, width: 1, type: 3 },

                // Block formations
                { x: 25, y: 12, width: 1, type: 3 },
                { x: 27, y: 12, width: 1, type: 3 },
                { x: 26, y: 8, width: 1, type: 4 },

                // Elevated section
                { x: 33, y: 10, width: 6, type: 2 },
                { x: 35, y: 10, width: 1, type: 3 },
                { x: 37, y: 10, width: 1, type: 3 },

                { x: 42, y: 8, width: 4, type: 2 },
                { x: 44, y: 8, width: 1, type: 5 },

                // Mid section
                { x: 55, y: 12, width: 3, type: 2 },
                { x: 56, y: 12, width: 1, type: 3 },
                { x: 55, y: 8, width: 4, type: 2 },

                // After first gap - step platforms
                { x: 64, y: 14, width: 3, type: 1 },
                { x: 64, y: 12, width: 1, type: 3 },
                { x: 66, y: 12, width: 1, type: 4 },

                // Upper section
                { x: 80, y: 12, width: 5, type: 2 },
                { x: 82, y: 12, width: 1, type: 3 },
                { x: 80, y: 8, width: 3, type: 2 },
                { x: 81, y: 8, width: 1, type: 3 },

                // Staircase section
                { x: 90, y: 16, width: 1, type: 1 },
                { x: 91, y: 16, width: 1, type: 1 },
                { x: 91, y: 15, width: 1, type: 1 },
                { x: 92, y: 16, width: 1, type: 1 },
                { x: 92, y: 15, width: 1, type: 1 },
                { x: 92, y: 14, width: 1, type: 1 },
                { x: 93, y: 16, width: 1, type: 1 },
                { x: 93, y: 15, width: 1, type: 1 },
                { x: 93, y: 14, width: 1, type: 1 },
                { x: 93, y: 13, width: 1, type: 1 },

                // Platform bridge
                { x: 100, y: 10, width: 8, type: 2 },
                { x: 102, y: 10, width: 1, type: 3 },
                { x: 104, y: 10, width: 1, type: 4 },
                { x: 106, y: 10, width: 1, type: 3 },

                // Challenge section
                { x: 120, y: 12, width: 3, type: 2 },
                { x: 121, y: 12, width: 1, type: 3 },
                { x: 125, y: 10, width: 4, type: 2 },
                { x: 127, y: 10, width: 1, type: 3 },
                { x: 130, y: 8, width: 3, type: 2 },
                { x: 131, y: 8, width: 1, type: 4 },

                // Near-end platforms
                { x: 140, y: 12, width: 5, type: 2 },
                { x: 142, y: 12, width: 1, type: 3 },

                // Stairs to flag
                { x: 175, y: 16, width: 8, type: 1 },
                { x: 176, y: 15, width: 7, type: 1 },
                { x: 177, y: 14, width: 6, type: 1 },
                { x: 178, y: 13, width: 5, type: 1 },
                { x: 179, y: 12, width: 4, type: 1 },
                { x: 180, y: 11, width: 3, type: 1 },
                { x: 181, y: 10, width: 2, type: 1 },

                { x: 190, y: 12, width: 3, type: 2 },
                { x: 191, y: 12, width: 1, type: 3 },
            ],

            pipes: [
                { x: 30, height: 2 },
                { x: 48, height: 3 },
                { x: 69, height: 2 },
                { x: 96, height: 3 },
                { x: 135, height: 2 },
                { x: 150, height: 4 },
                { x: 185, height: 2 },
            ],

            enemies: [
                { x: 14, type: 'goomba' },
                { x: 20, type: 'goomba' },
                { x: 24, type: 'goomba' },
                { x: 36, type: 'koopa' },
                { x: 45, type: 'goomba' },
                { x: 50, type: 'goomba' },
                { x: 52, type: 'goomba' },
                { x: 68, type: 'koopa' },
                { x: 82, type: 'goomba' },
                { x: 84, type: 'goomba' },
                { x: 98, type: 'goomba' },
                { x: 103, type: 'koopa_red', y: 8 },
                { x: 110, type: 'goomba' },
                { x: 112, type: 'goomba' },
                { x: 123, type: 'goomba' },
                { x: 128, type: 'koopa' },
                { x: 138, type: 'goomba' },
                { x: 143, type: 'goomba' },
                { x: 145, type: 'goomba' },
                { x: 155, type: 'goomba' },
                { x: 170, type: 'goomba' },
                { x: 172, type: 'goomba' },
                { x: 188, type: 'goomba' },
            ],

            blockContents: {
                '12,12': 'coin',
                '17,12': 'mushroom',
                '15,8': 'coin',
                '25,12': 'coin',
                '27,12': 'coin',
                '26,8': 'mushroom',
                '35,10': 'coin',
                '37,10': 'coin',
                '44,8': 'star',
                '56,12': 'coin',
                '64,12': 'coin',
                '66,12': 'fireflower',
                '82,12': 'coin',
                '81,8': 'coin',
                '102,10': 'coin',
                '104,10': 'mushroom',
                '106,10': 'coin',
                '121,12': 'coin',
                '127,10': 'coin',
                '131,8': 'fireflower',
                '142,12': 'coin',
                '191,12': 'coin',
            },

            flag: { x: 215, height: 10 },
            castle: { x: 220 },
        });
    },

    // ---- LEVEL 1-3 ----
    getLevel3() {
        return this.createLevel({
            width: 260,
            height: 19,
            groundHeight: 2,
            name: '1-3',
            skyColor: '#002060',
            timeLimit: 350,
            playerStart: { x: 3, y: 15 },

            gaps: [
                { start: 45, width: 4 },
                { start: 70, width: 3 },
                { start: 95, width: 3 },
                { start: 120, width: 5 },
                { start: 145, width: 3 },
                { start: 170, width: 4 },
                { start: 195, width: 6 },
            ],

            platforms: [
                // Area 1 - Introduction
                { x: 10, y: 12, width: 3, type: 2 },
                { x: 11, y: 12, width: 1, type: 4 },
                { x: 15, y: 10, width: 5, type: 2 },
                { x: 17, y: 10, width: 1, type: 3 },
                { x: 19, y: 10, width: 1, type: 3 },

                { x: 22, y: 8, width: 4, type: 2 },
                { x: 24, y: 8, width: 1, type: 3 },

                // Challenge platforms near gap 1
                { x: 30, y: 12, width: 1, type: 3 },
                { x: 33, y: 10, width: 3, type: 2 },
                { x: 34, y: 10, width: 1, type: 4 },
                { x: 38, y: 8, width: 4, type: 2 },
                { x: 40, y: 8, width: 1, type: 5 },

                // Gap 1 crossing
                { x: 44, y: 14, width: 1, type: 2 },
                { x: 46, y: 12, width: 2, type: 2 },
                { x: 49, y: 14, width: 2, type: 1 },

                // Area 2 - More vertical
                { x: 52, y: 12, width: 5, type: 2 },
                { x: 54, y: 12, width: 1, type: 3 },
                { x: 58, y: 10, width: 3, type: 2 },
                { x: 59, y: 10, width: 1, type: 3 },

                // Gap 2 area
                { x: 64, y: 8, width: 5, type: 2 },
                { x: 66, y: 8, width: 1, type: 4 },
                { x: 73, y: 12, width: 3, type: 1 },
                { x: 73, y: 10, width: 1, type: 3 },

                // Mid section
                { x: 78, y: 12, width: 4, type: 2 },
                { x: 80, y: 12, width: 1, type: 3 },
                { x: 83, y: 10, width: 3, type: 2 },
                { x: 84, y: 10, width: 1, type: 3 },
                { x: 88, y: 8, width: 3, type: 2 },
                { x: 89, y: 8, width: 1, type: 4 },

                // Gap 3 area
                { x: 93, y: 14, width: 2, type: 1 },
                { x: 98, y: 12, width: 3, type: 1 },
                { x: 99, y: 12, width: 1, type: 3 },

                // Block area
                { x: 103, y: 10, width: 6, type: 2 },
                { x: 105, y: 10, width: 1, type: 3 },
                { x: 107, y: 10, width: 1, type: 3 },
                { x: 110, y: 8, width: 3, type: 2 },
                { x: 111, y: 8, width: 1, type: 4 },

                // Gap 4 - big gap
                { x: 118, y: 12, width: 2, type: 2 },
                { x: 122, y: 14, width: 1, type: 2 },
                { x: 125, y: 12, width: 3, type: 1 },

                // Late game platforms
                { x: 130, y: 10, width: 5, type: 2 },
                { x: 132, y: 10, width: 1, type: 3 },
                { x: 134, y: 10, width: 1, type: 4 },

                { x: 138, y: 12, width: 4, type: 2 },
                { x: 140, y: 12, width: 1, type: 3 },
                { x: 143, y: 14, width: 2, type: 1 },

                // Near gap 5
                { x: 148, y: 12, width: 3, type: 1 },
                { x: 149, y: 10, width: 1, type: 3 },

                // Final challenge
                { x: 155, y: 12, width: 5, type: 2 },
                { x: 157, y: 12, width: 1, type: 3 },
                { x: 159, y: 12, width: 1, type: 4 },

                // End stairs
                { x: 210, y: 16, width: 10, type: 1 },
                { x: 211, y: 15, width: 9, type: 1 },
                { x: 212, y: 14, width: 8, type: 1 },
                { x: 213, y: 13, width: 7, type: 1 },
                { x: 214, y: 12, width: 6, type: 1 },
                { x: 215, y: 11, width: 5, type: 1 },

                { x: 225, y: 12, width: 3, type: 2 },
                { x: 226, y: 12, width: 1, type: 3 },
            ],

            pipes: [
                { x: 26, height: 2 },
                { x: 60, height: 3 },
                { x: 100, height: 2 },
                { x: 152, height: 2 },
                { x: 230, height: 2 },
            ],

            enemies: [
                { x: 13, type: 'goomba' },
                { x: 18, type: 'goomba' },
                { x: 25, type: 'koopa' },
                { x: 35, type: 'goomba' },
                { x: 42, type: 'goomba' },
                { x: 55, type: 'goomba' },
                { x: 57, type: 'goomba' },
                { x: 65, type: 'koopa' },
                { x: 79, type: 'goomba' },
                { x: 85, type: 'goomba' },
                { x: 87, type: 'koopa' },
                { x: 105, type: 'goomba' },
                { x: 108, type: 'goomba' },
                { x: 112, type: 'koopa' },
                { x: 131, type: 'goomba' },
                { x: 133, type: 'goomba' },
                { x: 139, type: 'koopa' },
                { x: 156, type: 'goomba' },
                { x: 158, type: 'goomba' },
                { x: 160, type: 'goomba' },
                { x: 227, type: 'goomba' },
            ],

            blockContents: {
                '11,12': 'mushroom',
                '17,10': 'coin',
                '19,10': 'coin',
                '24,8': 'coin',
                '30,12': 'coin',
                '34,10': 'mushroom',
                '40,8': 'star',
                '54,12': 'coin',
                '59,10': 'coin',
                '66,8': 'fireflower',
                '73,10': 'coin',
                '80,12': 'coin',
                '84,10': 'coin',
                '89,8': 'mushroom',
                '99,12': 'coin',
                '105,10': 'coin',
                '107,10': 'coin',
                '111,8': 'fireflower',
                '132,10': 'coin',
                '134,10': 'mushroom',
                '140,12': 'coin',
                '149,10': 'coin',
                '157,12': 'coin',
                '159,12': 'fireflower',
                '226,12': 'coin',
            },

            flag: { x: 240, height: 10 },
            castle: { x: 245 },
        });
    },

    getLevels() {
        return [this.getLevel1(), this.getLevel2(), this.getLevel3()];
    }
};
