import React from 'react';

// LOW ENERGY CAT (PANCAKE CAT)
export const LowEnergyCat: React.FC = () => (
  <svg 
    viewBox="0 0 160 110" 
    className="w-full h-20 select-none" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hand-drawn "0%" text */}
    <g stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {/* '0' */}
      <path d="M74 27 C74 20, 79 19, 81 25 C83 31, 79 32, 75 27 Z" />
      {/* '%' slash */}
      <path d="M85 31 L93 17" />
      {/* '%' top dot */}
      <circle cx="83" cy="19" r="1.5" fill="#000000" />
      {/* '%' bottom dot */}
      <circle cx="94" cy="29" r="1.5" fill="#000000" />
    </g>

    {/* Sleepy Flat Cat Outline */}
    <path 
      d="M25 76 C17 76, 16 68, 23 66 C32 63, 48 53, 74 53 C90 53, 102 51, 112 55 C121 58, 125 64, 125 71 C125 76, 121 77, 114 77 C90 78, 45 77, 25 76 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Left back paw sticking out loosely */}
    <path 
      d="M17 72 C12 73, 11 76, 15 76 C19 76, 19 74, 18 72" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Front paw resting under cheek */}
    <path 
      d="M106 76 C103 76, 101 78, 102 80 C103 82, 108 81, 109 78" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
    />

    {/* Sleepy Ears */}
    {/* Left Ear */}
    <path 
      d="M92 53 C88 43, 95 45, 99 53" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Right Ear */}
    <path 
      d="M109 54 C114 43, 119 45, 119 55" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Tired sleepy eyes with bags */}
    {/* Left eye */}
    <path 
      d="M94 62 L102 62" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    <path 
      d="M95 65 L101 65" 
      stroke="#000000" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    {/* Right eye */}
    <path 
      d="M111 62 L119 62" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    <path 
      d="M112 65 L118 65" 
      stroke="#000000" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />

    {/* Downward sad mouth */}
    <path 
      d="M105 69 Q107 72, 109 69" 
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
  </svg>
);

// STEADY CAT
export const SteadyCat: React.FC = () => (
  <svg 
    viewBox="0 0 160 110" 
    className="w-full h-20 select-none" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Symmetrical Sitting Cat Body */}
    <path 
      d="M52 78 C44 78, 43 70, 52 67 C56 58, 56 46, 64 43 C68 40, 92 40, 96 43 C104 46, 104 58, 108 67 C117 70, 116 78, 108 78 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Tabby stripes on head */}
    <path d="M76 43 L76 49" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M80 43 L80 50" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M84 43 L84 49" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

    {/* Pointed Ears */}
    {/* Left Ear */}
    <path 
      d="M62 43 L54 30 L69 37 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Right Ear */}
    <path 
      d="M98 43 L106 30 L91 37 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Cozy Over-Ear Headphones */}
    {/* Headband */}
    <path 
      d="M58 35 C58 19, 102 19, 102 35" 
      stroke="#475569" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    {/* Left Cup */}
    <rect 
      x="49" 
      y="33" 
      width="10" 
      height="18" 
      rx="5" 
      fill="#334155" 
      stroke="#000000" 
      strokeWidth="3" 
    />
    {/* Right Cup */}
    <rect 
      x="101" 
      y="33" 
      width="10" 
      height="18" 
      rx="5" 
      fill="#334155" 
      stroke="#000000" 
      strokeWidth="3" 
    />

    {/* Symmetrical Happy Closed Eyes */}
    <path 
      d="M66 54 C68 51, 72 51, 74 54" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    <path 
      d="M86 54 C88 51, 92 51, 94 54" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />

    {/* Symmetrical cute little mouth */}
    <path 
      d="M77 60 Q80 62, 83 60" 
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />

    {/* Arms holding scales */}
    {/* Left Arm */}
    <path 
      d="M54 64 C46 62, 43 65, 41 65" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Right Arm */}
    <path 
      d="M106 64 C114 62, 117 65, 119 65" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Hanging Balanced Scales */}
    {/* Left Scale */}
    <path d="M41 65 L41 74" stroke="#000000" strokeWidth="2" />
    <path d="M33 74 L49 74" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M35 74 C35 80, 47 80, 47 74" stroke="#000000" strokeWidth="2" fill="none" />

    {/* Right Scale */}
    <path d="M119 65 L119 74" stroke="#000000" strokeWidth="2" />
    <path d="M111 74 L127 74" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M113 74 C113 80, 125 80, 125 74" stroke="#000000" strokeWidth="2" fill="none" />

    {/* Crossed Legs bottom detail */}
    <path d="M71 78 Q80 75, 90 78" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// RESTLESS CAT
export const RestlessCat: React.FC = () => (
  <svg 
    viewBox="0 0 160 110" 
    className="w-full h-20 select-none" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chaotic scribble / stress cloud halo on top left & right */}
    <path 
      d="M32 28 Q37 18, 45 22 Q53 26, 45 14 Q53 10, 59 18" 
      stroke="#000000" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M102 22 Q108 30, 115 25 Q122 20, 113 14 Q120 10, 110 12" 
      stroke="#000000" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Pop-vein / anger cross symbol */}
    <g stroke="#000000" strokeWidth="2" strokeLinecap="round">
      <path d="M96 16 L102 22" />
      <path d="M102 16 L96 22" />
      <path d="M99 14 L99 24" />
      <path d="M94 19 L104 19" />
    </g>

    {/* Shaking vibration indicator curves */}
    <path d="M34 50 C30 54, 30 64, 34 68" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M124 50 C128 54, 128 64, 124 68" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M70 82 Q80 85, 90 82" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Trembling Starfish-like splayed Cat Body */}
    <path 
      d="M58 74 C50 71, 48 61, 54 55 C48 51, 48 37, 56 33 C64 29, 96 29, 104 33 C112 37, 112 51, 106 55 C112 61, 110 71, 102 74 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Tabby stripes on head */}
    <path d="M76 32 L76 38" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M80 32 L80 39" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M84 32 L84 38" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

    {/* Pointed Ears */}
    <path 
      d="M60 33 L52 20 L67 27 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M100 33 L108 20 L93 27 Z" 
      fill="#ffffff" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Big Shocked Circles Eyes */}
    {/* Left Eye */}
    <circle cx="68" cy="45" r="8" fill="#ffffff" stroke="#000000" strokeWidth="3" />
    <circle cx="68" cy="45" r="2" fill="#000000" />
    
    {/* Right Eye */}
    <circle cx="92" cy="45" r="8" fill="#ffffff" stroke="#000000" strokeWidth="3" />
    <circle cx="92" cy="45" r="2" fill="#000000" />

    {/* Trembling Squiggly Mouth */}
    <path 
      d="M76 54 Q80 50, 84 54 T88 54" 
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />

    {/* Splayed-out arms */}
    {/* Left Arm */}
    <path 
      d="M52 49 C42 45, 43 53, 48 53" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Right Arm */}
    <path 
      d="M108 49 C118 45, 117 53, 112 53" 
      stroke="#000000" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Splayed-out legs */}
    {/* Left Leg */}
    <path 
      d="M62 70 C54 78, 48 76, 52 82" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Right Leg */}
    <path 
      d="M98 70 C106 78, 112 76, 108 82" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Shaking squiggly tail */}
    <path 
      d="M102 68 Q110 65, 114 70" 
      stroke="#000000" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
  </svg>
);
