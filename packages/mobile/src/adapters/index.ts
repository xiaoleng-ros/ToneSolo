import { PlatformAdapter, MediaMetadata } from '@tonesolo/core';
import { Capacitor } from '@capacitor/core';

export class MobileAdapter implements PlatformAdapter {
  setMediaSession(metadata: MediaMetadata): void {
     // Implement using capacitor-media-session or similar
     console.log('Set media session', metadata);
  }

  async saveFile(data: Blob, filename: string): Promise<void> {
    // Implement using Capacitor Filesystem
    console.log('Save file', filename);
  }

  showNotification(title: string, body: string): void {
    // Implement using Capacitor LocalNotifications
    console.log('Notification', title, body);
  }

  minimizeToTray(): void {
    // Not applicable on mobile usually, maybe background mode
    console.log('Minimize to tray');
  }

  isDesktop(): boolean {
    return false;
  }

  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }
}
