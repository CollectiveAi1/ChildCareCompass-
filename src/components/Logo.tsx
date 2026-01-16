
import React from 'react';

export const Logo: React.FC<{ size?: number; showTagline?: boolean; className?: string }> = ({ size = 120, showTagline = false, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div style={{ width: size, height: size }} className="relative">
        <svg 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Compass Outer Ring */}
          <circle cx="100" cy="100" r="80" stroke="#FFDE00" strokeWidth="6" />
          <circle cx="100" cy="100" r="70" stroke="#FFDE00" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line 
              key={deg}
              x1="100" y1="100" 
              x2={100 + 88 * Math.cos((deg * Math.PI) / 180)} 
              y2={100 + 88 * Math.sin((deg * Math.PI) / 180)} 
              stroke="#FFDE00" 
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {/* Spokes Outer Dots */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <circle 
              key={`dot-${deg}`}
              cx={100 + 92 * Math.cos((deg * Math.PI) / 180)} 
              cy={100 + 92 * Math.sin((deg * Math.PI) / 180)} 
              r="4" 
              fill="#FFDE00" 
            />
          ))}

          {/* Center Needle (Compass Point) */}
          <path d="M100 20L115 100L100 120L85 100Z" fill="#FFDE00" />

          {/* Cardinal Directions */}
          <text x="100" y="32" textAnchor="middle" fill="#001F54" fontSize="14" fontWeight="900" fontFamily="Quicksand">N</text>
          <text x="170" y="105" textAnchor="middle" fill="#001F54" fontSize="14" fontWeight="900" fontFamily="Quicksand">E</text>
          <text x="100" y="178" textAnchor="middle" fill="#001F54" fontSize="14" fontWeight="900" fontFamily="Quicksand">S</text>
          <text x="30" y="105" textAnchor="middle" fill="#001F54" fontSize="14" fontWeight="900" fontFamily="Quicksand">W</text>

          {/* Central Logo Text */}
          <text x="100" y="95" textAnchor="middle" fill="#001F54" fontSize="24" fontWeight="900" fontFamily="Quicksand">ChildCare</text>
          <text x="100" y="122" textAnchor="middle" fill="#001F54" fontSize="24" fontWeight="900" fontFamily="Quicksand">Compass</text>

          {/* Waving Kids (Emoji Placeholders for the Art) */}
          <text x="45" y="45" fontSize="24">👧</text>
          <text x="155" y="45" fontSize="24">👦</text>
          <text x="45" y="155" fontSize="24">🧒</text>
          <text x="155" y="155" fontSize="24">👦</text>
        </svg>
      </div>
      {showTagline && (
        <p className="mt-4 text-brand-blue font-bold text-lg font-display tracking-tight opacity-90">
          Guiding your Childcare Journey
        </p>
      )}
    </div>
  );
};
