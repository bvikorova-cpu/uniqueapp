import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sword, Shield, Zap } from "lucide-react";
import { LevelBadge } from "@/components/character/LevelBadge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Character {
  id: string;
  name: string;
  image_url: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  category: string;
  level?: number;
  experience?: number;
  experience_to_next_level?: number;
}

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
  label: string;
  position: 'left' | 'right';
}

export const CharacterSelector = ({
  characters,
  selectedCharacter,
  onSelect,
  label,
  position
}: CharacterSelectorProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Character Selector - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Selector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Selector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        {label}
      </h2>
      
      {selectedCharacter ? (
        <div className="space-y-4 animate-scale-in">
          <div className="relative rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
            <img
              src={selectedCharacter.image_url}
              alt={selectedCharacter.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              <h3 className="text-2xl font-bold text-white text-center">
                {selectedCharacter.name}
              </h3>
              <p className="text-yellow-400 text-center text-sm">
                {selectedCharacter.category}
              </p>
              {selectedCharacter.level && (
                <div className="flex justify-center">
                  <LevelBadge 
                    level={selectedCharacter.level}
                    experience={selectedCharacter.experience || 0}
                    experienceToNextLevel={selectedCharacter.experience_to_next_level || 100}
                    showProgress={false}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-xs text-gray-300">HP</div>
                <div className="text-xl font-bold text-white">{selectedCharacter.hp}</div>
              </div>
            </div>
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-3 flex items-center gap-2">
              <Sword className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-xs text-gray-300">Attack</div>
                <div className="text-xl font-bold text-white">{selectedCharacter.attack}</div>
              </div>
            </div>
            <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-xs text-gray-300">Defense</div>
                <div className="text-xl font-bold text-white">{selectedCharacter.defense}</div>
              </div>
            </div>
            <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-xs text-gray-300">Speed</div>
                <div className="text-xl font-bold text-white">{selectedCharacter.speed}</div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => onSelect(null as any)}
            variant="outline"
            className="w-full border-purple-500 hover:bg-purple-500/20"
          >
            Change Fighter
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {characters.map((character) => (
            <Button
              key={character.id}
              onClick={() => onSelect(character)}
              variant="outline"
              className="w-full h-auto p-4 border-2 border-purple-500/50 hover:border-yellow-500 hover:bg-yellow-500/10 transition-all group"
            >
              <div className="flex items-center gap-4 w-full">
                <img
                  src={character.image_url}
                  alt={character.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 group-hover:border-yellow-500"
                />
                <div className="flex-1 text-left">
                  <div className="font-bold text-white text-lg">{character.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">{character.category}</div>
                    {character.level && (
                      <div className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded font-bold">
                        Lv {character.level}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="text-red-400">❤️ {character.hp}</span>
                    <span className="text-orange-400">⚔️ {character.attack}</span>
                    <span className="text-blue-400">🛡️ {character.defense}</span>
                    <span className="text-yellow-400">⚡ {character.speed}</span>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </Card>
    </>
  );
};
