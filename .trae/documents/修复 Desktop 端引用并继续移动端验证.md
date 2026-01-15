# 修复 Desktop 端引用并继续移动端验证

由于我们将 `renderIcon` 从 Core 包移除以解决循环依赖问题，现在需要修复 Desktop 包中所有引用了该函数的组件。

## 任务列表

### 1. 修复 Desktop 组件引用 (Fix Desktop References)
批量更新以下文件，将 `renderIcon` 的引用源从 `@core/utils/helper` 修改为 `@/utils/icon`：

**Views (视图层):**
- `packages/desktop/src/views/Local/layout.vue`
- `packages/desktop/src/views/List/radio.vue`
- `packages/desktop/src/views/List/playlist.vue`
- `packages/desktop/src/views/List/liked.vue`
- `packages/desktop/src/views/List/album.vue`
- `packages/desktop/src/views/DailySongs.vue`
- `packages/desktop/src/views/Cloud.vue`
- `packages/desktop/src/views/Artist/layout.vue`

**Components (组件层):**
- `packages/desktop/src/components/Setting/MainSetting.vue`
- `packages/desktop/src/components/Player/PlayerRightMenu.vue`
- `packages/desktop/src/components/Menu/SongListMenu.vue`
- `packages/desktop/src/components/Menu/SearchInpMenu.vue`
- `packages/desktop/src/components/Menu/CoverMenu.vue`
- `packages/desktop/src/components/List/SongList.vue`
- `packages/desktop/src/components/Layout/Nav.vue`

### 2. 验证修复 (Verify Fixes)
- 再次启动移动端开发服务器 `pnpm dev`，确认之前因循环依赖导致的错误已解决。
- 检查控制台是否有新的报错。

## 执行策略
我将使用 `SearchReplace` 工具逐个文件进行替换。修复完成后，我们将能够看到移动端页面正常运行。
