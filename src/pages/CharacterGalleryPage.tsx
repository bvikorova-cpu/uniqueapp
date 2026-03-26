import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface Character {
  id: string;
  name: string;
  hair_color: string;
  superpower: string;
  image_url: string;
  created_at: string;
}

export default function CharacterGalleryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hairColors: Record<string, { name: string; emoji: string }> = {
    brown: { name: "Brown", emoji: "🟤" },
    black: { name: "Black", emoji: "⚫" },
    blonde: { name: "Blonde", emoji: "🟡" },
    red: { name: "Red", emoji: "🔴" },
    blue: { name: "Blue", emoji: "🔵" },
    pink: { name: "Pink", emoji: "💗" },
    rainbow: { name: "Rainbow", emoji: "🌈" }
  };

  const superPowers: Record<string, { name: string; emoji: string }> = {
    flying: { name: "Flying", emoji: "🦅" },
    "super-strength": { name: "Super Strength", emoji: "💪" },
    invisibility: { name: "Invisibility", emoji: "👻" },
    "talking-to-animals": { name: "Talk to Animals", emoji: "🦊" },
    "magic-spells": { name: "Magic Spells", emoji: "✨" },
    "super-speed": { name: "Super Speed", emoji: "⚡" }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/kids-channel');
        return;
      }

      const { data, error } = await supabase
        .from('created_characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast({
        title: "Error",
        description: "Failed to load your characters",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('created_characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCharacters(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Character Deleted",
        description: "Your hero has been removed from the gallery"
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 animate-fade-in">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-channel")}
            className="hover:bg-white/70 hover-scale transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>
          
          <Button
            onClick={() => navigate("/kids-stories/create-character")}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold shadow-lg hover-scale"
          >
            Create New Hero ✨
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl mb-8 animate-scale-in">
          <CardContent className="p-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent text-center mb-2">
              Your Hero Gallery 🦸‍♀️
            </h1>
            <p className="text-center text-xl text-gray-700 font-medium">
              {characters.length} amazing {characters.length === 1 ? 'hero' : 'heroes'} created!
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
        ) : characters.length === 0 ? (
          <Card className="bg-white/95 border-3 border-purple-300 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6">🎨</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                No Heroes Yet!
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Start creating your amazing characters and they'll appear here
              </p>
              <Button
                onClick={() => navigate("/kids-stories/create-character")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-6 shadow-lg hover-scale"
              >
                Create Your First Hero! 🚀
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card 
                key={character.id}
                className="bg-white/95 border-3 border-purple-300 shadow-xl hover-scale transition-all overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={character.image_url}
                      alt={character.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(character.id)}
                        disabled={deletingId === character.id}
                        className="bg-red-500 hover:bg-red-600 shadow-lg"
                      >
                        {deletingId === character.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4 text-center">
                      {character.name}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-4 py-2 text-center">
                        <p className="text-gray-800 font-semibold">
                          Hair: {hairColors[character.hair_color]?.emoji} {hairColors[character.hair_color]?.name}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-4 py-2 text-center">
                        <p className="text-gray-800 font-semibold">
                          Power: {superPowers[character.superpower]?.emoji} {superPowers[character.superpower]?.name}
                        </p>
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-2">
                        Created {new Date(character.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
