import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * Initializes the Google AdMob SDK on native platforms (iOS / Android).
 */
export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log("[AdMob] SDK initialization skipped: Not on a native platform.");
    return;
  }

  try {
    // Request IDFA tracking consent for iOS / Android policy guidelines
    const authStatus = await AdMob.trackingAuthorizationStatus();
    console.log("[AdMob] User tracking authorization status:", authStatus.status);

    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false // Set to false when compiling production releases
    });
    console.log("[AdMob] SDK initialized successfully.");
  } catch (error) {
    console.error("[AdMob] SDK initialization failed:", error);
  }
}

/**
 * Renders a bottom banner ad. Includes custom margin to prevent overlapping bottom navigation panels.
 */
export async function showBottomBanner() {
  if (!Capacitor.isNativePlatform()) return;

  const adId = process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || "ca-app-pub-3859492733999309/7841529200";

  const options = {
    adId: adId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 56, // Offset to clear bottom tabs/bars
    isTesting: false // Switch to false for Google Play Store production builds
  };

  try {
    await AdMob.showBanner(options);
    console.log("[AdMob] Banner shown successfully.");
  } catch (error) {
    console.error("[AdMob] Failed to show banner ad:", error);
  }
}

/**
 * Hides the active banner ad.
 */
export async function hideBanner() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
    console.log("[AdMob] Banner hidden successfully.");
  } catch (error) {
    console.error("[AdMob] Failed to hide banner ad:", error);
  }
}

/**
 * Pre-loads and triggers a full-screen interstitial advertisement (e.g. after a URL scan completes).
 */
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform()) return;

  const adId = process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || "ca-app-pub-3859492733999309/7265979985";

  try {
    await AdMob.prepareInterstitial({
      adId: adId,
      isTesting: false
    });
    await AdMob.showInterstitial();
    console.log("[AdMob] Interstitial ad shown successfully.");
  } catch (error) {
    console.error("[AdMob] Failed to show interstitial ad:", error);
  }
}
