import React from 'react';

export function FloralDivider({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-4 ${className}`} style={style}>
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-[#C5A059]" />
      <svg
        className="w-5 h-5 text-[#C5A059]"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C12.5 5 14.5 7 17.5 7.5C14.5 8 12.5 10 12 13C11.5 10 9.5 8 6.5 7.5C9.5 7 11.5 5 12 2Z" opacity="0.9" />
        <path d="M12 11C12.3 13 13.5 14.2 15.5 14.5C13.5 14.8 12.3 16 12 18C11.7 16 10.5 14.8 8.5 14.5C10.5 14.2 11.7 13 12 11Z" opacity="0.6" />
        <circle cx="12" cy="7.5" r="1" />
        <circle cx="12" cy="14.5" r="0.75" />
      </svg>
      <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#C5A059]/40 to-[#C5A059]" />
    </div>
  );
}

export function FloralCorner({ position = 'top-left', style }: { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; style?: React.CSSProperties }) {
  const rotationClass = {
    'top-left': '',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }[position];

  return (
    <div className={`w-8 h-8 pointer-events-none text-[#C5A059]/40 ${rotationClass}`} style={style}>
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 38 V 10 C 2 5.58 5.58 2 10 2 H 38" />
        <path d="M7 38 V 14 C 7 10.13 10.13 7 14 7 H 38" strokeWidth="0.8" strokeDasharray="2 2" />
        <circle cx="14" cy="14" r="2.5" fill="currentColor" fillOpacity="0.4" />
        <path d="M14 14 C 18 10 24 10 28 14" strokeWidth="0.75" />
        <path d="M14 14 C 10 18 10 24 14 28" strokeWidth="0.75" />
      </svg>
    </div>
  );
}

export function MemorialCross({ className = 'w-5 h-5 text-[#8C733E]', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2H13V7H18V9H13V22H11V9H6V7H11V2Z" />
    </svg>
  );
}

export function OliveSprig({ className = 'w-6 h-6 text-[#C5A059]', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M6 26 C 12 20 20 12 26 6" />
      <path d="M12 20 C 10 16 13 13 16 15 C 15 18 13 20 12 20 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M18 14 C 16 10 19 7 22 9 C 21 12 19 14 18 14 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M20 18 C 24 17 26 20 24 22 C 21 22 20 20 20 18 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 24 C 18 23 20 26 18 28 C 15 28 14 26 14 24 Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}
