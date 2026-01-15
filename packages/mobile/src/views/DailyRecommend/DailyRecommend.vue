<template>
  <div class="daily-recommend-page">
    <van-nav-bar
      title="每日推荐"
      left-arrow
      @click-left="router.back()"
      fixed
      placeholder
    />

    <div class="header-date">
      <div class="date-info">
        <span class="day">{{ day }}</span>
        <span class="month">/ {{ month }}</span>
      </div>
      <div class="check-in">根据你的口味生成</div>
    </div>

    <div class="play-all-bar" @click="playAll">
      <van-icon name="play-circle-o" size="24" color="var(--van-primary-color)" />
      <span class="text">播放全部</span>
      <span class="count">({{ songs.length }})</span>
    </div>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text=""
    >
      <van-cell
        v-for="(song, index) in songs"
        :key="song.id"
        :title="song.name"
        :label="getSongSubtitle(song)"
        center
        @click="playSong(song)"
      >
        <template #icon>
          <van-image :src="song.al.picUrl" width="40" height="40" radius="4" class="mr-10" lazy-load />
        </template>
        <template #right-icon>
          <van-icon name="play-circle-o" size="20" />
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { dailyRecommend } from '@core/api/rec';
import { showToast } from 'vant';
import { usePlay } from '@/composables/usePlay';
import { useDataStore } from '@core/stores';

/**
 * 每日推荐页面
 * 展示根据用户喜好生成的每日推荐歌曲
 */

const router = useRouter();
const dataStore = useDataStore();
const { playSong, playList } = usePlay();

const loading = ref(true);
const finished = ref(false);
const songs = ref<any[]>([]);

const today = new Date();
const day = today.getDate().toString().padStart(2, '0');
const month = (today.getMonth() + 1).toString().padStart(2, '0');

const getSongSubtitle = (song: any) => {
  const artists = (song.ar || song.artists || []).map((a: any) => a.name).join('/');
  const album = (song.al || song.album || {}).name;
  return `${artists}${album ? ' - ' + album : ''}`;
};

const getDailySongs = async () => {
  if (!dataStore.userLoginStatus) {
    showToast('请先登录');
    router.replace('/login');
    return;
  }

  try {
    const res = await dailyRecommend('songs');
    if (res.code === 200) {
      songs.value = res.data.dailySongs;
    }
  } catch (error) {
    console.error('获取每日推荐失败', error);
    showToast('获取失败');
  } finally {
    loading.value = false;
    finished.value = true;
  }
};

const playAll = () => {
  if (songs.value.length === 0) return;
  playList(songs.value);
};

onMounted(() => {
  getDailySongs();
});
</script>

<style scoped>
.daily-recommend-page {
  min-height: 100vh;
  background-color: #fff;
}

.header-date {
  padding: 20px 16px;
  background: linear-gradient(to right, #ecf5ff, #fff);
}

.date-info {
  font-weight: bold;
  color: var(--van-primary-color);
}

.day {
  font-size: 32px;
}

.month {
  font-size: 16px;
}

.check-in {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.play-all-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  position: sticky;
  top: 46px;
  z-index: 10;
  border-bottom: 1px solid #f5f5f5;
}

.play-all-bar .text {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 500;
}

.play-all-bar .count {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.mr-10 {
  margin-right: 12px;
}
</style>
