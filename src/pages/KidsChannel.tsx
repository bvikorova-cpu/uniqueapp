import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Play, Star, Sparkles, Crown, BookOpen, Volume2, Trophy, Moon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { showImages } from "@/components/kids/ShowImages";
import castleBg from "@/assets/kids/disney-castle-bg.jpg";

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

const KidsChannel = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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
    if (user) {
      fetchFavorites(user.id);
    }
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
        await supabase
          .from("kids_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("show_id", showId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(showId);
          return newSet;
        });
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("kids_favorites")
          .insert({ user_id: user.id, show_id: showId });
        setFavorites(prev => new Set(prev).add(showId));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Something went wrong");
    }
  };

  const categories = ["All", ...Array.from(new Set(shows.map(s => s.category)))];

  const filteredShows = selectedCategory === "All" 
    ? shows 
    : shows.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-400">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Disney Castle Background */}
      <div className="fixed inset-0">
        <img 
          src={castleBg} 
          alt="Disney Castle" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-purple-900/50"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <Sparkles className="text-yellow-300 w-12 h-12 opacity-70 drop-shadow-lg" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Star className="text-yellow-200 w-16 h-16 opacity-60 drop-shadow-lg" />
        </div>
        <div className="absolute top-1/2 left-20 animate-float">
          <Sparkles className="text-pink-300 w-10 h-10 opacity-70 drop-shadow-lg" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-delayed">
          <Star className="text-purple-300 w-14 h-14 opacity-60 drop-shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header - Positioned to show castle */}
        <div className="text-center mb-16 animate-fade-in pt-8">
          <h1 className="text-7xl md:text-8xl font-bold text-white mb-4 font-signature drop-shadow-2xl">
            Kids Channel ✨
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 mb-3 drop-shadow-lg font-semibold">
            Magical Stories for Little Dreamers
          </p>
          <div className="flex items-center justify-center gap-2 text-white/95 drop-shadow-md text-lg">
            <Crown className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
            <span className="font-medium">Premium content available for subscribers</span>
          </div>
        </div>

        {/* Spacer to show castle better */}
        <div className="h-32 md:h-48"></div>

        {/* Interactive Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {/* Choose Your Own Adventure */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-pink-100/95 to-purple-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-pink-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-pink-300/50"
            onClick={() => navigate('/kids-stories/adventure')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <BookOpen className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">
                Choose Your Adventure! 🎭
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                YOU decide what happens next! Make choices and create your own unique story.
              </p>
              <Badge className="bg-pink-500 text-white shadow-md">Interactive Stories</Badge>
            </div>
          </Card>

          {/* Create Your Character */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-blue-100/95 to-cyan-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-blue-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-blue-300/50"
            onClick={() => navigate('/kids-stories/create-character')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Create Your Hero! 🦸‍♀️
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Design your own character and become the star of amazing adventures!
              </p>
              <Badge className="bg-blue-500 text-white shadow-md">Personalization</Badge>
            </div>
          </Card>

          {/* Voice Stories */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-green-100/95 to-emerald-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-green-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-green-300/50"
            onClick={() => navigate('/kids-stories/voice-chat')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Volume2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Talk to Characters! 🎤
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Have real conversations with story characters using your voice!
              </p>
              <Badge className="bg-green-500 text-white shadow-md">Voice Interactive</Badge>
            </div>
          </Card>

          {/* Educational Stories */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-yellow-100/95 to-orange-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-yellow-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-yellow-300/50"
            onClick={() => navigate('/kids-stories/educational')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-orange-700 mb-2">
                Learn & Play! 🎓
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Fun stories that teach you about numbers, letters, and the world!
              </p>
              <Badge className="bg-yellow-500 text-white shadow-md">Educational</Badge>
            </div>
          </Card>

          {/* Mini Games */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-red-100/95 to-rose-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-red-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-red-300/50"
            onClick={() => navigate('/kids-stories/games')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Play className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Story Games! 🎮
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Solve puzzles and play games to unlock the next part of your story!
              </p>
              <Badge className="bg-red-500 text-white shadow-md">Interactive Games</Badge>
            </div>
          </Card>

          {/* Bedtime Stories */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-100/95 to-violet-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-indigo-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-indigo-300/50"
            onClick={() => navigate('/kids-stories/bedtime')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Moon className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-indigo-700 mb-2">
                Bedtime Stories! 🌙
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Calming stories with soft music to help you fall asleep peacefully.
              </p>
              <Badge className="bg-indigo-500 text-white shadow-md">Relaxing</Badge>
            </div>
          </Card>

          {/* Pricing & Plans */}
          <Card 
            className="group relative overflow-hidden bg-gradient-to-br from-pink-100/95 to-rose-100/95 backdrop-blur-sm border-4 border-white/60 hover:border-pink-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl hover:shadow-pink-300/50"
            onClick={() => navigate('/kids-pricing')}
          >
            <div className="p-6 text-center">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <CreditCard className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-pink-700 mb-2">
                Pricing & Plans! 💎
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Unlock unlimited stories and premium features for your family!
              </p>
              <Badge className="bg-pink-500 text-white shadow-md">Premium</Badge>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-10deg); }
        }
        
        @keyframes cloud {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes cloud-slow {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(100vw); }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-cloud {
          animation: cloud 60s linear infinite;
        }
        
        .animate-cloud-slow {
          animation: cloud-slow 90s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default KidsChannel;
