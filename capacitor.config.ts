import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sentinelphish.app',
  appName: 'SentinelPhish AI Security',
  webDir: 'out',
  server: {
    url: 'https://sentinelphish.com',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0b0e14',
      androidScaleType: 'CENTER_CROP',
    }
  }
};

export default config;
