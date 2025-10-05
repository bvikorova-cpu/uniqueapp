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
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail, Video, Gamepad2, Star, FileText, GraduationCap, ChefHat, UserCircle, MoreHorizontal, Sparkles, Gavel, UserPlus, Settings } from "lucide-react";
import megatalentLogo from "@/assets/megatalent-logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const mainNavItems = [
    { path: "/feed", label: "Feed", icon: MessageSquare },
    { path: "/jobs", label: "Práca", icon: Briefcase },
    { path: "/games", label: "Hry", icon: Gamepad2 },
    { path: "/megatalent", label: "Megatalent", icon: Crown, premium: true },
  ];

  const otherServices = [
    { path: "/tiktok", label: "Videá", icon: Video },
    { path: "/messenger", label: "Messenger", icon: Mail },
    { path: "/influ-king", label: "Influ-King", icon: Star },
    { path: "/megaforum", label: "Megafórum", icon: Users },
    { path: "/psychologist", label: "Psychológ", icon: Brain },
    { path: "/vacationer", label: "Vacationer", icon: Plane },
    { path: "/dating", label: "Zoznamka", icon: Heart },
    { path: "/first-aid", label: "Prvá pomoc", icon: Activity },
    { path: "/fit-slim", label: "Fit & Slim", icon: Apple },
    { path: "/cooking", label: "Varenie", icon: ChefHat },
    { path: "/marketplace", label: "Ja spravím", icon: Briefcase },
    { path: "/bazaar", label: "Bazár", icon: Store },
    { path: "/ai-generation", label: "AI Generovanie", icon: Sparkles },
    { path: "/auction", label: "Online aukcie", icon: Gavel },
    { path: "/best-friend", label: "Best Friend", icon: UserPlus },
    { path: "/referral", label: "Pozvi priateľa", icon: User },
    { path: "/education", label: "Vzdelávanie", icon: GraduationCap },
    { path: "/terms", label: "Podmienky", icon: FileText },
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
                  Ostatné služby
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
                        Zobraziť profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/edit-profile" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Upraviť profil
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleLogout} variant="outline">
                  Odhlásiť sa
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">Prihlásiť sa</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero">Registrácia</Button>
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
          <div className="lg:hidden py-4 space-y-2">
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
                  <Link to="/edit-profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Môj profil
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Odhlásiť sa
                  </Button>
                </>
              ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Prihlásiť sa</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full">Registrácia</Button>
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