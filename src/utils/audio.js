// Web Audio API Synthesizer for 3D Book SFX & Romantic Background Melody

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.masterGain = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper turn sound
  playPageFlip() {
    if (this.isMuted) return;
    try {
      this.init();
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered noise for paper rustle
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to match paper rustle frequency
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
    } catch (e) {
      console.warn("Audio sfx error:", e);
    }
  }

  // Romantic chime / sparkle sound
  playSparkle() {
    if (this.isMuted) return;
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch (e) {
      console.warn("Sparkle audio error:", e);
    }
  }

  // Heartbeat sound
  playHeartbeat() {
    if (this.isMuted) return;
    try {
      this.init();
      const playThump = (time, freq, gainVal) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

        gain.gain.setValueAtTime(gainVal, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.15);
      };

      const now = this.ctx.currentTime;
      playThump(now, 85, 0.4);
      playThump(now + 0.18, 75, 0.28);
    } catch (e) {
      console.warn("Heartbeat audio error:", e);
    }
  }

  // Play romantic music-box / soft piano arpeggio
  startMusic() {
    if (this.isPlayingMusic) return;
    this.init();
    this.isPlayingMusic = true;

    // Dreamy romantic chord progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 -> C
    const melodyChords = [
      // Cmaj9
      [261.63, 329.63, 392.00, 493.88, 587.33],
      // Am9
      [220.00, 261.63, 329.63, 392.00, 493.88],
      // Fmaj7
      [174.61, 261.63, 329.63, 392.00, 523.25],
      // Gsus4 -> G
      [196.00, 261.63, 293.66, 392.00, 493.88],
      // Em7
      [164.81, 246.94, 329.63, 392.00, 493.88],
      // Dm9
      [146.83, 220.00, 261.63, 329.63, 440.00],
      // Fadd9
      [174.61, 261.63, 329.63, 440.00, 523.25],
      // G
      [196.00, 246.94, 293.66, 392.00, 587.33],
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isPlayingMusic) return;

      const currentChord = melodyChords[chordIdx];
      const freq = currentChord[noteIdx % currentChord.length];

      try {
        const osc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Warm harmonic sub-oscillator
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(freq * 0.5, this.ctx.currentTime);

        const startTime = this.ctx.currentTime;
        const noteDuration = 0.9;

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.09, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        subOsc.start(startTime);
        osc.stop(startTime + noteDuration);
        subOsc.stop(startTime + noteDuration);
      } catch (e) {
        console.warn("Melody note error:", e);
      }

      noteIdx++;
      if (noteIdx >= 4) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % melodyChords.length;
      }

      this.musicTimer = setTimeout(playNextNote, 420);
    };

    playNextNote();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
  }
}

export const soundEngine = new SoundEngine();
