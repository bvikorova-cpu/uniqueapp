import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bell, BellOff, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SavedSearch {
  id: string;
  name: string;
  query: string | null;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
}

export default function BazaarSavedSearches() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bazaar_saved_searches" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!name.trim()) return toast.error("Zadaj názov");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Prihlás sa");
    const { error } = await supabase.from("bazaar_saved_searches" as any).insert({
      user_id: user.id, name, query, filters: {}, notify: true,
    });
    if (error) return toast.error(error.message);
    setName(""); setQuery("");
    toast.success("Uložené");
    void load();
  };

  const toggleNotify = async (s: SavedSearch) => {
    const { error } = await supabase
      .from("bazaar_saved_searches" as any)
      .update({ notify: !s.notify })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("bazaar_saved_searches" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Uložené vyhľadávania</h1>
        <p className="text-muted-foreground">Ulož filtre v Bazaare a dostaň notifikácie o nových výsledkoch.</p>
      </header>

      <Card className="p-4 space-y-3">
        <Input placeholder="Názov (napr. iPhone 15 do 500€)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Vyhľadávací výraz" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={save} className="w-full">Uložiť vyhľadávanie</Button>
      </Card>

      {loading ? <p>Načítavam…</p> : items.length === 0 ? (
        <p className="text-muted-foreground">Žiadne uložené vyhľadávania.</p>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.name}</div>
                {s.query && <div className="text-sm text-muted-foreground truncate">"{s.query}"</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleNotify(s)} title="Notifikácie">
                {s.notify ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/bazaar?q=${encodeURIComponent(s.query ?? "")}`}><Search className="w-4 h-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
