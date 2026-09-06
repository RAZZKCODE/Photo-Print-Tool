import { Upload, Wand2, Crop, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    title: 'Upload Photo',
    description:
      'Drag & drop or select a JPG, PNG, WEBP up to 10MB from your device.',
  },
  {
    icon: Wand2,
    title: 'AI Removes Background',
    description:
      'One-click AI background removal runs on your device — nothing uploaded.',
  },
  {
    icon: Crop,
    title: 'Crop & Customize',
    description:
      'Pick passport size (3×4, 3.5×4.5, 2×2 inch), adjust color, brightness & contrast.',
  },
  {
    icon: Download,
    title: 'Download & Print',
    description:
      'Export to A4, A5, 4×6 paper as HD PDF or PNG. Print at home or photo shop.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            How to Make Passport Size Photo Online
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Free in 4 steps. No sign-up, no download, no server uploads. Works on mobile &amp; desktop.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                    <step.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-3xl font-bold text-gray-100">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
