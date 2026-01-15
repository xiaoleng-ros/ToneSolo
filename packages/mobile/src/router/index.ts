import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import Layout from '@/views/Layout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'discover',
        name: 'Discover',
        component: () => import('@/views/Discover.vue'),
        meta: { title: '发现' }
      },
      {
        path: 'library',
        name: 'Library',
        component: () => import('@/views/Library.vue'),
        meta: { title: '我的' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('@/views/Playlist/PlaylistDetail.vue'),
    meta: { title: '歌单详情' }
  },
  {
    path: '/artist/:id',
    name: 'ArtistDetail',
    component: () => import('@/views/Artist/ArtistDetail.vue'),
    meta: { title: '歌手详情' }
  },
  {
    path: '/library/recent',
    name: 'RecentPlay',
    component: () => import('@/views/Library/RecentPlay.vue'),
    meta: { title: '最近播放' }
  },
  {
    path: '/library/favorite',
    name: 'MyFavorite',
    component: () => import('@/views/Library/MyFavorite.vue'),
    meta: { title: '我的收藏' }
  },
  {
    path: '/daily/recommend',
    name: 'DailyRecommend',
    component: () => import('@/views/DailyRecommend/DailyRecommend.vue'),
    meta: { title: '每日推荐' }
  },
  {
    path: '/personal/fm',
    name: 'PersonalFM',
    component: () => import('@/views/PersonalFM/PersonalFM.vue'),
    meta: { title: '私人FM', hideTabbar: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
