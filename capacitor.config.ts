import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comeMiVesto',
  appName: 'comeMiVesto',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ["*"]
  }
};

export default config;
