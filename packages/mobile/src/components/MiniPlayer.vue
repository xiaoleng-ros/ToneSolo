<template>
  <div class="mini-player" v-if="musicStore.playSong?.id" @click="openFullPlayer">
    <div class="info">
      <van-image
        round
        width="40"
        height="40"
        :src="musicStore.playSong.cover || musicStore.playSong.al?.picUrl"
      />
      <div class="text">
        <div class="title van-ellipsis">{{ musicStore.playSong.name }}</div>
        <div class="artist van-ellipsis">{{ musicStore.playSong.ar?.[0]?.name }}</div>
      </div>
    </div>
    <div class="controls">
      <van-icon
        :name="statusStore.playStatus ? 'pause-circle-o' : 'play-circle-o'"
        size="32"
        @click.stop="player.playOrPause()"
      />
      <van-icon name="bars" size="24" style="margin-left: 12px" @click.stop="showPlaylistPopup = true" />
    </div>

    <!-- 播放列表弹出层 -->
    <van-popup
      v-model:show="showPlaylistPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
      teleport="body"
    >
      <div class="playlist-container">
        <div class="playlist-header">
          <div class="title">当前播放 <span class="count">({{ dataStore.playList.length }})</span></div>
          <div class="actions">
            <van-icon name="delete-o" @click="clearPlaylist" />
          </div>
        </div>
        <div class="playlist-content">
          <van-cell
            v-for="(song, index) in dataStore.playList"
            :key="song.id"
            :class="{ active: musicStore.playSong?.id === song.id }"
            @click="playSong(index)"
          >
            <template #title>
              <div class="song-info van-ellipsis">
                <span class="song-name">{{ song.name }}</span>
                <span class="song-artist"> - {{ formatArtists(song.artists) }}</span>
              </div>
            </template>
            <template #right-icon>
              <van-icon name="cross" class="remove-icon" @click.stop="removeSong(index)" />
            </template>
          </van-cell>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMusicStore, useStatusStore, useDataStore } from '@core/stores';
import { usePlayerController } from '@core/core/player/PlayerController';
import { showToast, showConfirmDialog } from 'vant';

const musicStore = useMusicStore();
const statusStore = useStatusStore();
const dataStore = useDataStore();
const player = usePlayerController();

const showPlaylistPopup = ref(false);

const openFullPlayer = () => {
  statusStore.showFullPlayer = true;
};

const playSong = (index: number) => {
  musicStore.playSong = dataStore.playList[index];
  player.playSong();
};

const removeSong = (index: number) => {
  dataStore.playList.splice(index, 1);
  if (dataStore.playList.length === 0) {
    musicStore.resetMusicData();
    showPlaylistPopup.value = false;
  }
};

const clearPlaylist = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要清空播放列表吗？',
  }).then(() => {
    dataStore.playList = [];
    musicStore.resetMusicData();
    showPlaylistPopup.value = false;
  }).catch(() => {});
};

const formatArtists = (artists: any) => {
  if (Array.isArray(artists)) {
    return artists.map(a => a.name).join('/');
  }
  return artists || '未知歌手';
};
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: 50px; /* Above tabbar */
  left: 0;
  right: 0;
  height: 56px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 99;
  border-top: 1px solid #f0f0f0;
}
.info {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  margin-right: 16px;
}
.text {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.artist {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.controls {
  display: flex;
  align-items: center;
}

/* 播放列表样式 */
.playlist-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.playlist-header {
  padding: 20px 16px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}
.playlist-header .title {
  font-size: 18px;
  font-weight: 600;
}
.playlist-header .count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}
.playlist-content {
  flex: 1;
  overflow-y: auto;
}
.active .song-name {
  color: var(--van-primary-color);
}
.song-info {
  display: flex;
  align-items: center;
}
.song-name {
  font-size: 14px;
}
.song-artist {
  font-size: 12px;
  color: #999;
}
.remove-icon {
  font-size: 16px;
  color: #ccc;
  padding: 4px;
}
</style>
