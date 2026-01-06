import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { AdMobInitializationOptions, BannerAdOptions, AdOptions } from '@capacitor-community/admob';

export class AdMobService {
    private static initialized = false;

    static async initialize() {
        if (this.initialized) return;

        try {
            const { status } = await AdMob.trackingAuthorizationStatus();

            if (status === 'notDetermined') {
                await AdMob.requestTrackingAuthorization();
            }

            const options: AdMobInitializationOptions = {
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Example Test Device ID
                initializeForTesting: true,
            };

            await AdMob.initialize(options);
            this.initialized = true;
            console.log('AdMob initialized');
        } catch (e) {
            console.error('AdMob initialization failed', e);
        }
    }

    static async showBanner() {
        try {
            const options: BannerAdOptions = {
                adId: 'ca-app-pub-1271900948473545/2650342272',
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: false
            };
            await AdMob.showBanner(options);
        } catch (e) {
            console.error('Failed to show banner', e);
        }
    }

    static async hideBanner() {
        try {
            await AdMob.hideBanner();
        } catch (e) {
            console.error('Failed to hide banner', e);
        }
    }

    static async resumeBanner() {
        try {
            await AdMob.resumeBanner();
        } catch (e) {
            console.error('Failed to resume banner', e);
        }
    }

    static async prepareInterstitial() {
        try {
            const options: AdOptions = {
                adId: 'ca-app-pub-1271900948473545/9498821654', // Real Interstitial ID from Screenshot
                isTesting: false
            };
            await AdMob.prepareInterstitial(options);
        } catch (e) {
            console.error('Failed to prepare interstitial', e);
        }
    }

    static async showInterstitial() {
        try {
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('Failed to show interstitial', e);
            // Try to prepare again if failed
            this.prepareInterstitial();
        }
    }
}
