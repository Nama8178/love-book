import React, { useState } from 'react';
import { Heart, Sparkles, X, MailOpen, Mail } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function InteractiveEnvelope({ letter }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    soundEngine.playSparkle();
    setIsOpen((prev) => !prev);
  };

  const handleContainerClick = (e) => {
    // Crucial: Stop event bubbling so right page does not flip!
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full max-w-sm mx-auto my-2 py-2 flex flex-col items-center select-none"
    >
      {/* Interactive Envelope */}
      <div
        onClick={toggleOpen}
        className="cursor-pointer group relative w-72 h-44 transition-transform duration-300 hover:scale-105"
        title={isOpen ? "Click to fold letter" : "Click to open letter"}
      >
        {/* Envelope Back / Base */}
        <div className="absolute inset-0 bg-[#d97706]/20 border-2 border-[#b45309] rounded-lg shadow-md overflow-hidden bg-gradient-to-br from-[#fef3c7] to-[#fde68a]">
          {/* Envelope fold diagonal lines */}
          <div className="absolute inset-0 border-t-[88px] border-t-transparent border-l-[144px] border-l-[#fcd34d]/60 border-r-[144px] border-r-[#f59e0b]/50 border-b-[88px] border-b-[#d97706]/40 pointer-events-none" />
        </div>

        {/* Letter inside that slides out */}
        <div
          className={`absolute left-2 right-2 bg-[#fffef9] border border-amber-300/80 p-4 rounded-lg shadow-2xl transition-all duration-700 ease-out z-30 ${
            isOpen
              ? '-translate-y-40 scale-100 opacity-100 pointer-events-auto'
              : 'translate-y-2 opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-2 border-b border-rose-100 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-800/70 font-semibold flex items-center gap-1">
              <MailOpen size={12} /> Confidential • For Her Eyes Only
            </span>
            <button
              onClick={toggleOpen}
              className="text-xs text-rose-500 hover:text-rose-800 p-1 hover:bg-rose-50 rounded transition-colors"
              title="Close letter"
            >
              <X size={15} />
            </button>
          </div>

          <h4 className="font-handwriting text-xl text-rose-900 font-semibold mb-2">
            {letter.salutation}
          </h4>

          <div className="max-h-48 overflow-y-auto pr-1">
            <p className="font-handwriting text-base text-gray-800 leading-relaxed whitespace-pre-line">
              {letter.body}
            </p>
          </div>

          <div className="text-right mt-3 pt-2 border-t border-rose-100/60">
            <p className="font-handwriting text-xs text-gray-600">{letter.closing}</p>
            <p className="font-cursive text-2xl text-rose-700 font-bold">{letter.signature}</p>
          </div>
        </div>

        {/* Envelope Top Flap */}
        <div
          className={`absolute top-0 left-0 right-0 h-0 border-l-[144px] border-l-transparent border-r-[144px] border-r-transparent border-t-[90px] border-t-[#d97706] origin-top transition-transform duration-500 z-20 ${
            isOpen ? 'rotate-x-180 -translate-y-1' : ''
          }`}
          style={{ transformOrigin: 'top center' }}
        />

        {/* Heart Wax Seal */}
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 ${
            isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-2 border-rose-400 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Heart size={20} className="fill-amber-200 text-amber-200 animate-pulse" />
          </div>
        </div>

        {/* Prompt label */}
        <div className="absolute bottom-2 left-0 right-0 text-center z-20 pointer-events-none">
          <span className="text-[10px] font-mono tracking-wider uppercase text-amber-900 font-bold bg-amber-100/90 px-2.5 py-0.5 rounded-full shadow-xs">
            {isOpen ? "Tap ✕ to close letter" : "✉ Tap to open letter"}
          </span>
        </div>
      </div>
    </div>
  );
}
