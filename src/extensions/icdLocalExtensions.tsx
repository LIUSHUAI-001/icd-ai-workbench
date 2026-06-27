/**
 * ICD 产品扩展实现（受 Git 跟踪的生产源文件）。
 *
 * 这个文件包含 ICD 品牌外壳的完整实现：
 * - 深色科技主题锁定（TECH_TEMPLATE_ID + dark）
 * - 顶栏 ICD 品牌标识（logo / ICD STUDIO / AI Canvas / 本地工作区）
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

function useYourBrandTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.yourBrand = 'active';

    // 强制 ICD 深色科技底座，覆盖可能持久化到 localStorage 的 light 或其它主题状态
    const store = useThemeStore.getState();
    if (store.theme !== 'dark' || store.templateId !== TECH_TEMPLATE_ID || store.style !== 'tech') {
      store.setTemplate(TECH_TEMPLATE_ID, 'dark');
    }

    return () => {
      if (root.dataset.yourBrand === 'active') {
        delete root.dataset.yourBrand;
      }
    };
  }, []);
}

export const LocalTopbarSlot: FC<LocalTopbarSlotProps> = () => {
  useYourBrandTheme();

  return (
    <>
      <div className="your-brand-topbar-slot" title="ICD STUDIO — AI Canvas">
        <span className="your-brand-topbar-slot__logo" aria-hidden="true">
          <img src="/assets/icd-logo.png" alt="" />
        </span>
        <span className="your-brand-topbar-slot__copy">
          <strong>ICD STUDIO</strong>
          <small>AI Canvas</small>
        </span>
      </div>
      <span className="your-brand-workspace-chip">本地工作区</span>
    </>
  );
};

export const LocalNodeAddonSlot: FC<LocalNodeAddonSlotProps> = () => null;

export const LocalSettingsAddonSlot: FC<LocalSettingsAddonSlotProps> = () => null;

export const LocalModalSlot: FC = () => (
  <div className="your-brand-modal-note" aria-hidden="true">
    <strong>ICD 定制层运行中</strong>
    T8 画布内核保持原样，当前加载 ICD 品牌外壳和深色主题覆盖。
  </div>
);
