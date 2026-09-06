import { BookUser, Plane, Flag, IdCard, CreditCard, Stamp, BadgeCheck, FileImage, type LucideIcon } from 'lucide-react';
import { PHOTO_SIZES } from '@/data/photoSizes';

const ICON_MAP: Record<string, LucideIcon> = {
  BookUser,
  Plane,
  Flag,
  IdCard,
  CreditCard,
  Stamp,
  BadgeCheck,
};

export default function SizesTable() {
  return (
    <section id="sizes" className="py-20 bg-white scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
            Size Guide
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Supported Passport &amp; ID Photo Sizes
          </h2>
          <p className="text-gray-500">All major document sizes for India, USA, and worldwide</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Document Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Size
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Country
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PHOTO_SIZES.map((size) => {
                const Icon = ICON_MAP[size.icon] ?? FileImage;
                return (
                  <tr key={size.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{size.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-mono">
                        {size.widthCm} × {size.heightCm} cm
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{size.country}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
