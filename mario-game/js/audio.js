// ============================================
// AUDIO SYSTEM - Procedural Sound Generation
// Uses Web Audio API to generate retro sounds
// ============================================

const AudioSystem = {
    context: null,
    enabled: true,
    musicPlaying: false,
    currentMusic: null,

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    },

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
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
            { freq: 600, dur: 0.03, type: 'noise' },
            { freq: 400, dur: 0.03, type: 'square' },
            { freq: 300, dur: 0.05, type: 'square' },
        ]);
        // Also play a noise burst
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
