import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Character } from "@/data/kidsCharacters";
import { Loader2 } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    generateImage();
  }, [character.id]);

  const generateImage = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/generate-character-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            characterName: character.name,
            characterType: character.characterType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`h-auto py-0 flex flex-col items-center gap-0 bg-gradient-to-br ${character.color} hover:opacity-90 transition-opacity overflow-hidden relative group`}
      disabled={loading}
    >
      <div className="w-full aspect-square relative overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-white/20">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center bg-white/20">
            <span className="text-6xl">{character.emoji}</span>
          </div>
        ) : (
          <img
            src={imageUrl || ''}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
      <div className="w-full py-3 px-2 bg-white/90">
        <span className="text-sm font-semibold text-gray-800">
          {character.name}
        </span>
      </div>
    </Button>
  );
}
