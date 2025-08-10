class AudioManager {
  private _volume = 0.5;

  get volume(): number {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = Math.min(1, Math.max(0, v));
    // Hook for real audio routing later
  }

  playClick(): void {
    // Placeholder: could play a simple beep via WebAudio later
  }
}

export const audioManager = new AudioManager();