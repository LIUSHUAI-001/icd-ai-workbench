# ICD Framework v1 Baseline

Status: complete. Framework baseline and local inspiration import are committed.

## Product Surface

- `#/`: ICD STUDIO homepage with real project count, create/open workspace actions, and workflow cards.
- `#/canvas`: original T8 canvas engine with ICD outer shell.
- `#/inspiration`: searchable local inspiration cards; local image import persists to namespaced localStorage and “加入画布” creates an existing T8 upload image node.
- `#/cases`: searchable local case links; “加入画布备注” creates an existing T8 text node.

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
- Inspiration and case data remain local-first. Inspiration now supports local image import; future content-management work can add edit, metadata, and team-level storage without changing the canvas engine.
- Upstream theme easter-egg modes and tutorial history retain upstream names outside the default ICD path. Do not remove them unless the user asks.

## Next Handoff

1. Choose one product feature at a time: case management, workflow presets, or high-frequency node UI polish.
2. For an upstream T8 upgrade, follow `CLAUDE.md` and re-audit the integration seam before merging.
