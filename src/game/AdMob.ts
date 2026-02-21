import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import type { AdMobInitializationOptions, BannerAdOptions, AdOptions, AdMobError } from '@capacitor-community/admob';

export class AdMobService {
    private static initialized = false;
    private static interstitialReady = false;
    private static initPromise: Promise<void> | null = null;

    static async initialize() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    private static async _doInitialize() {
        try {
            const { status } = await AdMob.trackingAuthorizationStatus();

            if (status === 'notDetermined') {
                await AdMob.requestTrackingAuthorization();
            }

            const options: AdMobInitializationOptions = {
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b', '3782e4a61322392c70c3e9c283a5e13b'],
                initializeForTesting: false,
            };

            await AdMob.initialize(options);
            this.initialized = true;
            console.log('AdMob initialized successfully');

            // Setup event listeners for debugging
            this.setupListeners();
        } catch (e) {
            console.error('AdMob initialization failed', e);
            this.initPromise = null; // Allow retry
        }
    }

    private static setupListeners() {
        // Banner listeners
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
            console.log('Banner ad loaded successfully');
        });
        AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
            console.error('Banner ad failed to load:', JSON.stringify(error));
            // Retry after delay
            setTimeout(() => this.showBanner(), 30000);
        });

        // Interstitial listeners
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
            console.log('Interstitial ad loaded successfully');
            this.interstitialReady = true;
        });
        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error: AdMobError) => {
            console.error('Interstitial ad failed to load:', JSON.stringify(error));
            this.interstitialReady = false;
            // Retry preparation after delay
            setTimeout(() => this.prepareInterstitial(), 30000);
        });
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            console.log('Interstitial ad dismissed, preparing next one');
            this.interstitialReady = false;
            // Prepare next interstitial immediately after dismissal
            this.prepareInterstitial();
        });
        AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
            console.log('Interstitial ad showed');
            this.interstitialReady = false;
        });
    }

    static async showBanner() {
        if (!this.initialized) {
            await this.initialize();
        }

        const show = async () => {
            const options: BannerAdOptions = {
                adId: 'ca-app-pub-1271900948473545/2650342272',
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: false
            };
            await AdMob.showBanner(options);
        };

        try {
            await show();
        } catch (e) {
            console.error('Failed to show banner, retrying in 3s...', e);
            setTimeout(async () => {
                try {
                    await show();
                } catch (retryError) {
                    console.error('Failed to show banner on retry', retryError);
                }
            }, 3000);
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
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const options: AdOptions = {
                adId: 'ca-app-pub-1271900948473545/9498821654',
                isTesting: false
            };
            await AdMob.prepareInterstitial(options);
            this.interstitialReady = true;
            console.log('Interstitial prepared successfully');
        } catch (e) {
            console.error('Failed to prepare interstitial', e);
            this.interstitialReady = false;
        }
    }

    static async showInterstitial() {
        if (!this.initialized) {
            console.warn('AdMob not initialized, skipping interstitial');
            return;
        }

        if (!this.interstitialReady) {
            console.warn('Interstitial not ready, preparing now');
            await this.prepareInterstitial();
            // Wait a bit for the ad to load
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            await AdMob.showInterstitial();
            this.interstitialReady = false;
            // Prepare next interstitial (also handled by onInterstitialAdDismissed listener)
            setTimeout(() => this.prepareInterstitial(), 1000);
        } catch (e) {
            console.error('Failed to show interstitial', e);
            this.interstitialReady = false;
            // Prepare for next attempt
            this.prepareInterstitial();
        }
    }
}
