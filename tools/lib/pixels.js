// Pixel statistics of a screenshot, computed in the page: chromium decodes the PNG and reports mean
// luminance, its spread, and the fraction of pixels that are near black or near a single colour.
// The browser is the decoder so the tools need no image dependency.
import { readFileSync } from 'node:fs';

export async function pngStats(page, filePath) {
  const dataUrl = `data:image/png;base64,${readFileSync(filePath).toString('base64')}`;
  return page.evaluate(async (src) => {
    const blob = await (await fetch(src)).blob();
    const bmp = await createImageBitmap(blob);
    const w = Math.min(bmp.width, 400);
    const h = Math.round((bmp.height * w) / bmp.width);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    let sumSq = 0;
    let dark = 0;
    const n = w * h;
    const hist = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      sum += l;
      sumSq += l * l;
      if (l < 12) dark += 1;
      const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
      hist.set(key, (hist.get(key) || 0) + 1);
    }
    const mean = sum / n;
    const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
    let top = 0;
    for (const v of hist.values()) if (v > top) top = v;
    return { width: bmp.width, height: bmp.height, mean, std, darkFraction: dark / n, dominantFraction: top / n, distinctColours: hist.size };
  }, dataUrl);
}
