import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search, Disc3, Music, Leaf, ImageIcon, Zap, PawPrint, Shirt, Palette, Sofa, Wand2, Image, Gem, Coffee, Bot, Globe, Layers, Coins, Rocket, Car, Baby, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Import hero images
import heroSocial from "@/assets/hero-social.jpg";
import heroVideos from "@/assets/hero-videos.jpg";
import heroGames from "@/assets/hero-games.jpg";
import heroMarketplace from "@/assets/hero-marketplace.jpg";
import heroAi from "@/assets/hero-ai.jpg";
import heroDating from "@/assets/hero-dating.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullText = t('home.hero_title_highlight');

  const heroImages = [
    heroSocial,
    heroVideos,
    heroGames,
    heroMarketplace,
    heroAi,
    heroDating
  ];

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 150);

    return () => clearInterval(intervalId);
  }, [fullText]);

  // Image slideshow effect
  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(slideshowInterval);
  }, [heroImages.length]);

  const services = [
    { name: "Wall", path: "/wall", keywords: ["wall", "posts", "sharing", "social network"] },
    { name: "Videá", path: "/videos", keywords: ["videá", "videos", "krátke videá"] },
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
    { name: "Virtual Pet", path: "/virtual-pet", keywords: ["pet", "zviera", "virtual", "virtuálny"] },
    { name: "Brand Builder", path: "/brand-builder", keywords: ["brand", "značka", "builder", "tvorba"] },
    { name: "Home Designer", path: "/home-designer", keywords: ["home", "dom", "designer", "dizajn", "interiér"] },
    { name: "Beauty Studio", path: "/beauty-studio", keywords: ["beauty", "krása", "makeup", "líčenie"] },
    { name: "Photo Restoration", path: "/photo-restoration", keywords: ["photo", "fotka", "restoration", "reštaurácia", "staré fotky", "kolorovanie"] },
    { name: "Antique Appraisal", path: "/antique-appraisal", keywords: ["antique", "starožitnosti", "appraisal", "ocenenie", "identifikácia", "hodnota"] },
    { name: "Coffee Community", path: "/coffee", keywords: ["coffee", "káva", "kaviarne", "checkin", "buddy", "kávoví milovníci"] },
    { name: "AI Personality Clone", path: "/ai-clone", keywords: ["ai", "clone", "personality", "chatbot", "digital", "klon", "24/7"] },
    { name: "Parallel Lives Network", path: "/parallel-lives", keywords: ["parallel", "lives", "identity", "multiple", "realities", "alternatívne", "životov"] },
    { name: "Emotion Economy Network", path: "/emotion-economy", keywords: ["emotion", "economy", "feelings", "trade", "emócie", "obchodovanie", "currency"] },
    { name: "Memory Theft Social", path: "/memory-theft", keywords: ["memory", "theft", "steal", "experiences", "memories", "spomienky", "zážitky", "simulation"] },
    { name: "Quantum Social Network", path: "/quantum-social", keywords: ["quantum", "superposition", "versions", "reality", "kvantový", "realita", "multiverse"] },
    { name: "Virtual Influencer Agency", path: "/virtual-influencer-agency", keywords: ["virtual", "influencer", "ai", "content", "earning", "money", "virtuálny", "influencer", "zarábanie"] },
    { name: "AI Content Marketplace", path: "/ai-content-marketplace", keywords: ["content", "marketplace", "sell", "ai", "predaj", "obsah"] },
    { name: "Print on Demand", path: "/print-on-demand", keywords: ["print", "demand", "tshirt", "products", "design", "tlač", "produkty"] },
    { name: "Brand Collaboration", path: "/brand-collaboration", keywords: ["brand", "collaboration", "sponsored", "značka", "spolupráca"] },
    { name: "Custom Commissions", path: "/custom-commissions", keywords: ["commission", "custom", "service", "zákazka", "služba"] },
    { name: "Stock Content Library", path: "/stock-content-library", keywords: ["stock", "content", "library", "licensing", "licencia", "knižnica"] },
    { name: "Digital Product Store", path: "/digital-product-store", keywords: ["digital", "product", "store", "presets", "filters", "predaj"] },
    { name: "AI Avatar Service", path: "/ai-avatar-service", keywords: ["avatar", "ai", "professional", "profile", "picture", "profilová"] },
    { name: "Tutorial Platform", path: "/tutorial-platform", keywords: ["tutorial", "course", "teaching", "kurz", "výučba", "vzdelávanie"] },
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
      <section className="relative h-screen flex items-start justify-center overflow-hidden">
        {/* Image Slideshow Background */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/35"></div>
        
        {/* Subtle animated gradient overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
        
        <div className="relative z-10 text-center space-y-8 px-4 pt-32">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            {t('home.hero_title')}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent animate-glow drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                {displayedText}
                <span className="animate-blink">|</span>
              </span>
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
        </div>
      </section>

      {/* Why Unique Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Unique
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover what makes our platform stand out from the rest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: All-in-One Platform */}
            <Card className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(var(--primary),0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                  All-in-One Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  Everything you need in one place - from social networking and entertainment to education, shopping, and AI-powered tools. No need to juggle multiple apps.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Premium Features */}
            <Card className="group relative overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl hover:border-accent/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(var(--accent),0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl group-hover:text-accent transition-colors duration-300">
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  Access cutting-edge AI technology, advanced tools, and exclusive features. Experience the future of social networking with intelligent assistance.
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Earn While You Social */}
            <Card className="group relative overflow-hidden border-2 border-gold/20 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl hover:border-gold/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(var(--gold),0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-gold">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl group-hover:text-gold transition-colors duration-300">
                  Earn While You Social
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  Turn your social activities into income. Create content, offer services, compete in contests, and get rewarded for your engagement and talent.
                </p>
              </CardContent>
            </Card>
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
            <Link to="/wall">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{t('services.wall.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('services.wall.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/videos">
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

            <Link to="/coffee">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Coffee className="h-12 w-12 text-amber-700 mx-auto mb-4" />
                  <CardTitle>Coffee Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discover cafes, find coffee buddies, and earn rewards
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-clone">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>AI Personality Clone Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create AI clones that chat 24/7 and build relationships
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/parallel-lives">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <CardTitle>Parallel Lives Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Live multiple parallel lives - CEO, rockstar, nomad simultaneously
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/emotion-economy">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Heart className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
                  <CardTitle>Emotion Economy Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Buy joy, sell sadness, trade motivation - emotions as currency
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/memory-theft">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle>Memory Theft Social 🧠</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Steal" experiences - relive memories through AI-enhanced simulation
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/quantum-social">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Zap className="h-12 w-12 text-cyan-500 mx-auto mb-4 animate-pulse" />
                  <CardTitle>Quantum Social Network ⚛️</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Exist in quantum superposition - followers see different versions of you
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/virtual-influencer-agency">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Virtual Influencer Agency 🌟</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create AI influencers that generate content and earn money for you
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-content-marketplace">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Store className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>AI Content Marketplace 🏪</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sell your AI-generated content and earn 80% commission
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/print-on-demand">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Shirt className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Print on Demand 👕</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Design products with AI and earn 60-70% profit on each sale
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/brand-collaboration">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Brand Collaboration Hub 🤝</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with brands for sponsored content, keep 80%
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/custom-commissions">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Palette className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>Custom Commission Service 🎨</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Offer custom AI creations to clients, earn 85%
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/stock-content-library">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <ImageIcon className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Stock Content Library 📚</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload AI content for licensing, earn 70% per download
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/digital-product-store">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Digital Product Store 💎</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sell presets, filters, templates - earn 85% per sale
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-avatar-service">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <UserPlus className="h-12 w-12 text-accent mx-auto mb-4" />
                  <CardTitle>AI Avatar Creation Service 👤</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create professional avatars for clients, earn 75%
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tutorial-platform">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-success mx-auto mb-4" />
                  <CardTitle>Tutorial & Course Platform 🎓</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create courses and tutorials about AI skills, earn 70%
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/f1-subscription">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer border-2 border-red-500/50">
                <CardHeader>
                  <Car className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <Badge className="mb-2 bg-red-600">Premium</Badge>
                  <CardTitle>F1 Fantasy Racing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Premium 3D F1 racing platform with fantasy teams & live competitions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/kids-channel">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Baby className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <Badge className="mb-2 bg-blue-500">Family</Badge>
                  <CardTitle>Kids Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Interactive educational games, stories, and fun activities for children
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/livestream">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Video className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                  <Badge className="mb-2 bg-indigo-500">Entertainment</Badge>
                  <CardTitle>Live Streaming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stream live content, watch shows, and interact with creators
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/comedy-club">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Mic className="h-12 w-12 text-fuchsia-500 mx-auto mb-4" />
                  <Badge className="mb-2 bg-fuchsia-500">Entertainment</Badge>
                  <CardTitle>Comedy Club</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Watch comedy shows, become a comedian, and make people laugh
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/iq-platform">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <Badge className="mb-2 bg-blue-600">Intelligence</Badge>
                  <CardTitle>IQ Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    IQ tests, AI analysis, online competitions & earn credits
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/sports-predictor">
              <Card className="text-center hover:shadow-glow transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                <CardHeader>
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <Badge className="mb-2 bg-green-600">Sports</Badge>
                  <CardTitle>Sports Match Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Expert tipsters + AI predictions for sports betting with win rate stats
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
