import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  Ticket, 
  Building2, 
  Users, 
  Gem, 
  Dna, 
  RotateCcw, 
  Link2, 
  Bug, 
  Sparkles as SparklesIcon, 
  Music,
  ChevronDown,
  ChevronUp,
  Crown,
  Clock,
  Timer,
  ChefHat,
  Car,
  MessageCircle,
  Star,
  MessageSquare,
  Brain,
  Palette,
  Apple,
  PawPrint,
  Trophy,
  Mic2,
  Image as ImageIcon,
  Gift,
  Plane,
  Heart,
  Bot,
  Globe,
  Atom,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NotificationBell } from "./NotificationBell";
import { PrivacySettingsDialog } from "./PrivacySettingsDialog";
import { MediaGalleryDialog } from "./MediaGalleryDialog";
import { EnhancedCreatePost } from "./EnhancedCreatePost";

interface WallSidebarProps {
  onPostCreated?: () => void;
}

export function WallSidebar({ onPostCreated }: WallSidebarProps) {
  const navigate = useNavigate();
  const [modulesOpen, setModulesOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [coreOpen, setCoreOpen] = useState(false);
  const [entertainmentOpen, setEntertainmentOpen] = useState(false);
  const [visionaryOpen, setVisionaryOpen] = useState(false);

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

  // Core Modules (The 10 requested modules from this task)
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

  // Ecosystem Modules (The 10 premium ecosystem modules)
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

  // Advanced Modules (Additional 10 modules)
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

  // Entertainment & Utility Modules (Batch 8)
  const entertainmentModules = [
    { name: "Nutrition Hub", path: "/nutrition-hub", icon: Apple, color: "text-green-500" },
    { name: "Virtual Pet", path: "/virtual-pet", icon: PawPrint, color: "text-pink-500" },
    { name: "Astrology", path: "/astrology", icon: Star, color: "text-purple-500" },
    { name: "Character Arena", path: "/character-arena", icon: Trophy, color: "text-orange-500" },
    { name: "Horse Racing", path: "/horse-racing", icon: Trophy, color: "text-amber-500" },
    { name: "Comedy Club", path: "/comedy-club", icon: Mic2, color: "text-fuchsia-500" },
    { name: "AI Tattoo", path: "/ai-tattoo", icon: ImageIcon, color: "text-slate-400" },
    { name: "Mystery Box", path: "/mystery-box", icon: Gift, color: "text-violet-500" },
    { name: "Secret Santa", path: "/secret-santa", icon: Gift, color: "text-rose-500" },
    { name: "Vacationer", path: "/vacationer", icon: Plane, color: "text-sky-500" },
  ];

  // Visionary Social & Lifestyle Modules (Batch 9)
  const visionaryModules = [
    { name: "Dating", path: "/dating", icon: Heart, color: "text-rose-500" },
    { name: "First Aid", path: "/first-aid", icon: SparklesIcon, color: "text-red-500" },
    { name: "Fit & Slim", path: "/fit-slim", icon: Users, color: "text-green-500" },
    { name: "Cooking", path: "/cooking", icon: ChefHat, color: "text-orange-500" },
    { name: "Coffee", path: "/coffee", icon: Star, color: "text-amber-600" },
    { name: "AI Clone", path: "/ai-clone", icon: Bot, color: "text-purple-500" },
    
    { name: "Emotion Economy", path: "/emotion-economy", icon: Heart, color: "text-pink-500" },
    { name: "Quantum Social", path: "/quantum-social", icon: Atom, color: "text-cyan-500" },
  ];

  return (
    <div className="w-64 lg:w-80 h-[calc(100vh-112px)] sticky top-0 border-r bg-card/30 backdrop-blur-xl overflow-y-auto">
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
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            onClick={() => navigate("/creator-studio")}
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Creator Studio</span>
          </Button>
        </div>

        <div className="h-px bg-border" />

        {/* Core Modules Section (10 requested modules) */}
        <Collapsible open={coreOpen} onOpenChange={setCoreOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Core Modules</span>
              </div>
              {coreOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {coreModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.path}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg text-sm"
                  onClick={() => navigate(module.path)}
                >
                  <Icon className={`h-4 w-4 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Ecosystem Modules Section (Premium 10) */}
        <Collapsible open={ecosystemOpen} onOpenChange={setEcosystemOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-sm">Ecosystem Modules</span>
              </div>
              {ecosystemOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {ecosystemModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.path}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg text-sm"
                  onClick={() => navigate(module.path)}
                >
                  <Icon className={`h-4 w-4 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Advanced Modules Section */}
        <Collapsible open={modulesOpen} onOpenChange={setModulesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Advanced Modules</span>
              </div>
              {modulesOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {advancedModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.path}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg text-sm"
                  onClick={() => navigate(module.path)}
                >
                  <Icon className={`h-4 w-4 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Entertainment & Utility Modules Section */}
        <Collapsible open={entertainmentOpen} onOpenChange={setEntertainmentOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <Gift className="h-5 w-5 text-violet-500" />
                <span className="font-medium text-sm">Entertainment</span>
              </div>
              {entertainmentOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {entertainmentModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.path}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg text-sm"
                  onClick={() => navigate(module.path)}
                >
                  <Icon className={`h-4 w-4 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Visionary Social & Lifestyle Modules Section (Batch 9) */}
        <Collapsible open={visionaryOpen} onOpenChange={setVisionaryOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2.5 h-auto py-2.5 hover:bg-primary/10 rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <Atom className="h-5 w-5 text-cyan-500" />
                <span className="font-medium text-sm">Visionary Social</span>
              </div>
              {visionaryOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2">
            {visionaryModules.map((module) => {
              const Icon = module.icon;
              return (
                <Button
                  key={module.path}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg text-sm"
                  onClick={() => navigate(module.path)}
                >
                  <Icon className={`h-4 w-4 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <div className="h-px bg-border" />

        {/* Settings */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 h-auto py-2 hover:bg-accent/50 rounded-lg"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}
