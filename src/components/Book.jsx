import React, { useEffect, useRef, useState } from 'react';
import { PageFlip } from 'page-flip';
import { 
  Heart, Sparkles, ChevronLeft, ChevronRight, Lock, Unlock, 
  MapPin, Calendar, Compass, Feather, Award, Stars, Quote
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import RelationshipTimer from './RelationshipTimer';
import InteractiveEnvelope from './InteractiveEnvelope';

export default function Book({ storyData, onPhotoClick, pageFlipRef, onPageChange }) {
  const containerRef = useRef(null);
  const [pageFlipInstance, setPageFlipInstance] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [yesClicked, setYesClicked] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let flipBook = null;

    try {
      flipBook = new PageFlip(containerRef.current, {
        width: 450,
        height: 630,
        size: 'stretch',
        minWidth: 300,
        maxWidth: 520,
        minHeight: 440,
        maxHeight: 740,
        maxShadowOpacity: 0.6,
        showCover: true,
        mobileScrollSupport: false,
        usePortrait: true,
        startPage: 0,
        drawShadow: true,
        flippingTime: 700,
        useMouseEvents: true,
        clickEventForward: true,
        swipeDistance: 30,
      });

      const pages = containerRef.current.querySelectorAll('.book-page-wrapper');
      flipBook.loadFromHTML(pages);

      flipBook.on('flip', (e) => {
        const pageNum = e.data;
        setCurrentPage(pageNum);
        if (onPageChange) onPageChange(pageNum);
        soundEngine.playPageFlip();
        if (pageNum > 0) {
          setIsBookOpen(true);
        } else {
          setIsBookOpen(false);
        }
      });

      setPageFlipInstance(flipBook);
      if (pageFlipRef) {
        pageFlipRef.current = flipBook;
      }
    } catch (err) {
      console.error("PageFlip init error:", err);
    }

    return () => {
      if (flipBook) {
        try {
          flipBook.destroy();
        } catch (e) {
          // cleanup
        }
      }
    };
  }, [storyData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!pageFlipInstance) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        pageFlipInstance.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        pageFlipInstance.flipPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageFlipInstance]);

  const handleOpenCover = () => {
    if (!pageFlipInstance) return;
    soundEngine.playSparkle();
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#e11d48', '#fda4af'],
    });
    pageFlipInstance.flipNext();
  };

  const handleYesProposal = (e) => {
    e.stopPropagation();
    setYesClicked(true);
    soundEngine.playSparkle();
    soundEngine.playHeartbeat();
    
    // Multiple confetti bursts
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#e11d48', '#d4af37'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#fb7185', '#ffe4e6', '#d4af37'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#e11d48', '#f43f5e'],
    });
  };

  const couple = storyData.couple;
  const pages = storyData.pages;

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 my-2 select-none">
      
      {/* 3D Realistic Book Perspective Container */}
      <div className="relative w-full flex items-center justify-center perspective-[2500px]">
        
        {/* Glow behind the book */}
        <div className="absolute -inset-4 bg-gradient-to-r from-rose-900/20 via-amber-600/15 to-rose-900/20 rounded-[40px] blur-2xl pointer-events-none transform -rotate-1" />

        <div
          ref={containerRef}
          className="relative shadow-book rounded-r-lg rounded-l-lg transition-transform duration-700 ease-out"
          style={{
            maxWidth: '1000px',
            minHeight: '620px',
          }}
        >
          {/* ================= PAGE 0: FRONT COVER (HARD) ================= */}
          <div className="book-page-wrapper book-cover relative flex flex-col items-center justify-between p-8 text-center text-amber-100 overflow-hidden cursor-pointer" data-density="hard">
            {/* Ornate Gold Border Corners */}
            <div className="absolute inset-4 border-2 border-amber-500/40 rounded-sm pointer-events-none" />
            <div className="absolute inset-6 border border-amber-400/20 rounded-sm pointer-events-none" />
            
            {/* Corner Ornaments */}
            <div className="absolute top-7 left-7 text-amber-400/60 font-serif text-2xl">❧</div>
            <div className="absolute top-7 right-7 text-amber-400/60 font-serif text-2xl">☙</div>
            <div className="absolute bottom-7 left-7 text-amber-400/60 font-serif text-2xl">❧</div>
            <div className="absolute bottom-7 right-7 text-amber-400/60 font-serif text-2xl">☙</div>

            {/* Spine Highlight on Left */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/60 via-amber-900/20 to-transparent pointer-events-none" />

            {/* Top Emblem */}
            <div className="mt-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-amber-400/50 flex items-center justify-center bg-amber-950/40 shadow-glow-gold">
                <Heart className="text-amber-300 fill-rose-500/60 animate-heart-beat" size={28} />
              </div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-amber-300/80 mt-3 font-sans font-medium">
                A Love Story
              </span>
            </div>

            {/* Main Gold Embossed Titles */}
            <div className="my-auto py-6">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide gold-foil-text leading-tight drop-shadow-lg">
                {couple.bookTitle}
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-4" />
              <p className="font-cursive text-3xl sm:text-4xl text-amber-200/90 font-normal">
                {couple.hisName} & {couple.herName}
              </p>
              <p className="font-serif italic text-xs sm:text-sm text-rose-200/70 mt-3 max-w-xs mx-auto">
                {couple.subtitle}
              </p>
            </div>

            {/* Golden Heart Lock to Open */}
            <div className="mb-6 flex flex-col items-center">
              <button
                onClick={handleOpenCover}
                className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-900 font-semibold text-xs tracking-wider uppercase shadow-glow-gold hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Unlock size={15} className="group-hover:rotate-12 transition-transform" />
                <span>Open Our Memories</span>
                <Sparkles size={15} />
              </button>
              <span className="text-[10px] text-amber-300/50 mt-2 font-mono">
                Click or drag the edge to turn
              </span>
            </div>
          </div>

          {/* ================= PAGE 1: DEDICATION & EX-LIBRIS (SOFT/HARD) ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            {/* Top Vintage Ex-Libris Stamp */}
            <div className="border border-amber-900/30 p-4 rounded-lg bg-amber-50/50">
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2 mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-900 font-bold">
                  Ex Libris • Memory Archive
                </span>
                <span className="text-amber-800 text-xs">№ 001</span>
              </div>
              <p className="font-serif italic text-xs text-amber-950/80">
                Belongs to the treasured memories of {couple.hisName} and {couple.herName}.
              </p>
            </div>

            {/* Dedication Body */}
            <div className="my-auto py-4 text-center">
              <div className="text-amber-700/60 font-serif text-3xl mb-2">❝</div>
              <h2 className="font-serif text-2xl text-amber-950 font-bold mb-3">
                For You, Always
              </h2>
              <p className="font-serif italic text-base sm:text-lg text-amber-900/90 leading-relaxed max-w-sm mx-auto">
                {couple.dedication}
              </p>
              <div className="w-16 h-0.5 bg-rose-400/40 mx-auto my-4" />
              <p className="font-cursive text-3xl text-rose-800">
                Yours Eternally
              </p>
            </div>

            {/* Wax Seal Graphic at bottom */}
            <div className="flex items-center justify-between text-[10px] text-amber-800/70 border-t border-amber-900/20 pt-3">
              <span>Chapter I Preview</span>
              <span>Turn to Begin ➔</span>
            </div>
          </div>

          {/* ================= PAGE 2: CHAPTER 1 (LEFT) - THE SERENDIPITY ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[0]?.chapterNumber || "01"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[0]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[0]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-4">
                {pages[0]?.tagline}
              </p>
            </div>

            {/* Polaroid 1 */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[270px]"
              style={{ transform: `rotate(${pages[0]?.photo1?.rotation || -2}deg)` }}
              onClick={() => onPhotoClick(pages[0]?.photo1)}
            >
              <div className="tape" />
              <img
                src={pages[0]?.photo1?.url}
                alt="Memory"
                className="w-full h-44 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-gray-800 mt-2 text-center">
                {pages[0]?.photo1?.caption}
              </p>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[0]?.storyLeft}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">2</div>
          </div>

          {/* ================= PAGE 3: CHAPTER 1 (RIGHT) ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The First Spark
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify mt-2">
              {pages[0]?.storyRight}
            </p>

            {/* Polaroid 2 */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[270px]"
              style={{ transform: `rotate(${pages[0]?.photo2?.rotation || 2}deg)` }}
              onClick={() => onPhotoClick(pages[0]?.photo2)}
            >
              <div className="tape" />
              <img
                src={pages[0]?.photo2?.url}
                alt="Memory"
                className="w-full h-44 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-gray-800 mt-2 text-center">
                {pages[0]?.photo2?.caption}
              </p>
            </div>

            {/* Romantic Quote Box */}
            <div className="p-3 bg-rose-50/70 border-l-2 border-rose-600 rounded-r-lg">
              <p className="font-serif italic text-xs text-rose-900 leading-snug">
                {pages[0]?.quote}
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">3</div>
          </div>

          {/* ================= PAGE 4: CHAPTER 2 (LEFT) - WANDERING TOGETHER ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[1]?.chapterNumber || "02"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[1]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[1]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-3">
                {pages[1]?.tagline}
              </p>
            </div>

            {/* Polaroid */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[270px]"
              style={{ transform: `rotate(${pages[1]?.photo1?.rotation || 2}deg)` }}
              onClick={() => onPhotoClick(pages[1]?.photo1)}
            >
              <div className="tape" />
              <img
                src={pages[1]?.photo1?.url}
                alt="Travel"
                className="w-full h-44 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-gray-800 mt-2 text-center">
                {pages[1]?.photo1?.caption}
              </p>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[1]?.storyLeft}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">4</div>
          </div>

          {/* ================= PAGE 5: CHAPTER 2 (RIGHT) - BOARDING PASS ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Boarding Pass to Forever
              </span>
            </div>

            {/* Cute Boarding Pass / Ticket Stub */}
            <div className="p-3 bg-amber-100/60 border border-dashed border-amber-900/40 rounded-lg text-xs font-mono text-amber-950 shadow-sm">
              <div className="flex justify-between items-center border-b border-dashed border-amber-900/30 pb-1 mb-2">
                <span className="font-bold">PASSENGER TICKET</span>
                <span className="text-[10px] text-rose-700 font-bold">ONE WAY • INFINITE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-amber-800/70 block">FLIGHT:</span>
                  <span className="font-bold">{pages[1]?.ticketDetails?.flight}</span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-800/70 block">SEAT:</span>
                  <span className="font-bold">{pages[1]?.ticketDetails?.seat}</span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-800/70 block">ORIGIN:</span>
                  <span className="font-semibold">{pages[1]?.ticketDetails?.from}</span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-800/70 block">DESTINATION:</span>
                  <span className="font-semibold">{pages[1]?.ticketDetails?.to}</span>
                </div>
              </div>
            </div>

            {/* Polaroid 2 */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[270px]"
              style={{ transform: `rotate(${pages[1]?.photo2?.rotation || -2}deg)` }}
              onClick={() => onPhotoClick(pages[1]?.photo2)}
            >
              <div className="tape" />
              <img
                src={pages[1]?.photo2?.url}
                alt="Adventures"
                className="w-full h-44 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-gray-800 mt-2 text-center">
                {pages[1]?.photo2?.caption}
              </p>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[1]?.storyRight}
            </p>

            <div className="text-left text-[10px] font-mono text-amber-800/50">5</div>
          </div>

          {/* ================= PAGE 6: CHAPTER 3 (LEFT) - REASONS I LOVE YOU ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[2]?.chapterNumber || "03"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[2]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[2]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-4">
                {pages[2]?.tagline}
              </p>
            </div>

            {/* Reasons List */}
            <div className="space-y-2.5 my-auto">
              {pages[2]?.reasons?.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 shadow-xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {item.id}
                  </span>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-amber-950">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-amber-900/80 leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">6</div>
          </div>

          {/* ================= PAGE 7: CHAPTER 3 (RIGHT) - HER PORTRAIT ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The Girl of My Dreams
              </span>
            </div>

            {/* Portrait Frame */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[280px]"
              style={{ transform: `rotate(${pages[2]?.photo1?.rotation || -1}deg)` }}
              onClick={() => onPhotoClick(pages[2]?.photo1)}
            >
              <div className="tape" />
              <img
                src={pages[2]?.photo1?.url}
                alt="Her Portrait"
                className="w-full h-52 object-cover rounded-sm"
              />
              <p className="font-handwriting text-lg text-rose-800 mt-2 text-center font-bold">
                {pages[2]?.photo1?.caption}
              </p>
            </div>

            {/* Sweet Quote */}
            <div className="p-3 bg-amber-100/50 border border-amber-300/60 rounded-xl text-center">
              <p className="font-handwriting text-base text-amber-900">
                "{pages[2]?.loveQuote}"
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">7</div>
          </div>

          {/* ================= PAGE 8: CHAPTER 4 (LEFT) - FILM STRIP ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[3]?.chapterNumber || "04"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[3]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[3]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-3">
                {pages[3]?.tagline}
              </p>
            </div>

            {/* 35mm Film Strip */}
            <div className="my-auto bg-[#1a1412] p-2 rounded-sm border border-amber-950 shadow-md">
              <div className="flex justify-between px-1 mb-1 text-[8px] text-amber-200/50 font-mono">
                <span>■ ■ ■ ■ ■ ■</span>
                <span>35MM FILM • MEMORIES</span>
                <span>■ ■ ■ ■ ■ ■</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pages[3]?.filmPhotos?.map((pic, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer group overflow-hidden rounded-xs"
                    onClick={() => onPhotoClick(pic)}
                  >
                    <img
                      src={pic.url}
                      alt="Candid"
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] p-1 text-center transition-opacity">
                      {pic.caption}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-1 mt-1 text-[8px] text-amber-200/50 font-mono">
                <span>■ ■ ■ ■ ■ ■</span>
                <span>KODAK LOVE 400</span>
                <span>■ ■ ■ ■ ■ ■</span>
              </div>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify">
              {pages[3]?.storyLeft}
            </p>

            <div className="text-right text-[10px] font-mono text-amber-800/50">8</div>
          </div>

          {/* ================= PAGE 9: CHAPTER 4 (RIGHT) ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Spontaneous Magic
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-amber-950/80 leading-relaxed text-justify mt-2">
              {pages[3]?.storyRight}
            </p>

            {/* Coffee Ring / Washi Tape aesthetic note */}
            <div className="my-auto p-4 bg-[#fbf6ec] border border-amber-300 rounded-lg shadow-sm relative">
              <div className="absolute -top-3 right-4 bg-rose-200/80 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
                Inside Joke #47
              </div>
              <p className="font-handwriting text-lg text-amber-950 leading-relaxed">
                “With you, even silence feels like the warmest conversation. You are the coffee to my mornings and the starlight to my nights.”
              </p>
              <div className="text-right mt-2 font-cursive text-xl text-rose-800">
                — Forever Laughing With You
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border-l-2 border-amber-500">
              <p className="text-[11px] text-amber-900/80 italic font-serif">
                “Every candid laugh caught on camera is a reminder that happiness isn't a destination; it's a person.”
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">9</div>
          </div>

          {/* ================= PAGE 10: CHAPTER 5 (LEFT) - SECRET LETTER ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[4]?.chapterNumber || "05"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[4]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[4]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-4">
                {pages[4]?.tagline}
              </p>
            </div>

            <div className="my-auto text-center space-y-4 px-4">
              <Feather size={32} className="text-amber-700/60 mx-auto" />
              <p className="font-handwriting text-xl text-amber-950 leading-relaxed">
                “There are some confessions that cannot simply be printed in black ink on paper. They must be folded with trembling fingers, sealed with hope, and given only to the one soul who holds your heartbeat.”
              </p>
              <div className="w-16 h-0.5 bg-rose-400/40 mx-auto" />
              <p className="font-serif text-xs text-rose-800/70 uppercase tracking-widest">
                Turn the page to open the wax seal
              </p>
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">10</div>
          </div>

          {/* ================= PAGE 11: CHAPTER 5 (RIGHT) - INTERACTIVE ENVELOPE ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                A Letter For You
              </span>
            </div>

            {/* Interactive 3D Unsealing Envelope */}
            <div className="my-auto">
              <InteractiveEnvelope letter={pages[4]?.letter} />
            </div>

            <p className="text-[11px] text-center text-amber-800/60 font-mono">
              Written with love by {couple.hisName}
            </p>

            <div className="text-left text-[10px] font-mono text-amber-800/50">11</div>
          </div>

          {/* ================= PAGE 12: CHAPTER 6 (LEFT) - RELATIONSHIP TIMER ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[5]?.chapterNumber || "06"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[5]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[5]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-2">
                {pages[5]?.tagline}
              </p>
            </div>

            {/* Live Relationship Counter Component */}
            <RelationshipTimer startDateString={couple.anniversaryDate} />

            {/* Milestones */}
            <div className="space-y-2 mt-2">
              {pages[5]?.milestones?.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-amber-100/40 rounded-lg text-xs">
                  <span className="font-mono font-bold text-rose-800 shrink-0">{m.date}</span>
                  <div className="border-l border-amber-300 pl-2">
                    <span className="font-serif font-bold text-amber-950 block">{m.title}</span>
                    <span className="text-[10px] text-amber-900/70">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">12</div>
          </div>

          {/* ================= PAGE 13: CHAPTER 6 (RIGHT) - PORTRAIT ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                Every Second With You
              </span>
            </div>

            {/* Polaroid */}
            <div
              className="polaroid my-auto cursor-pointer mx-auto max-w-[280px]"
              style={{ transform: `rotate(${pages[5]?.photo1?.rotation || 1}deg)` }}
              onClick={() => onPhotoClick(pages[5]?.photo1)}
            >
              <div className="tape" />
              <img
                src={pages[5]?.photo1?.url}
                alt="Milestone"
                className="w-full h-52 object-cover rounded-sm"
              />
              <p className="font-handwriting text-base text-gray-800 mt-2 text-center font-bold">
                {pages[5]?.photo1?.caption}
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border-l-2 border-rose-600 rounded-r-lg">
              <p className="font-serif italic text-xs text-rose-900 leading-relaxed">
                “Time doesn't stop for anyone, but whenever I hold your hand, I swear eternity fits into a single breath.”
              </p>
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">13</div>
          </div>

          {/* ================= PAGE 14: CHAPTER 7 (LEFT) - SACRED PROMISES ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between" data-density="soft">
            <div>
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-2">
                <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                  Chapter {pages[6]?.chapterNumber || "07"}
                </span>
                <span className="text-xs font-mono text-amber-800/80">
                  {pages[6]?.date}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-amber-950 font-bold mt-3">
                {pages[6]?.chapterTitle}
              </h3>
              <p className="font-serif italic text-xs text-rose-700/80 mb-4">
                {pages[6]?.tagline}
              </p>
            </div>

            {/* Vows / Promises */}
            <div className="space-y-3 my-auto">
              {pages[6]?.promises?.map((promise, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 shadow-xs"
                >
                  <Heart size={16} className="text-rose-600 fill-rose-500 shrink-0 mt-0.5" />
                  <p className="font-serif text-xs sm:text-sm text-amber-950 leading-relaxed">
                    {promise}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-right text-[10px] font-mono text-amber-800/50">14</div>
          </div>

          {/* ================= PAGE 15: CHAPTER 7 (RIGHT) - FINALE PROPOSAL ================= */}
          <div className="book-page-wrapper book-page page-left p-8 flex flex-col justify-between text-center" data-density="soft">
            <div className="text-right border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-rose-800">
                The Question of Forever
              </span>
            </div>

            <div className="my-auto py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-400 mx-auto flex items-center justify-center shadow-lg">
                <Heart size={30} className="fill-rose-600 text-rose-600 animate-heart-beat" />
              </div>

              <h4 className="font-serif text-2xl sm:text-3xl text-amber-950 font-bold leading-tight">
                {pages[6]?.finalQuestion}
              </h4>

              <p className="font-serif italic text-xs sm:text-sm text-amber-900/80 max-w-xs mx-auto">
                {pages[6]?.finalQuote}
              </p>

              {/* Interactive Yes Button */}
              <div className="pt-2">
                <button
                  onClick={handleYesProposal}
                  className={`px-8 py-3 rounded-full font-serif text-sm font-bold uppercase tracking-wider transition-all duration-300 transform shadow-lg ${
                    yesClicked
                      ? 'bg-rose-600 text-white scale-105 shadow-glow-rose'
                      : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-white hover:scale-105 active:scale-95 shadow-glow-gold'
                  }`}
                >
                  {yesClicked ? "Forever & Always ❤️" : "Yes, My Love! ❤️"}
                </button>
              </div>

              {yesClicked && (
                <p className="font-handwriting text-2xl text-rose-700 animate-bounce pt-2 font-bold">
                  Here's to a lifetime of love and adventure! ✨
                </p>
              )}
            </div>

            <div className="text-left text-[10px] font-mono text-amber-800/50">15</div>
          </div>

          {/* ================= PAGE 16: INSIDE BACK COVER (HARD) ================= */}
          <div className="book-page-wrapper book-page page-right p-8 flex flex-col justify-between text-center" data-density="hard">
            <div className="border-b border-amber-900/20 pb-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-900">
                To Be Continued...
              </span>
            </div>

            <div className="my-auto py-8">
              <div className="font-cursive text-5xl text-rose-900 font-bold mb-4">
                {couple.hisName[0]} & {couple.herName[0]}
              </div>
              <p className="font-serif italic text-base text-amber-950 leading-relaxed max-w-xs mx-auto">
                “Every love story is beautiful, but ours is my favorite.”
              </p>
              <div className="w-16 h-0.5 bg-amber-400/50 mx-auto my-4" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-800/70">
                Written with all my heart
              </p>
            </div>

            <div className="border-t border-amber-900/20 pt-2 flex justify-between items-center text-xs text-amber-900">
              <span>End of Volume I</span>
              <button
                onClick={() => pageFlipInstance?.flip(0)}
                className="underline hover:text-rose-700 cursor-pointer"
              >
                Return to Cover ↺
              </button>
            </div>
          </div>

          {/* ================= PAGE 17: BACK COVER (HARD) ================= */}
          <div className="book-page-wrapper book-cover relative flex flex-col items-center justify-center p-8 text-center text-amber-100 overflow-hidden cursor-pointer" data-density="hard">
            <div className="absolute inset-4 border-2 border-amber-500/40 rounded-sm pointer-events-none" />
            <div className="absolute inset-6 border border-amber-400/20 rounded-sm pointer-events-none" />
            
            {/* Spine Highlight on Right */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/60 via-amber-900/20 to-transparent pointer-events-none" />

            <div className="w-20 h-20 rounded-full border border-amber-400/50 flex items-center justify-center bg-amber-950/40 shadow-glow-gold mb-6">
              <Heart className="text-amber-300 fill-rose-500/60" size={32} />
            </div>

            <h3 className="font-serif text-3xl font-bold tracking-wide gold-foil-text mb-2">
              The Story Continues
            </h3>
            <p className="font-cursive text-2xl text-amber-200/90 mb-4">
              Forever & Always
            </p>

            <button
              onClick={() => pageFlipInstance?.flip(0)}
              className="mt-6 px-5 py-2 rounded-full border border-amber-400/50 bg-stone-900/80 hover:bg-rose-950 text-amber-200 text-xs font-serif tracking-wider transition-all"
            >
              Close & Read Again
            </button>
          </div>

        </div>
      </div>

      {/* Floating Bottom Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-4 z-20">
        <button
          onClick={() => pageFlipInstance?.flipPrev()}
          disabled={currentPage === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
            currentPage === 0
              ? 'opacity-40 border-stone-700 text-stone-500 cursor-not-allowed'
              : 'bg-rose-950/70 hover:bg-rose-900 border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md'
          }`}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-serif font-medium hidden sm:inline">Prev Page</span>
        </button>

        {/* Page Indicator */}
        <div className="px-4 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-mono backdrop-blur-md">
          {currentPage === 0 ? "Cover" : currentPage >= 16 ? "Back Cover" : `Page ${currentPage} / 17`}
        </div>

        <button
          onClick={() => pageFlipInstance?.flipNext()}
          disabled={currentPage >= 17}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
            currentPage >= 17
              ? 'opacity-40 border-stone-700 text-stone-500 cursor-not-allowed'
              : 'bg-rose-950/70 hover:bg-rose-900 border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-md backdrop-blur-md'
          }`}
          title="Next Page"
        >
          <span className="text-xs font-serif font-medium hidden sm:inline">Next Page</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}
