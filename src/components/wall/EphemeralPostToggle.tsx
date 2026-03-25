import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Ghost, Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type PostVisibility = "normal" | "ephemeral" | "close-friends";

interface EphemeralPostToggleProps {
  visibility: PostVisibility;
  onVisibilityChange: (v: PostVisibility) => void;
}

const options = [
  {
    value: "normal" as PostVisibility,
    label: "Normal",
    description: "Stays on your profile",
    icon: Eye,
    gradient: "from-primary/20 to-primary/10",
  },
  {
    value: "ephemeral" as PostVisibility,
    label: "24h Only",
    description: "Disappears after 24 hours",
    icon: Ghost,
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    value: "close-friends" as PostVisibility,
    label: "Close Friends",
    description: "Only close friends can see",
    icon: Users,
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
];

export const EphemeralPostToggle = ({ visibility, onVisibilityChange }: EphemeralPostToggleProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === visibility) || options[0];
  const Icon = selected.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs font-medium"
        >
          <Icon className="w-3.5 h-3.5" />
          {selected.label}
          {visibility === "ephemeral" && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-orange-500"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => {
            const OptIcon = option.icon;
            const isActive = visibility === option.value;
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onVisibilityChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${option.gradient} ring-1 ring-primary/20`
                    : "hover:bg-accent/50"
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${option.gradient}`}>
                  <OptIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className="text-[11px] text-muted-foreground">{option.description}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="ephemeralActive"
                    className="ml-auto w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
