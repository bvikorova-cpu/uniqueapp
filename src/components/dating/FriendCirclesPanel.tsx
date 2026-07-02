import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users2, Plus, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Circle { id: string; owner_id: string; name: string; member_count?: number; }

export const FriendCirclesPanel = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [addOpen, setAddOpen] = useState<string | null>(null);
  const [friendId, setFriendId] = useState("");

  const load = async () => {
    const { data } = await (supabase as any)
      .from("dating_friend_circles").select("*").order("created_at", { ascending: false });
    const list: Circle[] = data || [];
    if (list.length) {
      const { data: members } = await (supabase as any)
        .from("dating_friend_circle_members").select("circle_id").in("circle_id", list.map(c => c.id));
      const counts = new Map<string, number>();
      (members || []).forEach((m: any) => counts.set(m.circle_id, (counts.get(m.circle_id) || 0) + 1));
      list.forEach(c => c.member_count = counts.get(c.id) || 0);
    }
    setCircles(list);
  };

  useEffect(() => { load(); }, [userId]);

  const create = async () => {
    if (!name.trim()) return;
    const { error } = await (supabase as any).from("dating_friend_circles").insert({ owner_id: userId, name: name.trim() });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    setName(""); setOpen(false); load();
  };

  const addMember = async (circleId: string) => {
    if (!friendId.trim()) return;
    const { error } = await (supabase as any).from("dating_friend_circle_members")
      .insert({ circle_id: circleId, user_id: friendId.trim() });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    toast({ title: "Member added" });
    setFriendId(""); setAddOpen(null); load();
  };

  const removeCircle = async (id: string) => {
    await (supabase as any).from("dating_friend_circles").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <FloatingHowItWorks
        title={"Friend Circles Panel"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2"><Users2 className="h-5 w-5 text-primary" /> Friend Circles</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a circle</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Circle name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bratislava crew" /></div>
              <Button onClick={create} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-xs text-muted-foreground">Swipe with friends — invite trusted people to plan dates together.</p>

      {circles.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No circles yet.</Card>}

      <div className="grid gap-3 sm:grid-cols-2">
        {circles.map((c) => (
          <Card key={c.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{c.name}</h4>
                <p className="text-xs text-muted-foreground">{c.member_count || 0} members</p>
              </div>
              {c.owner_id === userId && (
                <Button size="icon" variant="ghost" onClick={() => removeCircle(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            {c.owner_id === userId && (
              <Dialog open={addOpen === c.id} onOpenChange={(o) => setAddOpen(o ? c.id : null)}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Add member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add to {c.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>User ID</Label><Input value={friendId} onChange={(e) => setFriendId(e.target.value)} placeholder="uuid…" /></div>
                    <Button onClick={() => addMember(c.id)} className="w-full">Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
