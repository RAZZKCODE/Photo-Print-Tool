export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Simple on-device background removal using edge detection + flood fill.
 * Removes the dominant background color (corners) and replaces it with the chosen color.
 */
export function removeBackground(
  sourceCanvas: HTMLCanvasElement,
  destCanvas: HTMLCanvasElement,
  bgColor: [number, number, number, number]
): void {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  destCanvas.width = w;
  destCanvas.height = h;

  const sCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  const dCtx = destCanvas.getContext('2d', { willReadFrequently: true })!;

  const imageData = sCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Sample corner colors to detect background
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];

  let avgR = 0,
    avgG = 0,
    avgB = 0;
  for (const [cx, cy] of corners) {
    const idx = (cy * w + cx) * 4;
    avgR += data[idx];
    avgG += data[idx + 1];
    avgB += data[idx + 2];
  }
  avgR /= corners.length;
  avgG /= corners.length;
  avgB /= corners.length;

  const threshold = 50;

  // Flood fill from all four corners
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  for (const [cx, cy] of corners) {
    const flatIdx = cy * w + cx;
    if (!visited[flatIdx]) {
      queue.push(cx, cy);
      visited[flatIdx] = 1;
    }
  }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;

    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const flatIdx = ny * w + nx;
      if (visited[flatIdx]) continue;

      const idx = flatIdx * 4;
      const dr = Math.abs(data[idx] - avgR);
      const dg = Math.abs(data[idx + 1] - avgG);
      const db = Math.abs(data[idx + 2] - avgB);

      if (dr < threshold && dg < threshold && db < threshold) {
        visited[flatIdx] = 1;
        queue.push(nx, ny);
      }
    }
  }

  // Apply background color to visited pixels, keep original for others
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    if (visited[i]) {
      data[idx] = bgColor[0];
      data[idx + 1] = bgColor[1];
      data[idx + 2] = bgColor[2];
      data[idx + 3] = bgColor[3];
    }
  }

  dCtx.putImageData(imageData, 0, 0);
}

/**
 * Apply brightness, contrast, saturation adjustments to a canvas.
 */
export function applyAdjustments(
  sourceCanvas: HTMLCanvasElement,
  destCanvas: HTMLCanvasElement,
  adjustments: ImageAdjustments
): void {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  destCanvas.width = w;
  destCanvas.height = h;

  const sCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
  const dCtx = destCanvas.getContext('2d', { willReadFrequently: true })!;

  const imageData = sCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const brightness = adjustments.brightness / 100;
  const contrast = adjustments.contrast / 100;
  const saturation = adjustments.saturation / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r *= brightness;
    g *= brightness;
    b *= brightness;

    // Contrast
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    // Saturation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  dCtx.putImageData(imageData, 0, 0);
}

/**
 * Crop image to specified aspect ratio with center alignment.
 * Returns a new canvas with the cropped region.
 */
export function cropToAspectRatio(
  img: HTMLImageElement | HTMLCanvasElement,
  aspectWidth: number,
  aspectHeight: number,
  zoom: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
): HTMLCanvasElement {
  const sourceW = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const sourceH = 'naturalHeight' in img ? img.naturalHeight : img.height;

  const targetAspect = aspectWidth / aspectHeight;
  const sourceAspect = sourceW / sourceH;

  let cropW: number, cropH: number;

  if (sourceAspect > targetAspect) {
    cropH = sourceH;
    cropW = cropH * targetAspect;
  } else {
    cropW = sourceW;
    cropH = cropW / targetAspect;
  }

  cropW /= zoom;
  cropH /= zoom;

  const maxCropW = sourceW;
  const maxCropH = sourceH;
  cropW = Math.min(cropW, maxCropW);
  cropH = Math.min(cropH, maxCropH);

  const centerX = sourceW / 2 + offsetX;
  const centerY = sourceH / 2 + offsetY;

  let cropX = centerX - cropW / 2;
  let cropY = centerY - cropH / 2;

  cropX = Math.max(0, Math.min(cropX, sourceW - cropW));
  cropY = Math.max(0, Math.min(cropY, sourceH - cropH));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropW);
  canvas.height = Math.round(cropH);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return canvas;
}

/**
 * Generate a print layout canvas with multiple photos arranged on a paper sheet.
 * Each photo is repeated by its copy count. Photos are placed left-to-right
 * starting from the top row, wrapping into new rows based on photosPerRow.
 * Only the first sheet is rendered; overflow is cut off.
 */
export function generatePrintLayoutMulti(
  photoEntries: { canvas: HTMLCanvasElement; copies: number }[],
  paperWidthCm: number,
  paperHeightCm: number,
  photoWidthCm: number,
  photoHeightCm: number,
  photosPerRow: number,
  gapMm: number = 2,
  dpi: number = 300
): { canvas: HTMLCanvasElement; rows: number; cols: number; placed: number; totalSlots: number } {
  const cmToInch = 1 / 2.54;
  const paperWidthPx = Math.round(paperWidthCm * cmToInch * dpi);
  const paperHeightPx = Math.round(paperHeightCm * cmToInch * dpi);
  const photoWidthPx = Math.round(photoWidthCm * cmToInch * dpi);
  const photoHeightPx = Math.round(photoHeightCm * cmToInch * dpi);
  const gapPx = Math.round((gapMm / 10) * cmToInch * dpi);

  const cols = Math.min(photosPerRow, Math.floor((paperWidthPx + gapPx) / (photoWidthPx + gapPx)));
  const maxRows = Math.floor((paperHeightPx + gapPx) / (photoHeightPx + gapPx));
  const totalSlots = cols * maxRows;

  // Expand photos by copy count
  const expanded: HTMLCanvasElement[] = [];
  for (const entry of photoEntries) {
    for (let i = 0; i < entry.copies; i++) {
      expanded.push(entry.canvas);
    }
  }

  const rows = Math.min(Math.ceil(expanded.length / cols), maxRows);

  const canvas = document.createElement('canvas');
  canvas.width = paperWidthPx;
  canvas.height = paperHeightPx;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, paperWidthPx, paperHeightPx);

  // Start from top-left corner (small margin)
  const margin = gapPx;
  const startX = (paperWidthPx - (cols * photoWidthPx + (cols - 1) * gapPx)) / 2;
  const startY = margin;

  let placed = 0;
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < cols; col++) {
      if (placed >= expanded.length) break;
      const x = startX + col * (photoWidthPx + gapPx);
      const y = startY + row * (photoHeightPx + gapPx);
      ctx.drawImage(expanded[placed], x, y, photoWidthPx, photoHeightPx);
      placed++;
    }
  }

  return { canvas, rows, cols, placed, totalSlots };
}
