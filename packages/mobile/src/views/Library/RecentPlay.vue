<template>
  <div class="recent-play-page">
    <van-nav-bar
      title="最近播放"
      left-arrow
      @click-left="router.back()"
      fixed
      placeholder
    >
      <template #right>
        <span class="clear-btn" @click="clearHistory">清空</span>
      </template>
    </van-nav-bar>

    <div class="list-container">
      <van-cell
        v-for="(song, index) in dataStore.historyList"
        :key="song.id"
        :title="song.name"
        :label="formatArtists(song.artists) + (song.album?.name ? ' - ' + song.album.name : '')"
        center
        @click="playSong(song)"
      >
        <template #icon>
          <div class="index">{{ index + 1 }}</div>
        </template>
        <template #right-icon>
          <van-icon name="play-circle-o" size="20" />
        </template>
      </van-cell>

      <van-empty v-if="dataStore.historyList.length === 0" description="暂无播放记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from '@core/stores';
import { useRouter } from 'vue-router';
import { usePlay } from '@/composables/usePlay';
import { showConfirmDialog } from 'vant';

/**
 * 最近播放页面组件
 * 展示播放历史记录，支持直接播放和清空历史
 */

const dataStore = useDataStore();
const router = useRouter();
const { playSong } = usePlay();

const formatArtists = (artists: any) => {
  if (Array.isArray(artists)) {
    return artists.map(a => a.name).join('/');
  }
  return artists || '未知歌手';
};

const clearHistory = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要清空播放历史吗？',
  }).then(() => {
    dataStore.historyList = [];
  }).catch(() => {});
};
</script>

<style scoped>
.recent-play-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.clear-btn {
  font-size: 14px;
  color: var(--van-primary-color);
}

.list-container {
  padding-bottom: 70px;
}

.index {
  width: 30px;
  color: #999;
  font-size: 14px;
  text-align: center;
  margin-right: 10px;
}
</style>
