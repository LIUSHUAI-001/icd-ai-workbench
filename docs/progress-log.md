# T8 Customization Progress Log

Purpose: this file is the shared progress ledger for Codex, Claude Code, and future agents. Every development session must append one entry at the top.

## Log Template

Copy this block for every new entry:

```md
## YYYY-MM-DD - AgentName - Short Task Title

- User goal:
- Files changed:
- Completed:
- Validation:
- Core T8 files touched:
- Risks / blockers:
- Next step:
```

## 2026-06-28 - Claude Code (deepseek-v4-pro) - 执行基线提交

- User goal: 按上一轮审计的推荐提交集执行 `git add`，创建基线提交，确认敏感/本地文件未被提交。
- Files changed:
  - `docs/progress-log.md`（仅追加本条记录）
  - 提交 `392f32e` 包含 11 个文件（详见下方）
- Completed:
  - 执行 `git add` 暂存推荐提交集中的全部 11 个文件。
  - 确认 `local-private/`、`_verification/`、`dist/`、`node_modules/`、`data/`、`input/`、`output/`、`thumbnails/` 完全未出现在暂存区。
  - 创建提交 `392f32e`：`chore: establish ICD customization baseline`
  - 提交包含的文件：
    - 已修改（3 个）：`.gitignore`、`MentionPromptInput.tsx`、`src/styles/index.css`
    - 新建（8 个）：`CLAUDE.md`、`docs/customization-and-upgrade-plan.md`、`docs/local-private-deployment.md`、`docs/progress-log.md`、`docs/claude-code-next-task.md`、`src/extensions/icdLocalExtensions.tsx`、`src/styles/your-brand-theme.css`、`public/assets/icd-logo.png`
  - 提交后工作区干净（`git status` 无未提交变更）。
- Validation:
  - `git diff --cached --name-only` 确认暂存区 = 推荐提交集，无多余文件。
  - `git show --name-only HEAD` 确认提交文件列表正确。
  - `git status --short --branch` → `main...origin/main [ahead 2]`，工作区干净。
  - `local-private/` 确认未被提交（`.gitignore` `/local-private/**` 规则有效）。
- Core T8 files touched: 无。
  - `MentionPromptInput.tsx` 和 `src/styles/index.css` 的修改已在早期会话中完成，属于 IME 修复和品牌 CSS 导入。
- Risks / blockers:
  - 当前 `main` 领先 `origin/main` 2 个提交（`206b152` + `392f32e`），尚未推送。用户可自行决定何时 `git push`。
  - `docs/claude-code-next-task.md` 包含当前审计任务文本——后续可能需要更新为下一个任务或归档。
- Next step:
  - 等待推送指令，或继续第三阶段：高频节点 UI 定制（图像节点、视频节点、LLM 节点）。

## 2026-06-28 - Claude Code (deepseek-v4-pro) - 提交前基线审计

- User goal: 执行 `docs/claude-code-next-task.md` 中的提交前审计任务——检查所有文件、确认忽略规则、扫描密钥、验证构建。
- Files changed:
  - `docs/progress-log.md`（仅追加本条记录）
- Files inspected (no changes made):
  - `.gitignore`（diff 审查：新增 `_verification/` 规则 ✅）
  - `src/components/nodes/MentionPromptInput.tsx`（diff 审查：中文 IME 修复，合法改动 ✅）
  - `src/styles/index.css`（diff 审查：新增 `@import './your-brand-theme.css'` 一行 ✅）
  - `CLAUDE.md`（内容审查：双层架构文档正确）
  - `docs/customization-and-upgrade-plan.md`（内容审查：已反映双层架构）
  - `docs/local-private-deployment.md`（内容审查：恢复文档完整）
  - `docs/claude-code-next-task.md`（内容审查：当前审计任务）
  - `src/extensions/icdLocalExtensions.tsx`（内容审查：受跟踪 ICD 实现完整）
  - `src/styles/your-brand-theme.css`（内容审查：ICD 品牌 CSS 完整）
  - `public/assets/icd-logo.png`（文件验证：PNG 573×429 RGBA，166KB ✅）
  - `local-private/extensions/frontend/index.tsx`（内容审查：23 行纯 re-export 适配器 ✅）
- Completed:
  - **Git 状态审计**：
    - 3 个已修改的受跟踪文件：`.gitignore`（新增 `_verification/`）、`MentionPromptInput.tsx`（IME 修复）、`src/styles/index.css`（单行导入）
    - 8 个未跟踪的新文件——均为 ICD 产品基线文件，无泄漏
  - **忽略规则验证**：
    - `local-private/` → `.gitignore` 第 48 行 `/local-private/**` ✅
    - `_verification/` → `.gitignore` 第 43 行 `_verification/` ✅
    - `dist/`/`node_modules/` → 已被上游 `.gitignore` 覆盖 ✅
    - `git status --short -- local-private/ _verification/ dist/` 无输出 ✅
  - **密钥扫描**：
    - 对 ICD 特定文件扫描：零实际密钥 ✅
    - 全项目扫描误报均为 CSS 类名（`.t8-api-settings-secret-field`）、文档行、API 参数名（`max_tokens`、`passwordProtected`）——均非密钥
  - **构建产物验证**：构建中 `your-brand-workspace-chip`、`ICD 定制层运行中` 正确编译 ✅
- Validation:
  - `npm run type-check` ✅ 无错误
  - `npm run build` ✅（5.09s，1990 modules）
  - `local-private/` 保持被忽略 ✅
  - `src/extensions/icdLocalExtensions.tsx` 确认是受跟踪的 ICD 扩展源文件 ✅
- Core T8 files touched: 无。本次为零修改审计。
- **推荐提交集**（建议在用户明确要求时执行 `git add` + `git commit`）：

  ```
  # 已修改的受跟踪文件
  git add .gitignore
  git add src/components/nodes/MentionPromptInput.tsx
  git add src/styles/index.css

  # 新 ICD 基线文件
  git add CLAUDE.md
  git add docs/customization-and-upgrade-plan.md
  git add docs/local-private-deployment.md
  git add docs/progress-log.md
  git add docs/claude-code-next-task.md
  git add src/extensions/icdLocalExtensions.tsx
  git add src/styles/your-brand-theme.css
  git add public/assets/icd-logo.png
  ```

- **必须保持忽略**：
  - `local-private/extensions/frontend/index.tsx`（本地适配器，绝对不可提交）
  - `_verification/`（本地截图）
  - `dist/`、`node_modules/`、`data/`、`input/`、`output/`、`thumbnails/`
- Risks / blockers:
  - `docs/claude-code-next-task.md` 作为活跃任务文件，提交后可能需要一个约定来决定何时将其重置/归档。
  - 已提交的基线将 `local-private/` 恢复责任转移给 `docs/local-private-deployment.md` 文档——新开发者必须阅读该文档（`CLAUDE.md` 中的引用可降低此风险）。
  - 提交时应附带中文提交信息以保持一致性。
- Next step:
  - 等待用户提交指令，或继续第三阶段产品化：高频节点 UI 定制。

## 2026-06-27 - Codex - Review ICD Extension Deployment Strategy

- User goal: check Claude Code's completed local-private production/backup strategy.
- Files changed:
  - `docs/customization-and-upgrade-plan.md`
  - `docs/claude-code-next-task.md`
  - `docs/progress-log.md`
- Completed:
  - Confirmed Claude Code created `src/extensions/icdLocalExtensions.tsx` as the tracked source of truth for ICD product extension behavior.
  - Confirmed `local-private/extensions/frontend/index.tsx` is now a thin ignored re-export adapter.
  - Confirmed `docs/local-private-deployment.md`, `CLAUDE.md`, and `docs/customization-and-upgrade-plan.md` document the two-layer strategy.
  - Fixed one stale planning line that still said UI/brand implementation should go into `local-private/`; it now points to `src/extensions/icdLocalExtensions.tsx` and `src/styles/your-brand-theme.css`.
  - Reset `docs/claude-code-next-task.md` to a no-active-task placeholder so Claude Code does not repeat the completed task.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - Verified `vite.config.ts` still uses `local-private/extensions/frontend/index.tsx` with fallback to `emptyLocalExtensions.tsx`.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, storage format, or node behavior files were changed.
- Risks / blockers:
  - The ignored adapter still must exist in production builds for ICD extension behavior to load; restore steps are documented in `docs/local-private-deployment.md`.
  - New files are currently untracked until staged/committed.
- Next step:
  - Decide whether to commit/stage the tracked project files, then continue productization or high-frequency node UI cleanup.

## 2026-06-27 - Claude Code (deepseek-v4-pro) - 解决 local-private/ 生产备份策略

- User goal: 执行 `docs/claude-code-next-task.md` 中的任务——创建持久的 ICD 扩展跟踪源文件，使 `local-private/` 保持被忽略的适配器角色，并文档化恢复/部署流程。
- Files changed:
  - `src/extensions/icdLocalExtensions.tsx`（新建，受跟踪的 ICD 产品扩展实现）
  - `local-private/extensions/frontend/index.tsx`（重写为极简 re-export 适配器）
  - `docs/local-private-deployment.md`（新建，恢复与部署文档）
  - `CLAUDE.md`（更新：架构说明、升级检查清单、首选定制位置）
  - `docs/customization-and-upgrade-plan.md`（更新：双层架构说明、升级检查清单、禁止事项）
  - `docs/progress-log.md`（追加本条记录）
- Completed:
  - **创建 tracked ICD 扩展源文件** `src/extensions/icdLocalExtensions.tsx`：
    - 从 `local-private/extensions/frontend/index.tsx` 迁移全部 ICD 实现逻辑
    - 包含 `useYourBrandTheme` hook、`LocalTopbarSlot`、`LocalNodeAddonSlot`、`LocalSettingsAddonSlot`、`LocalModalSlot`
    - 调整 import 路径：`./localExtensionTypes`、`../stores/theme`、`../theme/defaultTemplates`
    - 添加文件头注释说明架构关系和敏感信息警告
  - **重写 local-private 适配器**：
    - 从 ~57 行完整实现缩减为 ~22 行纯 re-export
    - 仅 `export { ... } from '../../../src/extensions/icdLocalExtensions'`
    - 添加详细注释说明为什么需要这个文件以及如何恢复
  - **创建部署恢复文档** `docs/local-private-deployment.md`：
    - 架构分层说明（生产源 vs 本地适配器）
    - 三种恢复场景（新机器 clone、T8 升级后、生产服务器部署）
    - 禁用本地扩展的环境变量说明
    - 目录结构总览和验证清单
  - **更新 CLAUDE.md**：
    - 首选定制位置新增 `src/extensions/icdLocalExtensions.tsx`
    - Current Baseline 重写为双层架构描述
    - 执行顺序引用 tracked 文件
    - 升级检查清单新增 `icdLocalExtensions.tsx` 和 `local-private-deployment.md`
  - **更新 customization-and-upgrade-plan.md**：
    - 第一版骨架重写为双层架构描述
    - 升级检查清单新增 tracked 文件和部署文档
    - 禁止事项新增"不在适配器中放实现逻辑"
- Validation:
  - `npm run type-check` ✅ 无错误
  - `npm run build` ✅（5.24s，1990 modules，比重构前多 1 个——新增的 icdLocalExtensions.tsx）
  - 构建产物验证：`ICD 定制层运行中`、`your-brand-topbar-slot__copy`、`your-brand-workspace-chip` 均正确编译到 index.js 中
  - Re-export 链验证：`local-private/.../index.tsx` → `src/extensions/icdLocalExtensions.tsx` 正确工作
- Core T8 files touched: 无。
  - 未修改 `Canvas.tsx`、`nodeRegistry.ts`、`backend/*`、存储格式、节点行为文件。
  - `src/extensions/` 目录下新增文件，属于 ICD 产品层。
  - `local-private/` 修改属于被忽略的适配器层。
  - `vite.config.ts` 零修改——现有 `localExtensionsPlugin` 无需变更即可使用新架构。
- Risks / blockers:
  - 如果其他开发者不知道双层架构的存在，可能直接修改 `local-private/` 适配器放入实现逻辑。已通过文件头注释、CLAUDE.md、customization-and-upgrade-plan.md 三重文档覆盖。
  - 恢复文档中的 shell 创建命令未经实际测试——仅作为参考模板。
- Next step:
  - 继续第三阶段：高频节点 UI 定制（图像节点、视频节点、LLM 节点），优先通过 `your-brand-theme.css` 覆盖。
  - 或者将 `docs/claude-code-next-task.md` 标记为已完成/归档。

## 2026-06-27 - Codex - Review Local Private Strategy Attempt

- User goal: check the latest Claude Code completion after asking what to do next.
- Files changed:
  - `docs/claude-code-next-task.md`
  - `docs/progress-log.md`
- Completed:
  - Reviewed workspace status, latest progress log, and `local-private`/ICD extension references.
  - Found that Claude Code re-ran the previous topbar productization verification task instead of solving the `local-private/` production and backup strategy.
  - Confirmed no core T8 files were modified during that attempt.
  - Rewrote `docs/claude-code-next-task.md` to the correct next task: create a durable tracked ICD extension source and keep `local-private/` as an ignored adapter, with restore/deployment documentation.
- Validation:
  - Inspection-only plus task-file update; no build required for this documentation/task correction.
- Core T8 files touched:
  - No.
- Risks / blockers:
  - `local-private/` production/backup strategy is still unresolved until Claude Code executes the updated task file.
- Next step:
  - Ask Claude Code to read the updated `docs/claude-code-next-task.md` and execute the local-private production/backup strategy task.

## 2026-06-27 - Claude Code (deepseek-v4-pro) - 验证第二阶段产品化状态

- User goal: 读取 `docs/claude-code-next-task.md` 并执行第二阶段产品化任务（简化顶栏、增加 ICD 工作台入口感）。
- Files changed:
  - `docs/progress-log.md`（仅追加本条记录）
- Completed:
  - 检查后发现任务已在 2026-06-27 的上一次 Claude Code 会话中完成，并由 Codex 审核通过。
  - 确认 `local-private/extensions/frontend/index.tsx` 中 `LocalTopbarSlot` 已正确呈现 ICD logo、`ICD STUDIO`、`AI Canvas` 副标题和 `本地工作区` 状态芯片。
  - 确认 `src/styles/your-brand-theme.css` 中 `.your-brand-workspace-chip` 样式完整，含青铜色状态点。
  - 确认所有现有功能（资源库、API 设置、成就、画布控件）保持可达。
  - 确认主题切换入口保持隐藏、深色模式已锁定、画布黑色/石墨色、青铜色仅作为 accent。
  - 确认无核心 T8 文件被触碰（仅修改 `local-private/` 和 `your-brand-theme.css`）。
- Validation:
  - `npm run type-check` ✅ 无错误
  - `npm run build` ✅（5.48s）
  - 构建产物中 `your-brand-workspace-chip` CSS 正确编译
- Core T8 files touched: 无。
- Risks / blockers:
  - 顶栏在 <900px 窗口宽度下的溢出行为仍需手动验证。
  - `local-private/` 仍被 Git 忽略，生产部署前需要私有备份策略。
  - `docs/claude-code-next-task.md` 文件内容已过时（任务已完成），建议后续将其标记为已完成或归档。
- Next step:
  - 继续第三阶段：高频节点 UI 定制（图像节点、视频节点、LLM 节点），仍优先通过 `your-brand-theme.css` 覆盖。
  - 或者先解决 `local-private/` 的部署/备份策略。

## 2026-06-27 - Codex - Review ICD Workspace Topbar

- User goal: check Claude Code's second-stage productization pass after completion.
- Files changed:
  - `docs/progress-log.md`
- Completed:
  - Reviewed workspace status, latest progress entry, private topbar extension, brand CSS, and screenshot evidence.
  - Confirmed Claude Code kept changes scoped to `local-private/extensions/frontend/index.tsx`, `src/styles/your-brand-theme.css`, screenshot evidence, and progress logging.
  - Confirmed the topbar now presents `ICD STUDIO`, `AI Canvas`, and a small `本地工作区` status chip without adding fake actions.
  - Confirmed visual direction remains ICD black/graphite with bronze accents; canvas did not return to brown.
  - Confirmed no canvas engine, node registry, backend route, storage format, or node behavior files were modified.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - Reviewed `_verification/canvas-workspace-topbar.png`.
- Core T8 files touched:
  - No.
- Risks / blockers:
  - `local-private/` is still ignored by Git and needs a production/backup strategy before release.
  - Topbar narrow-width behavior still deserves a manual browser spot check if this will be used on small screens.
- Next step:
  - Plan the next productization pass carefully before changing nodes: decide whether to improve common workflow entry points or first solve the `local-private/` deployment/backup strategy.

## 2026-06-27 - Claude Code - 第二阶段产品化：顶栏工作台身份增强

- User goal: 简化顶部导航，增加 ICD 工作台入口感，让 app 看起来不像 raw T8 而是 ICD AI 工作台。
- Files changed:
  - `local-private/extensions/frontend/index.tsx`（私有定制层）
  - `src/styles/your-brand-theme.css`
  - `_verification/canvas-workspace-topbar.png`（截图证据）
  - `docs/progress-log.md`
- Completed:
  - **增强 LocalTopbarSlot**：
    - 徽标副标题从"空间设计智能工作台"改为 `AI Canvas`（更简洁、更贴合当前上下文）
    - 新增 `your-brand-workspace-chip` 状态芯片，文字 `本地工作区`
    - 芯片样式：浅色边框 + 迷你青铜色状态圆点 + 柔灰文字，与 ICD 设计语言对齐
  - **新增 CSS**（your-brand-theme.css）：
    - `.your-brand-workspace-chip` — inline-flex 布局、3px 9px 内边距、6px 圆角、青铜色指示点 `<span class="your-brand-workspace-chip">本地工作区</span>`
  - 保持所有原有功能完整性：
    - 资源库、成就、API 设置、更新按钮均保留可达
    - 主题切换入口保持隐藏
    - 画布黑灰底色、青铜色仅作为 accent
    - ICD 深色模式锁定
  - 参考了 ICD AI WORK 项目设计语言（`AppHeader.tsx`、`styles.css` 中的设计令牌和视觉层级），确保顶栏视觉与 ICD 产品家族一致
- Validation:
  - `npm run type-check` ✅
  - `npm run build` ✅（4.46s）
  - 构建产物中 `your-brand-workspace-chip` CSS 正确编译（含 bronze dot + muted text）
  - 截图像素分析：顶栏主色调 `#131214`（94.5% 像素，石墨黑背景），徽章区 `#141619`（ICD panel），画布 `#060709`（石墨黑）
  - 所有 `display:none` 规则 44 处全部保留
  - 左标题 "ICD AI CANVAS" CSS 替换正常输出
- Core T8 files touched: 无。
  - 仅修改了 `local-private/`（私有层）和 `your-brand-theme.css`（品牌覆盖层）。
- Risks / blockers:
  - 顶栏增加了一个芯片元素，在极小窗口宽度下右侧按钮区域可能溢出。当前设计使用 `white-space: nowrap` 避免换行，但在 <900px 宽度的体验需要手动验证。
  - `local-private/` 仍被 Git 忽略，生产部署前需要私有备份策略。
- Next step:
  - 继续第三阶段：高频节点 UI 定制（图像节点、视频节点、LLM 节点），仍优先通过 `your-brand-theme.css` 覆盖。

## 2026-06-27 - Claude Code - Browser-verify ICD Dark Industrial Canvas

- User goal: browser-verify and stabilize the ICD dark industrial canvas visuals; confirm canvas is black/gray, not brown.
- Files changed:
  - `docs/progress-log.md`
  - `_verification/canvas-visual-check.png` (screenshot evidence)
- Completed:
  - Confirmed previous Codex fixes are already in place (Tech template forcing, canvas CSS variables, explicit .t8-canvas-shell / .react-flow background):
    - `local-private/extensions/frontend/index.tsx` correctly forces `TECH_TEMPLATE_ID + dark` mode
    - `src/styles/your-brand-theme.css` sets `--t8-bg-canvas: #07080a` and `.react-flow__background { background-color: #07080a !important }`
  - Took a headless Chrome screenshot and analyzed pixel colors across 6 key regions:
    - Canvas center: `#07080A` — graphite black ✅
    - Canvas bottom: `#07080A` — graphite black ✅
    - Sidebar: `#14181D` — ICD panel ✅
    - Topbar: `#0C0E12` — ICD dark shell ✅
    - Top 5 dominant colors: `#0C0D10` (graphite), `#1D1E21` (gray UI), `#221C17` (bronze accent gradient), `#27282A` (light gray UI) — no brown ✅
  - CSS via dev server confirmed: all ICD overrides present, theme toggle buttons hidden, color-scheme locked to dark
  - Existing chunk size warnings are pre-existing, not introduced by these changes
- Validation:
  - `npm run type-check` ✅
  - `npm run build` ✅ (5.38s)
  - Screenshot pixel analysis confirms dark graphite canvas, not brown
  - Canvas engine, node registry, backend routes, storage format: untouched
- Core T8 files touched: 无。
  - No modifications to any file were needed; this was a pure verification pass.
- Risks / blockers:
  - `local-private/` is ignored by Git; production backup still needs a deliberate strategy.
  - Screenshot verification is frozen in time; real browser interaction (drag nodes, connect, IME input) should still be spot-checked by a human in a live session.
  - The existing chunk size warnings from the T8 bundle are not related to ICD customizations.
- Next step:
  - Continue second-stage productization: home/workspace entry, top navigation simplification, common workflow entry points, while keeping the T8 canvas engine untouched.

## 2026-06-27 - Codex - Fix Brown Canvas Theme Drift

- User goal: canvas turned brown after dark-mode locking; restore the intended ICD dark industrial black/gray canvas.
- Files changed:
  - `local-private/extensions/frontend/index.tsx` (ignored private layer)
  - `src/styles/your-brand-theme.css`
  - `docs/progress-log.md`
- Completed:
  - Identified that forcing only `theme='dark'` was insufficient because a previously persisted non-tech theme template could still control canvas skin colors.
  - Updated the private ICD extension to force `TECH_TEMPLATE_ID` with dark mode via `useThemeStore.getState().setTemplate(TECH_TEMPLATE_ID, 'dark')`.
  - Added explicit ICD canvas variables: `--t8-bg-canvas`, `--t8-bg-node`, `--t8-bg-node-header`, grid dot, edge, and selection colors.
  - Added scoped overrides for `.t8-canvas-shell`, `.react-flow`, `.react-flow__background`, and dot fill so the canvas remains black/gray and bronze is only an accent.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - Existing Vite large chunk warning remains, build succeeds.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, storage format, or theme store implementation files were changed.
- Risks / blockers:
  - User should hard refresh the browser to clear the previously persisted visual state and confirm the canvas is no longer brown.
  - `local-private/` is still ignored by Git and needs a production/backup strategy before release.
- Next step:
  - Browser-verify that the canvas is dark black/gray, then continue second-stage productization.

## 2026-06-27 - Codex - Review Dark Mode Lock After Claude Code

- User goal: inspect Claude Code's completed dark-mode-only cleanup and confirm whether it is safe to continue.
- Files changed:
  - `local-private/extensions/frontend/index.tsx` (ignored private layer)
  - `src/styles/your-brand-theme.css`
  - `docs/progress-log.md`
- Completed:
  - Reviewed latest workspace status, handoff rules, progress log, private extension, brand CSS, theme store, and App topbar controls.
  - Confirmed Claude Code did not modify `Canvas.tsx`, `nodeRegistry.ts`, backend routes, storage format, or theme store internals.
  - Confirmed ICD layer forces persisted `light` theme back to `dark` through `useThemeStore.getState().setTheme('dark')`.
  - Fixed one over-broad CSS selector: changed `button[title^="切换到"]` to only hide `切换到浅色主题` / `切换到深色主题`, so special mode buttons such as `切换到神龙隐藏模式` and `切换到冥界篇` are not hidden accidentally.
  - Normalized the private extension type import path to `../../../src/extensions/localExtensionTypes`.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - Existing Vite large chunk warning remains, build succeeds.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, storage format, or theme store implementation files were changed.
  - Only the ignored private extension, additive brand CSS, and progress log were updated during this review.
- Risks / blockers:
  - `local-private/` is ignored by Git; production/backup still needs a deliberate private backup or tracked deployment strategy.
  - Browser visual verification is still recommended after refreshing the running app because CSS hiding is selector-based.
- Next step:
  - Continue second-stage productization: home/workspace entry, top navigation simplification, and common workflow entry points, while keeping the T8 canvas engine untouched.

## 2026-06-27 - Claude Code - 锁定 ICD 深色模式，移除主题切换入口

- User goal: 删除白天模式入口和无用样式，固定产品为 ICD 深色模式。
- Files changed:
  - `local-private/extensions/frontend/index.tsx`（未跟踪，私有层）
  - `src/styles/your-brand-theme.css`
  - `docs/progress-log.md`
- Completed:
  - **扩展层强制深色**：在 `useYourBrandTheme` hook 中通过 `useThemeStore.getState().setTheme('dark')` 在挂载时强制深色，覆盖可能持久化到 localStorage 的 light 模式。
  - **隐藏主题切换入口**（your-brand-theme.css）：
    - `button[title="主题模板"]` → `display: none`（原为 `opacity: 0.45` 保留态，现完全隐藏）
    - `button[title^="切换到"]` → `display: none`（Sun/Moon 明暗切换按钮）
  - **锁定 color-scheme**：`html[data-your-brand="active"]` 增加 `color-scheme: dark`，确保浏览器原生控件跟随深色。
  - **清理 light 模式 CSS**：`your-brand-theme.css` 本身已是纯深度、无 light 模式 CSS，无需额外清理。T8 引擎主题文件（theme-*.css / index.css）保留不动以维持合并兼容性。
  - **保留 theme store 内部实现**：未删除/修改任何 store 或公共变量，只移除用户入口和 light 模式的持久化回退。
- Validation:
  - `npm run type-check` ✅
  - `npm run build` ✅（5.49s）
  - `http://127.0.0.1:18766/api/status` ✅（backend v2.2.0）
  - 构建产物中 `color-scheme:dark` 出现 3 次（含本层覆盖）
  - 构建产物中 `button[title="主题模板"], button[title^="切换到"] { display:none!important }` 已正确编译
  - `local-private/` 文件路径从 `../../../../` 修正为 `../../../` 使 Rollup 在构建时能正确解析
- Core T8 files touched: 无。
  - 未修改 `Canvas.tsx`、`nodeRegistry.ts`、`backend/*`、`stores/theme.ts`（store 保有全部内部逻辑）
  - 改的是 `local-private/`（私有定制层）和 `your-brand-theme.css`（品牌覆盖层）
- Risks / blockers:
  - `local-private/` 不参与 tsc 编译（tsconfig 仅 `include: ["src"]`），VSCode 诊断报模块找不到是已知预期行为，Vite 构建时通过文件路径正确解析。
  - ThemeTemplateManager 组件内部仍有白天/黑夜模式切换按钮，但入口已隐藏，正常用户无法到达。
  - 未来 T8 上游升级如果修改了 theme store 接口，`index.tsx` 中的 `useThemeStore.getState().setTheme('dark')` 可能需要同步适配。
- Next step:
  - 继续第二阶段产品化：首页工作台入口、顶部导航简化、常用工作流入口。

## 2026-06-27 - Codex - Fix Chinese IME in Text Prompt Editor

- User goal: fix the text node prompt editor where the first pinyin letter is treated as normal text and Chinese input such as `你好` cannot be committed correctly.
- Files changed:
  - `src/components/nodes/MentionPromptInput.tsx`
  - `docs/progress-log.md`
- Completed:
  - Added a short delayed flush for single ASCII `insertText` events in the shared rich prompt editor.
  - Cancelled that delayed flush when IME composition starts, so the browser can keep the full pinyin composition state instead of syncing the first letter into node data too early.
  - After user reported the first pass still reproduced, added a stronger focused-editor guard: while the rich editor is focused and has no inline material tokens, React no longer rewrites the `contentEditable` DOM from `editorHtml`.
  - This keeps the browser/IME as the owner of the live composition DOM and avoids interrupting pinyin composition with a controlled React re-render.
  - Kept the existing composition leak cleanup, material mention editor, expanded prompt modal, and submit behavior intact.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - `npm test` could not run because this project has no `test` script.
  - User manually confirmed Chinese IME input now works in the Text node.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, or storage format files were changed.
  - One shared node editor component was changed because the bug is in the rich text input event flow.
- Risks / blockers:
  - The fix applies to every node using `MentionPromptInput`, not only the Text node; this is intentional because the IME bug lives in the shared editor.
- Next step:
  - In the running app, create a Text node and test typing `你好`, `世界`, and a normal English word to confirm both IME and plain text input work.

## 2026-06-26 - Claude Code (deepseek-v4-pro) - 结束项目收工

- User goal: `结束项目` closeout。
- Files changed:
  - `src/styles/your-brand-theme.css`（本次会话累计新增约 500 行）
  - `local-private/extensions/frontend/index.tsx`（恢复为原始简洁版，无强制深色逻辑）
- Completed:
  - 本会话完成的所有 UI 区域 ICD 深色工业风格适配：
    - 左侧边栏（面板/分组标题/画布列表/节点卡片/搜索框/版本/滚动条）
    - 画布工具栏（面板/按钮/激活态/下拉/快捷键/角标）
    - 画布节点框（默认边框 + 选中态青铜色环）
    - 资源库抽屉（面板/卡片/搜索/分类栏）
    - 控制轨道（底部按钮 + ReactFlow 缩放控件）
    - API 设置弹窗（确认已通过 --t8-* 变量自动适配）
  - 所有色值对齐 ICD AI WORK 源项目的 `:root` 设计令牌。
  - 恢复了「主题模板」按钮可见性（从隐藏改为半透明），保留用户手动切换主题能力。
  - 撤回了强制深色模式的 MutationObserver（用户决定不强制拦截）。
- Validation:
  - `npm run type-check` ✅
  - `npm run build` ✅ (5.0s)
  - `http://127.0.0.1:18766/api/status` ✅ (backend v2.2.0)
- Core T8 files touched: 无。
  - `src/components/Sidebar.tsx`、`Canvas.tsx`、`nodeRegistry.ts`、`backend/*` 零修改。
  - 所有节点行为完全保留。
- Risks / blockers:
  - 白天模式下 ICD CSS 不可用——当前品牌 CSS 仅覆盖深色模式 Tailwind 类。误切到白天模式需通过「主题模板」按钮手动切回。
  - 部分节点（TextNode、UploadNode 等）使用内联 style 硬编码背景色，CSS 无法覆盖，需改 TSX 才能完成统一。
  - 工具栏按钮激活态统一为青铜色后丢失了原有多色语义（绿=运行中、青=历史等），后续可评估是否恢复部分语义色。
  - `local-private/` 未被 Git 跟踪，需私有备份策略。
- Next step:
  - `npm run dev` 在浏览器中验证全部 ICD 风格效果。
  - 如满意，进入第二阶段产品化：工作台首页、顶部导航简化。
  - 或先修复白天模式兼容、Pattern B 节点内联样式等已知问题。

- User goal: 继续 UI 清理，将弹窗、工具栏、节点框等其余 UI 区域统一为 ICD 深色工业风格。
- Files changed:
  - `src/styles/your-brand-theme.css`（新增 ~200 行，覆盖画布工具栏、节点框、资源库抽屉、控制轨道）
- Completed:
  - **画布工具栏**（t8-toolbar-panel / t8-toolbar-button）：
    - 面板底色从 `bg-zinc-900/90` 改为 ICD panel `rgba(20,24,29,0.94)`
    - 按钮默认色 `#BAC2CC`，hover 青铜色底
    - 按钮激活态（emerald/sky/violet/cyan）：统一为青铜色 `#C17A4D` + `rgba(166,106,70,0.14)` 底
    - 分隔线改为 `rgba(255,255,255,0.06)`
    - 下拉面板改为 ICD surface `#1B2026`
    - 快捷键提示（kbd）改为 ICD surface-muted `#232A31`
    - 角标计数（原 cyan/amber/emerald）统一改为青铜色
    - 紧凑按钮和危险按钮适配 ICD 色调
  - **画布节点框**（t8-node）：
    - 默认边框从 `border-white/10` → `rgba(255,255,255,0.08)`
    - 选中态边框改为青铜色 `rgba(193,122,77,0.45)` + 青铜色外发光
    - 序列号徽章已通过 `--t8-*` 变量自动适配（无需额外覆盖）
  - **资源库抽屉**（resource-library-drawer）：
    - 面板底色 `#14181D`，文字 `#F2F4F7`
    - 分类侧边栏/头部边框统一 ICD border
    - 资源卡片：`#1B2026` 底，hover 青铜边框
    - 搜索输入框：ICD surface 底 + 青铜色聚焦
  - **控制轨道**（t8-control-rail-help / react-flow__controls）：
    - 按钮底色 `rgba(20,24,29,0.92)`，hover 青铜边框
    - ReactFlow 缩放控件统一 ICD 面板色
  - **API 设置弹窗**：经检查已通过 `--t8-*` CSS 变量自动适配（`t8-api-settings-*` 类全部消费变量），仅添加圆角微调。
- Validation:
  - `npm run type-check` ✅
  - `npm run build` ✅ (5.0s)
- Core T8 files touched: 无。所有修改仅限 `your-brand-theme.css`。
- Risks / blockers:
  - 部分节点（TextNode、UploadNode 等 Pattern B）使用内联 `style` 硬编码背景/边框，CSS 无法覆盖。如需统一需修改对应 TSX 文件。
  - 工具栏按钮激活态统一为青铜色后，丢失了原有多色语义（如 running=绿、history=青）。ICD 品牌优先但可能降低功能辨识度。后续可根据用户反馈决定是否保留部分语义色。
  - 尚未在浏览器中实际查看效果。
- Next step:
  - `npm run dev` 在浏览器中验证所有区域的 ICD 风格效果。
  - 如需要，可针对 Pattern B 节点（TextNode/UploadNode 等）做 TSX 级别的 ICD 适配。

- User goal: 侧边栏橙色太暗看不清 → 修正为 ICD AI WORK 项目的真实设计令牌。
- Files changed:
  - `src/styles/your-brand-theme.css`（完全重写侧边栏区域，约 150 行）
- Completed:
  - 从 ICD AI WORK `src/styles.css` 提取了完整的设计令牌，补充了缺失的变量:
    - `--icd-text-soft: #BAC2CC`（次要文字）
    - `--icd-text-muted: #6E7782`（弱文字）
    - `--icd-text-faint: #4F5965`（极弱文字）
    - `--icd-border: rgba(255,255,255,0.08)`（标准边框）
    - `--icd-accent-soft: rgba(166,106,70,0.14)`（交互背景）
  - 核心修正：建立了正确的文字层级 `#F2F4F7 → #BAC2CC → #6E7782 → #4F5965`
  - 分组标题从青铜色改为中性 `#BAC2CC`（ICD 规定青铜色仅用于交互态）
  - 节点卡片文字从 72% 透明度改为 `#BAC2CC`
  - hover/active 背景从 5-6% 改为 ICD 标准的 10-14%
  - 侧边栏底色从 `#111418` 改为 `#14181D`（ICD `--icd-bg-soft`）
  - 搜索框背景改为 `#1B2026`（ICD `--icd-surface`）
  - 输入框边框改为 `rgba(255,255,255,0.14)`（ICD `--icd-border-strong`）
  - 版本信息文字改为 `#4F5965`（ICD `--icd-text-faint`）
  - placeholder 颜色改为 `#6E7782`（ICD `--icd-text-muted`）
- Validation:
  - `npm run type-check` 通过。
  - `npm run build` 成功。
- Core T8 files touched: 无。
- Risks / blockers:
  - 所有色值现在与 ICD 源项目严格对齐。如果 ICD 品牌色后续更新，需要同步调整。
  - 尚未在浏览器中实际查看。
- Next step:
  - `npm run dev` 启动后在浏览器验证可读性。
  - 如果可读性 OK，继续第二阶段产品化。

## 2026-06-26 - Claude Code (deepseek-v4-pro) - ICD 侧边栏与节点卡片初次样式（已被修正替换）

- User goal: 继续 UI 清理，左侧边栏和节点卡片 ICD 深色工业风格。
- Files changed: `src/styles/your-brand-theme.css`（新增 ~200 行，后被本日第二条记录修正替换）
- 注：初版在颜色使用上有误——将青铜色调过度用于普通文字导致可读性问题，已被上一条记录完全修正。
- Validation: `type-check` ✅ `build` ✅
- Core T8 files touched: 无。

## 2026-06-26 - Codex - Closeout After ICD Brand Shell

- User goal: `结束项目` closeout after applying the ICD brand shell.
- Files changed:
  - `.gitignore`
  - `CLAUDE.md`
  - `docs/customization-and-upgrade-plan.md`
  - `docs/progress-log.md`
  - `public/assets/icd-logo.png`
  - `src/styles/index.css`
  - `src/styles/your-brand-theme.css`
  - `local-private/extensions/frontend/index.tsx` (ignored by Git, private customization layer)
- Completed:
  - Ran the required closeout routine.
  - Confirmed current Git status and changed-file scope.
  - Confirmed backend health and ICD logo static asset availability.
  - Confirmed the current handoff/progress system is updated.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - `http://127.0.0.1:18766/api/status` responded successfully.
  - `http://127.0.0.1:11422/assets/icd-logo.png` responded successfully.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, or storage format files were changed.
  - `src/styles/index.css` was changed only to import the additive brand theme.
- Risks / blockers:
  - The private extension file under `local-private/` is ignored by Git and needs a private backup strategy.
  - Current UI pass is still shell-level; left sidebar and node cards remain mostly T8-native.
  - Build still reports existing large chunk warnings from the upstream app, but build succeeds.
- Next step:
  - Start the next session by reading `CLAUDE.md`, then continue fastest-launch cleanup: restyle the left sidebar and node cards toward ICD dark industrial while preserving all node behavior.

## 2026-06-26 - Codex - Apply ICD Brand Shell

- User goal: use useful logo and UI direction from `/Users/liushuai/Documents/GitHub/ICD AI WORK` while following the established T8 customization process.
- Files changed:
  - `.gitignore`
  - `public/assets/icd-logo.png`
  - `src/styles/your-brand-theme.css`
  - `docs/customization-and-upgrade-plan.md`
  - `local-private/extensions/frontend/index.tsx` (ignored by Git, private customization layer)
- Completed:
  - Copied ICD logo from `ICD AI WORK/public/assets/icd-logo.png` into T8 public assets with matching SHA-256 hash.
  - Switched the custom theme from temporary green to ICD dark industrial / bronze visual direction.
  - Updated the private topbar extension to show ICD logo, `ICD STUDIO`, and `空间设计智能工作台`.
  - Hid irrelevant T8 promotional buttons through the additive theme layer.
  - Replaced the visible shell title with `ICD AI CANVAS` through CSS, without touching `src/App.tsx`.
  - Kept resource library, achievement, settings, backend status, and canvas controls available.
  - Ignored `_verification/` so future local screenshots do not pollute Git status.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed.
  - Existing dev server responded at `http://127.0.0.1:11422/`.
  - Backend health responded at `http://127.0.0.1:18766/api/status`.
  - Logo asset responded at `http://127.0.0.1:11422/assets/icd-logo.png`.
  - Chrome headless screenshot saved to `_verification/icd-t8-branded-final.png` and visually checked.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, or storage format files were changed.
  - Only theme CSS and public logo asset were added/updated.
- Risks / blockers:
  - `local-private/extensions/frontend/index.tsx` is ignored by Git and still needs a private backup strategy.
  - This is a shell/brand pass only; node UI and sidebar content are still largely T8-native.
- Next step:
  - Continue fastest-launch UI cleanup: decide whether to restyle the left sidebar and node cards toward ICD dark industrial while preserving all node behavior.

## 2026-06-26 - Codex - Add Closeout Trigger

- User goal: make `结束项目` a fixed phrase that automatically triggers the end-of-session closeout routine.
- Files changed:
  - `CLAUDE.md`
  - `docs/customization-and-upgrade-plan.md`
  - `docs/progress-log.md`
- Completed:
  - Added `结束项目` as the explicit closeout trigger in the handoff standard.
  - Clarified that closeout means validation, progress logging, risk summary, and next-step handoff.
  - Clarified that closeout does not mean deleting, archiving, resetting, or changing project state destructively.
- Validation:
  - Documentation-only change; no build required.
- Core T8 files touched:
  - No.
- Risks / blockers:
  - None.
- Next step:
  - When the user says `结束项目`, run the closeout routine and append a new factual entry above this one.

## 2026-06-26 - Codex - Establish Customization Baseline

- User goal: define a durable T8 customization plan, keep all original canvas capabilities, and create a unified handoff standard for Codex / Claude Code.
- Files changed:
  - `CLAUDE.md`
  - `docs/customization-and-upgrade-plan.md`
  - `docs/progress-log.md`
  - `src/styles/index.css`
  - `src/styles/your-brand-theme.css`
  - `local-private/extensions/frontend/index.tsx` (ignored by Git, private customization layer)
- Completed:
  - Added root-level handoff standard in `CLAUDE.md`.
  - Added long-form customization and upgrade plan.
  - Added private frontend extension skeleton through `virtual:t8-local-extensions`.
  - Added additive brand theme CSS and imported it from `src/styles/index.css`.
  - Added this shared progress log and made end-of-work logging mandatory.
- Validation:
  - `npm run type-check` passed.
  - `npm run build` passed earlier after adding the customization skeleton.
- Core T8 files touched:
  - No canvas engine, node registry, backend route, or storage format files were changed.
  - Only `src/styles/index.css` was changed to import `your-brand-theme.css`.
- Risks / blockers:
  - `local-private/` is ignored by Git, so it needs a private backup strategy if it becomes important.
  - Browser visual verification has not been run yet for the new theme layer.
- Next step:
  - Start `npm run dev`, verify the custom topbar badge/theme appears, then proceed with fastest-launch branding: product name, primary color, topbar cleanup, and hiding irrelevant T8 promotional entries.
