import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Moon, Star, Clock, Sun, TreeDeciduous, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SmartSleepTimerProps {
  children?: React.ReactNode;
}

const BREAK_MESSAGES = [
  {
    character: "🦄",
    title: "Time for a Magical Break!",
    message: "Hey little adventurer! You've been having so much fun learning, but even heroes need rest. Why not go play outside or have a snack?",
    icon: Sun,
  },
  {
    character: "🐻",
    title: "Bear Says Take a Break!",
    message: "Roar! You've done amazing today! How about reading a real book, playing with toys, or helping your family with something fun?",
    icon: BookOpen,
  },
  {
    character: "🧚",
    title: "Fairy's Rest Time!",
    message: "Sparkle sparkle! Your brain has learned so much today! Time to rest your eyes and maybe play in nature or cuddle with family!",
    icon: TreeDeciduous,
  },
];

export function SmartSleepTimer({ children }: SmartSleepTimerProps = {}) {
  const { user } = useAuth();
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [breakMessage, setBreakMessage] = useState(BREAK_MESSAGES[0]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Load parental settings from localStorage
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`kids_parental_settings_${user.id}`);
    if (stored) {
      const data = JSON.parse(stored);
      setEnabled(data.sleep_timer_enabled || false);
      setDailyLimit(data.daily_limit_minutes || null);
    }
  }, [user]);

  // Start timer when component mounts
  useEffect(() => {
    if (enabled && dailyLimit) {
      setStartTime(new Date());
    }
  }, [enabled, dailyLimit]);

  // Check time periodically
  useEffect(() => {
    if (!enabled || !dailyLimit || !startTime) return;

    const checkTime = () => {
      const now = new Date();
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
      
      if (elapsedMinutes >= dailyLimit) {
        const randomMessage = BREAK_MESSAGES[Math.floor(Math.random() * BREAK_MESSAGES.length)];
        setBreakMessage(randomMessage);
        setShowBreakDialog(true);
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval);
  }, [enabled, dailyLimit, startTime]);

  const handleContinue = () => {
    // Reset timer for another session
    setStartTime(new Date());
    setShowBreakDialog(false);
  };

  const MessageIcon = breakMessage.icon;

  return (
    <>
      {children}
      
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-4 border-purple-300">
          <DialogHeader>
            <div className="text-center space-y-4">
              {/* Character */}
              <div className="text-8xl animate-bounce">
                {breakMessage.character}
              </div>
              
              {/* Title */}
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {breakMessage.title}
              </DialogTitle>
              
              {/* Stars decoration */}
              <div className="flex justify-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Message */}
            <div className="bg-white/80 rounded-xl p-4 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                  <MessageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {breakMessage.message}
                </p>
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-100 rounded-lg p-3 text-center">
                <Sun className="w-8 h-8 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-green-700 font-medium">Play Outside</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-blue-700 font-medium">Read a Book</p>
              </div>
              <div className="bg-pink-100 rounded-lg p-3 text-center">
                <Moon className="w-8 h-8 mx-auto text-pink-600 mb-1" />
                <p className="text-xs text-pink-700 font-medium">Rest Your Eyes</p>
              </div>
            </div>
            
            {/* Timer info */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>You've been learning for {dailyLimit} minutes today!</span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleContinue}
              >
                5 More Minutes
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                onClick={() => setShowBreakDialog(false)}
              >
                Take a Break! 🌟
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function useSmartSleepTimer() {
  // This hook can be used to manually check time limits
  const { user } = useAuth();
  const [exceeded, setExceeded] = useState(false);

  // Implementation can be extended as needed
  
  return { exceeded };
}
