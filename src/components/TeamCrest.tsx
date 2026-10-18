import React, { useState } from 'react';
import { Team } from '../types/football';

interface TeamCrestProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-5 h-5', img: 'w-4 h-4', text: 'text-[9px]' },
  sm: { box: 'w-7 h-7', img: 'w-6 h-6', text: 'text-[10px]' },
  md: { box: 'w-10 h-10', img: 'w-8 h-8', text: 'text-xs' },
  lg: { box: 'w-12 h-12', img: 'w-10 h-10', text: 'text-sm' },
  xl: { box: 'w-16 h-16', img: 'w-13 h-13', text: 'text-base' },
};

export const TeamCrest: React.FC<TeamCrestProps> = ({
  team,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // If team has logo and no error occurred, render high-res official crest
  if (team.logo && !hasError) {
    return (
      <div 
        className={`${sizeConfig.box} rounded-xl bg-slate-900/60 p-1 flex items-center justify-center shrink-0 border border-slate-800 shadow-sm ${className}`}
        title={team.name}
      >
        <img
          src={team.logo}
          alt={`Escudo de ${team.name}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          className={`${sizeConfig.img} object-contain transition-transform hover:scale-105`}
        />
      </div>
    );
  }

  // Graceful stylized fallback container with team badge colors
  return (
    <div
      className={`${sizeConfig.box} rounded-xl flex items-center justify-center font-black ${sizeConfig.text} shrink-0 border shadow-sm ${team.badgeBg} ${className}`}
      title={team.name}
    >
      {team.logoInitials}
    </div>
  );
};
