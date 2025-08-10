class AudioManager {
    constructor() {
        this._volume = 0.5;
    }
    get volume() {
        return this._volume;
    }
    set volume(v) {
        this._volume = Math.min(1, Math.max(0, v));
        // Hook for real audio routing later
    }
    playClick() {
        // Placeholder: could play a simple beep via WebAudio later
    }
}
export const audioManager = new AudioManager();
//# sourceMappingURL=audio.js.map