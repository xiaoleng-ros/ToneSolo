import type { CoverType, SettingType, SongType, UpdateInfoType } from "@core/types/main";

// 定义接口
export interface InteractionHandler {
  openUserAgreement: () => void;
  openUserLogin: (showTip?: boolean) => void;
  openJumpArtist: (data: SongType["artists"], id?: number) => void;
  openSongInfoEditor: (song: SongType) => void;
  openPlaylistAdd: (data: SongType[], isLocal: boolean) => void;
  openBatchList: (data: SongType[], isLocal: boolean, playListId?: number) => void;
  openCloudMatch: (id: number, index: number) => void;
  openCreatePlaylist: () => void;
  openUpdatePlaylist: (id: number, data: CoverType, func: () => Promise<void>) => void;
  openDownloadSong: (song: SongType) => void;
  openDownloadSongs: (songs: SongType[]) => void;
  openSetting: (type?: SettingType, scrollTo?: string) => void;
  openUpdateApp: (data: UpdateInfoType) => void;
  openLyricExclude: () => void;
  openChangeRate: () => void;
  openAutoClose: () => void;
  openEqualizer: () => void;
  openDescModal: (content: string, title?: string) => void;
  openSongUnlockManager: () => void;
  openSidebarHideManager: () => void;
  openHomePageSectionManager: () => void;
  openCopyLyrics: () => void;
  openAMLLServer: () => void;
  openFontManager: () => void;
}

// 默认空实现
const defaultHandler: InteractionHandler = {
  openUserAgreement: () => console.log("openUserAgreement"),
  openUserLogin: () => console.log("openUserLogin"),
  openJumpArtist: () => console.log("openJumpArtist"),
  openSongInfoEditor: () => console.log("openSongInfoEditor"),
  openPlaylistAdd: () => console.log("openPlaylistAdd"),
  openBatchList: () => console.log("openBatchList"),
  openCloudMatch: () => console.log("openCloudMatch"),
  openCreatePlaylist: () => console.log("openCreatePlaylist"),
  openUpdatePlaylist: () => console.log("openUpdatePlaylist"),
  openDownloadSong: () => console.log("openDownloadSong"),
  openDownloadSongs: () => console.log("openDownloadSongs"),
  openSetting: () => console.log("openSetting"),
  openUpdateApp: () => console.log("openUpdateApp"),
  openLyricExclude: () => console.log("openLyricExclude"),
  openChangeRate: () => console.log("openChangeRate"),
  openAutoClose: () => console.log("openAutoClose"),
  openEqualizer: () => console.log("openEqualizer"),
  openDescModal: () => console.log("openDescModal"),
  openSongUnlockManager: () => console.log("openSongUnlockManager"),
  openSidebarHideManager: () => console.log("openSidebarHideManager"),
  openHomePageSectionManager: () => console.log("openHomePageSectionManager"),
  openCopyLyrics: () => console.log("openCopyLyrics"),
  openAMLLServer: () => console.log("openAMLLServer"),
  openFontManager: () => console.log("openFontManager"),
};

// 当前使用的处理器
export const interaction: InteractionHandler = { ...defaultHandler };

// 注册处理器
export const setInteractionHandler = (handler: Partial<InteractionHandler>) => {
  Object.assign(interaction, handler);
};

// 导出所有方法以便兼容旧代码
export const openUserAgreement = () => interaction.openUserAgreement();
export const openUserLogin = (showTip?: boolean) => interaction.openUserLogin(showTip);
export const openJumpArtist = (data: SongType["artists"], id?: number) => interaction.openJumpArtist(data, id);
export const openSongInfoEditor = (song: SongType) => interaction.openSongInfoEditor(song);
export const openPlaylistAdd = (data: SongType[], isLocal: boolean) => interaction.openPlaylistAdd(data, isLocal);
export const openBatchList = (data: SongType[], isLocal: boolean, playListId?: number) => interaction.openBatchList(data, isLocal, playListId);
export const openCloudMatch = (id: number, index: number) => interaction.openCloudMatch(id, index);
export const openCreatePlaylist = () => interaction.openCreatePlaylist();
export const openUpdatePlaylist = (id: number, data: CoverType, func: () => Promise<void>) => interaction.openUpdatePlaylist(id, data, func);
export const openDownloadSong = (song: SongType) => interaction.openDownloadSong(song);
export const openDownloadSongs = (songs: SongType[]) => interaction.openDownloadSongs(songs);
export const openSetting = (type?: SettingType, scrollTo?: string) => interaction.openSetting(type, scrollTo);
export const openUpdateApp = (data: UpdateInfoType) => interaction.openUpdateApp(data);
export const openLyricExclude = () => interaction.openLyricExclude();
export const openChangeRate = () => interaction.openChangeRate();
export const openAutoClose = () => interaction.openAutoClose();
export const openEqualizer = () => interaction.openEqualizer();
export const openDescModal = (content: string, title?: string) => interaction.openDescModal(content, title);
export const openSongUnlockManager = () => interaction.openSongUnlockManager();
export const openSidebarHideManager = () => interaction.openSidebarHideManager();
export const openHomePageSectionManager = () => interaction.openHomePageSectionManager();
export const openCopyLyrics = () => interaction.openCopyLyrics();
export const openAMLLServer = () => interaction.openAMLLServer();
export const openFontManager = () => interaction.openFontManager();
