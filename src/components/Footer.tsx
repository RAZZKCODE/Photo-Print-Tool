import { Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-lg font-bold text-white">B-Grade</span>
                <span className="block text-[10px] text-gray-500 uppercase tracking-wide">
                  Passport Photo Maker
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Free AI passport size photo maker. On-device processing. No server uploads. 100%
              private passport photos.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#editor" className="hover:text-white transition-colors">Photo Maker</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#sizes" className="hover:text-white transition-colors">Photo Sizes</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Popular Searches</h4>
            <ul className="space-y-2 text-sm">
              <li>Passport size photo maker online free</li>
              <li>AI background removal</li>
              <li>Indian passport photo maker</li>
              <li>US visa photo online</li>
              <li>Print passport photo A4 PDF</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © 2026 BGrade.in — Free AI Passport Size Photo Maker. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Free passport photo online · Passport size photo maker · AI passport background remover
          </p>
        </div>
      </div>
    </footer>
  );
}
