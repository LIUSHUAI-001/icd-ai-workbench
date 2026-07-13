# Claude Code Next Task

## Current Status (2026-07-13)

The task below is the historical specification for ICD Framework v1. It is complete and verified; do not rebuild it.

- Completed: 首页 / 画布 / 灵感库 / 案例导航路由、真实项目入口、工作流抽屉入口、灵感图像和案例备注加入画布、默认路径品牌清理。
- Completed: 灵感库本地图片导入，上传结果写入现有命名空间 localStorage，并沿用加入画布流程。
- Verified in a disposable canvas: Chinese input, upload reference insertion, case text insertion, edge connection, refresh recovery, and real image generation. Test canvas and generated output were deleted.
- Verified in browser: 灵感库上传入口唯一可见，上传接口可达，生产构建和类型检查通过。
- Read `CLAUDE.md`, `docs/icd-framework-baseline.md`, and the newest `docs/progress-log.md` entry before choosing the next task.
- Next product work must remain outside the canvas engine unless the user explicitly approves a core change. Suggested next items: case management, workflow presets, or high-frequency node UI polish.

## Task

Build the first product framework for ICD AI Canvas on top of the existing T8 app.

This is a shell/framework task, not a canvas-engine task. The goal is to create the main product structure:

- 首页
- 画布
- 灵感库
- 案例导航
- 资产/资源入口 can remain as the existing T8 resource library

The existing T8 canvas must stay intact. Do not migrate or copy the old ICD React Flow canvas into this repo.

## Product Direction

Reference the previous ICD project only for information architecture, wording, and visual rhythm.

Old ICD project path:

`/Users/liushuai/Documents/GitHub/ICD AI WORK`

Relevant reference files:

1. `/Users/liushuai/Documents/GitHub/ICD AI WORK/src/components/AppHeader.tsx`
2. `/Users/liushuai/Documents/GitHub/ICD AI WORK/src/components/HomePage.tsx`
3. `/Users/liushuai/Documents/GitHub/ICD AI WORK/src/features/inspiration/InspirationPage.tsx`
4. `/Users/liushuai/Documents/GitHub/ICD AI WORK/src/features/case-navigation/CaseNavigationPage.tsx`
5. `/Users/liushuai/Documents/GitHub/ICD AI WORK/src/styles.css`

Use these as reference only. Do not paste large old app sections blindly. This repo's source of truth is the T8 canvas.

## Required Reading In Current Repo

Before editing, read:

1. `CLAUDE.md`
2. `docs/customization-and-upgrade-plan.md`
3. `docs/progress-log.md`
4. `src/App.tsx`
5. `src/extensions/icdLocalExtensions.tsx`
6. `src/styles/your-brand-theme.css`

Read only if needed for selectors or layout safety:

- `src/components/Canvas.tsx`
- `src/components/Sidebar.tsx`
- `src/components/CanvasToolbar.tsx`

## Hard Architecture Rule

Do not touch the T8 canvas core.

Forbidden to edit in this task:

- `src/components/Canvas.tsx`
- `src/components/Sidebar.tsx`
- `src/components/CanvasToolbar.tsx`
- `src/components/nodes/*`
- `src/config/nodeRegistry.ts`
- `src/config/portTypes.ts`
- `backend/src/server.js`
- `backend/src/routes/*`
- storage format under `data/`
- user data under `data/`, `input/`, `output/`, `thumbnails/`

Allowed / preferred files:

- `src/App.tsx`
- `src/extensions/icdLocalExtensions.tsx`
- `src/styles/your-brand-theme.css`
- new files under `src/extensions/` if the framework becomes too large for one file
- docs updates under `docs/`

Keep implementation additive and upgrade-friendly.

## Functional Scope

### 1. Add A Lightweight App Route State

Implement a simple hash-based route or state layer around the existing app shell:

- `#/` or empty hash: 首页
- `#/canvas`: real T8 canvas page
- `#/inspiration`: 灵感库 page
- `#/cases`: 案例导航 page

If the current app already starts directly on the canvas, preserve that behavior when the route is `#/canvas`.

Do not introduce React Router unless the project already uses it. A small hash parser is enough.

### 2. Add ICD Top Navigation

Create a top-level navigation similar to the old ICD `AppHeader`:

- brand: `ICD STUDIO` or `ICD AI CANVAS`
- nav items: 首页 / 画布 / 灵感库 / 案例导航
- primary action: 进入画布

The current canvas dock/sidebar toggle must still work on the canvas route.

On non-canvas pages, do not show controls that only make sense for the canvas, unless they are harmless and visually secondary.

### 3. 首页 Framework

Build a usable first-screen home page based on the old ICD homepage structure:

- headline: 空间设计智能工作台
- short description: 从参考图、草图和提示词开始，完成生成、对比、标注与项目资产沉淀。
- actions:
  - 新建/进入画布 -> `#/canvas`
  - 打开灵感库 -> `#/inspiration`
- sections:
  - 常用工作流 cards: 草图转效果图 / 材质替换 / 方案对比 / 效果图超清
  - 最近工作区 placeholder or local count if easy

Use existing image assets if available, such as:

- `public/assets/icd-logo.png`

If old ICD `p24-home` images are needed, copy only a small set after confirming they are useful. Prefer not to copy assets in this first framework pass unless the page looks broken without them.

### 4. 灵感库 Framework

Build the first framework of the inspiration library:

- search input
- category chips: 全部 / 空间氛围 / 材质参考 / 灯光参考 / 色彩方案
- cards with placeholder/sample records
- action buttons: 收藏 / 加入画布

For this pass, local sample data is acceptable. Do not build a full database or backend.

If using localStorage, keep the key clearly namespaced, for example:

`icd-ai-canvas:inspiration:v1`

Do not write to T8 canvas storage in this task unless the user specifically approves.

### 5. 案例导航 Framework

Build the first framework of the case navigation page:

- search input
- category chips: 全部 / 建筑 / 室内 / 商业 / 办公 / 酒店 / 餐饮 / 展陈 / 材质 / 综合
- case/link cards with placeholder/sample records
- actions: 打开网站 / 收藏 / 加入画布备注

For this pass, local sample data is acceptable. Do not add backend routes.

If using localStorage, keep the key clearly namespaced, for example:

`icd-ai-canvas:cases:v1`

### 6. Canvas Route

The canvas route must render the existing T8 canvas exactly through the current app flow.

Preserve:

- sidebar collapse/expand
- node menu
- resource library
- API settings
- toolbar
- zoom controls
- text input / Chinese IME behavior
- upload node
- connections
- save/load

No canvas refactor.

## Visual Direction

Use the current ICD theme already in:

`src/styles/your-brand-theme.css`

Keep:

- dark industrial base
- restrained bronze accent
- graphite borders
- compact operational UI
- no beige/brown full-page wash
- no purple gradient marketing style

The framework should feel like an app/workbench, not a marketing landing page.

## Validation

Run:

```bash
git diff --check
npm run type-check
npm run build
```

Browser check with the dev app:

1. `#/` opens 首页.
2. 首页 nav to `#/canvas` opens real T8 canvas.
3. Canvas sidebar toggle still works.
4. Create or confirm existing Text node can input Chinese text.
5. Resource library opens.
6. API settings opens.
7. Nav to `#/inspiration` opens 灵感库 framework.
8. Nav to `#/cases` opens 案例导航 framework.
9. Refresh on each route keeps the correct page.
10. No obvious overlap at desktop width around 1440px.

Save screenshots under `_verification/`:

- `_verification/icd-framework-home.png`
- `_verification/icd-framework-canvas.png`
- `_verification/icd-framework-inspiration.png`
- `_verification/icd-framework-cases.png`

## Progress Log

Append a new entry at the top of `docs/progress-log.md` with:

- task summary
- reference ICD files inspected
- files changed
- validation commands and results
- browser URLs/routes tested
- screenshots path
- whether core T8 files were touched
- known gaps
- next recommended task

## Final Response

Report concisely:

1. What routes/pages were added.
2. What files changed.
3. Validation results.
4. Whether any T8 canvas core files were touched.
5. Screenshots produced.
6. What Codex should review next.
