import { useDataStore, useMusicStore } from '@core/stores';
import { usePlayerController } from '@core/core/player/PlayerController';
import { formatSongsList } from '@core/utils/format';
import { SongType } from '@core/types/main';

/**
 * 播放控制组合式函数
 * 提供统一的歌曲播放、列表播放功能
 */
export function usePlay() {
  const dataStore = useDataStore();
  const musicStore = useMusicStore();
  const player = usePlayerController();

  /**
   * 播放单首歌曲
   * @param song 原始歌曲对象（来自 API）
   */
  const playSong = async (song: any) => {
    const formattedSongs = formatSongsList([song]);
    if (formattedSongs.length === 0) return;

    const songToPlay = formattedSongs[0];
    
    // 检查是否已经在播放列表中
    const index = dataStore.playList.findIndex(s => s.id === songToPlay.id);
    if (index === -1) {
      // 不在列表中，添加到当前播放位置的后面
      const currentIndex = dataStore.playList.findIndex(s => s.id === musicStore.playSong.id);
      if (currentIndex === -1) {
        dataStore.playList.push(songToPlay);
      } else {
        dataStore.playList.splice(currentIndex + 1, 0, songToPlay);
      }
    }

    // 设置为当前播放并开始播放
    musicStore.playSong = songToPlay;
    await player.playSong();
  };

  /**
   * 播放歌曲列表
   * @param songs 原始歌曲列表
   * @param index 起始播放索引
   */
  const playList = async (songs: any[], index: number = 0) => {
    const formattedSongs = formatSongsList(songs);
    if (formattedSongs.length === 0) return;

    // 替换整个播放列表
    dataStore.playList = formattedSongs;
    dataStore.originalPlayList = [...formattedSongs];
    
    // 设置并播放
    musicStore.playSong = formattedSongs[index];
    await player.playSong();
  };

  /**
   * 下一首播放
   * @param song 原始歌曲对象
   */
  const playNext = (song: any) => {
    const formattedSongs = formatSongsList([song]);
    if (formattedSongs.length === 0) return;

    const songToNext = formattedSongs[0];
    const index = dataStore.playList.findIndex(s => s.id === songToNext.id);
    
    if (index !== -1) {
      // 如果已在列表中，先移除
      dataStore.playList.splice(index, 1);
    }
    
    // 插到当前播放歌曲的后面
    const currentIndex = dataStore.playList.findIndex(s => s.id === musicStore.playSong.id);
    dataStore.playList.splice(currentIndex + 1, 0, songToNext);
  };

  return {
    playSong,
    playList,
    playNext
  };
}
