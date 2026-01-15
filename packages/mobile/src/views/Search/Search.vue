<template>
  <div class="search-page">
    <van-nav-bar left-arrow @click-left="router.back()">
      <template #title>
        <van-search
          v-model="searchValue"
          placeholder="搜索歌曲、歌手、专辑"
          shape="round"
          autofocus
          @search="onSearch"
          @clear="onClear"
        />
      </template>
    </van-nav-bar>

    <div class="search-content">
      <!-- 搜索历史 -->
      <div v-if="!searchValue && searchHistory.length > 0" class="history-section">
        <div class="section-header">
          <span class="title">搜索历史</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="history-list">
          <van-tag
            v-for="item in searchHistory"
            :key="item"
            round
            size="medium"
            class="history-tag"
            @click="fillSearch(item)"
          >
            {{ item }}
          </van-tag>
        </div>
      </div>

      <!-- 热搜列表 -->
      <div v-if="!searchValue" class="hot-section">
        <div class="section-header">
          <span class="title">热搜榜</span>
        </div>
        <van-list>
          <van-cell
            v-for="(item, index) in hotSearches"
            :key="item.searchWord"
            @click="fillSearch(item.searchWord)"
          >
            <template #title>
              <div class="hot-item">
                <span class="index" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
                <span class="word">{{ item.searchWord }}</span>
                <img v-if="item.iconUrl" :src="item.iconUrl" class="hot-icon" />
              </div>
            </template>
            <template #label>
              <span class="hot-content">{{ item.content }}</span>
            </template>
          </van-cell>
        </van-list>
      </div>

      <!-- 搜索建议 -->
      <div v-if="searchValue && !isSearching" class="suggest-section">
        <van-cell
          v-for="item in searchSuggestions"
          :key="item.keyword"
          icon="search"
          @click="fillSearch(item.keyword)"
        >
          <template #title>
            <span v-html="highlightKeyword(item.keyword)"></span>
          </template>
        </van-cell>
      </div>

      <!-- 搜索结果 -->
      <div v-if="isSearching" class="result-section">
        <van-tabs v-model:active="activeTab" sticky offset-top="46">
          <van-tab title="单曲" name="single">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoadMore"
            >
              <van-cell
                v-for="song in searchResults.songs"
                :key="song.id"
                :title="song.name"
                :label="formatArtists(song.ar) + ' - ' + song.al.name"
                @click="playSong(song)"
              >
                <template #right-icon>
                  <van-icon name="play-circle-o" size="20" />
                </template>
              </van-cell>
            </van-list>
          </van-tab>
          <van-tab title="歌单" name="playlist">
            <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoadMore"
            >
              <van-cell
                v-for="playlist in searchResults.playlists"
                :key="playlist.id"
                :title="playlist.name"
                :label="playlist.trackCount + '首 by ' + playlist.creator.nickname"
                center
                @click="goPlaylistDetail(playlist.id)"
              >
                <template #icon>
                  <van-image :src="playlist.coverImgUrl" width="50" height="50" radius="4" class="mr-10" />
                </template>
              </van-cell>
            </van-list>
          </van-tab>
          <van-tab title="歌手" name="artist">
             <van-list
              v-model:loading="loading"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoadMore"
            >
              <van-cell
                v-for="artist in searchResults.artists"
                :key="artist.id"
                :title="artist.name"
                center
                @click="goArtistDetail(artist.id)"
              >
                <template #icon>
                  <van-image :src="artist.picUrl" width="50" height="50" round class="mr-10" />
                </template>
              </van-cell>
            </van-list>
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { searchHot, searchSuggest, searchResult, SearchTypes } from '@core/api/search';
import { showToast } from 'vant';
import { usePlay } from '@/composables/usePlay';

/**
 * 搜索页面组件
 * 实现关键词搜索、热搜榜、搜索建议和结果展示
 */

const router = useRouter();
const { playSong } = usePlay();
const searchValue = ref('');
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'));
const hotSearches = ref<any[]>([]);
const searchSuggestions = ref<any[]>([]);
const isSearching = ref(false);
const activeTab = ref('single');
const loading = ref(false);
const finished = ref(false);
const offset = ref(0);
const limit = 30;

const searchResults = ref({
  songs: [] as any[],
  playlists: [] as any[],
  artists: [] as any[]
});

// 获取热搜
const getHotSearches = async () => {
  try {
    const res = await searchHot();
    if (res.code === 200) {
      hotSearches.value = res.data;
    }
  } catch (error) {
    console.error('获取热搜失败', error);
  }
};

// 搜索建议
watch(searchValue, async (newVal) => {
  if (!newVal) {
    searchSuggestions.value = [];
    isSearching.value = false;
    return;
  }
  if (isSearching.value) return;

  try {
    const res = await searchSuggest(newVal, true);
    if (res.code === 200 && res.result.allMatch) {
      searchSuggestions.value = res.result.allMatch;
    } else {
      searchSuggestions.value = [];
    }
  } catch (error) {
    console.error('获取搜索建议失败', error);
  }
});

// 执行搜索
const onSearch = async (val?: string) => {
  const keyword = val || searchValue.value;
  if (!keyword) return;

  searchValue.value = keyword;
  isSearching.value = true;
  saveHistory(keyword);
  resetResults();
  await performSearch();
};

const performSearch = async () => {
  loading.value = true;
  try {
    let type = SearchTypes.Single;
    if (activeTab.value === 'playlist') type = SearchTypes.Playlist;
    if (activeTab.value === 'artist') type = SearchTypes.Artist;

    const res = await searchResult(searchValue.value, limit, offset.value, type);
    if (res.code === 200) {
      const result = res.result;
      if (activeTab.value === 'single') {
        searchResults.value.songs.push(...(result.songs || []));
        finished.value = !result.hasMore;
      } else if (activeTab.value === 'playlist') {
        searchResults.value.playlists.push(...(result.playlists || []));
        finished.value = (searchResults.value.playlists.length >= result.playlistCount);
      } else if (activeTab.value === 'artist') {
        searchResults.value.artists.push(...(result.artists || []));
        finished.value = (searchResults.value.artists.length >= result.artistCount);
      }
      offset.value += limit;
    }
  } catch (error) {
    console.error('搜索失败', error);
    showToast('搜索失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onLoadMore = () => {
  if (isSearching.value && !finished.value) {
    performSearch();
  }
};

const onClear = () => {
  isSearching.value = false;
  resetResults();
};

const resetResults = () => {
  searchResults.value = { songs: [], playlists: [], artists: [] };
  offset.value = 0;
  finished.value = false;
};

const fillSearch = (keyword: string) => {
  onSearch(keyword);
};

const saveHistory = (keyword: string) => {
  const index = searchHistory.value.indexOf(keyword);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
  searchHistory.value.unshift(keyword);
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop();
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
};

const clearHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('searchHistory');
};

const highlightKeyword = (text: string) => {
  if (!searchValue.value) return text;
  const reg = new RegExp(`(${searchValue.value})`, 'gi');
  return text.replace(reg, '<span style="color: var(--van-primary-color)">$1</span>');
};

const formatArtists = (artists: any[]) => {
  return (artists || []).map(a => a.name).join('/');
};

const goPlaylistDetail = (id: number) => {
  router.push(`/playlist/${id}`);
};

const goArtistDetail = (id: number) => {
  router.push(`/artist/${id}`);
};

watch(activeTab, () => {
  if (isSearching.value) {
    resetResults();
    performSearch();
  }
});

onMounted(() => {
  getHotSearches();
});
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: var(--van-background-2);

  :deep(.van-nav-bar__title) {
    max-width: 80%;
    width: 80%;
  }

  .search-content {
    padding: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .history-section {
    margin-bottom: 24px;

    .history-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .history-tag {
        padding: 4px 12px;
        background-color: var(--van-background);
        color: var(--van-text-color);
      }
    }
  }

  .hot-item {
    display: flex;
    align-items: center;

    .index {
      width: 24px;
      font-size: 16px;
      font-weight: 600;
      color: var(--van-text-color-3);

      &.top-three {
        color: var(--van-danger-color);
      }
    }

    .word {
      font-size: 15px;
      font-weight: 500;
      margin-right: 6px;
    }

    .hot-icon {
      height: 12px;
    }
  }

  .hot-content {
    font-size: 12px;
    color: var(--van-text-color-2);
  }

  .mr-10 {
    margin-right: 10px;
  }

  .result-section {
    margin: -16px;
  }
}
</style>
