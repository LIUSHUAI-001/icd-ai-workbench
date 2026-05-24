#!/bin/bash
# T8-penguin-canvas: 定时把 origin/main 拉取并自动合并到 Penguin 分支
# 冲突策略：中止合并并将冲突信息写入日志，等待人工处理

set -u

# ===== 配置 =====
REPO_DIR="/Users/penguin/work_penguin/T8Penguin/T8-penguin-canvas"
SOURCE_BRANCH="main"
TARGET_BRANCH="Penguin"
REMOTE="origin"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/penguin-sync.log"
CONFLICT_LOG="${LOG_DIR}/penguin-sync-conflict.log"

# 确保 PATH 包含 git（launchd 默认 PATH 极简）
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

mkdir -p "${LOG_DIR}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "${LOG_FILE}"
}

log "===== penguin-sync 开始 ====="

cd "${REPO_DIR}" || { log "ERROR: 无法进入仓库目录 ${REPO_DIR}"; exit 1; }

# 1. 保存当前分支，便于结束时恢复
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
log "当前分支：${CURRENT_BRANCH}"

# 2. 工作区不干净则跳过，避免破坏未提交的修改
if [ -n "$(git status --porcelain)" ]; then
  log "WARN: 工作区有未提交更改，跳过本次同步"
  exit 0
fi

# 3. 若正处于 merge/rebase 中间状态则跳过
if [ -d ".git/MERGE_HEAD" ] || [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  log "WARN: 仓库正处于 merge/rebase 中间状态，跳过本次同步"
  exit 0
fi

# 4. 抓取远端
if ! git fetch "${REMOTE}" --prune >> "${LOG_FILE}" 2>&1; then
  log "ERROR: git fetch 失败"
  exit 1
fi

# 5. 切到 Penguin 分支（不存在则基于 origin/main 创建）
if git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  if ! git checkout "${TARGET_BRANCH}" >> "${LOG_FILE}" 2>&1; then
    log "ERROR: 切换到 ${TARGET_BRANCH} 失败"
    exit 1
  fi
else
  if ! git checkout -b "${TARGET_BRANCH}" "${REMOTE}/${SOURCE_BRANCH}" >> "${LOG_FILE}" 2>&1; then
    log "ERROR: 创建 ${TARGET_BRANCH} 失败"
    exit 1
  fi
fi

# 6. 先 pull Penguin 自身的远端变化（fast-forward 避免不必要冲突）
if git ls-remote --exit-code --heads "${REMOTE}" "${TARGET_BRANCH}" >/dev/null 2>&1; then
  if ! git pull --ff-only "${REMOTE}" "${TARGET_BRANCH}" >> "${LOG_FILE}" 2>&1; then
    log "WARN: ${TARGET_BRANCH} 远端有非快进更新，跳过本次同步以避免破坏"
    [ -n "${CURRENT_BRANCH}" ] && [ "${CURRENT_BRANCH}" != "${TARGET_BRANCH}" ] && git checkout "${CURRENT_BRANCH}" >> "${LOG_FILE}" 2>&1
    exit 0
  fi
fi

# 7. 合并源分支
log "正在合并 ${REMOTE}/${SOURCE_BRANCH} -> ${TARGET_BRANCH}"
if git merge --no-edit "${REMOTE}/${SOURCE_BRANCH}" >> "${LOG_FILE}" 2>&1; then
  log "OK: 合并成功"
  # 8. 推送到远端
  if git push "${REMOTE}" "${TARGET_BRANCH}" >> "${LOG_FILE}" 2>&1; then
    log "OK: 已推送到 ${REMOTE}/${TARGET_BRANCH}"
  else
    log "ERROR: 推送 ${TARGET_BRANCH} 失败"
  fi
else
  log "ERROR: 合并出现冲突，正在中止"
  {
    echo "========== [$(date '+%Y-%m-%d %H:%M:%S')] 合并冲突 =========="
    echo "源: ${REMOTE}/${SOURCE_BRANCH}  目标: ${TARGET_BRANCH}"
    echo "----- 冲突文件 -----"
    git diff --name-only --diff-filter=U
    echo "----- git status -----"
    git status
    echo ""
  } >> "${CONFLICT_LOG}"
  git merge --abort >> "${LOG_FILE}" 2>&1 || true
  log "已 git merge --abort，冲突详情见 ${CONFLICT_LOG}"
fi

# 9. 恢复到原分支（若同步前不在 Penguin 上）
if [ -n "${CURRENT_BRANCH}" ] && [ "${CURRENT_BRANCH}" != "${TARGET_BRANCH}" ] && [ "${CURRENT_BRANCH}" != "HEAD" ]; then
  git checkout "${CURRENT_BRANCH}" >> "${LOG_FILE}" 2>&1 || log "WARN: 恢复到 ${CURRENT_BRANCH} 失败"
fi

log "===== penguin-sync 结束 ====="
exit 0
