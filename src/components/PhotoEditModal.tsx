import { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Wand2,
  Crop,
  Palette,
  Sliders,
  ZoomIn,
  Move,
  Check,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { type PhotoSize } from '@/data/photoSizes';
import {
  loadImage,
  fileToDataURL,
  removeBackground,
  applyAdjustments,
  cropToAspectRatio,
  DEFAULT_ADJUSTMENTS,
  type ImageAdjustments,
} from '@/utils/imageProcessing';

const BG_COLORS: { label: string; value: [number, number, number, number] }[] = [
  { label: 'White', value: [255, 255, 255, 255] },
  { label: 'Light Blue', value: [220, 235, 250, 255] },
  { label: 'Light Gray', value: [238, 238, 238, 255] },
  { label: 'Red', value: [200, 30, 30, 255] },
  { label: 'Navy', value: [25, 40, 90, 255] },
];

interface PhotoEditModalProps {
  file: File;
  photoSize: PhotoSize;
  initialCanvas?: HTMLCanvasElement | null;
  initialSettings?: {
    zoom: number;
    offsetX: number;
    offsetY: number;
    bgRemoved: boolean;
    bgColor: [number, number, number, number];
    adjustments: ImageAdjustments;
  } | null;
  onSave: (canvas: HTMLCanvasElement, settings: ModalSettings) => void;
  onCancel: () => void;
}

export interface ModalSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
  bgRemoved: boolean;
  bgColor: [number, number, number, number];
  adjustments: ImageAdjustments;
}

type Tab = 'crop' | 'background' | 'adjust';

export default function PhotoEditModal({
  file,
  photoSize,
  initialCanvas,
  initialSettings,
  onSave,
  onCancel,
}: PhotoEditModalProps) {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('crop');
  const [zoom, setZoom] = useState(initialSettings?.zoom ?? 1);
  const [offsetX, setOffsetX] = useState(initialSettings?.offsetX ?? 0);
  const [offsetY, setOffsetY] = useState(initialSettings?.offsetY ?? 0);
  const [bgColor, setBgColor] = useState<[number, number, number, number]>(
    initialSettings?.bgColor ?? BG_COLORS[0].value
  );
  const [bgRemoved, setBgRemoved] = useState(initialSettings?.bgRemoved ?? false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    initialSettings?.adjustments ?? DEFAULT_ADJUSTMENTS
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const bgCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const adjustedCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (initialCanvas) {
        // Editing existing canvas — convert back to image element
        const dataUrl = initialCanvas.toDataURL('image/png');
        const img = await loadImage(dataUrl);
        if (!cancelled) setImageEl(img);
      } else {
        const dataUrl = await fileToDataURL(file);
        const img = await loadImage(dataUrl);
        if (!cancelled) setImageEl(img);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const renderPreview = useCallback(() => {
    if (!imageEl || !previewCanvasRef.current) return;

    const cropped = cropToAspectRatio(
      imageEl,
      photoSize.widthCm,
      photoSize.heightCm,
      zoom,
      offsetX,
      offsetY
    );

    let stage = cropped;
    if (bgRemoved) {
      removeBackground(cropped, bgCanvasRef.current, bgColor);
      stage = bgCanvasRef.current;
    }

    if (
      adjustments.brightness !== 100 ||
      adjustments.contrast !== 100 ||
      adjustments.saturation !== 100
    ) {
      applyAdjustments(stage, adjustedCanvasRef.current, adjustments);
      stage = adjustedCanvasRef.current;
    }

    const preview = previewCanvasRef.current;
    preview.width = stage.width;
    preview.height = stage.height;
    const ctx = preview.getContext('2d')!;
    ctx.drawImage(stage, 0, 0);

    workCanvasRef.current = stage;
  }, [imageEl, photoSize, zoom, offsetX, offsetY, bgColor, bgRemoved, adjustments]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleRemoveBg = async () => {
    if (!imageEl) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setBgRemoved(true);
    setIsProcessing(false);
  };

  const handleSave = () => {
    if (!workCanvasRef.current || workCanvasRef.current.width === 0) return;
    onSave(workCanvasRef.current, {
      zoom,
      offsetX,
      offsetY,
      bgRemoved,
      bgColor,
      adjustments,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              {initialCanvas ? 'Edit Photo' : 'Crop & Adjust Photo'}
            </span>
            <span className="text-xs text-gray-400 ml-1">
              {photoSize.label} ({photoSize.widthCm}×{photoSize.heightCm} cm)
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 grid md:grid-cols-[1fr_280px] gap-0 overflow-hidden">
          {/* Preview */}
          <div className="relative bg-gray-50 flex items-center justify-center p-6 min-h-[300px]">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-sm font-medium text-gray-700">Processing...</p>
              </div>
            )}
            {!imageEl ? (
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            ) : (
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[400px] rounded-lg shadow-md"
              />
            )}
          </div>

          {/* Tools */}
          <div className="flex flex-col border-l border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <ModalTab active={activeTab === 'crop'} onClick={() => setActiveTab('crop')} icon={<Crop className="w-4 h-4" />} label="Crop" />
              <ModalTab active={activeTab === 'background'} onClick={() => setActiveTab('background')} icon={<Wand2 className="w-4 h-4" />} label="BG" />
              <ModalTab active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={<Sliders className="w-4 h-4" />} label="Adjust" />
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <ModalSlider label="Zoom" icon={<ZoomIn className="w-4 h-4 text-gray-400" />} value={zoom} min={1} max={3} step={0.1} display={`${zoom.toFixed(1)}x`} onChange={setZoom} />
                  <ModalSlider label="Horizontal" icon={<Move className="w-4 h-4 text-gray-400" />} value={offsetX} min={-200} max={200} step={5} display={`${offsetX.toFixed(0)}px`} onChange={setOffsetX} />
                  <ModalSlider label="Vertical" icon={<Move className="w-4 h-4 text-gray-400 rotate-90" />} value={offsetY} min={-200} max={200} step={5} display={`${offsetY.toFixed(0)}px`} onChange={setOffsetY} />
                </div>
              )}

              {activeTab === 'background' && (
                <div className="space-y-4">
                  <button
                    onClick={handleRemoveBg}
                    disabled={bgRemoved || isProcessing}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      bgRemoved
                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    {bgRemoved ? (<><Check className="w-4 h-4" /> Background Removed</>) : isProcessing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>) : (<><Wand2 className="w-4 h-4" /> Remove Background</>)}
                  </button>
                  {bgRemoved && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                        <Palette className="w-4 h-4 text-gray-400" /> Background Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {BG_COLORS.map((c) => (
                          <button
                            key={c.label}
                            onClick={() => setBgColor(c.value)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                              bgColor === c.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-md border border-gray-200" style={{ backgroundColor: `rgb(${c.value[0]}, ${c.value[1]}, ${c.value[2]})` }} />
                            <span className="text-[10px] text-gray-500">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'adjust' && (
                <div className="space-y-4">
                  <ModalSlider label="Brightness" icon={null} value={adjustments.brightness} min={50} max={150} step={1} display={`${adjustments.brightness}%`} onChange={(v) => setAdjustments((a) => ({ ...a, brightness: v }))} />
                  <ModalSlider label="Contrast" icon={null} value={adjustments.contrast} min={50} max={150} step={1} display={`${adjustments.contrast}%`} onChange={(v) => setAdjustments((a) => ({ ...a, contrast: v }))} />
                  <ModalSlider label="Saturation" icon={null} value={adjustments.saturation} min={0} max={200} step={1} display={`${adjustments.saturation}%`} onChange={(v) => setAdjustments((a) => ({ ...a, saturation: v }))} />
                  <button
                    onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <button
                onClick={handleSave}
                disabled={!imageEl}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" /> Save Photo
              </button>
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {icon} {label}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
    </button>
  );
}

function ModalSlider({
  label,
  icon,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
        <span className="flex items-center gap-1.5">{icon} {label}</span>
        <span className="text-xs text-gray-400">{display}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}
