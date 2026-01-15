# 移动端 Pinia 集成与功能验证计划

为了继续推进移动端开发，我们将按照之前的规划，完成 Pinia 的安装配置，并进行核心功能的联调验证。

## 待执行任务

### 1. 安装依赖 (Install Dependencies)
在 `packages/mobile` 中安装状态管理库及其持久化插件。
- **Action**: `pnpm add pinia pinia-plugin-persistedstate`
- **Reason**: `@tonesolo/core` 中的 Store 依赖 Pinia，且部分 Store 使用了持久化插件。

### 2. 配置入口文件 (Configure Main Entry)
在移动端应用启动时初始化 Pinia。
- **Action**: 修改 `packages/mobile/src/main.ts`
- **Details**:
  - 创建 Pinia 实例。
  - 注册 `pinia-plugin-persistedstate`。
  - 将 Pinia 挂载到 Vue 应用。

### 3. 功能验证 (Verify Integration)
创建一个简单的验证页面，确保移动端能正确调用 Core 包中的逻辑。
- **Action**: 修改 `packages/mobile/src/App.vue`
- **Details**:
  - 引入 `useMusicStore`。
  - 显示当前播放状态（测试 Store 读取）。
  - 添加一个按钮触发播放动作（测试 Store 方法调用）。

## 预期结果
完成上述步骤后，移动端应用将具备完整的状态管理能力，并能成功复用 Core 层的业务逻辑。我们将通过启动开发服务器来验证这一点。
