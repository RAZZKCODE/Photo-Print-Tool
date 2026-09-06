import { ShieldCheck, ScanLine, LayoutGrid } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '100% Private AI',
    description:
      'Unlike other tools, our B-Grade AI runs entirely in your browser. Your face data never leaves your computer, ensuring total privacy.',
  },
  {
    icon: ScanLine,
    title: 'Pro Accuracy',
    description:
      'Get pixel-perfect background removal for hair and clothes, meeting strict biometric standards for India, USA, UAE, and more.',
  },
  {
    icon: LayoutGrid,
    title: 'Print-Ready Layouts',
    description:
      'Auto-generate layouts for A4, A5, and 4×6" photo papers. Save as HD PDF or high-quality PNG for professional results.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative p-7 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-5 transition-colors">
                <f.icon className="w-6 h-6 text-blue-600" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
