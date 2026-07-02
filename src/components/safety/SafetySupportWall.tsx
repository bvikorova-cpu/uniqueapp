import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, MessageSquare, Sparkles, User, Loader2, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { WallReactions } from "./WallReactions";
import { BuddyMatching } from "./BuddyMatching";
import { useWallReactions, useWallFilter } from "@/hooks/useSafetyExtras";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const encouragements = [
  "You are stronger than you know 💪",
  "This too shall pass. Hold on! 🌟",
  "You matter. You are valued. ❤️",
  "Better days are coming! 🌈",
  "You're not alone! 🤝",
];

const SafetySupportWall = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [filterResult, setFilterResult] = useState<{ safe: boolean; reason?: string; suggested_rewrite?: string } | null>(null);
  const filter = useWallFilter();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["safety-support-wall"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_support_wall").select("*")
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const ids = useMemo(() => messages.map((m: any) => m.id), [messages]);
  const { data: reactions = {} } = useWallReactions(ids);

  const addMessage = useMutation({
    mutationFn: async (text: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to post");
      const { error } = await supabase.from("safety_support_wall").insert({ user_id: user.id, message: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["safety-support-wall"] });
      toast.success("Posted!");
      setShowForm(false);
      setMessage("");
      setFilterResult(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = async () => {
    const result = await filter.mutateAsync(message);
    setFilterResult(result);
    if (result.safe) {
      addMessage.mutate(message);
    }
  };

  const quickEncourage = (text: string) => addMessage.mutate(text);

  return (
    <>
      <FloatingHowItWorks title={"Safety Support Wall - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Support Wall section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Support Wall.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Buddy Matching at top */}
      <BuddyMatching />

      {/* Compose */}
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-violet-500/5 to-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-pink-400" /> Anonymous Support Wall
          </CardTitle>
          <CardDescription className="text-xs flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> AI-moderated for safety (2 cr per post)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!showForm ? (
            <>
              <Button onClick={() => setShowForm(true)} className="w-full bg-pink-600 hover:bg-pink-500">
                <Plus className="h-4 w-4 mr-2" /> Write a Message
              </Button>
              <div className="text-center text-xs text-muted-foreground">or send a quick boost:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {encouragements.map((enc, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-pink-500/10 hover:border-pink-400 py-2 px-2 text-[11px] text-center whitespace-normal h-auto justify-center transition-colors"
                    onClick={() => quickEncourage(enc)}
                  >
                    {enc}
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={500} placeholder="Words of hope..." className="bg-background/50" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{message.length}/500</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> Anonymous</span>
              </div>
              {filterResult && !filterResult.safe && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-xs">
                  <p className="font-bold text-amber-400 mb-1">⚠️ AI flagged this message</p>
                  <p className="text-muted-foreground mb-2">{filterResult.reason}</p>
                  {filterResult.suggested_rewrite && (
                    <>
                      <p className="text-foreground mb-1"><strong>Suggested rewrite:</strong></p>
                      <p className="italic text-foreground/85 mb-2">"{filterResult.suggested_rewrite}"</p>
                      <Button size="sm" onClick={() => { setMessage(filterResult.suggested_rewrite!); setFilterResult(null); }}>Use rewrite</Button>
                    </>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={filter.isPending || addMessage.isPending || message.trim().length < 10} className="bg-pink-600 hover:bg-pink-500">
                  {filter.isPending || addMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" /> Post (2 cr)</>}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setFilterResult(null); }}>Cancel</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Wall feed */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-pink-400" /> Messages of Hope
        </h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm text-center py-6">Loading...</p>
        ) : messages.length === 0 ? (
          <Card className="border-border/40 bg-card/50 backdrop-blur-md">
            <CardContent className="py-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-3 text-pink-400/50" />
              <p className="text-muted-foreground text-sm">Be the first to share hope!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {messages.map((msg: any, i: number) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-md hover:border-pink-400/50 hover:shadow-xl hover:shadow-pink-500/10 transition-all h-full flex flex-col">
                  <CardContent className="pt-5 flex-1 flex flex-col">
                    <p className="text-base text-foreground/90 flex-1">{msg.message}</p>
                    <WallReactions messageId={msg.id} counts={(reactions as any)[msg.id] || {}} />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> Anon</span>
                      <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SafetySupportWall;
