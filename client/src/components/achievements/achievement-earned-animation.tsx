import { useEffect, useState } from "react";
import { 
  Achievement, 
  getLevelColorClass 
} from "@/lib/achievement-badges";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, Sparkles, Trophy } from "lucide-react";
import Confetti from 'react-confetti';
import { useWindowSize } from "@/hooks/use-window-size";

interface AchievementEarnedAnimationProps {
  achievement: Achievement;
  onClose: () => void;
  visible: boolean;
}

export function AchievementEarnedAnimation({
  achievement,
  onClose,
  visible
}: AchievementEarnedAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get the level color class
  const colorClass = getLevelColorClass(achievement.level);
  
  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            onClick={onClose}
          >
            {/* Achievement card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 15,
                stiffness: 200,
                duration: 0.4 
              }}
              className="bg-card p-8 rounded-xl max-w-md mx-auto text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti effect */}
              {showConfetti && (
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                  numberOfPieces={200}
                />
              )}
              
              {/* Top sparkles */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -top-10 left-1/2 transform -translate-x-1/2"
              >
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </motion.div>
              
              {/* Achievement unlocked header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <h3 className="text-lg font-bold flex items-center justify-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Achievement Unlocked!
                </h3>
              </motion.div>
              
              {/* Achievement badge */}
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: "spring", 
                  damping: 12,
                  stiffness: 200
                }}
                className="mb-6 flex justify-center"
              >
                <div className={`h-24 w-24 rounded-full flex items-center justify-center ${colorClass} shadow-lg`}>
                  <span className="text-4xl">{achievement.icon}</span>
                </div>
              </motion.div>
              
              {/* Achievement details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold">{achievement.name}</h2>
                <p className="text-muted-foreground mt-2">{achievement.description}</p>
                <div className="mt-3 inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold text-sm">
                  +{achievement.points} points
                </div>
              </motion.div>
              
              {/* Close button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={onClose}
                  className="w-full"
                >
                  <Award className="mr-2 h-4 w-4" />
                  View My Achievements
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}