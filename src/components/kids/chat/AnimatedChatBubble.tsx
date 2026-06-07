import { motion } from "framer-motion";
import { characterImages } from "@/data/characterImages";
import { useState } from "react";
import type { Character } from "@/data/kidsCharacters";

interface AnimatedChatBubbleProps {
  message: { role: string; content: string };
  character: Character;
  index: number;
  onReaction?: (emoji: string) => void;
}

const REACTION_EMOJIS = ["😂", "❤️", "🤩", "👏", "🎉", "💡"];

export function AnimatedChatBubble({ message, character, index, onReaction }: AnimatedChatBubbleProps) {
  const avatarImage = characterImages[character.id];
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const isUser = message.role === "user";

  const handleReaction = (emoji: string) => {
    setSelectedReaction(emoji);
    setShowReactions(false);
    onReaction?.(emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: index * 0.05
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} group`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        {!isUser && (
          <motion.div 
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center text-lg shadow-lg flex-shrink-0 overflow-hidden`}
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            {avatarImage ? (
              <img src={avatarImage} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              character.emoji
            )}
          </motion.div>
        )}

        <div className="relative">
          {/* Message Bubble */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl px-4 py-3 shadow-md ${
              isUser
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
                : `bg-gradient-to-br ${character.color} text-white rounded-bl-sm`
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </motion.div>

          {/* Reaction Button (only for assistant messages) */}
          {!isUser && message.content && (
            <div className="relative mt-1">
              {selectedReaction && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className="inline-block text-lg cursor-pointer"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  {selectedReaction}
                </motion.span>
              )}

              {!selectedReaction && (
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white/80 rounded-full px-2 py-0.5 shadow-sm hover:bg-white"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  😊 React
                </motion.button>
              )}

              {/* Reaction Picker */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute bottom-full mb-1 left-0 flex gap-1 bg-white rounded-full px-2 py-1 shadow-xl border z-10"
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(emoji)}
                      className="text-lg hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg shadow-lg flex-shrink-0"
            whileHover={{ scale: 1.2 }}
          >
            👤
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
