import React from 'react';

interface SimpleMapProps {
  city?: string;
  state?: string;
  location?: string;
  name?: string;
  className?: string;
}

/**
 * A simple component to display a static map image of a location
 * Uses Google Maps Static API to generate a map image for a city/state
 */
export function SimpleMap({ city, state, location, name, className = "" }: SimpleMapProps) {
  // Create a clean, URL-friendly location string
  let locationQuery = "";
  let displayLocation = "";
  
  if (location) {
    // If a full location string is provided (e.g., "New York, NY")
    locationQuery = encodeURIComponent(location);
    displayLocation = location;
  } else if (city && state) {
    // If city and state are provided separately
    locationQuery = encodeURIComponent(`${city}, ${state}`);
    displayLocation = `${city}, ${state}`;
  } else {
    // Fallback if no location info is provided
    displayLocation = name || "Location";
  }
  
  // Create a placeholder map image (would normally use Google Maps Static API)
  // For this demo, we'll use a placeholder gradient with location name
  
  return (
    <div 
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{ 
        minHeight: "120px", 
        backgroundImage: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-center p-2">
        <div className="flex flex-col items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mb-1 text-muted-foreground/70"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 0 0-8-8z" />
          </svg>
          <span className="text-xs text-muted-foreground font-medium">{displayLocation}</span>
          <span className="text-[0.65rem] text-muted-foreground/70">Map data unavailable</span>
        </div>
      </div>
    </div>
  );
}