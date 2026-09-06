import { Camera } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Camera className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg font-bold text-gray-900 tracking-tight">B-Grade</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
                Passport Photo Maker
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#sizes" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Photo Sizes
            </a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </a>
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#editor"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4" />
              Start Now
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
