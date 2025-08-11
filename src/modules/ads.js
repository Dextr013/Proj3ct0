export class AdManager {
  constructor({ provider = 'auto' } = {}) {
    this.provider = provider;
  }

  async showInterstitial({ reason = 'session' } = {}) {
    // Try Yandex Games SDK if available
    const ysdk = window.ysdk || (window.YaGames && (await window.YaGames.init?.())) || null;
    if (ysdk && ysdk.adv && ysdk.adv.showFullscreenAdv) {
      try {
        await ysdk.adv.showFullscreenAdv({
          callbacks: {
            onClose: () => {},
            onError: () => {},
          },
        });
        return;
      } catch (e) {
        // fallthrough to no-op
      }
    }

    // Future: integrate other providers (AdMob web, Unity WebGL, custom)
    await sleep(100); // graceful async no-op
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }