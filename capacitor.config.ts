import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ffd84b681fdc425bafa365c0ba0cce6c',
  appName: 'Teknik Servis',
  webDir: 'dist',
  server: {
    url: 'https://ffd84b68-1fdc-425b-afa3-65c0ba0cce6c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
