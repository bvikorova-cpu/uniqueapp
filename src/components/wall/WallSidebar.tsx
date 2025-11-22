import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Users, 
  Video, 
  Calendar,
  MessageCircle,
  TrendingUp,
  Flag,
  Settings,
  Bookmark,
  Users2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WallSidebarProps {
  currentPath?: string;
}

export function WallSidebar({ currentPath }: WallSidebarProps) {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const menuItems = [
    { icon: Home, label: "Feed", path: "/wall", color: "text-blue-500" },
    { icon: Users2, label: "Friends", path: "/wall/friends", color: "text-cyan-500" },
    { icon: Users, label: "Groups", path: "/wall/groups", color: "text-blue-600" },
    { icon: Flag, label: "Pages", path: "/wall/pages", color: "text-orange-500" },
    { icon: Video, label: "Videos", path: "/wall/videos", color: "text-blue-400" },
    { icon: Calendar, label: "Events", path: "/wall/events", color: "text-red-500" },
    { icon: Bookmark, label: "Saved", path: "/wall/saved", color: "text-purple-500" },
    { icon: Clock, label: "Memories", path: "/wall/memories", color: "text-pink-500" },
    { icon: TrendingUp, label: "Trending", path: "/wall/trending", color: "text-green-500" },
  ];

  return (
    <div className="w-80 h-screen sticky top-16 border-r bg-card/30 backdrop-blur-xl overflow-y-auto pb-20">
      <div className="p-4 pt-6 space-y-2">
        {/* User Profile Quick Link */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3 hover:bg-primary/10 rounded-xl group transition-all"
          onClick={() => navigate(`/profile/${user?.id}`)}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {profile?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </Button>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-3" />

        {/* Main Navigation */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto py-3 hover:bg-primary/5 rounded-xl transition-all group",
                currentPath === item.path && "bg-primary/10 shadow-sm"
              )}
              onClick={() => navigate(item.path)}
            >
              <div className={cn(
                "p-2.5 rounded-xl bg-gradient-to-br transition-all group-hover:scale-110",
                currentPath === item.path 
                  ? "from-primary/20 to-primary/10 shadow-sm" 
                  : "from-accent/50 to-accent/30"
              )}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </Button>
          ))}
        </div>

        <div className="h-px bg-border my-2" />

        {/* Settings */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3 hover:bg-accent/50"
          onClick={() => navigate("/settings")}
        >
          <div className="p-2 rounded-full bg-accent/50">
            <Settings className="h-5 w-5 text-gray-500" />
          </div>
          <span className="font-medium text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}
