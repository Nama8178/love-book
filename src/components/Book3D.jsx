import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import RelationshipTimer from './RelationshipTimer';
import InteractiveEnvelope from './InteractiveEnvelope';

export default function Book3D({ storyData, onPhotoClick, bookControlRef, onPageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0); // 0 to 7
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev'
  const [flippingSpread, setFlippingSpread] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [yesClicked, setYesClicked] = useState(false);

  const couple = storyData.couple;
  const pages = storyData.pages;

  const totalSpreads = 8; // Spreads 0 to 7

  // Mouse tilt on closed book for realistic 3D depth
  const handleMouseMove = (e) => {
    if (isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 18, y: -y * 18 });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Open the book from closed state
  const handleOpenBook = () => {
    if (isOpen) return;
    soundEngine.playSparkle();
    soundEngine.playPageFlip();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#e11d48', '#fda4af', '#fef3c7'],
    });
    setIsOpen(true);
    setCurrentSpread(0);
    if (onPageChange) onPageChange(1);
  };

  // Close the book back to 3D hardcover
  const handleCloseBook = () => {
    soundEngine.playPageFlip();
    setIsOpen(false);
    setCurrentSpread(0);
    if (onPageChange) onPageChange(0);
  };

  // Next page (clicking right page)
  const handleNextPage = () => {
    if (isFlipping || !isOpen) return;
    if (currentSpread >= totalSpreads - 1) {
      handleCloseBook();
      return;
    }
    soundEngine.playPageFlip();
    setIsFlipping(true);
    setFlipDirection('next');
    setFlippingSpread(currentSpread);

    setTimeout(() => {
      setCurrentSpread((prev) => {
        const next = prev + 1;
        if (onPageChange) onPageChange(next * 2 + 1);
        return next;
      });
      setIsFlipping(false);
      setFlipDirection(null);
    }, 750);
  };

  // Prev page (clicking left page)
  const handlePrevPage = () => {
    if (isFlipping || !isOpen) return;
    if (currentSpread <= 0) {
      handleCloseBook();
      return;
    }
    soundEngine.playPageFlip();
    setIsFlipping(true);
    setFlipDirection('prev');
    setFlippingSpread(currentSpread);

    setTimeout(() => {
      setCurrentSpread((prev) => {
        const next = prev - 1;
        if (onPageChange) onPageChange(next * 2 + 1);
        return next;
      });
      setIsFlipping(false);
      setFlipDirection(null);
    }, 750);
  };

  const handleJumpTo = (spreadIdx) => {
    if (isFlipping) return;
    if (!isOpen) setIsOpen(true);
    soundEngine.playPageFlip();
    setCurrentSpread(Math.max(0, Math.min(totalSpreads - 1, spreadIdx)));
    if (onPageChange) onPageChange(spreadIdx * 2 + 1);
  };

  useEffect(() => {
    if (bookControlRef) {
      bookControlRef.current = {
        openBook: handleOpenBook,
        closeBook: handleCloseBook,
        nextPage: handleNextPage,
        prevPage: handlePrevPage,
        jumpToSpread: handleJumpTo,
        jumpToPage: (pageNum) => {
          if (pageNum === 0) {
            handleCloseBook();
          } else {
            handleJumpTo(Math.floor((pageNum - 1) / 2));
          }
        },
      };
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (!isOpen) handleOpenBook();
        else handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (isOpen) handlePrevPage();
      } else if (e.key === 'Escape' && isOpen) {
        handleCloseBook();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSpread, isFlipping]);

  // Proposal celebration
  const handleYesProposal = (e) => {
    e.stopPropagation();
    setYesClicked(true);
    soundEngine.playSparkle();
    soundEngine.playHeartbeat();
    
    const count = 250;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#e11d48', '#d4af37'] });
    fire(0.2, { spread: 60, colors: ['#fb7185', '#ffe4e6', '#d4af37'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#e11d48', '#f43f5e'] });
  };

  // Helper for polaroid photo rendering
  const renderPolaroid = (photo, heightClass = "h-40 sm:h-44", customClass = "") => {
    if (!photo) return null;
    return (
      <div
        className={`polaroid cursor-pointer mx-auto ${customClass}`}
        style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
        onClick={(e) => {
          e.stopPropagation();
          onPhotoClick(photo);
        }}
      >
        <div className="tape" />
        <img
          src={photo.url}
          alt={photo.caption || "Memory"}
          className={`w-full ${heightClass} object-cover rounded-xs`}
        />
        {photo.caption && (
          <p className="font-handwriting text-sm text-gray-800 mt-2 text-center truncate px-1">
            {photo.caption}
          </p>
        )}
      </div>
    );
  };

  // ================= RENDER SPREAD CONTENT HELPERS =================
  const renderLeftPage = (spreadIndex) => {
    switch (spreadIndex) {
      case 0:
        // Inside Front Cover / Dedication (with couple photo!)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-900 font-bold">
                  Memory Archive
                </span>
                <span className="text-amber-800 text-xs font-mono">№ 001</span>
              </div>
              <h2 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                For You, Always
              </h2>
              <p className="font-serif italic text-xs text-rose-800/80">
                {couple.dedication}
              </p>
            </div>

            {/* Dedication Photo */}
            <div className="my-auto py-2">
              {renderPolaroid(pages[0]?.dedicationPhoto, "h-44 sm:h-48", "max-w-[270px]")}
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-800/70 border-t border-amber-900/20 pt-2 font-mono">
              <span>Chapter I • The Beginning</span>
              <span>Page 1</span>
            </div>
          </div>
        );

      case 1:
        // Chapter 2 (Left: 2 Travel Photos)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 02
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[1]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[1]?.chapterTitle}
              </h3>
            </div>

            {/* Dual Travel Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[1]?.photo1, "h-36 sm:h-40")}
              {renderPolaroid(pages[1]?.photo2, "h-36 sm:h-40")}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 3</div>
          </div>
        );

      case 2:
        // Chapter 3 (Left: 2 Sweet Photos)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 03
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[2]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[2]?.chapterTitle}
              </h3>
            </div>

            {/* 2 Portrait Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[2]?.photo2, "h-36 sm:h-40")}
              {renderPolaroid(pages[2]?.photo3, "h-36 sm:h-40")}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 5</div>
          </div>
        );

      case 3:
        // Chapter 4 (Left: 35mm Film Strip with 3 Candid Photos)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 04
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[3]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[3]?.chapterTitle}
              </h3>
            </div>

            {/* 35mm Film Strip */}
            <div className="my-auto bg-[#181210] p-2.5 rounded-sm border border-amber-950 shadow-md">
              <div className="flex justify-between px-1 mb-1.5 text-[8px] text-amber-200/50 font-mono">
                <span>■ ■ ■ ■</span>
                <span>35MM FILM • CANDID</span>
                <span>■ ■ ■ ■</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pages[3]?.filmPhotos?.map((pic, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer group overflow-hidden rounded-xs"
                    onClick={(e) => { e.stopPropagation(); onPhotoClick(pic); }}
                  >
                    <img
                      src={pic.url}
                      alt="Candid"
                      className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] p-1 text-center transition-opacity">
                      {pic.caption}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-1 mt-1.5 text-[8px] text-amber-200/50 font-mono">
                <span>■ ■ ■ ■</span>
                <span>KODAK LOVE 400</span>
                <span>■ ■ ■ ■</span>
              </div>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 7</div>
          </div>
        );

      case 4:
        // Chapter 5 (Left: Romance Photo)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 05
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[4]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[4]?.chapterTitle}
              </h3>
            </div>

            {/* Romance Photo */}
            <div className="my-auto py-2">
              {renderPolaroid(pages[4]?.letterPhoto, "h-48 sm:h-52", "max-w-[280px]")}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 9</div>
          </div>
        );

      case 5:
        // Chapter 6 (Left: Live Relationship Timer & Milestone Photo)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 06
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[5]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[5]?.chapterTitle}
              </h3>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <RelationshipTimer startDateString={couple.anniversaryDate} />
            </div>

            {/* Milestone Photo */}
            <div className="my-auto py-1">
              {renderPolaroid(pages[5]?.milestonePhoto, "h-32 sm:h-36", "max-w-[230px]")}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 11</div>
          </div>
        );

      case 6:
        // Chapter 7 (Left: 2 Sacred Vows Photos)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 07
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[6]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[6]?.chapterTitle}
              </h3>
            </div>

            {/* 2 Together Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[6]?.photo1, "h-36 sm:h-40")}
              {renderPolaroid(pages[6]?.photo2, "h-36 sm:h-40")}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 13</div>
          </div>
        );

      case 7:
        // Epilogue / Back Cover inside
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8 text-center">
            <div className="border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-900">
                To Be Continued...
              </span>
            </div>

            <div className="my-auto py-6">
              <div className="font-cursive text-5xl text-rose-900 font-bold mb-3">
                {couple.hisName[0]} & {couple.herName[0]}
              </div>
              <p className="font-serif italic text-base text-amber-950 leading-relaxed max-w-xs mx-auto">
                “Every love story is beautiful, but ours is my favorite.”
              </p>
              <div className="w-16 h-0.5 bg-amber-400/50 mx-auto my-4" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-800/70">
                Forever & Always
              </p>
            </div>

            <div className="border-t border-amber-900/20 pt-2 flex justify-between items-center text-[10px] font-mono text-amber-900/70">
              <span>End of Volume I</span>
              <span>The Journey Continues</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderRightPage = (spreadIndex) => {
    switch (spreadIndex) {
      case 0:
        // Chapter 1 (Right: 2 Polaroids side-by-side or stacked!)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 01
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[0]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                {pages[0]?.chapterTitle}
              </h3>
            </div>

            {/* 2 Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[0]?.photo1, "h-36 sm:h-40")}
              {renderPolaroid(pages[0]?.photo2, "h-36 sm:h-40")}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 2</div>
          </div>
        );

      case 1:
        // Chapter 2 (Right: 2 More Travel Photos!)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Our Adventures
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  Wanderlust
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                Favorite Escapes
              </h3>
            </div>

            {/* 2 Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[1]?.photo3, "h-36 sm:h-40")}
              {renderPolaroid(pages[1]?.photo4, "h-36 sm:h-40")}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 4</div>
          </div>
        );

      case 2:
        // Chapter 3 (Right: Large Portrait of Her)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Her Portrait
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  Always Radiant
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                The Girl of My Dreams
              </h3>
            </div>

            {/* Large Portrait */}
            <div className="my-auto py-2">
              {renderPolaroid(pages[2]?.photo1, "h-48 sm:h-52", "max-w-[280px]")}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 6</div>
          </div>
        );

      case 3:
        // Chapter 4 (Right: 2 Candid Laugh Photos - NO JOKE STICKER)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Spontaneous Magic
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  Unrehearsed
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                Moments of Joy
              </h3>
            </div>

            {/* 2 Candid Photos */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[3]?.photo1, "h-36 sm:h-40")}
              {renderPolaroid(pages[3]?.photo2, "h-36 sm:h-40")}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 8</div>
          </div>
        );

      case 4:
        // Chapter 5 (Right: Interactive Secret Love Letter Envelope!)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  A Letter For You
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  Sealed
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                Unseal My Heart
              </h3>
            </div>

            {/* Interactive 3D Unsealing Envelope */}
            <div className="my-auto w-full" onClick={(e) => e.stopPropagation()}>
              <InteractiveEnvelope letter={pages[4]?.letter} />
            </div>

            <p className="text-[11px] text-center text-amber-800/60 font-mono">
              Written with all my heart by {couple.hisName}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 10</div>
          </div>
        );

      case 5:
        // Chapter 6 (Right: 2 Milestone Polaroids)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-7">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Every Second
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  Milestones
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-2">
                Blessed Moments
              </h3>
            </div>

            {/* 2 Polaroids */}
            <div className="grid grid-cols-2 gap-3 my-auto py-1">
              {renderPolaroid(pages[5]?.photo1, "h-36 sm:h-40")}
              {renderPolaroid(pages[5]?.photo2, "h-36 sm:h-40")}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 12</div>
          </div>
        );

      case 6:
        // Chapter 7 (Right: Proposal Finale - NO RUNAWAY JOKE)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8 text-center">
            <div className="text-right border-b border-amber-900/20 pb-1.5">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The Question of Forever
              </span>
            </div>

            <div className="my-auto py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-400 mx-auto flex items-center justify-center shadow-md">
                <Heart size={30} className="fill-rose-600 text-rose-600 animate-heart-beat" />
              </div>

              <h4 className="font-serif text-2xl sm:text-3xl text-amber-950 font-bold leading-tight">
                {pages[6]?.finalQuestion}
              </h4>

              <p className="font-serif italic text-xs sm:text-sm text-amber-900/80 max-w-xs mx-auto">
                {pages[6]?.finalQuote}
              </p>

              {/* Romantic Forever Seal */}
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                <div
                  onClick={handleYesProposal}
                  className="cursor-pointer inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-rose-300 bg-rose-50/90 shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <Heart size={18} className="fill-rose-600 text-rose-600 animate-heart-beat" />
                  <span className="font-handwriting text-xl text-rose-950 font-bold">
                    {yesClicked ? "Our Forever Begins ❤️" : "Forever & Always ❤️"}
                  </span>
                </div>
              </div>

              {yesClicked && (
                <p className="font-handwriting text-xl text-rose-700 animate-bounce pt-1 font-bold">
                  Here's to a lifetime of love and adventure! ✨
                </p>
              )}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 14</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 my-auto select-none">
      
      {/* ================= STATE 1: 3D CLOSED HARDCOVER BOOK ================= */}
      {!isOpen ? (
        <div
          className="relative perspective-[1800px] cursor-pointer group my-6 sm:my-8 transition-transform duration-500"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleOpenBook}
        >
          {/* Floor Shadow for 3D realism */}
          <div className="absolute -bottom-8 left-6 right-6 h-12 bg-black/60 rounded-full blur-2xl transform scale-y-50 group-hover:scale-105 transition-transform" />

          {/* 3D Closed Book Block */}
          <div
            className="relative w-[340px] sm:w-[420px] h-[500px] sm:h-[600px] rounded-r-2xl rounded-l-md transition-all duration-300 ease-out transform"
            style={{
              transform: `rotateY(${mouseTilt.x}deg) rotateX(${mouseTilt.y}deg)`,
              transformStyle: 'preserve-3d',
              boxShadow: `
                1px 1px 0 #b38728,
                2px 2px 0 #d4af37,
                3px 3px 0 #fcf6ba,
                4px 4px 0 #aa771c,
                5px 5px 0 #d4af37,
                6px 6px 0 #fcf6ba,
                7px 7px 0 #aa771c,
                8px 8px 0 #b38728,
                10px 10px 0 #851e2d,
                15px 20px 45px rgba(0, 0, 0, 0.8),
                0 0 35px rgba(212, 175, 55, 0.25)
              `,
            }}
          >
            {/* Hardcover Front Face */}
            <div className="absolute inset-0 book-cover rounded-r-2xl rounded-l-md p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden border border-[#851e2d]">
              {/* Ornate Gold Borders */}
              <div className="absolute inset-3 border-2 border-amber-500/40 rounded-r-xl rounded-l-xs pointer-events-none" />
              <div className="absolute inset-5 border border-amber-400/20 rounded-r-lg rounded-l-xs pointer-events-none" />

              {/* 3D Spine Ridge on Left */}
              <div className="absolute left-0 top-0 bottom-0 w-7 bg-gradient-to-r from-black/80 via-amber-900/40 to-transparent pointer-events-none border-r border-amber-600/30" />

              {/* Top Medallion */}
              <div className="mt-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-amber-400/60 flex items-center justify-center bg-amber-950/60 shadow-glow-gold">
                  <Heart className="text-amber-300 fill-rose-500/70 animate-heart-beat" size={28} />
                </div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300/80 mt-3 font-sans font-medium">
                  A True Love Story
                </span>
              </div>

              {/* Embossed Titles */}
              <div className="my-auto py-4">
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide gold-foil-text leading-tight drop-shadow-md">
                  {couple.bookTitle}
                </h1>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3" />
                <p className="font-cursive text-3xl sm:text-4xl text-amber-200/90 font-normal">
                  {couple.hisName} & {couple.herName}
                </p>
                <p className="font-serif italic text-xs sm:text-sm text-rose-200/70 mt-3 max-w-xs mx-auto">
                  {couple.subtitle}
                </p>
              </div>

              {/* Embossed Gold Medallion */}
              <div className="mb-6 flex flex-col items-center pointer-events-none">
                <div className="w-12 h-12 rounded-full border border-amber-400/50 flex items-center justify-center bg-amber-950/40 shadow-glow-gold">
                  <Heart className="text-amber-300 fill-rose-500/60 animate-heart-beat" size={22} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* ================= STATE 2: 3D OPEN BOOK SPREAD ================= */
        <div className="relative w-full flex flex-col items-center">
          
          {/* Ambient Glow behind open book */}
          <div className="absolute -inset-6 bg-gradient-to-r from-rose-900/20 via-amber-600/15 to-rose-900/20 rounded-[40px] blur-2xl pointer-events-none" />

          {/* Dual Page Container */}
          <div
            className="relative w-full max-w-[960px] h-[520px] sm:h-[620px] rounded-lg shadow-book flex perspective-[2200px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Center Spine Leather Accent Behind */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-[#2a080d] via-[#4a0e17] to-[#2a080d] z-0 shadow-2xl rounded-sm" />

            {/* Silk Ribbon Bookmark Draping Down */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-36 bg-gradient-to-b from-rose-700 via-rose-600 to-rose-800 shadow-lg rounded-b-sm border-x border-rose-900 z-30 pointer-events-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)' }}
            />

            {/* ================= LEFT PAGE (CLICK TO GO PREV) ================= */}
            <div
              onClick={handlePrevPage}
              className={`relative flex-1 h-full book-page page-left rounded-l-lg overflow-hidden cursor-pointer group transition-colors duration-200 z-10 ${
                currentSpread === 0 ? 'hover:bg-amber-100/30' : 'hover:bg-amber-100/40'
              }`}
              title={currentSpread === 0 ? "Click to close book" : "Click left page to go back"}
            >
              {renderLeftPage(currentSpread)}
            </div>

            {/* Spine Center Groove Shadow */}
            <div className="w-[2px] h-full bg-gradient-to-b from-amber-950/40 via-amber-950/70 to-amber-950/40 shadow-inner z-20 pointer-events-none" />

            {/* ================= RIGHT PAGE (CLICK TO GO NEXT) ================= */}
            <div
              onClick={handleNextPage}
              className="relative flex-1 h-full book-page page-right rounded-r-lg overflow-hidden cursor-pointer group transition-colors duration-200 z-10 hover:bg-amber-100/40"
              title={currentSpread >= totalSpreads - 1 ? "Click to close book" : "Click right page to turn next"}
            >
              {renderRightPage(currentSpread)}
            </div>

            {/* ================= 3D TURNING SHEET OVERLAY (WHEN FLIPPING) ================= */}
            {isFlipping && (
              <div
                className={`absolute top-0 bottom-0 w-1/2 z-30 pointer-events-none ${
                  flipDirection === 'next'
                    ? 'left-1/2 animate-flip-next'
                    : 'right-1/2 animate-flip-prev'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Front Face of Turning Sheet */}
                <div
                  className="absolute inset-0 book-page overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {flipDirection === 'next'
                    ? renderRightPage(flippingSpread)
                    : renderLeftPage(flippingSpread)}
                </div>

                {/* Back Face of Turning Sheet */}
                <div
                  className="absolute inset-0 book-page overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {flipDirection === 'next'
                    ? renderLeftPage(flippingSpread + 1)
                    : renderRightPage(flippingSpread - 1)}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
