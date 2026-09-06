import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';
import {
  Layout,
  FileText,
  Image as ImageIcon,
  Plus,
  GripVertical,
  Layers,
  Upload,
  X,
  Printer,
  Pencil,
} from 'lucide-react';
import { PAPER_SIZES, type PaperSize, type PhotoSize } from '@/data/photoSizes';
import { generatePrintLayoutMulti } from '@/utils/imageProcessing';
import { exportCanvasAsPNG, exportCanvasAsPDF, printCanvas } from '@/utils/pdfExport';
import { DEFAULT_ADJUSTMENTS } from '@/utils/imageProcessing';
import PhotoEditModal, { type ModalSettings } from './PhotoEditModal';

export interface SheetPhoto {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  thumbnail: string;
  copies: number;
  settings: ModalSettings;
}

interface PrintLayoutProps {
  photoCanvasRef: RefObject<HTMLCanvasElement>;
  photoSize: PhotoSize;
}

let idCounter = 0;
const genId = () => `photo-${++idCounter}`;

export default function PrintLayout({ photoCanvasRef, photoSize }: PrintLayoutProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>(PAPER_SIZES[0]);
  const [gapMm, setGapMm] = useState(2);
  const [photosPerRow, setPhotosPerRow] = useState(4);
  const [photos, setPhotos] = useState<SheetPhoto[]>([]);
  const [maxCols, setMaxCols] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<SheetPhoto | null>(null);

  const layoutCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const previewRef = useRef<HTMLCanvasElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Add the current editor photo as the first photo automatically
  useEffect(() => {
    const photo = photoCanvasRef.current;
    if (photo && photo.width > 0 && photos.length === 0) {
      setPhotos([
        {
          id: genId(),
          name: 'Photo 1',
          canvas: photo,
          thumbnail: photo.toDataURL('image/png'),
          copies: 1,
          settings: {
            zoom: 1, offsetX: 0, offsetY: 0,
            bgRemoved: false, bgColor: [255, 255, 255, 255],
            adjustments: DEFAULT_ADJUSTMENTS,
          },
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCanvasRef.current?.width]);

  // Calculate max columns/rows that fit on the paper
  useEffect(() => {
    const cmToInch = 1 / 2.54;
    const dpi = 300;
    const gapPx = Math.round((gapMm / 10) * cmToInch * dpi);
    const photoWPx = Math.round(photoSize.widthCm * cmToInch * dpi);
    const photoHPx = Math.round(photoSize.heightCm * cmToInch * dpi);
    const paperWPx = Math.round(paperSize.widthCm * cmToInch * dpi);
    const paperHPx = Math.round(paperSize.heightCm * cmToInch * dpi);
    const cols = Math.floor((paperWPx + gapPx) / (photoWPx + gapPx));
    const rows = Math.floor((paperHPx + gapPx) / (photoHPx + gapPx));
    setMaxCols(cols);
    setTotalSlots(cols * rows);
    setPhotosPerRow((prev) => Math.min(prev, cols));
  }, [paperSize, photoSize, gapMm]);

  const generateLayout = useCallback(() => {
    if (photos.length === 0) return;

    const { canvas } = generatePrintLayoutMulti(
      photos.map((p) => ({ canvas: p.canvas, copies: p.copies })),
      paperSize.widthCm,
      paperSize.heightCm,
      photoSize.widthCm,
      photoSize.heightCm,
      photosPerRow,
      gapMm
    );

    layoutCanvasRef.current = canvas;

    const preview = previewRef.current;
    if (preview) {
      const maxW = 500;
      const scale = Math.min(1, maxW / canvas.width);
      preview.width = canvas.width * scale;
      preview.height = canvas.height * scale;
      const ctx = preview.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
    }
  }, [photos, paperSize, photoSize, photosPerRow, gapMm]);

  useEffect(() => {
    const timer = setTimeout(generateLayout, 100);
    return () => clearTimeout(timer);
  }, [generateLayout]);

  const handleAddCurrentPhoto = () => {
    const photo = photoCanvasRef.current;
    if (!photo || photo.width === 0) return;
    setPhotos((prev) => [
      ...prev,
      {
        id: genId(),
        name: `Photo ${prev.length + 1}`,
        canvas: photo,
        thumbnail: photo.toDataURL('image/png'),
        copies: 1,
        settings: {
          zoom: 1, offsetX: 0, offsetY: 0,
          bgRemoved: false, bgColor: [255, 255, 255, 255],
          adjustments: DEFAULT_ADJUSTMENTS,
        },
      },
    ]);
  };

  const handleUploadClick = () => {
    addInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalFile(file);
    }
    e.target.value = '';
  };

  const handleModalSave = (canvas: HTMLCanvasElement, settings: ModalSettings) => {
    if (editingPhoto) {
      // Update existing photo
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id
            ? { ...p, canvas, thumbnail: canvas.toDataURL('image/png'), settings }
            : p
        )
      );
      setEditingPhoto(null);
    } else if (modalFile) {
      // Add new photo
      setPhotos((prev) => [
        ...prev,
        {
          id: genId(),
          name: modalFile.name.replace(/\.[^/.]+$/, ''),
          canvas,
          thumbnail: canvas.toDataURL('image/png'),
          copies: 1,
          settings,
        },
      ]);
      setModalFile(null);
    }
  };

  const handleModalCancel = () => {
    setModalFile(null);
    setEditingPhoto(null);
  };

  const handleEditPhoto = (photo: SheetPhoto) => {
    setEditingPhoto(photo);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCopiesChange = (id: string, value: number) => {
    const clamped = Math.max(1, Math.min(999, value));
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, copies: clamped } : p))
    );
  };

  const handleDragStart = (idx: number) => {
    setDragIndex(idx);
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIndex === null || dragIndex === targetIdx) {
      setDragIndex(null);
      return;
    }
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

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

  const handlePrint = () => {
    if (layoutCanvasRef.current.width > 0) {
      printCanvas(layoutCanvasRef.current, paperSize.widthCm, paperSize.heightCm);
    }
  };

  const totalCopies = photos.reduce((sum, p) => sum + p.copies, 0);
  const willFit = totalCopies <= totalSlots;

  const showModal = modalFile !== null || editingPhoto !== null;

  return (
    <>
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
          <Layout className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Print Layout</span>
          <span className="text-xs text-gray-400 ml-1">
            Add photos, crop &amp; adjust each one, set copies, arrange row-wise
          </span>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-0">
          {/* Preview */}
          <div className="bg-gray-50 flex items-center justify-center p-6 min-h-[300px]">
            {photos.length > 0 ? (
              <canvas
                ref={previewRef}
                className="max-w-full max-h-[400px] rounded-lg shadow-md bg-white"
              />
            ) : (
              <div className="text-center text-gray-400">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Add photos to see the print layout</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-5 border-l border-gray-100 space-y-4">
            {/* Paper Size */}
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

            {/* Photos per row */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Photos Per Row</span>
                <span className="text-xs text-gray-400">{photosPerRow}</span>
              </label>
              <input
                type="range"
                min="1"
                max={maxCols || 1}
                step="1"
                value={Math.min(photosPerRow, maxCols || 1)}
                onChange={(e) => setPhotosPerRow(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Max {maxCols} per row on {paperSize.label}
              </p>
            </div>

            {/* Gap */}
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

            {/* Stats */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${willFit ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <Layers className={`w-4 h-4 ${willFit ? 'text-blue-600' : 'text-amber-600'}`} />
              <span className={`text-sm font-medium ${willFit ? 'text-blue-700' : 'text-amber-700'}`}>
                {totalCopies} of {totalSlots} slots used
              </span>
            </div>
            {!willFit && (
              <p className="text-xs text-amber-600 -mt-2 px-1">
                {totalCopies - totalSlots} photo(s) won&apos;t fit. Increase paper size or reduce copies/gap.
              </p>
            )}

            {/* Download + Print */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handlePrint}
                disabled={photos.length === 0}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Sheet
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPNG}
                  disabled={photos.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={photos.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photo collection manager */}
        <div className="border-t border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">
                Photos on Sheet
              </span>
              <span className="text-xs text-gray-400">
                ({photos.length} photos, {totalCopies} copies)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCurrentPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Current Photo
              </button>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload More
              </button>
              <input
                ref={addInputRef}
                type="file"
                accept="image/*"
                multiple={false}
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No photos added yet. Use the buttons above to add photos.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(idx)}
                  className={`
                    group relative rounded-xl border bg-white overflow-hidden transition-all cursor-move
                    ${dragIndex === idx ? 'opacity-40 border-blue-400' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}
                  `}
                >
                  {/* Top overlay: drag handle + actions */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-1.5 py-1 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-white">
                      <GripVertical className="w-3 h-3" />
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleEditPhoto(photo)}
                        className="p-0.5 rounded text-white hover:bg-white/20 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="p-0.5 rounded text-white hover:bg-red-500 transition-colors"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                    <img
                      src={photo.thumbnail}
                      alt={photo.name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>

                  {/* Name + copies input */}
                  <div className="px-2 py-2 space-y-1.5">
                    <p className="text-xs font-medium text-gray-600 truncate">{photo.name}</p>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        Copies
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={photo.copies}
                        onChange={(e) =>
                          handleCopiesChange(photo.id, parseInt(e.target.value) || 1)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-1.5 py-1 text-xs text-center font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5" />
              Drag to reorder. Click pencil icon to edit crop &amp; color. Set copies per photo.
            </p>
          )}
        </div>
      </div>

      {/* Photo Edit Modal */}
      {showModal && (modalFile || editingPhoto) && (
        <PhotoEditModal
          file={modalFile ?? new File([], 'editing')}
          photoSize={photoSize}
          initialCanvas={editingPhoto?.canvas ?? null}
          initialSettings={editingPhoto?.settings ?? null}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
    </>
  );
}
