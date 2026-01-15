<template>
  <div class="discover-page">
    <van-nav-bar title="发现" fixed placeholder safe-area-inset-top />
    
    <van-tabs v-model:active="activeTab" sticky offset-top="46px" animated swipeable>
      <!-- 歌单 Tab -->
      <van-tab title="歌单">
        <div class="playlist-section">
          <!-- 分类标签 -->
          <div class="category-tags">
            <van-tag 
              v-for="cat in categories" 
              :key="cat"
              :plain="selectedCat !== cat"
              type="primary"
              size="large"
              round
              class="cat-tag"
              @click="changeCategory(cat)"
            >
              {{ cat }}
            </van-tag>
          </div>

          <!-- 歌单列表 -->
          <van-list
            v-model:loading="playlistLoading"
            :finished="playlistFinished"
            finished-text="没有更多了"
            @load="loadPlaylists"
          >
            <van-grid :column-num="2" :border="false" :gutter="12" class="playlist-grid">
              <van-grid-item 
                v-for="item in playlists" 
                :key="item.id" 
                @click="goPlaylistDetail(item.id)"
              >
                <div class="playlist-card">
                  <div class="cover-wrapper">
                    <van-image :src="item.coverImgUrl" radius="12" lazy-load />
                    <div class="play-count">
                      <van-icon name="play" />
                      {{ formatPlayCount(item.playCount) }}
                    </div>
                  </div>
                  <div class="playlist-name van-multi-ellipsis--l2">{{ item.name }}</div>
                </div>
              </van-grid-item>
            </van-grid>
          </van-list>
        </div>
      </van-tab>

      <!-- 排行榜 Tab -->
      <van-tab title="排行榜">
        <div class="toplist-section">
          <div v-if="toplistLoading" class="loading-box">
            <van-loading vertical>加载中...</van-loading>
          </div>
          <div v-else>
            <!-- 官方榜 -->
            <div class="section-title">官方榜</div>
            <div 
              v-for="item in officialToplist" 
              :key="item.id" 
              class="official-card"
              @click="goPlaylistDetail(item.id)"
            >
              <van-image :src="item.coverImgUrl" width="100" height="100" radius="8" />
              <div class="official-info">
                <div class="official-name">{{ item.name }}</div>
                <div class="official-tracks">
                  <div v-for="(track, index) in item.tracks" :key="index" class="track-item van-ellipsis">
                    {{ index + 1 }}. {{ track.first }} - {{ track.second }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 全球榜/精选榜 -->
            <div class="section-title">精选榜</div>
            <van-grid :column-num="3" :border="false" :gutter="10" class="selected-grid">
              <van-grid-item 
                v-for="item in selectedToplist" 
                :key="item.id"
                @click="goPlaylistDetail(item.id)"
              >
                <van-image :src="item.coverImgUrl" radius="8" />
                <div class="playlist-name van-ellipsis">{{ item.name }}</div>
              </van-grid-item>
            </van-grid>
          </div>
        </div>
      </van-tab>

      <!-- 歌手 Tab -->
      <van-tab title="歌手">
        <div class="artist-section">
          <!-- 歌手筛选 -->
          <div class="filter-box">
            <div class="filter-row">
              <span 
                v-for="type in artistTypes" 
                :key="type.value"
                :class="{ active: selectedArtistType === type.value }"
                @click="changeArtistType(type.value)"
              >
                {{ type.label }}
              </span>
            </div>
            <div class="filter-row">
              <span 
                v-for="area in artistAreas" 
                :key="area.value"
                :class="{ active: selectedArtistArea === area.value }"
                @click="changeArtistArea(area.value)"
              >
                {{ area.label }}
              </span>
            </div>
          </div>

          <!-- 歌手列表 -->
          <van-list
            v-model:loading="artistLoading"
            :finished="artistFinished"
            finished-text="没有更多了"
            @load="loadArtists"
          >
            <div class="artist-list">
              <div 
                v-for="item in artists" 
                :key="item.id" 
                class="artist-card"
                @click="goArtistDetail(item.id)"
              >
                <van-image :src="item.img1v1Url" round width="50" height="50" />
                <span class="artist-name">{{ item.name }}</span>
                <van-button size="small" round type="primary" plain class="follow-btn">关注</van-button>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import { allCatlistPlaylist, topPlaylist } from '@core/api/playlist';
import { topArtists } from '@core/api/rec';
import { artistTypeList } from '@core/api/artist';
import { formatCoverList, formatArtistsList } from '@core/utils/format';

/**
 * 发现页面组件
 * 包含歌单、排行榜、歌手三个板块
 */

const router = useRouter();
const route = useRoute();
const activeTab = ref(0);

onMounted(() => {
  if (route.query.tab === 'toplist') {
    activeTab.value = 1;
  } else if (route.query.tab === 'artist') {
    activeTab.value = 2;
  }
  
  loadToplists();
});

// 歌单相关
const playlistLoading = ref(false);
const playlistFinished = ref(false);
const playlists = ref<any[]>([]);
const selectedCat = ref('全部');
const categories = ['全部', '华语', '流行', '摇滚', '民谣', '电子', '轻音乐'];
let playlistOffset = 0;

// 排行榜相关
const toplistLoading = ref(false);
const officialToplist = ref<any[]>([]);
const selectedToplist = ref<any[]>([]);

// 歌手相关
const artistLoading = ref(false);
const artistFinished = ref(false);
const artists = ref<any[]>([]);
const selectedArtistType = ref(-1);
const selectedArtistArea = ref(-1);
let artistOffset = 0;

const artistTypes = [
  { label: '全部', value: -1 },
  { label: '男歌手', value: 1 },
  { label: '女歌手', value: 2 },
  { label: '乐队', value: 3 },
];

const artistAreas = [
  { label: '全部', value: -1 },
  { label: '华语', value: 7 },
  { label: '欧美', value: 96 },
  { label: '日本', value: 8 },
  { label: '韩国', value: 16 },
];

// 格式化播放次数
const formatPlayCount = (count: number) => {
  if (count >= 100000000) return (count / 100000000).toFixed(1) + '亿';
  if (count >= 10000) return (count / 10000).toFixed(1) + '万';
  return count;
};

// 加载歌单
const loadPlaylists = async () => {
  playlistLoading.value = true;
  try {
    const res = await allCatlistPlaylist(selectedCat.value, 20, playlistOffset);
    if (res.code === 200) {
      const formatted = formatCoverList(res.playlists);
      playlists.value.push(...formatted);
      playlistOffset += 20;
      if (!res.more) playlistFinished.value = true;
    }
  } catch (error) {
    showToast('加载歌单失败');
  } finally {
    playlistLoading.value = false;
  }
};

const changeCategory = (cat: string) => {
  selectedCat.value = cat;
  playlists.value = [];
  playlistOffset = 0;
  playlistFinished.value = false;
  loadPlaylists();
};

// 加载排行榜
const loadToplists = async () => {
  toplistLoading.value = true;
  try {
    const res = await topPlaylist(true); // 获取详情
    if (res.code === 200) {
      officialToplist.value = res.list.filter((v: any) => v.ToplistType !== undefined);
      selectedToplist.value = formatCoverList(res.list.filter((v: any) => v.ToplistType === undefined));
    }
  } catch (error) {
    showToast('加载排行榜失败');
  } finally {
    toplistLoading.value = false;
  }
};

// 加载歌手
const loadArtists = async () => {
  artistLoading.value = true;
  try {
    const res = await artistTypeList(
      selectedArtistType.value,
      selectedArtistArea.value,
      -1,
      artistOffset,
      20
    );
    if (res.code === 200) {
      const formatted = formatArtistsList(res.artists);
      artists.value.push(...formatted);
      artistOffset += 20;
      if (!res.more) artistFinished.value = true;
    }
  } catch (error) {
    showToast('加载歌手失败');
  } finally {
    artistLoading.value = false;
  }
};

const changeArtistType = (type: number) => {
  selectedArtistType.value = type;
  resetArtists();
};

const changeArtistArea = (area: number) => {
  selectedArtistArea.value = area;
  resetArtists();
};

const resetArtists = () => {
  artists.value = [];
  artistOffset = 0;
  artistFinished.value = false;
  loadArtists();
};

// 页面跳转
const goPlaylistDetail = (id: number) => {
  router.push(`/playlist/${id}`);
};

const goArtistDetail = (id: number) => {
  router.push(`/artist/${id}`);
};
</script>

<style lang="scss" scoped>
.discover-page {
  padding-bottom: 80px;
  background-color: var(--van-background-2);
}

.playlist-section {
  .category-tags {
    display: flex;
    overflow-x: auto;
    padding: 12px 16px;
    gap: 10px;
    &::-webkit-scrollbar { display: none; }
    
    .cat-tag {
      flex-shrink: 0;
      padding: 6px 16px;
    }
  }

  .playlist-grid {
    padding: 0 4px;
    
    .playlist-card {
      width: 100%;
      
      .cover-wrapper {
        position: relative;
        .play-count {
          position: absolute;
          top: 6px;
          right: 8px;
          color: #fff;
          font-size: 11px;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 10px;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          .van-icon { margin-right: 3px; }
        }
      }
      
      .playlist-name {
        margin-top: 8px;
        font-size: 13px;
        color: var(--van-text-color);
        padding: 0 4px;
      }
    }
  }
}

.toplist-section {
  padding: 16px;
  
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 12px;
    &:first-child { margin-top: 0; }
  }

  .official-card {
    display: flex;
    background: var(--van-background);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    
    .official-info {
      flex: 1;
      margin-left: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      overflow: hidden;
      
      .official-name {
        font-size: 16px;
        font-weight: 600;
      }
      
      .official-tracks {
        .track-item {
          font-size: 12px;
          color: var(--van-text-color-2);
          margin-top: 4px;
        }
      }
    }
  }
  
  .selected-grid {
    .playlist-name {
      margin-top: 6px;
      font-size: 12px;
      text-align: center;
      width: 100%;
    }
  }
}

.artist-section {
  .filter-box {
    padding: 12px 16px;
    background: var(--van-background);
    
    .filter-row {
      display: flex;
      overflow-x: auto;
      gap: 16px;
      margin-bottom: 12px;
      &:last-child { margin-bottom: 0; }
      &::-webkit-scrollbar { display: none; }
      
      span {
        flex-shrink: 0;
        font-size: 14px;
        color: var(--van-text-color-2);
        &.active {
          color: var(--van-primary-color);
          font-weight: 600;
        }
      }
    }
  }

  .artist-list {
    padding: 12px 16px;
    
    .artist-card {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--van-gray-2);
      
      .artist-name {
        flex: 1;
        margin-left: 16px;
        font-size: 15px;
      }
      
      .follow-btn {
        padding: 0 16px;
      }
    }
  }
}

.loading-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
