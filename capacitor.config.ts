import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acasale.comemivesto',
  appName: 'Come mi vesto',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*', 'comemivesto.app']
  },
  ios: {
    contentInset: 'never'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    DeepLinks: {
      appId: 'com.acasale.comemivesto',
      schemes: ['https'],
      universalLinks: [
        'https://comemivesto.app'
      ]
    },
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: false,
      backgroundColor: '#3f3f3fff',
      androidSplashResourceName: 'cmv_splash',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
      spinnerColor: '#ffffffff'
    }
  }
};

export default config;
