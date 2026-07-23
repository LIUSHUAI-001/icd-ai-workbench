# 仓库与升级指南

## 当前真源

- 本地项目目录：`/Users/liushuai/Documents/GitHub/icd-ai-workbench`
- 个人仓库：`https://github.com/LIUSHUAI-001/icd-ai-workbench`
- `origin`：个人修改版仓库，用于日常推送
- `upstream`：原作者仓库 `https://github.com/T8mars/T8-penguin-canvas.git`
- 当前发布提交：`aa9bba0 docs: document repository rename and upgrade workflow`
- 当前开发分支：`codex/icd-ui-prompt-library`
- 当前隔离升级分支：`codex/upgrade-t8-v2.5.5`
- 个人仓库的 `main` 已指向当前修改版本

`/Users/liushuai/Documents/GitHub/T8-penguin-canvas` 是 2026-07-15 重新建立的官方上游体验副本，只用于对照体验，不作为 ICD 开发工作目录。旧的空仓库 `icd-ai-workbench-staging` 已删除。

## 日常开发

```bash
cd /Users/liushuai/Documents/GitHub/icd-ai-workbench
git status --short --branch
npm run type-check
npm run build
git push origin codex/icd-ui-prompt-library
```

## 同步原作者更新

不要直接在 `main` 上合并上游。每次升级使用独立分支：

```bash
cd /Users/liushuai/Documents/GitHub/icd-ai-workbench
git fetch upstream
git switch -c codex/upgrade-t8-YYYYMMDD
git merge upstream/main
```

合并后重点检查：

- `virtual:t8-local-extensions` 仍能加载 ICD 扩展
- `src/extensions/icdLocalExtensions.tsx` 仍能编译
- `src/styles/index.css` 仍导入 `your-brand-theme.css`
- `src/components/Canvas.tsx`、节点注册、后端路由和存储格式没有被意外破坏
- 运行 `npm run type-check`、`npm run build`，必要时按 `CLAUDE.md` 做画布实测

确认升级没有问题后，再合并并推送：

```bash
git switch main
git merge --no-ff codex/upgrade-t8-YYYYMMDD
git push origin main
```

如果出现冲突，优先保留 ICD 扩展层和 UI 定制；不要为了消除冲突直接覆盖画布内核。

## 交接标准

每次 Codex 或 Claude Code 完成开发后，都要更新 `docs/progress-log.md`。用户说“结束项目”时，必须执行验证、记录变更、列出风险和下一步，不删除项目文件、不重置 Git 历史。
