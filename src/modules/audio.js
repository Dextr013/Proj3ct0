const STORE_KEY = 'slimepop_audio_v1';

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function saveStore(obj) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch {}
}

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.fxGain = null;
    this.muted = false;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicNodes = [];

    const st = loadStore();
    if (typeof st.musicEnabled === 'boolean') this.musicEnabled = st.musicEnabled;
    if (typeof st.sfxEnabled === 'boolean') this.sfxEnabled = st.sfxEnabled;
  }

  async unlock() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicEnabled ? 0.25 : 0;
    this.musicGain.connect(this.masterGain);

    this.fxGain = this.ctx.createGain();
    this.fxGain.gain.value = this.sfxEnabled ? 0.9 : 0;
    this.fxGain.connect(this.masterGain);
  }

  isMuted() { return this.muted; }
  setMuted(muted) {
    this.muted = muted;
    if (!this.masterGain) return;
    this.masterGain.gain.value = muted ? 0 : 0.9;
  }

  setMusicEnabled(on) {
    this.musicEnabled = !!on;
    if (this.musicGain) this.musicGain.gain.value = this.musicEnabled ? 0.25 : 0;
    saveStore({ musicEnabled: this.musicEnabled, sfxEnabled: this.sfxEnabled });
  }
  setSfxEnabled(on) {
    this.sfxEnabled = !!on;
    if (this.fxGain) this.fxGain.gain.value = this.sfxEnabled ? 0.9 : 0;
    saveStore({ musicEnabled: this.musicEnabled, sfxEnabled: this.sfxEnabled });
  }

  getMusicEnabled() { return this.musicEnabled; }
  getSfxEnabled() { return this.sfxEnabled; }

  async startMusic() {
    if (!this.ctx) await this.unlock();
    this.stopMusic();
    const now = this.ctx.currentTime;

    const chordFreqs = [261.63, 329.63, 392.0];
    for (const base of chordFreqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base / 2;

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.06 + Math.random() * 0.05;
      lfoGain.gain.value = 2.2 + Math.random() * 1.2;
      lfo.connect(lfoGain).connect(osc.frequency);

      gain.gain.setValueAtTime(0.0001, now);
      const vol = (this.musicEnabled ? 0.25 : 0) / chordFreqs.length;
      gain.gain.linearRampToValueAtTime(vol, now + 2.5);

      osc.connect(gain).connect(this.musicGain);
      osc.start();
      lfo.start();

      this.musicNodes.push({ osc, gain, lfo });
    }
  }

  stopMusic() {
    for (const n of this.musicNodes) {
      try { n.osc.stop(); } catch {}
      try { n.lfo.stop(); } catch {}
    }
    this.musicNodes.length = 0;
  }

  playPop() {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

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