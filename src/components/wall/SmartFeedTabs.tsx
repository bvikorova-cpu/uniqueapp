import { motion } from "framer-motion";
import { Sparkles, Users, TrendingUp, Clock, UserCheck } from "lucide-react";

export type FeedTab = "for-you" | "following" | "friends" | "trending" | "latest";

interface SmartFeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const tabs = [
  { id: "for-you" as FeedTab, label: "For You", icon: Sparkles, gradient: "from-primary to-accent" },
  { id: "following" as FeedTab, label: "Following", icon: Users, gradient: "from-blue-500 to-cyan-500" },
  { id: "friends" as FeedTab, label: "Friends", icon: UserCheck, gradient: "from-pink-500 to-purple-500" },
  { id: "trending" as FeedTab, label: "Trending", icon: TrendingUp, gradient: "from-orange-500 to-rose-500" },
  { id: "latest" as FeedTab, label: "Latest", icon: Clock, gradient: "from-emerald-500 to-teal-500" },
];

export const SmartFeedTabs = ({ activeTab, onTabChange }: SmartFeedTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
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
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
            </span>
            {isActive && tab.id === "for-you" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-10 w-2 h-2 rounded-full bg-primary-foreground animate-pulse"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
