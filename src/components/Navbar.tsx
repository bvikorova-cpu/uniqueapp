import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, MessageCircle, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings, Bell, Music, Euro, Trophy, Award, Moon, Sun, Shirt, PawPrint, Gift, Zap, Home, Leaf, ImageIcon, BookOpen, Calculator, FlaskConical, Palette, Calendar, DollarSign, Image, Gem, Building2, Coffee, Bot, Globe, Lock, Mic2, Car, Clock, Dna, Scale, Shield, AlertTriangle, TrendingUp, Ghost, PenTool, Ticket } from "lucide-react";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notifications/NotificationBell";
import { AICreditsBalanceWidget } from "@/components/ai-credits/AICreditsBalanceWidget";
import { FreeTierBalanceWidget } from "@/components/credits/FreeTierBalanceWidget";
import { GlobalCurrencySwitcher } from "@/components/GlobalCurrencySwitcher";
import { LanguageSelector } from "@/components/LanguageSelector";
import megatalentLogo from "@/assets/megatalent-logo.png";
import uniqueLogo from "@/assets/unique-logo.png";
import { Age16Badge } from "@/components/Age16Badge";
import { useTranslation } from "react-i18next";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
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
    { path: "/wall", label: t('services.wall.title'), icon: MessageSquare },
    { path: "/jobs", label: t('navbar.work'), icon: Briefcase },
    { path: "/rewards", label: t('navbar.rewards'), icon: Trophy },
    { path: "/megatalent", label: t('services.megatalent.title'), icon: Crown, premium: true },
  ];

  const learningServices = [
    { path: "/education", label: t('navbar.education'), icon: GraduationCap },
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

  const otherServices = [
    { path: "/creative-forge", label: "CreativeForge - AI Writing Studio", icon: PenTool },
    { path: "/shadow-arena", label: "Shadow Arena - Horror Platform", icon: Ghost },
    { path: "/wellness", label: "Wellness & Relaxation", icon: Heart },
    { path: "/safety-prevention", label: "Safety & Bullying Prevention", icon: Shield },
    { path: "/lie-detector", label: "Lie Detector Chat", icon: Shield },
    { path: "/handwriting", label: "Handwriting Analyzer", icon: PenTool },
    { path: "/past-life", label: "Past Life Explorer", icon: Clock },
    { path: "/anonymous-date", label: "Anonymous Date", icon: Heart },
    { path: "/skill-swap", label: "Global Skill Swap", icon: Globe },
    
    { path: "/lottery-ai", label: "Lottery Numbers - AI Predictions", icon: Sparkles },
    
    { path: "/property-marketplace", label: "Property Marketplace", icon: Building2 },
    { path: "/membership-community", label: "Membership Community", icon: Users },
    { path: "/crystal-energy-network", label: "Crystal & Energy Network", icon: Gem },
    { path: "/dna-memory-network", label: "DNA Social Memory Network", icon: Dna },
    { path: "/reincarnation-social", label: "Reincarnation Social", icon: Sparkles },
    { path: "/blockchain-confessions", label: "Blockchain Confessions", icon: Scale },
    { path: "/phobia-trading", label: "Phobia Trading Network", icon: Brain },
    { path: "/multiverse-network", label: "Multiverse Profile Network", icon: Globe },
    
    { path: "/live-concerts", label: "Live Concerts", icon: Music },
    { path: "/holographic-avatars", label: "Holographic Avatars", icon: Sparkles },
    { path: "/time-capsule", label: "Time Capsule Network", icon: Clock },
    { path: "/time-reversal", label: "Time Reversal Social", icon: Clock },
    { path: "/masterchef-subscription", label: "KitchenStars Competition", icon: ChefHat },
    { path: "/f1-racing", label: "GP Fantasy Racing", icon: Car },
    { path: "/messenger", label: t('services.messenger.title'), icon: Mail },
    { path: "/influ-king", label: t('navbar.influ_king'), icon: Star },
    { path: "/megaforum", label: t('navbar.megaforum'), icon: Users },
    { path: "/psychologist", label: t('navbar.psychologist'), icon: Brain },
    { path: "/content-studio", label: "Content Studio", icon: Sparkles },
    { path: "/companions", label: "Character Companions", icon: MessageCircle },
    { path: "/ai-experiences", label: "Exclusive Experiences", icon: Sparkles },
    
    { path: "/brand-builder", label: t('services.brand_builder.title'), icon: Sparkles },
    { path: "/home-designer", label: t('services.home_designer.title'), icon: Home },
    { path: "/beauty-studio", label: t('services.beauty_studio.title'), icon: Sparkles },
    { path: "/photo-restoration", label: "Photo Restoration", icon: Image },
    { path: "/antique-appraisal", label: "Antique Appraisal", icon: Gem },
    { path: "/collectibles", label: "Collectibles", icon: Sparkles },
    { path: "/dream-journal", label: "Dream Analyzer", icon: Brain },
    { path: "/fashion-studio", label: "Fashion Studio", icon: Palette },
    { path: "/nutrition-hub", label: "Nutrition Hub", icon: Apple },
    { path: "/virtual-pet", label: "Virtual Pet", icon: PawPrint },
    { path: "/astrology", label: "Astrology", icon: Star },
    { path: "/character-arena", label: "Character Arena", icon: Trophy },
    { path: "/horse-racing", label: "Horse Racing Arena", icon: Trophy },
    { path: "/football-arena", label: "Football Arena", icon: Trophy },
    { path: "/basketball-arena", label: "Basketball Arena", icon: Trophy },
    { path: "/hockey-arena", label: "Hockey Arena", icon: Trophy },
   { path: "/tennis-arena", label: "Tennis Arena", icon: Trophy },
   { path: "/american-football-arena", label: "American Football", icon: Trophy },
    { path: "/glamour-world", label: "Glamour World", icon: Crown },
    { path: "/comedy-club", label: "Comedy Club - Stand Up", icon: Mic2 },
    { path: "/ai-tattoo", label: "AI Tattoo Designer", icon: ImageIcon },
    { path: "/mystery-box", label: "Mystery Box", icon: Gift },
    { path: "/secret-santa", label: "Social Gifts Hub", icon: Gift },
    { path: "/vacationer", label: t('navbar.vacationer'), icon: Plane },
    { path: "/dating", label: t('navbar.dating'), icon: Heart },
    { path: "/first-aid", label: t('navbar.first_aid'), icon: Activity },
    { path: "/fit-slim", label: t('services.fit_slim.title'), icon: Apple },
    { path: "/cooking", label: t('navbar.cooking'), icon: ChefHat },
    { path: "/coffee", label: "Coffee Community", icon: Coffee },
    { path: "/ai-clone", label: "AI Personality Clone", icon: Bot },
    
    { path: "/emotion-economy", label: "Emotion Economy", icon: Heart },
    { path: "/quantum-social", label: "Quantum Social Network", icon: Zap },
    { path: "/virtual-influencer-agency", label: "Virtual Influencer Agency", icon: Users },
    { path: "/stock-content-library", label: "Stock Content Library", icon: ImageIcon },
    { path: "/tutorial-platform", label: "Tutorial & Course Platform", icon: GraduationCap },
    { path: "/virtual-escape-room", label: "Virtual Escape Room", icon: Lock },
    { path: "/marketplace", label: t('navbar.marketplace_skills'), icon: Briefcase },
    { path: "/bazaar", label: t('navbar.bazaar'), icon: Store },
    { path: "/coupon-marketplace", label: "Coupon Marketplace", icon: Ticket },
    { path: "/analyzer", label: "Universal Analyzer", icon: Sparkles },
    { path: "/ai-generation", label: t('navbar.ai_generation'), icon: Sparkles },
    { path: "/video-ad-generator", label: "Video Ad Generator", icon: Video },
    { path: "/auction", label: t('navbar.auction'), icon: Gavel },
    { path: "/best-friend", label: t('navbar.best_friend'), icon: UserPlus },
    { path: "/referral", label: t('navbar.invite_friend'), icon: User },
    { path: "/iq-platform", label: "IQ Platform", icon: Brain },
    { path: "/pet-translator", label: "AI Pet Translator", icon: PawPrint },
    { path: "/future-face", label: "Future Face - Age Prediction", icon: Clock },
    { path: "/terms", label: t('navbar.terms'), icon: FileText },
  ];

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
            <span className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent -ml-1 transition-all duration-500 group-hover:bg-[position:100%_0]">
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
                  {t('navbar.other_services')}
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
            <LanguageSelector />
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

                {/* Free Tier Credits */}
                <div className="hidden sm:block">
                  <FreeTierBalanceWidget compact />
                </div>

                {/* Wall Notifications */}
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
                        {t('navbar.view_profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/edit-profile" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('navbar.edit_profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="w-full cursor-pointer">
                        <Crown className="h-4 w-4 mr-2" />
                        {t('navbar.subscription')}
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
                        {t('navbar.ai_credits')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/earnings" className="w-full cursor-pointer">
                        <Euro className="h-4 w-4 mr-2" />
                        {t('navbar.earnings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/contact" className="w-full cursor-pointer">
                        <Mail className="h-4 w-4 mr-2" />
                        {t('navbar.contact')}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          {t('navbar.admin_panel')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleLogout} variant="outline">
                  {t('navbar.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">{t('navbar.login')}</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero">{t('navbar.register')}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Login button (visible only when logged out) */}
          {!user && (
            <Link to="/auth" className="lg:hidden ml-auto mr-2">
              <Button variant="hero" size="sm" className="h-9 px-3">
                <User className="h-4 w-4 mr-1" />
                {t('navbar.login')}
              </Button>
            </Link>
          )}

          {/* Mobile: Language selector */}
          <div className="lg:hidden mr-1">
            <LanguageSelector />
          </div>

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
            {/* Free tier balance — visible to logged-in users */}
            {user && (
              <div className="px-2 pb-2 flex justify-start">
                <FreeTierBalanceWidget compact />
              </div>
            )}
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
                {t('navbar.other_services')}
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
                      {t('navbar.view_profile')}
                    </Button>
                  </Link>
                  <Link to="/edit-profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('navbar.edit_profile')}
                    </Button>
                  </Link>
                  <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Crown className="h-4 w-4 mr-2" />
                      {t('navbar.subscription')}
                    </Button>
                  </Link>
                  <Link to="/ai-credits" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('navbar.ai_credits')}
                    </Button>
                  </Link>
                  <Link to="/earnings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Euro className="h-4 w-4 mr-2" />
                      {t('navbar.earnings')}
                    </Button>
                  </Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {t('navbar.contact')}
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('navbar.admin_panel')}
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="outline" className="w-full text-sm" size="sm">
                    {t('navbar.logout')}
                  </Button>
                </>
              ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-sm" size="sm">{t('navbar.login')}</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full text-sm" size="sm">{t('navbar.register')}</Button>
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
