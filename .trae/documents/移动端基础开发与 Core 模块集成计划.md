# 移动端基础开发与 Core 模块集成计划

为了让移动端项目 (`packages/mobile`) 能够真正复用核心逻辑，我们需要先完善 `packages/core` 的导出配置，然后配置移动端的运行环境。

## 任务拆解

### 1. 完善 Core 模块导出 (Enhance Core Exports)
目前 `packages/core` 虽然包含大量代码，但主入口文件尚未导出它们。我们需要建立统一的导出机制。
- **创建聚合导出文件**：
  - `packages/core/src/api/index.ts`: 导出所有 API 模块。
  - `packages/core/src/utils/index.ts`: 导出所有工具函数。
  - `packages/core/src/types/index.ts`: 导出类型定义。
- **更新主入口**：
  - 修改 `packages/core/src/index.ts`，统一导出 `api`, `utils`, `stores`, `types`, `constants`。

### 2. 移动端环境配置 (Mobile Setup)
配置 `packages/mobile` 以支持 Vue 3 + Pinia + Core 的开发模式。
- **安装依赖**：在 `packages/mobile` 中安装 `pinia`。
- **配置入口**：修改 `packages/mobile/src/main.ts`，初始化 Pinia 实例。

### 3. 功能联调与验证 (Integration & Verification)
在移动端创建一个简单的测试界面，验证是否能成功调用 Core 中的逻辑。
- **编写测试 UI**：修改 `packages/mobile/src/App.vue`。
  - 引入 `@tonesolo/core` 中的 `useMusicStore`。
  - 添加简单的状态展示（如“当前无播放歌曲”）和按钮。
- **运行测试**：启动移动端开发服务器，验证页面是否正常渲染且无报错。

## 下一步行动
我将按照上述顺序执行，首先处理 Core 模块的导出问题，然后配置移动端项目，最后进行联调。
