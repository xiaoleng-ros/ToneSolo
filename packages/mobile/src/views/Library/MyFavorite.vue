<template>
  <div class="my-favorite-page">
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="router.back()"
      fixed
      placeholder
    />

    <van-tabs v-model:active="activeTab" sticky offset-top="46px" animated>
      <!-- 歌曲 Tab -->
      <van-tab title="歌曲">
        <div class="play-all-bar" @click="playAllSongs">
          <van-icon name="play-circle-o" size="24" color="var(--van-primary-color)" />
          <span class="text">播放全部</span>
          <span class="count">({{ songs.length }})</span>
        </div>
        <van-list
          v-model:loading="loading.songs"
          :finished="finished.songs"
          finished-text="没有更多了"
          @load="loadSongs"
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
              <div class="index">{{ index + 1 }}</div>
            </template>
            <template #right-icon>
              <van-icon name="play-circle-o" size="20" />
            </template>
          </van-cell>
        </van-list>
      </van-tab>

      <!-- 专辑 Tab -->
      <van-tab title="专辑">
        <van-list
          v-model:loading="loading.albums"
          :finished="finished.albums"
          finished-text="没有更多了"
          @load="loadAlbums"
        >
          <van-cell
            v-for="album in albums"
            :key="album.id"
            :title="album.name"
            :label="album.artists?.[0]?.name"
            center
            is-link
            @click="showToast('专辑详情开发中')"
          >
            <template #icon>
              <van-image :src="album.picUrl" width="50" height="50" radius="4" class="mr-10" />
            </template>
          </van-cell>
        </van-list>
      </van-tab>

      <!-- 歌手 Tab -->
      <van-tab title="歌手">
        <van-list
          v-model:loading="loading.artists"
          :finished="finished.artists"
          finished-text="没有更多了"
          @load="loadArtists"
        >
          <van-cell
            v-for="artist in artists"
            :key="artist.id"
            :title="artist.name"
            :label="'专辑: ' + artist.albumSize + ' MV: ' + artist.mvSize"
            center
            is-link
            @click="router.push(`/artist/${artist.id}`)"
          >
            <template #icon>
              <van-image :src="artist.picUrl" width="50" height="50" round class="mr-10" />
            </template>
          </van-cell>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userLike, userAlbum, userArtist } from '@core/api/user';
import { songDetail } from '@core/api/song';
import { formatSongsList } from '@core/utils/format';
import { useDataStore } from '@core/stores';
import { usePlay } from '@/composables/usePlay';
import { showToast } from 'vant';

/**
 * 我的收藏页面
 * 展示用户收藏的歌曲、专辑、歌手
 */

const router = useRouter();
const dataStore = useDataStore();
const { playSong, playList } = usePlay();

const activeTab = ref(0);

const loading = ref({
  songs: false,
  albums: false,
  artists: false,
});

const finished = ref({
  songs: false,
  albums: false,
  artists: false,
});

const songs = ref<any[]>([]);
const albums = ref<any[]>([]);
const artists = ref<any[]>([]);

// 加载喜欢的歌曲
const loadSongs = async () => {
  if (finished.songs.value) return;
  loading.songs.value = true;
  try {
    const uid = dataStore.userData?.profile?.userId;
    if (!uid) throw new Error('未登录');

    // 1. 获取 ID 列表
    const res = await userLike(uid);
    if (res.code === 200) {
      const ids = res.ids;
      if (ids.length === 0) {
        finished.songs.value = true;
        return;
      }
      
      // 2. 获取详情 (这里简单处理，一次性获取所有，如果很多需要分页)
      // 移动端通常不需要一次展示几千首，可以先获取前100首
      const limit = 100;
      const idsToFetch = ids.slice(0, limit);
      
      const detailRes = await songDetail(idsToFetch.join(','));
      if (detailRes.code === 200) {
        songs.value = formatSongsList(detailRes.songs);
      }
    }
    finished.songs.value = true; // 简单起见，一次加载完
  } catch (error) {
    console.error('获取喜欢歌曲失败', error);
    finished.songs.value = true;
  } finally {
    loading.songs.value = false;
  }
};

// 加载收藏的专辑
const loadAlbums = async () => {
  if (finished.albums.value) return;
  loading.albums.value = true;
  try {
    const res = await userAlbum(50, albums.value.length);
    if (res.code === 200) {
      albums.value.push(...res.data);
      if (!res.hasMore) {
        finished.albums.value = true;
      }
    }
  } catch (error) {
    console.error('获取收藏专辑失败', error);
    finished.albums.value = true;
  } finally {
    loading.albums.value = false;
  }
};

// 加载收藏的歌手
const loadArtists = async () => {
  if (finished.artists.value) return;
  loading.artists.value = true;
  try {
    const res = await userArtist(50, artists.value.length);
    if (res.code === 200) {
      artists.value.push(...res.data);
      if (!res.hasMore) {
        finished.artists.value = true;
      }
    }
  } catch (error) {
    console.error('获取收藏歌手失败', error);
    finished.artists.value = true;
  } finally {
    loading.artists.value = false;
  }
};

const getSongSubtitle = (song: any) => {
  const artists = (song.ar || song.artists || []).map((a: any) => a.name).join('/');
  const album = (song.al || song.album || {}).name;
  return `${artists}${album ? ' - ' + album : ''}`;
};

const playAllSongs = () => {
  if (songs.value.length === 0) return;
  playList(songs.value);
};

onMounted(() => {
  if (!dataStore.userLoginStatus) {
    showToast('请先登录');
    router.replace('/login');
  }
});
</script>

<style scoped>
.my-favorite-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.play-all-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
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

.index {
  width: 30px;
  color: #999;
  font-size: 14px;
  text-align: center;
  margin-right: 10px;
}

.mr-10 {
  margin-right: 10px;
}
</style>
