/**
 * ICD 产品框架 — 首页。
 * 精确对齐旧 ICD HomePage / p24-home 结构。
 */
import { type FC, useState, useEffect, useMemo } from 'react';
import { IcdNavbar } from './IcdNavbar';
import { useIcdNavigate } from '../icdRouter';
import { queueIcdCanvasIntent } from '../icdCanvasIntent';
import { useCanvasStore } from '../../stores/canvas';

const CAROUSEL_SCENES = [
  { name: '商业零售空间', src: '/assets/p24-home/commercial-retail.png' },
  { name: '商业展示空间', src: '/assets/p24-home/commercial-gallery.png' },
  { name: '企业前厅', src: '/assets/p24-home/commercial-lobby.png' },
];

const MATERIALS = [
  { name: '木饰面', swatch: 'wood' },
  { name: '石材', swatch: 'stone' },
  { name: '玻璃', swatch: 'glass' },
  { name: '金属', swatch: 'metal' },
];

/* ---- 工作流模块 ---- */
const WORKFLOW_MODULES = [
  { id: 'sketch-to-image', kicker: '参考输入', title: '草图转效果图',  flow: '上传 → 图像 → 输出' },
  { id: 'material-replace', kicker: '材质处理', title: '材质替换',      flow: '上传 → 素材集 → 批处理' },
  { id: 'scheme-compare',   kicker: '方案决策', title: '方案对比',      flow: '上传 → 对比 → 输出' },
  { id: 'image-upscale',    kicker: '交付增强', title: '效果图超清',    flow: '文本 → LLM → 图像' },
];

export const HomePage: FC = () => {
  const navigate = useIcdNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [creatingCanvas, setCreatingCanvas] = useState(false);
  const {
    canvases,
    activeId,
    loading: canvasesLoading,
    loadCanvases,
    createCanvas,
    setActive,
  } = useCanvasStore();

  useEffect(() => {
    void loadCanvases();
  }, [loadCanvases]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % CAROUSEL_SCENES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const total = canvases.length;
    const active = canvases.filter((c) => Date.now() - c.updatedAt < 86400000 * 7).length;
    return { total, active, workflows: WORKFLOW_MODULES.length };
  }, [canvases]);

  const leadCanvas = canvases[0] ?? null;

  const openCanvas = (id: string) => {
    setActive(id);
    navigate('canvas');
  };

  const handleCreateCanvas = async () => {
    if (creatingCanvas || canvasesLoading) return;
    setCreatingCanvas(true);
    const canvas = await createCanvas(`画布 ${canvases.length + 1}`);
    setCreatingCanvas(false);
    if (canvas) navigate('canvas');
  };

  const openWorkspace = () => {
    const targetId = activeId || leadCanvas?.id;
    if (targetId) {
      openCanvas(targetId);
      return;
    }
    void handleCreateCanvas();
  };

  const openWorkflowWorkspace = () => {
    queueIcdCanvasIntent({ kind: 'open-workflow' });
    openWorkspace();
  };

  return (
    <div className="icd-page icd-page--home">
      <IcdNavbar />

      <main className="icd-home">
        {/* ======== Hero ======== */}
        <section className="icd-home__hero">
          <div className="icd-home__hero-copy">
            <div className="icd-home__hero-eyebrow">建筑与室内设计团队内部工具</div>
            <h1 className="icd-home__hero-title">
              <span>洲际设计</span>
              <span>AI工作台</span>
            </h1>
            <p className="icd-home__hero-desc">
              从参考图、草图和提示词开始，完成生成、对比、标注与项目资产沉淀。
            </p>
            <div className="icd-home__hero-actions">
              <button
                className="icd-home__btn icd-home__btn--primary"
                onClick={() => void handleCreateCanvas()}
                disabled={creatingCanvas || canvasesLoading}
              >
                {creatingCanvas ? '正在创建...' : '新建画布'}
              </button>
              <button className="icd-home__btn icd-home__btn--ghost" onClick={openWorkspace} disabled={canvasesLoading}>
                进入项目工作台
              </button>
            </div>
          </div>

          <div className="icd-home__hero-stage" aria-hidden="true">
            <div className="icd-home__hero-visual">
              <div className="icd-home__carousel-viewport">
                {CAROUSEL_SCENES.map((scene, index) => (
                  <div
                    key={scene.name}
                    className="icd-home__carousel-window"
                    style={{
                      opacity: index === activeSlide ? 1 : 0,
                      pointerEvents: index === activeSlide ? 'auto' : 'none',
                      transition: 'opacity 520ms cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                  >
                    <img className="icd-home__carousel-img" src={scene.src} alt="" />
                  </div>
                ))}
                <div className="icd-home__carousel-status">
                  <span className="icd-home__carousel-status-dot" />
                  成果就绪
                </div>
                <div className="icd-home__material-tags">
                  {MATERIALS.map((material) => (
                    <span key={material.name} className="icd-home__material-tag">
                      <span
                        className="icd-home__material-swatch"
                        style={{
                          backgroundImage: `url(/assets/p24-home/${material.swatch === 'wood' ? 'wood-walnut-commercial' : material.swatch === 'stone' ? 'stone-dark-commercial' : material.swatch === 'glass' ? 'glass-smoked-commercial' : 'metal-dark-brushed'}.png)`,
                        }}
                      />
                      {material.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="icd-home__carousel-dots" role="tablist" aria-label="切换空间场景">
                {CAROUSEL_SCENES.map((scene, index) => (
                  <button
                    key={scene.name}
                    type="button"
                    role="tab"
                    className={`icd-home__carousel-dot${index === activeSlide ? ' is-active' : ''}`}
                    aria-label={`查看${scene.name}`}
                    aria-selected={index === activeSlide}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======== 项目索引 ======== */}
        <section className="icd-home__project-panel" aria-label="项目索引">
          <div className="icd-home__project-head">
            <span className="icd-home__project-kicker">项目索引</span>
            <span className="icd-home__project-state">
              <span className="icd-home__project-dot" />
              已同步
            </span>
          </div>

          <div className="icd-home__project-stats">
            <div className="icd-home__project-stat">
              <strong>{String(stats.total).padStart(2, '0')}</strong>
              <span>项目</span>
            </div>
            <div className="icd-home__project-stat">
              <strong>{String(stats.active).padStart(2, '0')}</strong>
              <span>活跃</span>
            </div>
            <div className="icd-home__project-stat">
              <strong>{String(stats.workflows).padStart(2, '0')}</strong>
              <span>工作流</span>
            </div>
          </div>

          <div className="icd-home__project-recent">
            <span className="icd-home__project-label">最近打开</span>
            {leadCanvas ? (
              <button className="icd-home__project-entry" onClick={() => openCanvas(leadCanvas.id)}>
                <span>
                  <strong>{leadCanvas.name}</strong>
                  <small>{new Date(leadCanvas.updatedAt).toLocaleDateString('zh-CN')}</small>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <div className="icd-home__project-empty">
                <strong>暂无项目</strong>
                <span>从空白画布开始建立团队工作流</span>
              </div>
            )}
          </div>
        </section>

        {/* ======== 常用工作流 ======== */}
        <section className="icd-home__section" aria-labelledby="workflow-title">
          <h2 className="icd-home__section-title" id="workflow-title">常用工作流</h2>
          <div className="icd-home__workflow-grid">
            {WORKFLOW_MODULES.map((wf, index) => (
              <button
                key={wf.id}
                className="icd-home__workflow-card"
                onClick={openWorkflowWorkspace}
              >
                <span className="icd-home__workflow-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="icd-home__workflow-body">
                  <em>{wf.kicker}</em>
                  <strong>{wf.title}</strong>
                  <span className="icd-home__workflow-flow">{wf.flow}</span>
                </span>
                <span className="icd-home__workflow-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ======== Footer ======== */}
      <footer className="icd-footer">
        <strong>ICD STUDIO</strong>
        <span>洲际设计AI工作台</span>
      </footer>
    </div>
  );
};
