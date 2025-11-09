import { Button } from "@/components/ui/button";
import type { Character } from "@/data/kidsCharacters";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <Button
      onClick={onClick}
      className={`h-auto py-0 flex flex-col items-center gap-0 bg-gradient-to-br ${character.color} hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden group`}
    >
      <div className="w-full aspect-square flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors overflow-hidden">
        <span className="text-6xl group-hover:scale-110 transition-transform">{character.emoji}</span>
      </div>
      <div className="w-full py-3 px-2 bg-white/90">
        <span className="text-sm font-bold text-gray-800">
          {character.name}
        </span>
      </div>
    </Button>
  );
}
