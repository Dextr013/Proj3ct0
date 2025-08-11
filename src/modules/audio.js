export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.fxGain = null;
    this.muted = false;
    this.musicNodes = [];
  }

  async unlock() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.25;
    this.musicGain.connect(this.masterGain);

    this.fxGain = this.ctx.createGain();
    this.fxGain.gain.value = 0.9;
    this.fxGain.connect(this.masterGain);
  }

  isMuted() { return this.muted; }

  setMuted(muted) {
    this.muted = muted;
    if (!this.masterGain) return;
    this.masterGain.gain.value = muted ? 0 : 0.9;
  }

  async startMusic() {
    if (!this.ctx) await this.unlock();
    // Create a gentle, airy background pad using a couple of oscillators
    this.stopMusic();
    const now = this.ctx.currentTime;

    const chordFreqs = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
    ];

    for (const base of chordFreqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base / 2; // lower octave for softness

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.06 + Math.random() * 0.05; // slow vibrato
      lfoGain.gain.value = 2.2 + Math.random() * 1.2;
      lfo.connect(lfoGain).connect(osc.frequency);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25 / chordFreqs.length, now + 2.5);

      osc.connect(gain).connect(this.musicGain);
      osc.start();
      lfo.start();

      this.musicNodes.push({ osc, gain, lfo });
    }
  }

  stopMusic() {
    for (const n of this.musicNodes) {
      try { n.osc.stop(); } catch (_) {}
      try { n.lfo.stop(); } catch (_) {}
    }
    this.musicNodes.length = 0;
  }

  playPop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Short percussive blip using filtered noise + sine blip
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(1200, now);

    osc.connect(lpf).connect(gain).connect(this.fxGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') return this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state === 'suspended') return this.ctx.resume(); }
}