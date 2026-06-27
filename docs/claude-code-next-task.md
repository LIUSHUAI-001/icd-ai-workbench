# Claude Code Next Task

## Task

Pre-commit baseline audit and cleanup for the ICD customization work.

This is not a feature task. Do not redesign UI and do not change canvas behavior.

## Required Reading

Before changing files, read:

1. `CLAUDE.md`
2. `docs/customization-and-upgrade-plan.md`
3. `docs/progress-log.md`
4. `docs/local-private-deployment.md`

## Background

The ICD customization baseline now includes:

- tracked handoff docs
- tracked ICD extension implementation
- ignored `local-private/` adapter
- ICD brand CSS
- ICD logo asset
- Chinese IME fix in `MentionPromptInput`
- dark/tech theme lock and black/gray canvas

There are many untracked files. Before continuing product work, we need a clean audit of what should be committed, what should remain ignored, and whether any generated/local files leaked into the working tree.

## Goal

Prepare a safe commit-ready baseline report.

Do not create the commit unless the user explicitly asks.

## Scope

Allowed:

- documentation corrections
- `.gitignore` corrections if needed
- `docs/progress-log.md`
- `docs/claude-code-next-task.md`

Avoid code edits unless you find a clear bug in the current baseline.

Do not modify:

- `src/components/Canvas.tsx`
- `src/config/nodeRegistry.ts`
- `backend/src/server.js`
- `backend/src/routes/*`
- data storage format or user data folders
- node behavior files, unless only inspecting

## Execution Steps

1. Run:

```bash
git status --short --branch
git diff --stat
git diff -- .gitignore src/components/nodes/MentionPromptInput.tsx src/styles/index.css
```

2. Inspect every untracked project file that should be part of the baseline:

- `CLAUDE.md`
- `docs/customization-and-upgrade-plan.md`
- `docs/local-private-deployment.md`
- `docs/progress-log.md`
- `docs/claude-code-next-task.md`
- `src/extensions/icdLocalExtensions.tsx`
- `src/styles/your-brand-theme.css`
- `public/assets/icd-logo.png`

3. Confirm ignored/local-only files:

- `local-private/extensions/frontend/index.tsx` must stay ignored.
- `_verification/` must stay ignored.
- `dist/`, `node_modules/`, data/input/output/thumbnails must not be committed.

4. Confirm no secrets or API keys were introduced:

```bash
rg -n "api[_-]?key|secret|token|password|bearer|sk-|AIza|AKIA|PRIVATE KEY" CLAUDE.md docs src public local-private --glob '!node_modules' --glob '!dist'
```

5. Run:

```bash
npm run type-check
npm run build
```

6. Append a factual entry at the top of `docs/progress-log.md` with:

- files inspected
- validation result
- recommended commit set
- files that must remain ignored
- remaining risks

## Acceptance Criteria

- There is a clear commit-ready baseline report.
- No generated/local/private files are recommended for commit.
- `local-private/` remains ignored.
- `src/extensions/icdLocalExtensions.tsx` is confirmed as the tracked ICD extension implementation.
- `npm run type-check` passes.
- `npm run build` passes.
- No core T8 files were modified during this audit.

