import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Crown, Copy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function LotterySyndicate({ onBack }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [syndicates, setSyndicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).from("lottery_syndicates").select("*").order("created_at", { ascending: false });
    setSyndicates(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast({ title: "Sign in required", variant: "destructive" }); setLoading(false); return; }
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { error } = await (supabase as any).from("lottery_syndicates").insert({
      name, owner_id: u.user.id, invite_code: code,
    });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Syndicate created", description: `Invite code: ${code}` }); setName(""); load(); }
    setLoading(false);
  };

  const join = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data: syn } = await (supabase as any).from("lottery_syndicates").select("id").eq("invite_code", joinCode.toUpperCase()).maybeSingle();
    if (!syn) { toast({ title: "Invalid code", variant: "destructive" }); setLoading(false); return; }
    const { error } = await (supabase as any).from("lottery_syndicate_members").insert({ syndicate_id: syn.id, user_id: u.user.id });
    if (error) toast({ title: "Already joined or error", description: error.message, variant: "destructive" });
    else { toast({ title: "Joined squad" }); setJoinCode(""); load(); }
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied", description: code });
  };

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Syndicate'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Syndicate panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Syndicate / Squad Play</h2>
          <p className="text-sm text-muted-foreground">Pool combinations · split winnings automatically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-950/30 via-card/80 to-amber-950/20 border-amber-400/20 backdrop-blur-xl">
          <CardHeader><CardTitle className="font-black text-base flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> Create squad</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Squad name" className="bg-background/50 border-amber-400/20" />
            <Button onClick={create} disabled={!name || loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:opacity-90">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Create squad
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-950/30 via-card/80 to-amber-950/20 border-amber-400/20 backdrop-blur-xl">
          <CardHeader><CardTitle className="font-black text-base flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> Join squad</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Invite code (e.g. AB12CD)" className="bg-background/50 border-amber-400/20" />
            <Button onClick={join} disabled={!joinCode || loading} variant="outline" className="w-full border-amber-400/30 hover:bg-amber-400/10">
              Join with code
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 backdrop-blur-xl border-amber-400/30">
        <CardHeader><CardTitle className="font-black text-base">Your squads</CardTitle></CardHeader>
        <CardContent>
          {syndicates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-amber-400/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No squads yet — create one to start pooling.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {syndicates.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-amber-400/15"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400/30 to-yellow-600/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.member_count ?? 1} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-400/30 text-amber-300 font-mono">{s.invite_code}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => copyCode(s.invite_code)}><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
