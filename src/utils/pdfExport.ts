import jsPDF from 'jspdf';

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function exportCanvasAsPDF(
  canvas: HTMLCanvasElement,
  filename: string,
  paperWidthCm: number,
  paperHeightCm: number
): void {
  const orientation = paperWidthCm > paperHeightCm ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'cm',
    format: [paperWidthCm, paperHeightCm],
  });

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, paperWidthCm, paperHeightCm);
  pdf.save(filename);
}

export function exportSinglePhotoAsPDF(
  canvas: HTMLCanvasElement,
  filename: string,
  photoWidthCm: number,
  photoHeightCm: number
): void {
  const orientation = photoWidthCm > photoHeightCm ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'cm',
    format: [photoWidthCm, photoHeightCm],
  });

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, photoWidthCm, photoHeightCm);
  pdf.save(filename);
}

export function printCanvas(
  canvas: HTMLCanvasElement,
  paperWidthCm: number,
  paperHeightCm: number
): void {
  const imgData = canvas.toDataURL('image/png');
  const win = window.open('', '_blank');
  if (!win) return;

  const wPx = Math.round(paperWidthCm * 96 / 2.54);
  const hPx = Math.round(paperHeightCm * 96 / 2.54);

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Print Passport Photos</title>
<style>
  @page { size: ${paperWidthCm}cm ${paperHeightCm}cm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { display: flex; align-items: center; justify-content: center; background: white; }
  img { width: ${wPx}px; height: ${hPx}px; max-width: 100%; max-height: 100%; object-fit: contain; }
  @media print { body { background: white; } img { width: ${paperWidthCm}cm; height: ${paperHeightCm}cm; } }
</style>
</head>
<body>
<img src="${imgData}" onload="window.print(); setTimeout(() => window.close(), 300);" />
</body>
</html>`);
  win.document.close();
}
