import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Achievement } from "@/lib/achievement-badges";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AchievementEarnedAnimationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export function AchievementEarnedAnimation({
  achievement,
  visible,
  onClose,
}: AchievementEarnedAnimationProps) {
  const [confettiActive, setConfettiActive] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get icon from Lucide icons
  const IconComponent = LucideIcons[achievement.icon as keyof typeof LucideIcons] as LucideIcon;
  
  // Get color based on tier
  const tierColors = {
    bronze: { bg: 'bg-amber-700/10', border: 'border-amber-700', text: 'text-amber-700' },
    silver: { bg: 'bg-slate-400/10', border: 'border-slate-400', text: 'text-slate-400' },
    gold: { bg: 'bg-amber-400/10', border: 'border-amber-400', text: 'text-amber-400' },
    platinum: { bg: 'bg-cyan-400/10', border: 'border-cyan-400', text: 'text-cyan-400' }
  };
  
  const tierColor = tierColors[achievement.tier];
  
  // Play animation when dialog opens
  useEffect(() => {
    if (visible) {
      setConfettiActive(true);
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden bg-opacity-90 backdrop-blur-sm">
        {confettiActive && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.15}
          />
        )}
        
        <div className="flex flex-col items-center py-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              damping: 12,
              duration: 0.8
            }}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center mb-4
              ${tierColor.bg} ${tierColor.border} border-4
            `}
          >
            {IconComponent && (
              <IconComponent className={`${tierColor.text} w-16 h-16`} />
            )}
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-1">Achievement Unlocked!</h2>
            <h3 className="text-xl font-semibold mb-3">{achievement.name}</h3>
            <p className="text-muted-foreground mb-4">{achievement.description}</p>
            
            <div className="bg-muted rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <LucideIcons.Award className="text-amber-500 h-5 w-5" />
                <span className="font-medium">{achievement.pointsReward} points earned!</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={onClose}>
                Continue
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}