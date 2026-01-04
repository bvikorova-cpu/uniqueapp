import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search, Disc3, Music, Leaf, ImageIcon, Zap, PawPrint, Shirt, Palette, Sofa, Wand2, Image, Gem, Coffee, Bot, Globe, Layers, Coins, Rocket, Car, Baby, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Import hero images
import heroDating from "@/assets/hero-dating-new.jpg";
import heroWellness from "@/assets/hero-wellness.jpg";
import heroCooking from "@/assets/hero-cooking.jpg";
import heroTravel from "@/assets/hero-travel.jpg";
import heroSocial from "@/assets/hero-social-new.jpg";
import heroEducation from "@/assets/hero-education.jpg";
import heroMusic from "@/assets/hero-music.jpg";

// Mobile-specific hero images (cleaner, better text visibility)
import mobileHeroBalloons from "@/assets/hero/mobile-hero-3.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullText = t('home.hero_title_highlight');

  // Desktop uses all hero images
  const heroImages = [
    heroDating,
    heroWellness,
    heroCooking,
    heroTravel,
    heroSocial,
    heroEducation,
    heroMusic
  ];

  // Mobile uses single clean image with balloons
  const mobileHeroImage = mobileHeroBalloons;

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

  // Image slideshow effect - only for desktop
  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(slideshowInterval);
  }, [heroImages.length]);

  const services = [
    { name: "Wall", path: "/wall", keywords: ["wall", "posts", "sharing", "social network"] },
    { name: "Videos", path: "/videos", keywords: ["videos", "short videos", "content"] },
    { name: "Messenger", path: "/messenger", keywords: ["messenger", "chat", "messages", "communication"] },
    { name: "Megatalent", path: "/megatalent", keywords: ["megatalent", "contest", "talent", "prize"] },
    { name: "Megaforum", path: "/megaforum", keywords: ["megaforum", "discussion", "forum"] },
    { name: "Online Psychologist", path: "/psychologist", keywords: ["psychologist", "mental health", "counseling"] },
    { name: "Education", path: "/education", keywords: ["education", "courses", "tutoring", "quizzes"] },
    { name: "Vacations", path: "/vacationer", keywords: ["vacations", "travel", "trips"] },
    { name: "Dating", path: "/dating", keywords: ["dating", "love", "friendships"] },
    { name: "First Aid", path: "/first-aid", keywords: ["first aid", "health", "help"] },
    { name: "Fit & Slim", path: "/fit-slim", keywords: ["fit", "slim", "exercise", "healthy recipes"] },
    { name: "Skills Marketplace", path: "/marketplace", keywords: ["services", "marketplace", "skills marketplace"] },
    { name: "Bazaar", path: "/bazaar", keywords: ["bazaar", "sell", "buy"] },
    { name: "Referral Program", path: "/referral", keywords: ["referral", "rewards", "friend"] },
    { name: "Games", path: "/games", keywords: ["games", "entertainment"] },
    { name: "Jobs", path: "/jobs", keywords: ["jobs", "job", "employee", "career"] },
    { name: "InfluKing", path: "/influ-king", keywords: ["influking", "influencer", "earn"] },
    { name: "Online Auctions", path: "/auction", keywords: ["auctions", "auction", "bidding"] },
    { name: "AI Generation", path: "/ai-generation", keywords: ["ai", "generation", "images"] },
    { name: "Best Friend", path: "/best-friend", keywords: ["best friend", "friend", "chatbot"] },
    { name: "AI Music Producer", path: "/ai-music-producer", keywords: ["music", "songs", "producer"] },
    { name: "Plant Care", path: "/plant-care", keywords: ["plant", "garden", "care"] },
    { name: "AI Tattoo Designer", path: "/ai-tattoo", keywords: ["tattoo", "design", "ai"] },
    { name: "Mystery Box", path: "/mystery-box", keywords: ["mystery", "box", "surprise", "rewards"] },
    { name: "Astrology", path: "/astrology", keywords: ["astrology", "horoscope", "zodiac"] },
    { name: "Dream Journal", path: "/dream-journal", keywords: ["dream", "journal", "diary"] },
    { name: "Virtual Pet", path: "/virtual-pet", keywords: ["pet", "virtual", "animal"] },
    { name: "Brand Builder", path: "/brand-builder", keywords: ["brand", "builder", "creation"] },
    { name: "Home Designer", path: "/home-designer", keywords: ["home", "designer", "interior"] },
    { name: "Beauty Studio", path: "/beauty-studio", keywords: ["beauty", "makeup"] },
    { name: "Photo Restoration", path: "/photo-restoration", keywords: ["photo", "restoration", "old photos", "colorization"] },
    { name: "Antique Appraisal", path: "/antique-appraisal", keywords: ["antique", "appraisal", "identification", "value"] },
    { name: "Coffee Community", path: "/coffee", keywords: ["coffee", "cafe", "checkin", "buddy", "coffee lovers"] },
    { name: "AI Personality Clone", path: "/ai-clone", keywords: ["ai", "clone", "personality", "chatbot", "digital", "24/7"] },
    { name: "Parallel Lives Network", path: "/parallel-lives", keywords: ["parallel", "lives", "identity", "multiple", "realities", "alternative"] },
    { name: "Emotion Economy Network", path: "/emotion-economy", keywords: ["emotion", "economy", "feelings", "trade", "currency"] },
    { name: "Memory Theft Social", path: "/memory-theft", keywords: ["memory", "theft", "steal", "experiences", "memories", "simulation"] },
    { name: "Quantum Social Network", path: "/quantum-social", keywords: ["quantum", "superposition", "versions", "reality", "multiverse"] },
    { name: "Virtual Influencer Agency", path: "/virtual-influencer-agency", keywords: ["virtual", "influencer", "ai", "content", "earning", "money"] },
    { name: "AI Content Marketplace", path: "/ai-content-marketplace", keywords: ["content", "marketplace", "sell", "ai"] },
    { name: "Print on Demand", path: "/print-on-demand", keywords: ["print", "demand", "tshirt", "products", "design"] },
    { name: "Custom Commissions", path: "/custom-commissions", keywords: ["commission", "custom", "service"] },
    { name: "Stock Content Library", path: "/stock-content-library", keywords: ["stock", "content", "library", "licensing"] },
    { name: "Tutorial Platform", path: "/tutorial-platform", keywords: ["tutorial", "course", "teaching", "education"] },
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
      <section className="relative min-h-[50vh] sm:h-screen flex items-start justify-center overflow-hidden">
        {/* Desktop Image Slideshow */}
        {heroImages.map((image, index) => (
          <div
            key={`desktop-${index}`}
            className={`hidden sm:block absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        ))}
        
        {/* Mobile - single static balloon image */}
        <div className="block sm:hidden absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${mobileHeroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
        
        {/* Lighter overlay for better visibility on mobile, darker on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/20 sm:from-black/30 sm:via-black/25 sm:to-black/35"></div>
        
        {/* Subtle warm gradient overlay for more vibrant feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-pink-400/5 sm:from-purple-900/10 sm:via-transparent sm:to-blue-900/10"></div>
        
        <div className="relative z-10 text-center space-y-4 sm:space-y-8 px-3 sm:px-4 pt-16 sm:pt-32">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            {t('home.hero_title')}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF4081] bg-clip-text text-transparent animate-glow drop-shadow-[0_0_30px_rgba(156,39,176,0.5)]">
                {displayedText}
                <span className="animate-blink">|</span>
              </span>
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto drop-shadow-lg px-2">
            {t('home.hero_subtitle')}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <Input
                type="text"
                placeholder={t('home.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-sm sm:text-lg text-black placeholder:text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-primary"
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
              <p className="text-lg text-foreground/90 leading-relaxed text-justify">
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
              
              <p className="text-lg text-foreground/90 leading-relaxed text-justify">
                {t('home.welcome_feedback')} <Link to="/contact" className="text-primary hover:text-primary-glow font-semibold underline decoration-primary/30 hover:decoration-primary transition-colors">{t('home.welcome_contact_link')}</Link>. {t('home.welcome_feedback_value')}
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 mt-8 border border-primary/20">
                <p className="text-lg font-semibold text-center text-foreground text-justify">
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
