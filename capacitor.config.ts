import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prestigelife.idletycoon',
  appName: 'Prestige Life: Idle Tycoon',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#0C2FA0',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: false,
    },
    // v2 reminders (src/game/runtime/notifications.ts): white heart, tinted violet.
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#7C3AED',
    },
  },
};

export default config;
