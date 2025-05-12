import { useState, useEffect } from "react";
import { useSpring, animated } from 'framer-motion';
import Confetti from 'react-confetti';
import { Achievement } from "@/lib/achievement-badges";
import { X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementEarnedAnimationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export function AchievementEarnedAnimation({
  achievement,
  visible,
  onClose
}: AchievementEarnedAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // Get icon from Lucide icons
  const IconComponent = LucideIcons[achievement.icon as keyof typeof LucideIcons] as LucideIcon;
  
  // Get color based on tier
  const tierColors = {
    bronze: { bg: 'bg-amber-700/10', border: 'border-amber-700', text: 'text-amber-700', shadow: 'shadow-amber-700/20' },
    silver: { bg: 'bg-slate-400/10', border: 'border-slate-400', text: 'text-slate-400', shadow: 'shadow-slate-400/20' },
    gold: { bg: 'bg-amber-400/10', border: 'border-amber-400', text: 'text-amber-400', shadow: 'shadow-amber-400/20' },
    platinum: { bg: 'bg-cyan-400/10', border: 'border-cyan-400', text: 'text-cyan-400', shadow: 'shadow-cyan-400/20' }
  };
  
  const tierColor = tierColors[achievement.tier];
  
  // Hide when not visible
  if (!visible) return null;
  
  // Update window size for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    // Start confetti
    setShowConfetti(true);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', updateWindowSize);
      clearTimeout(timer);
    };
  }, []);
  
  // Close after specified duration
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
        />
      )}
      
      {/* Achievement card */}
      <div className="relative max-w-md mx-auto bg-background border rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-500">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Badge and title */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            {/* Achievement badge with glow effect */}
            <div 
              className={`
                w-32 h-32 
                rounded-full flex items-center justify-center 
                ${tierColor.bg}
                border-4 ${tierColor.border}
                ${tierColor.shadow} shadow-2xl
                transition-all duration-300 animate-pulse
              `}
            >
              {IconComponent && (
                <IconComponent className={`w-16 h-16 ${tierColor.text}`} />
              )}
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-ping animation-delay-700" />
          </div>
          
          <h2 className="text-2xl font-bold text-center">Achievement Unlocked!</h2>
        </div>
        
        {/* Achievement details */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold mb-2">{achievement.name}</h3>
          <p className="text-muted-foreground">{achievement.description}</p>
          
          <div className="mt-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
              <span className="text-lg font-bold">+{achievement.pointsReward} points</span>
            </div>
          </div>
        </div>
        
        {/* Video unlock message */}
        {achievement.videoUnlock && (
          <div className="mb-6 p-3 bg-blue-500/10 rounded-lg text-center">
            <p className="text-blue-500 font-medium flex items-center justify-center gap-2">
              <LucideIcons.Video className="h-5 w-5" />
              <span>Special video message unlocked!</span>
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-center gap-3">
          {achievement.videoUnlock && (
            <Button variant="default">Watch Video</Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}