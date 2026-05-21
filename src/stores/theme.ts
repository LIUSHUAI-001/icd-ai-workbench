import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CanvasTheme = 'dark' | 'light';
export type ThemeStyle = 'tech' | 'pixel';

interface ThemeState {
  theme: CanvasTheme;
  style: ThemeStyle;
  toggleTheme: () => void;
  setTheme: (theme: CanvasTheme) => void;
  toggleStyle: () => void;
  setStyle: (style: ThemeStyle) => void;
}

/**
 * 主题状态管理(支持持久化到 localStorage)
 * - theme: dark | light 明暗模式
 * - style: tech | pixel 视觉风格
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      style: 'tech',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      toggleStyle: () => set((state) => ({ style: state.style === 'tech' ? 'pixel' : 'tech' })),
      setStyle: (style) => set({ style }),
    }),
    {
      name: 't8-canvas-theme',
    }
  )
);
