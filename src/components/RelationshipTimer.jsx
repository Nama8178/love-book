import React, { useState, useEffect } from 'react';
import { Heart, Clock, Sparkles } from 'lucide-react';

export default function RelationshipTimer({ startDateString }) {
  const [timePassed, setTimePassed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      let dateInput = startDateString || '2024-12-25';
      if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateInput)) {
        const parts = dateInput.split(/[-/]/);
        dateInput = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      const parsedTime = new Date(dateInput).getTime();
      const start = isNaN(parsedTime) ? new Date('2024-12-25').getTime() : parsedTime;
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimePassed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateString]);

  return (
    <div className="my-2 sm:my-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-inner">
      <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-rose-800 font-serif uppercase tracking-widest mb-2 sm:mb-3">
        <Heart size={13} className="fill-rose-500 text-rose-500" />
        <span>Time Loving You</span>
        <Heart size={13} className="fill-rose-500 text-rose-500" />
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
        <div className="bg-white/80 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-lg sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.days}
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Days</div>
        </div>

        <div className="bg-white/80 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-lg sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.hours}
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Hours</div>
        </div>

        <div className="bg-white/80 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-lg sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.minutes}
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Mins</div>
        </div>

        <div className="bg-white/80 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-lg sm:text-2xl font-bold text-rose-600 leading-tight">
            {timePassed.seconds}
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Secs</div>
        </div>
      </div>
    </div>
  );
}
