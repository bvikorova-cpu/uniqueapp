import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const services = [
    { name: "Feed", path: "/feed", keywords: ["feed", "príspevky", "zdieľanie", "sociálna sieť", "posts", "sharing", "social network"] },
    { name: "Videá", path: "/tiktok", keywords: ["videá", "tiktok", "krátke videá", "videos", "short videos"] },
    { name: "Messenger", path: "/messenger", keywords: ["messenger", "chat", "správy", "komunikácia", "messages", "communication"] },
    { name: "Megatalent", path: "/megatalent", keywords: ["megatalent", "súťaž", "talent", "výhra", "competition", "win"] },
    { name: "Megaforum", path: "/megaforum", keywords: ["megaforum", "diskusia", "fórum", "discussion", "forum"] },
    { name: "Online psychológ", path: "/psychologist", keywords: ["psychológ", "psycholog", "duševné zdravie", "poradenstvo", "psychologist", "mental health", "counseling"] },
    { name: "Vzdelávanie", path: "/education", keywords: ["vzdelávanie", "kurzy", "doučovanie", "kvízy", "education", "courses", "tutoring", "quizzes"] },
    { name: "Dovolenky", path: "/vacationer", keywords: ["dovolenky", "cestovanie", "zájazdy", "holidays", "travel", "trips"] },
    { name: "Dating", path: "/dating", keywords: ["dating", "zoznamka", "láska", "priateľstvá", "love", "friendships"] },
    { name: "Prvá pomoc", path: "/first-aid", keywords: ["prvá pomoc", "zdravie", "pomoc", "first aid", "health", "help"] },
    { name: "Fit & Slim", path: "/fit-slim", keywords: ["fit", "slim", "cvičenie", "zdravé recepty", "workout", "healthy recipes"] },
    { name: "Ja urobím", path: "/marketplace", keywords: ["služby", "marketplace", "ja urobím", "services", "i will do"] },
    { name: "Bazár", path: "/bazaar", keywords: ["bazár", "bazar", "predaj", "nákup", "bazaar", "sell", "buy"] },
    { name: "Referenčný program", path: "/referral", keywords: ["referral", "odmeny", "priateľ", "rewards", "friend"] },
    { name: "Hry", path: "/games", keywords: ["hry", "games", "zábava", "entertainment"] },
    { name: "Práca", path: "/jobs", keywords: ["práca", "job", "zamestnanec", "kariéra", "work", "employee", "career"] },
    { name: "InfluKing", path: "/influ-king", keywords: ["influking", "influencer", "zarábaš", "earn"] },
    { name: "Online Aukcie", path: "/auction", keywords: ["aukcie", "auction", "dražba", "bidding"] },
    { name: "AI Generovanie", path: "/ai-generation", keywords: ["ai", "generovanie", "obrázky", "generation", "images"] },
    { name: "Best Friend", path: "/best-friend", keywords: ["best friend", "priateľ", "chatbot", "friend"] },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase();
    const foundService = services.find(service => 
      service.name.toLowerCase().includes(query) || 
      service.keywords.some(keyword => keyword.includes(query))
    );

    if (foundService) {
      navigate(foundService.path);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center space-y-8 px-4">
          <Badge className="bg-gold text-gold-foreground animate-glow text-lg px-4 py-2">
            {t('home.hero.badge')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            {t('home.hero.title')}{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Megatalent
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder={t('home.hero.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg text-black placeholder:text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-primary"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/megatalent">
              <Button variant="hero" size="lg" className="text-xl px-8 py-4">
                <Crown className="h-6 w-6 mr-2" />
                {t('home.hero.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* All Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              {t('home.services.title')}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t('home.services.title2')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link to="/feed">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.feed')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tiktok">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Video className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('nav.videos')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.videos')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/messenger">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Messenger</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.messenger')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megatalent">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Crown className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Megatalent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.megatalent')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megaforum">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Megaforum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.megaforum')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/psychologist">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('nav.psychologist')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.psychologist')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/education">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('nav.education')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.education')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vacationer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('nav.vacationer')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.vacationer')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dating">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>Dating</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.dating')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/first-aid">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Cross className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>{t('nav.first_aid')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.first_aid')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/fit-slim">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Dumbbell className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Fit & Slim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.fit_slim')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/marketplace">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <HomeIcon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('nav.marketplace')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.marketplace')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bazaar">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Store className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('nav.bazaar')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.bazaar')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/referral">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gift className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('nav.referral')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.referral')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/games">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('nav.games')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.games')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/jobs">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('nav.jobs')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.jobs')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/influ-king">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Radio className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>InfluKing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.influ_king')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auction">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gavel className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>{t('nav.auction') || 'Online Aukcie'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.auction')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-generation">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('nav.ai_generation') || 'AI Generovanie'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.ai_generation')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/best-friend">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Best Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.best_friend')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/cooking">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Package className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('nav.cooking')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('home.services.cooking')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
