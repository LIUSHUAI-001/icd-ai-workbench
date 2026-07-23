# T8 底座定制与升级方案

## 总原则

不拆 T8 引擎，只做你的产品外壳。

- 后续 Claude Code / Codex 接力时，先读根目录 `CLAUDE.md`。
- 每次开发结束都要更新 `docs/progress-log.md`，不要只把进度留在聊天里。
- 用户说 `结束项目` 时，自动触发收工流程：验证、写进度、列风险、给下一步，不做删除/归档/重置。
- 保留 `src/components/Canvas.tsx`
- 保留 `src/config/nodeRegistry.ts`
- 保留 `backend/src/server.js` 和 `backend/src/routes/*`
- 你的 UI、品牌、主题实现优先放在受跟踪的 `src/extensions/icdLocalExtensions.tsx` 和 `src/styles/your-brand-theme.css`
- `local-private/extensions/frontend/index.tsx` 只做极简 re-export 适配器，不放实现逻辑
- 颜色覆盖放在 `src/styles/your-brand-theme.css`

## 当前第一版骨架

ICD 产品扩展采用双层架构：

- `src/extensions/icdLocalExtensions.tsx`（受 Git 跟踪）
  - ICD 品牌外壳的**唯一受跟踪源文件**。
  - 包含深色科技主题锁定（TECH_TEMPLATE_ID + dark）、顶栏品牌标识、底部标注。
  - 通过 `virtual:t8-local-extensions` 虚拟模块加载。
  - 不要在此文件中放入密钥或敏感信息。

- `local-private/extensions/frontend/index.tsx`（被 Git 忽略）
  - **可选的极简本地适配器**，仅从 `src/extensions/icdLocalExtensions.tsx` re-export。
  - 存在时由 `vite.config.ts` 优先加载；普通 GitHub clone 缺少它时，直接加载受跟踪的 ICD 扩展。
  - 不再要求新电脑手工恢复，具体加载规则见 `docs/local-private-deployment.md`。

- `src/styles/your-brand-theme.css`
  - 只覆盖 shell 颜色和你的定制 UI 样式。
  - 当前视觉方向来自 `ICD AI WORK`：深色工业底、青铜金属主色、`ICD STUDIO` 品牌语义。
  - 不修改画布节点逻辑、不修改后端、不修改存储格式。

- `src/styles/index.css`
  - 只新增一行 `@import './your-brand-theme.css';`。

- `docs/local-private-deployment.md`
  - local-private 适配器的恢复和部署说明。

## 第一阶段：最快上线版

目标：你的品牌外壳 + T8 全量画布能力。

执行顺序：

1. 跑通原项目：`npm run dev`
2. 检查后端状态：`http://127.0.0.1:18766/api/status`
3. 确认画布可打开、节点可添加、节点可连线
4. 改 `src/styles/your-brand-theme.css` 的颜色变量
5. 改 `src/extensions/icdLocalExtensions.tsx` 的品牌文案和入口
6. 只在确认需要时，再调整 `src/App.tsx` 的顶部栏和推广入口

## 第二阶段：工作台产品化

目标：从“换皮 T8”变成“你的 AI 工作台”。

优先改：

1. 首页 / 工作台入口
2. 顶部导航
3. 常用工作流入口
4. 最近画布
5. 侧边栏分组展示

保留：

1. `Canvas.tsx` 的画布执行逻辑
2. `NODE_REGISTRY` 的节点注册数据
3. 后端 API 和本地数据目录

## 第三阶段：节点体验定制

只改高频节点，不全量重写。

优先级：

1. 图像节点
2. 视频节点
3. LLM 节点
4. RunningHub / ComfyUI 节点
5. 资源库和素材流转

能用 `LocalNodeAddonSlot` 扩展的，先扩展；确实不够再改节点组件。

## 后期升级流程

第一次设置上游：

```bash
git remote add upstream https://github.com/T8mars/T8-penguin-canvas.git
```

每次升级：

```bash
git fetch upstream
git checkout -b codex/upgrade-t8-版本号
git merge upstream/main
```

升级后检查：

1. `src/styles/index.css` 是否仍引入 `your-brand-theme.css`
2. `vite.config.ts` 是否仍支持 `virtual:t8-local-extensions`
3. `src/App.tsx` 是否仍挂载 `LocalTopbarSlot` / `LocalModalSlot`
4. `src/extensions/icdLocalExtensions.tsx` 是否仍能编译并导出四个 slot
5. `src/components/Canvas.tsx` 是否正常渲染
6. `src/config/nodeRegistry.ts` 是否新增或变更节点
7. `backend/src/routes/*` 是否新增必需接口
8. `docs/local-private-deployment.md` 恢复步骤是否仍然有效

验收命令：

```bash
npm run type-check
npm run build
```

手动验收：

1. 打开画布
2. 添加文本节点、图像节点、输出节点
3. 连线
4. 保存画布
5. 刷新恢复
6. 打开设置
7. 打开资源库
8. 若要发布桌面端，再跑 Electron 打包流程

## 禁止事项

- 不直接覆盖 `src/`
- 不把你的 UI 整包塞进 `Canvas.tsx`
- 不把密钥写入配置文件或源码
- 不在未备份的情况下批量移动、删除、覆盖核心文件
- 不把 `local-private/` 提交到公开仓库
- 不在 `local-private/extensions/frontend/index.tsx` 中放入实现逻辑（实现逻辑应放在受跟踪的 `src/extensions/icdLocalExtensions.tsx` 中）
