import React, { useState } from 'react';
import { Bookmark, List, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function BookmarkNav({ onJumpToPage, currentPage, totalPages }) {
  const [isOpen, setIsOpen] = useState(false);

  const chapters = [
    { title: "Front Cover", page: 0 },
    { title: "Dedication & Prologue", page: 1 },
    { title: "Ch 1: The Serendipity", page: 2 },
    { title: "Ch 2: Wandering Together", page: 4 },
    { title: "Ch 3: Reasons I Love You", page: 6 },
    { title: "Ch 4: Unfiltered Smiles", page: 8 },
    { title: "Ch 5: Secret Love Letter", page: 10 },
    { title: "Ch 6: Our Journey In Time", page: 12 },
    { title: "Ch 7: Forever & Always", page: 14 },
    { title: "Back Cover", page: 16 },
  ];

  const handleSelect = (pageIndex) => {
    soundEngine.playPageFlip();
    onJumpToPage(pageIndex);
    setIsOpen(false);
  };

  return (
    <div className="relative z-30">
      {/* Floating Silk Ribbon Bookmark */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/70 border border-amber-500/40 text-amber-200 hover:text-amber-100 hover:border-amber-400 backdrop-blur-md shadow-lg transition-all duration-300"
        title="Chapters & Table of Contents"
      >
        <Bookmark size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-serif font-medium tracking-wide">Chapters</span>
      </button>

      {/* Chapters Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-[#1b1424] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden z-40 py-2 animate-fadeIn backdrop-blur-lg">
            <div className="px-4 py-2 border-b border-rose-900/40 flex items-center justify-between text-xs text-amber-300/80 font-serif">
              <span>Table of Contents</span>
              <span className="font-mono text-[10px]">p. {currentPage + 1}/{totalPages}</span>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {chapters.map((ch, idx) => {
                const isActive = currentPage === ch.page || currentPage === ch.page + 1;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(ch.page)}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-rose-900/50 text-amber-300 font-semibold'
                        : 'text-rose-100/80 hover:bg-rose-950/40 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{ch.title}</span>
                    <ChevronRight size={13} className="text-amber-400/60 ml-2 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
