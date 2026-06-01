import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, MessageCircle, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings, Bell, Music, Euro, Trophy, Award, Moon, Sun, Shirt, PawPrint, Gift, Zap, Home, Leaf, ImageIcon, BookOpen, Calculator, FlaskConical, Palette, Calendar, DollarSign, Image, Gem, Building2, Coffee, Bot, Globe, Lock, Mic2, Car, Clock, Dna, Scale, Shield, AlertTriangle, TrendingUp, Ghost, PenTool, Ticket } from "lucide-react";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notifications/NotificationBell";
import MessagesBell from "@/components/messenger/MessagesBell";
import { AICreditsBalanceWidget } from "@/components/ai-credits/AICreditsBalanceWidget";
// FreeTierBalanceWidget import removed — paid-only model
import { GlobalCurrencySwitcher } from "@/components/GlobalCurrencySwitcher";

import megatalentLogo from "@/assets/megatalent-logo.png";
import uniqueLogo from "@/assets/unique-logo.webp";
import { Age16Badge } from "@/components/Age16Badge";

import GlobalSearch from "@/components/GlobalSearch";
import { MobileCreditsPill } from "@/components/wall/MobileCreditsPill";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const mainNavItems = [
    { path: "/wall", label: "Wall", icon: MessageSquare },
    { path: "/games-hub", label: "Games", icon: Gamepad2 },
    { path: "/jobs", label: "Work", icon: Briefcase },
    { path: "/rewards", label: "Rewards", icon: Trophy },
    { path: "/megatalent", label: "Megatalent", icon: Crown, premium: true },
  ];

  const learningServices = [
    { path: "/education", label: "Education", icon: GraduationCap },
    { path: "/ai-mentor", label: "AI Personal Mentor", icon: UserCircle },
    { path: "/kids-channel", label: "Kids Channel", icon: Video },
    { path: "/coloring-pages", label: "Coloring Pages", icon: Palette },
    { path: "/brand-battle", label: "Brand Battle Arena", icon: Trophy },
    { path: "/brain-duel", label: "BrainDuel - Knowledge Battle", icon: Trophy },
  ];

  const kidsAcademyServices = [
    { path: "/kids", label: "Kids Academy Hub", icon: Sparkles },
    { path: "/kids-homework", label: "Homework Helper (6-12y)", icon: BookOpen },
    { path: "/kids-story-creator", label: "Story Creator (6-12y)", icon: BookOpen },
    { path: "/kids-science-lab", label: "Science Lab (6-12y)", icon: FlaskConical },
    { path: "/kids-drawing-buddy", label: "Drawing Buddy (6-12y)", icon: Palette },
    { path: "/kids-reading-companion", label: "Reading Companion (6-12y)", icon: BookOpen },
    { path: "/teen-career-counselor", label: "Career Counselor (13-18y)", icon: Briefcase },
  ];

  const fundraisingServices = [
    { path: "/fundraising", label: "Fundraising Hub", icon: Heart },
    { path: "/fundraising/medical", label: "Medical Fundraising (6%)", icon: Heart },
    { path: "/fundraising/dream", label: "Dream Maker (7%)", icon: Sparkles },
    { path: "/fundraising/hero", label: "Community Hero (5%)", icon: Shield },
    { path: "/fundraising/pet", label: "Pet Rescue (6%)", icon: PawPrint },
    { path: "/fundraising/student", label: "Student Support (5%)", icon: GraduationCap },
    { path: "/fundraising/crisis", label: "Crisis Relief (8%)", icon: AlertTriangle },
    { path: "/fundraising/talent", label: "Talent Sponsorship (10%)", icon: Star },
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
        { path: "/ai-tattoo", label: "AI Tattoo Designer", icon: ImageIcon },
        { path: "/ai-clone", label: "AI Personality Clone", icon: Bot },
        { path: "/pet-translator", label: "AI Pet Translator", icon: PawPrint },
        { path: "/handwriting", label: "Handwriting Analyzer", icon: PenTool },
        { path: "/future-face", label: "Future Face - Age Prediction", icon: Clock },
        { path: "/photo-restoration", label: "Photo Restoration", icon: Image },
        { path: "/stock-content-library", label: "Stock Content Library", icon: ImageIcon },
        { path: "/virtual-influencer-agency", label: "Virtual Influencer Agency", icon: Users },
        { path: "/brand-builder", label: "Brand Builder", icon: Sparkles },
        { path: "/home-designer", label: "Home Designer", icon: Home },
        { path: "/beauty-studio", label: "Beauty Studio", icon: Sparkles },
        { path: "/fashion-studio", label: "Fashion Studio", icon: Palette },
      ],
    },
    {
      category: "Mystical & Spiritual",
      items: [
        { path: "/past-life", label: "Past Life Explorer", icon: Clock },
        { path: "/lottery-ai", label: "Lottery Numbers - AI Predictions", icon: Sparkles },
        { path: "/astrology", label: "Astrology", icon: Star },
        { path: "/dream-journal", label: "Dream Analyzer", icon: Brain },
        { path: "/crystal-energy-network", label: "Crystal & Energy Network", icon: Gem },
        { path: "/dna-memory-network", label: "DNA Social Memory Network", icon: Dna },
        { path: "/reincarnation-social", label: "Reincarnation Social", icon: Sparkles },
        { path: "/blockchain-confessions", label: "Blockchain Confessions", icon: Scale },
        { path: "/multiverse-network", label: "Multiverse Profile Network", icon: Globe },
        { path: "/quantum-social", label: "Quantum Social Network", icon: Zap },
        { path: "/time-capsule", label: "Time Capsule Network", icon: Clock },
        { path: "/time-reversal", label: "Time Reversal Social", icon: Clock },
        { path: "/holographic-avatars", label: "Holographic Avatars", icon: Sparkles },
      ],
    },
    {
      category: "Social & Dating",
      items: [
        { path: "/anonymous-date", label: "Anonymous Date", icon: Heart },
        { path: "/dating", label: "Dating", icon: Heart },
        { path: "/best-friend", label: "Best Friend", icon: UserPlus },
        { path: "/membership-community", label: "Membership Community", icon: Users },
        { path: "/messenger", label: "Messenger", icon: Mail },
        { path: "/megaforum", label: "Megaforum", icon: Users },
        { path: "/companions", label: "Character Companions", icon: MessageCircle },
        { path: "/emotion-economy", label: "Emotion Economy", icon: Heart },
        { path: "/referral", label: "Invite friend", icon: User },
      ],
    },
    {
      category: "Health & Wellness",
      items: [
        { path: "/wellness", label: "Wellness & Relaxation", icon: Heart },
        { path: "/psychologist", label: "Psychologist", icon: Brain },
        { path: "/first-aid", label: "First Aid", icon: Activity },
        { path: "/fit-slim", label: "Fit & Slim", icon: Apple },
        { path: "/nutrition-hub", label: "Nutrition Hub", icon: Apple },
        { path: "/phobia-trading", label: "Phobia Trading Network", icon: Brain },
        { path: "/safety-prevention", label: "Safety & Bullying Prevention", icon: Shield },
        { path: "/lie-detector", label: "Lie Detector Chat", icon: Shield },
      ],
    },
    {
      category: "Sports Arenas",
      items: [
        { path: "/character-arena", label: "Character Arena", icon: Trophy },
        { path: "/horse-racing", label: "Horse Racing Arena", icon: Trophy },
        { path: "/football-arena", label: "Football Arena", icon: Trophy },
        { path: "/basketball-arena", label: "Basketball Arena", icon: Trophy },
        { path: "/hockey-arena", label: "Hockey Arena", icon: Trophy },
        { path: "/tennis-arena", label: "Tennis Arena", icon: Trophy },
        { path: "/american-football-arena", label: "American Football", icon: Trophy },
        { path: "/f1-racing", label: "GP Fantasy Racing", icon: Car },
      ],
    },
    {
      category: "Entertainment & Lifestyle",
      items: [
        { path: "/shadow-arena", label: "Shadow Arena - Horror Platform", icon: Ghost },
        { path: "/live-concerts", label: "Live Concerts", icon: Music },
        { path: "/masterchef-subscription", label: "KitchenStars Competition", icon: ChefHat },
        { path: "/glamour-world", label: "Glamour World", icon: Crown },
        { path: "/comedy-club", label: "Comedy Club - Stand Up", icon: Mic2 },
        { path: "/influ-king", label: "Influ-King", icon: Star },
        { path: "/ai-experiences", label: "Exclusive Experiences", icon: Sparkles },
        { path: "/virtual-escape-room", label: "Virtual Escape Room", icon: Lock },
        { path: "/mystery-box", label: "Mystery Box", icon: Gift },
        { path: "/secret-santa", label: "Social Gifts Hub", icon: Gift },
        { path: "/vacationer", label: "Vacationer", icon: Plane },
        { path: "/cooking", label: "Cooking", icon: ChefHat },
        { path: "/coffee", label: "Coffee Community", icon: Coffee },
        { path: "/virtual-pet", label: "Virtual Pet", icon: PawPrint },
      ],
    },
    {
      category: "Marketplaces & Commerce",
      items: [
        { path: "/property-marketplace", label: "Property Marketplace", icon: Building2 },
        { path: "/marketplace", label: "Skills Marketplace", icon: Briefcase },
        { path: "/skill-swap", label: "Global Skill Swap", icon: Globe },
        { path: "/bazaar", label: "Bazaar", icon: Store },
        { path: "/coupon-marketplace", label: "Coupon Marketplace", icon: Ticket },
        { path: "/auction", label: "Online Auctions", icon: Gavel },
        { path: "/collectibles", label: "Collectibles", icon: Sparkles },
        { path: "/antique-appraisal", label: "Antique Appraisal", icon: Gem },
      ],
    },
    {
      category: "Learning & Growth",
      items: [
        { path: "/tutorial-platform", label: "Tutorial & Course Platform", icon: GraduationCap },
        { path: "/iq-platform", label: "IQ Platform", icon: Brain },
      ],
    },
    {
      category: "Legal",
      items: [
        { path: "/terms", label: "Terms", icon: FileText },
      ],
    },
  ];

  const otherServices = otherServiceGroups.flatMap((g) => g.items);

  const isLearningServiceActive = learningServices.some(item => location.pathname === item.path);
  const isKidsAcademyServiceActive = kidsAcademyServices.some(item => location.pathname === item.path) || location.pathname.startsWith('/kids');
  const isFundraisingServiceActive = fundraisingServices.some(item => location.pathname === item.path) || location.pathname.startsWith('/fundraising');
  const isOtherServiceActive = otherServices.some(item => location.pathname === item.path);

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-background backdrop-blur-xl border-b border-border/50 z-50 shadow-[0_1px_20px_rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-4">
        <div className="flex items-baseline justify-between h-16 pt-4">
          <Link to="/" className="flex items-center group lg:mr-8 xl:mr-12">
            <img src={uniqueLogo} alt="Unique Logo" className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110" />
            {/* Brand wordmark — fixed colors, independent of theme switcher */}
            <span
              className="text-3xl font-extrabold bg-clip-text text-transparent -ml-1 transition-all duration-500"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, hsl(270 91% 60%), hsl(330 100% 60%), hsl(270 91% 60%))",
                backgroundSize: "200% auto",
              }}
            >
              nique
            </span>
            <Age16Badge size="xs" withLabel={false} className="ml-2 self-center" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-baseline space-x-1 -mt-2">
            {mainNavItems.map((item) => {
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
                        Premium
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
                <Button variant={isFundraisingServiceActive ? "premium" : "ghost"}>
                  <Heart className="h-4 w-4" />
                  Fundraising
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {fundraisingServices.map((item) => {
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
                <Button variant={isOtherServiceActive ? "premium" : "ghost"}>
                  <MoreHorizontal className="h-4 w-4" />
                  {"Other Services"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto bg-popover/95 backdrop-blur-xl border-border/50 shadow-[0_8px_40px_hsl(var(--primary)/0.08)]">
                {otherServices.map((item) => {
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
          </div>

          <div className="hidden lg:flex items-center space-x-2">

            {user ? (
              <>
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                
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
                      <UserCircle className="h-5 w-5" />
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
                      <Link to="/subscription" className="w-full cursor-pointer">
                        <Crown className="h-4 w-4 mr-2" />
                        {"Subscription"}
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

          {/* Mobile login moved to bottom navigation for better reachability */}
          {!user && <div className="lg:hidden ml-auto" />}

          {/* Mobile: Notification bell */}
          {user && (
            <div className="lg:hidden mr-1 flex items-center gap-1">
              <MessagesBell />
              <NotificationBell />
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <MobileCreditsPill />
            {/* Main Navigation Items */}

            {mainNavItems.map((item) => {
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
                        Premium
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
            
            {/* Fundraising Section */}
            <div className="pt-2 pb-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Fundraising
              </div>
              {fundraisingServices.map((item) => {
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
              {otherServices.map((item) => {
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
            <div className="pt-3 space-y-1.5">
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
                  <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Crown className="h-4 w-4 mr-2" />
                      {"Subscription"}
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
    </nav>
  );
};

export default Navbar;
