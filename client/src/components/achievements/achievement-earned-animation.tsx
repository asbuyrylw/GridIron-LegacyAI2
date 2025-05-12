import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { Achievement } from '@/lib/achievement-badges';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
  const { width, height } = useWindowSize();
  const [confettiActive, setConfettiActive] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setConfettiActive(true);
      // Automatically turn off confetti after 5 seconds
      const timer = setTimeout(() => {
        setConfettiActive(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <>
      {confettiActive && <Confetti width={width} height={height} recycle={false} />}
      
      <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md text-center p-0 overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-b from-amber-400 to-yellow-600 p-6 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                <img 
                  src={`/badges/${achievement.id}.svg`} 
                  alt={achievement.name}
                  className="w-32 h-32 relative z-10" 
                  onError={(e) => {
                    // Fallback to a default image if the badge SVG doesn't exist
                    e.currentTarget.src = '/badges/default-badge.svg';
                  }}
                />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Achievement Unlocked!
            </motion.h2>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Badge className="mb-4" variant="secondary">
                {achievement.pointValue || 50} Points
              </Badge>
            </motion.div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
            <p className="text-muted-foreground mb-4">{achievement.description}</p>
            
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={onClose}
            >
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}