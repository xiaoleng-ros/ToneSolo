<template>
  <div class="home-page">
    <van-nav-bar title="ToneSolo" fixed placeholder safe-area-inset-top />
    
    <div class="content">
      <!-- Search Bar -->
      <van-search 
        v-model="searchValue"
        placeholder="搜索歌曲、歌手、专辑" 
        shape="round" 
        background="transparent" 
        @click-input="onSearchClick"
      />

      <!-- Banner -->
      <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="(item, index) in banners" :key="index">
          <div class="banner-item">
            <van-image :src="item.pic" fit="cover" width="100%" height="150" radius="8" />
            <div class="banner-tag" :style="{ backgroundColor: item.titleColor }">{{ item.typeTitle }}</div>
          </div>
        </van-swipe-item>
        <template v-if="loading && banners.length === 0">
          <van-swipe-item v-for="i in 1" :key="i">
            <div class="banner-item loading">
              <van-loading type="spinner" />
            </div>
          </van-swipe-item>
        </template>
      </van-swipe>

      <!-- Menus -->
      <van-grid :column-num="4" :border="false" class="menu-grid">
        <van-grid-item icon="fire-o" text="每日推荐" @click="playDaily" />
        <van-grid-item icon="music-o" text="私人FM" @click="playFM" />
        <van-grid-item icon="wap-nav" text="歌单广场" @click="goPlaylistSquare" />
        <van-grid-item icon="bar-chart-o" text="排行榜" @click="goTopList" />
      </van-grid>

      <!-- Recommended Playlists -->
      <div class="section-title">
        <span>推荐歌单</span>
        <van-icon name="arrow" @click="goPlaylistSquare" />
      </div>
      <van-grid :column-num="3" :border="false" :gutter="10" style="padding: 0 10px">
        <van-grid-item 
          v-for="item in playlists" 
          :key="item.id" 
          class="playlist-item"
          @click="goPlaylistDetail(item.id)"
        >
          <div class="cover-wrapper">
            <van-image :src="item.cover" radius="8" lazy-load />
            <div class="play-count">
              <van-icon name="play" />
              {{ formatPlayCount(item.playCount) }}
            </div>
          </div>
          <div class="playlist-name van-multi-ellipsis--l2">{{ item.name }}</div>
        </van-grid-item>
      </van-grid>
      
      <div v-if="loading && playlists.length === 0" class="loading-placeholder">
        <van-loading size="24px">加载中...</van-loading>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getBanner, personalized } from '@core/api/rec';
import { formatCoverList } from '@core/utils/format';
import { useDataStore } from '@core/stores';

/**
 * 首页组件
 * 展示轮播图、功能入口和推荐歌单
 */

const router = useRouter();
const dataStore = useDataStore();

const loading = ref(true);
const searchValue = ref('');
const banners = ref<any[]>([]);
const playlists = ref<any[]>([]);

// 格式化播放次数
const formatPlayCount = (count: number) => {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿';
  }
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count;
};

// 获取首页数据
const initData = async () => {
  loading.value = true;
  try {
    const [bannerRes, playlistRes] = await Promise.all([
      getBanner(1), // Android
      personalized('playlist', 6)
    ]);
    
    if (bannerRes.code === 200) {
      banners.value = bannerRes.banners;
    }
    
    if (playlistRes.code === 200) {
      playlists.value = formatCoverList(playlistRes.result);
    }
  } catch (error) {
    console.error('获取首页数据失败', error);
    showToast('获取数据失败');
  } finally {
    loading.value = false;
  }
};

const onSearchClick = () => {
  router.push('/search');
};

const playDaily = () => {
  if (!dataStore.userLoginStatus) {
    showToast('请先登录');
    router.push('/login');
    return;
  }
  router.push('/daily/recommend');
};

const playFM = () => {
  if (!dataStore.userLoginStatus) {
    showToast('请先登录');
    router.push('/login');
    return;
  }
  router.push('/personal/fm');
};

const goPlaylistSquare = () => {
  router.push('/discover');
};

const goTopList = () => {
  router.push({ path: '/discover', query: { tab: 'toplist' } });
};

const goPlaylistDetail = (id: number) => {
  router.push(`/playlist/${id}`);
};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 80px;
}

.content {
  padding-top: 10px;
}

.my-swipe {
  margin: 10px 16px;
  border-radius: 12px;
  overflow: hidden;
  height: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .banner-item {
    position: relative;
    height: 100%;
    
    &.loading {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--van-gray-2);
    }
    
    .banner-tag {
      position: absolute;
      bottom: 0;
      right: 0;
      padding: 2px 8px;
      color: #fff;
      font-size: 10px;
      border-top-left-radius: 8px;
    }
  }
}

.menu-grid {
  margin: 10px 6px;
  
  :deep(.van-grid-item__content) {
    background: transparent;
  }
  
  :deep(.van-grid-item__icon) {
    color: var(--van-primary-color);
    font-size: 28px;
  }
  
  :deep(.van-grid-item__text) {
    font-size: 12px;
    margin-top: 8px;
    color: var(--van-text-color);
  }
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  
  span {
    font-size: 18px;
    font-weight: bold;
    color: var(--van-text-color);
  }
  
  .van-icon {
    color: var(--van-gray-5);
    font-size: 16px;
  }
}

.playlist-item {
  :deep(.van-grid-item__content) {
    padding: 0;
    background: transparent;
  }
  
  .cover-wrapper {
    position: relative;
    width: 100%;
    
    .play-count {
      position: absolute;
      top: 4px;
      right: 6px;
      color: #fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      
      .van-icon {
        margin-right: 2px;
      }
    }
  }
  
  .playlist-name {
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.4;
    color: var(--van-text-color);
    padding: 0 4px;
  }
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
