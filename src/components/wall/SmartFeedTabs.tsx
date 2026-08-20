import { motion } from "framer-motion";
import { Sparkles, Users, TrendingUp, Clock, UserCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FeedTab = "for-you" | "following" | "friends" | "trending" | "latest";

interface SmartFeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const tabs = [
  { id: "for-you" as FeedTab, label: "For You", description: "Personalized picks based on what you love", icon: Sparkles, gradient: "from-primary to-accent" },
  { id: "following" as FeedTab, label: "Following", description: "Latest posts from people you follow", icon: Users, gradient: "from-blue-500 to-cyan-500" },
  { id: "friends" as FeedTab, label: "Friends", description: "Posts shared by your friends only", icon: UserCheck, gradient: "from-pink-500 to-purple-500" },
  { id: "trending" as FeedTab, label: "Trending", description: "Most popular posts from the last 7 days", icon: TrendingUp, gradient: "from-orange-500 to-rose-500" },
  { id: "latest" as FeedTab, label: "Latest", description: "Newest posts in chronological order", icon: Clock, gradient: "from-emerald-500 to-teal-500" },
];

export const SmartFeedTabs = ({ activeTab, onTabChange }: SmartFeedTabsProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const button = (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTabChange(tab.id)}
                title={tab.description}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground bg-accent/30 backdrop-blur-sm hover:bg-accent/50 border border-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFeedTab"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient} shadow-[0_0_20px_rgba(139,92,246,0.3)]`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-[9px] leading-none font-medium truncate max-w-full">{tab.label}</span>
                </span>
                {isActive && tab.id === "for-you" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-foreground animate-pulse"
                  />
                )}
              </motion.button>
            );

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px] text-center">
                  <p className="font-semibold">{tab.label}</p>
                  <p className="text-xs text-muted-foreground">{tab.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
