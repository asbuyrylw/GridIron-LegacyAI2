import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFootball } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

type FootballIconProps = {
  className?: string;
  size?: string;
  width?: number;
  height?: number;
};

export function FootballIcon({ className, size, width, height }: FootballIconProps) {
  return (
    <FontAwesomeIcon
      icon={faFootball}
      className={cn("text-primary", className)}
      style={{ 
        width: width || (size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : size === 'xl' ? 32 : 24),
        height: height || (size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : size === 'xl' ? 32 : 24)
      }}
    />
  );
}