import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import RelationshipTimer from './RelationshipTimer';
import InteractiveEnvelope from './InteractiveEnvelope';

export default function Book3D({ storyData, onPhotoClick, bookControlRef, onPageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0); // 0 to 7 (desktop spreads)
  const [mobilePage, setMobilePage] = useState(0); // 0 to 15 (mobile individual pages)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null); // 'next' | 'prev'
  const [flippingSpread, setFlippingSpread] = useState(0);
  const [flippingMobilePage, setFlippingMobilePage] = useState(0);
  const [yesClicked, setYesClicked] = useState(false);

  // 3D Drag & Wobble state for closed book
  const [isDragging, setIsDragging] = useState(false);
  const [bookTilt, setBookTilt] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, startTiltX: 0, startTiltY: 0, moved: false });
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const couple = storyData.couple;
  const pages = storyData.pages;

  const totalSpreads = 7; // Spreads 0 to 6 (14 pages total, ends with Proposal Finale)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer down on closed book to start drag/wobble
  const handlePointerDown = (e) => {
    if (isOpen) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTiltX: bookTilt.x,
      startTiltY: bookTilt.y,
      moved: false,
    };
    setIsDragging(true);
  };

  // Dragging wobbles the book smoothly up to 160-180 degrees
  const handlePointerMove = (e) => {
    if (isOpen) return;
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      if (Math.hypot(deltaX, deltaY) > 5) {
        dragStartRef.current.moved = true;
      }
      // Rotate Y smoothly up to 160-180 degrees
      const rotY = Math.max(-175, Math.min(175, dragStartRef.current.startTiltY + deltaX * 0.72));
      const rotX = Math.max(-20, Math.min(20, dragStartRef.current.startTiltX - deltaY * 0.12));
      setBookTilt({ x: rotX, y: rotY });
    } else {
      // Gentle hover tilt when not dragging
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setBookTilt({ x: -y * 14, y: x * 18 });
    }
  };

  // Releasing the pointer
  const handlePointerUp = (e) => {
    if (isOpen) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // ignore
    }
    setIsDragging(false);

    if (!dragStartRef.current.moved) {
      // Direct click/tap without dragging -> open the book!
      handleOpenBook();
    } else {
      // Spring wobble back to neutral
      setBookTilt({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setBookTilt({ x: 0, y: 0 });
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setBookTilt({ x: 0, y: 0 });
    }
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
    setMobilePage(0);
    if (onPageChange) onPageChange(1);
  };

  // Close the book back to 3D hardcover
  const handleCloseBook = () => {
    soundEngine.playPageFlip();
    setIsOpen(false);
    setCurrentSpread(0);
    setMobilePage(0);
    if (onPageChange) onPageChange(0);
  };

  // Touch swipe handling for mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (isFlipping || !isOpen) return;
    if (e.changedTouches && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      // Dominant horizontal swipe (>40px, >1.2x deltaY, completed in <650ms)
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 650) {
        if (deltaX < 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    }
  };

  // Next page
  const handleNextPage = () => {
    if (isFlipping || !isOpen) return;
    if (isMobile) {
      if (mobilePage >= 13) {
        handleCloseBook();
        return;
      }
      soundEngine.playPageFlip();
      setIsFlipping(true);
      setFlipDirection('next');
      setFlippingMobilePage(mobilePage);

      setTimeout(() => {
        setMobilePage((prev) => {
          const next = prev + 1;
          setCurrentSpread(Math.floor(next / 2));
          if (onPageChange) onPageChange(next + 1);
          return next;
        });
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    } else {
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
          setMobilePage(next * 2);
          if (onPageChange) onPageChange(next * 2 + 1);
          return next;
        });
        setIsFlipping(false);
        setFlipDirection(null);
      }, 750);
    }
  };

  // Prev page
  const handlePrevPage = () => {
    if (isFlipping || !isOpen) return;
    if (isMobile) {
      if (mobilePage <= 0) {
        handleCloseBook();
        return;
      }
      soundEngine.playPageFlip();
      setIsFlipping(true);
      setFlipDirection('prev');
      setFlippingMobilePage(mobilePage);

      setTimeout(() => {
        setMobilePage((prev) => {
          const next = prev - 1;
          setCurrentSpread(Math.floor(next / 2));
          if (onPageChange) onPageChange(next + 1);
          return next;
        });
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    } else {
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
          setMobilePage(next * 2);
          if (onPageChange) onPageChange(next * 2 + 1);
          return next;
        });
        setIsFlipping(false);
        setFlipDirection(null);
      }, 750);
    }
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

  // Helper for polaroid photo rendering (completely shown in frame with object-contain!)
  const renderPolaroid = (photo, heightClass = "h-36 sm:h-44", customClass = "") => {
    if (!photo) return null;
    return (
      <div
        className={`polaroid cursor-pointer mx-auto flex flex-col justify-between ${customClass}`}
        style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
        onClick={(e) => {
          e.stopPropagation();
          onPhotoClick(photo);
        }}
      >
        <div className="tape" />
        <div className={`w-full ${heightClass} bg-[#f7f4ed] flex items-center justify-center overflow-hidden rounded-xs border border-amber-900/10 shadow-inner group`}>
          <img
            src={photo.url}
            alt={photo.caption || "Memory"}
            className="w-full h-full object-contain rounded-xs transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {photo.caption && (
          <p className="font-handwriting text-xs sm:text-sm text-gray-800 mt-1.5 sm:mt-2 text-center line-clamp-1 px-1">
            {photo.caption}
          </p>
        )}
      </div>
    );
  };

  // Single page renderer for mobile responsive view
  const renderSinglePage = (pageIndex) => {
    const spreadIndex = Math.floor(pageIndex / 2);
    const isLeft = pageIndex % 2 === 0;
    return isLeft ? renderLeftPage(spreadIndex) : renderRightPage(spreadIndex);
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
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {pages[3]?.filmPhotos?.map((pic, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer group overflow-hidden rounded-xs bg-black p-0.5 border border-amber-900/30 shadow-sm"
                    onClick={(e) => { e.stopPropagation(); onPhotoClick(pic); }}
                  >
                    <div className="w-full h-24 xs:h-28 sm:h-36 bg-black flex items-center justify-center overflow-hidden">
                      <img
                        src={pic.url}
                        alt={pic.caption || "Candid"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] p-1 text-center transition-opacity pointer-events-none">
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
                An appology Lettter, Please maaf krdo 🥺
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
        <div className="flex flex-col items-center justify-center my-4 sm:my-6 select-none">
          <div
            className="relative perspective-[1800px] cursor-grab active:cursor-grabbing group transition-transform duration-500"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onMouseLeave={handleMouseLeave}
          >
            {/* Dynamic Floor Shadow for 3D realism */}
            <div
              className="absolute -bottom-10 left-4 right-4 h-14 bg-black/70 rounded-full blur-2xl transition-transform ease-out"
              style={{
                transform: `scaleY(0.45) scaleX(${Math.max(0.7, 1 - Math.abs(bookTilt.y) / 360)}) skewX(${bookTilt.y * 0.15}deg)`,
                opacity: Math.max(0.3, 0.7 - Math.abs(bookTilt.y) / 300),
              }}
            />

            {/* 3D Closed Book Block (rotates up to 160-180 degrees while dragging) */}
            <div
              className="relative w-[86vw] max-w-[380px] sm:max-w-[420px] h-[72vh] max-h-[590px] min-h-[460px] rounded-r-2xl rounded-l-md select-none transform"
              style={{
                transform: `rotateY(${bookTilt.y}deg) rotateX(${bookTilt.x}deg)`,
                transformStyle: 'preserve-3d',
                transition: isDragging
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* ===== FRONT COVER (translateZ(14px)) ===== */}
              <div
                className="absolute inset-0 book-cover rounded-r-2xl rounded-l-md p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden border border-[#851e2d]"
                style={{
                  transform: 'translateZ(14px)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
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
                {/* Ornate Gold Borders */}
                <div className="absolute inset-3 border-2 border-amber-500/40 rounded-r-xl rounded-l-xs pointer-events-none" />
                <div className="absolute inset-5 border border-amber-400/20 rounded-r-lg rounded-l-xs pointer-events-none" />

                {/* 3D Spine Ridge on Left */}
                <div className="absolute left-0 top-0 bottom-0 w-7 bg-gradient-to-r from-black/80 via-amber-900/40 to-transparent pointer-events-none border-r border-amber-600/30" />

                {/* Single Top Medallion (The ONLY Heart on the cover page) */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-400/60 flex items-center justify-center bg-amber-950/60 shadow-glow-gold">
                    <Heart className="text-amber-300 fill-rose-500/70 animate-heart-beat" size={28} />
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300/80 mt-3 font-sans font-medium">
                     A beautiful love story, captured in time
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

                {/* Bottom Gold Accent (Second Heart removed for clean elegance) */}
                <div className="mb-6 flex flex-col items-center pointer-events-none">
                  <div className="flex items-center gap-2 text-amber-400/60">
                    <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                    <Sparkles size={16} className="text-amber-300/80" />
                    <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                  </div>
                </div>
              </div>

              {/* ===== BACK COVER (rotateY(180deg) translateZ(14px)) ===== */}
              <div
                className="absolute inset-0 book-cover rounded-l-2xl rounded-r-md p-6 sm:p-8 flex flex-col items-center justify-between text-center overflow-hidden border border-[#851e2d]"
                style={{
                  transform: 'rotateY(180deg) translateZ(14px)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: `
                    -1px 1px 0 #b38728,
                    -2px 2px 0 #d4af37,
                    -3px 3px 0 #fcf6ba,
                    -4px 4px 0 #aa771c,
                    -5px 5px 0 #d4af37,
                    -6px 6px 0 #fcf6ba,
                    -7px 7px 0 #aa771c,
                    -8px 8px 0 #b38728,
                    -10px 10px 0 #851e2d,
                    -15px 20px 45px rgba(0, 0, 0, 0.8),
                    0 0 35px rgba(212, 175, 55, 0.25)
                  `,
                }}
              >
                {/* Ornate Gold Borders */}
                <div className="absolute inset-3 border-2 border-amber-500/40 rounded-l-xl rounded-r-xs pointer-events-none" />
                <div className="absolute inset-5 border border-amber-400/20 rounded-l-lg rounded-r-xs pointer-events-none" />

                {/* Spine Ridge on Right for back cover */}
                <div className="absolute right-0 top-0 bottom-0 w-7 bg-gradient-to-l from-black/80 via-amber-900/40 to-transparent pointer-events-none border-l border-amber-600/30" />

                {/* Back Top Medallion */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-amber-400/50 flex items-center justify-center bg-amber-950/50 shadow-glow-gold">
                    <Sparkles className="text-amber-300" size={24} />
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300/70 mt-3 font-sans font-medium">
                    Forever & Always
                  </span>
                </div>

                {/* Back Quote */}
                <div className="my-auto py-4 max-w-xs px-2">
                  <p className="font-serif italic text-base sm:text-lg text-amber-100/90 leading-relaxed drop-shadow">
                    “I loved you yesterday, I love you still, I always have, I always will.”
                  </p>
                  <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-4" />
                  <p className="font-cursive text-2xl text-amber-300/90">
                    {couple.bookTitle}
                  </p>
                  <p className="font-mono text-xs text-rose-300/70 mt-2">
                    {couple.hisName} & {couple.herName}
                  </p>
                </div>

                {/* Back Bottom Ornament */}
                <div className="mb-6 flex flex-col items-center pointer-events-none text-amber-400/50 text-xs font-serif tracking-widest">
                  ❧ ❦ ☙
                </div>
              </div>

              {/* ===== 3D LEATHER SPINE (Left Face) ===== */}
              <div
                className="absolute top-0 bottom-0 left-0 w-[28px] bg-gradient-to-r from-[#2a060d] via-[#4d0c17] to-[#2a060d] border-y border-[#851e2d] flex flex-col items-center justify-between py-8 shadow-2xl"
                style={{
                  transform: 'rotateY(-90deg) translateZ(14px)',
                  transformOrigin: 'left center',
                }}
              >
                <div className="w-full h-1 bg-amber-400/40 my-2" />
                <span
                  className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.35em] text-amber-300 font-bold whitespace-nowrap opacity-90"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {couple.bookTitle}
                </span>
                <div className="w-full h-1 bg-amber-400/40 my-2" />
              </div>

              {/* ===== 3D GILDED PAGES BLOCK (Right Face) ===== */}
              <div
                className="absolute top-[8px] bottom-[8px] right-0 w-[24px] rounded-r-xs"
                style={{
                  transform: 'rotateY(90deg) translateZ(12px)',
                  transformOrigin: 'right center',
                  background: 'linear-gradient(to bottom, #d4af37 0%, #fef3c7 25%, #aa771c 50%, #fef3c7 75%, #d4af37 100%)',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
                }}
              />
            </div>
          </div>

          {/* Interactive Drag & Open Controls / Hint */}
          <div className="mt-8 flex flex-col items-center gap-3 select-none pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenBook();
              }}
              className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-glow-gold hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Open Our Story</span>
              <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
            </button>
            <span className="text-[11px] text-amber-300/70 font-serif italic flex items-center gap-2">
              <span className="text-amber-400">✦</span>
              <span>Drag left & right to wobble in 3D (180°) • Tap to Open</span>
              <span className="text-amber-400">✦</span>
            </span>
          </div>
        </div>
      ) : (

        /* ================= STATE 2: OPEN BOOK (RESPONSIVE: MOBILE SINGLE-PAGE OR DESKTOP DUAL SPREAD) ================= */
        isMobile ? (
          /* ----- MOBILE: SINGLE PAGE VIEW (Pages 1 to 16) ----- */
          <div className="relative w-full max-w-[420px] flex flex-col items-center">
            {/* Ambient Glow behind open page */}
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-900/25 via-amber-600/20 to-rose-900/25 rounded-[30px] blur-xl pointer-events-none" />

            {/* Mobile Book Structure: Leather Hardcover Base Housing Spine + Page + Gilded Edge */}
            <div
              className="relative w-full h-[560px] sm:h-[620px] rounded-2xl bg-gradient-to-r from-[#1c0407] via-[#2f0810] to-[#1c0407] shadow-book border-2 border-[#851e2d] flex items-stretch p-1 sm:p-1.5 overflow-hidden perspective-[1800px]"
              style={{ transformStyle: 'preserve-3d' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* ================= 1. THE LINE SIDE OF BOOK WHERE PAGES CONNECT (SPINE BINDING) ================= */}
              <div
                className="relative w-7 sm:w-8 h-full bg-gradient-to-r from-[#200408] via-[#380811] to-[#1c0407] rounded-l-xl flex flex-col items-center justify-between py-4 shadow-xl z-20 select-none flex-shrink-0 border-r border-[#150305]"
                title="Book Spine Binding"
              >
                {/* Top Spine Gold Tooling Bar */}
                <div className="w-4 h-0.5 bg-amber-400/60 rounded-full" />

                {/* Stitched Seam Rivets / Golden Knots along the Spine */}
                <div className="flex flex-col items-center gap-6 opacity-80">
                  <span className="text-[9px] text-amber-400 select-none">✦</span>
                  <span className="text-[7px] text-amber-300 font-mono select-none">●</span>
                  <span className="text-[9px] text-amber-400 select-none">✦</span>
                  <span className="text-[7px] text-amber-300 font-mono select-none">●</span>
                  <span className="text-[9px] text-amber-400 select-none">✦</span>
                </div>

                {/* Vertical Book Title Embossed on Mobile Spine */}
                <span
                  className="text-[9px] font-serif uppercase tracking-[0.3em] text-amber-300/80 font-semibold whitespace-nowrap opacity-90 select-none"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {couple.bookTitle}
                </span>

                {/* Stitched Seam Rivets Bottom */}
                <div className="flex flex-col items-center gap-6 opacity-80">
                  <span className="text-[9px] text-amber-400 select-none">✦</span>
                  <span className="text-[7px] text-amber-300 font-mono select-none">●</span>
                  <span className="text-[9px] text-amber-400 select-none">✦</span>
                </div>

                {/* Bottom Spine Gold Tooling Bar */}
                <div className="w-4 h-0.5 bg-amber-400/60 rounded-full" />

                {/* THE CONNECTION LINE: Deep binding groove + stitched seam thread */}
                <div className="absolute top-0 bottom-0 right-0 w-[2.5px] bg-gradient-to-b from-[#0e0204] via-[#24040b] to-[#0e0204] shadow-[0_0_4px_rgba(0,0,0,0.95)] z-30 flex flex-col justify-between py-1">
                  {/* Fine dashed thread line */}
                  <div className="w-full h-full border-r border-dashed border-amber-400/50" />
                </div>
              </div>

              {/* ================= 2. ACTIVE PAGE CONTAINER ================= */}
              <div
                className="relative flex-1 h-full book-page rounded-r-lg overflow-hidden flex flex-col cursor-pointer select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  if (clickX > rect.width * 0.5) {
                    handleNextPage();
                  } else {
                    handlePrevPage();
                  }
                }}
              >
                {/* 3D Gutter Curvature Shadow from the Spine Connection Line */}
                <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 bg-gradient-to-r from-black/45 via-amber-950/20 to-transparent pointer-events-none z-20" />

                {/* Subtle Top & Bottom Page Edge Shadows */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-amber-950/20 to-transparent pointer-events-none z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-amber-950/20 to-transparent pointer-events-none z-20" />

                {/* Base Page Content (revealed during flip) */}
                <div className="flex-1 h-full overflow-hidden">
                  {renderSinglePage(
                    isFlipping && flipDirection === 'next'
                      ? flippingMobilePage + 1
                      : isFlipping && flipDirection === 'prev'
                      ? flippingMobilePage
                      : mobilePage
                  )}
                </div>

                {/* ================= 3. 3D TURNING SHEET OVERLAY (WHEN FLIPPING) ================= */}
                {isFlipping && (
                  <div
                    className={`absolute inset-0 z-30 pointer-events-none ${
                      flipDirection === 'next' ? 'animate-mobile-flip-next' : 'animate-mobile-flip-prev'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                    }}
                  >
                    <div
                      className="absolute inset-0 book-page overflow-hidden rounded-r-lg"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {/* Curvature shadow on flipping sheet */}
                      <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/40 via-amber-950/15 to-transparent pointer-events-none z-20" />

                      {/* Moving light sheen across paper curl */}
                      <div className="absolute inset-0 page-curl-sheen z-20" />

                      {/* Content of the turning sheet */}
                      {renderSinglePage(
                        flipDirection === 'next' ? flippingMobilePage : flippingMobilePage - 1
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= 4. RIGHT GILDED PAPER EDGES ================= */}
              <div
                className="w-2 sm:w-2.5 h-full rounded-r-xl border-l border-amber-950/30 flex-shrink-0 z-10 select-none relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, #aa771c 20%, #fef3c7 50%, #d4af37 80%, #6e4811 100%)',
                  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.5)',
                }}
                title="Gilded Book Pages"
              >
                {/* Micro page layered lines */}
                <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(0,0,0,0.35)_2px,rgba(0,0,0,0.35)_3px)] pointer-events-none" />
              </div>
            </div>

            {/* Mobile Bottom Navigation Controls */}
            <div className="mt-4 flex items-center justify-between w-full max-w-[420px] px-2 z-20">
              <button
                onClick={handlePrevPage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-amber-500/40 text-amber-200 text-xs font-serif shadow-md active:scale-95 transition-all"
              >
                <ChevronLeft size={14} />
                <span>{mobilePage === 0 ? "Cover" : "Prev"}</span>
              </button>

              <div className="px-3.5 py-1 rounded-full bg-black/70 border border-amber-500/30 text-amber-300 text-xs font-mono">
                Page {mobilePage + 1} / 14
              </div>

              <button
                onClick={handleNextPage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-amber-500/40 text-amber-200 text-xs font-serif shadow-md active:scale-95 transition-all"
              >
                <span>{mobilePage >= 13 ? "Close Book" : "Next"}</span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={handleCloseBook}
                className="p-1.5 rounded-full bg-stone-900/80 hover:bg-rose-950 border border-amber-500/30 text-amber-200/80 active:scale-95 transition-all"
                title="Close Book"
              >
                <BookOpen size={14} />
              </button>
            </div>

            <div className="text-[10px] text-amber-300/60 font-serif italic mt-2 text-center">
              Swipe left/right or tap to turn pages • Bound at the spine
            </div>
          </div>
        ) : (
          /* ----- DESKTOP: DUAL PAGE SPREAD (Spreads 0 to 7) ----- */
          <div className="relative w-full max-w-[960px] flex flex-col items-center">
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
                    <div className="absolute inset-0 page-curl-sheen z-20 pointer-events-none" />
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
                    <div className="absolute inset-0 page-curl-sheen z-20 pointer-events-none" />
                    {flipDirection === 'next'
                      ? renderLeftPage(flippingSpread + 1)
                      : renderRightPage(flippingSpread - 1)}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Bottom Navigation Controls */}
            <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4 z-20">
              <button
                onClick={handlePrevPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md transition-all active:scale-95 text-xs font-serif"
              >
                <ChevronLeft size={15} />
                <span>{currentSpread === 0 ? "Close Book" : "Prev Spread"}</span>
              </button>

              <div className="px-4 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-mono backdrop-blur-md">
                Spread {currentSpread + 1} / {totalSpreads}
              </div>

              <button
                onClick={handleNextPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md transition-all active:scale-95 text-xs font-serif"
              >
                <span>{currentSpread >= totalSpreads - 1 ? "Close Book" : "Next Spread"}</span>
                <ChevronRight size={15} />
              </button>

              <button
                onClick={handleCloseBook}
                className="p-2 rounded-full bg-stone-900/80 hover:bg-rose-950 border border-amber-500/30 text-amber-200/80 hover:text-white backdrop-blur-md transition-all"
                title="Close Book"
              >
                <BookOpen size={15} />
              </button>
            </div>

            <div className="text-[11px] text-amber-300/60 font-serif italic mt-2">
              Click directly on the right page to turn next, or click the left page to go back
            </div>
          </div>
        )
      )}

    </div>
  );
}
