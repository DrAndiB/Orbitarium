import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lu.andreasbraun.orbitarium',
  appName: 'Orbitarium',
  webDir: 'dist',
  backgroundColor: '#121a33',
  android: { allowMixedContent: false },
  plugins: {
    SystemBars: { insetsHandling: 'css', style: 'DARK', initialViewportFitValueHint: 'cover' },
    LocalNotifications: { smallIcon: 'ic_stat_orbitarium', iconColor: '#ffc15e' },
  },
};

export default config;
