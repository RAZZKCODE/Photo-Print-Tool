import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PhotoEditor from '@/components/PhotoEditor';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import SizesTable from '@/components/SizesTable';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { useState } from 'react';

function App() {
  const [isEditing, setIsEditing] = useState(false);

  const scrollToEditor = () => {
    document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onReset={handleReset} />
      <main>
        {!isEditing && <Hero onStart={scrollToEditor} />}
        <PhotoEditor onReset={handleReset} onEditingChange={setIsEditing} />
        <Features />
        <HowItWorks />
        <SizesTable />
        <Testimonials />
        <FAQ />
        <About />
      </main>
      <Footer />
    </div>
  );
}

export default App;
