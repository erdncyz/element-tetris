class SoundManager {
    private context: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API not supported');
        }
    }

    private getContext(): AudioContext | null {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
        return this.context;
    }

    public toggle(enable: boolean) {
        this.enabled = enable;
    }

    public playMove() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    public playRotate() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    public playDrop() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    public playClear() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }

    public playSplash() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }

    public playExplosion() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }

    public playRockBreak() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        // Short, low pitched noise for rock breaking
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    }
    private musicNodes: AudioNode[] = [];
    private isMusicPlaying: boolean = false;
    private timerId: any = null;

    public playMusic() {
        if (!this.enabled || this.isMusicPlaying) return;
        const ctx = this.getContext();
        if (!ctx) return;

        this.isMusicPlaying = true;

        // Bass Drone (Continuous)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        const bassFilter = ctx.createBiquadFilter();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.value = 55; // A1

        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 200;

        bassGain.gain.value = 0.03;

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start();
        this.musicNodes.push(bassOsc, bassFilter, bassGain);

        // Melody Sequence (A Minor Arpeggio pattern)
        const notes = [
            440, 0, 523.25, 0, 659.25, 0, 523.25, 0, // A4, C5, E5, C5
            392, 0, 493.88, 0, 587.33, 0, 493.88, 0, // G4, B4, D5, B4
            349.23, 0, 440, 0, 523.25, 0, 440, 0,    // F4, A4, C5, A4
            329.63, 0, 392, 0, 493.88, 0, 392, 0     // E4, G4, B4, G4
        ];

        let index = 0;
        const playNote = () => {
            if (!this.isMusicPlaying) return;

            const freq = notes[index];
            if (freq > 0) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine'; // Softer tone
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }

            index = (index + 1) % notes.length;
            this.timerId = setTimeout(playNote, 200); // 300 BPM eighth notes approx
        };

        playNote();
    }

    public stopMusic() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.musicNodes.forEach(node => {
            if (node instanceof OscillatorNode) {
                try { node.stop(); } catch (e) { }
            }
            node.disconnect();
        });
        this.musicNodes = [];
        this.isMusicPlaying = false;
    }
    public playGameOver() {
        if (!this.enabled) return;
        this.stopMusic();
        const ctx = this.getContext();
        if (!ctx) return;

        // Sad descending melody
        const notes = [
            { freq: 392.00, dur: 0.3 }, // G4
            { freq: 369.99, dur: 0.3 }, // F#4
            { freq: 349.23, dur: 0.3 }, // F4
            { freq: 329.63, dur: 0.8 }, // E4
        ];

        let time = ctx.currentTime;

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = note.freq;

            // Lowpass filter for retro feel
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.dur - 0.05);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + note.dur);

            time += note.dur;
        });

        // Low thud at the end
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.type = 'square';
        thudOsc.frequency.setValueAtTime(100, time - 0.5);
        thudOsc.frequency.exponentialRampToValueAtTime(20, time + 0.5);
        thudGain.gain.setValueAtTime(0.2, time - 0.5);
        thudGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.start(time - 0.5);
        thudOsc.stop(time + 0.5);
    }
}

export const soundManager = new SoundManager();
