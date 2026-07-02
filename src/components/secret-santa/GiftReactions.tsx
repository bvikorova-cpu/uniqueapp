import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const REACTION_TYPES = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "thanks", emoji: "🙏", label: "Thanks" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "star", emoji: "⭐", label: "Star" },
];

interface GiftReactionsProps {
  giftId: string;
  compact?: boolean;
}

export const GiftReactions = ({ giftId, compact = false }: GiftReactionsProps) => {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);

  // Get reactions for this gift
  const { data: reactions = [] } = useQuery({
    queryKey: ["gift-reactions", giftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_gifts_reactions")
        .select("*")
        .eq("gift_id", giftId);

      if (error) throw error;
      return data;
    },
  });

  // Get current user's reaction
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const userReaction = reactions.find(r => r.user_id === currentUser?.id);

  // Add/update reaction
  const addReaction = useMutation({
    mutationFn: async (reactionType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Remove existing reaction first if any
      if (userReaction) {
        await supabase
          .from("social_gifts_reactions")
          .delete()
          .eq("gift_id", giftId)
          .eq("user_id", user.id);
      }

      // If clicking same reaction, just remove it
      if (userReaction?.reaction_type === reactionType) {
        return;
      }

      // Add new reaction
      const { error } = await supabase
        .from("social_gifts_reactions")
        .insert({
          gift_id: giftId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-reactions", giftId] });
      setShowPicker(false);
    },
  });

  // Count reactions by type
  const reactionCounts = REACTION_TYPES.map(rt => ({
    ...rt,
    count: reactions.filter(r => r.reaction_type === rt.type).length,
    isUserReaction: userReaction?.reaction_type === rt.type,
  })).filter(r => r.count > 0 || r.isUserReaction);

  if (compact) {
    return (
    <>
      <FloatingHowItWorks title={"Gift Reactions - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Reactions section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Reactions.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center gap-1">
        {reactionCounts.length > 0 ? (
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-full px-2 py-0.5">
            {reactionCounts.slice(0, 3).map(r => (
              <span key={r.type} className="text-sm">{r.emoji}</span>
            ))}
            {reactions.length > 0 && (
              <span className="text-xs text-gray-500 ml-1">{reactions.length}</span>
            )}
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          {userReaction ? (
            <span>{REACTION_TYPES.find(r => r.type === userReaction.reaction_type)?.emoji}</span>
          ) : (
            <span className="text-lg">+</span>
          )}
        </Button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white rounded-full shadow-lg border p-1 z-10"
            >
              {REACTION_TYPES.map(r => (
                <button
                  key={r.type}
                  onClick={() => addReaction.mutate(r.type)}
                  className={`w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-transform hover:scale-125 ${
                    userReaction?.reaction_type === r.type ? "bg-amber-100" : ""
                  }`}
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
  }

  return (
    <div className="relative">
      {/* Reaction counts */}
      {reactionCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {reactionCounts.map(r => (
            <motion.button
              key={r.type}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addReaction.mutate(r.type)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                r.isUserReaction
                  ? "bg-amber-100 border border-amber-300"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span>{r.emoji}</span>
              <span className="text-gray-600">{r.count}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Add reaction button */}
      <div className="relative inline-block">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <span className="text-lg mr-1">😊</span>
          <span className="text-xs">React</span>
        </Button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white rounded-2xl shadow-xl border p-2 z-10"
            >
              {REACTION_TYPES.map(r => (
                <motion.button
                  key={r.type}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addReaction.mutate(r.type)}
                  className={`w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-2xl transition-all ${
                    userReaction?.reaction_type === r.type ? "bg-amber-100 ring-2 ring-amber-400" : ""
                  }`}
                  title={r.label}
                >
                  {r.emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
