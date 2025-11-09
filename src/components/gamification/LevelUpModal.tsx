import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Gift, Zap, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
  totalXP: number;
}

const getLevelPerks = (level: number) => {
  const perks = [];
  
  if (level === 5) {
    perks.push({ icon: Gift, text: "Unlocked: Daily Reward Bonus +10 XP" });
  }
  if (level === 10) {
    perks.push({ icon: Star, text: "Unlocked: Premium Badge Collection" });
    perks.push({ icon: Gift, text: "Daily Reward Bonus +25 XP" });
  }
  if (level === 15) {
    perks.push({ icon: Zap, text: "Unlocked: Double XP Events" });
  }
  if (level === 20) {
    perks.push({ icon: Crown, text: "Unlocked: VIP Status" });
    perks.push({ icon: Gift, text: "Daily Reward Bonus +50 XP" });
  }
  if (level === 25) {
    perks.push({ icon: Sparkles, text: "Unlocked: Exclusive Avatar Frames" });
  }
  
  if (level % 5 === 0 && perks.length === 0) {
    perks.push({ icon: Star, text: `Milestone Bonus: +${level * 10} XP` });
  }
  
  return perks;
};

export default function LevelUpModal({ open, onOpenChange, level, totalXP }: LevelUpModalProps) {
  const perks = getLevelPerks(level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in border-2 border-primary/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="h-24 w-24 text-yellow-500 drop-shadow-lg" />
              </div>
            </div>
            
            <div className="space-y-2 animate-fade-in">
              <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Level Up!
              </h2>
              <p className="text-6xl font-black text-primary">
                {level}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* XP Display */}
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              {totalXP} Total XP
            </Badge>
          </div>

          {/* Perks Unlocked */}
          {perks.length > 0 && (
            <div className="space-y-3 animate-fade-in bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h3 className="font-semibold text-center text-sm uppercase tracking-wide text-primary">
                🎉 New Perks Unlocked!
              </h3>
              <div className="space-y-2">
                {perks.map((perk, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-md bg-background/50 hover-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <perk.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{perk.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Encouragement Message */}
          <div className="text-center space-y-2 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Keep up the amazing work!
            </p>
            <p className="text-xs text-muted-foreground">
              Continue earning XP to unlock more rewards
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full gap-2 hover-scale"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
