import { useRef, useState, useCallback } from 'react';
import { UploadCloud, ImageIcon, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onImageUpload: (file: File) => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export default function UploadZone({ onImageUpload }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError('Please upload a JPG, PNG, or WEBP image.');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('Image must be 10MB or smaller.');
        return;
      }
      onImageUpload(file);
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
            ${isDragging ? 'bg-blue-500 scale-110' : 'bg-blue-100'}
          `}>
            <UploadCloud
              className={`w-8 h-8 transition-colors ${isDragging ? 'text-white' : 'text-blue-600'}`}
              strokeWidth={1.8}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Drag &amp; Drop your photo here
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse from your device
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              JPG · PNG · WEBP
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Up to 10MB</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1 text-blue-500">
              <Sparkles className="w-3.5 h-3.5" />
              100% Private
            </span>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
