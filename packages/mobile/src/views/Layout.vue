<template>
  <div class="app-layout">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    
    <MiniPlayer />
    <FullPlayer />
    
    <van-tabbar route fixed placeholder safe-area-inset-bottom>
      <van-tabbar-item replace to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/discover" icon="apps-o">发现</van-tabbar-item>
      <van-tabbar-item replace to="/library" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import MiniPlayer from '@/components/MiniPlayer.vue';
import FullPlayer from '@/views/Player/FullPlayer.vue';
</script>

<style scoped>
.app-layout {
  padding-bottom: 50px; /* Space for tabbar */
}
</style>
