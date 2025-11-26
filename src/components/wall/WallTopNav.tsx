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
    { icon: Video, label: "Videos", path: "/wall/videos" },
    { icon: Bookmark, label: "Saved", path: "/wall/saved" },
    { icon: TrendingUp, label: "Trending", path: "/wall/trending" },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-2">
          <div className="flex items-center justify-start sm:justify-center gap-1 overflow-x-auto overflow-y-hidden flex-1 -webkit-overflow-scrolling-touch snap-x snap-mandatory pl-12 lg:pl-0">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all hover:bg-primary/10 flex-shrink-0 snap-start",
                  currentPath === item.path && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{item.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex-shrink-0 ml-2">
            <AnimationToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
