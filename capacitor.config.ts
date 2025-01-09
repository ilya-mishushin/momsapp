import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.momsapp',
  appName: 'Family Album',
  webDir: 'build',
  plugins: {
    Filesystem: {
      permissions: ['read', 'write']
    },
    Camera: {
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      source: 'camera'
    }
  }
};

export default config;