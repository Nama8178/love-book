import React, { useState, useEffect, useRef } from 'react';
import ThreeBackground from './components/ThreeBackground';
import HeaderControls from './components/HeaderControls';
import Book3D from './components/Book3D';
import PhotoLightbox from './components/PhotoLightbox';
import CustomizerModal from './components/CustomizerModal';
import { defaultStory } from './data/defaultStory';

const STORAGE_KEY = 'love_book_data_v1';

export default function App() {
  const [storyData, setStoryData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read local storage:", e);
    }
    return defaultStory;
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [candleMode, setCandleMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const bookControlRef = useRef(null);

  const handleSaveStory = (newData) => {
    setStoryData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  };

  const handleResetStory = () => {
    setStoryData(defaultStory);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Storage reset failed:", e);
    }
  };

  const handleJumpToPage = (pageIndex) => {
    if (bookControlRef.current) {
      bookControlRef.current.jumpToPage(pageIndex);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Interactive 3D Three.js Ambient Particle Background */}
      <ThreeBackground candleMode={candleMode} />

      {/* Warm Candlelight Ambient Atmosphere Overlay */}
      {candleMode && (
        <div
          className="fixed inset-0 pointer-events-none z-1 bg-gradient-radial from-amber-500/10 via-transparent to-black/40 transition-opacity duration-1000"
          style={{
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {/* 2. Top Navigation & Ambient Controls */}
      <HeaderControls
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onJumpToPage={handleJumpToPage}
        currentPage={currentPage}
        totalPages={16}
        candleMode={candleMode}
        setCandleMode={setCandleMode}
      />

      {/* 3. Main Stage: The 3D Book (Closed at start, click to open, click right page to turn) */}
      <main className="flex-1 flex items-center justify-center py-4 px-2 z-10">
        <Book3D
          storyData={storyData}
          onPhotoClick={(photo) => setSelectedPhoto(photo)}
          bookControlRef={bookControlRef}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>

      {/* 4. Romantic Instruction Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-amber-200/50 font-serif tracking-wider z-20 pointer-events-none select-none">
        Crafted with eternal love • Click right page to turn next • Click left page to go back
      </footer>

      {/* 5. Photo Lightbox Modal */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* 6. Personalize & Customize Modal */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        storyData={storyData}
        onSave={handleSaveStory}
        onReset={handleResetStory}
      />

    </div>
  );
}
