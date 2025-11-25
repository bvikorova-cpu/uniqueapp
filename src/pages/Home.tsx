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
    { name: "Mystery Box", path: "/mystery-box", keywords: ["mystery", "box", "prekvapenie", "odmeny"] },
    { name: "Astrology", path: "/astrology", keywords: ["astrology", "astrologický", "horoskop", "znamenia"] },
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

      {/* Welcome Message Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl shadow-[0_0_60px_rgba(var(--primary),0.15)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(var(--accent),0.08),transparent_50%)]" />
            
            <CardHeader className="relative text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary-glow to-accent flex items-center justify-center shadow-glow animate-float">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent mb-4">
                {t('home.welcome_title')}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative space-y-6 text-center md:text-left px-6 md:px-8 pb-8">
              <p className="text-lg text-foreground/90 leading-relaxed">
                {t('home.welcome_intro')}
              </p>
              
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-sm text-primary font-semibold">{t('home.welcome_priority')}</span>
                </div>
              </div>
              
              <p className="text-lg text-foreground/90 leading-relaxed">
                {t('home.welcome_feedback')} <Link to="/contact" className="text-primary hover:text-primary-glow font-semibold underline decoration-primary/30 hover:decoration-primary transition-colors">{t('home.welcome_contact_link')}</Link>. {t('home.welcome_feedback_value')}
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 mt-8 border border-primary/20">
                <p className="text-lg font-semibold text-center text-foreground">
                  {t('home.welcome_promise')}
                </p>
              </div>
              
              <p className="text-xl font-bold text-center bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent pt-4">
                {t('home.welcome_thanks')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Unique Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.why_unique_title')}{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Unique
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.why_unique_discover')}
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
                  {t('home.all_in_one_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.all_in_one_desc')}
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
                  {t('home.premium_features_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.premium_features_desc')}
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
                  {t('home.earn_while_social_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.earn_while_social_desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
