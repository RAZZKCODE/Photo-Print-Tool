export interface PhotoSize {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  country: string;
  icon: string;
}

export const PHOTO_SIZES: PhotoSize[] = [
  { id: 'standard', label: 'Standard Passport', widthCm: 3, heightCm: 4, country: 'India, EU, Most Countries', icon: 'BookUser' },
  { id: 'indian', label: 'Indian Passport / Visa', widthCm: 3.5, heightCm: 4.5, country: 'India', icon: 'Plane' },
  { id: 'us', label: 'US Passport / Visa', widthCm: 5.1, heightCm: 5.1, country: 'USA', icon: 'Flag' },
  { id: 'aadhaar', label: 'Aadhaar Card', widthCm: 2.5, heightCm: 3, country: 'India', icon: 'IdCard' },
  { id: 'pan', label: 'PAN Card', widthCm: 2.5, heightCm: 3.5, country: 'India', icon: 'CreditCard' },
  { id: 'stamp', label: 'Stamp Size Photo', widthCm: 2, heightCm: 2.5, country: 'India', icon: 'Stamp' },
  { id: 'badge', label: 'ID Badge / Membership', widthCm: 8.5, heightCm: 5.5, country: 'Universal', icon: 'BadgeCheck' },
];

export interface PaperSize {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4', widthCm: 21, heightCm: 29.7 },
  { id: 'a5', label: 'A5', widthCm: 14.8, heightCm: 21 },
  { id: '4x6', label: '4×6 inch', widthCm: 10.16, heightCm: 15.24 },
  { id: 'letter', label: 'Letter', widthCm: 21.59, heightCm: 27.94 },
  { id: '5x7', label: '5×7 inch', widthCm: 12.7, heightCm: 17.78 },
  { id: '3r', label: '3R', widthCm: 8.9, heightCm: 12.7 },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'Is BGrade.in really 100% free?',
    answer:
      'Yes, BGrade.in is 100% free. There are no hidden charges, watermarks, or sign-up requirements. You can create, download, and print unlimited passport photos without paying anything.',
  },
  {
    question: 'Is my photo uploaded to a server?',
    answer:
      'No. All processing happens entirely on your device using AI that runs in your browser. Your photo never leaves your computer — ensuring complete privacy and security of your biometric data.',
  },
  {
    question: 'What photo sizes are supported?',
    answer:
      'BGrade.in supports all major sizes including: 3×4 cm (Standard Passport), 3.5×4.5 cm (Indian Passport & Visa), 2×2 inch (US Passport), 2.5×3 cm (Aadhaar Card), 2.5×3.5 cm (PAN Card), 2×2.5 cm (Stamp Size), and fully custom dimensions.',
  },
  {
    question: 'Can I print multiple photos on one sheet?',
    answer:
      'Yes! BGrade.in generates print-ready layouts for A4, A5, 4×6 inch, 5×7 inch, Letter, 3R, and more paper sizes. You can download as HD PDF or high-resolution PNG and print at home on any inkjet or laser printer, or take it to a nearby photo print shop.',
  },
  {
    question: 'How accurate is the AI background removal?',
    answer:
      'The AI works best with clear, well-lit photos where the subject is clearly visible. It accurately handles hair edges, glasses, and clothing for professional biometric-quality results suitable for government documents.',
  },
  {
    question: 'Which countries are supported?',
    answer:
      'BGrade.in supports passport and visa photo requirements for India, United States, United Kingdom, UAE, Canada, Australia, Schengen countries, and most other nations. You can also set any custom size to match specific requirements.',
  },
  {
    question: 'Do I need to install any software?',
    answer:
      'No installation required. BGrade.in works entirely in your web browser — Chrome, Firefox, Safari, or Edge on any device including Windows, Mac, Android, and iPhone. Just visit the website and start making passport photos instantly.',
  },
  {
    question: 'What is the Indian passport photo size requirement?',
    answer:
      'The official Indian passport photo and visa size requirement is exactly 3.5x4.5 cm (35x45 mm). Your face must occupy 70-80% of the photograph.',
  },
];

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rajesh Kumar',
    role: 'Software Engineer, Bangalore',
    text: 'I needed an Indian passport photo urgently and BGrade.in delivered. The AI background removal was spot-on — even around my hair. Downloaded the PDF and printed at home. Saved me a trip to the studio!',
    rating: 5,
    avatar: 'RK',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Graduate Student, New York',
    text: 'Needed a 2×2 inch US visa photo. This tool was incredibly easy to use and the print layout feature let me fit 8 photos on one 4×6 sheet. Professional quality, completely free.',
    rating: 5,
    avatar: 'SM',
  },
  {
    name: 'Aisha Al-Rashid',
    role: 'Marketing Manager, Dubai',
    text: 'The privacy aspect sold me. Knowing my face data never leaves my device gives me peace of mind. The background removal quality matches paid services I have used before.',
    rating: 5,
    avatar: 'AR',
  },
  {
    name: 'James Thompson',
    role: 'Freelance Photographer, London',
    text: 'As a photographer, I appreciate the precision. The crop guides and adjustment tools are well-designed. I now recommend BGrade.in to all my clients for quick ID photos.',
    rating: 5,
    avatar: 'JT',
  },
  {
    name: 'Priya Sharma',
    role: 'Homemaker, Delhi',
    text: 'I made Aadhaar and PAN card photos for my entire family in 10 minutes. No sign-up, no cost, just upload and download. This is the kind of tool every Indian household needs.',
    rating: 5,
    avatar: 'PS',
  },
  {
    name: 'Michael Chen',
    role: 'Small Business Owner, Toronto',
    text: 'Needed ID badge photos for my staff. The 8.5×5.5 cm size was perfect and the A4 print layout arranged them neatly. Exported as PDF and printed in bulk. Excellent tool.',
    rating: 5,
    avatar: 'MC',
  },
];
