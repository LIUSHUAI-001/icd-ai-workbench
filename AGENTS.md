# Codex Handoff Standard

## Project Goal

Build a custom branded AI canvas product on top of the full open-source T8-penguin-canvas project.

The goal is not to rewrite T8. The goal is to keep the complete T8 canvas engine, node system, backend API, storage format, and Electron/Web deployment path, while adding a maintainable custom UI layer for Liu Shuai's product.

## Non-Negotiable Architecture

Keep T8 as the engine. Add the custom product layer around it.

Do not replace or rewrite these files unless the user explicitly asks and the change is proven necessary:

- `src/components/Canvas.tsx`
- `src/config/nodeRegistry.ts`
- `backend/src/server.js`
- `backend/src/routes/*`
- canvas data storage format under `data/`

Preferred customization locations:

- `src/extensions/icdLocalExtensions.tsx` (tracked ICD implementation — edit this for product behavior)
- `local-private/extensions/frontend/index.tsx` (ignored local adapter — thin re-export only, restore via `docs/local-private-deployment.md`)
- `src/styles/your-brand-theme.css`
- small, deliberate shell changes in `src/App.tsx`
- planning and upgrade notes in `docs/`

## Current Baseline

### ICD Framework v1 (completed, 2026-07-13)

- 路由：`#/` 首页、`#/canvas` 真实 T8 画布、`#/inspiration` 灵感库、`#/cases` 案例导航。
- 首页：读取真实画布列表；可新建和打开最近画布；工作流卡片进入画布后自动打开既有工作流抽屉。
- 灵感库 / 案例导航：通过 `src/extensions/icdCanvasIntent.ts` 一次性意图接入当前画布；分别复用既有 `upload` 与 `text` 节点入口，不直接写画布 JSON。
- 画布外壳：返回首页、当前画布名、左侧菜单/资源库/工作流 dock；默认路径已移除旧启动图、成就按钮和旧品牌展示文案。
- 静态启动页：`index.html` 为 ICD AI Canvas 深色加载页，避免 React 接管前闪出上游旧品牌。
- 已在独立测试画布完成中文文本、灵感/案例插入、连线、保存刷新恢复和一次真实图像生成验收；测试画布与输出已清理。详见 `docs/progress-log.md`。

The ICD product extension uses a two-layer architecture:

- `src/extensions/icdLocalExtensions.tsx` (tracked)
  - the single source of truth for ICD product behavior
  - forces TECH_TEMPLATE_ID + dark mode
  - initializes ICD theme and default collapsed canvas sidebar
  - renders the bottom build note

- `src/extensions/icdRouter.ts` / `src/extensions/pages/*`
  - tracked ICD product routes and pages
  - keep all non-canvas product UI here instead of copying another app into T8

- `src/extensions/icdCanvasIntent.ts`
  - one-time handoff from non-canvas pages to the existing canvas insertion API
  - do not bypass it by mutating canvas storage directly

- `local-private/extensions/frontend/index.tsx` (ignored)
  - thin local adapter that re-exports from `src/extensions/icdLocalExtensions.tsx`
  - loaded by `vite.config.ts` via `virtual:t8-local-extensions`
  - if lost, restore by following `docs/local-private-deployment.md`

- `src/styles/your-brand-theme.css`
  - additive brand theme overrides
  - does not touch canvas behavior or backend behavior

- `src/styles/index.css`
  - imports `./your-brand-theme.css`

- `docs/customization-and-upgrade-plan.md`
  - long-form execution and upgrade plan

- `docs/icd-framework-baseline.md`
  - current completed baseline, verification evidence, and the next handoff boundary

- `docs/local-private-deployment.md`
  - recovery and deployment instructions for the local-private adapter

Note: `local-private/` is intentionally ignored by Git. The tracked ICD implementation lives in `src/extensions/icdLocalExtensions.tsx`. Do not commit `local-private/` to the public upstream fork.

## Execution Order

Before changing files:

1. Run `git status --short --branch`.
2. Read this `AGENTS.md`.
3. Read `docs/customization-and-upgrade-plan.md`.
4. Check whether the requested change can be done through `src/extensions/icdLocalExtensions.tsx` (tracked) or `src/styles/your-brand-theme.css` first. The `local-private/` adapter should only need changes when the Vite loading path itself changes.

Default implementation order:

1. Customize brand shell and colors.
2. Hide or simplify irrelevant T8 promotional entry points.
3. Add a product workspace/home entry if needed.
4. Customize only the high-frequency node UI after real use proves the need.
5. Touch canvas internals only as a last resort.

## What To Preserve

Every normal change must preserve:

- node add/delete/drag behavior
- edge connection behavior
- canvas save/load
- canvas refresh recovery
- API settings
- resources library
- RunningHub / ComfyUI / LLM backend routes
- Web build
- future upstream mergeability

## Validation Standard

For UI/theme/shell changes, run:

```bash
npm run type-check
npm run build
```

For changes touching canvas behavior, node behavior, backend API, storage, or build pipeline, also manually verify:

1. Open the app with `npm run dev`.
2. Confirm backend health at `http://127.0.0.1:18766/api/status`.
3. Add a text node.
4. Add an image node.
5. Add an output node.
6. Connect nodes.
7. Save canvas.
8. Refresh and confirm recovery.
9. Open API settings.
10. Open resource library.

If Electron packaging is affected, run the relevant Electron build command before claiming completion.

## End-of-Work Progress Log

At the end of every development session, update `docs/progress-log.md`.

This is mandatory for Codex, Codex, and any future agent handoff. Do not leave progress only in chat.

The user's trigger phrase `结束项目` means: stop active development for this session, run the appropriate validation, append a factual progress entry to `docs/progress-log.md`, report changed files, validation results, risks, and the exact next step. Treat this as an automatic closeout routine, not as a request to delete, archive, or reset anything.

Append one new entry at the top of the log with:

- date and agent name
- user goal for the session
- files changed
- what was completed
- validation run and result
- open risks or blockers
- exact next step
- whether core T8 files were touched

If nothing was changed, still add a short entry saying what was inspected and why no change was made.

The progress log must be factual and concise. Do not use it for brainstorming.

## Upgrade Standard

When syncing upstream T8:

```bash
git fetch upstream
git checkout -b codex/upgrade-t8-版本号
git merge upstream/main
```

After merge, inspect:

- `vite.config.ts` still resolves `virtual:t8-local-extensions`
- `src/App.tsx` still mounts `LocalTopbarSlot` and `LocalModalSlot`
- `src/extensions/icdLocalExtensions.tsx` still compiles and exports all four slots
- `src/styles/index.css` still imports `your-brand-theme.css`
- `src/components/Canvas.tsx` still renders
- `src/config/nodeRegistry.ts` node changes are understood
- backend route additions or breaking changes are understood
- `docs/local-private-deployment.md` recovery steps still work

Then run validation.

## Prohibited Moves

Do not:

- replace the whole `src/` directory
- paste an independent frontend app over T8
- move secrets into source files
- commit `local-private/` into a public repository
- delete or overwrite user data under `data/`, `input/`, `output/`, or `thumbnails/`
- make broad refactors unrelated to the current request
- break upstream mergeability for cosmetic changes

## Response Style For Future Agents

Use Chinese by default. Be direct and practical. Before local file/code/config changes, inspect the current state first. For destructive, broad, or core-architecture changes, explain the impact and wait for user confirmation.
