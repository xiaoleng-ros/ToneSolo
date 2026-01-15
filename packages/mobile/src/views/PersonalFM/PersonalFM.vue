<template>
  <div class="personal-fm-page">
    <van-nav-bar
      title="私人FM"
      left-arrow
      @click-left="goBack"
      fixed
      placeholder
      :border="false"
      style="--van-nav-bar-background: transparent; --van-nav-bar-title-text-color: #fff; --van-nav-bar-icon-color: #fff;"
    />

    <div class="content" v-if="currentSong">
      <div class="cover-section">
        <van-image
          :src="currentSong.cover"
          width="280"
          height="280"
          radius="12"
          class="cover"
        />
      </div>

      <div class="info-section">
        <div class="song-name">{{ currentSong.name }}</div>
        <div class="artist-name">{{ currentSong.artists?.[0]?.name }}</div>
      </div>

      <div class="controls-section">
        <van-icon name="delete-o" size="28" color="#fff" @click="handleTrash" />
        <van-icon 
          :name="statusStore.playStatus ? 'pause-circle' : 'play-circle'" 
          size="64" 
          color="#fff" 
          @click="togglePlay" 
        />
        <van-icon name="arrow" size="28" color="#fff" @click="handleNext" />
      </div>
    </div>

    <div v-else class="loading-state">
      <van-loading color="#fff" vertical>加载中...</van-loading>
    </div>

    <!-- 背景模糊 -->
    <div class="background" :style="{ backgroundImage: `url(${currentSong?.cover})` }"></div>
    <div class="mask"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { personalFm, personalFmToTrash } from '@core/api/rec';
import { useMusicStore, useStatusStore, useDataStore } from '@core/stores';
import { usePlayerController } from '@core/core/player/PlayerController';
import { formatSongsList } from '@core/utils/format';
import { showToast } from 'vant';

/**
 * 私人FM页面
 * 沉浸式播放体验，支持喜欢、垃圾桶、下一首
 */

const router = useRouter();
const musicStore = useMusicStore();
const statusStore = useStatusStore();
const dataStore = useDataStore();
const player = usePlayerController();

const currentSong = computed(() => musicStore.playSong);

const goBack = () => {
  router.back();
};

const loadFmData = async () => {
  try {
    const res = await personalFm();
    if (res.code === 200) {
      const songs = formatSongsList(res.data);
      if (musicStore.personalFM.list.length === 0) {
        musicStore.personalFM.list = songs;
        musicStore.personalFM.playIndex = 0;
        playCurrent();
      } else {
        musicStore.personalFM.list.push(...songs);
      }
    }
  } catch (error) {
    console.error('获取私人FM失败', error);
    showToast('获取数据失败');
  }
};

const playCurrent = async () => {
  const song = musicStore.personalFM.list[musicStore.personalFM.playIndex];
  if (song) {
    musicStore.playSong = song;
    // 私人FM模式下，播放列表只显示当前歌曲
    dataStore.playList = [song];
    await player.playSong();
  }
};

const togglePlay = () => {
  player.playOrPause();
};

const handleNext = async () => {
  musicStore.personalFM.playIndex++;
  if (musicStore.personalFM.playIndex >= musicStore.personalFM.list.length - 1) {
    // 预加载更多
    await loadFmData();
  }
  playCurrent();
};

const handleTrash = async () => {
  if (currentSong.value) {
    try {
      await personalFmToTrash(Number(currentSong.value.id));
      showToast('已移除');
      handleNext();
    } catch (error) {
      console.error('移除失败', error);
    }
  }
};

onMounted(() => {
  if (!dataStore.userLoginStatus) {
    showToast('请先登录');
    router.replace('/login');
    return;
  }
  
  if (musicStore.personalFM.list.length === 0) {
    loadFmData();
  } else {
    // 如果已经有FM数据，判断当前是否正在播放FM
    // 这里简单处理：进入页面就播放当前FM索引
    playCurrent();
  }
});
</script>

<style scoped>
.personal-fm-page {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding-bottom: 50px;
}

.cover-section {
  margin-bottom: 40px;
}

.cover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.info-section {
  text-align: center;
  margin-bottom: 60px;
  color: #fff;
}

.song-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.artist-name {
  font-size: 16px;
  opacity: 0.8;
}

.controls-section {
  display: flex;
  align-items: center;
  gap: 40px;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px);
  transform: scale(1.2);
  z-index: 0;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}
</style>
