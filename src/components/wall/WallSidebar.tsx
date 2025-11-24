import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { PrivacySettingsDialog } from "./PrivacySettingsDialog";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { EnhancedCreatePost } from "./EnhancedCreatePost";

interface WallSidebarProps {
  onPostCreated?: () => void;
}

export function WallSidebar({ onPostCreated }: WallSidebarProps) {
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

  return (
    <div className="w-64 lg:w-80 h-screen sticky top-44 border-r bg-card/30 backdrop-blur-xl overflow-y-auto pb-20">
      <div className="p-2 lg:p-4 pt-6 space-y-4">
        {/* User Profile */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-3 h-auto py-3 hover:bg-primary/10 rounded-xl group transition-all"
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {profile?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">View profile</p>
            </div>
          </Button>
          <NotificationBell />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Create Post */}
        <EnhancedCreatePost onPostCreated={onPostCreated} userProfile={profile} />

        <div className="h-px bg-border" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <PrivacySettingsDialog />
          <MediaGalleryDialog />
        </div>

        <div className="h-px bg-border" />

        {/* Settings */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}
