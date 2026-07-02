import { motion } from "framer-motion";
import { characterImages } from "@/data/characterImages";
import type { Character } from "@/data/kidsCharacters";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ImmersiveCharacterCardProps {
  character: Character;
  onClick: () => void;
  index: number;
}

export function ImmersiveCharacterCard({ character, onClick, index }: ImmersiveCharacterCardProps) {
  const imageUrl = characterImages[character.id];

  return (
    <>
      <FloatingHowItWorks title={"Immersive Character Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Immersive Character Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Immersive Character Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: index * 0.05 
      }}
      whileHover={{ 
        scale: 1.08, 
        rotateY: 5,
        z: 50,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group perspective"
      style={{ perspective: "600px" }}
    >
      <div className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br ${character.color}`}>
        {/* Character Image/Emoji */}
        <div className="relative w-full aspect-square flex items-center justify-center bg-white/10 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <motion.span 
              className="text-6xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
            >
              {character.emoji}
            </motion.span>
          )}

          {/* Sparkle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Floating particles */}
          <motion.div
            className="absolute top-2 right-2 text-sm opacity-0 group-hover:opacity-100"
            animate={{ y: [0, -10, 0], rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            ✨
          </motion.div>
        </div>

        {/* Name Bar */}
        <div className="bg-white/95 backdrop-blur-sm py-2.5 px-3 text-center">
          <p className="text-sm font-bold text-gray-800">{character.name}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{character.characterType}</p>
        </div>

        {/* Online indicator */}
        <div className="absolute top-2 left-2">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </div>
    </motion.div>
    </>
  );
}
