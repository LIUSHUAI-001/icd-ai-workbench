# T8-penguin-canvas · skill.md

> 项目能力 / 接口 / 文件用途速查手册。
> 版本：v1.0.0 ｜ 仓库：<https://github.com/T8mars/T8-penguin-canvas>

---

## 1. 项目定位

T8-penguin-canvas 是 PenguinPravite 画布功能的 **轻量化重构版**，定位为 **纯 Web 端 AI 创作画布工具**：

- 仅运行于浏览器（前端 Vite 5180 端口 + 后端 Node Express 18766 端口）。
- 严格剔除桌面端封装、CLI、登录系统、创意库等非画布能力。
- 24 个节点全部业务化落地，覆盖文本 / 图像 / 视频 / 音频 / LLM / 工作流 / 工具 / 辅助 / 工具箱。
- 支持 **批量执行（拓扑顺序串行）** 与 **节点对齐辅助线（snap-to-grid + 智能吸附）**。

---

## 2. 仓库结构

```
T8-penguin-canvas/
├── backend/                     # Node + Express 后端
│   └── src/
│       ├── server.js            # 入口，挂载 5 类路由
│       ├── config.js            # 端口/目录/上游 baseUrl
│       └── routes/
│           ├── canvas.js        # 画布 CRUD（防空覆盖）
│           ├── settings.js      # 三套 API Key 持久化（脱敏 GET / 明文 raw）
│           ├── files.js         # 上传 / list / base64 转存
│           ├── imageOps.js      # sharp：resize/upscale/grid-crop/combine/remove-bg
│           └── proxy.js         # 上游代理：image/llm/video/audio/runninghub
├── src/                         # 前端 React + TS
│   ├── App.tsx                  # 三栏布局 + 状态栏
│   ├── components/
│   │   ├── Canvas.tsx           # 画布主体（xyflow）+ 批量运行 + 对齐辅助
│   │   ├── CanvasToolbar.tsx    # 顶部浮动工具栏（运行/吸附/历史/复制/导入导出/模板/帮助）
│   │   ├── CanvasManager.tsx    # 多画布管理列
│   │   ├── Sidebar.tsx          # 节点拖拽侧边栏
│   │   ├── ApiSettings.tsx      # 三套 Key 设置弹窗
│   │   └── nodes/               # 27 个节点组件文件
│   ├── stores/
│   │   ├── canvas.ts            # 画布列表 store
│   │   ├── apiKeys.ts           # 三套 Key store
│   │   ├── theme.ts             # 浅/深色主题
│   │   └── runBus.ts            # 运行总线（批量执行）
│   ├── hooks/
│   │   ├── useCanvasHistory.ts  # Undo/Redo 栈
│   │   └── useRunTrigger.ts     # 节点订阅运行总线
│   ├── services/
│   │   ├── api.ts               # 后端 REST 封装
│   │   ├── generation.ts        # 图像/视频/音频/LLM 生成调用封装
│   │   └── imageOps.ts          # /api/image/* 工具调用
│   ├── providers/               # 模型注册表（image/video/audio/llm）
│   ├── config/
│   │   ├── nodeRegistry.ts      # 24 节点元数据（label/icon/color）
│   │   └── canvasTemplates.ts   # 工作流模板预设
│   ├── utils/
│   │   └── topologicalSort.ts   # Kahn 拓扑排序（批量运行依赖序）
│   ├── types/canvas.ts          # 节点 / 画布 / Key 类型
│   └── styles/index.css         # Tailwind 入口
├── data/                        # 画布 JSON / 设置 JSON（gitignore）
├── input/  output/  thumbnails/ # 用户上传 / 生成产物 / 缩略（gitignore）
├── features.json                # 节点防丢失锁 + 接口快照
├── vite.config.ts               # 5180 端口 + /api → 18766 代理
├── package.json
└── tsconfig.json
```

---

## 3. 后端接口（http://127.0.0.1:18766）

### 3.1 健康检查

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/status` | 返回 `{ ok, service, version, port, time }` |

### 3.2 画布 CRUD（routes/canvas.js）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/canvas` | 画布列表 |
| POST | `/api/canvas` | 新建画布 `{ name? }` |
| GET | `/api/canvas/:id` | 画布数据 `{ nodes, edges, viewport }` |
| PUT | `/api/canvas/:id` | 保存画布数据，**拒绝空数据覆盖非空画布** |
| DELETE | `/api/canvas/:id` | 删除画布及数据文件 |
| PATCH | `/api/canvas/:id/name` | 重命名 `{ name }` |

> 数据文件位置：`data/canvas_list.json` + `data/canvas_<id>.json`。

### 3.3 设置（routes/settings.js）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/settings` | 三套 Key 设置（Key 字段被 `****xxxx` 脱敏） |
| GET | `/api/settings/raw` | 内部接口，明文（仅供 proxy.js 调用） |
| POST | `/api/settings` | 更新设置；`zhenzhenBaseUrl` / `llmBaseUrl` 强制为配置值 |

字段：`zhenzhenApiKey / rhApiKey / llmApiKey + 各自 baseUrl + preferences{ theme, language }`。

### 3.4 文件（routes/files.js）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/files/upload` | multipart 上传到 `input/`，限 10MB |
| GET | `/api/files/list` | 列出 `output/` 中的 png/jpg/webp/gif/mp4/webm/mp3/wav |
| POST | `/api/files/upload-base64` | dataURL 转存到 `output/`（手绘画板 / 抽帧使用） |

静态托管：`/files/output`、`/files/input`、`/files/thumbnails`、`/output`、`/input`。

### 3.5 图像处理（routes/imageOps.js · sharp）

| 方法 | 路径 | body |
|---|---|---|
| POST | `/api/image/resize` | `{ imageUrl, width?, height?, fit? }` |
| POST | `/api/image/upscale` | `{ imageUrl, scale }`（1~8，lanczos3） |
| POST | `/api/image/grid-crop` | `{ imageUrl, rows, cols }`，返回 `urls[]` |
| POST | `/api/image/combine` | `{ imageUrls[], direction: 'horizontal' \| 'vertical' }`，等比缩放后拼接 |
| POST | `/api/image/remove-bg` | `{ imageUrl }`（**占位实现**，仅 PNG 化） |

输入支持本地 URL（`/files/output|input` / `/output|input`）、HTTP(S)、`data:image/...;base64,` 三种形态。

### 3.6 上游代理（routes/proxy.js）

> 隐藏 Key、自动注入 Key、产物自动转存到 `output/` 并返回本地 URL。

#### 同步：图像 / LLM
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/proxy/image` | 贞贞工坊 `/v1/images/generations`，自动 b64 / 远端 URL → 本地 |
| POST | `/api/proxy/llm` | 贞贞工坊 `/v1/chat/completions`，使用 **LLM 独立 Key** |

#### 异步：视频
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/proxy/video/submit` | 贞贞工坊 `/v2/videos/generations`，返回 `taskId` |
| GET | `/api/proxy/video/query?taskId` | 轮询；SUCCESS 时下载视频到本地，返回 `videoUrl` |

#### 异步：Suno 音频（v5.5 三模式）
| 方法 | 路径 | mode |
|---|---|---|
| POST | `/api/proxy/audio/submit` | `generate / cover / extend`，自动选 `mv` |
| GET | `/api/proxy/audio/query?clipIds` | 解析 `audio_url`，返回 `tracks[]` |

模型映射：`suno-v5.5 → chirp-fenix`、`v5 → chirp-v3-5`、`v4.5 → chirp-v4-5`、`v4 → chirp-v4`。

#### 异步：RunningHub
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/proxy/runninghub/submit` | `/task/openapi/ai-app/run`，返回 `taskId` |
| GET | `/api/proxy/runninghub/query?taskId` | 轮询；code `0/804/813/805` → `SUCCESS/RUNNING/QUEUED/FAILED`，转存所有产物 |
| GET | `/api/proxy/runninghub/app-info?webappId` | 调 `/api/webapp/apiCallDemo`，返回 `nodeInfoList` 等 |

---

## 4. 前端服务封装

### `src/services/api.ts`
- `checkBackendStatus()` / `listCanvases()` / `createCanvas(name?)`
- `getCanvasData(id)` / `saveCanvasData(id, data)` / `deleteCanvas(id)` / `renameCanvas(id, name)`
- `getSettings()` / `updateSettings(patch)`

### `src/services/generation.ts`
统一封装 image / video / audio / llm 的提交 + 轮询，向上层节点暴露 Promise。

### `src/services/imageOps.ts`
对 `/api/image/*` 的薄封装，供工具节点 `ResizeNode / UpscaleNode / GridCropNode / CombineNode / RemoveBgNode` 使用。

---

## 5. 节点清单（24 个）

| 分组 | 节点 type | 入口 | 可批量运行 |
|---|---|---|---|
| 核心 | text | TextNode | ✗ |
| 核心 | image | ImageNode | ✓ |
| 核心 | video | VideoNode | ✓ |
| 核心 | seedance | VideoNode（model=seedance-2.0） | ✓ |
| 核心 | audio | AudioNode | ✓ |
| 核心 | llm | LLMNode | ✓ |
| 核心 | runninghub | RunningHubNode | ✓ |
| 核心 | rh-config | RhConfigNode | ✗ |
| 特殊 | multi-angle-3d / panorama-720 / penguin-portrait | PresetImageNode | ✓ |
| 特殊 | portrait-metadata | PortraitMetadataNode | ✗ |
| 特殊 | storyboard-grid | StoryboardGridNode | ✗ |
| 工具 | drawing-board | DrawingBoardNode | ✗ |
| 工具 | browser | BrowserNode | ✗ |
| 工具 | image-compare | ImageCompareNode | ✗ |
| 工具 | frame-extractor | FrameExtractorNode | ✓ |
| 工具 | resize / upscale / grid-crop / combine / remove-bg | ImageOpFrame | ✓ |
| 辅助 | edit | ImageNode（mode=edit） | ✓ |
| 辅助 | idea / bp / relay / video-output | IdeaNode / BpNode / RelayNode / VideoOutputNode | ✗ |
| 工具箱 | cinematic / video-motion | ToolboxParamNode | ✗ |

> 「可批量运行」= 已通过 `useRunTrigger(nodeId, runFn)` 接入运行总线。

---

## 6. 运行总线（批量执行）

### `src/stores/runBus.ts` · zustand
```
state: { currentRunId, lastDone, mode, batchTotal, batchDoneCount }
actions: triggerRun(id, mode='single'|'batch'), markDone(id, ok, error?),
         cancelAll(), setBatchProgress(total, done)
```

### `src/hooks/useRunTrigger.ts`
节点端订阅 `currentRunId`，命中自身则 `await runFn()` → `markDone(id, true)`。
- 用 `runFnRef = useRef(runFn)` 保持闭包最新。
- `startedRef` 防 React StrictMode 二次挂载重入。
- 异常被节点内部 `try/catch` 消化（节点自管 `status='error'`），运行总线只关心「已完成」。

### `src/utils/topologicalSort.ts`
Kahn 算法：仅取可执行节点子图的入度，排序失败时按原始顺序补全（环兼容）。

### `Canvas.tsx · handleRunAll`
1. 拓扑排序得 `order: string[]`
2. `setBatchProgress(order.length, 0)` → 串行 `await new Promise(...)`，每个节点 5 分钟安全超时
3. 监听 `lastDone.id === order[i]` 推进
4. `cancelRunRef` 控制中断
5. 工具栏 Play/Square 按钮 + `done/total` 进度徽标

---

## 7. 节点对齐辅助

### snap-to-grid
ReactFlow 内置：`snapToGrid={snapEnabled} snapGrid={[20, 20]}`。

### 智能对齐辅助线（onNodeDrag）
对每对「拖拽节点 6 边 × 其他节点 6 边」做差，差 < `ALIGN_THRESHOLD=6px`：
- 记入 `guides.vertical / horizontal`
- 取最优差值做弱吸附（`setNodes` 直接调整位置）
- 通过 `<ViewportPortal>` + SVG 在世界坐标系绘制橙色虚线（`vectorEffect="non-scaling-stroke"`）
- `onNodeDragStop` 清空辅助线

工具栏 **磁铁 Magnet 按钮** 开关吸附与辅助线。

---

## 8. 画布交互

| 能力 | 实现 | 文件 |
|---|---|---|
| Undo/Redo | 节流 250ms 入栈 + 拖拽中暂停 | `useCanvasHistory.ts` |
| 复制/粘贴/快复制/删除 | 仅复制选中节点 + 子图边，paste 偏移 (40,40) | `Canvas.tsx · handleCopy/Paste/Duplicate/DeleteSelected` |
| 导入/导出 JSON | `{ version, exportedAt, nodes, edges }` | `Canvas.tsx · handleExport/handleImportFile` |
| 工作流模板 | 预设节点+连线，一键插入 | `config/canvasTemplates.ts` |
| 自动保存 | 800ms 防抖；防空数据覆盖（前端 + 后端双层） | `Canvas.tsx` 自动保存 effect |
| 后端连通检测 | 每 15s `GET /api/status` | `App.tsx` |

### 全局快捷键
`Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` / `Ctrl+C` / `Ctrl+V` / `Ctrl+D` / `Ctrl+A` / `Delete` / `Backspace`。

---

## 9. 三套 API Key

| Key | 默认 BaseUrl | 是否固定 | 影响节点 |
|---|---|---|---|
| `zhenzhenApiKey` | `https://ai.t8star.org` | ✓ | image / video / audio |
| `runninghubApiKey` | `https://www.runninghub.cn` | ✗（仅 Key） | runninghub / rh-config |
| `llmApiKey` | `https://ai.t8star.org` | ✓ | llm / vision（**额度独立**） |

后端 `routes/settings.js` 在保存时强制将 `zhenzhenBaseUrl / llmBaseUrl` 还原为配置常量，防止前端篡改。

---

## 10. 启动 / 构建

```powershell
# 安装
npm install
cd backend; npm install; cd ..

# 开发（前端 5180 + 后端 18766，concurrently 并发）
npm run dev

# 类型检查 / 构建
npm run type-check
npm run build
```

或 Windows 双击 `start-dev.bat`。
