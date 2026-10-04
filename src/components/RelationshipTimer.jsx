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
      const start = new Date(startDateString || '2023-08-14').getTime();
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
    <div className="my-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-inner">
      <div className="flex items-center justify-center gap-1.5 text-xs text-rose-800 font-serif uppercase tracking-widest mb-3">
        <Heart size={14} className="fill-rose-500 text-rose-500" />
        <span>Time Loving You</span>
        <Heart size={14} className="fill-rose-500 text-rose-500" />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white/80 p-2 rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-xl sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.days}
          </div>
          <div className="text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Days</div>
        </div>

        <div className="bg-white/80 p-2 rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-xl sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.hours}
          </div>
          <div className="text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Hours</div>
        </div>

        <div className="bg-white/80 p-2 rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-xl sm:text-2xl font-bold text-amber-900 leading-tight">
            {timePassed.minutes}
          </div>
          <div className="text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Mins</div>
        </div>

        <div className="bg-white/80 p-2 rounded-xl border border-amber-200/80 shadow-sm">
          <div className="font-serif text-xl sm:text-2xl font-bold text-rose-600 leading-tight">
            {timePassed.seconds}
          </div>
          <div className="text-[10px] tracking-wider text-rose-700 uppercase font-sans font-medium">Secs</div>
        </div>
      </div>
    </div>
  );
}
