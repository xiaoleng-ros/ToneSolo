<template>
  <div class="artist-detail">
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
        <span v-if="navOpacity > 0.5" class="nav-title">{{ artist?.name }}</span>
      </template>
    </van-nav-bar>

    <div class="artist-header">
      <van-image :src="artist?.cover" fit="cover" width="100%" height="280" />
      <div class="header-info">
        <div class="name">{{ artist?.name }}</div>
        <div class="fans" v-if="artistDetailData?.secondaryExpertIdentiy">
          {{ artistDetailData.secondaryExpertIdentiy[0]?.expertIdentiyName }}
        </div>
        <div class="actions">
          <van-button round type="primary" size="small" icon="plus">关注</van-button>
          <van-button round plain type="default" size="small" icon="share-o">分享</van-button>
        </div>
      </div>
    </div>

    <div class="content">
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <van-tab title="主页" name="home">
          <div class="section-card">
            <div class="section-title">歌手简介</div>
            <div class="brief van-multi-ellipsis--l3" @click="showFullDesc = true">
              {{ artist?.briefDesc }}
            </div>
            <div class="more" v-if="artist?.briefDesc" @click="showFullDesc = true">
              更多信息 <van-icon name="arrow" />
            </div>
          </div>

          <div class="section-card" v-if="hotSongs.length > 0">
            <div class="section-title">
              <span>热门歌曲</span>
              <van-button plain round size="mini" @click="activeTab = 'songs'">查看全部</van-button>
            </div>
            <van-cell
              v-for="(song, index) in hotSongs.slice(0, 5)"
              :key="song.id"
              :title="song.name"
              :label="song.al.name"
              center
              @click="playSong(song)"
            >
              <template #icon>
                <span class="index">{{ index + 1 }}</span>
              </template>
            </van-cell>
          </div>
        </van-tab>

        <van-tab title="歌曲" name="songs">
          <van-list
            v-model:loading="songsLoading"
            :finished="songsFinished"
            finished-text="没有更多了"
            @load="onLoadMoreSongs"
          >
            <van-cell
              v-for="(song, index) in allSongs"
              :key="song.id"
              :title="song.name"
              :label="song.al.name"
              center
              @click="playSong(song)"
            >
              <template #icon>
                <span class="index">{{ index + 1 }}</span>
              </template>
              <template #right-icon>
                <van-icon name="play-circle-o" size="18" />
              </template>
            </van-cell>
          </van-list>
        </van-tab>

        <van-tab title="专辑" name="albums">
          <van-list
            v-model:loading="albumsLoading"
            :finished="albumsFinished"
            finished-text="没有更多了"
            @load="onLoadMoreAlbums"
          >
            <van-grid :column-num="2" :border="false" :gutter="16" style="padding: 16px">
              <van-grid-item
                v-for="album in albums"
                :key="album.id"
                @click="goAlbumDetail(album.id)"
              >
                <van-image :src="album.picUrl" radius="8" />
                <div class="album-name van-ellipsis">{{ album.name }}</div>
                <div class="album-date">{{ formatDate(album.publishTime) }}</div>
              </van-grid-item>
            </van-grid>
          </van-list>
        </van-tab>
      </van-tabs>
    </div>

    <!-- Artist Description Popup -->
    <van-popup
      v-model:show="showFullDesc"
      position="bottom"
      round
      :style="{ height: '60%' }"
      closeable
    >
      <div class="desc-popup">
        <div class="title">{{ artist?.name }}</div>
        <div class="content-text">{{ artist?.briefDesc }}</div>
      </div>
    </van-popup>

    <!-- Loading Overlay -->
    <van-overlay :show="pageLoading" class-name="loading-overlay">
      <van-loading type="spinner" vertical>加载中...</van-loading>
    </van-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { artistDetail, artistHotSongs, artistAllSongs, artistAblums } from '@core/api/artist';
import { showToast } from 'vant';
import { usePlay } from '@/composables/usePlay';

/**
 * 歌手详情页面组件
 * 展示歌手信息、热门歌曲、全部歌曲和专辑列表
 */

const route = useRoute();
const router = useRouter();
const { playSong, playList } = usePlay();
const artistId = Number(route.params.id);

const artist = ref<any>(null);
const artistDetailData = ref<any>(null);
const hotSongs = ref<any[]>([]);
const allSongs = ref<any[]>([]);
const albums = ref<any[]>([]);
const activeTab = ref('home');
const navOpacity = ref(0);
const pageLoading = ref(true);
const showFullDesc = ref(false);

const songsLoading = ref(false);
const songsFinished = ref(false);
const songsOffset = ref(0);

const albumsLoading = ref(false);
const albumsFinished = ref(false);
const albumsOffset = ref(0);

const limit = 30;

// 获取歌手基本信息
const getArtistInfo = async () => {
  try {
    const [detailRes, hotSongsRes] = await Promise.all([
      artistDetail(artistId),
      artistHotSongs(artistId)
    ]);

    if (detailRes.code === 200) {
      artist.value = detailRes.data.artist;
      artistDetailData.value = detailRes.data;
    }

    if (hotSongsRes.code === 200) {
      hotSongs.value = hotSongsRes.hotSongs;
    }
  } catch (error) {
    console.error('获取歌手信息失败', error);
  } finally {
    pageLoading.value = false;
  }
};

// 分页获取全部歌曲
const getSongs = async () => {
  if (songsFinished.value) return;
  songsLoading.value = true;
  try {
    const res = await artistAllSongs(artistId, limit, songsOffset.value);
    if (res.code === 200) {
      allSongs.value.push(...res.songs);
      songsOffset.value += limit;
      if (!res.more) songsFinished.value = true;
    }
  } catch (error) {
    console.error('获取歌曲失败', error);
  } finally {
    songsLoading.value = false;
  }
};

// 分页获取专辑
const getAlbums = async () => {
  if (albumsFinished.value) return;
  albumsLoading.value = true;
  try {
    const res = await artistAblums(artistId, limit, albumsOffset.value);
    if (res.code === 200) {
      albums.value.push(...res.hotAlbums);
      albumsOffset.value += limit;
      if (!res.more) albumsFinished.value = true;
    }
  } catch (error) {
    console.error('获取专辑失败', error);
  } finally {
    albumsLoading.value = false;
  }
};

const onLoadMoreSongs = () => {
  if (!pageLoading.value) getSongs();
};

const onLoadMoreAlbums = () => {
  if (!pageLoading.value) getAlbums();
};

const onScroll = (e: Event) => {
  const scrollTop = (e.target as HTMLElement).scrollTop || window.scrollY;
  const opacity = Math.min(scrollTop / 200, 1);
  navOpacity.value = opacity;
};

/**
 * 格式化索引
 * @param index 索引
 */
const formatIndex = (index: number) => {
  return index + 1;
};

/**
 * 获取歌曲副标题（专辑）
 * @param song 歌曲对象
 */
const getSongSubtitle = (song: any) => {
  const album = (song.al || song.album || {}).name;
  return album || '';
};

const goAlbumDetail = (id: number) => {
  showToast(`跳转专辑: ${id}`);
};

const formatDate = (time: number) => {
  return new Date(time).toLocaleDateString();
};

onMounted(() => {
  getArtistInfo();
  window.addEventListener('scroll', onScroll, true);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll, true);
});
</script>

<style lang="scss" scoped>
.artist-detail {
  min-height: 100vh;
  background-color: var(--van-background-2);

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

  .artist-header {
    position: relative;
    height: 280px;

    .header-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px 16px;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: #fff;

      .name {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .fans {
        font-size: 13px;
        opacity: 0.8;
        margin-bottom: 12px;
      }

      .actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .content {
    background-color: var(--van-background-2);
    min-height: 500px;
  }

  .section-card {
    margin: 12px 16px;
    padding: 16px;
    background-color: var(--van-background);
    border-radius: 12px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brief {
      font-size: 14px;
      color: var(--van-text-color-2);
      line-height: 1.6;
    }

    .more {
      text-align: center;
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 12px;
    }
  }

  .index {
    width: 30px;
    color: var(--van-text-color-3);
    font-size: 15px;
  }

  .album-name {
    margin-top: 8px;
    font-size: 14px;
    color: var(--van-text-color);
  }

  .album-date {
    font-size: 12px;
    color: var(--van-text-color-3);
    margin-top: 2px;
  }

  .desc-popup {
    padding: 24px 16px;

    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
    }

    .content-text {
      font-size: 14px;
      color: var(--van-text-color-2);
      line-height: 1.8;
      white-space: pre-wrap;
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
