/**
 * ICD 产品框架 — 轻量 hash 路由。
 *
 * 路由表：
 * - #/ 或空 hash  → 首页
 * - #/canvas       → T8 画布（现有 App 完整渲染）
 * - #/inspiration  → 提示词库
 * - #/cases        → 案例导航
 *
 * 不引入 React Router，纯 hash parser + popstate 监听。
 */
import { useState, useEffect, useCallback } from 'react';

export type IcdRoute = 'home' | 'canvas' | 'inspiration' | 'cases';

const ROUTE_MAP: Record<string, IcdRoute> = {
  '': 'home',
  '/': 'home',
  '/canvas': 'canvas',
  '/inspiration': 'inspiration',
  '/cases': 'cases',
};

function parseHash(): IcdRoute {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#/, '') || '';
  // 去掉尾部斜线
  const normalized = raw.replace(/\/+$/, '') || '';
  return ROUTE_MAP[normalized] ?? 'home';
}

const listeners = new Set<() => void>();

function subscribeHashChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// 仅在浏览器端注册全局监听
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', notifyListeners);
  window.addEventListener('popstate', notifyListeners);
}

export function useIcdRoute(): IcdRoute {
  const [route, setRoute] = useState<IcdRoute>(parseHash);

  useEffect(() => {
    return subscribeHashChange(() => setRoute(parseHash()));
  }, []);

  return route;
}

export function navigateIcd(route: IcdRoute) {
  const hash = route === 'home' ? '#/' : `#/${route}`;
  if (typeof window !== 'undefined') {
    window.location.hash = hash;
  }
}

export function useIcdNavigate() {
  return useCallback((route: IcdRoute) => navigateIcd(route), []);
}
