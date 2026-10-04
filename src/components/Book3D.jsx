import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, ChevronLeft, ChevronRight, Unlock, Lock,
  BookOpen, Feather, Calendar, MapPin, Compass, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import RelationshipTimer from './RelationshipTimer';
import InteractiveEnvelope from './InteractiveEnvelope';

export default function Book3D({ storyData, onPhotoClick, bookControlRef, onPageChange }) {
  // bookState: 'closed' | 'open'
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
      // At the end, clicking right page closes book
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
      // If on first spread and clicking left, close the book
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

  // Jump to specific spread/page
  const handleJumpTo = (spreadIdx) => {
    if (isFlipping) return;
    if (!isOpen) setIsOpen(true);
    soundEngine.playPageFlip();
    setCurrentSpread(Math.max(0, Math.min(totalSpreads - 1, spreadIdx)));
    if (onPageChange) onPageChange(spreadIdx * 2 + 1);
  };

  // Expose controls to ref
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

  // ================= RENDER SPREAD CONTENT HELPERS =================
  const renderLeftPage = (spreadIndex) => {
    switch (spreadIndex) {
      case 0:
        // Inside Front Cover / Dedication
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="border border-amber-900/30 p-3 sm:p-4 rounded-lg bg-amber-50/50">
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2 mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-900 font-bold">
                  Ex Libris • Memory Archive
                </span>
                <span className="text-amber-800 text-xs font-mono">№ 001</span>
              </div>
              <p className="font-serif italic text-xs text-amber-950/80">
                Belongs to the treasured memories of {couple.hisName} & {couple.herName}.
              </p>
            </div>

            <div className="my-auto py-3 text-center">
              <div className="text-amber-700/60 font-serif text-3xl mb-1">❝</div>
              <h2 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mb-2">
                For You, Always
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-amber-900/90 leading-relaxed max-w-sm mx-auto">
                {couple.dedication}
              </p>
              <div className="w-16 h-0.5 bg-rose-400/40 mx-auto my-3" />
              <p className="font-cursive text-2xl sm:text-3xl text-rose-800">
                Yours Eternally
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-800/70 border-t border-amber-900/20 pt-2 font-mono">
              <span>Chapter I • The Beginning</span>
              <span>Page 1</span>
            </div>
          </div>
        );

      case 1:
        // Chapter 1 (Continuation / Story Left)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The First Spark
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify mt-2">
              {pages[0]?.storyRight}
            </p>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[250px]"
              style={{ transform: `rotate(${pages[0]?.photo2?.rotation || 2}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[0]?.photo2); }}
            >
              <div className="tape" />
              <img
                src={pages[0]?.photo2?.url}
                alt="Memory"
                className="w-full h-36 sm:h-40 object-cover rounded-sm"
              />
              <p className="font-handwriting text-sm text-gray-800 mt-2 text-center">
                {pages[0]?.photo2?.caption}
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border-l-2 border-rose-600 rounded-r-lg">
              <p className="font-serif italic text-xs text-rose-900 leading-snug">
                {pages[0]?.quote}
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 3</div>
          </div>
        );

      case 2:
        // Chapter 2 (Under the Stars / Travel story)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Under The Same Sky
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify mt-2">
              {pages[1]?.storyRight}
            </p>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[250px]"
              style={{ transform: `rotate(${pages[1]?.photo2?.rotation || -2}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[1]?.photo2); }}
            >
              <div className="tape" />
              <img
                src={pages[1]?.photo2?.url}
                alt="Adventures"
                className="w-full h-36 sm:h-40 object-cover rounded-sm"
              />
              <p className="font-handwriting text-sm text-gray-800 mt-2 text-center">
                {pages[1]?.photo2?.caption}
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border-l-2 border-amber-500">
              <p className="text-[11px] text-amber-900/80 italic font-serif">
                “Every mile shared with you became a golden memory etched forever.”
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 5</div>
          </div>
        );

      case 3:
        // Chapter 3 (Her Portrait)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The Girl of My Dreams
              </span>
            </div>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[260px]"
              style={{ transform: `rotate(${pages[2]?.photo1?.rotation || -1}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[2]?.photo1); }}
            >
              <div className="tape" />
              <img
                src={pages[2]?.photo1?.url}
                alt="Her Portrait"
                className="w-full h-44 sm:h-48 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-rose-800 mt-2 text-center font-bold">
                {pages[2]?.photo1?.caption}
              </p>
            </div>

            <div className="p-3 bg-amber-100/50 border border-amber-300/60 rounded-xl text-center">
              <p className="font-handwriting text-sm sm:text-base text-amber-900">
                "{pages[2]?.loveQuote}"
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 7</div>
          </div>
        );

      case 4:
        // Chapter 4 (Spontaneous Magic / Inside Joke)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Spontaneous Magic
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify mt-2">
              {pages[3]?.storyRight}
            </p>

            <div className="my-auto p-4 bg-[#fbf6ec] border border-amber-300 rounded-lg shadow-sm relative">
              <div className="absolute -top-3 right-4 bg-rose-200/90 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
                Inside Joke #47
              </div>
              <p className="font-handwriting text-base sm:text-lg text-amber-950 leading-relaxed">
                “With you, even silence feels like the warmest conversation. You are the coffee to my mornings and the starlight to my nights.”
              </p>
              <div className="text-right mt-2 font-cursive text-xl text-rose-800">
                — Forever Laughing With You
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/60 rounded-lg border-l-2 border-amber-500">
              <p className="text-[11px] text-amber-900/80 italic font-serif">
                “Happiness isn't a destination; it's you laughing right beside me.”
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 9</div>
          </div>
        );

      case 5:
        // Chapter 5 (Poem before secret letter)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Chapter 05
              </span>
              <span className="text-xs font-mono text-amber-800/80">
                {pages[4]?.date}
              </span>
            </div>

            <div className="my-auto text-center space-y-4 px-3">
              <Feather size={32} className="text-amber-700/60 mx-auto" />
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold">
                {pages[4]?.chapterTitle}
              </h3>
              <p className="font-handwriting text-base sm:text-lg text-amber-950 leading-relaxed">
                “There are some confessions that cannot simply be printed in black ink on paper. They must be folded with trembling fingers, sealed with hope, and given only to the one soul who holds your heartbeat.”
              </p>
              <div className="w-16 h-0.5 bg-rose-400/40 mx-auto" />
              <p className="font-serif text-xs text-rose-800/70 uppercase tracking-widest">
                Tap the wax seal on the right page ➔
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 11</div>
          </div>
        );

      case 6:
        // Chapter 6 (Live Relationship Timer)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 06
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[5]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[5]?.chapterTitle}
              </h3>
            </div>

            <RelationshipTimer startDateString={couple.anniversaryDate} />

            <div className="space-y-1.5 my-auto">
              {pages[5]?.milestones?.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 bg-amber-100/50 rounded-lg text-xs">
                  <span className="font-mono font-bold text-rose-800 shrink-0 text-[11px]">{m.date}</span>
                  <div className="border-l border-amber-300 pl-2">
                    <span className="font-serif font-bold text-amber-950 block text-[11px]">{m.title}</span>
                    <span className="text-[10px] text-amber-900/70">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 13</div>
          </div>
        );

      case 7:
        // Chapter 7 (Sacred Promises)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 07
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[6]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[6]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-2">
                {pages[6]?.tagline}
              </p>
            </div>

            <div className="space-y-2.5 my-auto">
              {pages[6]?.promises?.map((promise, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 shadow-xs"
                >
                  <Heart size={14} className="text-rose-600 fill-rose-500 shrink-0 mt-0.5" />
                  <p className="font-serif text-xs text-amber-950 leading-relaxed">
                    {promise}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">Page 15</div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderRightPage = (spreadIndex) => {
    switch (spreadIndex) {
      case 0:
        // Chapter 1 (The Serendipity / Photo 1)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 01
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[0]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[0]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-3">
                {pages[0]?.tagline}
              </p>
            </div>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[250px]"
              style={{ transform: `rotate(${pages[0]?.photo1?.rotation || -2}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[0]?.photo1); }}
            >
              <div className="tape" />
              <img
                src={pages[0]?.photo1?.url}
                alt="Memory"
                className="w-full h-36 sm:h-40 object-cover rounded-sm"
              />
              <p className="font-handwriting text-sm text-gray-800 mt-2 text-center">
                {pages[0]?.photo1?.caption}
              </p>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[0]?.storyLeft}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 2</div>
          </div>
        );

      case 1:
        // Chapter 2 (Wandering Together / Boarding Pass)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 02
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[1]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[1]?.chapterTitle}
              </h3>
            </div>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[250px]"
              style={{ transform: `rotate(${pages[1]?.photo1?.rotation || 2}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[1]?.photo1); }}
            >
              <div className="tape" />
              <img
                src={pages[1]?.photo1?.url}
                alt="Travel"
                className="w-full h-36 sm:h-40 object-cover rounded-sm"
              />
              <p className="font-handwriting text-sm text-gray-800 mt-2 text-center">
                {pages[1]?.photo1?.caption}
              </p>
            </div>

            {/* Boarding Pass Stub */}
            <div className="p-2.5 bg-amber-100/70 border border-dashed border-amber-900/40 rounded-lg text-xs font-mono text-amber-950 shadow-xs">
              <div className="flex justify-between items-center border-b border-dashed border-amber-900/30 pb-1 mb-1.5 text-[10px]">
                <span className="font-bold">PASSENGER TICKET</span>
                <span className="text-rose-700 font-bold">LOVE-777</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>DESTINATION: <b>Wherever You Are</b></span>
                <span>SEAT: <b>Beside You</b></span>
              </div>
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 4</div>
          </div>
        );

      case 2:
        // Chapter 3 (Reasons My Heart Chose You)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 03
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[2]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[2]?.chapterTitle}
              </h3>
            </div>

            <div className="space-y-2 my-auto">
              {pages[2]?.reasons?.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 shadow-xs flex items-start gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {item.id}
                  </span>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-amber-950">
                      {item.title}
                    </h5>
                    <p className="text-[10px] text-amber-900/80 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 6</div>
          </div>
        );

      case 3:
        // Chapter 4 (Film Strip & Candid moments)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter 04
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[3]?.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold mt-2">
                {pages[3]?.chapterTitle}
              </h3>
            </div>

            <div className="my-auto bg-[#1a1412] p-2 rounded-sm border border-amber-950 shadow-md">
              <div className="flex justify-between px-1 mb-1 text-[8px] text-amber-200/50 font-mono">
                <span>■ ■ ■ ■</span>
                <span>KODAK LOVE 400</span>
                <span>■ ■ ■ ■</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {pages[3]?.filmPhotos?.map((pic, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer group overflow-hidden rounded-xs"
                    onClick={(e) => { e.stopPropagation(); onPhotoClick(pic); }}
                  >
                    <img
                      src={pic.url}
                      alt="Candid"
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[3]?.storyLeft}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 8</div>
          </div>
        );

      case 4:
        // Chapter 5 (The Secret Love Letter Envelope!)
        return (
          <div className="h-full flex flex-col justify-between p-5 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                A Letter For You
              </span>
            </div>

            <div className="my-auto">
              <InteractiveEnvelope letter={pages[4]?.letter} />
            </div>

            <p className="text-[11px] text-center text-amber-800/60 font-mono">
              Written with all my heart by {couple.hisName}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 10</div>
          </div>
        );

      case 5:
        // Chapter 6 (Portrait & Memory)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Every Second With You
              </span>
            </div>

            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[260px]"
              style={{ transform: `rotate(${pages[5]?.photo1?.rotation || 1}deg)` }}
              onClick={(e) => { e.stopPropagation(); onPhotoClick(pages[5]?.photo1); }}
            >
              <div className="tape" />
              <img
                src={pages[5]?.photo1?.url}
                alt="Milestone"
                className="w-full h-44 sm:h-48 object-cover rounded-sm"
              />
              <p className="font-handwriting text-sm text-gray-800 mt-2 text-center font-bold">
                {pages[5]?.photo1?.caption}
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border-l-2 border-rose-600 rounded-r-lg">
              <p className="font-serif italic text-xs text-rose-900 leading-relaxed">
                “Time doesn't stop for anyone, but whenever I hold your hand, I swear eternity fits into a single breath.”
              </p>
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">Page 12</div>
          </div>
        );

      case 6:
        // Chapter 7 (Proposal / Will You Make Forever Memories With Me?)
        return (
          <div className="h-full flex flex-col justify-between p-6 sm:p-8 text-center">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The Question of Forever
              </span>
            </div>

            <div className="my-auto py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-100 border-2 border-rose-400 mx-auto flex items-center justify-center shadow-md">
                <Heart size={26} className="fill-rose-600 text-rose-600 animate-heart-beat" />
              </div>

              <h4 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold leading-tight">
                {pages[6]?.finalQuestion}
              </h4>

              <p className="font-serif italic text-xs text-amber-900/80 max-w-xs mx-auto">
                {pages[6]?.finalQuote}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleYesProposal}
                  className={`px-6 py-2.5 rounded-full font-serif text-xs font-bold uppercase tracking-wider transition-all duration-300 transform shadow-md ${
                    yesClicked
                      ? 'bg-rose-600 text-white scale-105 shadow-glow-rose'
                      : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white hover:scale-105 active:scale-95 shadow-glow-gold'
                  }`}
                >
                  {yesClicked ? "Forever & Always ❤️" : "Yes, My Love! ❤️"}
                </button>
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
              <div className="w-16 h-0.5 bg-amber-400/50 mx-auto my-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-800/70">
                Written with all my heart
              </p>
            </div>

            <div className="border-t border-amber-900/20 pt-2 flex justify-between items-center text-xs text-amber-900">
              <span>End of Volume I</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleCloseBook(); }}
                className="underline hover:text-rose-700 cursor-pointer font-serif"
              >
                Close Book ↺
              </button>
            </div>
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

              {/* Click to Open Lock Button */}
              <div className="mb-4 flex flex-col items-center">
                <div className="group/btn flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-glow-gold group-hover:scale-105 transition-all duration-300">
                  <Unlock size={15} className="group-hover/btn:rotate-12 transition-transform" />
                  <span>Click to Open Book</span>
                  <Sparkles size={15} />
                </div>
                <span className="text-[10px] text-amber-300/60 mt-2 font-mono animate-pulse">
                  ✨ Tap anywhere to open our memories ✨
                </span>
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
              {/* Subtle hover curl hint icon */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-75 transition-opacity text-amber-800/60 font-mono text-[11px] flex items-center gap-1 z-20">
                <ChevronLeft size={14} />
                <span>{currentSpread === 0 ? "Close" : "Prev Page"}</span>
              </div>

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
              {/* Subtle hover curl hint icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-75 transition-opacity text-amber-800/60 font-mono text-[11px] flex items-center gap-1 z-20">
                <span>{currentSpread >= totalSpreads - 1 ? "Close" : "Next Page"}</span>
                <ChevronRight size={14} />
              </div>

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

          {/* ================= OPEN BOOK BOTTOM CONTROLS ================= */}
          <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4 z-20">
            {/* Prev Page Button */}
            <button
              onClick={handlePrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-950/70 hover:bg-rose-900 border border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md transition-all active:scale-95 text-xs font-serif"
              title="Previous Page (or click left page)"
            >
              <ChevronLeft size={15} />
              <span>{currentSpread === 0 ? "Close Book" : "Prev Page"}</span>
            </button>

            {/* Spread Indicator */}
            <div className="px-4 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-mono backdrop-blur-md">
              Spread {currentSpread + 1} / {totalSpreads}
            </div>

            {/* Next Page Button */}
            <button
              onClick={handleNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-950/70 hover:bg-rose-900 border border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md transition-all active:scale-95 text-xs font-serif"
              title="Next Page (or click right page)"
            >
              <span>{currentSpread >= totalSpreads - 1 ? "Close Book" : "Next Page"}</span>
              <ChevronRight size={15} />
            </button>

            {/* Close Book Button */}
            <button
              onClick={handleCloseBook}
              className="p-2 rounded-full bg-stone-900/80 hover:bg-rose-950 border border-amber-500/30 text-amber-200/80 hover:text-white backdrop-blur-md transition-all"
              title="Close Book"
            >
              <BookOpen size={15} />
            </button>
          </div>

          {/* Helpful Navigation Hint */}
          <div className="text-[11px] text-amber-300/60 font-serif italic mt-2 animate-pulse">
            Tip: Click directly on the right page to turn next, or click the left page to go back
          </div>

        </div>
      )}

    </div>
  );
}
