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
    <div className="w-80 h-screen sticky top-0 border-r bg-card/50 backdrop-blur-sm overflow-y-auto pb-20">
      <div className="p-4 space-y-2">
        {/* User Profile Quick Link */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3 hover:bg-accent/50"
          onClick={() => navigate(`/profile/${user?.id}`)}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{profile?.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{profile?.full_name || "User"}</span>
        </Button>

        <div className="h-px bg-border my-2" />

        {/* Main Navigation */}
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-auto py-3 hover:bg-accent/50 transition-colors",
              currentPath === item.path && "bg-accent"
            )}
            onClick={() => navigate(item.path)}
          >
            <div className={cn("p-2 rounded-full bg-accent/50", item.color)}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-sm">{item.label}</span>
          </Button>
        ))}

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
