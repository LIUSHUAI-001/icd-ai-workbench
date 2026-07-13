/**
 * ICD 产品框架 — 灵感库。
 *
 * 功能：
 * - 搜索输入
 * - 分类 chips：全部 / 空间氛围 / 材质参考 / 灯光参考 / 色彩方案
 * - 参考卡片（含示例数据）
 * - 收藏 / 加入画布 操作
 *
 * 数据存储在 localStorage，key: icd-ai-canvas:inspiration:v1
 */
import { type ChangeEvent, type FC, useRef, useState, useMemo } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';
import { uploadFile } from '../../services/generation';

/* ---- 类型 ---- */
type InspirationCategory = '空间氛围' | '材质参考' | '灯光参考' | '色彩方案';

interface InspirationRecord {
  id: string;
  title: string;
  category: InspirationCategory;
  tags: string[];
  imageUrl: string;
  sourceUrl?: string;
  note?: string;
  isFavorite: boolean;
  createdAt: number;
}

const CATEGORIES: Array<'全部' | InspirationCategory> = [
  '全部', '空间氛围', '材质参考', '灯光参考', '色彩方案',
];

const STORAGE_KEY = 'icd-ai-canvas:inspiration:v1';
const SAMPLE_VERSION = 2;

/* ---- 示例数据 ---- */
const SAMPLE_INSPIRATIONS: InspirationRecord[] = [
  {
    id: 'sample-1',
    title: '暖色精品零售空间',
    category: '空间氛围',
    tags: ['零售', '暖色', '木饰面'],
    imageUrl: '/assets/p24-home/commercial-retail.png',
    note: '适合高端精品店，暖色调搭配间接照明营造高级感',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'sample-2',
    title: '天然大理石纹理合集',
    category: '材质参考',
    tags: ['大理石', '石材', '天然纹理'],
    imageUrl: '/assets/p24-home/stone-dark-commercial.png',
    note: '可用于前台、地面和墙面装饰面板',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'sample-3',
    title: '酒店大堂间接照明方案',
    category: '灯光参考',
    tags: ['间接照明', '酒店', '暖白光'],
    imageUrl: '/assets/p24-home/commercial-lobby.png',
    note: '3000K 色温，线性灯带隐藏安装',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'sample-4',
    title: '莫兰迪色系办公空间',
    category: '色彩方案',
    tags: ['莫兰迪', '办公', '低饱和'],
    imageUrl: '/assets/p24-home/commercial-gallery.png',
    note: '灰绿 + 灰蓝 + 米白，适合创意办公空间',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'sample-5',
    title: '工业风咖啡店氛围',
    category: '空间氛围',
    tags: ['工业风', '咖啡店', '混凝土'],
    imageUrl: '/assets/p24-home/wood-walnut-commercial.png',
    note: '裸露混凝土 + 黑色金属 + 暖色木质家具',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'sample-6',
    title: '黄铜金属饰面参考',
    category: '材质参考',
    tags: ['黄铜', '金属', '装饰'],
    imageUrl: '/assets/p24-home/metal-dark-brushed.png',
    note: '拉丝黄铜用于灯具、门把手和装饰线条',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 20,
  },
];

/* ---- localStorage 工具 ---- */
function loadItems(): InspirationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._v === SAMPLE_VERSION && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed.items;
      }
    }
  } catch { /* ignore */ }
  // 首次使用或版本不匹配：写入示例数据
  saveItems(SAMPLE_INSPIRATIONS);
  return SAMPLE_INSPIRATIONS;
}

function saveItems(items: InspirationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: SAMPLE_VERSION, items }));
  } catch { /* ignore */ }
}

/* ---- 组件 ---- */
export const InspirationPage: FC = () => {
  const navigate = useIcdNavigate();
  const [items, setItems] = useState<InspirationRecord[]>(loadItems);
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('全部');
  const [query, setQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const persist = (next: InspirationRecord[]) => {
    setItems(next);
    saveItems(next);
  };

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== '全部' && item.category !== category) return false;
      if (favoriteOnly && !item.isFavorite) return false;
      if (!keyword) return true;
      return [item.title, item.category, item.note ?? '', ...item.tags].some((v) =>
        v.toLowerCase().includes(keyword),
      );
    });
  }, [items, category, query, favoriteOnly]);

  const toggleFavorite = (id: string) => {
    persist(items.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)));
  };

  const addToCanvas = async (item: InspirationRecord) => {
    queueIcdCanvasIntent({
      kind: 'add-inspiration',
      title: item.title,
      imageUrl: item.imageUrl,
      note: item.note,
      category: item.category,
      tags: item.tags,
    });
    await useCanvasStore.getState().loadCanvases();
    const canvasState = useCanvasStore.getState();
    if (!canvasState.activeId) {
      await canvasState.createCanvas(`画布 ${canvasState.canvases.length + 1}`);
    }
    navigate('canvas');
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    try {
      const uploaded = await uploadFile(file);
      const title = file.name.replace(/\.[^.]+$/, '').trim() || '本地灵感参考';
      const nextItem: InspirationRecord = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        category: '空间氛围',
        tags: ['本地上传'],
        imageUrl: uploaded.url,
        note: '本地导入的灵感参考图',
        isFavorite: false,
        createdAt: Date.now(),
      };
      persist([nextItem, ...items]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: items.length,
      favorites: items.filter((i) => i.isFavorite).length,
      categories: new Set(items.map((i) => i.category)).size,
    }),
    [items],
  );

  return (
    <div className="icd-page icd-page--inspiration">
      <IcdNavbar />

      <main className="icd-inspiration">
        {/* Hero */}
        <section className="icd-inspiration__hero">
          <div className="icd-inspiration__hero-copy">
            <p className="icd-inspiration__kicker">参考资料入口</p>
            <h1>灵感库</h1>
            <p className="icd-inspiration__sub">
              沉淀空间氛围、材质、灯光和色彩参考，并直接加入项目画布作为生成输入。
            </p>
            <div className="icd-inspiration__stats">
              <span data-label="条参考">{String(stats.total).padStart(2, '0')}</span>
              <span data-label="条收藏">{String(stats.favorites).padStart(2, '0')}</span>
              <span data-label="个分类">{String(stats.categories).padStart(2, '0')}</span>
            </div>
          </div>
        </section>

        {/* 工具栏 */}
        <div className="icd-inspiration__toolbar">
          <label className="icd-inspiration__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题、标签或说明"
            />
          </label>
          <div className="icd-inspiration__upload">
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void handleUpload(event)}
              hidden
            />
            <button
              type="button"
              className="icd-btn-sm icd-btn-sm--primary"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? '上传中...' : '上传图片'}
            </button>
            {uploadError && <span className="icd-inspiration__upload-error">{uploadError}</span>}
          </div>
        </div>

        {/* 分类与过滤 */}
        <div className="icd-inspiration__filters">
          <div className="icd-inspiration__chips">
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

        {/* 卡片网格 */}
        {filtered.length > 0 ? (
          <section className="icd-inspiration__grid" aria-label="灵感资料">
            {filtered.map((item) => (
              <article key={item.id} className="icd-inspiration__card">
                <div className="icd-inspiration__card-media">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} />
                  ) : (
                    <div className="icd-inspiration__card-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <span className="icd-inspiration__card-category">{item.category}</span>
                  <button
                    className={`icd-inspiration__card-fav${item.isFavorite ? ' is-active' : ''}`}
                    onClick={() => toggleFavorite(item.id)}
                    title={item.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={item.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                <div className="icd-inspiration__card-body">
                  <h2>{item.title}</h2>
                  {item.note && <p>{item.note}</p>}
                  {item.tags.length > 0 && (
                    <div className="icd-inspiration__card-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="icd-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="icd-inspiration__card-actions">
                    <button
                      className="icd-btn-sm icd-btn-sm--primary"
                      onClick={() => void addToCanvas(item)}
                    >
                      加入画布
                    </button>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="icd-btn-sm icd-btn-sm--ghost"
                      >
                        来源
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="icd-empty-state">
            <strong>{items.length === 0 ? '还没有参考资料' : '没有符合条件的资料'}</strong>
            <p>
              {items.length === 0
                ? '上传本地图片或保存外部参考地址，建立团队自己的视觉资料库。'
                : '换一个分类或清除搜索条件后再试。'}
            </p>
          </div>
        )}
      </main>

      <footer className="icd-footer">
        <strong>ICD STUDIO</strong>
        <span>洲际设计AI工作台</span>
      </footer>
    </div>
  );
};
