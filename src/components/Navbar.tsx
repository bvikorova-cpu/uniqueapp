import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ShoppingBag, Store, User, Menu, X, MessageSquare, Briefcase, Users, Brain, Plane, Heart, Activity, Apple, Mail } from "lucide-react";
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

  const navItems = [
    { path: "/", label: "Domov", icon: Crown },
    { path: "/feed", label: "Feed", icon: MessageSquare },
    { path: "/messenger", label: "Messenger", icon: Mail },
    { path: "/megatalent", label: "Megatalent", icon: Crown, premium: true },
    { path: "/megaforum", label: "Megafórum", icon: Users },
    { path: "/psychologist", label: "Psychológ", icon: Brain },
    { path: "/vacationer", label: "Vacationer", icon: Plane },
    { path: "/dating", label: "Zoznamka", icon: Heart },
    { path: "/first-aid", label: "Prvá pomoc", icon: Activity },
    { path: "/fit-slim", label: "Fit & Slim", icon: Apple },
    { path: "/marketplace", label: "Ja spravím", icon: Briefcase },
    { path: "/eshop", label: "Eshop", icon: ShoppingBag },
    { path: "/bazaar", label: "Bazár", icon: Store },
    { path: "/referral", label: "Pozvi priateľa", icon: User },
  ];

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
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
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
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <Button onClick={handleLogout} variant="outline">
                Odhlásiť sa
              </Button>
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
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive ? "premium" : "ghost"}
                    className="w-full justify-start relative"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.premium && (
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
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Odhlásiť sa
                </Button>
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