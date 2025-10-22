import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search, Disc3, Music, Leaf, ImageIcon, Zap, PawPrint, Shirt, Palette, Sofa, Wand2, Image, Gem } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const services = [
    { name: "Feed", path: "/feed", keywords: ["feed", "príspevky", "zdieľanie", "sociálna sieť"] },
    { name: "Videá", path: "/tiktok", keywords: ["videá", "tiktok", "krátke videá"] },
    { name: "Messenger", path: "/messenger", keywords: ["messenger", "chat", "správy", "komunikácia"] },
    { name: "Megatalent", path: "/megatalent", keywords: ["megatalent", "súťaž", "talent", "výhra"] },
    { name: "Megaforum", path: "/megaforum", keywords: ["megaforum", "diskusia", "fórum"] },
    { name: "Online psychológ", path: "/psychologist", keywords: ["psychológ", "psycholog", "duševné zdravie", "poradenstvo"] },
    { name: "Vzdelávanie", path: "/education", keywords: ["vzdelávanie", "kurzy", "doučovanie", "kvízy"] },
    { name: "Dovolenky", path: "/vacationer", keywords: ["dovolenky", "cestovanie", "zájazdy"] },
    { name: "Dating", path: "/dating", keywords: ["dating", "zoznamka", "láska", "priateľstvá"] },
    { name: "Prvá pomoc", path: "/first-aid", keywords: ["prvá pomoc", "zdravie", "pomoc"] },
    { name: "Fit & Slim", path: "/fit-slim", keywords: ["fit", "slim", "cvičenie", "zdravé recepty"] },
    { name: "Marketplace zručností", path: "/marketplace", keywords: ["služby", "marketplace", "ja urobím", "marketplace zručností"] },
    { name: "Bazár", path: "/bazaar", keywords: ["bazár", "bazar", "predaj", "nákup"] },
    { name: "Referenčný program", path: "/referral", keywords: ["referral", "odmeny", "priateľ"] },
    { name: "Hry", path: "/games", keywords: ["hry", "games", "zábava"] },
    { name: "Práca", path: "/jobs", keywords: ["práca", "job", "zamestnanec", "kariéra"] },
    { name: "InfluKing", path: "/influ-king", keywords: ["influking", "influencer", "zarábaš"] },
    { name: "Online Aukcie", path: "/auction", keywords: ["aukcie", "auction", "dražba"] },
    { name: "AI Generovanie", path: "/ai-generation", keywords: ["ai", "generovanie", "obrázky"] },
    { name: "Best Friend", path: "/best-friend", keywords: ["best friend", "priateľ", "chatbot"] },
    { name: "AI Music Producer", path: "/ai-music-producer", keywords: ["music", "hudba", "songs", "skladby", "producer"] },
    { name: "Plant Care", path: "/plant-care", keywords: ["plant", "rastlina", "garden", "zahrada", "care", "starostlivosť"] },
    { name: "AI Tattoo Designer", path: "/ai-tattoo", keywords: ["tattoo", "tetovanie", "design", "dizajn", "ai"] },
    { name: "Routine Optimizer", path: "/routine-optimizer", keywords: ["routine", "rutina", "optimalizácia", "produktivita"] },
    { name: "Mystery Box", path: "/mystery-box", keywords: ["mystery", "box", "prekvapenie", "odmeny"] },
    { name: "Astrology", path: "/astrology", keywords: ["astrology", "astrologický", "horoskop", "znamenia"] },
    { name: "AI Music", path: "/ai-music", keywords: ["music", "hudba", "curator", "playlist"] },
    { name: "Dream Journal", path: "/dream-journal", keywords: ["dream", "sen", "journal", "denník"] },
    { name: "Fashion Stylist", path: "/fashion-stylist", keywords: ["fashion", "móda", "stylist", "oblečenie"] },
    { name: "Virtual Pet", path: "/virtual-pet", keywords: ["pet", "zviera", "virtual", "virtuálny"] },
    { name: "Brand Builder", path: "/brand-builder", keywords: ["brand", "značka", "builder", "tvorba"] },
    { name: "Home Designer", path: "/home-designer", keywords: ["home", "dom", "designer", "dizajn", "interiér"] },
    { name: "Beauty Studio", path: "/beauty-studio", keywords: ["beauty", "krása", "makeup", "líčenie"] },
    { name: "Photo Restoration", path: "/photo-restoration", keywords: ["photo", "fotka", "restoration", "reštaurácia", "staré fotky", "kolorovanie"] },
    { name: "Antique Appraisal", path: "/antique-appraisal", keywords: ["antique", "starožitnosti", "appraisal", "ocenenie", "identifikácia", "hodnota"] },
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
        className="relative h-screen flex items-start justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center space-y-8 px-4 pt-32">
          <Badge className="bg-gold text-gold-foreground animate-glow text-lg px-4 py-2">
            {t('home.contest_badge')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            {t('home.hero_title')}{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              {t('home.hero_title_highlight')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
            {t('home.hero_subtitle')}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder={t('home.search_placeholder')}
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
                {t('home.enter_contest')}
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
              {t('home.services_title')}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t('home.services_title_highlight')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.services_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link to="/feed">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.feed.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.feed.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tiktok">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Video className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('services.videos.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.videos.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/messenger">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('services.messenger.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.messenger.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megatalent">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Crown className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>{t('services.megatalent.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.megatalent.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/megaforum">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.megaforum.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.megaforum.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/psychologist">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('services.psychologist.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.psychologist.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/education">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('services.education.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.education.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vacationer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.vacationer.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.vacationer.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dating">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>{t('services.dating.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.dating.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/first-aid">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Cross className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <CardTitle>{t('services.first_aid.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.first_aid.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/fit-slim">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Dumbbell className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('services.fit_slim.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.fit_slim.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/marketplace">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <HomeIcon className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('services.marketplace.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.marketplace.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bazaar">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Store className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('services.bazaar.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.bazaar.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/referral">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gift className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('services.referral.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.referral.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/games">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.games.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.games.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/jobs">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>{t('services.jobs.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.jobs.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/influ-king">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Radio className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>{t('services.influ_king.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.influ_king.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/auction">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gavel className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>{t('services.auction.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.auction.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-generation">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.ai_generation.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.ai_generation.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/best-friend">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>{t('services.best_friend.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.best_friend.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-music-producer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Music className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle>AI Music Producer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create custom songs with AI - any genre, mood, and style
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/plant-care">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Plant Care Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI garden assistant - identify plants, care schedules, disease diagnosis
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-tattoo">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <ImageIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle>AI Tattoo Designer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Design custom tattoos with AI - realistic, tribal, watercolor styles with placement preview
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/cooking">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Package className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Cooking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Healthy recipes and meal plans
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/routine-optimizer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Routine Optimizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Optimize your daily routine for maximum productivity
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/mystery-box">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gift className="h-12 w-12 text-gold mx-auto mb-4" />
                  <CardTitle>Mystery Box</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Open surprises and get amazing rewards
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/astrology">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Star className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle>Astrology</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Horoscopes, tarot readings and astrological predictions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-music">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Disc3 className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>AI Music Curator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Personalized playlists based on your mood
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dream-journal">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Dream Journal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Record and analyze your dreams with AI
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/fashion-stylist">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Shirt className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Fashion Stylist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI stylist for perfect outfits
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/virtual-pet">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <PawPrint className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Virtual Pet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your own virtual pet companion
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/brand-builder">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Wand2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Brand Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create your brand with AI assistance
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/home-designer">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Sofa className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Home Designer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI interior design for your home
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/beauty-studio">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Palette className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Beauty Studio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Virtual makeup and beauty tips
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/photo-restoration">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Image className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Photo Restoration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI restoration of old photos - colorize, repair & enhance
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/antique-appraisal">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Gem className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <CardTitle>Antique Appraisal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    AI identification & valuation of antiques and collectibles
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
