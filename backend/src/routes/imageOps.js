/**
 * 图像处理操作 - 基于 sharp
 * 路由前缀: /api/image
 * 输入图像统一通过 imageUrl(本地 /files/output 或 /files/input)
 * 输出存到 /output 并返回本地 URL
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../config');

const router = express.Router();

// 把本地 URL 解析为绝对路径
function resolveLocalUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('/files/output/')) return path.join(config.OUTPUT_DIR, url.replace('/files/output/', ''));
  if (url.startsWith('/files/input/')) return path.join(config.INPUT_DIR, url.replace('/files/input/', ''));
  if (url.startsWith('/output/')) return path.join(config.OUTPUT_DIR, url.replace('/output/', ''));
  if (url.startsWith('/input/')) return path.join(config.INPUT_DIR, url.replace('/input/', ''));
  return null;
}

// 下载远端图像到 buffer
async function fetchImageBuffer(url) {
  const local = resolveLocalUrl(url);
  if (local && fs.existsSync(local)) return fs.readFileSync(local);
  if (url && /^https?:/i.test(url)) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`下载失败: ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  if (url && url.startsWith('data:image/')) {
    const m = url.match(/^data:image\/[a-z+]+;base64,(.+)$/i);
    if (m) return Buffer.from(m[1], 'base64');
  }
  throw new Error('无法解析图像源');
}

function saveBuffer(buf, ext = 'png') {
  const filename = `op_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const filePath = path.join(config.OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buf);
  return `/files/output/${filename}`;
}

// ========== POST /api/image/resize — 尺寸调整 ==========
// body: { imageUrl, width, height, fit? }
router.post('/resize', async (req, res) => {
  try {
    const { imageUrl, width, height, fit } = req.body || {};
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl 必填' });
    const buf = await fetchImageBuffer(imageUrl);
    const out = await sharp(buf)
      .resize(width || null, height || null, { fit: fit || 'inside' })
      .png()
      .toBuffer();
    res.json({ success: true, data: { imageUrl: saveBuffer(out, 'png') } });
  } catch (e) {
    console.error('resize 错误:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ========== POST /api/image/upscale — 简单放大(线性 2x/3x/4x) ==========
// body: { imageUrl, scale }
router.post('/upscale', async (req, res) => {
  try {
    const { imageUrl, scale } = req.body || {};
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl 必填' });
    const s = Math.max(1, Math.min(8, parseFloat(scale) || 2));
    const buf = await fetchImageBuffer(imageUrl);
    const meta = await sharp(buf).metadata();
    const out = await sharp(buf)
      .resize(Math.round((meta.width || 1024) * s), Math.round((meta.height || 1024) * s), { kernel: 'lanczos3' })
      .png()
      .toBuffer();
    res.json({ success: true, data: { imageUrl: saveBuffer(out, 'png'), scale: s } });
  } catch (e) {
    console.error('upscale 错误:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ========== POST /api/image/grid-crop — 九宫格切图 ==========
// body: { imageUrl, rows?, cols? }
router.post('/grid-crop', async (req, res) => {
  try {
    const { imageUrl, rows, cols } = req.body || {};
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl 必填' });
    const r = Math.max(1, Math.min(8, parseInt(rows) || 3));
    const c = Math.max(1, Math.min(8, parseInt(cols) || 3));
    const buf = await fetchImageBuffer(imageUrl);
    const meta = await sharp(buf).metadata();
    const W = meta.width || 0, H = meta.height || 0;
    if (!W || !H) throw new Error('无法读取图像尺寸');
    const cw = Math.floor(W / c), ch = Math.floor(H / r);
    const urls = [];
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        const tile = await sharp(buf)
          .extract({ left: j * cw, top: i * ch, width: cw, height: ch })
          .png()
          .toBuffer();
        urls.push(saveBuffer(tile, 'png'));
      }
    }
    res.json({ success: true, data: { urls, rows: r, cols: c } });
  } catch (e) {
    console.error('grid-crop 错误:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ========== POST /api/image/combine — 横向/纵向拼接 ==========
// body: { imageUrls: [], direction: 'horizontal'|'vertical' }
router.post('/combine', async (req, res) => {
  try {
    const { imageUrls, direction } = req.body || {};
    if (!Array.isArray(imageUrls) || imageUrls.length < 2) {
      return res.status(400).json({ success: false, error: '至少需要 2 张图像' });
    }
    const dir = direction === 'vertical' ? 'vertical' : 'horizontal';
    const buffers = [];
    for (const u of imageUrls) buffers.push(await fetchImageBuffer(u));
    const metas = await Promise.all(buffers.map((b) => sharp(b).metadata()));

    let W, H, composites;
    if (dir === 'horizontal') {
      H = Math.max(...metas.map((m) => m.height || 0));
      // 等比缩放至同高
      const scaled = await Promise.all(buffers.map((b, i) => {
        const m = metas[i];
        const w = Math.round(((m.width || 1) * H) / (m.height || 1));
        return sharp(b).resize(w, H).png().toBuffer().then((buf) => ({ buf, w }));
      }));
      W = scaled.reduce((s, x) => s + x.w, 0);
      composites = [];
      let off = 0;
      for (const { buf, w } of scaled) {
        composites.push({ input: buf, left: off, top: 0 });
        off += w;
      }
    } else {
      W = Math.max(...metas.map((m) => m.width || 0));
      const scaled = await Promise.all(buffers.map((b, i) => {
        const m = metas[i];
        const h = Math.round(((m.height || 1) * W) / (m.width || 1));
        return sharp(b).resize(W, h).png().toBuffer().then((buf) => ({ buf, h }));
      }));
      H = scaled.reduce((s, x) => s + x.h, 0);
      composites = [];
      let off = 0;
      for (const { buf, h } of scaled) {
        composites.push({ input: buf, left: 0, top: off });
        off += h;
      }
    }

    const out = await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite(composites)
      .png()
      .toBuffer();
    res.json({ success: true, data: { imageUrl: saveBuffer(out, 'png') } });
  } catch (e) {
    console.error('combine 错误:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ========== POST /api/image/remove-bg — 抠图(占位:返回原图) ==========
// 真实抠图通常需要 RH 工作流或 AI 模型,Phase 4 接入
router.post('/remove-bg', async (req, res) => {
  try {
    const { imageUrl } = req.body || {};
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl 必填' });
    // 简易实现:转 PNG(保留 alpha),不做真实背景去除
    const buf = await fetchImageBuffer(imageUrl);
    const out = await sharp(buf).png().toBuffer();
    res.json({
      success: true,
      data: {
        imageUrl: saveBuffer(out, 'png'),
        warning: '当前为占位实现,真实抠图需 RH 工作流或 AI 模型',
      },
    });
  } catch (e) {
    console.error('remove-bg 错误:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
