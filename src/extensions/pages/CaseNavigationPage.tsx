/**
 * ICD 产品框架 — 案例导航。
 *
 * 功能：
 * - 搜索输入
 * - 分类 chips：全部 / 建筑 / 室内 / 商业 / 办公 / 酒店 / 餐饮 / 展陈 / 材质 / 综合
 * - 案例卡片（含示例数据）
 * - 打开网站 / 收藏 / 加入画布备注
 *
 * 数据存储在 localStorage，key: icd-ai-canvas:cases:v1
 */
import { type FC, useState, useMemo } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';

/* ---- 类型 ---- */
type CaseCategory = '建筑' | '室内' | '商业' | '办公' | '酒店' | '餐饮' | '展陈' | '材质' | '综合';

interface CaseRecord {
  id: string;
  name: string;
  url: string;
  description: string;
  category: CaseCategory;
  tags: string[];
  note?: string;
  isFavorite: boolean;
  isPreset: boolean;
  createdAt: number;
}

const CATEGORIES: Array<'全部' | CaseCategory> = [
  '全部', '建筑', '室内', '商业', '办公', '酒店', '餐饮', '展陈', '材质', '综合',
];

const STORAGE_KEY = 'icd-ai-canvas:cases:v1';

/* ---- 示例数据 ---- */
const SAMPLE_CASES: CaseRecord[] = [
  {
    id: 'sample-c1',
    name: 'ArchDaily 建筑案例',
    url: 'https://www.archdaily.com',
    description: '全球建筑项目数据库，涵盖文化、住宅、商业、教育等类型',
    category: '建筑',
    tags: ['建筑', '国际', '项目库'],
    isFavorite: true,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'sample-c2',
    name: 'Dezeen 设计杂志',
    url: 'https://www.dezeen.com',
    description: '建筑与室内设计先锋媒体，每日更新全球精选项目',
    category: '室内',
    tags: ['室内', '媒体', '国际'],
    isFavorite: true,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'sample-c3',
    name: '谷德设计网',
    url: 'https://www.gooood.cn',
    description: '国内建筑与室内设计项目平台，含访谈和招聘信息',
    category: '综合',
    tags: ['中文', '项目', '访谈'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'sample-c4',
    name: 'Yatzer 设计旅行',
    url: 'https://www.yatzer.com',
    description: '高端酒店、餐厅和商业空间设计案例，摄影质量极高',
    category: '酒店',
    tags: ['酒店', '摄影', '高端'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'sample-c5',
    name: 'Frame 室内设计奖',
    url: 'https://www.frameweb.com',
    description: '国际室内设计奖项与零售空间创新案例',
    category: '商业',
    tags: ['零售', '奖项', '创新'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'sample-c6',
    name: 'Metalocus 建筑杂志',
    url: 'https://www.metalocus.es',
    description: '欧洲建筑与城市规划深度文章，含学术视角',
    category: '建筑',
    tags: ['欧洲', '学术', '城市规划'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'sample-c7',
    name: 'Office Snapshots',
    url: 'https://officesnapshots.com',
    description: '全球办公空间设计案例库，按行业和规模分类',
    category: '办公',
    tags: ['办公', '科技', '空间规划'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'sample-c8',
    name: 'Restaurant & Bar Design',
    url: 'https://restaurantandbardesignawards.com',
    description: '国际餐厅与酒吧设计奖项入围作品展示',
    category: '餐饮',
    tags: ['餐厅', '酒吧', '奖项'],
    isFavorite: false,
    isPreset: true,
    createdAt: Date.now() - 86400000 * 25,
  },
];

/* ---- localStorage 工具 ---- */
function loadItems(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  saveItems(SAMPLE_CASES);
  return SAMPLE_CASES;
}

function saveItems(items: CaseRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
      custom: items.filter((i) => !i.isPreset).length,
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
              管理团队常用设计网站与案例入口，按空间类型筛选，并把案例说明直接加入项目画布。
            </p>
            <div className="icd-cases__stats">
              <span data-label="个入口">{String(stats.total).padStart(2, '0')}</span>
              <span data-label="个收藏">{String(stats.favorites).padStart(2, '0')}</span>
              <span data-label="个自建">{String(stats.custom).padStart(2, '0')}</span>
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
                <div className="icd-cases__card-head">
                  <span className="icd-cases__card-category">{item.category}</span>
                  {item.isPreset && <small className="icd-cases__card-preset">预置</small>}
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
