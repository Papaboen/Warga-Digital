import React from 'react';

interface WargaDigitalLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const WargaDigitalLogo: React.FC<WargaDigitalLogoProps> = ({
  size = 140,
  showText = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Crisp, professional, scalable Vector SVG exactly replicating the branding image */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform hover:scale-102 duration-300"
      >
        {/* SHIELD OUTER LEFT (Green) */}
        <path
          d="M 250,35 C 170,35 90,65 75,140 C 62,205 68,345 250,465"
          stroke="#005146"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* SHIELD OUTER RIGHT (Pink/Magenta) */}
        <path
          d="M 250,35 C 330,35 410,65 425,140 C 438,205 432,345 250,465"
          stroke="#b32e6a"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* SHIELD INNER LEFT (Green, thinner) */}
        <path
          d="M 250,65 C 190,65 125,90 112,150 C 102,205 108,315 250,415"
          stroke="#005146"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* SHIELD INNER RIGHT (Pink/Magenta, thinner) */}
        <path
          d="M 250,65 C 310,65 375,90 388,150 C 398,205 392,315 250,415"
          stroke="#b32e6a"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* LEFT WIFI SIGNAL WAVES (Green) */}
        <path
          d="M 130,205 A 40,40 0 0,1 170,165"
          stroke="#005146"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 115,185 A 65,65 0 0,1 180,120"
          stroke="#005146"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 100,165 A 90,90 0 0,1 190,75"
          stroke="#005146"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* RIGHT WIFI SIGNAL WAVES (Pink/Magenta) */}
        <path
          d="M 330,165 A 40,40 0 0,1 370,205"
          stroke="#b32e6a"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 320,120 A 65,65 0 0,1 385,185"
          stroke="#b32e6a"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 310,75 A 90,90 0 0,1 400,165"
          stroke="#b32e6a"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* LEFT HOUSES (Green) */}
        <path
          d="M 160,225 L 195,195 L 225,220"
          stroke="#005146"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 170,222 L 170,275 L 215,275 L 215,220"
          stroke="#005146"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Door */}
        <path
          d="M 185,250 L 185,275 L 200,275 L 200,250 Z"
          stroke="#005146"
          strokeWidth="6"
          fill="none"
        />

        {/* MAIN/CENTER HOUSE (Green) */}
        <path
          d="M 210,195 L 250,155 L 290,195"
          stroke="#005146"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 220,192 L 220,265 L 280,265 L 280,192"
          stroke="#005146"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Window 1 */}
        <path
          d="M 233,212 H 245 V 224 H 233 Z"
          stroke="#005146"
          strokeWidth="6"
          fill="none"
        />
        {/* Window 2 */}
        <path
          d="M 255,212 H 267 V 224 H 255 Z"
          stroke="#005146"
          strokeWidth="6"
          fill="none"
        />

        {/* RIGHT HOUSE (Pink/Magenta) */}
        <path
          d="M 268,225 L 295,200 L 325,225"
          stroke="#b32e6a"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 276,222 L 276,275 L 315,275 L 315,222"
          stroke="#b32e6a"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* SWEEPING ARROW SHADOW/UNDER-ACCENT (Pink/Magenta) */}
        <path
          d="M 145,305 Q 225,370 315,310"
          stroke="#b32e6a"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />

        {/* SWEEPING ARROW MAIN BODY (Green) */}
        <path
          d="M 135,285 Q 225,355 315,275"
          stroke="#005146"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrow Head (Green) */}
        <path
          d="M 295,295 L 332,260 L 320,240 Z"
          fill="#005146"
          stroke="#005146"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="text-center mt-3 animate-fadeIn">
          <h1 className="font-headline text-2xl font-black tracking-tight text-[#005146]">
            Warga Digital
          </h1>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
            Aplikasi Komunikasi Warga
          </p>
        </div>
      )}
    </div>
  );
};
