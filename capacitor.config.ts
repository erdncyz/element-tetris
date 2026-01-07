import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elementtetris.app',
  appName: 'Element Tetris',
  webDir: 'dist',
  backgroundColor: '#1a1a2e',
  ios: {
    // contentInset: 'always' removed to allow full screen with viewport-fit=cover
    contentInset: 'automatic',
    backgroundColor: '#1a1a2e'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#1a1a2e'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash',
    },
  },
};

export default config;
