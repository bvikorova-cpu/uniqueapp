import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MemoryVaultView = () => {
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [newMem, setNewMem] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("best_friend_memories")
      .select("*").eq("user_id", user.id).order("importance", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const extract = async () => {
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-extract-memories");
      if (error) throw error;
      toast.success(`Extracted ${data.extracted} new memories`);
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setExtracting(false); }
  };

  const addManual = async () => {
    if (!newMem.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("best_friend_memories").insert({
      user_id: user.id, content: newMem.trim(), category: "fact", importance: 7,
    });
    setNewMem(""); load();
  };

  const remove = async (id: string) => {
    await supabase.from("best_friend_memories").delete().eq("id", id);
    load();
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Memory Vault View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-black">Memory Vault</h2>
        <p className="text-muted-foreground mt-2">What your AI friend remembers about you</p>
      </div>

      <Card><CardHeader><CardTitle>Auto-extract from chat</CardTitle></CardHeader><CardContent>
        <Button onClick={extract} disabled={extracting} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
          {extracting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Brain className="h-4 w-4 mr-2"/>}
          Scan recent chat & extract memories
        </Button>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Add manually</CardTitle></CardHeader><CardContent className="flex gap-2">
        <Input value={newMem} onChange={e => setNewMem(e.target.value)}
          placeholder="e.g., I have a cat named Luna" maxLength={280} />
        <Button onClick={addManual} disabled={!newMem.trim()}><Plus className="h-4 w-4"/></Button>
      </CardContent></Card>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-center text-muted-foreground p-8">No memories yet. Chat more or extract from your conversation.</p>}
        {items.map(m => (
          <Card key={m.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <Badge variant="outline">{m.category}</Badge>
              <span className="flex-1 text-sm">{m.content}</span>
              <Badge variant="secondary">{m.importance}/10</Badge>
              <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
