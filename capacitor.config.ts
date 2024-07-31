import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'comeMiVesto',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ["*"]
  }
};

export default config;
