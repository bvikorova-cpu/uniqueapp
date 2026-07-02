import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Crown, Swords, Flame, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TournamentHub = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [joinFor, setJoinFor] = useState<any | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [joining, setJoining] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    entry_fee: 100,
    prize_pool: 1000,
    max_participants: 16,
    starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const { data: tournaments } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`*, tournament_participants (count)`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: myCharacters } = useQuery({
    queryKey: ["my-characters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("characters")
        .select("id, name, level, battle_rating")
        .eq("user_id", user.id)
        .order("battle_rating", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: bracket } = useQuery({
    queryKey: ["tournament-bracket", expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data } = await supabase
        .from("tournament_participants")
        .select("id, character_id, eliminated, placement, characters(name, level)")
        .eq("tournament_id", expandedId)
        .order("placement", { ascending: true, nullsFirst: false });
      return data || [];
    },
    enabled: !!expandedId,
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "registration": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleJoinClick = (t: any) => {
    if (!user) {
      toast.error("Please sign in to join tournaments");
      return;
    }
    if (!myCharacters || myCharacters.length === 0) {
      toast.error("Create a character first to join tournaments");
      return;
    }
    setSelectedCharId(myCharacters[0]?.id || "");
    setJoinFor(t);
  };

  const confirmJoin = async () => {
    if (!user || !joinFor || !selectedCharId) return;
    setJoining(true);
    try {
      const { data: existing } = await supabase
        .from("tournament_participants")
        .select("id")
        .eq("tournament_id", joinFor.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        toast.error("You already joined this tournament");
        setJoining(false);
        return;
      }
      const { error } = await supabase.from("tournament_participants").insert({
        tournament_id: joinFor.id,
        user_id: user.id,
        character_id: selectedCharId,
        eliminated: false,
      });
      if (error) throw error;
      toast.success(`Joined ${joinFor.name}! Entry fee: ${joinFor.entry_fee} credits`);
      setJoinFor(null);
      qc.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (err: any) {
      toast.error(err.message || "Could not join");
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("Please sign in to create tournaments");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from("tournaments").insert({
        name: form.name,
        description: form.description || null,
        entry_fee: form.entry_fee,
        prize_pool: form.prize_pool,
        max_participants: form.max_participants,
        status: "registration",
        starts_at: new Date(form.starts_at).toISOString(),
      });
      if (error) throw error;
      toast.success("Tournament created!");
      setCreateOpen(false);
      setForm({ ...form, name: "", description: "" });
      qc.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (err: any) {
      toast.error(err.message || "Could not create");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tournament Hub - How it works"} steps={[{ title: 'Open', desc: 'Access the Tournament Hub section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tournament Hub.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Tournament Arena</h2>
              <p className="text-muted-foreground text-sm">Compete for eternal glory and rewards</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold" onClick={() => setCreateOpen(true)}>
            <Crown className="mr-2 h-4 w-4" /> Create Tournament
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {tournaments?.map((tournament: any, i: number) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, type: "spring" }}
          >
            <Card className="p-5 border-border/30 bg-card/90 backdrop-blur-xl hover:border-amber-500/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                    <h3 className="text-lg font-black">{tournament.name}</h3>
                    <Badge className={getStatusStyle(tournament.status)}>{tournament.status}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{tournament.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{tournament.tournament_participants?.[0]?.count || 0}/{tournament.max_participants}</span>
                    <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-amber-400" />{tournament.prize_pool} credits</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(tournament.starts_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {tournament.status === "registration" && (
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold w-full sm:w-auto" onClick={() => handleJoinClick(tournament)}>
                      <Swords className="mr-2 h-4 w-4" /> Join ({tournament.entry_fee} cr)
                    </Button>
                  )}
                  {tournament.status === "in_progress" && (
                    <Button variant="outline" className="border-blue-500/30 text-blue-400 w-full sm:w-auto" onClick={() => setExpandedId(expandedId === tournament.id ? null : tournament.id)}>
                      {expandedId === tournament.id ? "Hide" : "View"} Bracket
                    </Button>
                  )}
                  {tournament.status === "completed" && (
                    <Button variant="outline" className="border-amber-500/30 text-amber-400 w-full sm:w-auto" onClick={() => setExpandedId(expandedId === tournament.id ? null : tournament.id)}>
                      {expandedId === tournament.id ? "Hide" : "View"} Results
                    </Button>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expandedId === tournament.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <h4 className="text-sm font-bold mb-2">Participants ({bracket?.length || 0})</h4>
                      {!bracket || bracket.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No participants yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {bracket.map((p: any, idx: number) => (
                            <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg ${p.eliminated ? "bg-red-500/5 opacity-60" : "bg-muted/30"}`}>
                              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                                {p.placement || idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.characters?.name || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground">Lvl {p.characters?.level || 1}</p>
                              </div>
                              {p.eliminated && <Badge variant="outline" className="text-[10px] text-red-400">OUT</Badge>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {(!tournaments || tournaments.length === 0) && (
        <Card className="p-12 text-center border-border/30 bg-card/90 backdrop-blur-xl">
          <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No active tournaments. Be the first to create one!</p>
        </Card>
      )}

      {/* Join Dialog */}
      <Dialog open={!!joinFor} onOpenChange={(o) => !o && setJoinFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join {joinFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Pick a character to compete with. Entry fee: <strong className="text-amber-400">{joinFor?.entry_fee} credits</strong></p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {myCharacters?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCharId(c.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedCharId === c.id ? "border-amber-500 bg-amber-500/10" : "border-border/30 hover:border-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Level {c.level} • Rating {c.battle_rating}</p>
                    </div>
                    {selectedCharId === c.id && <Badge className="bg-amber-500/20 text-amber-400">Selected</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinFor(null)}>Cancel</Button>
            <Button onClick={confirmJoin} disabled={!selectedCharId || joining} className="bg-gradient-to-r from-green-600 to-emerald-600">
              {joining ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Joining...</> : "Confirm Join"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Epic Showdown" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Entry Fee</Label>
                <Input type="number" min={0} value={form.entry_fee} onChange={(e) => setForm({ ...form, entry_fee: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Prize Pool</Label>
                <Input type="number" min={0} value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input type="number" min={2} max={128} value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Starts At</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-yellow-600 to-amber-600">
              {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
