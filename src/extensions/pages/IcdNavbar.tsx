/**
 * ICD 产品框架 — 顶部导航栏。
 * 精确对齐旧 ICD AppHeader / p24-topbar。
 */
import { type FC, useEffect } from 'react';
import { type IcdRoute, useIcdRoute, useIcdNavigate } from '../icdRouter';
import { useThemeStore } from '../../stores/theme';
import { TECH_TEMPLATE_ID } from '../../theme/defaultTemplates';

interface NavItem {
  key: IcdRoute;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页' },
  { key: 'workspace', label: '工作空间' },
  { key: 'inspiration', label: '提示词库' },
  { key: 'cases', label: '设计资源库' },
];

function useIcdTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.yourBrand = 'active';
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

export const IcdNavbar: FC = () => {
  useIcdTheme();
  const active = useIcdRoute();
  const navigate = useIcdNavigate();

  return (
    <header className="icd-navbar">
      <div className="icd-navbar__inner">
        {/* 品牌区 — p24-brand：渐变方块 + 文字 */}
        <a
          className="icd-navbar__brand"
          href="#/"
          onClick={(e) => { e.preventDefault(); navigate('home'); }}
        >
          <span className="icd-navbar__brand-mark" aria-hidden="true" />
          <span>ICD STUDIO</span>
        </a>

        {/* 导航 — p24-nav */}
        <nav className="icd-navbar__nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={`#/${item.key === 'home' ? '' : item.key}`}
              className={`icd-navbar__link${active === item.key ? ' is-active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(item.key); }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA — p24-button--nav */}
        <a
          className="icd-navbar__cta"
          href="#/workspace"
          onClick={(e) => { e.preventDefault(); navigate('workspace'); }}
        >
          进入工作空间
        </a>
      </div>
    </header>
  );
};
