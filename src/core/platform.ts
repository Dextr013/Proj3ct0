export type Platform = 'web' | 'yandex' | 'samsung' | 'youtube';

export interface PurchaseResult {
  success: boolean;
  productId: string;
}

let currentPlatform: Platform = 'web';

export function detectPlatform(): Platform {
  // Very rough placeholder detection; real SDK detection will replace this
  if ((window as any).YaGames) return (currentPlatform = 'yandex');
  if ((window as any).instant) return (currentPlatform = 'samsung');
  if ((window as any).playableads) return (currentPlatform = 'youtube');
  return (currentPlatform = 'web');
}

export function getPlatform(): Platform {
  return currentPlatform;
}

export async function purchase(productId: string): Promise<PurchaseResult> {
  // Stub for IAP; integrate Yandex SDK, Samsung IAP, YouTube Playables API later
  console.log(`[IAP] Purchasing`, productId, 'on', currentPlatform);
  return { success: true, productId };
}

export async function showRewardedAd(placement: string): Promise<boolean> {
  console.log(`[Ad] Show rewarded`, placement, 'on', currentPlatform);
  return true;
}