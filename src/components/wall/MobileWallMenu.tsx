import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings, LayoutDashboard, Ticket, Building2, Users, Gem, Dna, RotateCcw, Link2, Bug,
  Sparkles as SparklesIcon, Music, ChevronDown, ChevronUp, Crown, Clock, Timer,
  ChefHat, Car, MessageCircle, Star, MessageSquare, Brain, Palette, Apple,
  PawPrint, Trophy, Mic2, Image as ImageIcon, Gift, Plane, Heart, Bot, Globe, Atom
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NotificationBell } from "./NotificationBell";
import { PrivacySettingsDialog } from "./PrivacySettingsDialog";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { EnhancedCreatePost } from "./EnhancedCreatePost";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import { TrendingSidebar } from "./TrendingSidebar";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { TrendingHashtags } from "./TrendingHashtags";
import { StreaksAndChallenges } from "./StreaksAndChallenges";
import { LiveStreamWidget } from "./LiveStreamWidget";
import { AudioRooms } from "./AudioRooms";
import { ThemeColorSwitcher } from "./ThemeColorSwitcher";

interface MobileWallMenuProps {
  onPostCreated?: () => void;
}

const coreModules = [
  { name: "Character Companions", path: "/companions", icon: MessageCircle, color: "text-pink-500" },
  { name: "Exclusive Experiences", path: "/ai-experiences", icon: SparklesIcon, color: "text-purple-500" },
  { name: "Brand Builder", path: "/brand-builder", icon: Palette, color: "text-indigo-500" },
  { name: "Home Designer", path: "/home-designer", icon: Building2, color: "text-sky-500" },
  { name: "Beauty Studio", path: "/beauty-studio", icon: Star, color: "text-rose-500" },
  { name: "Photo Restoration", path: "/photo-restoration", icon: RotateCcw, color: "text-amber-500" },
  { name: "Antique Appraisal", path: "/antique-appraisal", icon: Gem, color: "text-orange-500" },
  { name: "Collectibles", path: "/collectibles", icon: Crown, color: "text-violet-500" },
  { name: "Dream Journal", path: "/dream-journal", icon: Brain, color: "text-blue-500" },
  { name: "Fashion Studio", path: "/fashion-studio", icon: Palette, color: "text-fuchsia-500" },
];

const ecosystemModules = [
  { name: "Holographic Avatars", path: "/holographic-avatars", icon: Crown, color: "text-purple-500" },
  { name: "Time Capsule 2.0", path: "/time-capsule", icon: Clock, color: "text-blue-500" },
  { name: "Time Reversal Social", path: "/time-reversal", icon: Timer, color: "text-violet-500" },
  { name: "KitchenStars Platform", path: "/masterchef-subscription", icon: ChefHat, color: "text-orange-500" },
  { name: "GP Fantasy Racing", path: "/gp-racing", icon: Car, color: "text-red-500" },
  { name: "Messenger", path: "/messenger", icon: MessageCircle, color: "text-cyan-500" },
  { name: "Influ-King", path: "/influ-king", icon: Star, color: "text-yellow-500" },
  { name: "Megaforum", path: "/megaforum", icon: MessageSquare, color: "text-emerald-500" },
  { name: "Online Psychologist", path: "/psychologist", icon: Brain, color: "text-pink-500" },
  { name: "Content Studio", path: "/content-studio", icon: Palette, color: "text-indigo-500" },
];

const advancedModules = [
  { name: "Lottery AI", path: "/lottery-ai", icon: Ticket, color: "text-amber-500" },
  { name: "Property Marketplace", path: "/property-marketplace", icon: Building2, color: "text-sky-500" },
  { name: "Membership Community", path: "/membership-community", icon: Users, color: "text-rose-500" },
  { name: "Crystal Energy", path: "/crystal-energy", icon: Gem, color: "text-violet-500" },
  { name: "DNA Memory", path: "/dna-memory", icon: Dna, color: "text-cyan-500" },
  { name: "Reincarnation Social", path: "/reincarnation-social", icon: RotateCcw, color: "text-fuchsia-500" },
  { name: "Blockchain Confessions", path: "/blockchain-confessions", icon: Link2, color: "text-slate-400" },
  { name: "Phobia Trading", path: "/phobia-trading", icon: Bug, color: "text-orange-500" },
  { name: "Multiverse Network", path: "/multiverse-network", icon: SparklesIcon, color: "text-indigo-500" },
  { name: "Live Concerts", path: "/live-concerts", icon: Music, color: "text-red-500" },
];

const entertainmentModules = [
  { name: "Nutrition Hub", path: "/nutrition-hub", icon: Apple, color: "text-green-500" },
  { name: "Virtual Pet", path: "/virtual-pet", icon: PawPrint, color: "text-pink-500" },
  { name: "Astrology", path: "/astrology", icon: Star, color: "text-purple-500" },
  { name: "Character Arena", path: "/character-arena", icon: Trophy, color: "text-orange-500" },
  { name: "Horse Racing", path: "/horse-racing", icon: Trophy, color: "text-amber-500" },
  { name: "Football Arena", path: "/football-arena", icon: Trophy, color: "text-emerald-500" },
  { name: "Basketball Arena", path: "/basketball-arena", icon: Trophy, color: "text-orange-500" },
  { name: "Hockey Arena", path: "/hockey-arena", icon: Trophy, color: "text-cyan-500" },
  { name: "Tennis Arena", path: "/tennis-arena", icon: Trophy, color: "text-lime-500" },
  { name: "American Football", path: "/american-football-arena", icon: Trophy, color: "text-green-500" },
  { name: "Comedy Club", path: "/comedy-club", icon: Mic2, color: "text-fuchsia-500" },
  { name: "AI Tattoo", path: "/ai-tattoo", icon: ImageIcon, color: "text-slate-400" },
  { name: "Mystery Box", path: "/mystery-box", icon: Gift, color: "text-violet-500" },
  { name: "Secret Santa", path: "/secret-santa", icon: Gift, color: "text-rose-500" },
  { name: "Vacationer", path: "/vacationer", icon: Plane, color: "text-sky-500" },
];

const visionaryModules = [
  { name: "Dating", path: "/dating", icon: Heart, color: "text-rose-500" },
  { name: "First Aid", path: "/first-aid", icon: SparklesIcon, color: "text-red-500" },
  { name: "Fit & Slim", path: "/fit-slim", icon: Users, color: "text-green-500" },
  { name: "Cooking", path: "/cooking", icon: ChefHat, color: "text-orange-500" },
  { name: "Coffee", path: "/coffee", icon: Star, color: "text-amber-600" },
  { name: "AI Clone", path: "/ai-clone", icon: Bot, color: "text-purple-500" },
  { name: "Glamour World", path: "/glamour-world", icon: Crown, color: "text-pink-500" },
  { name: "Emotion Economy", path: "/emotion-economy", icon: Heart, color: "text-pink-500" },
  { name: "Quantum Social", path: "/quantum-social", icon: Atom, color: "text-cyan-500" },
];

interface ModuleSectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  modules: typeof coreModules;
  onNavigate: (path: string) => void;
}

function ModuleSection({ title, icon: Icon, iconColor, modules, onNavigate }: ModuleSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-1 pl-2">
        {modules.map((module) => {
          const ModIcon = module.icon;
          return (
            <Button
              key={module.path}
              variant="ghost"
              className="w-full justify-start gap-2 h-auto py-1.5 hover:bg-accent/50 rounded-lg text-sm"
              onClick={() => onNavigate(module.path)}
            >
              <ModIcon className={`h-3.5 w-3.5 ${module.color}`} />
              <span className="font-medium text-xs">{module.name}</span>
            </Button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-[6.75rem] right-3 z-50 bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary rounded-full h-10 w-10"
          aria-label="Wall Dashboard"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dashboard</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-3">
          {/* User Profile */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-3 h-auto py-3 hover:bg-primary/10 rounded-xl"
              onClick={() => handleNavigate(`/profile/${user?.id}`)}
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

          {/* Theme Color Switcher */}
          <ThemeColorSwitcher />

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

          {/* Daily XP Video Reward */}
          {user && <DailyXPVideoReward userId={user.id} />}

          <div className="h-px bg-border" />

          {/* Streaks & Challenges */}
          <StreaksAndChallenges />

          {/* Trending */}
          <TrendingSidebar />

          {/* Live Streams & Audio Rooms */}
          <LiveStreamWidget />
          <AudioRooms />

          {/* Activity Feed */}
          <ActivityFeedCard />

          {/* Trending Hashtags */}
          <TrendingHashtags />

          <div className="h-px bg-border" />

          {/* Quick Actions */}
          <div className="space-y-2">
            <PrivacySettingsDialog />
            <MediaGalleryDialog />
          </div>

          <div className="h-px bg-border" />
          <ModuleSection title="Core Modules" icon={SparklesIcon} iconColor="text-primary" modules={coreModules} onNavigate={handleNavigate} />
          <ModuleSection title="Ecosystem Modules" icon={Crown} iconColor="text-yellow-500" modules={ecosystemModules} onNavigate={handleNavigate} />
          <ModuleSection title="Advanced Modules" icon={SparklesIcon} iconColor="text-primary" modules={advancedModules} onNavigate={handleNavigate} />
          <ModuleSection title="Entertainment" icon={Gift} iconColor="text-violet-500" modules={entertainmentModules} onNavigate={handleNavigate} />
          <ModuleSection title="Visionary Social" icon={Atom} iconColor="text-cyan-500" modules={visionaryModules} onNavigate={handleNavigate} />

          <div className="h-px bg-border" />

          {/* Settings */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg"
            onClick={() => handleNavigate("/settings")}
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-sm">Settings</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
