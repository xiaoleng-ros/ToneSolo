import { PlatformAdapter, MediaMetadata } from '@tonesolo/core';

export class DesktopAdapter implements PlatformAdapter {
  setMediaSession(metadata: MediaMetadata): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        artwork: metadata.artwork ? [{ src: metadata.artwork }] : undefined
      });
    }
  }

  async saveFile(data: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  showNotification(title: string, body: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }

  minimizeToTray(): void {
    // Assuming Electron context bridge is available as window.electron
    // @ts-ignore
    if (window.electron && window.electron.ipcRenderer) {
       // @ts-ignore
       window.electron.ipcRenderer.send('minimize-to-tray');
    }
  }

  isDesktop(): boolean {
    return true;
  }

  isMobile(): boolean {
    return false;
  }
}
