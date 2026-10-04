import React, { useState } from 'react';
import { X, Heart, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

export default function PhotoLightbox({ photo, onClose }) {
  const [likes, setLikes] = useState(1);
  const [hasLiked, setHasLiked] = useState(false);

  if (!photo) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    soundEngine.playHeartbeat();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#e11d48', '#fb7185', '#d4af37'],
      shapes: ['circle'],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-[#18121e] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornate Gold Border Corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/50 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/50 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/50 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/50 rounded-br-lg" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-rose-200/70 hover:text-white bg-black/40 hover:bg-rose-900/60 rounded-full transition-colors"
        >
          <X size={22} />
        </button>

        {/* Image Frame */}
        <div className="relative rounded-xl overflow-hidden shadow-inner bg-black/50 border border-white/10 group">
          <img
            src={photo.url}
            alt={photo.caption || "Our Memory"}
            className="w-full max-h-[65vh] object-contain rounded-lg mx-auto"
          />
        </div>

        {/* Caption & Details */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-xl sm:text-2xl text-amber-200 font-medium">
              {photo.caption || "A Beautiful Memory"}
            </h4>
            {photo.date && (
              <p className="flex items-center gap-1.5 text-xs text-rose-300/80 mt-1 font-mono">
                <Calendar size={13} /> {photo.date}
              </p>
            )}
          </div>

          {/* Heart Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all transform active:scale-95 ${
              hasLiked
                ? 'bg-rose-600 border-rose-500 text-white shadow-glow-rose'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/50'
            }`}
          >
            <Heart
              size={18}
              className={`${hasLiked ? 'fill-current animate-bounce' : 'text-rose-400'}`}
            />
            <span className="text-sm font-semibold">{likes} Loves</span>
          </button>
        </div>
      </div>
    </div>
  );
}
