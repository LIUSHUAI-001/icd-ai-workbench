# local-private/ 部署与恢复指南

## 架构说明

ICD 产品扩展分为两层：

| 层级 | 文件 | Git 跟踪 | 作用 |
|---|---|---|---|
| **生产源** | `src/extensions/icdLocalExtensions.tsx` | ✅ 已跟踪 | ICD 品牌外壳完整实现 |
| **本地适配器** | `local-private/extensions/frontend/index.tsx` | ❌ 已忽略 | 可选的极简 re-export 适配器；存在时优先加载 |

### 为什么需要这个分离

1. **Vite 虚拟模块加载点**：`vite.config.ts` 的 `localExtensionsPlugin` 解析 `virtual:t8-local-extensions`。若本机适配器存在则优先加载；缺失时直接加载受跟踪的 `src/extensions/icdLocalExtensions.tsx`。

2. **公开仓库安全**：`local-private/` 被 `.gitignore` 忽略，避免将定制层提交到公开上游 fork。

3. **可恢复性**：所有实现逻辑在受跟踪的 `icdLocalExtensions.tsx` 中。即使 `local-private/` 丢失，从 GitHub clone 后也会默认启用完整 ICD 产品层，无需手工恢复适配器。

## 在新机器上恢复

### 场景 A：完整 clone 后 local-private/ 不存在

无需创建任何文件。直接安装依赖并启动：

```bash
npm install
cd backend && npm install && cd ..
npm run dev
```

默认会加载 `src/extensions/icdLocalExtensions.tsx`。页面左下角出现 `2.5.5 · 本地 · ICD 外壳` 即表示生效。

### 场景 B：需要本地适配器覆盖入口

只有需要保留本机专用适配层时，才创建以下文件：

```bash
# 1. 创建目录结构
mkdir -p local-private/extensions/frontend

# 2. 创建适配器文件
cat > local-private/extensions/frontend/index.tsx << 'ADAPTER'
/**
 * 本地适配器 — 从受跟踪的 ICD 扩展源文件 re-export。
 *
 * 这个文件是 `local-private/` 中唯一的 ICD 扩展入口。
 * 所有 ICD 实现逻辑位于 `src/extensions/icdLocalExtensions.tsx`（受 Git 跟踪）。
 *
 * 为什么需要这个文件：
 * - `vite.config.ts` 中的 `localExtensionsPlugin` 从此路径加载
 *   `virtual:t8-local-extensions` 虚拟模块。
 * - 这个文件作为本地适配器存在，使 ICD 定制层在不修改 Vite
 *   配置的情况下即可生效。
 * - 如果此文件丢失，按 `docs/local-private-deployment.md` 恢复。
 *
 * 不要在此文件中放入实现逻辑——所有逻辑应放在受跟踪的源文件中。
 * 不要将此文件提交到公开仓库。
 */
export {
  LocalTopbarSlot,
  LocalNodeAddonSlot,
  LocalSettingsAddonSlot,
  LocalModalSlot,
} from '../../../src/extensions/icdLocalExtensions';
ADAPTER

# 3. 验证
npm run type-check
npm run build
```

### 场景 C：T8 上游升级后检查

```bash
# 1. 确认 vite.config.ts 仍包含 localExtensionsPlugin
grep -n 'virtual:t8-local-extensions\|local-private' vite.config.ts

# 2. 确认 src/App.tsx 仍从 virtual:t8-local-extensions 导入
grep -n 'virtual:t8-local-extensions' src/App.tsx

# 3. 确认 tracked ICD 扩展文件存在
ls -la src/extensions/icdLocalExtensions.tsx

# 4. 确认缺少适配器时仍回退到 tracked ICD 扩展，而不是空扩展
# 5. 如果 tracked 文件冲突，按 CLAUDE.md 升级流程处理
```

### 场景 D：部署到生产服务器

```bash
# 普通 Web 构建不要求 local-private 适配器；缺失时使用 tracked ICD 扩展
npm run build
```

正式 Electron 私有发布仍可通过 `T8_REQUIRE_LOCAL_PRIVATE=1` 强制要求私有 sidecar 完整存在；该 fail-closed 规则没有改变。

## 禁用本地扩展

如需在开发或测试中临时禁用 ICD 定制层：

```bash
# 方式 1：环境变量
T8_DISABLE_LOCAL_EXTENSIONS=1 npm run dev

# 方式 2：也是环境变量
T8_ENABLE_LOCAL_PRIVATE=0 npm run dev
```

禁用后，`virtual:t8-local-extensions` 会回退到 `src/extensions/emptyLocalExtensions.tsx`（所有 slot 返回 null），应用将以原生 T8 外观运行。

## 目录结构总览

```
项目根目录/
├── src/
│   └── extensions/
│       ├── icdLocalExtensions.tsx    ← ✅ 受跟踪：ICD 完整实现及默认加载入口
│       ├── localExtensionTypes.ts    ← ✅ 受跟踪：Slot 类型定义
│       └── emptyLocalExtensions.tsx  ← ✅ 受跟踪：空回退
├── local-private/                    ← ❌ 整个目录被 Git 忽略
│   └── extensions/
│       └── frontend/
│           └── index.tsx             ← ❌ 被忽略：可选的极简 re-export 适配器
├── docs/
│   └── local-private-deployment.md   ← ✅ 受跟踪：本文档
└── .gitignore                        ← 包含 /local-private/**
```

## 验证清单

恢复后执行以下验证：

- [x] `npm run type-check` 通过
- [x] `npm run build` 通过
- [x] `npm run dev` 启动后 ICD 顶栏出现
- [x] 画布为黑色/石墨色
- [x] 主题切换入口已隐藏
- [x] 资源库可打开
- [x] API 设置可打开
