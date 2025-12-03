import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, MessageCircle, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings, Bell, Music, Euro, Trophy, Award, Moon, Sun, Shirt, PawPrint, Gift, Zap, Home, Leaf, ImageIcon, BookOpen, Calculator, FlaskConical, Palette, Calendar, DollarSign, Image, Gem, Building2, Coffee, Bot, Globe, Lock, Mic2, Car, Clock, Dna, Scale, Shield, AlertTriangle, TrendingUp, Ghost, PenTool } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import NotificationBell from "@/components/notifications/NotificationBell";
import megatalentLogo from "@/assets/megatalent-logo.png";
import { useTranslation } from "react-i18next";

interface NotificationData {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: 'marketplace' | 'bazaar';
  offering_id?: string;
  item_id?: string;
  sender_id: string;
  skill_offerings?: {
    title: string;
  };
  bazaar_items?: {
    title: string;
  };
}

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadNotifications(session.user.id);
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadNotifications(session.user.id);
          checkAdminRole(session.user.id);
        } else {
          setNotifications([]);
          setUnreadCount(0);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const loadNotifications = async (userId: string) => {
    // Load marketplace notifications
    const { data: marketplaceData } = await supabase
      .from("marketplace_responses")
      .select(`
        *,
        skill_offerings (
          title
        )
      `)
      .eq("receiver_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    // Load bazaar notifications
    const { data: bazaarData } = await supabase
      .from("bazaar_messages")
      .select(`
        *,
        bazaar_items (
          title
        )
      `)
      .eq("receiver_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    // Combine and sort notifications
    const allNotifications: NotificationData[] = [
      ...(marketplaceData?.map(n => ({ ...n, type: 'marketplace' as const })) || []),
      ...(bazaarData?.map(n => ({ ...n, type: 'bazaar' as const })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifications(allNotifications);
    setUnreadCount(allNotifications.length);
  };

  const markAsRead = async (notification: NotificationData) => {
    if (!user) return;

    const table = notification.type === 'marketplace' ? 'marketplace_responses' : 'bazaar_messages';
    
    await supabase
      .from(table)
      .update({ is_read: true })
      .eq("id", notification.id);

    loadNotifications(user.id);
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Mark all marketplace notifications as read
    await supabase
      .from("marketplace_responses")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    // Mark all bazaar notifications as read
    await supabase
      .from("bazaar_messages")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    loadNotifications(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const mainNavItems = [
    { path: "/wall", label: t('services.wall.title'), icon: MessageSquare },
    { path: "/jobs", label: t('navbar.work'), icon: Briefcase },
    { path: "/games", label: t('navbar.games'), icon: Gamepad2 },
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
    
    { path: "/kids-homework", label: "Homework Helper (6-12y)", icon: BookOpen },
    { path: "/kids-story-creator", label: "Story Creator (6-12y)", icon: BookOpen },
    { path: "/kids-science-lab", label: "Science Lab (6-12y)", icon: FlaskConical },
    { path: "/kids-drawing-buddy", label: "Drawing Buddy (6-12y)", icon: Palette },
    { path: "/kids-reading-companion", label: "Reading Companion (6-12y)", icon: BookOpen },
    { path: "/teen-career-counselor", label: "Career Counselor (13-18y)", icon: Briefcase },
  ];

  const fundraisingServices = [
    { path: "/fundraising/medical", label: "Medical Fundraising", icon: Heart },
    { path: "/fundraising/dream", label: "Dream Maker", icon: Sparkles },
    { path: "/fundraising/hero", label: "Community Hero", icon: Shield },
    { path: "/fundraising/pet", label: "Pet Rescue", icon: PawPrint },
    { path: "/fundraising/student", label: "Student Support", icon: GraduationCap },
    { path: "/fundraising/crisis", label: "Crisis Relief", icon: AlertTriangle },
    { path: "/fundraising/talent", label: "Talent Sponsorship", icon: Star },
  ];

  const otherServices = [
    { path: "/shadow-arena", label: "Shadow Arena - Horror Platform", icon: Ghost },
    { path: "/wellness", label: "Wellness & Relaxation", icon: Heart },
    { path: "/safety-prevention", label: "Safety & Bullying Prevention", icon: Shield },
    { path: "/lie-detector", label: "Lie Detector Chat", icon: Shield },
    { path: "/handwriting", label: "Handwriting Analyzer", icon: PenTool },
    { path: "/past-life", label: "Past Life Explorer", icon: Clock },
    { path: "/anonymous-date", label: "Anonymous Date", icon: Heart },
    { path: "/skill-swap", label: "Global Skill Swap", icon: Globe },
    { path: "/ancestor-twin", label: "Ancestor Twin Finder", icon: Users },
    { path: "/lottery-ai", label: "Lottery Numbers - AI Predictions", icon: Sparkles },
    { path: "/sports-predictor", label: "Sports Match Predictions", icon: Trophy },
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
    { path: "/time-capsule-subscription", label: "Time Capsule Network", icon: Clock },
    { path: "/time-reversal-subscription", label: "Time Reversal Social", icon: Clock },
    { path: "/masterchef-subscription", label: "MasterChef Competition", icon: ChefHat },
    { path: "/f1-racing", label: "F1 Fantasy Racing", icon: Car },
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
    { path: "/parallel-lives", label: "Parallel Lives Network", icon: Globe },
    { path: "/emotion-economy", label: "Emotion Economy", icon: Heart },
    { path: "/quantum-social", label: "Quantum Social Network", icon: Zap },
    { path: "/virtual-influencer-agency", label: "Virtual Influencer Agency", icon: Users },
    { path: "/brand-collaboration", label: "Brand Collaboration Hub", icon: Briefcase },
    { path: "/stock-content-library", label: "Stock Content Library", icon: ImageIcon },
    { path: "/tutorial-platform", label: "Tutorial & Course Platform", icon: GraduationCap },
    { path: "/virtual-escape-room", label: "Virtual Escape Room", icon: Lock },
    { path: "/marketplace", label: t('navbar.marketplace_skills'), icon: Briefcase },
    { path: "/bazaar", label: t('navbar.bazaar'), icon: Store },
    
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
  const isFundraisingServiceActive = fundraisingServices.some(item => location.pathname === item.path);
  const isOtherServiceActive = otherServices.some(item => location.pathname === item.path);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">U</span>
                <svg 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-5 sm:w-10 sm:h-6" 
                  viewBox="0 0 40 20" 
                  fill="none"
                >
                  {/* Left wing - detailed feathers */}
                  <path 
                    d="M18 16C16 14 12 12 8 10C4 8 1 6 1 4C1 2 3 1 5 2C7 3 10 5 12 7C10 5 7 3 5 2C3 1 2 1 3 0C5 0 9 2 12 5C10 3 8 1 7 0C8 0 10 1 12 3C14 5 16 8 17 11C17.5 13 18 15 18 16Z" 
                    fill="url(#realWingLeft)"
                  />
                  <path 
                    d="M17 15C15 12 11 9 7 7C5 6 3 5 2 4C3 5 5 6 8 8C11 10 15 13 17 15Z" 
                    fill="url(#realWingLeftInner)"
                    opacity="0.7"
                  />
                  {/* Right wing - detailed feathers */}
                  <path 
                    d="M22 16C24 14 28 12 32 10C36 8 39 6 39 4C39 2 37 1 35 2C33 3 30 5 28 7C30 5 33 3 35 2C37 1 38 1 37 0C35 0 31 2 28 5C30 3 32 1 33 0C32 0 30 1 28 3C26 5 24 8 23 11C22.5 13 22 15 22 16Z" 
                    fill="url(#realWingRight)"
                  />
                  <path 
                    d="M23 15C25 12 29 9 33 7C35 6 37 5 38 4C37 5 35 6 32 8C29 10 25 13 23 15Z" 
                    fill="url(#realWingRightInner)"
                    opacity="0.7"
                  />
                  <defs>
                    <linearGradient id="realWingLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="realWingLeftInner" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                    <linearGradient id="realWingRight" x1="100%" y1="50%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="realWingRightInner" x1="100%" y1="50%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#EC4899] bg-clip-text text-transparent">nique</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
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
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
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
                <Button variant={isFundraisingServiceActive ? "premium" : "ghost"}>
                  <Heart className="h-4 w-4" />
                  Fundraising
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
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
              <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
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
                      <Link to="/premium-store" className="w-full cursor-pointer">
                        <Award className="h-4 w-4 mr-2" />
                        Unlock Premium Features
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