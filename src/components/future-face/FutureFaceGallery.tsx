import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Download, Share2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Row { id: string; action: string; source_url: string | null; result_url: string; created_at: string; }

export default function FutureFaceGallery() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Row | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data } = await supabase.from("future_face_images")
      .select("id, action, source_url, result_url, created_at")
      .order("created_at", { ascending: false }).limit(100);
    setRows((data as any[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("future_face_images").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", variant: "destructive" });
    else { setRows(rows.filter(r => r.id !== id)); setOpen(null); }
  };

  const share = async (r: Row) => {
    if (navigator.share) {
      try { await navigator.share({ title: "My Future Face", text: r.action, url: r.result_url }); } catch {}
    } else {
      navigator.clipboard.writeText(r.result_url);
      toast({ title: "Link copied!" });
    }
  };

  const actions = Array.from(new Set(rows.map(r => r.action)));
  const visible = filter === "all" ? rows : rows.filter(r => r.action === filter);

  return (
    <>
      <FloatingHowItWorks title={"Future Face Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🖼️ My Gallery</h2>
        <Badge variant="outline">{rows.length} saved</Badge>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="text-xs flex-shrink-0">All</Button>
        {actions.map(a => (
          <Button key={a} size="sm" variant={filter === a ? "default" : "outline"} onClick={() => setFilter(a)} className="text-xs flex-shrink-0">
            {a.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center h-48"><Loader2 className="h-6 w-6 animate-spin text-cyan-500" /></div>
      ) : visible.length === 0 ? (
        <Card className="bg-card/40 border-dashed"><CardContent className="p-8 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No saved transformations yet. Create one in the Photo Studio.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {visible.map(r => (
            <button key={r.id} onClick={() => setOpen(r)} className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-cyan-500 transition-all">
              <img src={r.result_url} alt={r.action} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[9px] font-bold text-white truncate uppercase">{r.action.replace(/_/g, " ")}</p>
                <p className="text-[8px] text-white/70">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <Card className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm uppercase">{open.action.replace(/_/g, " ")}</p>
                <Badge variant="outline" className="text-[10px]">{new Date(open.created_at).toLocaleString()}</Badge>
              </div>
              {open.source_url ? (
                <BeforeAfterSlider before={open.source_url} after={open.result_url} />
              ) : (
                <img src={open.result_url} alt={open.action} className="w-full rounded-lg" />
              )}
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" asChild><a href={open.result_url} download target="_blank" rel="noreferrer"><Download className="h-3 w-3 mr-1" />Save</a></Button>
                <Button size="sm" variant="outline" onClick={() => share(open)}><Share2 className="h-3 w-3 mr-1" />Share</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(open.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  );
}
