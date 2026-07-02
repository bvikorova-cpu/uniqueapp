import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Star, Search, Loader2, ListChecks, Sparkles, CheckCircle } from "lucide-react";
import { GIFT_CATALOG, GIFT_CATEGORIES } from "@/hooks/useSecretSanta";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WishlistItem {
  id: string;
  user_id: string;
  gift_type: string;
  gift_emoji: string;
  gift_label: string;
  priority: string;
  note: string | null;
  is_fulfilled: boolean;
  created_at: string;
}

export const GiftWishlist = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["santa-wishlist", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("secret_santa_wishlists")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!currentUserId,
  });

  const addToWishlist = useMutation({
    mutationFn: async (gift: { type: string; emoji: string; label: string; priority: string; note?: string }) => {
      if (!currentUserId) throw new Error("Not authenticated");

      // Check if already in wishlist
      const exists = wishlist.find(w => w.gift_type === gift.type);
      if (exists) throw new Error("This gift is already in your wishlist!");

      const { error } = await supabase.from("secret_santa_wishlists").insert({
        user_id: currentUserId,
        gift_type: gift.type,
        gift_emoji: gift.emoji,
        gift_label: gift.label,
        priority: gift.priority,
        note: gift.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added to wishlist! ❤️");
      queryClient.invalidateQueries({ queryKey: ["santa-wishlist"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("secret_santa_wishlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["santa-wishlist"] });
    },
  });

  const filteredGifts = GIFT_CATALOG.filter(g => {
    const matchesSearch = g.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    const notInWishlist = !wishlist.find(w => w.gift_type === g.type);
    return matchesSearch && matchesCategory && notInWishlist;
  }).slice(0, 20);

  const priorityColor = (p: string) => {
    switch (p) {
      case "high": return "text-red-500 bg-red-50 border-red-200";
      case "medium": return "text-amber-500 bg-amber-50 border-amber-200";
      case "low": return "text-green-500 bg-green-50 border-green-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  if (!currentUserId) {
    return (
    <>
      <FloatingHowItWorks title={"Gift Wishlist - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Wishlist section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Wishlist.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 bg-white/90 border-amber-200 text-center">
        <Heart className="h-12 w-12 mx-auto text-pink-400 mb-4" />
        <p className="text-gray-600">Please log in to manage your wishlist</p>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-pink-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gift Wishlist</h2>
        <p className="text-gray-500 text-sm">Create your wishlist so friends know what gifts you'd love to receive!</p>
      </Card>

      {/* My Wishlist */}
      <Card className="p-4 bg-white/80 border-pink-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-pink-500" /> My Wishlist ({wishlist.length})
          </h3>
          <Button
            size="sm"
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Gift
          </Button>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your wishlist is empty</p>
            <p className="text-xs mt-1">Add gifts you'd love to receive!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wishlist.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${item.is_fulfilled ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}
              >
                <span className="text-2xl">{item.gift_emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">{item.gift_label}</p>
                  {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor(item.priority)}`}>
                  {item.priority}
                </span>
                {item.is_fulfilled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => removeFromWishlist.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Gift Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-4 bg-white/80 border-pink-200 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" /> Browse Gifts to Add
              </h3>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search gifts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-pink-200"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32 border-pink-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GIFT_CATEGORIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {filteredGifts.map(gift => (
                  <motion.div key={gift.type} whileTap={{ scale: 0.97 }}>
                    <Card
                      className="p-3 cursor-pointer hover:border-pink-300 transition-all text-center border-gray-100"
                      onClick={() => addToWishlist.mutate({
                        type: gift.type,
                        emoji: gift.emoji,
                        label: gift.label,
                        priority: "medium",
                      })}
                    >
                      <span className="text-2xl block mb-1">{gift.emoji}</span>
                      <p className="text-xs font-bold text-gray-800 truncate">{gift.label}</p>
                      <p className="text-[10px] text-gray-400">💎 {gift.value}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredGifts.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No matching gifts found</p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <Card className="p-4 bg-pink-50 border-pink-200 shadow-sm">
        <h3 className="font-bold text-pink-800 mb-2 flex items-center gap-2">
          <Star className="h-4 w-4" /> Wishlist Tips
        </h3>
        <ul className="space-y-1 text-sm text-pink-700">
          <li>• Add gifts across different categories and price ranges</li>
          <li>• Set priority levels so friends know what matters most</li>
          <li>• Your wishlist is visible to other users who want to gift you</li>
          <li>• Fulfilled items are automatically marked when you receive them</li>
        </ul>
      </Card>
    </div>
  );
};
