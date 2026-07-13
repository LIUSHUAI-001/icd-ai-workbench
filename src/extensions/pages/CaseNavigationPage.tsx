/**
 * ICD 产品框架 — 案例导航。
 *
 * 功能：
 * - 搜索输入
 * - 分类 chips：建筑与室内 / 设计媒体 / 作品灵感 / 材料产品 / UI网页 / 色彩工具
 * - 来自浏览器书签的图片网站卡片
 * - 打开网站 / 收藏 / 加入画布备注
 *
 * 数据存储在 localStorage，key: icd-ai-canvas:cases:v2
 */
import { type FC, useMemo, useState } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';
import {
  ICD_DESIGN_BOOKMARKS,
  type IcdDesignBookmark,
  type IcdDesignBookmarkCategory,
} from '../bookmarks/icdDesignBookmarks';

/* ---- 类型 ---- */
type CaseCategory = IcdDesignBookmarkCategory;
type CaseRecord = IcdDesignBookmark;

const CATEGORIES: Array<'全部' | CaseCategory> = [
  '全部', '建筑与室内', '设计媒体与奖项', '作品与灵感平台', '材料、家具与产品',
  'UI、网页与动效', '色彩、字体与设计工具', '设计工具',
];

const STORAGE_KEY = 'icd-ai-canvas:cases:v2';
const STORAGE_VERSION = 3;

/* ---- localStorage 工具 ---- */
function loadItems(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        if (parsed._v === STORAGE_VERSION) return parsed.items;
        if (parsed._v === 2) {
          const favoriteUrls = new Set(
            parsed.items.filter((item: CaseRecord) => item.isFavorite).map((item: CaseRecord) => item.url),
          );
          const migrated = ICD_DESIGN_BOOKMARKS.map((item) => (
            favoriteUrls.has(item.url) ? { ...item, isFavorite: true } : item
          ));
          saveItems(migrated);
          return migrated;
        }
      }
    }
  } catch { /* ignore */ }
  saveItems(ICD_DESIGN_BOOKMARKS);
  return ICD_DESIGN_BOOKMARKS;
}

function saveItems(items: CaseRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: STORAGE_VERSION, items }));
  } catch { /* ignore */ }
}

/* ---- 组件 ---- */
export const CaseNavigationPage: FC = () => {
  const navigate = useIcdNavigate();
  const [items, setItems] = useState<CaseRecord[]>(loadItems);
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('全部');
  const [query, setQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const persist = (next: CaseRecord[]) => {
    setItems(next);
    saveItems(next);
  };

  const toggleFavorite = (id: string) => {
    persist(items.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)));
  };

  const addNoteToCanvas = async (item: CaseRecord) => {
    const text = [
      item.name,
      item.description,
      item.note ? `备注：${item.note}` : '',
      `来源：${item.url}`,
      item.tags.length ? `标签：${item.tags.join('、')}` : '',
    ].filter(Boolean).join('\n');
    queueIcdCanvasIntent({ kind: 'add-case-note', title: item.name, text });
    await useCanvasStore.getState().loadCanvases();
    const canvasState = useCanvasStore.getState();
    if (!canvasState.activeId) {
      await canvasState.createCanvas(`画布 ${canvasState.canvases.length + 1}`);
    }
    navigate('canvas');
  };

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== '全部' && item.category !== category) return false;
      if (favoriteOnly && !item.isFavorite) return false;
      if (!keyword) return true;
      return [item.name, item.description, item.category, item.note ?? '', ...item.tags].some(
        (v) => v.toLowerCase().includes(keyword),
      );
    });
  }, [items, category, query, favoriteOnly]);

  const stats = useMemo(
    () => ({
      total: items.length,
      favorites: items.filter((i) => i.isFavorite).length,
      categories: new Set(items.map((item) => item.category)).size,
    }),
    [items],
  );

  return (
    <div className="icd-page icd-page--cases">
      <IcdNavbar />

      <main className="icd-cases">
        {/* Hero */}
        <section className="icd-cases__hero">
          <div className="icd-cases__hero-copy">
            <p className="icd-cases__kicker">设计案例入口</p>
            <h1>案例导航</h1>
            <p className="icd-cases__sub">
              将设计网站书签按用途整理成图片导航，快速打开参考来源，并把网站说明加入项目画布。
            </p>
            <div className="icd-cases__stats">
              <span data-label="个入口">{String(stats.total).padStart(2, '0')}</span>
              <span data-label="个收藏">{String(stats.favorites).padStart(2, '0')}</span>
              <span data-label="个分类">{String(stats.categories).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        {/* 工具栏 */}
        <div className="icd-cases__toolbar">
          <label className="icd-cases__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索网站、用途或标签"
            />
          </label>
        </div>

        {/* 分类与过滤 */}
        <div className="icd-cases__filters">
          <div className="icd-cases__chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`icd-chip${category === cat ? ' is-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            className={`icd-chip icd-chip--icon${favoriteOnly ? ' is-active' : ''}`}
            onClick={() => setFavoriteOnly((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={favoriteOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            仅看收藏
          </button>
        </div>

        {/* 案例卡片网格 */}
        {filtered.length > 0 ? (
          <section className="icd-cases__grid" aria-label="案例入口">
            {filtered.map((item) => (
            <article key={item.id} className="icd-cases__card">
                <a
                  className="icd-cases__card-media"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`打开 ${item.name}`}
                >
                  <img
                    src={item.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = item.faviconUrl;
                    }}
                  />
                  <span className="icd-cases__card-media-shade" />
                  <span className="icd-cases__card-media-label">查看网站</span>
                </a>
                <div className="icd-cases__card-head">
                  <span className="icd-cases__card-category">{item.category}</span>
                  <button
                    className={`icd-cases__card-fav${item.isFavorite ? ' is-active' : ''}`}
                    onClick={() => toggleFavorite(item.id)}
                    title={item.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                <div className="icd-cases__card-body">
                  <strong className="icd-cases__card-name">{item.name}</strong>
                  <p className="icd-cases__card-desc">{item.description}</p>
                  {item.note && <p className="icd-cases__card-note">{item.note}</p>}
                  {item.tags.length > 0 && (
                    <div className="icd-cases__card-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="icd-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="icd-cases__card-actions">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="icd-btn-sm icd-btn-sm--primary"
                  >
                    打开网站
                  </a>
                  <button
                    className="icd-btn-sm icd-btn-sm--ghost"
                    onClick={() => void addNoteToCanvas(item)}
                  >
                    加入画布备注
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="icd-empty-state">
            <strong>没有符合条件的案例入口</strong>
            <p>换一个分类或清除搜索条件后再试。</p>
          </div>
        )}
      </main>

      <footer className="icd-footer">
        <strong>ICD STUDIO</strong>
        <span>空间设计智能工作台</span>
      </footer>
    </div>
  );
};
