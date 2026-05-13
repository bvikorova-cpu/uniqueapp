import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { VolumeX, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MutedKeywordRow {
  id: string;
  keyword: string;
  created_at: string;
}

export const MutedKeywordsDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MutedKeywordRow[]>([]);
  const [input, setInput] = useState("");
  const [me, setMe] = useState<string | null>(null);

  const load = async (uid: string) => {
    const { data } = await supabase
      .from("user_muted_keywords")
      .select("id, keyword, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setMe(uid);
      if (uid) load(uid);
    });
  }, [open]);

  const add = async () => {
    const kw = input.trim().toLowerCase();
    if (!kw || !me) return;
    const { error } = await supabase
      .from("user_muted_keywords")
      .insert({ user_id: me, keyword: kw });
    if (error) {
      toast({
        title: error.message.includes("duplicate") ? "Already muted" : "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setInput("");
    load(me);
  };

  const remove = async (id: string) => {
    await supabase.from("user_muted_keywords").delete().eq("id", id);
    if (me) load(me);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <VolumeX className="h-4 w-4 mr-2" /> Muted words
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VolumeX className="h-5 w-5" /> Muted words
          </DialogTitle>
          <DialogDescription>
            Posts containing any of these words (in content) will be hidden from your feed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a word or phrase…"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Button onClick={add} disabled={!input.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground">No muted words yet.</p>
            )}
            {items.map((it) => (
              <Badge key={it.id} variant="secondary" className="gap-1 pl-3">
                {it.keyword}
                <button onClick={() => remove(it.id)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Small hook used by feed to fetch + cache muted keywords.
export const useMutedKeywords = () => {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_muted_keywords")
        .select("keyword")
        .eq("user_id", u.user.id);
      if (cancelled) return;
      setKeywords((data ?? []).map((d) => d.keyword.toLowerCase()));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return keywords;
};
