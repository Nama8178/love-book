import React, { useState } from 'react';
import { 
  Music, Volume2, VolumeX, Flame, Sparkles, Settings2, 
  Heart, Bookmark, BookOpen, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import BookmarkNav from './BookmarkNav';

export default function HeaderControls({
  onOpenCustomizer,
  onJumpToPage,
  currentPage,
  totalPages,
  candleMode,
  setCandleMode,
}) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMusic = () => {
    const playing = soundEngine.toggleMusic();
    setIsPlayingMusic(playing);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const triggerPetalShower = () => {
    soundEngine.playSparkle();
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.1 },
      colors: ['#e11d48', '#fb7185', '#d4af37', '#ffe4e6'],
      shapes: ['circle'],
    });
  };

  return (
    <header className="relative w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between z-30 select-none">
      
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-rose-950/70 border border-amber-500/40 flex items-center justify-center shadow-glow-rose">
          <Heart size={16} className="text-rose-400 fill-rose-500" />
        </div>
        <div className="hidden sm:block">
          <span className="font-serif font-bold text-amber-200 tracking-wide text-sm">
            Our Love Story
          </span>
          <span className="text-[10px] text-rose-300/60 block font-mono">
            3D Memory Book
          </span>
        </div>
      </div>

      {/* Floating Action Center */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Table of Contents / Bookmark Jump */}
        <BookmarkNav
          onJumpToPage={onJumpToPage}
          currentPage={currentPage}
          totalPages={totalPages}
        />

        {/* Romantic Petal Burst Button */}
        <button
          onClick={triggerPetalShower}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-amber-500/30 text-amber-200 hover:text-white backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
          title="Shower Rose Petals"
        >
          <Sparkles size={15} className="text-amber-400" />
          <span className="text-xs font-serif hidden md:inline">Petals</span>
        </button>

        {/* Ambient Romantic Music Button */}
        <button
          onClick={toggleMusic}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-full border backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm ${
            isPlayingMusic
              ? 'bg-rose-600/80 border-rose-400 text-white shadow-glow-rose animate-pulse'
              : 'bg-rose-950/60 hover:bg-rose-900/80 border-amber-500/30 text-amber-200 hover:text-white'
          }`}
          title={isPlayingMusic ? "Pause Romantic Music" : "Play Romantic Music"}
        >
          <Music size={15} className={isPlayingMusic ? "animate-spin" : ""} />
          <span className="text-xs font-serif hidden md:inline">
            {isPlayingMusic ? "Music Playing" : "Music Box"}
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-amber-500/30 text-amber-200 hover:text-white backdrop-blur-md transition-all"
          title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Candle Glow Toggle */}
        <button
          onClick={() => setCandleMode(!candleMode)}
          className={`p-2 rounded-full border backdrop-blur-md transition-all ${
            candleMode
              ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-glow-gold'
              : 'bg-rose-950/60 border-amber-500/30 text-stone-400 hover:text-white'
          }`}
          title="Toggle Candlelight Atmosphere"
        >
          <Flame size={15} />
        </button>

        {/* Personalize Book Modal Button */}
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-serif font-semibold border border-amber-400/60 shadow-glow-gold transition-all"
          title="Customize Names, Dates & Photos"
        >
          <Settings2 size={15} />
          <span className="hidden sm:inline">Customize</span>
        </button>

      </div>
    </header>
  );
}
