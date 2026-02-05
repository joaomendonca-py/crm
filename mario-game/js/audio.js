// ============================================
// AUDIO SYSTEM - Procedural Sound + Music
// Uses Web Audio API to generate retro sounds
// and the iconic Mario Bros theme music
// ============================================

const AudioSystem = {
    context: null,
    enabled: true,
    musicEnabled: true,
    musicPlaying: false,
    musicNodes: [],
    musicTimeout: null,

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }

        // Music toggle button
        const btn = document.getElementById('music-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
    },

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const btn = document.getElementById('music-toggle');
        if (btn) {
            btn.textContent = this.musicEnabled ? '\u266B' : '\u266B\u0338';
            btn.style.opacity = this.musicEnabled ? '1' : '0.4';
        }
        if (!this.musicEnabled) {
            this.stopMusic();
        } else {
            this.startOverworldMusic();
        }
    },

    // Play a simple tone
    playTone(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.enabled || !this.context) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.context.currentTime);

        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(this.context.currentTime);
        osc.stop(this.context.currentTime + duration);
    },

    // Play a sequence of notes
    playSequence(notes, tempo = 0.1) {
        if (!this.enabled || !this.context) return;

        let time = this.context.currentTime;
        notes.forEach(note => {
            if (note.freq > 0) {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();

                osc.type = note.type || 'square';
                osc.frequency.setValueAtTime(note.freq, time);

                const vol = note.vol || 0.1;
                gain.gain.setValueAtTime(vol, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + (note.dur || tempo) * 0.9);

                osc.connect(gain);
                gain.connect(this.context.destination);

                osc.start(time);
                osc.stop(time + (note.dur || tempo));
            }
            time += note.dur || tempo;
        });
    },

    // ============================================
    // MARIO OVERWORLD THEME MUSIC
    // Iconic melody reproduced with Web Audio API
    // ============================================
    startOverworldMusic() {
        if (!this.enabled || !this.context || !this.musicEnabled) return;
        this.stopMusic();
        this.musicPlaying = true;
        this._playMusicLoop();
    },

    stopMusic() {
        this.musicPlaying = false;
        for (const node of this.musicNodes) {
            try { node.stop(); } catch(e) {}
        }
        this.musicNodes = [];
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
    },

    _playMusicLoop() {
        if (!this.musicPlaying || !this.musicEnabled) return;

        const bpm = 200;
        const q = 60 / bpm; // quarter note duration
        const e = q / 2;    // eighth
        const s = q / 4;    // sixteenth
        const h = q * 2;    // half
        const dq = q * 1.5; // dotted quarter

        // Mario Theme - Main melody (simplified but recognizable)
        // Notes: [frequency, duration]
        // Frequencies for musical notes
        const C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494;
        const C5=523, D5=587, E5=659, F5=698, G5=784, A5=880, B5=988;
        const Ab4=415, Bb4=466, Eb5=622, Fs4=370, Gs4=415, As4=466;
        const Fs5=740, Gs5=831;
        const R=0; // rest

        // Main theme melody - recognizable Mario overworld
        const melody = [
            // Bar 1-2: The iconic opening
            [E5,e],[E5,e],[R,e],[E5,e],[R,e],[C5,e],[E5,q],
            [G5,q],[R,q],[G4,q],[R,q],

            // Bar 3-4
            [C5,dq],[G4,dq],[E4,dq],
            [A4,q],[B4,q],[Bb4,e],[A4,q],

            // Bar 5-6
            [G4,e*1.33],[E5,e*1.33],[G5,e*1.33],[A5,q],[F5,e],[G5,e],
            [R,e],[E5,q],[C5,e],[D5,e],[B4,dq],

            // Bar 7-8 (repeat variation)
            [C5,dq],[G4,dq],[E4,dq],
            [A4,q],[B4,q],[Bb4,e],[A4,q],

            // Bar 9-10
            [G4,e*1.33],[E5,e*1.33],[G5,e*1.33],[A5,q],[F5,e],[G5,e],
            [R,e],[E5,q],[C5,e],[D5,e],[B4,dq],

            // Bar 11-12: Transition
            [R,e],[G5,e],[Fs5,e],[F5,e],[D5,q],[E5,e],
            [R,e],[Gs4,e],[A4,e],[C5,e],[R,e],[A4,e],[C5,e],[D5,e],

            // Bar 13-14
            [R,e],[G5,e],[Fs5,e],[F5,e],[D5,q],[E5,e],
            [R,e],[C5,e],[R,e],[C5,e],[C5,q],[R,q],

            // Bar 15-16: Transition part 2
            [R,e],[G5,e],[Fs5,e],[F5,e],[D5,q],[E5,e],
            [R,e],[Gs4,e],[A4,e],[C5,e],[R,e],[A4,e],[C5,e],[D5,e],

            // Bar 17-18
            [R,e],[Eb5,q],[R,e],[D5,dq],
            [C5,h],[R,h],

            // Repeat intro bars for loop
            [E5,e],[E5,e],[R,e],[E5,e],[R,e],[C5,e],[E5,q],
            [G5,q],[R,q],[G4,q],[R,q],

            [C5,dq],[G4,dq],[E4,dq],
            [A4,q],[B4,q],[Bb4,e],[A4,q],

            [G4,e*1.33],[E5,e*1.33],[G5,e*1.33],[A5,q],[F5,e],[G5,e],
            [R,e],[E5,q],[C5,e],[D5,e],[B4,dq],
        ];

        // Bass line (simplified accompaniment)
        const bassLine = [
            // Follows chord progression
            [D4,e],[D4,e],[R,e],[D4,e],[R,e],[D4,e],[D4,q],
            [G4,q],[R,q],[G4,q],[R,q],

            [G4,dq],[E4,dq],[C4,dq],
            [F4,q],[G4,q],[Fs4,e],[F4,q],

            [E4,e*1.33],[G4,e*1.33],[C5,e*1.33],[F4,q],[D4,e],[E4,e],
            [R,e],[C4,q],[A4,e],[B4,e],[G4,dq],

            [G4,dq],[E4,dq],[C4,dq],
            [F4,q],[G4,q],[Fs4,e],[F4,q],

            [E4,e*1.33],[G4,e*1.33],[C5,e*1.33],[F4,q],[D4,e],[E4,e],
            [R,e],[C4,q],[A4,e],[B4,e],[G4,dq],
        ];

        let time = this.context.currentTime + 0.1;
        const nodes = [];

        // Play melody
        const melodyVol = 0.06;
        for (const [freq, dur] of melody) {
            if (freq > 0) {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(melodyVol, time);
                gain.gain.setValueAtTime(melodyVol, time + dur * 0.7);
                gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.95);
                osc.connect(gain);
                gain.connect(this.context.destination);
                osc.start(time);
                osc.stop(time + dur);
                nodes.push(osc);
            }
            time += dur;
        }

        const totalDuration = time - this.context.currentTime - 0.1;

        // Play bass (shorter, loops)
        let bassTime = this.context.currentTime + 0.1;
        const bassVol = 0.03;
        for (const [freq, dur] of bassLine) {
            if (bassTime >= time) break;
            if (freq > 0) {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq * 0.5, bassTime);
                gain.gain.setValueAtTime(bassVol, bassTime);
                gain.gain.setValueAtTime(bassVol, bassTime + dur * 0.6);
                gain.gain.exponentialRampToValueAtTime(0.001, bassTime + dur * 0.9);
                osc.connect(gain);
                gain.connect(this.context.destination);
                osc.start(bassTime);
                osc.stop(bassTime + dur);
                nodes.push(osc);
            }
            bassTime += dur;
        }

        this.musicNodes = nodes;

        // Loop the music
        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying && this.musicEnabled) {
                this._playMusicLoop();
            }
        }, totalDuration * 1000);
    },

    // ---- SOUND EFFECTS ----
    jump() {
        this.playSequence([
            { freq: 400, dur: 0.05, type: 'square' },
            { freq: 500, dur: 0.05, type: 'square' },
            { freq: 600, dur: 0.05, type: 'square' },
            { freq: 700, dur: 0.05, type: 'square' },
            { freq: 800, dur: 0.1, type: 'square' },
        ]);
    },

    bigJump() {
        this.playSequence([
            { freq: 300, dur: 0.05, type: 'square' },
            { freq: 400, dur: 0.05, type: 'square' },
            { freq: 500, dur: 0.05, type: 'square' },
            { freq: 600, dur: 0.05, type: 'square' },
            { freq: 750, dur: 0.05, type: 'square' },
            { freq: 900, dur: 0.1, type: 'square' },
        ]);
    },

    coin() {
        this.playSequence([
            { freq: 988, dur: 0.05, type: 'square', vol: 0.08 },
            { freq: 1319, dur: 0.2, type: 'square', vol: 0.08 },
        ]);
    },

    stomp() {
        this.playSequence([
            { freq: 400, dur: 0.05, type: 'square' },
            { freq: 200, dur: 0.1, type: 'square' },
        ]);
    },

    powerUp() {
        const notes = [];
        for (let i = 0; i < 8; i++) {
            notes.push({ freq: 400 + i * 80, dur: 0.06, type: 'square', vol: 0.08 });
        }
        this.playSequence(notes);
    },

    powerDown() {
        const notes = [];
        for (let i = 7; i >= 0; i--) {
            notes.push({ freq: 400 + i * 80, dur: 0.06, type: 'square', vol: 0.08 });
        }
        this.playSequence(notes);
    },

    oneUp() {
        this.playSequence([
            { freq: 330, dur: 0.08, type: 'square', vol: 0.08 },
            { freq: 392, dur: 0.08, type: 'square', vol: 0.08 },
            { freq: 523, dur: 0.08, type: 'square', vol: 0.08 },
            { freq: 659, dur: 0.08, type: 'square', vol: 0.08 },
            { freq: 784, dur: 0.08, type: 'square', vol: 0.08 },
            { freq: 1047, dur: 0.15, type: 'square', vol: 0.08 },
        ]);
    },

    bump() {
        this.playTone(200, 0.1, 'square', 0.08);
    },

    breakBlock() {
        this.playSequence([
            { freq: 600, dur: 0.03, type: 'square' },
            { freq: 400, dur: 0.03, type: 'square' },
            { freq: 300, dur: 0.05, type: 'square' },
        ]);
        if (this.context) {
            const bufferSize = this.context.sampleRate * 0.1;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.context.createBufferSource();
            noise.buffer = buffer;
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0.05, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
            noise.connect(gain);
            gain.connect(this.context.destination);
            noise.start(this.context.currentTime);
        }
    },

    fireball() {
        this.playSequence([
            { freq: 800, dur: 0.03, type: 'sawtooth', vol: 0.05 },
            { freq: 600, dur: 0.03, type: 'sawtooth', vol: 0.05 },
            { freq: 400, dur: 0.03, type: 'sawtooth', vol: 0.05 },
        ]);
    },

    die() {
        this.stopMusic();
        this.playSequence([
            { freq: 600, dur: 0.15, type: 'square', vol: 0.1 },
            { freq: 0, dur: 0.05 },
            { freq: 500, dur: 0.15, type: 'square', vol: 0.1 },
            { freq: 0, dur: 0.05 },
            { freq: 400, dur: 0.15, type: 'square', vol: 0.1 },
            { freq: 0, dur: 0.05 },
            { freq: 350, dur: 0.15, type: 'square', vol: 0.1 },
            { freq: 300, dur: 0.15, type: 'square', vol: 0.1 },
            { freq: 250, dur: 0.3, type: 'square', vol: 0.1 },
        ]);
    },

    flagpole() {
        this.stopMusic();
        const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
        this.playSequence(notes.map(f => ({ freq: f, dur: 0.1, type: 'square', vol: 0.08 })));
    },

    levelComplete() {
        this.playSequence([
            { freq: 523, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 659, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 784, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 1047, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 0, dur: 0.1 },
            { freq: 784, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 1047, dur: 0.3, type: 'square', vol: 0.08 },
        ]);
    },

    gameOver() {
        this.stopMusic();
        this.playSequence([
            { freq: 392, dur: 0.2, type: 'square', vol: 0.1 },
            { freq: 0, dur: 0.1 },
            { freq: 330, dur: 0.2, type: 'square', vol: 0.1 },
            { freq: 262, dur: 0.2, type: 'square', vol: 0.1 },
            { freq: 0, dur: 0.1 },
            { freq: 220, dur: 0.4, type: 'square', vol: 0.1 },
            { freq: 262, dur: 0.4, type: 'square', vol: 0.1 },
        ]);
    },

    pause() {
        this.playTone(500, 0.1, 'square', 0.05);
    },

    kick() {
        this.playSequence([
            { freq: 500, dur: 0.05, type: 'square', vol: 0.08 },
            { freq: 700, dur: 0.05, type: 'square', vol: 0.08 },
            { freq: 400, dur: 0.08, type: 'square', vol: 0.08 },
        ]);
    },

    pipe() {
        this.playSequence([
            { freq: 200, dur: 0.1, type: 'square', vol: 0.08 },
            { freq: 150, dur: 0.15, type: 'square', vol: 0.08 },
        ]);
    }
};
