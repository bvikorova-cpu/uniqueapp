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

interface WallTopNavProps {
  currentPath?: string;
}

export function WallTopNav({ currentPath }: WallTopNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Feed", path: "/wall" },
    { icon: MessageCircle, label: "Messages", path: "/wall/messages" },
    { icon: Users2, label: "Friends", path: "/wall/friends" },
    { icon: Users, label: "Groups", path: "/wall/groups" },
    { icon: Flag, label: "Pages", path: "/wall/pages" },
    { icon: Video, label: "Videos", path: "/wall/videos" },
    { icon: Calendar, label: "Events", path: "/wall/events" },
    { icon: Bookmark, label: "Saved", path: "/wall/saved" },
    { icon: TrendingUp, label: "Trending", path: "/wall/trending" },
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-primary/10",
                currentPath === item.path && "bg-primary/10 text-primary font-semibold"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm whitespace-nowrap">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
