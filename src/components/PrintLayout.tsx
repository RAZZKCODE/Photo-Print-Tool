import { useRef, useState, useEffect, type RefObject } from 'react';
import { Layout, FileText, Image as ImageIcon, Copy, Plus } from 'lucide-react';
import { PAPER_SIZES, type PaperSize, type PhotoSize } from '@/data/photoSizes';
import { generatePrintLayout } from '@/utils/imageProcessing';
import { exportCanvasAsPNG, exportCanvasAsPDF } from '@/utils/pdfExport';

interface PrintLayoutProps {
  photoCanvasRef: RefObject<HTMLCanvasElement>;
  photoSize: PhotoSize;
}

export default function PrintLayout({ photoCanvasRef, photoSize }: PrintLayoutProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>(PAPER_SIZES[0]);
  const [gapMm, setGapMm] = useState(2);
  const layoutCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const generateLayout = () => {
    const photo = photoCanvasRef.current;
    if (!photo || photo.width === 0) return;

    const canvas = generatePrintLayout(
      photo,
      paperSize.widthCm,
      paperSize.heightCm,
      photoSize.widthCm,
      photoSize.heightCm,
      gapMm
    );

    layoutCanvasRef.current = canvas;

    // Render preview
    const preview = previewRef.current;
    if (preview) {
      const maxW = 500;
      const scale = Math.min(1, maxW / canvas.width);
      preview.width = canvas.width * scale;
      preview.height = canvas.height * scale;
      const ctx = preview.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
    }

    // Calculate count
    const cmToInch = 1 / 2.54;
    const dpi = 300;
    const gapPx = Math.round((gapMm / 10) * cmToInch * dpi);
    const photoWPx = Math.round(photoSize.widthCm * cmToInch * dpi);
    const photoHPx = Math.round(photoSize.heightCm * cmToInch * dpi);
    const paperWPx = Math.round(paperSize.widthCm * cmToInch * dpi);
    const paperHPx = Math.round(paperSize.heightCm * cmToInch * dpi);
    const cols = Math.floor((paperWPx + gapPx) / (photoWPx + gapPx));
    const rows = Math.floor((paperHPx + gapPx) / (photoHPx + gapPx));
    setPhotoCount(cols * rows);
  };

  useEffect(() => {
    const timer = setTimeout(generateLayout, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperSize, photoSize, gapMm]);

  const handleDownloadPNG = () => {
    if (layoutCanvasRef.current.width > 0) {
      exportCanvasAsPNG(layoutCanvasRef.current, `print-layout-${paperSize.id}.png`);
    }
  };

  const handleDownloadPDF = () => {
    if (layoutCanvasRef.current.width > 0) {
      exportCanvasAsPDF(
        layoutCanvasRef.current,
        `print-layout-${paperSize.id}.pdf`,
        paperSize.widthCm,
        paperSize.heightCm
      );
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
        <Layout className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">Print Layout</span>
        <span className="text-xs text-gray-400 ml-1">
          Arrange multiple photos on a sheet for printing
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-0">
        {/* Preview */}
        <div className="bg-gray-50 flex items-center justify-center p-6 min-h-[300px]">
          <canvas
            ref={previewRef}
            className="max-w-full max-h-[400px] rounded-lg shadow-md bg-white"
          />
        </div>

        {/* Controls */}
        <div className="p-5 border-l border-gray-100 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Paper Size
            </p>
            <div className="flex flex-wrap gap-2">
              {PAPER_SIZES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaperSize(p)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                    ${paperSize.id === p.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Gap Between Photos</span>
              <span className="text-xs text-gray-400">{gapMm} mm</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={gapMm}
              onChange={(e) => setGapMm(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Copy className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {photoCount} photos per sheet
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              PNG
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>

          <button
            onClick={generateLayout}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Refresh Layout
          </button>
        </div>
      </div>
    </div>
  );
}
