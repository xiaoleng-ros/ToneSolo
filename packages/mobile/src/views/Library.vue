<template>
  <div class="library-page">
    <van-nav-bar title="我的" />

    <div class="user-card" @click="handleUserClick">
      <div v-if="dataStore.userLoginStatus && dataStore.userData" class="user-info">
        <van-image
          round
          width="60"
          height="60"
          :src="dataStore.userData.profile.avatarUrl"
        />
        <div class="info-text">
          <div class="nickname">{{ dataStore.userData.profile.nickname }}</div>
          <div class="level">Lv.{{ dataStore.userData.level }}</div>
        </div>
        <van-icon name="arrow" class="arrow" />
      </div>
      <div v-else class="login-prompt">
        <div class="avatar-placeholder">
          <van-icon name="user-o" size="40" />
        </div>
        <div class="info-text">
          <div class="nickname">未登录</div>
          <div class="tip">点击登录账号，同步你的音乐</div>
        </div>
        <van-icon name="arrow" class="arrow" />
      </div>
    </div>

    <van-cell-group inset class="menu-list">
      <van-cell title="最近播放" icon="play-circle-o" is-link @click="router.push('/library/recent')" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="router.push('/library/favorite')" />
      <van-cell title="下载管理" icon="down" is-link @click="showToast('功能开发中')" />
    </van-cell-group>

    <!-- 用户歌单 -->
    <div v-if="dataStore.userLoginStatus && userPlaylists.length > 0" class="user-playlists">
      <div class="section-title">我的歌单 ({{ userPlaylists.length }})</div>
      <van-cell-group inset>
        <van-cell
          v-for="item in userPlaylists"
          :key="item.id"
          :title="item.name"
          :label="item.trackCount + '首'"
          center
          is-link
          @click="goPlaylistDetail(item.id)"
        >
          <template #icon>
            <van-image :src="item.coverImgUrl" width="50" height="50" radius="8" class="mr-10" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <div v-if="dataStore.userLoginStatus" class="logout-btn">
      <van-button block round type="danger" plain @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from '@core/stores';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import { toLogout } from '@core/utils/auth';
import { userPlaylist } from '@core/api/user';
import { ref, onMounted, watch } from 'vue';

/**
 * 我的页面组件
 * 展示用户信息及库功能入口
 */

const dataStore = useDataStore();
const router = useRouter();
const userPlaylists = ref<any[]>([]);

// 获取用户歌单
const getUserPlaylists = async () => {
  if (!dataStore.userLoginStatus || !dataStore.userData) return;
  try {
    const res = await userPlaylist(100, 0, dataStore.userData.profile.userId);
    if (res.code === 200) {
      userPlaylists.value = res.playlist;
    }
  } catch (error) {
    console.error('获取用户歌单失败', error);
  }
};

const goPlaylistDetail = (id: number) => {
  router.push(`/playlist/${id}`);
};

// 监听登录状态变化
watch(() => dataStore.userLoginStatus, (val) => {
  if (val) {
    getUserPlaylists();
  } else {
    userPlaylists.value = [];
  }
});

onMounted(() => {
  if (dataStore.userLoginStatus) {
    getUserPlaylists();
  }
});

// 点击用户卡片
const handleUserClick = () => {
  if (!dataStore.userLoginStatus) {
    router.push('/login');
  } else {
    // TODO: 跳转到用户信息详情页
  }
};

// 退出登录
const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认退出登录吗？',
  })
    .then(async () => {
      await toLogout();
      showSuccessToast('已退出登录');
    })
    .catch(() => {
      // on cancel
    });
};
</script>

<style lang="scss" scoped>
.library-page {
  min-height: 100vh;
  background-color: var(--van-background-2);
  padding-bottom: 100px;

  .user-card {
    margin: 16px;
    padding: 20px;
    background-color: var(--van-background);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .user-info, .login-prompt {
      display: flex;
      align-items: center;

      .info-text {
        flex: 1;
        margin-left: 16px;

        .nickname {
          font-size: 18px;
          font-weight: 600;
          color: var(--van-text-color);
        }

        .level {
          margin-top: 4px;
          font-size: 12px;
          color: var(--van-primary-color);
          background: rgba(var(--van-primary-color-rgb), 0.1);
          padding: 2px 8px;
          border-radius: 10px;
          display: inline-block;
        }

        .tip {
          margin-top: 4px;
          font-size: 14px;
          color: var(--van-text-color-2);
        }
      }

      .avatar-placeholder {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--van-gray-2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--van-gray-5);
      }

      .arrow {
        color: var(--van-gray-5);
      }
    }
  }

  .menu-list {
    margin-top: 16px;
  }

  .user-playlists {
    margin-top: 24px;

    .section-title {
      margin: 0 16px 12px;
      font-size: 16px;
      font-weight: 600;
      color: var(--van-text-color);
    }

    .mr-10 {
      margin-right: 12px;
    }
  }

  .logout-btn {
    margin: 32px 16px;
  }
}
</style>
