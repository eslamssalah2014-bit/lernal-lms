// ============================================================================
// LERNAL LOGO & BRAND BADGE COMPONENT
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';

interface LernalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const LernalLogo: React.FC<LernalLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px] tracking-[0.25em]',
    md: 'text-[11px] tracking-[0.3em]',
    lg: 'text-[13px] tracking-[0.35em]',
  };

  return (
    <Link to="/" className={`flex items-center gap-3 group focus:outline-none ${className}`}>
      {/* Official Lernal Logo Mark */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#36C7F4] opacity-20 blur-lg rounded-full group-hover:opacity-40 transition-opacity"></div>
        <img
          src="/assets/lernal-logo.png"
          alt="Lernal Logo"
          className={`${iconSizes[size]} object-contain relative z-10 transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <span className={`font-display font-extrabold tracking-wider leading-none text-[#F5FAFC] transition-colors group-hover:text-[#36C7F4] ${textSizes[size]}`}>
          LERNAL
        </span>
        {showTagline && (
          <span className={`font-semibold uppercase text-[#36C7F4] mt-1 leading-none ${taglineSizes[size]}`}>
            SINCE 2026
          </span>
        )}
      </div>
    </Link>
  );
};
