/**
 * 图像变换 service - /api/image/*
 */
async function postOp<T = any>(path: string, body: any): Promise<T> {
  const r = await fetch(`/api/image/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok || !data.success) throw new Error(data?.error || `HTTP ${r.status}`);
  return data.data;
}

export const opResize = (imageUrl: string, width?: number, height?: number, fit?: string) =>
  postOp<{ imageUrl: string }>('resize', { imageUrl, width, height, fit });

export const opUpscale = (imageUrl: string, scale: number) =>
  postOp<{ imageUrl: string; scale: number }>('upscale', { imageUrl, scale });

export const opGridCrop = (imageUrl: string, rows: number, cols: number) =>
  postOp<{ urls: string[] }>('grid-crop', { imageUrl, rows, cols });

export const opCombine = (imageUrls: string[], direction: 'horizontal' | 'vertical') =>
  postOp<{ imageUrl: string }>('combine', { imageUrls, direction });

export const opRemoveBg = (imageUrl: string) =>
  postOp<{ imageUrl: string; warning?: string }>('remove-bg', { imageUrl });
