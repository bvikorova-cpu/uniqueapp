import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationBell } from "./NotificationBell";
import { PrivacySettingsDialog } from "./PrivacySettingsDialog";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { EnhancedCreatePost } from "./EnhancedCreatePost";

interface MobileWallMenuProps {
  onPostCreated?: () => void;
}

export function MobileWallMenu({ onPostCreated }: MobileWallMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-[1.25rem] left-2 z-50 bg-primary/10 backdrop-blur-sm shadow-md hover:bg-primary/20 rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-3 h-auto py-3 hover:bg-primary/10 rounded-xl"
              onClick={() => {
                navigate(`/profile/${user?.id}`);
                setOpen(false);
              }}
            >
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {profile?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-semibold">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">View profile</p>
              </div>
            </Button>
            <NotificationBell />
          </div>

          <div className="h-px bg-border" />

          {/* Create Post */}
          <EnhancedCreatePost 
            onPostCreated={() => {
              onPostCreated?.();
              setOpen(false);
            }} 
            userProfile={profile} 
          />

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
            onClick={() => {
              navigate("/settings");
              setOpen(false);
            }}
          >
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-sm">Settings</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
