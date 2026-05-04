import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Trophy, Heart, Plus, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Battle = { id: string; theme: string; description: string | null; status: string; deadline: string; prize_pool: number };
type Participant = { id: string; battle_id: string; user_id: string; dish_title: string; description: string | null; image_url: string | null; vote_count: number };

export default function KitchenStarsBattles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [entryFor, setEntryFor] = useState<string | null>(null);
  const [dishTitle, setDishTitle] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishImage, setDishImage] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);

    const { data: bs } = await supabase.from("kitchen_battles")
      .select("*").order("created_at", { ascending: false }).limit(20);
    setBattles(bs || []);

    if (bs && bs.length) {
      const { data: ps } = await supabase.from("kitchen_battle_participants")
        .select("*").in("battle_id", bs.map(b => b.id));
      const grouped: Record<string, Participant[]> = {};
      (ps || []).forEach(p => {
        grouped[p.battle_id] = grouped[p.battle_id] || [];
        grouped[p.battle_id].push(p);
      });
      Object.values(grouped).forEach(arr => arr.sort((a, b) => b.vote_count - a.vote_count));
      setParticipants(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createBattle = async () => {
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("create-kitchen-battle", { body: {} });
    setCreating(false);
    if (error || data?.error) {
      toast({ title: "Error", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Battle created!", description: "Now invite chefs to submit dishes." });
    load();
  };

  const submitEntry = async (battleId: string) => {
    if (!dishTitle.trim()) {
      toast({ title: "Add dish title", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("kitchen_battle_participants").insert({
      battle_id: battleId, user_id: userId, dish_title: dishTitle,
      description: dishDesc || null, image_url: dishImage || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" }); return;
    }
    setEntryFor(null); setDishTitle(""); setDishDesc(""); setDishImage("");
    toast({ title: "Entry submitted!" });
    load();
  };

  const vote = async (battleId: string, participantId: string) => {
    const { data, error } = await supabase.functions.invoke("kitchen-battle-vote", {
      body: { battleId, participantId },
    });
    if (error || data?.error) {
      toast({ title: "Vote failed", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Vote counted! 🔥" });
    load();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 via-primary to-accent bg-clip-text text-transparent mb-2">
            KitchenStars Battles
          </h1>
          <p className="text-muted-foreground text-lg">Submit your dish, get votes, win the crown 👑</p>
        </div>

        <Button size="lg" onClick={createBattle} disabled={creating} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> {creating ? "Creating..." : "Start a New Battle"}
        </Button>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : battles.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No battles yet. Be the first!</CardContent></Card>
        ) : (
          battles.map(battle => {
            const parts = participants[battle.id] || [];
            const myEntry = parts.find(p => p.user_id === userId);
            const isOpen = battle.status === "open" && new Date(battle.deadline) > new Date();
            return (
              <Card key={battle.id} className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><ChefHat className="h-5 w-5 text-orange-500" /> {battle.theme}</span>
                    <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "OPEN" : "CLOSED"}</Badge>
                  </CardTitle>
                  {battle.description && <p className="text-sm text-muted-foreground">{battle.description}</p>}
                  <p className="text-xs text-muted-foreground">Deadline: {new Date(battle.deadline).toLocaleString()}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {parts.length === 0 && <p className="text-sm text-muted-foreground italic">No entries yet.</p>}
                  {parts.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        {i === 0 && p.vote_count > 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        <div>
                          <p className="font-semibold">{p.dish_title}</p>
                          {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline"><Flame className="h-3 w-3 mr-1" />{p.vote_count}</Badge>
                        {isOpen && p.user_id !== userId && (
                          <Button size="sm" variant="outline" onClick={() => vote(battle.id, p.id)}>
                            <Heart className="h-3 w-3 mr-1" /> Vote
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {isOpen && !myEntry && (
                    entryFor === battle.id ? (
                      <div className="space-y-2 p-3 rounded-lg border border-primary/20">
                        <Input placeholder="Dish title" value={dishTitle} onChange={e => setDishTitle(e.target.value)} />
                        <Textarea placeholder="Short description (optional)" value={dishDesc} onChange={e => setDishDesc(e.target.value)} />
                        <Input placeholder="Image URL (optional)" value={dishImage} onChange={e => setDishImage(e.target.value)} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitEntry(battle.id)}>Submit</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEntryFor(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => setEntryFor(battle.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Submit Your Dish
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
