import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Character } from "@/data/kidsCharacters";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use placeholder image from placeholder.svg
    setImageUrl('/placeholder.svg');
    setIsLoading(false);
  }, [character.id]);

  return (
    <Button
      onClick={onClick}
      className={`h-auto py-0 flex flex-col items-center gap-0 bg-gradient-to-br ${character.color} hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group`}
    >
      <div className="w-full aspect-square flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={character.name}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="text-sm text-gray-600 text-center px-2">Image unavailable</div>
          </div>
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
