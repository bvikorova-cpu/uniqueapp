import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown, Users, ShoppingBag, Store, Star, TrendingUp, Gift, MessageSquare, Video, MessageCircle, Trophy, FileText, Brain, Plane, Heart, Cross, Dumbbell, Home as HomeIcon, Package, UserPlus, Gamepad2, Briefcase, Radio, GraduationCap, Gavel, Sparkles, Search, Disc3, Music, Leaf, ImageIcon, Zap, PawPrint, Shirt, Palette, Sofa, Wand2, Image, Gem, Coffee, Bot, Globe, Layers, Coins, Rocket, Car, Baby, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";


// Import hero images - centralized for consistent cache-busting in preview
import heroDating from "@/assets/hero/hero-dating-new.jpg";
import heroRelaxing from "@/assets/hero/hero-adventure.jpg";
import heroCooking from "@/assets/hero/hero-cooking-new.jpg";
import heroParis from "@/assets/hero/hero-paris-tower.jpg";
import heroHappyCouple from "@/assets/hero/hero-paris-couple.jpg";
import heroNyc from "@/assets/hero/hero-nyc-lights.jpg";
import heroNycFriends from "@/assets/hero/hero-nyc-friends.jpg";
import heroUserUpload8 from "@/assets/hero/hero-user-upload-8.jpg";
// preview-sync: 2026-01-06a

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullText = "Unique";

  // All hero images for slideshow (both mobile and desktop)
  // NOTE: keep these imports in /assets/hero to avoid old cached variants in preview.
  const heroImages = [
    heroDating,
    heroRelaxing,
    heroCooking,
    heroParis,
    heroHappyCouple,
    heroNyc,
    heroNycFriends,
    heroUserUpload8,
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
        {/* Image Slideshow - same for both mobile and desktop */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={image}
              alt={`Hero slide ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                imageRendering: "auto",
                opacity: 1,
              }}
            />
          </div>
        ))}
        
        {/* Very light overlay - minimal darkening for crisp images */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15 sm:from-black/10 sm:via-black/5 sm:to-black/20"></div>
        
        {/* Subtle warm gradient overlay for vibrant feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/3 via-transparent to-pink-400/3 sm:from-purple-900/5 sm:via-transparent sm:to-blue-900/5"></div>
        
        <div className="relative z-10 text-center space-y-4 sm:space-y-8 px-3 sm:px-4 pt-16 sm:pt-32">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            {"Welcome to"}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF4081] bg-clip-text text-transparent animate-glow drop-shadow-[0_0_30px_rgba(156,39,176,0.5)]">
                {displayedText}
                <span className="animate-blink">|</span>
              </span>
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto drop-shadow-lg px-2">
            {"A social network where your talent can change your life. Compete, vote, shop and earn with friends!"}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <Input
                type="text"
                placeholder={"Search services... (e.g. games, education, dating)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-4 sm:py-6 text-sm sm:text-lg text-black placeholder:text-gray-500 bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-primary"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Welcome Message Section */}
      <section className="py-24 px-4 bg-background">
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
                {"Welcome to \"Unique\" – The Platform That Helps and Connects!"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative space-y-6 text-center md:text-left px-6 md:px-8 pb-8">
              <p className="text-lg text-foreground/90 leading-relaxed text-justify">
                {"At \"Unique,\" we believe in the power of community and that everyone deserves a digital space that inspires them, educates them, and connects them with the people they care about. Our platform is designed with dedication and the goal of bringing you a unique experience – from discovering new talents and pursuing education, to creative opportunities with artificial intelligence and brand building. We are here to help you achieve your dreams and goals."}
              </p>
              
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-sm text-primary font-semibold">{"Your satisfaction is our number one priority"}</span>
                </div>
              </div>
              
              <p className="text-lg text-foreground/90 leading-relaxed text-justify">
                {"We know that even the best technology occasionally encounters unforeseen obstacles. If you come across any error, or have a suggestion for improvement, please do not hesitate to contact us! Use our"} <Link to="/contact" className="text-primary hover:text-primary-glow font-semibold underline decoration-primary/30 hover:decoration-primary transition-colors">{"Contact Form"}</Link>. {"Every piece of feedback you give us is valuable, and we take it seriously."}
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 mt-8 border border-primary/20">
                <p className="text-lg font-semibold text-center text-foreground text-justify">
                  {"Because we believe that every user deserves what they paid for – and much more."}
                </p>
              </div>
              
              <p className="text-xl font-bold text-center bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent pt-4">
                {"Thank you for being part of the community. Together, we are creating something exceptional!"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Unique Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {"Why"}{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Unique
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {"Discover what makes our platform stand out from the rest"}
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
                  {"All-in-One Platform"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {"Everything you need in one place - from social networking and entertainment to education, shopping, and AI-powered tools. No need to juggle multiple apps."}
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
                  {"Premium Features"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {"Access cutting-edge AI technology, advanced tools, and exclusive features. Experience the future of social networking with intelligent assistance."}
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
                  {"Earn While You Social"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {"Turn your social activities into income. Create content, offer services, compete in contests, and get rewarded for your engagement and talent."}
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
