import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Play, Clock, Eye, Crown, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { showImages, episodeImages } from "@/components/kids/ShowImages";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSSHOWDETAIL_STEPS = [
  { title: 'Check the age rating', desc: 'Every show shows its recommended age.' },
  { title: 'Play the episode', desc: 'The player is ad-free with Gold Pass.' },
  { title: 'Earn stars for watching', desc: 'Completing an episode rewards stars.' },
  { title: 'Related shows', desc: 'The page suggests similar age-appropriate shows.' }
];
const __HIW_KIDSSHOWDETAIL = { title: 'Kids Show', intro: 'Watch a single show — safe, moderated and age-rated.', steps: __HIW_KIDSSHOWDETAIL_STEPS };


interface Show {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  category: string;
  age_rating: string;
  is_premium: boolean;
}

interface Episode {
  id: string;
  show_id: string;
  title: string;
  description: string;
  episode_number: number;
  season_number: number;
  duration_minutes: number;
  video_url: string;
  thumbnail_url: string;
  is_premium: boolean;
  views: number;
}

const KidsShowDetail = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

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

  const episodeImageMap: Record<string, string> = {
    "Peppa Goes to Playgroup": episodeImages.peppaEp1,
    "Birthday Party": episodeImages.peppaEp2,
    "Kitten Rescue": episodeImages.pawEp1,
  };

  useEffect(() => {
    if (showId) {
      fetchShow();
      fetchEpisodes();
      checkUser();
    }
  }, [showId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user && showId) {
      checkFavorite(user.id);
    }
  };

  const fetchShow = async () => {
    try {
      const { data, error } = await supabase
        .from("kids_shows")
        .select("*")
        .eq("id", showId)
        .single();

      if (error) throw error;
      setShow(data);
    } catch (error) {
      console.error("Error fetching show:", error);
      toast.error("Failed to load show");
    }
  };

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from("kids_episodes")
        .select("*")
        .eq("show_id", showId)
        .order("season_number", { ascending: true })
        .order("episode_number", { ascending: true });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast.error("Failed to load episodes");
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("kids_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("show_id", showId)
        .single();

      if (data) setIsFavorite(true);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      navigate("/auth");
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from("kids_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("show_id", showId);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await supabase
          .from("kids_favorites")
          .insert({ user_id: user.id, show_id: showId });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Something went wrong");
    }
  };

  const playEpisode = async (episode: Episode) => {
    // Check premium access
    if (episode.is_premium && !user) {
      toast.error("Please sign in to watch premium content");
      navigate("/auth");
      return;
    }

    // Track view
    if (user) {
      await supabase
        .from("kids_watch_history")
        .upsert({
          user_id: user.id,
          episode_id: episode.id,
          last_watched_at: new Date().toISOString()
        });
    }

    // Increment view count
    await supabase
      .from("kids_episodes")
      .update({ views: episode.views + 1 })
      .eq("id", episode.id);

    // Open YouTube video in new tab (many videos don't allow embedding)
    window.open(episode.video_url, '_blank');
    toast.success("Opening video in YouTube...");
  };

  const seasons = [...new Set(episodes.map(e => e.season_number))].sort();
  const seasonEpisodes = episodes.filter(e => e.season_number === selectedSeason);

  if (loading || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-400">
      <FloatingHowItWorks title={__HIW_KIDSSHOWDETAIL.title} intro={__HIW_KIDSSHOWDETAIL.intro} steps={__HIW_KIDSSHOWDETAIL.steps} />
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 animate-gradient-shift">
        <div className="absolute top-20 left-10 animate-float">
          <Sparkles className="text-yellow-300 w-12 h-12 opacity-70" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Star className="text-yellow-200 w-16 h-16 opacity-60" />
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float">
          <Sparkles className="text-pink-300 w-10 h-10 opacity-70" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div 
          className="relative h-[60vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${showImageMap[show.title] || show.cover_image_url || showImages.default})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">
            <Button
              variant="ghost"
              onClick={() => navigate("/kids-channel")}
              className="absolute top-4 left-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blue-500/90 text-white text-sm">
                  {show.age_rating}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {show.category}
                </Badge>
                {show.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                    <Crown className="w-4 h-4 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {show.title}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {show.description}
              </p>

              <div className="flex gap-4">
                {episodes.length > 0 && (
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-white/90"
                    onClick={() => playEpisode(episodes[0])}
                  >
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    Play
                  </Button>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={toggleFavorite}
                >
                  <Heart 
                    className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`}
                  />
                  {isFavorite ? "In Favorites" : "Add to Favorites"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-6">Episodes</h2>

          {seasons.length > 1 && (
            <Tabs value={selectedSeason.toString()} onValueChange={(v) => setSelectedSeason(parseInt(v))} className="mb-8">
              <TabsList className="bg-white/20 backdrop-blur-md border border-white/30">
                {seasons.map(season => (
                  <TabsTrigger 
                    key={season} 
                    value={season.toString()}
                    className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-600"
                  >
                    Season {season}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seasonEpisodes.map((episode, index) => (
              <Card 
                key={episode.id}
                className="group overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => playEpisode(episode)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={episodeImageMap[episode.title] || episode.thumbnail_url || showImages.default} 
                    alt={episode.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {episode.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3">
                      <Play className="w-8 h-8 text-purple-600" fill="currentColor" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{episode.duration_minutes} min</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">
                        E{episode.episode_number}
                      </Badge>
                      <h3 className="font-bold text-gray-900 line-clamp-2">
                        {episode.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {episode.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{episode.views}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
      `}</style>
    </div>
  );
};

export default KidsShowDetail;
