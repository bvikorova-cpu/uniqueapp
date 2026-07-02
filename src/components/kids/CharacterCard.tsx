import { Button } from "@/components/ui/button";
import type { Character } from "@/data/kidsCharacters";
import { characterImages } from "@/data/characterImages";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  const imageUrl = characterImages[character.id];

  return (
    <>
      <FloatingHowItWorks title={"Character Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button
      onClick={onClick}
      className={`h-auto py-0 flex flex-col items-center gap-0 bg-gradient-to-br ${character.color} hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group`}
    >
      <div className="w-full aspect-square flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={character.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
          />
        ) : (
          <span className="text-6xl sm:text-7xl transform group-hover:scale-110 transition-transform">
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
    </>
  );
}
