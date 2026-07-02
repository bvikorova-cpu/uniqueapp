import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SelfDestructingMessageProps {
  onSelectDuration: (seconds: number) => void;
  isActive: boolean;
  duration: number | null;
}

const DURATIONS = [
  { label: "5 seconds", value: 5 },
  { label: "10 seconds", value: 10 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "Off", value: 0 },
];

export const SelfDestructingMessage = ({
  onSelectDuration,
  isActive,
  duration,
}: SelfDestructingMessageProps) => {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Off";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  return (
    <DropdownMenu>
      <FloatingHowItWorks
        title={"Self Destructing Message"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          className="relative"
        >
          <Timer className="h-4 w-4" />
          {isActive && duration && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
              {formatDuration(duration)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <p className="px-2 py-1 text-xs text-muted-foreground">Self-destruct timer</p>
        {DURATIONS.map((d) => (
          <DropdownMenuItem
            key={d.value}
            onClick={() => onSelectDuration(d.value)}
            className={duration === d.value ? "bg-accent" : ""}
          >
            {d.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
