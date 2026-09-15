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
    contentInset: 'always'
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
      launchAutoHide: true,
      backgroundColor: '#cccc',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
      spinnerColor: '#000000'
    }
  }
};

export default config;
