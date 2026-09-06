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
