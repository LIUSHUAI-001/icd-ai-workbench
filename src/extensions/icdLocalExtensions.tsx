/**
 * ICD 产品扩展实现（受 Git 跟踪的生产源文件）。
 *
 * 这个文件包含 ICD 品牌外壳的完整实现：
 * - 深色科技主题锁定（TECH_TEMPLATE_ID + dark）
 * - ICD 主题初始化与轻量外壳标注
 * - 底部品牌标注
 *
 * 架构说明：
 * - 本文件是 ICD 扩展的**唯一受跟踪源文件**。
 * - `local-private/extensions/frontend/index.tsx` 仅作为本地适配器，
 *   从本文件 re-export，自身保持极简且被 Git 忽略。
 * - 如果 local-private/ 目录丢失，按 `docs/local-private-deployment.md`
 *   恢复适配器文件即可。
 * - 不要在本文件中放入密钥、令牌或敏感信息。
 */
import { useEffect, type FC } from 'react';
import type {
  LocalNodeAddonSlotProps,
  LocalSettingsAddonSlotProps,
  LocalTopbarSlotProps,
} from './localExtensionTypes';
import { useThemeStore } from '../stores/theme';
import { TECH_TEMPLATE_ID } from '../theme/defaultTemplates';

const SIDEBAR_COLLAPSED_KEY = 't8-sidebar-collapsed';

function useYourBrandTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.yourBrand = 'active';
    let collapseTimer: number | null = null;

    // 强制 ICD 深色科技底座，覆盖可能持久化到 localStorage 的 light 或其它主题状态
    const store = useThemeStore.getState();
    if (store.theme !== 'dark' || store.templateId !== TECH_TEMPLATE_ID || store.style !== 'tech') {
      store.setTemplate(TECH_TEMPLATE_ID, 'dark');
    }

    // ICD v5 dock 模式：默认折叠侧边栏。App 会在自身 effect 中持久化当前状态，
    // 所以这里同时写入偏好，并在首帧后通过原生折叠按钮同步当前 React 状态。
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, '1');
    collapseTimer = window.setTimeout(() => {
      const expandedMain = document.querySelector('.t8-main-layout[data-sidebar-collapsed="false"]');
      const toggle = document.querySelector<HTMLButtonElement>('.t8-sidebar-toggle');
      if (expandedMain && toggle) {
        toggle.click();
      }
    }, 120);

    return () => {
      if (collapseTimer !== null) {
        window.clearTimeout(collapseTimer);
      }
      if (root.dataset.yourBrand === 'active') {
        delete root.dataset.yourBrand;
      }
    };
  }, []);
}

export const LocalTopbarSlot: FC<LocalTopbarSlotProps> = () => {
  useYourBrandTheme();

  return null;
};

export const LocalNodeAddonSlot: FC<LocalNodeAddonSlotProps> = () => null;

export const LocalSettingsAddonSlot: FC<LocalSettingsAddonSlotProps> = () => null;

// vite.config 注入的编译期常量（与 package.json 同步）
declare const __APP_VERSION__: string;

export const LocalModalSlot: FC = () => (
  <div className="your-brand-modal-note" aria-hidden="true">
    <strong>{__APP_VERSION__} · 本地 · ICD 外壳</strong>
  </div>
);
