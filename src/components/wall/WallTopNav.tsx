import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageCircle,
  Users2,
  Users,
  Flag,
  Video,
  Calendar,
  Bookmark,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimationToggle } from "./AnimationToggle";

interface WallTopNavProps {
  currentPath?: string;
}

export function WallTopNav({ currentPath }: WallTopNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Feed", path: "/wall" },
    { icon: MessageCircle, label: "Messages", path: "/wall/messages" },
    { icon: Users2, label: "Friends", path: "/wall/friends" },
    { icon: Sparkles, label: "AI Studio", path: "/wall/ai-studio" },
    { icon: Video, label: "Videos", path: "/wall/videos" },
    { icon: Bookmark, label: "Saved", path: "/wall/saved" },
    { icon: TrendingUp, label: "Trending", path: "/wall/trending" },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="flex items-center gap-1 py-1.5 sm:py-2">
          <div 
            className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
            style={{ 
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex items-center gap-0.5 sm:gap-1 px-0.5 w-max">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all hover:bg-primary/10 flex-shrink-0 min-w-0",
                    currentPath === item.path && "bg-primary/10 text-primary font-semibold"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <AnimationToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
