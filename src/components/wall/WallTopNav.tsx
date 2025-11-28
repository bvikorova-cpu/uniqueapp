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
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-2">
          <div 
            className="flex items-center justify-start sm:justify-center gap-1 flex-1 lg:pl-0"
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
              .nav-scroll-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="nav-scroll-container flex items-center gap-1" style={{ minWidth: 'max-content' }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all hover:bg-primary/10 flex-shrink-0",
                    currentPath === item.path && "bg-primary/10 text-primary font-semibold"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 ml-1">
            <AnimationToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
