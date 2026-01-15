export interface MediaMetadata {
  title: string;
  artist: string;
  album: string;
  artwork?: string;
}

export interface PlatformAdapter {
  // 媒体控制
  setMediaSession(metadata: MediaMetadata): void;

  // 文件系统
  saveFile(data: Blob, filename: string): Promise<void>;

  // 通知
  showNotification(title: string, body: string): void;

  // 系统集成
  minimizeToTray(): void;

  // 平台标识
  isDesktop(): boolean;
  isMobile(): boolean;
}
