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
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings, Bell, Music, Euro, Trophy, Award } from "lucide-react";
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
    { path: "/feed", label: t('services.feed.title'), icon: MessageSquare },
    { path: "/jobs", label: t('navbar.work'), icon: Briefcase },
    { path: "/games", label: t('navbar.games'), icon: Gamepad2 },
    { path: "/rewards", label: t('navbar.rewards'), icon: Trophy },
    { path: "/megatalent", label: t('services.megatalent.title'), icon: Crown, premium: true },
  ];

  const otherServices = [
    { path: "/tiktok", label: t('navbar.videos'), icon: Video },
    { path: "/messenger", label: t('services.messenger.title'), icon: Mail },
    { path: "/influ-king", label: t('navbar.influ_king'), icon: Star },
    { path: "/megaforum", label: t('navbar.megaforum'), icon: Users },
    { path: "/psychologist", label: t('navbar.psychologist'), icon: Brain },
    { path: "/vacationer", label: t('navbar.vacationer'), icon: Plane },
    { path: "/dating", label: t('navbar.dating'), icon: Heart },
    { path: "/first-aid", label: t('navbar.first_aid'), icon: Activity },
    { path: "/fit-slim", label: t('services.fit_slim.title'), icon: Apple },
    { path: "/cooking", label: t('navbar.cooking'), icon: ChefHat },
    
    { path: "/marketplace", label: t('navbar.marketplace_skills'), icon: Briefcase },
    { path: "/bazaar", label: t('navbar.bazaar'), icon: Store },
    { path: "/ai-generation", label: t('navbar.ai_generation'), icon: Sparkles },
    { path: "/auction", label: t('navbar.auction'), icon: Gavel },
    { path: "/best-friend", label: t('navbar.best_friend'), icon: UserPlus },
    { path: "/referral", label: t('navbar.invite_friend'), icon: User },
    { path: "/education", label: t('navbar.education'), icon: GraduationCap },
    { path: "/terms", label: t('navbar.terms'), icon: FileText },
  ];

  const isOtherServiceActive = otherServices.some(item => location.pathname === item.path);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Unique
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
                <Button variant={isOtherServiceActive ? "premium" : "ghost"}>
                  <MoreHorizontal className="h-4 w-4" />
                  {t('navbar.other_services')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-semibold">{t('navbar.notifications')}</span>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={markAllAsRead}
                          className="text-xs h-auto p-1"
                        >
                          {t('navbar.mark_read')}
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t('navbar.no_notifications')}
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col items-start p-3 cursor-pointer"
                            onClick={() => {
                              markAsRead(notification);
                              navigate(notification.type === 'marketplace' ? '/marketplace' : '/bazaar');
                            }}
                          >
                            <div className="font-medium text-sm">
                              {notification.type === 'marketplace' 
                                ? `${t('navbar.new_interest')}: ${notification.skill_offerings?.title}`
                                : `${t('navbar.new_message')}: ${notification.bazaar_items?.title}`
                              }
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleDateString('sk-SK')}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

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
          <div className="lg:hidden py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {[...mainNavItems, ...otherServices].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPremium = 'premium' in item && item.premium;
              
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive ? "premium" : "ghost"}
                    className="w-full justify-start relative"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {isPremium && (
                      <Badge variant="secondary" className="ml-auto bg-gold text-gold-foreground">
                        Premium
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link to={`/profile/${user.id}`} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <UserCircle className="h-4 w-4 mr-2" />
                      {t('navbar.view_profile')}
                    </Button>
                  </Link>
                  <Link to="/edit-profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('navbar.edit_profile')}
                    </Button>
                  </Link>
                  <Link to="/subscription" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Crown className="h-4 w-4 mr-2" />
                      {t('navbar.subscription')}
                    </Button>
                  </Link>
                  <Link to="/ai-credits" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('navbar.ai_credits')}
                    </Button>
                  </Link>
                  <Link to="/earnings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Euro className="h-4 w-4 mr-2" />
                      {t('navbar.earnings')}
                    </Button>
                  </Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {t('navbar.contact')}
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        {t('navbar.admin_panel')}
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    {t('navbar.logout')}
                  </Button>
                </>
              ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">{t('navbar.login')}</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full">{t('navbar.register')}</Button>
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