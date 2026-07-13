import { type FC, useEffect, useMemo, useState } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';
import { ICD_PROMPT_LIBRARY, type IcdPromptCategory, type IcdPromptRecord } from '../prompts/icdPromptLibrary';

type PromptFilter = '全部' | IcdPromptCategory;
const CATEGORIES: PromptFilter[] = ['全部', '空间类型', '风格表达', '材质与色彩', '灯光与镜头', '改造任务', '负面控制'];
const STORAGE_KEY = 'icd-ai-canvas:prompts:v1';
const STORAGE_VERSION = 2;

function loadPrompts(): IcdPromptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.items)) {
        const savedById = new Map<string, IcdPromptRecord>(parsed.items.map((item: IcdPromptRecord) => [item.id, item]));
        const normalized = ICD_PROMPT_LIBRARY.map((item) => {
          const saved = savedById.get(item.id);
          return saved ? { ...item, isFavorite: saved.isFavorite } : item;
        });
        if (parsed._v !== STORAGE_VERSION) savePrompts(normalized);
        return normalized;
      }
    }
  } catch { /* ignore */ }
  savePrompts(ICD_PROMPT_LIBRARY);
  return ICD_PROMPT_LIBRARY;
}

function savePrompts(items: IcdPromptRecord[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: STORAGE_VERSION, items })); } catch { /* ignore */ }
}

export const PromptLibraryPage: FC = () => {
  const navigate = useIcdNavigate();
  const [items, setItems] = useState(loadPrompts);
  const [category, setCategory] = useState<PromptFilter>('全部');
  const [query, setQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { setItems(loadPrompts()); }, []);

  const persist = (next: IcdPromptRecord[]) => { setItems(next); savePrompts(next); };
  const toggleFavorite = (id: string) => persist(items.map((item) => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== '全部' && item.category !== category) return false;
      if (favoriteOnly && !item.isFavorite) return false;
      return !keyword || [item.title, item.description, item.prompt, item.category, ...item.tags]
        .some((value) => value.toLowerCase().includes(keyword));
    });
  }, [category, favoriteOnly, items, query]);

  const copyPrompt = async (item: IcdPromptRecord) => {
    await navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId((current) => current === item.id ? null : current), 1600);
  };

  const addToCanvas = async (item: IcdPromptRecord) => {
    queueIcdCanvasIntent({ kind: 'add-prompt', title: item.title, text: item.prompt });
    await useCanvasStore.getState().loadCanvases();
    const canvasState = useCanvasStore.getState();
    if (!canvasState.activeId) await canvasState.createCanvas(`画布 ${canvasState.canvases.length + 1}`);
    navigate('canvas');
  };

  return (
    <div className="icd-page icd-page--prompts">
      <IcdNavbar />
      <main className="icd-prompts">
        <section className="icd-prompts__hero">
          <div className="icd-prompts__hero-copy">
            <p className="icd-prompts__kicker">AI 生成工作台</p>
            <h1>提示词库</h1>
            <p className="icd-prompts__sub">把空间类型、风格、材质、灯光和改造任务整理成可直接使用的生成提示词。</p>
            <div className="icd-prompts__stats">
              <span data-label="条提示词">{String(items.length).padStart(2, '0')}</span>
              <span data-label="条收藏">{String(items.filter((item) => item.isFavorite).length).padStart(2, '0')}</span>
              <span data-label="个分类">{String(CATEGORIES.length - 1).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        <div className="icd-prompts__toolbar">
          <label className="icd-prompts__search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索提示词、场景、风格或材质" />
          </label>
          <button className={`icd-chip icd-chip--icon${favoriteOnly ? ' is-active' : ''}`} onClick={() => setFavoriteOnly((value) => !value)}>
            {favoriteOnly ? '★' : '☆'} 仅看收藏
          </button>
        </div>

        <div className="icd-prompts__filters">
          {CATEGORIES.map((item) => <button key={item} className={`icd-chip${category === item ? ' is-active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}
        </div>

        <section className="icd-prompts__grid" aria-label="提示词列表">
          {filtered.map((item) => (
            <article className="icd-prompts__card" key={item.id}>
              <div className="icd-prompts__card-head">
                <span>{item.category}</span>
                <button className={`icd-prompts__fav${item.isFavorite ? ' is-active' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label={item.isFavorite ? '取消收藏' : '收藏'}>{item.isFavorite ? '★' : '☆'}</button>
              </div>
              <h2>{item.title}</h2>
              <p className="icd-prompts__description">{item.description}</p>
              <div className="icd-prompts__prompt">{item.prompt}</div>
              <div className="icd-prompts__tags">{item.tags.map((tag) => <span className="icd-tag" key={tag}>{tag}</span>)}</div>
              <div className="icd-prompts__actions">
                <button className="icd-btn-sm icd-btn-sm--primary" onClick={() => void copyPrompt(item)}>{copiedId === item.id ? '已复制' : '复制提示词'}</button>
                <button className="icd-btn-sm icd-btn-sm--ghost" onClick={() => void addToCanvas(item)}>加入画布</button>
              </div>
            </article>
          ))}
        </section>
      </main>
      <footer className="icd-footer"><strong>ICD STUDIO</strong><span>洲际设计AI工作台</span></footer>
    </div>
  );
};
