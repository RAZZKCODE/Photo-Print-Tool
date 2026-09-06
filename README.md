# PhotoPrintTool

A browser-based passport and ID photo maker built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Create standard passport, visa, Aadhaar, PAN, US passport, stamp-size, and ID badge photos
- Crop, zoom, and reposition photos
- Adjust brightness, contrast, and saturation
- Remove photo backgrounds with selectable background colors
- Generate print layouts for A4, A5, 4×6 inch, Letter, 5×7 inch, and 3R paper
- Arrange multiple photos and choose the number of photos per row
- Export print layouts as PNG or PDF
- Print layouts directly from the browser
- Process photos locally in the browser without uploading them to a server

## Requirements

- Node.js 18 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
npm run typecheck # Run the TypeScript compiler without emitting files
```

## Default Settings

- Photo size: Standard Passport, 3 × 4 cm
- Photos per row: 6
- Default paper size: A4

## Project Structure

```text
src/
├── components/       UI components and photo editor views
├── data/              Supported photo and paper sizes
├── utils/             Image processing and PDF export helpers
├── App.tsx            Main application layout
├── index.css          Global styles
└── main.tsx           Application entry point
```

## Privacy

Photo processing is performed in the browser. Images are not sent to a remote server by the application.
