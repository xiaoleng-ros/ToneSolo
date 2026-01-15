<template>
  <div class="playlist-detail">
    <!-- Navbar with dynamic background -->
    <van-nav-bar
      left-arrow
      fixed
      placeholder
      :border="false"
      @click-left="router.back()"
      class="custom-nav"
      :style="{ backgroundColor: `rgba(255, 255, 255, ${navOpacity})` }"
    >
      <template #title>
        <span v-if="navOpacity > 0.5" class="nav-title">{{ playlist?.name }}</span>
      </template>
    </van-nav-bar>

    <div class="header-bg" :style="{ backgroundImage: `url(${playlist?.coverImgUrl})` }"></div>

    <div class="content" @scroll="onScroll">
      <!-- Playlist Info -->
      <div class="info-section">
        <div class="cover-wrapper">
          <van-image :src="playlist?.coverImgUrl" radius="12" />
          <div class="play-count">
            <van-icon name="play" />
            {{ formatPlayCount(playlist?.playCount || 0) }}
          </div>
        </div>
        <div class="detail-text">
          <div class="name van-multi-ellipsis--l2">{{ playlist?.name }}</div>
          <div class="creator" v-if="playlist?.creator" @click="goUserDetail(playlist.creator.userId)">
            <van-image :src="playlist.creator.avatarUrl" round width="24" height="24" />
            <span class="nickname">{{ playlist.creator.nickname }}</span>
            <van-icon name="plus" class="follow-icon" />
          </div>
          <div class="description van-ellipsis" v-if="playlist?.description">
            {{ playlist.description }}
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="action-bar">
        <div class="action-item">
          <van-icon name="share-o" />
          <span>{{ playlist?.shareCount || '分享' }}</span>
        </div>
        <div class="action-item">
          <van-icon name="comment-o" />
          <span>{{ playlist?.commentCount || '评论' }}</span>
        </div>
        <div class="action-item highlight">
          <van-icon name="star-o" />
          <span>{{ playlist?.subscribedCount || '收藏' }}</span>
        </div>
      </div>

      <!-- Song List -->
      <div class="song-list-container">
        <div class="list-header" sticky>
          <div class="play-all" @click="playAll">
            <van-icon name="play-circle" class="play-icon" />
            <span class="title">播放全部</span>
            <span class="count">({{ playlist?.trackCount }})</span>
          </div>
          <div class="multi-select">
            <van-icon name="ascending" />
          </div>
        </div>

        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoadMore"
        >
          <van-cell
            v-for="(song, index) in songs"
            :key="song.id"
            center
            class="song-item"
            @click="playSong(song)"
          >
            <template #icon>
              <span class="index">{{ index + 1 }}</span>
            </template>
            <template #title>
              <div class="song-info">
                <div class="song-name van-ellipsis">{{ song.name }}</div>
                <div class="song-desc van-ellipsis">
                  <van-tag v-if="song.fee === 1" plain type="danger" size="mini">VIP</van-tag>
                  {{ formatArtists(song.ar) }} - {{ song.al.name }}
                </div>
              </div>
            </template>
            <template #right-icon>
              <van-icon name="more-o" class="more-icon" @click.stop="showAction(song)" />
            </template>
          </van-cell>
        </van-list>
      </div>
    </div>

    <!-- Loading Overlay -->
    <van-overlay :show="pageLoading" class-name="loading-overlay">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </van-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { playlistDetail, playlistAllSongs } from '@core/api/playlist';
import { formatPlayCount } from '@core/utils/format';
import { showToast } from 'vant';
import { usePlay } from '@/composables/usePlay';

/**
 * 歌单详情页面组件
 * 展示歌单封面、信息、操作栏和歌曲列表
 */

const route = useRoute();
const router = useRouter();
const { playSong, playList } = usePlay();
const playlistId = Number(route.params.id);

const playlist = ref<any>(null);
const songs = ref<any[]>([]);
const pageLoading = ref(true);
const loading = ref(false);
const finished = ref(false);
const offset = ref(0);
const limit = 50;
const navOpacity = ref(0);

// 获取歌单详情
const getDetail = async () => {
  try {
    const res = await playlistDetail(playlistId);
    if (res.code === 200) {
      playlist.value = res.playlist;
      // 首次加载歌曲
      await getSongs();
    }
  } catch (error) {
    console.error('获取歌单详情失败', error);
    showToast('加载失败');
  } finally {
    pageLoading.value = false;
  }
};

// 分页获取歌曲
const getSongs = async () => {
  if (finished.value) return;
  loading.value = true;
  try {
    const res = await playlistAllSongs(playlistId, limit, offset.value);
    if (res.code === 200) {
      songs.value.push(...res.songs);
      offset.value += limit;
      if (songs.value.length >= (playlist.value?.trackCount || 0)) {
        finished.value = true;
      }
    }
  } catch (error) {
    console.error('获取歌曲列表失败', error);
  } finally {
    loading.value = false;
  }
};

const onLoadMore = () => {
  if (!pageLoading.value && !finished.value) {
    getSongs();
  }
};

const onScroll = (e: Event) => {
  const scrollTop = (e.target as HTMLElement).scrollTop;
  const opacity = Math.min(scrollTop / 200, 1);
  navOpacity.value = opacity;
};

const formatArtists = (artists: any[]) => {
  return artists.map(a => a.name).join('/');
};

/**
 * 播放全部歌曲
 */
const playAll = () => {
  if (songs.value.length === 0) return;
  playList(songs.value);
};

/**
 * 格式化索引
 * @param index 索引
 */
const formatIndex = (index: number) => {
  return index + 1;
};

/**
 * 获取歌曲副标题（歌手 - 专辑）
 * @param song 歌曲对象
 */
const getSongSubtitle = (song: any) => {
  const artists = (song.ar || song.artists || []).map((a: any) => a.name).join('/');
  const album = (song.al || song.album || {}).name;
  return `${artists}${album ? ' - ' + album : ''}`;
};

const showAction = (song: any) => {
  showToast(`更多操作: ${song.name}`);
};

const goUserDetail = (uid: number) => {
  showToast(`跳转用户: ${uid}`);
};

onMounted(() => {
  getDetail();
  window.addEventListener('scroll', onScroll, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<style lang="scss" scoped>
.playlist-detail {
  min-height: 100vh;
  background-color: var(--van-background);
  position: relative;

  .custom-nav {
    transition: background-color 0.3s;
    :deep(.van-nav-bar__arrow) {
      color: #fff;
    }
  }

  .nav-title {
    color: var(--van-text-color);
    font-size: 16px;
    font-weight: 600;
  }

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background-size: cover;
    background-position: center;
    filter: blur(40px) brightness(0.7);
    transform: scale(1.2);
    z-index: 0;
  }

  .content {
    position: relative;
    z-index: 1;
    height: 100vh;
    overflow-y: auto;
    padding-top: 46px;
  }

  .info-section {
    padding: 20px 16px;
    display: flex;
    gap: 16px;
    color: #fff;

    .cover-wrapper {
      position: relative;
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-radius: 12px;

      .play-count {
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 10px;
        display: flex;
        align-items: center;
        gap: 2px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
    }

    .detail-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 4px 0;

      .name {
        font-size: 16px;
        font-weight: 600;
        line-height: 1.4;
      }

      .creator {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
        opacity: 0.9;

        .nickname {
          font-size: 13px;
        }

        .follow-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px;
          border-radius: 50%;
          font-size: 12px;
        }
      }

      .description {
        font-size: 11px;
        opacity: 0.7;
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: space-around;
    padding: 0 16px 20px;
    color: #fff;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 20px;
      border-radius: 20px;
      font-size: 12px;
      min-width: 60px;

      .van-icon {
        font-size: 18px;
      }

      &.highlight {
        background: var(--van-primary-color);
      }
    }
  }

  .song-list-container {
    background-color: var(--van-background);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    min-height: 600px;
    padding-bottom: 50px;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--van-background);
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      position: sticky;
      top: 46px;
      z-index: 10;

      .play-all {
        display: flex;
        align-items: center;
        gap: 8px;

        .play-icon {
          font-size: 24px;
          color: var(--van-primary-color);
        }

        .title {
          font-size: 16px;
          font-weight: 600;
        }

        .count {
          font-size: 12px;
          color: var(--van-text-color-2);
        }
      }

      .multi-select {
        font-size: 20px;
        color: var(--van-text-color);
      }
    }

    .song-item {
      padding: 10px 16px;

      .index {
        width: 30px;
        color: var(--van-text-color-3);
        font-size: 15px;
      }

      .song-info {
        .song-name {
          font-size: 15px;
          color: var(--van-text-color);
          margin-bottom: 4px;
        }

        .song-desc {
          font-size: 11px;
          color: var(--van-text-color-2);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .more-icon {
        font-size: 18px;
        color: var(--van-text-color-3);
      }
    }
  }

  .loading-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--van-background);
  }
}
</style>
