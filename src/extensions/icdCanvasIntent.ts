/**
 * ICD 非画布页面进入 T8 画布时的一次性界面意图。
 * 只控制外壳 UI，不写入画布数据，也不影响节点或连线。
 */
export type IcdCanvasIntent =
  | { kind: 'open-workflow' }
  | {
      kind: 'add-inspiration';
      title: string;
      imageUrl: string;
      note?: string;
      category: string;
      tags: string[];
    }
  | { kind: 'add-case-note'; title: string; text: string }
  | { kind: 'add-prompt'; title: string; text: string };

const STORAGE_KEY = 'icd-ai-canvas:pending-intent:v1';

export function queueIcdCanvasIntent(intent: IcdCanvasIntent) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function consumeIcdCanvasIntent(): IcdCanvasIntent | null {
  if (typeof window === 'undefined') return null;
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  if (!value) return null;
  try {
    const intent = JSON.parse(value) as IcdCanvasIntent;
    if (intent?.kind === 'open-workflow') return intent;
    if (intent?.kind === 'add-inspiration' && intent.title && intent.imageUrl) return intent;
    if (intent?.kind === 'add-case-note' && intent.title && intent.text) return intent;
    if (intent?.kind === 'add-prompt' && intent.title && intent.text) return intent;
  } catch {
    // Ignore an interrupted or stale cross-page intent.
  }
  return null;
}
