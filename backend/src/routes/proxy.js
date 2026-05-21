/**
 * 上游 API 代理路由
 * 1. 隐藏 API Key,前端只通过 /api/proxy/* 调用
 * 2. 自动注入对应的 Key(贞贞工坊 / LLM 独立)
 * 3. 图像生成结果自动转存到 /output 并返回本地 URL
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const router = express.Router();

// ========== 工具:加载 Settings 明文 ==========
function loadRawSettings() {
  if (!fs.existsSync(config.SETTINGS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(config.SETTINGS_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

// ========== 工具:保存上游返回的图像到本地 ==========
async function saveRemoteImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`下载失败: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (url.match(/\.(png|jpe?g|webp|gif)/i)?.[1] || 'png').toLowerCase();
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const filePath = path.join(config.OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, buf);
    return `/files/output/${filename}`;
  } catch (e) {
    console.error('⚠ 转存图像失败:', e.message);
    return url; // 退化:返回原 URL
  }
}

// 处理 b64_json 格式
function saveBase64Image(b64) {
  try {
    const buf = Buffer.from(b64, 'base64');
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`;
    const filePath = path.join(config.OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, buf);
    return `/files/output/${filename}`;
  } catch (e) {
    console.error('⚠ 解析 b64 失败:', e.message);
    return null;
  }
}

// ========== POST /api/proxy/image — 图像生成 ==========
// body: { model, prompt, n?, size?, image? }
router.post('/image', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.zhenzhenApiKey) {
    return res.status(400).json({ success: false, error: '未配置贞贞工坊 API Key' });
  }
  const { model, prompt, n, size, image, quality } = req.body || {};
  if (!model || !prompt) {
    return res.status(400).json({ success: false, error: 'model 和 prompt 必填' });
  }

  const upstream = `${config.ZHENZHEN_BASE_URL}/v1/images/generations`;
  const body = {
    model,
    prompt,
    n: n || 1,
    size: size || '1024x1024',
    response_format: 'b64_json',
  };
  if (image) body.image = image;
  if (quality) body.quality = quality;

  try {
    const r = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.zhenzhenApiKey}`,
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) });
    }
    if (!r.ok) {
      return res.status(r.status).json({
        success: false,
        error: data?.error?.message || data?.message || `上游 HTTP ${r.status}`,
      });
    }
    // 处理结果(支持 b64_json 和 url 两种格式)
    const items = Array.isArray(data?.data) ? data.data : [];
    const urls = [];
    for (const it of items) {
      if (it?.b64_json) {
        const u = saveBase64Image(it.b64_json);
        if (u) urls.push(u);
      } else if (it?.url) {
        const u = await saveRemoteImage(it.url);
        urls.push(u);
      }
    }
    res.json({
      success: true,
      data: { urls, raw: data, model, prompt },
    });
  } catch (e) {
    console.error('proxy/image 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

// ========== POST /api/proxy/llm — LLM Chat(独立 Key) ==========
// body: { model, messages, temperature?, max_tokens?, stream? }
router.post('/llm', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.llmApiKey) {
    return res.status(400).json({ success: false, error: '未配置 LLM 独立 API Key' });
  }
  const { model, messages, temperature, max_tokens } = req.body || {};
  if (!model || !messages) {
    return res.status(400).json({ success: false, error: 'model 和 messages 必填' });
  }

  const upstream = `${config.ZHENZHEN_BASE_URL}/v1/chat/completions`;
  try {
    const r = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.llmApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
      }),
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) });
    }
    if (!r.ok) {
      return res.status(r.status).json({
        success: false,
        error: data?.error?.message || `上游 HTTP ${r.status}`,
      });
    }
    const reply = data?.choices?.[0]?.message?.content || '';
    res.json({
      success: true,
      data: { content: reply, raw: data, model },
    });
  } catch (e) {
    console.error('proxy/llm 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

// ========================================================================
// 视频生成(异步)
// 协议(贞贞工坊):POST /v2/videos/generations + GET /v2/videos/generations/:tid
// ========================================================================
router.post('/video/submit', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.zhenzhenApiKey) {
    return res.status(400).json({ success: false, error: '未配置贞贞工坊 API Key' });
  }
  const { model, prompt, aspect_ratio, enhance_prompt, seed, enable_upsample, images } = req.body || {};
  if (!model || !prompt) {
    return res.status(400).json({ success: false, error: 'model 和 prompt 必填' });
  }
  const upstream = `${config.ZHENZHEN_BASE_URL}/v2/videos/generations`;
  const body = { prompt, model, enhance_prompt: enhance_prompt !== false };
  if (aspect_ratio) body.aspect_ratio = aspect_ratio;
  if (seed && seed > 0) body.seed = seed;
  if (enable_upsample) body.enable_upsample = true;
  if (Array.isArray(images) && images.length) body.images = images.slice(0, 3);

  try {
    const r = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.zhenzhenApiKey}`,
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) });
    }
    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: data?.error?.message || data?.message || `上游 HTTP ${r.status}` });
    }
    const taskId = data?.task_id || data?.id;
    if (!taskId) return res.status(500).json({ success: false, error: '未获取到 task_id: ' + text.slice(0, 200) });
    res.json({ success: true, data: { taskId, raw: data } });
  } catch (e) {
    console.error('proxy/video/submit 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

router.get('/video/query', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.zhenzhenApiKey) {
    return res.status(400).json({ success: false, error: '未配置贞贞工坊 API Key' });
  }
  const taskId = String(req.query.taskId || '').trim();
  if (!taskId) return res.status(400).json({ success: false, error: 'taskId 必填' });
  const upstream = `${config.ZHENZHEN_BASE_URL}/v2/videos/generations/${encodeURIComponent(taskId)}`;
  try {
    const r = await fetch(upstream, {
      headers: { Authorization: `Bearer ${settings.zhenzhenApiKey}` },
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) });
    }
    if (!r.ok) {
      return res.status(r.status).json({ success: false, error: data?.error?.message || `上游 HTTP ${r.status}` });
    }
    const st = String(data?.status || '').toUpperCase();
    let videoUrl = null;
    if (st === 'SUCCESS') {
      const remote = data?.data?.output;
      if (remote) {
        // 转存视频到本地
        try {
          const vr = await fetch(remote);
          if (vr.ok) {
            const buf = Buffer.from(await vr.arrayBuffer());
            const ext = (remote.match(/\.(mp4|webm|mov)/i)?.[1] || 'mp4').toLowerCase();
            const filename = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
            fs.writeFileSync(path.join(config.OUTPUT_DIR, filename), buf);
            videoUrl = `/files/output/${filename}`;
          } else {
            videoUrl = remote;
          }
        } catch {
          videoUrl = remote;
        }
      }
    }
    res.json({
      success: true,
      data: {
        status: st || 'PENDING',
        progress: data?.progress || '',
        videoUrl,
        failReason: data?.fail_reason || null,
        raw: data,
      },
    });
  } catch (e) {
    console.error('proxy/video/query 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

// ========================================================================
// 音频生成(Suno - 异步)
// 协议(贞贞工坊):POST /suno/generate + GET /suno/feed/:clipIds
// 模式:generate / cover / extend
// ========================================================================
const SUNO_MV_MAP = {
  'suno-v5.5': 'chirp-fenix',
  'suno-v5': 'chirp-v3-5',
  'suno-v4.5': 'chirp-v4-5',
  'suno-v4': 'chirp-v4',
};

router.post('/audio/submit', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.zhenzhenApiKey) {
    return res.status(400).json({ success: false, error: '未配置贞贞工坊 API Key' });
  }
  const { mode, prompt, title, tags, version, seed, continue_clip_id, continue_at, cover_clip_id } = req.body || {};
  const m = mode || 'generate';
  if (!prompt && m !== 'extend') {
    return res.status(400).json({ success: false, error: 'prompt 必填' });
  }
  const mv = SUNO_MV_MAP[version || 'suno-v5.5'] || 'chirp-fenix';
  const auth = { Authorization: `Bearer ${settings.zhenzhenApiKey}`, 'Content-Type': 'application/json' };
  try {
    if (m === 'generate') {
      const body = { prompt: prompt || '', tags: tags || '', mv, title: title || '' };
      if (seed && seed > 0) body.seed = seed;
      const r = await fetch(`${config.ZHENZHEN_BASE_URL}/suno/generate`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) }); }
      if (!r.ok) return res.status(r.status).json({ success: false, error: data?.error?.message || `上游 HTTP ${r.status}` });
      const taskId = data?.id;
      const clipIds = (data?.clips || []).map((c) => c.id).filter(Boolean);
      if (!taskId || clipIds.length < 1) return res.status(500).json({ success: false, error: '未获取到 task/clip: ' + text.slice(0, 200) });
      return res.json({ success: true, data: { taskId, clipIds, raw: data } });
    }
    if (m === 'extend') {
      if (!continue_clip_id) return res.status(400).json({ success: false, error: 'extend 模式需 continue_clip_id' });
      const body = { prompt: prompt || '', tags: tags || '', mv, title: title || '', task: 'upload_extend', continue_clip_id, continue_at: continue_at ?? 28 };
      if (seed && seed > 0) body.seed = seed;
      const r = await fetch(`${config.ZHENZHEN_BASE_URL}/suno/generate`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) }); }
      if (!r.ok) return res.status(r.status).json({ success: false, error: data?.error?.message || `上游 HTTP ${r.status}` });
      const taskId = data?.id;
      const clipIds = (data?.clips || []).map((c) => c.id).filter(Boolean);
      if (!taskId) return res.status(500).json({ success: false, error: '未获取 task' });
      return res.json({ success: true, data: { taskId, clipIds, raw: data } });
    }
    if (m === 'cover') {
      if (!cover_clip_id) return res.status(400).json({ success: false, error: 'cover 模式需 cover_clip_id' });
      const body = {
        prompt: prompt || '', tags: tags || '', mv, title: title || '', task: 'cover',
        cover_clip_id, generation_type: 'TEXT', make_instrumental: false, negative_tags: '',
        continue_clip_id: null, continue_at: null, continued_aligned_prompt: null,
        infill_start_s: null, infill_end_s: null,
      };
      if (seed && seed > 0) body.seed = seed;
      const r = await fetch(`${config.ZHENZHEN_BASE_URL}/suno/submit/music`, { method: 'POST', headers: auth, body: JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) }); }
      if (!r.ok) return res.status(r.status).json({ success: false, error: data?.error?.message || `上游 HTTP ${r.status}` });
      const taskId = (typeof data?.data === 'string' ? data.data : data?.id) || '';
      const clipIds = Array.isArray(data?.data) ? data.data.map((c) => c.id || c.clip_id).filter(Boolean) : (data?.clips || []).map((c) => c.id);
      if (!taskId) return res.status(500).json({ success: false, error: '未获取 task: ' + text.slice(0, 200) });
      return res.json({ success: true, data: { taskId, clipIds, raw: data } });
    }
    return res.status(400).json({ success: false, error: `未知模式: ${m}` });
  } catch (e) {
    console.error('proxy/audio/submit 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

router.get('/audio/query', async (req, res) => {
  const settings = loadRawSettings();
  if (!settings?.zhenzhenApiKey) return res.status(400).json({ success: false, error: '未配置贞贞工坊 API Key' });
  const ids = String(req.query.clipIds || req.query.taskId || '').trim();
  if (!ids) return res.status(400).json({ success: false, error: 'clipIds 或 taskId 必填' });
  try {
    const r = await fetch(`${config.ZHENZHEN_BASE_URL}/suno/feed/${encodeURIComponent(ids)}`, {
      headers: { Authorization: `Bearer ${settings.zhenzhenApiKey}` },
    });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { return res.status(500).json({ success: false, error: '上游响应非 JSON: ' + text.slice(0, 200) }); }
    if (!r.ok) return res.status(r.status).json({ success: false, error: data?.error?.message || `上游 HTTP ${r.status}` });
    const clips = Array.isArray(data) ? data : (data?.clips || []);
    const tracks = [];
    for (const c of clips) {
      if (c?.status === 'complete' && c?.audio_url) {
        tracks.push({
          id: c.id || c.clip_id,
          audioUrl: c.audio_url,
          imageUrl: c.image_large_url || c.image_url || '',
          title: c.title || '',
          tags: c.tags || '',
          duration: c.metadata?.duration || 0,
        });
      }
    }
    const allDone = clips.length > 0 && tracks.length === clips.length;
    res.json({
      success: true,
      data: {
        status: allDone ? 'SUCCESS' : 'PENDING',
        tracks,
        total: clips.length,
        completed: tracks.length,
        raw: data,
      },
    });
  } catch (e) {
    console.error('proxy/audio/query 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

// ========================================================================
// RunningHub 工作流(异步)
// 协议:POST /task/openapi/ai-app/run + POST /task/openapi/outputs
// API Key 取自 settings.runninghubApiKey
// ========================================================================
router.post('/runninghub/submit', async (req, res) => {
  const settings = loadRawSettings();
  const apiKey = settings?.runninghubApiKey;
  if (!apiKey) return res.status(400).json({ success: false, error: '未配置 RunningHub API Key' });
  const { webappId, nodeInfoList, instanceType } = req.body || {};
  if (!webappId) return res.status(400).json({ success: false, error: 'webappId 必填' });
  try {
    const body = { apiKey, webappId, nodeInfoList: nodeInfoList || [] };
    if (instanceType) body.instanceType = instanceType;
    const r = await fetch(`${config.RH_BASE_URL}/task/openapi/ai-app/run`, {
      method: 'POST',
      headers: { Host: 'www.runninghub.cn', 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.code === 0) {
      const taskId = data?.data?.taskId;
      return res.json({ success: true, data: { taskId, raw: data } });
    }
    return res.status(400).json({ success: false, error: data.msg || `RH 提交失败 code=${data.code}` });
  } catch (e) {
    console.error('proxy/rh/submit 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

router.get('/runninghub/query', async (req, res) => {
  const settings = loadRawSettings();
  const apiKey = settings?.runninghubApiKey;
  if (!apiKey) return res.status(400).json({ success: false, error: '未配置 RunningHub API Key' });
  const taskId = String(req.query.taskId || '').trim();
  if (!taskId) return res.status(400).json({ success: false, error: 'taskId 必填' });
  try {
    const r = await fetch(`${config.RH_BASE_URL}/task/openapi/outputs`, {
      method: 'POST',
      headers: { Host: 'www.runninghub.cn', 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, taskId }),
    });
    const data = await r.json();
    // code 0=成功 / 804=运行中 / 813=排队 / 805=失败
    let status = 'PENDING';
    let urls = [];
    if (data.code === 0) {
      status = 'SUCCESS';
      const arr = Array.isArray(data.data) ? data.data : [];
      // 转存所有产物到本地
      for (const it of arr) {
        const remote = it?.fileUrl || it?.url;
        if (!remote) continue;
        try {
          const fr = await fetch(remote);
          if (fr.ok) {
            const buf = Buffer.from(await fr.arrayBuffer());
            const ext = (remote.match(/\.(png|jpe?g|webp|gif|mp4|webm|mp3|wav)/i)?.[1] || 'png').toLowerCase();
            const filename = `rh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
            fs.writeFileSync(path.join(config.OUTPUT_DIR, filename), buf);
            urls.push(`/files/output/${filename}`);
          } else {
            urls.push(remote);
          }
        } catch {
          urls.push(remote);
        }
      }
    } else if (data.code === 804) status = 'RUNNING';
    else if (data.code === 813) status = 'QUEUED';
    else if (data.code === 805) status = 'FAILED';
    else status = 'UNKNOWN';
    res.json({
      success: true,
      data: {
        status,
        urls,
        failReason: data?.data?.failedReason || null,
        code: data.code,
        raw: data,
      },
    });
  } catch (e) {
    console.error('proxy/rh/query 错误:', e);
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

// 获取 AI 应用信息(nodeInfoList 等)
router.get('/runninghub/app-info', async (req, res) => {
  const settings = loadRawSettings();
  const apiKey = settings?.runninghubApiKey;
  if (!apiKey) return res.status(400).json({ success: false, error: '未配置 RunningHub API Key' });
  const webappId = String(req.query.webappId || '').trim();
  if (!webappId) return res.status(400).json({ success: false, error: 'webappId 必填' });
  try {
    const url = `${config.RH_BASE_URL}/api/webapp/apiCallDemo?apiKey=${encodeURIComponent(apiKey)}&webappId=${encodeURIComponent(webappId)}`;
    const r = await fetch(url, { method: 'GET', headers: { Host: 'www.runninghub.cn' } });
    const data = await r.json();
    if (data.code !== 0) return res.status(400).json({ success: false, error: data.msg || `RH 查询失败 code=${data.code}` });
    res.json({ success: true, data: data.data || {} });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || '请求失败' });
  }
});

module.exports = router;
