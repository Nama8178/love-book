import React, { useState } from 'react';
import Book3D from './components/Book3D';
import PhotoLightbox from './components/PhotoLightbox';
import { defaultStory } from './data/defaultStory';

export default function App() {
  const [storyData] = useState(() => {
    try {
      localStorage.removeItem('love_book_data_v1');
    } catch (e) {
      // ignore storage access errors
    }
    return defaultStory;
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0b11] overflow-x-hidden select-none py-3 px-2 sm:p-4">
      
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
