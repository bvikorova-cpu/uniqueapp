import { Card } from "@/components/ui/card";
import { Trophy, Clock, Award, Star, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ConfettiAnimation } from "./ConfettiAnimation";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CastleProgressTrackerProps {
  currentRoomIndex: number;
  totalRooms: number;
  visitedRoomIds: string[];
  startTime: number;
  isVisible: boolean;
  onClose: () => void;
  unlockedMilestones: number[];
  onMilestoneUnlock: (percentage: number) => void;
}

interface Milestone {
  percentage: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    percentage: 25,
    icon: <Star className="h-6 w-6" />,
    title: "Explorer",
    description: "Visited 25% of the castle",
    color: "text-blue-500",
  },
  {
    percentage: 50,
    icon: <Award className="h-6 w-6" />,
    title: "Adventurer",
    description: "Halfway through your journey",
    color: "text-purple-500",
  },
  {
    percentage: 75,
    icon: <Trophy className="h-6 w-6" />,
    title: "Castle Master",
    description: "Almost complete!",
    color: "text-yellow-500",
  },
  {
    percentage: 100,
    icon: <Crown className="h-6 w-6" />,
    title: "Royal Champion",
    description: "Tour complete! You're amazing!",
    color: "text-amber-500",
  },
];

export const CastleProgressTracker = ({
  currentRoomIndex,
  totalRooms,
  visitedRoomIds,
  startTime,
  isVisible,
  onClose,
  unlockedMilestones,
  onMilestoneUnlock,
}: CastleProgressTrackerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(now - startTime);
    }, 1000);

    return (
    <>
      <FloatingHowItWorks title={"Castle Progress Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Progress Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Progress Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, [startTime, isVisible]);

  

  const progressPercentage = ((currentRoomIndex + 1) / totalRooms) * 100;
  const visitedCount = visitedRoomIds.length;
  const averageTimePerRoom = visitedCount > 0 ? elapsedTime / visitedCount : 0;
  const estimatedTimeRemaining = (totalRooms - visitedCount) * averageTimePerRoom;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const currentUnlockedMilestones = MILESTONES.filter(
    (m) => progressPercentage >= m.percentage
  );
  const nextMilestone = MILESTONES.find((m) => progressPercentage < m.percentage);

  // Check for newly unlocked milestones
  useEffect(() => {
    currentUnlockedMilestones.forEach((milestone) => {
      if (!unlockedMilestones.includes(milestone.percentage)) {
        // New milestone unlocked!
        onMilestoneUnlock(milestone.percentage);
        setShowConfetti(true);
        
        // Play achievement sound
        const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c6d81121.mp3');
        audio.volume = 0.3;
        audio.play().catch(console.error);

        // Show toast notification
        toast.success(`🎉 ${milestone.title} Unlocked!`, {
          description: milestone.description,
          duration: 4000,
        });
      }
    });
  }, [progressPercentage]);

  if (!isVisible) return null;

  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Progress Tracker Panel */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl max-h-[80vh] overflow-y-auto z-50 p-6 bg-background/95 backdrop-blur-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Your Progress
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your magical journey through the castle
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Progress Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-48 mb-4">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="fill-none stroke-muted"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                className="fill-none stroke-primary transition-all duration-500"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
              />
            </svg>
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">
              Room {currentRoomIndex + 1} of {totalRooms}
            </p>
            <p className="text-sm text-muted-foreground">
              {visitedCount} room{visitedCount !== 1 ? "s" : ""} explored
            </p>
          </div>
        </div>

        {/* Time Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Spent</p>
                <p className="text-lg font-bold">{formatTime(elapsedTime)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Remaining</p>
                <p className="text-lg font-bold">
                  {visitedCount > 0 ? formatTime(estimatedTimeRemaining) : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Milestones
          </h3>

          <div className="space-y-3">
            {MILESTONES.map((milestone) => {
              const isUnlocked = unlockedMilestones.includes(milestone.percentage);
              const isNext = nextMilestone?.percentage === milestone.percentage;

              return (
                <div
                  key={milestone.percentage}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                    isUnlocked &&
                      "bg-primary/5 border-primary/20 animate-fade-in",
                    !isUnlocked && isNext && "border-primary/30",
                    !isUnlocked && !isNext && "border-border opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full transition-all",
                      isUnlocked &&
                        "bg-gradient-to-br from-primary to-primary/50 text-primary-foreground animate-scale-in",
                      !isUnlocked && "bg-muted text-muted-foreground"
                    )}
                  >
                    {milestone.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{milestone.title}</p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          isUnlocked &&
                            "bg-primary/20 text-primary font-medium",
                          !isUnlocked && "bg-muted text-muted-foreground"
                        )}
                      >
                        {milestone.percentage}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>

                  {isUnlocked && (
                    <div className="text-primary animate-scale-in">
                      <Trophy className="h-6 w-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Milestone Progress */}
          {nextMilestone && (
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  Next Milestone: {nextMilestone.title}
                </p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
                  style={{
                    width: `${(progressPercentage / nextMilestone.percentage) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(nextMilestone.percentage - progressPercentage)}%
                until next badge
              </p>
            </Card>
          )}
        </div>
      </Card>

      {/* Confetti Animation */}
      <ConfettiAnimation
        isActive={showConfetti}
        duration={3000}
        onComplete={handleConfettiComplete}
      />
    </>
  );
};
