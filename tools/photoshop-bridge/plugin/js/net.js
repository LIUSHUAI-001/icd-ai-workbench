(function () {
  const state = T8PS.state;

  function parseHost(raw) {
    let text = String(raw || '').trim();
    if (!text) return '';
    text = text.replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '');
    return text || '127.0.0.1:18766';
  }

  function httpBase() {
    return state.host ? `http://${state.host}` : '';
  }

  function absUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = httpBase();
    return `${base}${String(url).startsWith('/') ? '' : '/'}${url}`;
  }

  async function request(path, options) {
    const res = await fetch(`${httpBase()}${path}`, {
      cache: 'no-store',
      ...(options || {}),
      headers: {
        ...((options && options.headers) || {}),
      },
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(`接口返回非 JSON: ${text.slice(0, 120)}`);
    }
    if (!res.ok || json && json.success === false) {
      throw new Error((json && (json.error || json.message)) || `HTTP ${res.status}`);
    }
    return json;
  }

  function apiGet(path) {
    return request(path);
  }

  function apiPost(path, body) {
    return request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
  }

  async function connect(rawHost) {
    state.host = parseHost(rawHost);
    localStorage.setItem('t8.ps.host', state.host);
    const json = await apiGet('/api/photoshop-bridge/status');
    state.connected = !!json.data && json.data.service === 't8-photoshop-bridge';
    return json.data;
  }

  async function fetchBytes(url) {
    const res = await fetch(absUrl(url), { cache: 'no-store' });
    if (!res.ok) throw new Error(`下载素材失败 HTTP ${res.status}`);
    return res.arrayBuffer();
  }

  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let out = '';
    let i = 0;
    for (; i + 2 < bytes.length; i += 3) {
      const t = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      out += B64[(t >> 18) & 63] + B64[(t >> 12) & 63] + B64[(t >> 6) & 63] + B64[t & 63];
    }
    if (i < bytes.length) {
      const a = bytes[i];
      const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const t = (a << 16) | (b << 8);
      out += B64[(t >> 18) & 63] + B64[(t >> 12) & 63] + (i + 1 < bytes.length ? B64[(t >> 6) & 63] : '=') + '=';
    }
    return out;
  }

  async function uploadPng(buffer, options) {
    return apiPost('/api/photoshop-bridge/upload-base64', {
      data: `data:image/png;base64,${toBase64(buffer)}`,
      ...(options || {}),
    });
  }

  T8PS.net = { parseHost, httpBase, absUrl, apiGet, apiPost, connect, fetchBytes, toBase64, uploadPng };
})();
