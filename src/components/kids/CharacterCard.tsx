import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Character {
  id: string;
  name: string;
  emoji: string;
  personality: string;
  color: string;
  characterType: string;
}

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateCharacterImage();
  }, [character.id]);

  const generateCharacterImage = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: { 
          characterName: character.name,
          characterType: character.characterType
        }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (error) {
      console.error('Error generating character image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`h-auto py-0 flex flex-col items-center gap-0 bg-gradient-to-br ${character.color} hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group relative`}
    >
      <div className="w-full aspect-square flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors relative">
        {isLoading ? (
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl transform group-hover:scale-110 transition-transform">
            {character.emoji}
          </span>
        )}
      </div>
      <div className="w-full py-3 px-2 bg-white/90">
        <span className="text-sm font-bold text-gray-800">
          {character.name}
        </span>
      </div>
    </Button>
  );
}
