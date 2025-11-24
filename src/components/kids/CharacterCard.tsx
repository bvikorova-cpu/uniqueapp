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
    const cacheKey = `character-image-${character.id}`;
    
    // Check if image is cached in localStorage
    try {
      const cachedImage = localStorage.getItem(cacheKey);
      if (cachedImage) {
        setImageUrl(cachedImage);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }

    // Generate new image if not cached
    const generateImage = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-character-image`,
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
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to generate character image:', errorData);
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        if (data.imageUrl) {
          // Cache the image in localStorage
          try {
            localStorage.setItem(cacheKey, data.imageUrl);
          } catch (e) {
            console.warn('Failed to cache image to localStorage:', e);
          }
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error generating character image:', error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateImage();
  }, [character.id, character.name, character.characterType]);

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
