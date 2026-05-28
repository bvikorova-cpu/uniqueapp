import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Play, Star, Sparkles, Crown, BookOpen, Volume2, Trophy, Moon, CreditCard, Video, Castle, Palette, Unlock, Shield, Library, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { showImages } from "@/components/kids/ShowImages";
import castleBg from "@/assets/kids/fairy-castle-bg.jpg";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";
import { useKidsGoldPass } from "@/hooks/useKidsGoldPass";
import { SmartSleepTimer } from "@/components/kids/SmartSleepTimer";
import { motion } from "framer-motion";

// New components
import { KidsHero } from "@/components/kids/KidsHero";

import { WhatsNewSpotlight } from "@/components/kids/WhatsNewSpotlight";
import { DailyStars } from "@/components/kids/DailyStars";
import { AdventureMap } from "@/components/kids/AdventureMap";
import { WeeklyTheme } from "@/components/kids/WeeklyTheme";
import { KidsProfileBadges } from "@/components/kids/KidsProfileBadges";
import { UnderageWelcomeBanner } from "@/components/kids/UnderageWelcomeBanner";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface Show {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  cover_image_url: string;
  category: string;
  age_rating: string;
  is_premium: boolean;
  created_at: string;
}

// Feature card component with playful animations
const FeatureCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  gradient,
  badges: cardBadges,
  onClick,
  delay = 0,
  hasGoldPass,
  showUnlocked,
}: {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  gradient: string;
  badges: Array<{ text: string; color: string; icon?: any }>;
  onClick: () => void;
  delay?: number;
  hasGoldPass?: boolean;
  showUnlocked?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", bounce: 0.3 }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card
      className={`group overflow-hidden bg-gradient-to-br ${gradient} backdrop-blur-sm border-4 transition-all duration-300 cursor-pointer shadow-2xl ${
        showUnlocked && hasGoldPass ? 'border-green-400 ring-2 ring-green-300' : 'border-white/60'
      }`}
      onClick={onClick}
    >
      <div className="p-6 text-center relative">
        {showUnlocked && hasGoldPass && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white gap-1"><Unlock className="w-3 h-3" /> Unlocked</Badge>
          </div>
        )}
        <motion.div
          className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg"
          whileHover={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`w-10 h-10 ${iconColor}`} />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-700 text-sm mb-3">{description}</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {cardBadges.map((b, i) => (
            <Badge key={i} className={`${b.color} shadow-md`}>
              {b.icon && <b.icon className="w-3 h-3 mr-1" />}
              {b.text}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  </motion.div>
);

const KidsChannel = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingFeatureName, setPendingFeatureName] = useState<string>("");
  const { isVerified, checkVerification } = useParentalGate();
  const { hasGoldPass, loading: goldPassLoading } = useKidsGoldPass();

  const AI_FEATURES = [
    { path: '/kids-stories/voice-chat', name: 'Character Chat' },
    { path: '/kids-story-creator', name: 'Story Creator' },
    { path: '/kids-homework', name: 'AI Homework Helper' },
  ];

  const showImageMap: Record<string, string> = {
    "Peppa Pig": showImages.peppa,
    "Paw Patrol": showImages.pawPatrol,
    "Frozen Stories": showImages.frozen,
    "Lion Kingdom": showImages.lionking,
    "Music Time": showImages.music,
    "Fairy Tale Castle": showImages.fairytale,
    "Bluey": showImages.bluey,
    "Masha and the Bear": showImages.masha,
    "Dora the Explorer": showImages.dora,
    "Cocomelon": showImages.cocomelon,
    "SpongeBob SquarePants": showImages.spongebob,
    "PJ Masks": showImages.pjmasks,
    "Mickey Mouse Clubhouse": showImages.mickey,
    "Daniel Tiger's Neighborhood": showImages.danielTiger,
    "Super Wings": showImages.superwings,
    "Blippi": showImages.blippi,
    "Scooby-Doo": showImages.scooby,
    "Mr. Bean": showImages.mrbean,
    "Snow White": showImages.snowwhite,
    "Pinocchio": showImages.pinocchio,
    "Dumbo": showImages.dumbo,
    "Bambi": showImages.bambi,
    "Cinderella": showImages.cinderella,
    "Alice in Wonderland": showImages.alice,
    "Sleeping Beauty": showImages.sleepingbeauty,
    "101 Dalmatians": showImages['101dalmatians'],
    "The Jungle Book": showImages.junglebook,
    "Peter Pan": showImages.peterpan,
    "Lady and the Tramp": showImages.ladyandthetramp,
    "Beauty and the Beast": showImages.beautyandthebeast,
    "Aladdin": showImages.aladdin,
    "The Lion King": showImages.lionking,
    "Pocahontas": showImages.pocahontas,
    "Mulan": showImages.mulan,
    "Tarzan": showImages.tarzan,
    "Atlantis": showImages.atlantis,
    "Brother Bear": showImages.brotherbear,
    "Bolt": showImages.bolt,
    "Tangled": showImages.tangled,
    "Wreck-It Ralph": showImages.wreckitralph,
    "Ralph Breaks the Internet": showImages.ralphbreakstheinternet,
    "Frozen": showImages.frozen,
    "Big Hero 6": showImages.bighero6,
    "Moana": showImages.moana,
    "The Princess and the Frog": showImages.theprincessandthefrog,
    "Encanto": showImages.encanto,
    "The Little Mermaid": showImages.thelittlemermaid,
    "Toy Story": showImages.toystory,
    "Toy Story 2": showImages.toystory,
    "Toy Story 3": showImages.toystory,
    "Toy Story 4": showImages.toystory,
    "A Bug's Life": showImages["abug'slife"],
    "Monsters Inc": showImages.monstersinc,
    "Monsters University": showImages.monstersinc,
    "Finding Nemo": showImages.findingnemo,
    "Finding Dory": showImages.findingnemo,
    "The Incredibles": showImages.theincredibles,
    "Incredibles 2": showImages.theincredibles,
    "Cars": showImages.cars,
    "Cars 2": showImages.cars,
    "Cars 3": showImages.cars,
    "Ratatouille": showImages.ratatouille,
    "WALL-E": showImages['wall-e'],
    "Up": showImages.up,
    "Inside Out": showImages.insideout,
    "Inside Out 2": showImages.insideout,
    "Coco": showImages.coco,
    "Onward": showImages.onward,
    "Soul": showImages.soul,
    "Luca": showImages.luca,
    "Turning Red": showImages.turningred,
    "Zootopia": showImages.zootopia,
    "Lilo & Stitch": showImages['lilo&stitch'],
    "Winnie the Pooh": showImages.winniethepooh,
    "Hercules": showImages.hercules,
  };

  useEffect(() => {
    fetchShows();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchFavorites(user.id);
  };

  const fetchShows = async () => {
    try {
      const { data, error } = await supabase
        .from("kids_shows")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setShows(data || []);
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("kids_favorites")
        .select("show_id")
        .eq("user_id", userId);
      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.show_id) || []));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (showId: string) => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      navigate("/auth");
      return;
    }
    try {
      if (favorites.has(showId)) {
        await supabase.from("kids_favorites").delete().eq("user_id", user.id).eq("show_id", showId);
        setFavorites(prev => { const s = new Set(prev); s.delete(showId); return s; });
        toast.success("Removed from favorites");
      } else {
        await supabase.from("kids_favorites").insert({ user_id: user.id, show_id: showId });
        setFavorites(prev => new Set(prev).add(showId));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Something went wrong");
    }
  };

  const handleFeatureNavigation = (path: string, featureName: string, requiresGate: boolean) => {
    if (requiresGate) {
      if (checkVerification()) {
        navigate(path);
      } else {
        setPendingNavigation(path);
        setPendingFeatureName(featureName);
        setShowParentalGate(true);
      }
    } else {
      navigate(path);
    }
  };

  const handleParentalGateSuccess = () => {
    setShowParentalGate(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
      setPendingFeatureName("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fairy Castle Background */}
      <div className="fixed inset-0">
        <img src={castleBg} alt="Fairy Castle" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-purple-900/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome banner for under-16 users */}
        <UnderageWelcomeBanner />

        {/* Animated Hero */}
        <KidsHero />

        <HeroRewardedAd sectionKey="page_kidschannel" />

        {/* Engagement row: Stars + Weekly Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <DailyStars starsCollected={0} totalStarsToday={5} />
          <WeeklyTheme />
        </div>

        {/* What's New */}
        <WhatsNewSpotlight />

        {/* New Kids Hub — 18 family tools */}
        <div className="max-w-7xl mx-auto mb-6">
          <Button
            size="lg"
            onClick={() => navigate('/kids-channel/hub')}
            className="w-full h-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold py-4 sm:py-6 px-4 text-sm sm:text-lg shadow-2xl hover:scale-[1.01] transition whitespace-normal text-center leading-snug"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0" />
            <span className="break-words">
              Open Kids Hub — 18 new family tools (profiles, learning paths, parental controls, mini-games)
            </span>
          </Button>
        </div>

        {/* Interactive Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
          <FeatureCard
            title="Chat with Characters! 💬"
            description="Have real conversations with your favorite characters!"
            icon={Volume2}
            iconColor="text-green-500"
            gradient="from-green-100/95 to-emerald-100/95"
            badges={[
              { text: "Voice Interactive", color: "bg-green-500 text-white" },
              { text: "Parent Check", color: "bg-purple-600 text-white", icon: Shield },
            ]}
            onClick={() => handleFeatureNavigation('/kids-stories/voice-chat', 'Character Chat', true)}
            delay={0}
            hasGoldPass={hasGoldPass}
            showUnlocked
          />

          <FeatureCard
            title="Story Games! 🎮"
            description="Solve puzzles and play games to unlock the next part of your story!"
            icon={Play}
            iconColor="text-red-500"
            gradient="from-red-100/95 to-rose-100/95"
            badges={[{ text: "Interactive Games", color: "bg-red-500 text-white" }]}
            onClick={() => navigate('/kids-stories/games')}
            delay={0.05}
          />

          <FeatureCard
            title="Bedtime Stories! 🌙"
            description="Calming stories with soft music to help you fall asleep peacefully."
            icon={Moon}
            iconColor="text-indigo-500"
            gradient="from-indigo-100/95 to-violet-100/95"
            badges={[{ text: "Relaxing", color: "bg-indigo-500 text-white" }]}
            onClick={() => navigate('/kids-stories/bedtime')}
            delay={0.1}
          />

          <FeatureCard
            title="Story Videos! 🎬"
            description="Watch magical animated stories come to life with AI!"
            icon={Video}
            iconColor="text-purple-500"
            gradient="from-purple-100/95 to-fuchsia-100/95"
            badges={[{ text: "AI Video", color: "bg-purple-500 text-white" }]}
            onClick={() => navigate('/story-video-demo')}
            delay={0.15}
          />

          <FeatureCard
            title="Create Your Hero! 🦸‍♀️"
            description="Design your own character and become the star of amazing adventures!"
            icon={Sparkles}
            iconColor="text-blue-500"
            gradient="from-blue-100/95 to-cyan-100/95"
            badges={[{ text: "Personalization", color: "bg-blue-500 text-white" }]}
            onClick={() => navigate('/kids-stories/create-character')}
            delay={0.2}
          />

          <FeatureCard
            title="Learn & Play! 🎓"
            description="Fun stories that teach you about numbers, letters, and the world!"
            icon={Trophy}
            iconColor="text-yellow-500"
            gradient="from-yellow-100/95 to-orange-100/95"
            badges={[{ text: "Educational", color: "bg-yellow-500 text-white" }]}
            onClick={() => navigate('/kids-stories/educational')}
            delay={0.25}
          />

          <FeatureCard
            title="Pricing & Plans! 💎"
            description="Unlock unlimited stories and premium features for your family!"
            icon={CreditCard}
            iconColor="text-pink-500"
            gradient="from-pink-100/95 to-rose-100/95"
            badges={[{ text: "Premium", color: "bg-pink-500 text-white" }]}
            onClick={() => navigate('/kids-pricing')}
            delay={0.3}
          />

          <FeatureCard
            title="Fairy Castles! 🏰"
            description="Explore all 6 magical fairy castles around the world in HD 360° tours!"
            icon={Castle}
            iconColor="text-blue-500"
            gradient="from-blue-100/95 to-sky-100/95"
            badges={[{ text: "Virtual Tour", color: "bg-blue-500 text-white" }]}
            onClick={() => navigate('/kids-channel/fairy-castles')}
            delay={0.35}
          />

          <FeatureCard
            title="My Magic Library! 📚"
            description="See all your saved stories, drawings, and characters in one place!"
            icon={Library}
            iconColor="text-amber-500"
            gradient="from-amber-100/95 to-yellow-100/95"
            badges={[{ text: "Portfolio", color: "bg-amber-500 text-white" }]}
            onClick={() => navigate('/kids-channel/my-gallery')}
            delay={0.4}
            hasGoldPass={hasGoldPass}
            showUnlocked
          />

          {user && (
            <FeatureCard
              title="Parent Dashboard 👨‍👩‍👧"
              description="View progress reports and set screen time limits."
              icon={BarChart3}
              iconColor="text-slate-500"
              gradient="from-slate-100/95 to-gray-100/95"
              badges={[
                { text: "Analytics", color: "bg-slate-500 text-white" },
                ...(!hasGoldPass ? [{ text: "Gold Pass", color: "border-amber-400 text-amber-600" }] : []),
              ]}
              onClick={() => navigate('/kids-channel/parental-dashboard')}
              delay={0.45}
              hasGoldPass={hasGoldPass}
              showUnlocked
            />
          )}
        </div>

        {/* Adventure Map + Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto mb-8">
          <AdventureMap />
          <KidsProfileBadges />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Footer */}
      <div className="relative z-10 container mx-auto px-4 pb-8">
        <SafeContentBadge />
      </div>

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onSuccess={handleParentalGateSuccess}
        onClose={() => {
          setShowParentalGate(false);
          setPendingNavigation(null);
          setPendingFeatureName("");
        }}
        featureName={pendingFeatureName}
      />

      {/* Smart Sleep Timer */}
      <SmartSleepTimer />
    </div>
  );
};

export default KidsChannel;
