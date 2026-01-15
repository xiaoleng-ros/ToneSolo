<template>
  <van-popup
    v-model:show="statusStore.showFullPlayer"
    position="bottom"
    :style="{ height: '100%', width: '100%' }"
    :overlay="false"
  >
    <div class="full-player">
      <div class="header">
        <van-icon name="arrow-down" size="24" @click="close" />
        <div class="header-info">
          <div class="title">{{ musicStore.playSong?.name }}</div>
          <div class="artist">{{ musicStore.playSong?.ar?.[0]?.name }}</div>
        </div>
        <van-icon name="share-o" size="24" />
      </div>

      <div class="cover-container">
        <van-image
          class="cover"
          width="280"
          height="280"
          :src="musicStore.playSong?.cover || musicStore.playSong?.al?.picUrl"
          radius="12"
        />
      </div>

      <div class="controls-container">
        <!-- Progress -->
        <div class="progress-bar">
          <span class="time">{{ formatTime(statusStore.currentTime / 1000) }}</span>
          <van-slider 
            v-model="progressValue" 
            @change="onProgressChange" 
            active-color="#ee0a24" 
            bar-height="4px" 
            button-size="12px"
            style="flex: 1; margin: 0 10px;"
          />
          <span class="time">{{ formatTime(statusStore.duration / 1000) }}</span>
        </div>

        <!-- Controls -->
        <div class="buttons">
          <van-icon name="revoke" size="28" @click="player.toggleRepeat()" />
          <van-icon name="arrow-left" size="36" @click="player.nextOrPrev('prev')" />
          <van-icon
            :name="statusStore.playStatus ? 'pause-circle' : 'play-circle'"
            size="64"
            color="#ee0a24"
            @click="player.playOrPause()"
          />
          <van-icon name="arrow" size="36" @click="player.nextOrPrev('next')" />
          <van-icon name="bars" size="28" />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { useMusicStore, useStatusStore } from '@core/stores';
import { usePlayerController } from '@core/core/player/PlayerController';
import { computed, ref, watch } from 'vue';

const musicStore = useMusicStore();
const statusStore = useStatusStore();
const player = usePlayerController();

const close = () => {
  statusStore.showFullPlayer = false;
};

// Progress handling
const progressValue = ref(0);
watch(() => statusStore.progress, (val) => {
  progressValue.value = val * 100;
});

const onProgressChange = (val: number) => {
  const time = (val / 100) * statusStore.duration;
  player.setSeek(time);
};

const formatTime = (seconds: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.full-player {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}
.header-info {
  text-align: center;
  flex: 1;
  padding: 0 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
.cover-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
.controls-container {
  margin-bottom: 40px;
}
.progress-bar {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.time {
  font-size: 12px;
  color: #999;
  width: 40px;
  text-align: center;
}
.buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
</style>
