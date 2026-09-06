import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Wand2,
  Crop,
  Palette,
  Sliders,
  Download,
  RotateCcw,
  ZoomIn,
  Move,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2,
} from 'lucide-react';
import UploadZone from './UploadZone';
import PrintLayout from './PrintLayout';
import { PHOTO_SIZES } from '@/data/photoSizes';
import {
  loadImage,
  fileToDataURL,
  removeBackground,
  applyAdjustments,
  cropToAspectRatio,
  DEFAULT_ADJUSTMENTS,
  type ImageAdjustments,
} from '@/utils/imageProcessing';
import { exportCanvasAsPNG, exportSinglePhotoAsPDF } from '@/utils/pdfExport';

type Tab = 'crop' | 'background' | 'adjust';

const BG_COLORS: { label: string; value: [number, number, number, number] }[] = [
  { label: 'White', value: [255, 255, 255, 255] },
  { label: 'Light Blue', value: [220, 235, 250, 255] },
  { label: 'Light Gray', value: [238, 238, 238, 255] },
  { label: 'Red', value: [200, 30, 30, 255] },
  { label: 'Navy', value: [25, 40, 90, 255] },
];

interface PhotoEditorProps {
  onReset: () => void;
  onEditingChange: (isEditing: boolean) => void;
}

export default function PhotoEditor({ onReset, onEditingChange }: PhotoEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('crop');
  const [selectedSize, setSelectedSize] = useState(PHOTO_SIZES[0]); // Standard passport default
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [bgColor, setBgColor] = useState<[number, number, number, number]>(BG_COLORS[0].value);
  const [bgRemoved, setBgRemoved] = useState(false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const bgCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const adjustedCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  // Render preview whenever settings change
  const renderPreview = useCallback(() => {
    if (!imageEl || !previewCanvasRef.current) return;

    // Step 1: Crop
    const cropped = cropToAspectRatio(
      imageEl,
      selectedSize.widthCm,
      selectedSize.heightCm,
      zoom,
      offsetX,
      offsetY
    );

    // Step 2: Background removal (if enabled)
    let stage = cropped;
    if (bgRemoved) {
      removeBackground(cropped, bgCanvasRef.current, bgColor);
      stage = bgCanvasRef.current;
    }

    // Step 3: Adjustments
    if (
      adjustments.brightness !== 100 ||
      adjustments.contrast !== 100 ||
      adjustments.saturation !== 100
    ) {
      applyAdjustments(stage, adjustedCanvasRef.current, adjustments);
      stage = adjustedCanvasRef.current;
    }

    // Draw to preview canvas
    const preview = previewCanvasRef.current;
    preview.width = stage.width;
    preview.height = stage.height;
    const ctx = preview.getContext('2d')!;
    ctx.drawImage(stage, 0, 0);

    workCanvasRef.current = stage;
  }, [imageEl, selectedSize, zoom, offsetX, offsetY, bgColor, bgRemoved, adjustments]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleUpload = async (file: File) => {
    const dataUrl = await fileToDataURL(file);
    const img = await loadImage(dataUrl);
    setImageSrc(dataUrl);
    setImageEl(img);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBgRemoved(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveTab('crop');
    onEditingChange(true);
  };

  const handleRemoveBg = async () => {
    if (!imageEl) return;
    setIsProcessing(true);
    setProcessingLabel('B-Grade AI Processing...');
    // Simulate processing time for UX
    await new Promise((r) => setTimeout(r, 1200));
    setBgRemoved(true);
    setIsProcessing(false);
    setProcessingLabel('');
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const handleDownloadPNG = () => {
    if (!workCanvasRef.current) return;
    exportCanvasAsPNG(workCanvasRef.current, `passport-photo-${selectedSize.id}.png`);
  };

  const handleDownloadPDF = () => {
    if (!workCanvasRef.current) return;
    exportSinglePhotoAsPDF(
      workCanvasRef.current,
      `passport-photo-${selectedSize.id}.pdf`,
      selectedSize.widthCm,
      selectedSize.heightCm
    );
  };

  const handleNewPhoto = () => {
    setImageSrc(null);
    setImageEl(null);
    setBgRemoved(false);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    onEditingChange(false);
  };

  // ====== No image yet: show upload zone ======
  if (!imageSrc) {
    return (
      <div id="editor" className="scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <UploadZone onImageUpload={handleUpload} />
        </div>
      </div>
    );
  }

  return (
    <div id="editor" className="scroll-mt-20">
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* ====== Preview Area ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Crop Area</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Photo
              </button>
            </div>
          </div>

          <div className="relative bg-gray-50 flex items-center justify-center p-8 min-h-[400px]">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700">{processingLabel}</p>
                <p className="text-xs text-gray-400 mt-1">Powered by B-Grade AI</p>
              </div>
            )}
            <canvas
              ref={previewCanvasRef}
              className="max-w-full max-h-[450px] rounded-lg shadow-md"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Size selector */}
          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              Photo Size
            </p>
            <div className="flex flex-wrap gap-2">
              {PHOTO_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                    ${selectedSize.id === size.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }
                  `}
                >
                  {size.label}
                  <span className="block text-[10px] opacity-70 mt-0.5">
                    {size.widthCm}×{size.heightCm} cm
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ====== Tools Panel ====== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <TabButton
              active={activeTab === 'crop'}
              onClick={() => setActiveTab('crop')}
              icon={<Crop className="w-4 h-4" />}
              label="Crop"
            />
            <TabButton
              active={activeTab === 'background'}
              onClick={() => setActiveTab('background')}
              icon={<Wand2 className="w-4 h-4" />}
              label="Background"
            />
            <TabButton
              active={activeTab === 'adjust'}
              onClick={() => setActiveTab('adjust')}
              icon={<Sliders className="w-4 h-4" />}
              label="Adjust"
            />
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {/* ===== Crop Tab ===== */}
            {activeTab === 'crop' && (
              <div className="space-y-5">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-gray-400" />
                      Zoom
                    </span>
                    <span className="text-xs text-gray-400">{zoom.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-4 h-4 text-gray-400" />
                      Horizontal Position
                    </span>
                    <span className="text-xs text-gray-400">{offsetX.toFixed(0)}px</span>
                  </label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Move className="w-4 h-4 text-gray-400 rotate-90" />
                      Vertical Position
                    </span>
                    <span className="text-xs text-gray-400">{offsetY.toFixed(0)}px</span>
                  </label>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Selected: {selectedSize.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedSize.widthCm} × {selectedSize.heightCm} cm · {selectedSize.country}
                  </p>
                </div>
              </div>
            )}

            {/* ===== Background Tab ===== */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                <div>
                  <button
                    onClick={handleRemoveBg}
                    disabled={bgRemoved || isProcessing}
                    className={`
                      w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all
                      ${bgRemoved
                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      }
                    `}
                  >
                    {bgRemoved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Background Removed
                      </>
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Remove Background
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Runs 100% on your device. No uploads.
                  </p>
                </div>

                {bgRemoved && (
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-3">
                      <Palette className="w-4 h-4 text-gray-400" />
                      Background Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {BG_COLORS.map((c) => (
                        <button
                          key={c.label}
                          onClick={() => setBgColor(c.value)}
                          className={`
                            flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
                            ${bgColor === c.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div
                            className="w-8 h-8 rounded-md border border-gray-200"
                            style={{
                              backgroundColor: `rgb(${c.value[0]}, ${c.value[1]}, ${c.value[2]})`,
                            }}
                          />
                          <span className="text-[10px] text-gray-500">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== Adjust Tab ===== */}
            {activeTab === 'adjust' && (
              <div className="space-y-5">
                <AdjustSlider
                  label="Brightness"
                  value={adjustments.brightness}
                  min="50"
                  max="150"
                  onChange={(v) => setAdjustments((a) => ({ ...a, brightness: v }))}
                />
                <AdjustSlider
                  label="Contrast"
                  value={adjustments.contrast}
                  min="50"
                  max="150"
                  onChange={(v) => setAdjustments((a) => ({ ...a, contrast: v }))}
                />
                <AdjustSlider
                  label="Saturation"
                  value={adjustments.saturation}
                  min="0"
                  max="200"
                  onChange={(v) => setAdjustments((a) => ({ ...a, saturation: v }))}
                />
                <button
                  onClick={handleResetAdjustments}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Adjustments
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Optional — runs on your device, 100% private
                </p>
              </div>
            )}
          </div>

          {/* Download buttons */}
          <div className="p-5 border-t border-gray-100 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPNG}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Done — Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Print Layout Section */}
      <PrintLayout photoCanvasRef={workCanvasRef} photoSize={selectedSize} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative
        ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}
      `}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
      )}
    </button>
  );
}

function AdjustSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: string;
  max: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
        <span>{label}</span>
        <span className="text-xs text-gray-400">{value}%</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}
