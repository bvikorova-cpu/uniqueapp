import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Play, Star, Sparkles, Crown } from "lucide-react";
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
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-purple-900/60"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <Sparkles className="text-yellow-300 w-12 h-12 opacity-70" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Star className="text-yellow-200 w-16 h-16 opacity-60" />
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float">
          <Sparkles className="text-pink-300 w-10 h-10 opacity-70" />
        </div>
        <div className="absolute bottom-20 right-1/3 animate-float-delayed">
          <Star className="text-purple-300 w-14 h-14 opacity-60" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header - Moved Lower */}
        <div className="text-center mb-12 animate-fade-in mt-32">
          <h1 className="text-7xl font-bold text-white mb-6 font-signature drop-shadow-2xl">
            Kids Channel ✨
          </h1>
          <p className="text-2xl text-white/90 mb-3 drop-shadow-lg">
            Magical Stories for Little Dreamers
          </p>
          <div className="flex items-center justify-center gap-2 text-white/90 drop-shadow-md">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span>Premium content available for subscribers</span>
          </div>
        </div>


        {/* Coming Soon Message */}
        <div className="text-center py-20 px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 max-w-2xl mx-auto border-4 border-white/50 shadow-2xl">
            <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-purple-600 mb-4">
              Coming Soon! 🎬
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              We're working on something magical for your little ones!
            </p>
            <p className="text-gray-600">
              Amazing stories and adventures will be available here very soon.
            </p>
          </div>
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
