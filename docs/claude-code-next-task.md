# Claude Code Next Task

## Task

Canvas product layout framework and menu information architecture.

This is a framework/layout task, not a detail-polish task. The user has not approved the full canvas menu layout yet, so do not continue refining node-level visual details.

## Required Reading

Before changing files, read:

1. `CLAUDE.md`
2. `docs/customization-and-upgrade-plan.md`
3. `docs/progress-log.md`
4. `docs/local-private-deployment.md`

## Current State

- ICD baseline commit exists: `395b537 chore: establish ICD customization baseline`
- Phase 3 node UI CSS has been attempted but is still uncommitted.
- Current uncommitted files may include:
  - `src/styles/your-brand-theme.css`
  - `docs/progress-log.md`
  - this task file
- Do not commit unless the user explicitly asks.

## User Decision

The user wants to pause detail polishing and first define the whole canvas framework/menu layout.

Meaning:

- First decide global layout structure.
- Then decide menu grouping and hierarchy.
- Then implement only a low-risk layout shell.
- Fine visual details come later.

## Goal

Produce a clear, reviewable canvas layout framework for ICD AI Canvas.

The output should make it easy for the user to approve or reject:

- top bar structure
- left menu/sidebar structure
- canvas toolbar structure
- right-side or bottom utility area, if needed
- menu grouping and naming
- which original T8 controls remain visible
- which original T8 controls are hidden, moved, or renamed

## Scope

Allowed:

- Inspect existing layout components and CSS.
- Update `docs/claude-code-next-task.md`.
- Update `docs/progress-log.md`.
- Create or update a layout planning document if useful, preferably:
  - `docs/canvas-layout-framework.md`
- Add conservative CSS layout shell rules in `src/styles/your-brand-theme.css` only if needed to produce a visible framework preview.

Avoid:

- Node card detail polishing.
- Broad node CSS overrides.
- Changing node behavior.
- Changing canvas engine behavior.
- Creating fake product features.

Do not modify:

- `src/components/Canvas.tsx`
- `src/components/nodes/UploadNode.tsx`
- `src/config/nodeRegistry.ts`
- `src/config/portTypes.ts`
- `backend/src/server.js`
- `backend/src/routes/*`
- data storage format or user data folders

If a layout change seems to require modifying one of the forbidden files, stop and document the reason instead of editing it.

## Execution Steps

1. Inspect existing layout surfaces:

```bash
rg -n "t8-topbar|t8-sidebar|t8-canvas-shell|data-canvas-floating-ui|react-flow__controls|t8-context-menu|LocalTopbarSlot|ResourceLibrary|ThemeTemplate|ApiSettings" src local-private
```

2. Review current uncommitted diff:

```bash
git status --short --branch
git diff --stat
git diff -- src/styles/your-brand-theme.css docs/progress-log.md docs/claude-code-next-task.md
```

3. Create `docs/canvas-layout-framework.md` with:

- Current layout inventory
- Proposed ICD layout framework
- Menu grouping proposal
- Keep / move / hide / rename table
- Implementation boundaries
- Risks and approval questions

4. If making CSS changes, keep them conservative:

- Only layout shell/menu structure selectors.
- Avoid broad `.react-flow__node` rules unless explicitly documenting why.
- Do not expand node detail styling.

5. Run:

```bash
npm run type-check
npm run build
```

6. If possible, create a screenshot in `_verification/`, but do not commit `_verification/`.

7. Update `docs/progress-log.md` with:

- files inspected
- files changed
- layout framework summary
- validation result
- core files touched
- next approval step

## Acceptance Criteria

- The user can review a single layout framework document before more UI polishing.
- No canvas behavior changes.
- No node behavior changes.
- No forbidden core files touched.
- `npm run type-check` passes.
- `npm run build` passes.
- Work remains easy to revert or commit separately from the baseline.
