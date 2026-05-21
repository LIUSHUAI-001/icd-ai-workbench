import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CanvasTheme = 'dark' | 'light';

interface ThemeState {
  theme: CanvasTheme;
  toggleTheme: () => void;
  setTheme: (theme: CanvasTheme) => void;
}

/**
 * 主题状态管理(支持持久化到 localStorage)
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // 默认深色
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 't8-canvas-theme',
    }
  )
);
