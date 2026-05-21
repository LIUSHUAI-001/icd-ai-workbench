/**
 * 文件上传/下载路由
 * 用于:用户从本地上传参考图,后续传给图像生成接口
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const router = express.Router();

// 配置 multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.INPUT_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `up_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE },
});

// POST /api/files/upload — 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '未收到文件' });
  }
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      url: `/files/input/${req.file.filename}`,
      size: req.file.size,
      mime: req.file.mimetype,
    },
  });
});

// GET /api/files/list — 列出 output 目录
router.get('/list', (_req, res) => {
  try {
    const files = fs.readdirSync(config.OUTPUT_DIR)
      .filter((f) => /\.(png|jpe?g|webp|gif|mp4|webm|mp3|wav)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(config.OUTPUT_DIR, f));
        return {
          filename: f,
          url: `/files/output/${f}`,
          size: stat.size,
          mtime: stat.mtimeMs,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
    res.json({ success: true, data: files });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/files/upload-base64 — 从 base64 dataURL 保存 PNG/JPG 到 OUTPUT_DIR
// 供手绘画板 / 抽帧等前端产生的图像使用
router.post('/upload-base64', express.json({ limit: '20mb' }), (req, res) => {
  try {
    const { dataUrl, prefix } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ success: false, error: '缺少 dataUrl' });
    }
    const m = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i.exec(dataUrl);
    if (!m) {
      return res.status(400).json({ success: false, error: 'dataUrl 格式不支持' });
    }
    const ext = m[1].toLowerCase() === 'jpg' ? 'jpeg' : m[1].toLowerCase();
    const buf = Buffer.from(m[2], 'base64');
    const tag = (prefix || 'draw').replace(/[^a-z0-9-]/gi, '').slice(0, 16) || 'draw';
    const filename = `${tag}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext === 'jpeg' ? 'png' : ext}`;
    const fp = path.join(config.OUTPUT_DIR, filename);
    fs.writeFileSync(fp, buf);
    res.json({
      success: true,
      data: {
        filename,
        url: `/files/output/${filename}`,
        size: buf.length,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
