import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Loader2, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function RewardsGiftXP() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [amount, setAmount] = useState("25");
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,avatar_url")
      .ilike("full_name", `%${query}%`)
      .limit(10);
    setResults((data ?? []) as Profile[]);
    setSearching(false);
  };

  const send = async () => {
    if (!recipient) {
      toast({ title: "Pick recipient", description: "Search and select a user first", variant: "destructive" });
      return;
    }
    const amt = parseInt(amount, 10);
    if (!Number.isFinite(amt) || amt <= 0 || amt > 500) {
      toast({ title: "Invalid amount", description: "Enter 1–500 XP", variant: "destructive" });
      return;
    }
    setSending(true);
    const { data, error } = await supabase.rpc("gift_xp", {
      _recipient: recipient.id,
      _amount: amt,
      _message: message || null,
    });
    setSending(false);
    if (error) {
      toast({ title: "Gift failed", description: error.message, variant: "destructive" });
      return;
    }
    const res = data as { error?: string; ok?: boolean };
    if (res?.error) {
      toast({ title: "Gift failed", description: res.error.replace(/_/g, " "), variant: "destructive" });
      return;
    }
    toast({ title: "🎁 XP sent!", description: `${amt} XP delivered to ${recipient.full_name}` });
    setRecipient(null); setQuery(""); setResults([]); setMessage("");
    qc.invalidateQueries({ queryKey: ["rewards-stats"] });
    qc.invalidateQueries({ queryKey: ["gamification"] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-400/20 backdrop-blur-md">
        <h2 className="font-black text-xl flex items-center gap-2 mb-1">
          <Gift className="h-5 w-5 text-pink-500" /> Gift XP to a Friend
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Send 1–500 XP per day. Real transfer — deducted from your balance.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Find recipient</label>
            <div className="flex gap-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name…" onKeyDown={(e) => e.key === "Enter" && search()} />
              <Button onClick={search} disabled={searching} size="icon">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {results.length > 0 && !recipient && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {results.map((p) => (
                <button key={p.id} onClick={() => setRecipient(p)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 text-left">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {p.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm">{p.full_name ?? "Unnamed"}</span>
                </button>
              ))}
            </div>
          )}

          {recipient && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-400/30">
              <span className="text-sm">→ {recipient.full_name}</span>
              <Button variant="ghost" size="sm" onClick={() => setRecipient(null)}>Change</Button>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold mb-1 block">Amount (1–500 XP)</label>
            <Input type="number" min={1} max={500} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Message (optional)</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday! 🎂" rows={2} maxLength={200} />
          </div>

          <Button onClick={send} disabled={sending || !recipient} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Send XP Gift</>}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
