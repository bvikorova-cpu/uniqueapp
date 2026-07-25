import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Copy, RefreshCw, Zap, MessageCircle, Send, Sparkles, Search, X, Check } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { searchProfiles, PublicProfileResult } from "@/lib/searchProfiles";

const THANK_YOU_STYLES = [
  { id: "heartfelt", label: "Heartfelt", emoji: "💕", desc: "Sincere and emotional" },
  { id: "funny", label: "Funny", emoji: "😄", desc: "Lighthearted and playful" },
  { id: "formal", label: "Formal", emoji: "🎩", desc: "Polite and professional" },
  { id: "poetic", label: "Poetic", emoji: "📝", desc: "Beautiful and artistic" },
  { id: "excited", label: "Excited", emoji: "🎉", desc: "Enthusiastic and energetic" },
  { id: "grateful", label: "Grateful", emoji: "🙏", desc: "Deep appreciation" },
];

interface Recipient {
  id: string;
  name: string;
  avatar_url?: string | null;
}

export const AIThankYou = () => {
  const { credits, receivedGifts } = useSecretSanta();
  const queryClient = useQueryClient();
  const [selectedStyle, setSelectedStyle] = useState("heartfelt");
  const [selectedGift, setSelectedGift] = useState<string>("");
  const [customContext, setCustomContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const COST = 3;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const recentGifts = receivedGifts.slice(0, 10);

  // Auto-fill recipient when a received gift is chosen
  useEffect(() => {
    if (!selectedGift) return;
    const gift: any = recentGifts.find((g: any) => g.id === selectedGift);
    if (!gift || gift.is_anonymous || !gift.sender_id) return;
    (async () => {
      const { data } = await (supabase as any).rpc("get_public_profiles", { ids: [gift.sender_id] });
      const p = (data || [])[0];
      if (p) setRecipient({ id: p.id, name: p.full_name || p.username || "User", avatar_url: p.avatar_url });
    })();
  }, [selectedGift]);

  // Recipient search
  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["thankyou-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length < 1) return [] as PublicProfileResult[];
      return await searchProfiles(searchQuery, { limit: 8 });
    },
    enabled: searchQuery.trim().length >= 1,
  });

  // History of sent thank yous (messages sent by current user)
  const { data: sentHistory = [] } = useQuery({
    queryKey: ["thankyou-history", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [] as any[];
      const { data } = await supabase
        .from("gift_chat_messages")
        .select("id, receiver_id, content, created_at")
        .eq("sender_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(20);
      const rows = (data || []) as any[];
      const ids = [...new Set(rows.map(r => r.receiver_id))];
      if (ids.length === 0) return rows;
      const { data: profs } = await (supabase as any).rpc("get_public_profiles", { ids });
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      return rows.map(r => ({ ...r, recipient: map.get(r.receiver_id) }));
    },
    enabled: !!currentUserId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const generateThankYou = async () => {
    if (credits < COST) {
      toast.error(`Not enough credits. You need ${COST} credits.`);
      return;
    }
    setIsGenerating(true);
    setGeneratedMessage(null);
    try {
      const gift: any = recentGifts.find((g: any) => g.id === selectedGift);
      const giftInfo = gift ? `Gift received: ${gift.gift_emoji} ${gift.gift_type}` : "";
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "thank_you",
          style: selectedStyle,
          customPrompt: `Write a thank you message for a gift I received. ${giftInfo} ${customContext ? `Additional context: ${customContext}` : ""}`,
          giftType: gift ? gift.gift_type : undefined,
        },
      });
      if (error) throw error;
      setGeneratedMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      toast.success("Thank you message generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate message");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendThankYou = async () => {
    if (!currentUserId || !recipient || !generatedMessage) return;
    setIsSending(true);
    try {
      const { error } = await supabase.from("gift_chat_messages").insert({
        sender_id: currentUserId,
        receiver_id: recipient.id,
        content: generatedMessage,
      });
      if (error) throw error;
      toast.success(`Thank you sent to ${recipient.name}! 💌`);
      queryClient.invalidateQueries({ queryKey: ["gift-chat-users"] });
      queryClient.invalidateQueries({ queryKey: ["gift-chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["thankyou-history"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  if (!currentUserId) {
    return (
      <>
        <FloatingHowItWorks title={"A I Thank You - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Thank You section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Thank You.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
        <Card className="p-8 bg-white/90 border-amber-200 text-center">
          <Heart className="h-12 w-12 mx-auto text-pink-400 mb-4" />
          <p className="text-gray-600">Please log in to use AI Thank You</p>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-rose-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Thank You Generator</h2>
        <p className="text-gray-500 text-sm">Let AI craft the perfect thank you message — then send it directly.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">
          <Zap className="h-3 w-3" /> Costs {COST} credits per message
        </div>
      </Card>

      {/* Recipient */}
      <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Send className="h-5 w-5 text-rose-500" /> Send To
        </h3>
        {recipient ? (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-3">
            <div className="flex items-center gap-3">
              {recipient.avatar_url ? (
                <img src={recipient.avatar_url} alt={recipient.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold">
                  {recipient.name[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-800">{recipient.name}</p>
                <p className="text-xs text-gray-500">Recipient selected</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setRecipient(null); setSearchQuery(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search a person by name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 border-rose-200"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-spin" />
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-xl border border-rose-100 divide-y divide-rose-50">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const name = p.full_name || p.username || "User";
                      setRecipient({ id: p.id, name, avatar_url: p.avatar_url });
                      setSearchQuery(name);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-rose-50 text-left"
                  >
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {(p.full_name || p.username || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-800">{p.full_name || p.username}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.length >= 1 && !isSearching && searchResults.length === 0 && (
              <p className="text-xs text-gray-500 px-1">No matching users.</p>
            )}
          </div>
        )}
      </Card>

      {/* Select Gift */}
      {recentGifts.length > 0 && (
        <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-500" /> Select a Gift to Thank For
          </h3>
          <Select value={selectedGift} onValueChange={setSelectedGift}>
            <SelectTrigger className="border-rose-200">
              <SelectValue placeholder="Choose a received gift (optional)" />
            </SelectTrigger>
            <SelectContent>
              {recentGifts.map((gift: any) => (
                <SelectItem key={gift.id} value={gift.id}>
                  {gift.gift_emoji} {gift.gift_type?.replace(/_/g, " ")} — from {gift.is_anonymous ? "Secret Santa" : "a friend"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">Choosing a gift auto-fills the sender as the recipient.</p>
        </Card>
      )}

      {/* Style Selection */}
      <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">Choose Tone</h3>
        <div className="grid grid-cols-3 gap-2">
          {THANK_YOU_STYLES.map(s => (
            <motion.div key={s.id} whileTap={{ scale: 0.97 }}>
              <Card
                onClick={() => setSelectedStyle(s.id)}
                className={`p-3 cursor-pointer transition-all text-center ${
                  selectedStyle === s.id
                    ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white border-transparent shadow-lg"
                    : "bg-white border-gray-200 hover:border-rose-300"
                }`}
              >
                <span className="text-xl block mb-1">{s.emoji}</span>
                <p className={`text-xs font-bold ${selectedStyle === s.id ? "text-white" : "text-gray-700"}`}>{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Custom context */}
      <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-2">Add Personal Context (Optional)</h3>
        <Textarea
          placeholder="E.g., 'We've been friends for 10 years' or 'They helped me through a tough time'..."
          value={customContext}
          onChange={e => setCustomContext(e.target.value)}
          className="bg-white border-rose-200 min-h-[60px]"
          maxLength={200}
        />
      </Card>

      {/* Generate Button */}
      <Button
        onClick={generateThankYou}
        disabled={isGenerating || credits < COST}
        className="w-full py-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-rose-500/30"
      >
        {isGenerating ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating thank you...</>
        ) : credits < COST ? (
          "Not enough credits"
        ) : (
          <><Sparkles className="h-5 w-5 mr-2" /> Generate Thank You — 💎 {COST}</>
        )}
      </Button>

      {/* Result */}
      <AnimatePresence>
        {generatedMessage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 shadow-lg">
              <div className="text-center mb-3">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl block"
                >
                  💌
                </motion.span>
              </div>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="bg-white/70 border-rose-200 min-h-[100px] italic text-gray-700 mb-4"
              />
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => { navigator.clipboard.writeText(generatedMessage); toast.success("Copied!"); }}
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button
                  onClick={generateThankYou}
                  variant="outline"
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Regen
                </Button>
                <Button
                  onClick={sendThankYou}
                  disabled={!recipient || isSending}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                >
                  {isSending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                  Send
                </Button>
              </div>
              {!recipient && (
                <p className="text-xs text-rose-600 mt-2 text-center">Select a recipient above to send.</p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sent History */}
      {sentHistory.length > 0 && (
        <Card className="p-4 bg-white/80 border-rose-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-rose-500" /> Sent Thank Yous ({sentHistory.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sentHistory.map((r: any) => {
              const name = r.recipient?.full_name || r.recipient?.username || "User";
              const avatar = r.recipient?.avatar_url;
              return (
                <div key={r.id} className="flex gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-800 truncate">To {name}</p>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {new Date(r.created_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic line-clamp-3 mt-0.5">"{r.content}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}



      {/* Info */}
      <Card className="p-4 bg-rose-50 border-rose-200 shadow-sm">
        <h3 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> About AI Thank You
        </h3>
        <p className="text-sm text-rose-700">
          AI crafts personalized thank you messages based on the gift you received, the selected tone, and any personal context.
          Each generation costs {COST} credits. You can then send the message directly to the recipient via Gift Chat.
        </p>
      </Card>
    </div>
  );
};
