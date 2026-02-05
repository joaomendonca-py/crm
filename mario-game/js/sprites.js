// ============================================
// SPRITE RENDERING SYSTEM - Pixel Art Generator
// All sprites are drawn procedurally using Canvas
// ============================================

const SpriteSheet = {
    cache: {},
    scale: 2,

    // Create an offscreen canvas for sprite caching
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    // Draw a pixel grid to a canvas
    drawPixelGrid(ctx, grid, colorMap, pixelSize) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const colorKey = grid[y][x];
                if (colorKey && colorKey !== ' ' && colorMap[colorKey]) {
                    ctx.fillStyle = colorMap[colorKey];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    },

    // ---- MARIO SPRITES ----
    getMarioSprite(state, frame, direction, big) {
        const key = `mario_${state}_${frame}_${direction}_${big}`;
        if (this.cache[key]) return this.cache[key];

        const ps = this.scale;
        let grid, colors;

        if (!big) {
            // Small Mario color palette
            colors = {
                'R': '#e7a526', // hat/shirt (red in original, gold here for visibility)
                'r': '#b91c1c', // red
                'S': '#f4a460', // skin
                'B': '#5c3317', // brown
                'b': '#1e40af', // blue overalls
                'W': '#ffffff', // white
                'G': '#15803d', // green (for fire mario)
            };

            // Small Mario - Standing
            if (state === 'stand') {
                grid = [
                    '   rrr   ',
                    '  rrrrrr ',
                    '  BSSrSr ',
                    ' BSSSrSr ',
                    ' BSSSSrr ',
                    '  SSSS   ',
                    ' rrbrrr  ',
                    'rrrbrrr  ',
                    'SSrbbrrS ',
                    'SSSbbSSS ',
                    'SSbbbbSS ',
                    '  bBBb   ',
                    '  BBBB   ',
                    ' BBB BBB ',
                ];
            } else if (state === 'run') {
                // Running frames
                if (frame === 0) {
                    grid = [
                        '   rrr   ',
                        '  rrrrrr ',
                        '  BSSrSr ',
                        ' BSSSrSr ',
                        ' BSSSSrr ',
                        '  SSSS   ',
                        ' rrbrrr  ',
                        'rrrbrrr  ',
                        'SSrbbrrS ',
                        'SSSbbSSS ',
                        '  bbbS   ',
                        ' BBrr    ',
                        ' BBB     ',
                        '  BBB    ',
                    ];
                } else if (frame === 1) {
                    grid = [
                        '   rrr   ',
                        '  rrrrrr ',
                        '  BSSrSr ',
                        ' BSSSrSr ',
                        ' BSSSSrr ',
                        '  SSSS   ',
                        '  rbrr   ',
                        ' rrrbb   ',
                        ' SSbbbb  ',
                        ' SSbb    ',
                        '  bbb    ',
                        '  BBr    ',
                        '  BBB    ',
                        '   BB    ',
                    ];
                } else {
                    grid = [
                        '          ',
                        '   rrr    ',
                        '  rrrrrr  ',
                        '  BSSrSr  ',
                        ' BSSSrSr  ',
                        ' BSSSSrr  ',
                        '  SSSS    ',
                        '  rrbrr   ',
                        ' rrrbrrBB ',
                        ' SSrbbBBB ',
                        ' SSSbb    ',
                        '   bbb    ',
                        '   BB     ',
                        '  BBB     ',
                    ];
                }
            } else if (state === 'jump') {
                grid = [
                    '    rrr  ',
                    '   rrrrrr',
                    '   BSSrSr',
                    '  BSSSrSr',
                    '  BSSSSrr',
                    '   SSSS  ',
                    '  rrrbrr ',
                    ' rrrrbbb ',
                    'SSSrbb b ',
                    'SSSSbr   ',
                    '  bbbr   ',
                    '  bBBB   ',
                    '  BBB    ',
                    '  BB     ',
                ];
            } else if (state === 'die') {
                grid = [
                    '   rrr   ',
                    '  rrrrrr ',
                    '  BSSrSr ',
                    ' BSSSrSr ',
                    ' BSSSSrr ',
                    '  SSSS   ',
                    ' rrbrrr  ',
                    'rrrbrrr  ',
                    'SSrbbrrS ',
                    'SSSbbSSS ',
                    'SSbbbbSS ',
                    '  bBBb   ',
                    '  BBBB   ',
                    ' BBB BBB ',
                ];
            }
        } else {
            // Big Mario
            colors = {
                'R': '#e7a526',
                'r': '#b91c1c',
                'S': '#f4a460',
                'B': '#5c3317',
                'b': '#1e40af',
                'W': '#ffffff',
            };

            if (state === 'stand') {
                grid = [
                    '    rrrrr    ',
                    '   rrrrrrrr  ',
                    '   BBSSSrS   ',
                    '  BSSSSSrSS  ',
                    '  BSSSSSSrr  ',
                    '  BBSSSSB    ',
                    '   SSSSSSS   ',
                    '  rrrbrrrr   ',
                    ' rrrrbrrrr   ',
                    'rrrrbbbbrrr  ',
                    'SSrbbrbbrSS  ',
                    'SSSbbbbbSSS  ',
                    'SSbbbbbbbbS  ',
                    '  bbb  bbb   ',
                    ' BBBB  BBBB  ',
                    '             ',
                    '    rrrrr    ',
                    '   rrrrrrrr  ',
                    '   BBSSSrS   ',
                    '  BSSSSSrSS  ',
                    '  BSSSSSSrr  ',
                    '  BBSSSSB    ',
                    '   SSSSSSS   ',
                    '  rrrbrrrr   ',
                    ' rrrrbrrrr   ',
                    'rrrrbbbbrrr  ',
                    'SSrbbrbbrSS  ',
                    'SSSbbbbbSSS  ',
                    'SSbbbbbbbbS  ',
                    '  bbb  bbb   ',
                    ' BBBB  BBBB  ',
                ];
                // Only use first 15 rows
                grid = grid.slice(0, 15);
            } else if (state === 'run') {
                if (frame === 0) {
                    grid = [
                        '    rrrrr    ',
                        '   rrrrrrrr  ',
                        '   BBSSSrS   ',
                        '  BSSSSSrSS  ',
                        '  BSSSSSSrr  ',
                        '  BBSSSSB    ',
                        '   SSSSSSS   ',
                        '   rrbrrrr   ',
                        '  rrrbrrrbb  ',
                        '  rrrbbbbBBB ',
                        '  SSbbrbbb   ',
                        '  SSSbbbb    ',
                        '   bbbbS     ',
                        '  BBBrr      ',
                        '  BBBB       ',
                    ];
                } else if (frame === 1) {
                    grid = [
                        '    rrrrr    ',
                        '   rrrrrrrr  ',
                        '   BBSSSrS   ',
                        '  BSSSSSrSS  ',
                        '  BSSSSSSrr  ',
                        '  BBSSSSB    ',
                        '   SSSSSSS   ',
                        '  rrrbrrrr   ',
                        ' rrrrbrrrr   ',
                        'rrrrbbbbrrr  ',
                        'SSrbbrbbrSS  ',
                        'SSSbbbbbSSS  ',
                        '  bbbbbbb    ',
                        '  BBBr BBr   ',
                        ' BBBB  BBB   ',
                    ];
                } else {
                    grid = [
                        '    rrrrr    ',
                        '   rrrrrrrr  ',
                        '   BBSSSrS   ',
                        '  BSSSSSrSS  ',
                        '  BSSSSSSrr  ',
                        '  BBSSSSB    ',
                        '   SSSSSSS   ',
                        '    rbrrrr   ',
                        '   rrrbbbb   ',
                        '   SSbbbbbb  ',
                        '   SSbb  bb  ',
                        '    bbb      ',
                        '    BBr      ',
                        '    BBBB     ',
                        '     BB      ',
                    ];
                }
            } else if (state === 'jump') {
                grid = [
                    '     rrrrr   ',
                    '    rrrrrrrr ',
                    '    BBSSSrS  ',
                    '   BSSSSSrSS ',
                    '   BSSSSSSrr ',
                    '   BBSSSSB   ',
                    '    SSSSSSS  ',
                    '   rrrrbrrr  ',
                    '  rrrrrbbbbb ',
                    ' SSSrbbbb bb ',
                    ' SSSSbrr     ',
                    '   bbbrr     ',
                    '   bBBBB     ',
                    '   BBBB      ',
                    '   BB        ',
                ];
            } else if (state === 'die') {
                grid = [
                    '    rrrrr    ',
                    '   rrrrrrrr  ',
                    '   BBSSSrS   ',
                    '  BSSSSSrSS  ',
                    '  BSSSSSSrr  ',
                    '  BBSSSSB    ',
                    '   SSSSSSS   ',
                    '  rrrbrrrr   ',
                    ' rrrrbrrrr   ',
                    'rrrrbbbbrrr  ',
                    'SSrbbrbbrSS  ',
                    'SSSbbbbbSSS  ',
                    'SSbbbbbbbbS  ',
                    '  bbb  bbb   ',
                    ' BBB    BBB  ',
                ];
            }
        }

        if (!grid) {
            // Fallback
            grid = [
                'rrr',
                'rrr',
                'rrr',
            ];
        }

        const width = Math.max(...grid.map(r => r.length)) * ps;
        const height = grid.length * ps;
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        this.drawPixelGrid(ctx, grid, colors, ps);

        // Flip for left direction
        if (direction === 'left') {
            const flipped = this.createCanvas(width, height);
            const fctx = flipped.getContext('2d');
            fctx.translate(width, 0);
            fctx.scale(-1, 1);
            fctx.drawImage(canvas, 0, 0);
            this.cache[key] = flipped;
            return flipped;
        }

        this.cache[key] = canvas;
        return canvas;
    },

    // ---- TILE SPRITES ----
    getTileSprite(type) {
        const key = `tile_${type}`;
        if (this.cache[key]) return this.cache[key];

        const size = 32;
        const canvas = this.createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        switch (type) {
            case 'ground':
                ctx.fillStyle = '#c84c0c';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#e09050';
                ctx.fillRect(1, 1, size - 2, size - 8);
                ctx.fillStyle = '#a03000';
                ctx.fillRect(0, size - 6, size, 6);
                // Brick pattern
                ctx.strokeStyle = '#a03000';
                ctx.lineWidth = 1;
                ctx.strokeRect(1, 1, size - 2, size - 8);
                break;

            case 'brick':
                ctx.fillStyle = '#c84c0c';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#e09050';
                ctx.fillRect(1, 1, 14, 6);
                ctx.fillRect(17, 1, 14, 6);
                ctx.fillRect(1, 9, 6, 6);
                ctx.fillRect(9, 9, 14, 6);
                ctx.fillRect(25, 9, 6, 6);
                ctx.fillRect(1, 17, 14, 6);
                ctx.fillRect(17, 17, 14, 6);
                ctx.fillRect(1, 25, 6, 6);
                ctx.fillRect(9, 25, 14, 6);
                ctx.fillRect(25, 25, 6, 6);
                break;

            case 'question':
                ctx.fillStyle = '#e7a526';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(2, 2, size - 4, size - 4);
                ctx.fillStyle = '#c88400';
                ctx.fillRect(4, 4, size - 8, size - 8);
                ctx.fillStyle = '#ffd700';
                // Draw ? mark
                ctx.font = 'bold 18px monospace';
                ctx.fillStyle = '#e7a526';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', size / 2, size / 2);
                // Border
                ctx.strokeStyle = '#8B6914';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, size - 2, size - 2);
                break;

            case 'question_used':
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#a08030';
                ctx.fillRect(2, 2, size - 4, size - 4);
                ctx.strokeStyle = '#6B5010';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, size - 2, size - 2);
                break;

            case 'pipe_top_left':
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, size, 8);
                ctx.fillRect(0, 0, 6, size);
                ctx.fillStyle = '#0f5c2c';
                ctx.fillRect(size - 4, 0, 4, size);
                ctx.fillRect(0, size - 2, size, 2);
                break;

            case 'pipe_top_right':
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, size, 8);
                ctx.fillRect(0, 0, 6, size);
                ctx.fillStyle = '#0f5c2c';
                ctx.fillRect(size - 4, 0, 4, size);
                ctx.fillRect(0, size - 2, size, 2);
                break;

            case 'pipe_left':
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 6, size);
                ctx.fillStyle = '#0f5c2c';
                ctx.fillRect(size - 4, 0, 4, size);
                break;

            case 'pipe_right':
                ctx.fillStyle = '#15803d';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(0, 0, 6, size);
                ctx.fillStyle = '#0f5c2c';
                ctx.fillRect(size - 4, 0, 4, size);
                break;

            case 'block':
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#a08030';
                ctx.fillRect(2, 2, size - 4, size - 4);
                ctx.strokeStyle = '#6B5010';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, size - 2, size - 2);
                break;

            case 'flagpole':
                ctx.fillStyle = '#888';
                ctx.fillRect(14, 0, 4, size);
                break;

            case 'flag':
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.moveTo(18, 0);
                ctx.lineTo(18, 20);
                ctx.lineTo(0, 10);
                ctx.closePath();
                ctx.fill();
                break;

            case 'castle_block':
                ctx.fillStyle = '#888';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#aaa';
                ctx.fillRect(1, 1, 14, 14);
                ctx.fillRect(17, 1, 14, 14);
                ctx.fillRect(9, 17, 14, 14);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1;
                ctx.strokeRect(0, 0, size, size);
                break;
        }

        this.cache[key] = canvas;
        return canvas;
    },

    // ---- BACKGROUND ELEMENTS ----
    getBackgroundSprite(type) {
        const key = `bg_${type}`;
        if (this.cache[key]) return this.cache[key];

        let canvas, ctx;

        switch (type) {
            case 'cloud':
                canvas = this.createCanvas(96, 48);
                ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(24, 32, 16, 0, Math.PI * 2);
                ctx.arc(48, 24, 22, 0, Math.PI * 2);
                ctx.arc(72, 32, 16, 0, Math.PI * 2);
                ctx.arc(36, 20, 18, 0, Math.PI * 2);
                ctx.arc(60, 20, 18, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'bush':
                canvas = this.createCanvas(96, 32);
                ctx = canvas.getContext('2d');
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(16, 24, 14, 0, Math.PI * 2);
                ctx.arc(48, 16, 20, 0, Math.PI * 2);
                ctx.arc(80, 24, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(0, 28, 96, 4);
                break;

            case 'hill':
                canvas = this.createCanvas(160, 80);
                ctx = canvas.getContext('2d');
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.moveTo(0, 80);
                ctx.lineTo(80, 10);
                ctx.lineTo(160, 80);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.moveTo(30, 80);
                ctx.lineTo(80, 30);
                ctx.lineTo(130, 80);
                ctx.closePath();
                ctx.fill();
                break;
        }

        this.cache[key] = canvas;
        return canvas;
    },

    // ---- ENEMY SPRITES ----
    getEnemySprite(type, frame, direction) {
        const key = `enemy_${type}_${frame}_${direction}`;
        if (this.cache[key]) return this.cache[key];

        const ps = this.scale;
        let grid, colors;

        if (type === 'goomba') {
            colors = {
                'B': '#5c3317',
                'b': '#8B4513',
                'W': '#ffffff',
                'K': '#000000',
                'S': '#f4a460',
                'Y': '#e7a526',
            };

            if (frame === 0) {
                grid = [
                    '   BBBB   ',
                    '  BBbbBB  ',
                    ' BBbbbbBB ',
                    'BBbbbbbbBB',
                    'BbWKbbKWbB',
                    'BbWKbbKWbB',
                    'BBbbSSbbBB',
                    ' BBSSSSbb ',
                    '  SSSSSS  ',
                    ' SS SS SS ',
                    'SS  SS  SS',
                ];
            } else if (frame === 1) {
                grid = [
                    '   BBBB   ',
                    '  BBbbBB  ',
                    ' BBbbbbBB ',
                    'BBbbbbbbBB',
                    'BbWKbbKWbB',
                    'BbWKbbKWbB',
                    'BBbbSSbbBB',
                    ' BBSSSSbb ',
                    '  SSSSSS  ',
                    '  SS  SS  ',
                    ' SSS  SSS ',
                ];
            } else {
                // Squished
                grid = [
                    '          ',
                    '          ',
                    '          ',
                    '          ',
                    '          ',
                    '          ',
                    '          ',
                    'BBbbbbbbBB',
                    'BbWKbbKWbB',
                    ' BBSSSSbb ',
                    '  SSSSSS  ',
                ];
            }
        } else if (type === 'koopa') {
            colors = {
                'G': '#22c55e',
                'g': '#15803d',
                'W': '#ffffff',
                'K': '#000000',
                'Y': '#e7a526',
                'S': '#f4a460',
            };

            if (frame === 0) {
                grid = [
                    '   GG     ',
                    '  GGGG    ',
                    '  GWKG    ',
                    '  GGGG    ',
                    ' SSGGGG   ',
                    ' SGGGGGG  ',
                    ' SGGGGGGG ',
                    '  GGgGGG  ',
                    '  GGggGG  ',
                    '  GGGgGG  ',
                    '   SS     ',
                    '  YYSY    ',
                    '  YYYY    ',
                    '  YY YY   ',
                ];
            } else {
                grid = [
                    '   GG     ',
                    '  GGGG    ',
                    '  GWKG    ',
                    '  GGGG    ',
                    ' SSGGGG   ',
                    ' SGGGGGG  ',
                    ' SGGGGGGG ',
                    '  GGgGGG  ',
                    '  GGggGG  ',
                    '  GGGgGG  ',
                    '    SS    ',
                    '   YSSY   ',
                    '   YYYY   ',
                    '   YY YY  ',
                ];
            }
        } else if (type === 'koopa_shell') {
            colors = {
                'G': '#22c55e',
                'g': '#15803d',
            };
            grid = [
                '  GGGGGG  ',
                ' GGGGGGGG ',
                'GGGGgGGGGG',
                'GGGGggGGGG',
                'GGGGGgGGGG',
                ' GGGGGGGG ',
                '  GGGGGG  ',
            ];
        }

        if (!grid) {
            grid = [['B', 'B'], ['B', 'B']];
            colors = { 'B': '#f00' };
        }

        const width = Math.max(...grid.map(r => r.length)) * ps;
        const height = grid.length * ps;
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        this.drawPixelGrid(ctx, grid, colors, ps);

        if (direction === 'left') {
            const flipped = this.createCanvas(width, height);
            const fctx = flipped.getContext('2d');
            fctx.translate(width, 0);
            fctx.scale(-1, 1);
            fctx.drawImage(canvas, 0, 0);
            this.cache[key] = flipped;
            return flipped;
        }

        this.cache[key] = canvas;
        return canvas;
    },

    // ---- ITEM SPRITES ----
    getItemSprite(type, frame) {
        const key = `item_${type}_${frame}`;
        if (this.cache[key]) return this.cache[key];

        const ps = this.scale;
        let grid, colors;

        if (type === 'coin') {
            colors = {
                'Y': '#ffd700',
                'y': '#e7a526',
                'W': '#fff8dc',
            };
            if (frame === 0) {
                grid = [
                    '  YYYY  ',
                    ' YYyyYY ',
                    'YYyWWyYY',
                    'YyWWWWyY',
                    'YyWWWWyY',
                    'YYyWWyYY',
                    ' YYyyYY ',
                    '  YYYY  ',
                ];
            } else if (frame === 1) {
                grid = [
                    '  YY  ',
                    ' YyY  ',
                    'YyWyY ',
                    'YyWyY ',
                    'YyWyY ',
                    'YyWyY ',
                    ' YyY  ',
                    '  YY  ',
                ];
            } else {
                grid = [
                    ' YY ',
                    ' yy ',
                    ' yy ',
                    ' yy ',
                    ' yy ',
                    ' yy ',
                    ' yy ',
                    ' YY ',
                ];
            }
        } else if (type === 'mushroom') {
            colors = {
                'R': '#dc2626',
                'W': '#ffffff',
                'S': '#f4a460',
                'B': '#5c3317',
                'K': '#000000',
            };
            grid = [
                '   RRRRRR   ',
                '  RRRRRRRR  ',
                ' RRWRRRRWRR ',
                'RRWWRRRRWWRR',
                'RRWWRRRRWWRR',
                'RRWWRRRRWWRR',
                ' RRRRRRRRR  ',
                '  SSSSSSSS  ',
                ' SSSSSSSSSS ',
                ' SKSSSSSSKS ',
                ' SKSSSSSSKS ',
                '  SSSSSSSS  ',
            ];
        } else if (type === 'star') {
            colors = {
                'Y': '#ffd700',
                'y': '#e7a526',
                'K': '#000000',
            };
            grid = [
                '     YY     ',
                '     YY     ',
                '    YYYY    ',
                '    YYYY    ',
                'YYYYYYYYYYYY',
                ' YYYYyYYYYY ',
                '  YYKyKYYY  ',
                '  YYYYYYYY  ',
                '   YYYYYY   ',
                '  YYY  YYY  ',
                ' YYY    YYY ',
                ' YY      YY ',
            ];
        } else if (type === 'fireflower') {
            colors = {
                'R': '#dc2626',
                'O': '#f97316',
                'Y': '#ffd700',
                'G': '#22c55e',
                'g': '#15803d',
                'W': '#ffffff',
            };
            grid = [
                '   RRRR   ',
                '  RROORRR ',
                ' RROOWOORR',
                ' ROOWWOORR',
                ' RROOWOORR',
                '  RROORRR ',
                '   RRRR   ',
                '    GG    ',
                '   GGgG   ',
                '  GGGGgG  ',
                '    GG    ',
                '    GG    ',
            ];
        } else if (type === '1up') {
            colors = {
                'G': '#22c55e',
                'W': '#ffffff',
                'S': '#f4a460',
                'B': '#5c3317',
                'K': '#000000',
            };
            grid = [
                '   GGGGGG   ',
                '  GGGGGGGG  ',
                ' GGWGGGGWGG ',
                'GGWWGGGGWWGG',
                'GGWWGGGGWWGG',
                'GGWWGGGGWWGG',
                ' GGGGGGGGGG ',
                '  SSSSSSSS  ',
                ' SSSSSSSSSS ',
                ' SKSSSSSSKS ',
                ' SKSSSSSSKS ',
                '  SSSSSSSS  ',
            ];
        }

        if (!grid) {
            grid = [['Y']];
            colors = { 'Y': '#ff0' };
        }

        const width = Math.max(...grid.map(r => r.length)) * ps;
        const height = grid.length * ps;
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        this.drawPixelGrid(ctx, grid, colors, ps);

        this.cache[key] = canvas;
        return canvas;
    },

    // ---- PARTICLE SPRITES ----
    getParticleSprite(type) {
        const key = `particle_${type}`;
        if (this.cache[key]) return this.cache[key];

        const canvas = this.createCanvas(8, 8);
        const ctx = canvas.getContext('2d');

        switch (type) {
            case 'brick':
                ctx.fillStyle = '#c84c0c';
                ctx.fillRect(0, 0, 8, 8);
                ctx.fillStyle = '#e09050';
                ctx.fillRect(1, 1, 6, 6);
                break;
            case 'coin_sparkle':
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(2, 0, 4, 8);
                ctx.fillRect(0, 2, 8, 4);
                break;
        }

        this.cache[key] = canvas;
        return canvas;
    }
};
