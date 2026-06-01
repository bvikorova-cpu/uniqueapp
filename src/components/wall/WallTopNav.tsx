import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageCircle,
  Users2,
  Users,
  FileText,
  Video,
  Calendar,
  Bookmark,
  TrendingUp,
  Info,
  MoreHorizontal,
  ShoppingBag,
  Heart,
  Sparkles,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileCreditsPill } from "@/components/wall/MobileCreditsPill";


interface WallTopNavProps {
  currentPath?: string;
}

export function WallTopNav({ currentPath }: WallTopNavProps) {
  const navigate = useNavigate();

  const mainNavItems = [
    { icon: Home, label: "Feed", path: "/wall" },
    { icon: MessageCircle, label: "Messages", path: "/wall/messages" },
    { icon: Users2, label: "Friends", path: "/wall/friends" },
  ];

  const moreNavItems = [
    { icon: Video, label: "Videos", path: "/wall/videos" },
    { icon: ShoppingBag, label: "Marketplace", path: "/bazaar" },
    { icon: Sparkles, label: "Memories", path: "/wall/memories" },
    { icon: Heart, label: "Dating", path: "/dating" },
    { icon: EyeOff, label: "Anonymous Dating", path: "/anonymous-date" },
    { icon: Users, label: "Groups", path: "/wall/groups" },
    { icon: FileText, label: "Pages", path: "/wall/pages" },
    { icon: Calendar, label: "Events", path: "/wall/events" },
    { icon: Bookmark, label: "Saved", path: "/wall/saved" },
    { icon: TrendingUp, label: "Trending", path: "/wall/trending" },
    { icon: Info, label: "Info", path: "/wall/info" },
  ];

  const isMoreActive = moreNavItems.some(item => currentPath === item.path);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-[0_1px_12px_hsl(var(--primary)/0.04)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center sm:justify-between gap-2 py-1.5 sm:py-2">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 sm:flex-nowrap pr-14 sm:pr-0">

            {mainNavItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all hover:bg-primary/10",
                  currentPath === item.path && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs whitespace-nowrap">{item.label}</span>
              </Button>
            ))}

            {/* More dropdown */}
            <DropdownMenu>

              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all hover:bg-primary/10",
                    isMoreActive && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-48 bg-card border shadow-lg z-50"
              >
                {moreNavItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      currentPath === item.path && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </div>
    </div>
  );
}
