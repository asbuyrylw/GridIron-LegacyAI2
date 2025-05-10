import React from 'react';

// This is a flexible component that can handle different types of icons
interface IconWrapperProps {
  icon: React.ComponentType<any>;
  className?: string;
  style?: React.CSSProperties;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({ 
  icon: Icon, 
  className,
  style
}) => {
  // For Lucide and similar React icon libraries
  return <Icon className={className} style={style} />;
};