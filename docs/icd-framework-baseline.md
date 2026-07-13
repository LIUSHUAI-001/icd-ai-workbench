# ICD Framework v1 Baseline

Status: complete. Framework baseline, local inspiration import, and bookmark image navigation are committed.

## Product Surface

- `#/`: ICD STUDIO homepage with real project count, create/open workspace actions, and workflow cards.
- `#/canvas`: original T8 canvas engine with ICD outer shell.
- `#/inspiration`: searchable local inspiration cards; local image import persists to namespaced localStorage and “加入画布” creates an existing T8 upload image node.
- `#/cases`: 90 个去重、去失效入口并按 7 类整理的设计网站图片导航；中文/英文重复站点优先保留中文入口，可搜索、收藏和打开外部网站。

## Architecture Boundary

- Preserve T8 node implementations, registry, canvas persistence format, backend routes, and Electron path.
- Put ICD product pages in `src/extensions/pages/`.
- Put cross-page canvas handoff in `src/extensions/icdCanvasIntent.ts`.
- Use `src/App.tsx` only as the shell bridge to existing T8 APIs.
- `src/components/Canvas.tsx` contains one approved empty-state branding text change only; no canvas behavior changes.

## Verification Evidence

- `npm run type-check` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Local frontend and LAN frontend (`192.168.31.187:11422`) returned HTTP 200.
- Backend status endpoint returned healthy.
- Disposable canvas verification passed: Chinese text, inspiration upload node, case text node, text-to-image edge, refresh recovery, and real image generation.
- Disposable canvas, generated output, and autosave mirror were deleted after verification.

## Known Limitations

- `npm run lint` cannot run because this checkout does not include the `eslint` executable. Do not add or upgrade dependencies without explicit approval.
- Inspiration and navigation data remain local-first. Inspiration supports local image import; case navigation uses a versioned project copy of the desktop bookmark export and不提供用户上传、编辑或删除案例的功能。网站缩略图依赖外部 mshots 服务，加载失败时回退到站点 favicon；书签数据更新会迁移旧版收藏状态。
- Upstream theme easter-egg modes and tutorial history retain upstream names outside the default ICD path. Do not remove them unless the user asks.

## Next Handoff

1. Choose one product feature at a time: workflow presets or high-frequency node UI polish. Case navigation is intentionally website-only; do not add case CRUD unless the product decision changes.
2. For an upstream T8 upgrade, follow `CLAUDE.md` and re-audit the integration seam before merging.
