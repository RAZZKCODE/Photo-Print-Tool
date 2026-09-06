import { ShieldCheck, Cpu, Globe } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
            About
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About BGrade.in
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>
              BGrade.in is a free online passport size photo maker powered by on-device AI. Unlike
              other passport photo tools that upload your images to remote servers, BGrade processes
              everything locally in your browser — making it the most private passport photo editor
              available online.
            </p>
            <p>
              Whether you need a <strong>3×4 cm standard passport photo</strong>, a{' '}
              <strong>3.5×4.5 cm Indian passport photo</strong>, a{' '}
              <strong>2×2 inch US visa photo</strong>, or photos for your{' '}
              <strong>Aadhaar card, PAN card, or any ID document</strong> — BGrade.in has you covered
              with precise sizing, AI background removal, and professional print-ready layouts.
            </p>
            <p>
              Export your passport photos as <strong>high-resolution PDF or PNG</strong>, choose
              from multiple paper sizes including <strong>A4, A5, 4×6 inch, Letter</strong>, and
              print at home or at any photo printing shop. Trusted by over 10,000 users across
              India, USA, UAE, UK, and 50+ countries.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" strokeWidth={1.6} />
              <p className="text-xs font-medium text-gray-600">On-device AI processing</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Cpu className="w-7 h-7 text-blue-600" strokeWidth={1.6} />
              <p className="text-xs font-medium text-gray-600">No server uploads</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Globe className="w-7 h-7 text-blue-600" strokeWidth={1.6} />
              <p className="text-xs font-medium text-gray-600">50+ countries supported</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
