import React, { useState } from 'react';
import Book3D from './components/Book3D';
import PhotoLightbox from './components/PhotoLightbox';
import { defaultStory } from './data/defaultStory';

const STORAGE_KEY = 'love_book_data_v1';

export default function App() {
  const [storyData] = useState(() => {
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0b11] overflow-hidden select-none p-4">
      
      {/* Pure 3D Book Stage */}
      <Book3D
        storyData={storyData}
        onPhotoClick={(photo) => setSelectedPhoto(photo)}
      />

      {/* Photo Lightbox (when clicking on a photo) */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

    </div>
  );
}
