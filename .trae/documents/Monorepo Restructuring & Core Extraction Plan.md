我已经分析了您的需求和当前项目结构。您希望通过 Monorepo 架构实现"代码共享和双端并行开发"。我已经准备好帮助您执行 **第一阶段：提取共享核心与 Monorepo 设置**。

以下是将当前项目转换为目标 Monorepo 架构的实施计划：

### 第一阶段：架构重构与核心模块提取

#### 1. 初始化 Monorepo 结构
- **创建工作区目录**:
  - `packages/desktop`: 用于存放现有的 PC (Electron) 应用。
  - `packages/core`: 用于存放共享的业务逻辑、API 和状态。
  - `packages/mobile`: 为未来的 Android 项目预留。
- **配置工作区**:
  - 更新 `pnpm-workspace.yaml` 以管理这些新包。
  - 创建根目录 `package.json` 用于管理开发脚本和共享依赖。

#### 2. 迁移 Desktop 应用
- **移动文件**: 将当前根目录下的应用代码（包括 `src`, `electron`, `public`, `index.html`, `vite.config.ts` 等）移动到 `packages/desktop`。
- **更新配置**:
  - 将 `packages/desktop/package.json` 的名称更新为 `@tonesolo/desktop`。
  - 修复 `vite.config.ts`, `electron-builder.config.ts`, 和 `tsconfig.json` 中的路径，以反映新的目录结构。

#### 3. 提取共享核心模块 (Core)
- **设置 Core 包**: 初始化 `packages/core` 并创建 `package.json` (名称: `@tonesolo/core`)。
- **迁移逻辑**: 将以下模块从 `desktop/src` 移动到 `packages/core/src`:
  - `api/` (网络请求)
  - `utils/` (工具函数)
  - `stores/` (Pinia 状态管理)
  - `types/` (TypeScript 类型定义)
  - `constants/` (常量定义)
  - `core/` (现有的播放器核心逻辑)
- **导出与构建**: 在 `core` 中创建 `index.ts` 导出这些模块。

#### 4. 依赖链接与重构
- **链接包**: 在 `@tonesolo/desktop` 中添加 `@tonesolo/core` 作为依赖。
- **重构导入**: 更新 Desktop 应用中的所有 `import` 语句，使其从新的共享核心引用（例如，将 `@/api/...` 改为 `@tonesolo/core/api`）。
- **解决依赖**: 确保 `packages/core` 安装了必要的依赖（如 `axios`, `pinia`, `dayjs`）。

### 执行策略
我将首先创建目录结构并移动 Desktop 应用，确保其在新位置可以正常构建。然后，我将逐步提取 `core` 模块并修复导入路径。

**请确认是否开始执行此重构计划？**