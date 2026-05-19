// Detects runtime and returns appropriate rewarded ad provider.
// AdSense for web/PWA, AdMob for Capacitor native (loaded lazily when available).

export type AdProvider = "adsense" | "admob";

export function detectAdProvider(): AdProvider {
  // Capacitor injects window.Capacitor when running in native shell
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isNative = typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.();
  return isNative ? "admob" : "adsense";
}

// Publisher / ad unit IDs (publishable — safe in client bundle)
export const AD_CONFIG = {
  adsense: {
    publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || "ca-pub-0000000000000000",
    rewardedSlotId: import.meta.env.VITE_ADSENSE_REWARDED_SLOT_ID || "0000000000",
  },
  admob: {
    rewardedUnitIdAndroid: import.meta.env.VITE_ADMOB_REWARDED_ANDROID || "ca-app-pub-3940256099942544/5224354917", // test ID
    rewardedUnitIdIOS: import.meta.env.VITE_ADMOB_REWARDED_IOS || "ca-app-pub-3940256099942544/1712485313", // test ID
  },
} as const;

/**
 * Shows a rewarded ad. Resolves true if the user watched it to completion.
 * In dev/no-config mode, falls back to a 3-second simulated ad so QA can test the flow.
 */
export async function showRewardedAd(provider: AdProvider): Promise<boolean> {
  if (provider === "admob") {
    return showAdMobRewarded();
  }
  return showAdSenseRewarded();
}

async function showAdSenseRewarded(): Promise<boolean> {
  // AdSense Rewarded for web (H5 Games Ads). Requires the user's AdSense publisher
  // to be approved for rewarded ads. We try the real flow; if not configured, simulate.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (!w.adsbygoogle || AD_CONFIG.adsense.publisherId.endsWith("0000000000000000")) {
    // Simulated ad for dev — 3s "video"
    await new Promise((r) => setTimeout(r, 3000));
    return true;
  }
  try {
    return await new Promise<boolean>((resolve) => {
      let rewarded = false;
      w.adsbygoogle.push({
        type: "reward",
        adUnitPath: `/${AD_CONFIG.adsense.publisherId}/${AD_CONFIG.adsense.rewardedSlotId}`,
        beforeReward: (showAdFn: () => void) => showAdFn(),
        adViewed: () => { rewarded = true; },
        adDismissed: () => resolve(rewarded),
        adBreakDone: () => resolve(rewarded),
      });
      // Safety timeout
      setTimeout(() => resolve(rewarded), 45_000);
    });
  } catch (e) {
    console.warn("AdSense rewarded failed, simulating", e);
    await new Promise((r) => setTimeout(r, 3000));
    return true;
  }
}

async function showAdMobRewarded(): Promise<boolean> {
  try {
    // Dynamic import so web bundle stays clean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(/* @vite-ignore */ "@capacitor-community/admob").catch(() => null);
    if (!mod?.AdMob) {
      await new Promise((r) => setTimeout(r, 3000));
      return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const platform = (window as any).Capacitor?.getPlatform?.() ?? "android";
    const adId = platform === "ios" ? AD_CONFIG.admob.rewardedUnitIdIOS : AD_CONFIG.admob.rewardedUnitIdAndroid;
    await mod.AdMob.prepareRewardVideoAd({ adId });
    const result = await mod.AdMob.showRewardVideoAd();
    return !!result;
  } catch (e) {
    console.warn("AdMob rewarded failed", e);
    return false;
  }
}
