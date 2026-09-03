import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, MessageCircle, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings, Bell, Music, Euro, Trophy, Award, Moon, Sun, Shirt, PawPrint, Gift, Zap, Home, Leaf, ImageIcon, BookOpen, Calculator, FlaskConical, Palette, DollarSign, Image, Gem, Building2, Coffee, Bot, Globe, Lock, Mic2, Car, Clock, Dna, Scale, Shield, AlertTriangle, TrendingUp, Ghost, PenTool, Ticket, Info, Megaphone, Scissors, Diamond, RefreshCw, Cake, Library, Film, Puzzle, Compass, ChevronDown, Pin, PinOff } from "lucide-react";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notifications/NotificationBell";
import MessagesBell from "@/components/messenger/MessagesBell";
import { AICreditsBalanceWidget } from "@/components/ai-credits/AICreditsBalanceWidget";
// FreeTierBalanceWidget import removed — paid-only model
import { GlobalCurrencySwitcher } from "@/components/GlobalCurrencySwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";


import megatalentLogo from "@/assets/megatalent-logo.png";
import uniqueLogo from "@/assets/unique-logo.webp";
import { Age16Badge } from "@/components/Age16Badge";

import GlobalSearch from "@/components/GlobalSearch";
import { MobileCreditsPill } from "@/components/wall/MobileCreditsPill";
import { useAuth } from "@/contexts/AuthContext";
import { MemberBadge } from "@/components/club/MemberBadge";
import { BetaTesterNotice } from "@/components/onboarding/BetaTesterNotice";
import { useShortcuts } from "@/hooks/useShortcuts";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { shortcuts, toggle: toggleShortcutPath } = useShortcuts();
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    checkAdminRole(user.id);
  }, [user?.id]);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPage = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore cache errors */
    }

    const url = new URL(window.location.href);
    url.searchParams.set("_refresh", Date.now().toString());
    window.location.href = url.toString();
  };

  const mainNavItems = [
    { path: "/wall", label: "Wall", icon: MessageSquare },
    { path: "/games-hub", label: "Games", icon: Gamepad2 },
    { path: "/jobs", label: "Work", icon: Briefcase },
    { path: "/promotions", label: "Promotions", icon: Megaphone, requiresAuth: true },
    { path: "/rewards", label: "Rewards", icon: Trophy },
    { path: "/megatalent", label: "Megatalent", icon: Crown, premium: true },
    
  ];

  const visibleMainNavItems = mainNavItems.filter((item) => !item.requiresAuth || user);

  const clipBattlesServices = [
    { path: "/clip-battles", label: "Clip Battles", icon: Film },
  ];

  const challengeServices = [
    { path: "/eco-challenge", label: "Eco Challenge — Daily Good Deeds", icon: Leaf },
    { path: "/healthy-challenge", label: "Healthy Challenge — Move · Eat · Train", icon: Activity },
  ];

  const learningServices = [
    { path: "/education", label: "Education", icon: GraduationCap },
    { path: "/ai-mentor", label: "AI Personal Mentor", icon: UserCircle },
    { path: "/brain-duel", label: "BrainDuel - Knowledge Battle", icon: Trophy },
  ];

  // Brand Arena is hidden from the public while it is being built — admins only
  const brandArenaServices = isAdmin
    ? [{ path: "/brand-battle", label: "Brand Battle Arena", icon: Trophy }]
    : [];

  const kidsAcademyServices = [
    { path: "/kids-channel", label: "Kids Channel Hub", icon: Sparkles },
    { path: "/kids-channel/certificate-gallery", label: "Kids Certificates", icon: Video },
    { path: "/coloring-pages", label: "Coloring Pages", icon: Palette },
    { path: "/kids-puzzles", label: "Kids Puzzles", icon: Puzzle },
    { path: "/kids-homework", label: "Homework Helper (6-12y)", icon: BookOpen },
    { path: "/kids-story-creator", label: "Story Creator (6-12y)", icon: BookOpen },
    { path: "/kids-science-lab", label: "Science Lab (6-12y)", icon: FlaskConical },
    { path: "/kids-drawing-buddy", label: "Drawing Buddy (6-12y)", icon: Palette },
    { path: "/kids-reading-companion", label: "Reading Companion (6-12y)", icon: BookOpen },
    { path: "/fairytale-book", label: "Fairytale Book Generator", icon: BookOpen },
    { path: "/kids-academy?tab=cards", label: "Kids Collectibles (cards)", icon: Library },
    { path: "/teen-career-counselor", label: "Career Counselor (13-18y)", icon: Briefcase },
  ];

  const otherServiceGroups: { category: string; items: { path: string; label: string; icon: any }[] }[] = [
    {
      category: "AI Tools & Studios",
      items: [
        { path: "/creative-forge", label: "CreativeForge - AI Writing Studio", icon: PenTool },
        { path: "/content-studio", label: "Content Studio", icon: Sparkles },
        { path: "/ai-generation", label: "AI Generation", icon: Sparkles },
        { path: "/analyzer", label: "Universal Analyzer", icon: Sparkles },
        { path: "/video-ad-generator", label: "Video Ad Generator", icon: Video },
        { path: "/ai-video-creator", label: "AI Video Creator", icon: Video },
        { path: "/photo-styler", label: "Photo Styler - Art Styles", icon: Palette },
        { path: "/ai-tattoo", label: "AI Tattoo Designer", icon: ImageIcon },
        { path: "/ai-clone", label: "AI Personality Clone", icon: Bot },
        { path: "/pet-translator", label: "AI Pet Translator", icon: PawPrint },
        { path: "/handwriting", label: "Handwriting Analyzer", icon: PenTool },
        { path: "/future-face", label: "Future Face - Age Prediction", icon: Clock },
        { path: "/photo-restoration", label: "Photo Restoration", icon: Image },
        { path: "/stock-content-library", label: "Stock Content Library", icon: ImageIcon },
        { path: "/brand-builder", label: "Brand Builder", icon: Sparkles },
        { path: "/home-designer", label: "Home Designer", icon: Home },
        { path: "/beauty-studio", label: "Beauty Studio", icon: Sparkles },
        { path: "/fashion-studio", label: "Fashion Studio", icon: Palette },
        { path: "/guess-age", label: "Guess My Age", icon: Cake },
        { path: "/face-insight", label: "Face Insight Studio", icon: Sparkles },
      ] },
    {
      category: "Mystical & Spiritual",
      items: [
        { path: "/past-life", label: "Past Life Explorer", icon: Clock },
        { path: "/lottery-ai", label: "Lottery Numbers - AI Predictions", icon: Sparkles },
        { path: "/astrology", label: "Astrology", icon: Star },
        { path: "/dream-journal", label: "Dream Analyzer", icon: Brain },
        { path: "/crystal-energy-network", label: "Crystal & Energy Network", icon: Gem },
        { path: "/time-capsule", label: "Time Capsule Network", icon: Clock },
        { path: "/time-reversal", label: "Time Reversal Social", icon: Clock },
        { path: "/holographic-avatars", label: "Holographic Avatars", icon: Sparkles },
      ] },
    {
      category: "Social & Dating",
      items: [
        { path: "/anonymous-date", label: "Anonymous Date", icon: Heart },
        { path: "/dating", label: "Dating", icon: Heart },
        { path: "/best-friend", label: "Best Friend", icon: UserPlus },
        { path: "/messenger", label: "Messenger", icon: Mail },
        { path: "/megaforum", label: "Megaforum", icon: Users },
        { path: "/companions", label: "Character Companions", icon: MessageCircle },
        { path: "/emotion-economy", label: "Emotion Economy", icon: Heart },
        { path: "/referral", label: "Invite friend", icon: User },
      ] },
    {
      category: "Health & Wellness",
      items: [
        { path: "/wellness", label: "Wellness & Relaxation", icon: Heart },
        { path: "/psychologist", label: "Psychologist", icon: Brain },
        { path: "/first-aid", label: "First Aid", icon: Activity },
        { path: "/fit-slim", label: "Fit & Slim", icon: Apple },
        { path: "/nutrition-hub", label: "Nutrition Hub", icon: Apple },
        { path: "/phobia-trading", label: "Phobia Network", icon: Brain },
        { path: "/safety-prevention", label: "Safety & Bullying Prevention", icon: Shield },
        { path: "/lie-detector", label: "Lie Detector Chat", icon: Shield },
      ] },
    {
      category: "Sports Arenas",
      items: [
        { path: "/character-arena", label: "Character Arena", icon: Trophy },
        { path: "/card-collections", label: "Collectible Cards", icon: Library },
        
        { path: "/horse-racing", label: "Horse Racing Arena", icon: Trophy },
      ] },
    {
      category: "Entertainment & Lifestyle",
      items: [
        { path: "/shadow-arena", label: "Shadow Arena - Horror Platform", icon: Ghost },
        { path: "/live-concerts", label: "Live Concerts", icon: Music },
        { path: "/masterchef-subscription", label: "KitchenStars Competition", icon: ChefHat },
        { path: "/comedy-club", label: "Comedy Club - Stand Up", icon: Mic2 },
        { path: "/influ-king", label: "Influ-King", icon: Star },
        
        { path: "/virtual-escape-room", label: "Virtual Escape Room", icon: Lock },
        { path: "/mystery-box", label: "Mystery Box", icon: Gift },
        { path: "/secret-santa", label: "Social Gifts Hub", icon: Gift },
        { path: "/vacationer", label: "Vacationer", icon: Plane },
        { path: "/cooking", label: "Cooking", icon: ChefHat },
        { path: "/coffee", label: "Coffee Community", icon: Coffee },
        { path: "/virtual-pet", label: "Virtual Pet", icon: PawPrint },
        { path: "/adult-puzzles", label: "Adult Puzzles", icon: Puzzle },
        { path: "/spin-solve", label: "Spin & Solve", icon: Puzzle },
        { path: "/unlock-videos", label: "Unlock Videos — Watch Half Free", icon: Video },
      ] },
    {
      category: "Marketplaces & Commerce",
      items: [
        { path: "/property-marketplace", label: "Property Marketplace", icon: Building2 },
        { path: "/marketplace", label: "Skills Marketplace", icon: Briefcase },
        
        { path: "/bazaar", label: "Bazaar", icon: Store },
        { path: "/coupon-marketplace", label: "Coupon Marketplace", icon: Ticket },
        { path: "/auction", label: "Online Auctions", icon: Gavel },
        { path: "/antique-appraisal", label: "Antique Appraisal", icon: Gem },
      ] },
    {
      category: "Learning & Growth",
      items: [
        { path: "/tutorial-platform", label: "Tutorial & Course Platform", icon: GraduationCap },
        { path: "/iq-platform", label: "IQ Platform", icon: Brain },
      ] },

    {
      category: "About",
      items: [
        { path: "/about-platform", label: "About the Platform — Full Tour", icon: Info },
        { path: "/suggestions", label: "Suggestions", icon: MessageSquare },
      ] },
    {
      category: "Legal",
      items: [
        { path: "/terms", label: "Terms", icon: FileText },
      ] },
  ];

  const otherServices = otherServiceGroups.flatMap((g) => g.items);

  // All known destinations — used to resolve a nice label when pinning the
  // current page to the personal "For you" menu.
  const allNavItems = [
    ...mainNavItems,
    ...clipBattlesServices,
    ...challengeServices,
    ...learningServices,
    ...kidsAcademyServices,
    ...otherServices,
  ];
  const currentNavItem = allNavItems.find((i) => i.path === location.pathname);
  const isCurrentPinned = shortcuts.some((s) => s.path === location.pathname);
  const pinCurrentPage = () => {
    if (!currentNavItem) return;
    toggleShortcutPath({ path: currentNavItem.path, label: currentNavItem.label });
  };

  const isClipBattlesServiceActive = clipBattlesServices.some(item => location.pathname === item.path);
  const isLearningServiceActive = learningServices.some(item => location.pathname === item.path);
  const isBrandArenaActive = brandArenaServices.some(item => location.pathname === item.path) || location.pathname.startsWith('/brand-battle');
  const isKidsAcademyServiceActive = kidsAcademyServices.some(item => location.pathname === item.path) || location.pathname.startsWith('/kids');
    const isChallengeServiceActive = challengeServices.some(item => location.pathname === item.path);
    const isOtherServiceActive = otherServices.some(item => location.pathname === item.path);

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-background backdrop-blur-xl border-b border-border/50 z-50 shadow-[0_1px_20px_rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 h-16 lg:items-baseline lg:pt-4">
          <Link to="/" className="flex items-center gap-1 group lg:items-baseline lg:gap-2 lg:mr-4 xl:mr-8 min-w-0 shrink-0">

            {/* Brand wordmark — fully text-based so U matches nique */}
            <span
              className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent transition-all duration-500 group-hover:scale-110 notranslate shrink-0"
              translate="no"
              style={ {
                backgroundImage:
                  "linear-gradient(90deg, hsl(270 91% 60%), hsl(330 100% 60%), hsl(270 91% 60%))",
                backgroundSize: "200% auto" }}
            >
              Unique
            </span>

            <Age16Badge size="xs" withLabel={false} className="self-center shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBetaNotice(true)}
              className="gap-1 text-primary hover:bg-primary/10 px-0 h-8 w-8 sm:px-2 sm:w-auto inline-flex shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold hidden sm:inline">Beta</span>
            </Button>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 min-w-0 items-baseline space-x-1 -mt-2 overflow-x-auto scrollbar-hide [&>*]:shrink-0 [&_button]:whitespace-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary">
                  <Compass className="h-4 w-4" />
                  For you
                  {shortcuts.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{shortcuts.length}</Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-popover/95 backdrop-blur-xl border-border/50">
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your shortcuts
                </DropdownMenuLabel>
                {shortcuts.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    No shortcuts yet. Pin any page you like and it will show up here.
                  </div>
                ) : (
                  shortcuts.map((s) => (
                    <DropdownMenuItem key={s.path} asChild>
                      <Link to={s.path} className="w-full cursor-pointer">
                        <span className="mr-2">{s.emoji || "\u2b50"}</span>
                        {s.label}
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                {currentNavItem && (
                  <DropdownMenuItem onClick={pinCurrentPage} className="cursor-pointer">
                    {isCurrentPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                    {isCurrentPinned ? "Unpin this page" : "Pin this page"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/about-platform" className="w-full cursor-pointer">
                    <Info className="h-4 w-4 mr-2" />
                    Guided tour — what is where
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isChallengeServiceActive ? "premium" : "ghost"}>
                  <Zap className="h-4 w-4" />
                  Challenges
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {challengeServices.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isClipBattlesServiceActive ? "premium" : "ghost"}>
                  <Film className="h-4 w-4" />
                  Clip Battles
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {clipBattlesServices.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {visibleMainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "premium" : "ghost"}
                    className="relative"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.premium && (
                      <Badge variant="secondary" className="ml-1 bg-gold text-gold-foreground">
                        {(item as any).badge || "Premium"}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
            

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isLearningServiceActive ? "premium" : "ghost"}>
                  <GraduationCap className="h-4 w-4" />
                  Learning
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {learningServices.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isBrandArenaActive ? "premium" : "ghost"}
                  className="relative bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 hover:from-amber-500/20 hover:via-pink-500/20 hover:to-purple-500/20"
                >
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Brand Arena
                  <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-amber-400 to-pink-500 text-white text-[10px] px-1.5">
                    HOT
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  Brand Battle Arena
                </DropdownMenuLabel>
                {brandArenaServices.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            )}


            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isKidsAcademyServiceActive ? "premium" : "ghost"}>
                  <Sparkles className="h-4 w-4" />
                  Kids Academy
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {kidsAcademyServices.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isOtherServiceActive ? "premium" : "ghost"}>
                  <MoreHorizontal className="h-4 w-4" />
                  {"Other Services"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {otherServiceGroups.map((group, gIdx) => (
                  <div key={group.category}>
                    {gIdx > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                      {group.category}
                    </DropdownMenuLabel>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="w-full cursor-pointer">
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden lg:flex items-center space-x-2 shrink-0">

            {/* Full menu (all sections) */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open full menu"
              title="All sections"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Theme Toggle — visible for all users */}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh page"
              title="Refresh page"
              onClick={handleRefreshPage}
              disabled={isRefreshing}
              className="hidden sm:inline-flex"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>



            {user ? (
              <>
                {/* Global Currency Switcher */}
                <GlobalCurrencySwitcher />

                {/* AI Credits */}
                <div className="hidden sm:block">
                  <AICreditsBalanceWidget compact />
                </div>

                {/* Free Tier Credits removed — paid-only model */}

                {/* Wall Notifications */}
                <MessagesBell />
                <NotificationBell />


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MemberBadge userId={user.id} size="sm">
                        <UserCircle className="h-5 w-5" />
                      </MemberBadge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user.id}`} className="w-full cursor-pointer">
                        <UserCircle className="h-4 w-4 mr-2" />
                        {"View profile"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/edit-profile" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        {"Edit profile"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/club" className="w-full cursor-pointer">
                        <Ticket className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent font-semibold">
                          VIP Membership Club
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/premium" className="w-full cursor-pointer">
                        <Crown className="h-4 w-4 mr-2 text-primary" />
                        UniqueApp Premium
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/premium-store" className="w-full cursor-pointer">
                        <Award className="h-4 w-4 mr-2" />
                        Premium Store
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ai-credits" className="w-full cursor-pointer">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {"AI Credits"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRefreshPage} className="cursor-pointer">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                      {"Refresh page"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/earnings" className="w-full cursor-pointer">
                        <Euro className="h-4 w-4 mr-2" />
                        {"My earnings"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/contact" className="w-full cursor-pointer">
                        <Mail className="h-4 w-4 mr-2" />
                        {"Contact"}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          {"Admin Panel"}
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleLogout} variant="outline">
                  {"Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">{"Login"}</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero">{"Register"}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile action icons — grouped and compact so they never overlap */}
          <div className="flex items-center gap-0.5 lg:hidden shrink-0">
            {user && (
              <>
                <MessagesBell className="h-8 w-8 mr-1" />
                <NotificationBell className="h-8 w-8 mr-1" />
              </>
            )}
            <ThemeToggle className="h-8 w-8" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh page"
              title="Refresh page"
              onClick={handleRefreshPage}
              disabled={isRefreshing}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="py-3 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">

            <MobileCreditsPill />

            {/* For you — personal shortcuts */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-primary flex items-center gap-2">
                <Compass className="h-3.5 w-3.5" />
                For you
              </div>
              {shortcuts.length === 0 ? (
                <p className="px-3 pb-1 text-xs text-muted-foreground">
                  Pin your favourite pages and they will appear here.
                </p>
              ) : (
                shortcuts.map((s) => (
                  <Link key={s.path} to={s.path} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm py-2" size="sm">
                      <span className="mr-1">{s.emoji || "\u2b50"}</span>
                      {s.label}
                    </Button>
                  </Link>
                ))
              )}
              {currentNavItem && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm mt-1"
                  onClick={pinCurrentPage}
                >
                  {isCurrentPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                  {isCurrentPinned ? "Unpin this page" : "Pin this page"}
                </Button>
              )}
              <Link to="/about-platform" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-sm py-2 text-primary" size="sm">
                  <Info className="h-4 w-4" />
                  Guided tour — what is where
                </Button>
              </Link>
            </div>

            <div className="border-t border-border/50 my-2" />

            {/* VIP Membership Club */}
            <Link to="/club" onClick={() => setIsMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm py-2 gap-2 text-amber-600 font-semibold"
                size="sm"
              >
                <Ticket className="h-4 w-4 text-amber-500" />
                VIP Membership Club
              </Button>
            </Link>

            {/* Challenges Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Challenges
              </div>
              {challengeServices.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "premium" : "ghost"}
                      className="w-full justify-start text-sm py-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border/50 my-2" />

            {/* Clip Battles Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Clip Battles
              </div>
              {clipBattlesServices.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "premium" : "ghost"}
                      className="w-full justify-start text-sm py-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Main Navigation Items */}
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Discover
            </div>
            {visibleMainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPremium = 'premium' in item && item.premium;
              
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive ? "premium" : "ghost"}
                    className="w-full justify-start relative text-sm py-2"
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {isPremium && (
                      <Badge variant="secondary" className="ml-auto bg-gold text-gold-foreground text-[10px]">
                        {(item as any).badge || "Premium"}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* Learning Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Learning
              </div>
              {learningServices.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "premium" : "ghost"}
                      className="w-full justify-start text-sm py-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Brand Arena Section — admin only while under construction */}
            {isAdmin && (
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Brand Arena
                <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-pink-500 text-white text-[9px] px-1.5">HOT</Badge>
              </div>
              {brandArenaServices.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "premium" : "ghost"}
                      className="w-full justify-start text-sm py-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
            )}

            {/* Kids Academy Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Kids Academy
              </div>
              {kidsAcademyServices.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "premium" : "ghost"}
                      className="w-full justify-start text-sm py-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
            
            
            {/* Other Services Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                {"Other Services"}
              </div>
              {otherServiceGroups.map((group) => (
                <div key={group.category} className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileGroup((g) => (g === group.category ? null : group.category))
                    }
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 border-t border-border/40"
                  >
                    <span>{group.category} <span className="font-normal normal-case opacity-70">({group.items.length})</span></span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${openMobileGroup === group.category ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openMobileGroup === group.category && group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                        <Button
                          variant={isActive ? "premium" : "ghost"}
                          className="w-full justify-start text-sm py-2"
                          size="sm"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="pt-3 space-y-1.5">
              <Button
                variant="outline"
                className="w-full justify-start text-sm gap-2 border-primary/30 text-primary hover:bg-primary/10"
                size="sm"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowBetaNotice(true);
                }}
              >
                <Sparkles className="h-4 w-4" />
                {"Beta testing"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm gap-2"
                size="sm"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleRefreshPage();
                }}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {"Refresh page"}
              </Button>
              {user ? (
                <>
                  <Link to={`/profile/${user.id}`} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <UserCircle className="h-4 w-4 mr-2" />
                      {"View profile"}
                    </Button>
                  </Link>
                  <Link to="/edit-profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      {"Edit profile"}
                    </Button>
                  </Link>
                  <Link to="/ai-credits" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {"AI Credits"}
                    </Button>
                  </Link>
                  <Link to="/earnings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Euro className="h-4 w-4 mr-2" />
                      {"My earnings"}
                    </Button>
                  </Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {"Contact"}
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {"Admin Panel"}
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="outline" className="w-full text-sm" size="sm">
                    {"Logout"}
                  </Button>
                </>
              ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-sm" size="sm">{"Login"}</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full text-sm" size="sm">{"Register"}</Button>
                </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showBetaNotice && (
        <BetaTesterNotice onClose={() => setShowBetaNotice(false)} />
      )}
    </nav>
  );
};

export default Navbar;
