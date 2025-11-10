import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Character {
  id: string;
  name: string;
  hair_color: string;
  superpower: string;
  image_url: string;
  created_at: string;
}

export default function CharacterGallery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hairColorNames: Record<string, string> = {
    brown: "Brown",
    black: "Black",
    blonde: "Blonde",
    red: "Red",
    blue: "Blue",
    pink: "Pink",
    rainbow: "Rainbow"
  };

  const superpowerNames: Record<string, string> = {
    flying: "Flying",
    "super-strength": "Super Strength",
    invisibility: "Invisibility",
    "talking-to-animals": "Talk to Animals",
    "magic-spells": "Magic Spells",
    "super-speed": "Super Speed"
  };

  const superpowerEmojis: Record<string, string> = {
    flying: "🦅",
    "super-strength": "💪",
    invisibility: "👻",
    "talking-to-animals": "🦊",
    "magic-spells": "✨",
    "super-speed": "⚡"
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
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
        description: "Failed to load characters",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('created_characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCharacters(characters.filter(c => c.id !== id));
      toast({
        title: "Character Deleted",
        description: "Character removed from gallery"
      });
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 animate-fade-in">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/kids-stories/create-character")}
            className="hover:bg-white/70 hover-scale transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create New Hero
          </Button>
        </div>

        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-300 shadow-2xl mb-8 animate-scale-in overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/30 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-300/30 to-transparent rounded-full -ml-12 -mb-12" />
            <CardContent className="p-8 text-center relative z-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🖼️ My Hero Gallery
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                All your amazing characters in one place!
              </p>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Sparkles className="h-12 w-12 text-purple-600 animate-spin" />
            </div>
          ) : characters.length === 0 ? (
            <Card className="bg-white/95 border-3 border-purple-300 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🦸‍♀️</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Characters Yet</h2>
                <p className="text-gray-600 mb-6">Create your first hero to start your collection!</p>
                <Button
                  onClick={() => navigate("/kids-stories/create-character")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your First Hero
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Card 
                  key={character.id} 
                  className="bg-white/95 border-3 border-purple-300 shadow-lg hover-scale transition-all overflow-hidden group"
                >
                  <div className="relative">
                    <img 
                      src={character.image_url} 
                      alt={character.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(character.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      {character.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1.5">
                        <span className="text-sm font-semibold text-gray-700">
                          Hair: {hairColorNames[character.hair_color] || character.hair_color}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 rounded-full px-3 py-1.5">
                        <span className="text-xl">{superpowerEmojis[character.superpower]}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {superpowerNames[character.superpower] || character.superpower}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Created: {new Date(character.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
