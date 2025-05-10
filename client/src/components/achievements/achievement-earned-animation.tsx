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
  autoCloseDelay?: number; // Milliseconds to auto-close
}

export function AchievementEarnedAnimation({
  achievement,
  onClose,
  autoCloseDelay = 7000
}: AchievementEarnedAnimationProps) {
  const [visible, setVisible] = useState(true);
  const { width, height } = useWindowSize();
  const [confettiActive, setConfettiActive] = useState(true);
  
  // Auto-close after delay
  useEffect(() => {
    if (!autoCloseDelay) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Allow exit animation to finish
    }, autoCloseDelay);
    
    // Stop confetti earlier
    const confettiTimer = setTimeout(() => {
      setConfettiActive(false);
    }, autoCloseDelay - 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [autoCloseDelay, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setConfettiActive(false);
    setTimeout(onClose, 500); // Allow exit animation to finish
  };
  
  const levelClass = getLevelColorClass(achievement.level);
  
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Confetti */}
          {confettiActive && (
            <Confetti 
              width={width} 
              height={height}
              numberOfPieces={200}
              recycle={false}
              gravity={0.2}
            />
          )}
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />
          
          {/* Achievement Animation Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md mx-auto z-10 relative overflow-hidden"
          >
            {/* Sparkle effects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-0 right-0 m-4"
            >
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.8, delay: 0.3, repeat: Infinity, repeatType: "reverse" }}
              className="absolute bottom-0 left-0 m-4"
            >
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </motion.div>
            
            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  Achievement Unlocked!
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mb-4"
                >
                  <div className={`${levelClass} p-6 rounded-full`}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, delay: 0.5, type: "spring" }}
                      className="text-5xl"
                    >
                      {achievement.icon}
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl font-bold mb-2"
                >
                  {achievement.name}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                >
                  {achievement.description}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex justify-center items-center text-amber-600 font-bold mb-6"
                >
                  <Award className="h-5 w-5 mr-2" />
                  <span>+{achievement.points} Points</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <Button 
                    onClick={handleClose}
                    className="px-8"
                  >
                    Awesome!
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}