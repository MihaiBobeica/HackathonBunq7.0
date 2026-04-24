import { useEffect, useState } from 'react';
import { Phone, AudioLines } from 'lucide-react';

export default function DynamicIsland({ isActive }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) {
      const reset = setTimeout(() => setSeconds(0), 0);
      return () => clearTimeout(reset);
    }
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-50 bg-black flex items-center justify-between overflow-hidden"
      style={{
        top: 5,
        borderRadius: 999,
        width: isActive ? 150 : 90,
        height: isActive ? 32 : 24,
        transition: 'width 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div
        className="flex items-center justify-between w-full px-2.5"
        style={{
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.2s ease',
          transitionDelay: isActive ? '0.2s' : '0s',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Green phone icon */}
        <div className="w-5 h-5 rounded-full bg-emerald-500 grid place-items-center shrink-0">
          <Phone className="w-2.5 h-2.5 text-white fill-white" />
        </div>

        {/* Call duration */}
        <span className="text-emerald-400 text-[11px] font-black tabular-nums tracking-tight">
          {mm}:{ss}
        </span>

        {/* Audio-wave icon */}
        <AudioLines className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      </div>
    </div>
  );
}
