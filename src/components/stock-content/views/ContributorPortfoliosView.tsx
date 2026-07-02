import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Search, Users, ImageIcon, Download, Euro, MapPin, Globe, Camera, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Contributor {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  total_items: number;
  total_downloads: number;
  total_revenue: number;
  cover_thumbs: string[];
}

export function ContributorPortfoliosView({ onBack }: Props) {
  const [list, setList] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Contributor | null>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: items } = await supabase
        .from("stock_content_items")
        .select("creator_id, thumbnail_url, total_downloads, total_revenue_eur")
        .eq("is_active", true);

      const byCreator: Record<string, { items: number; downloads: number; revenue: number; thumbs: string[] }> = {};
      (items || []).forEach((i: any) => {
        if (!i.creator_id) return;
        const e = byCreator[i.creator_id] ||= { items: 0, downloads: 0, revenue: 0, thumbs: [] };
        e.items += 1;
        e.downloads += i.total_downloads || 0;
        e.revenue += parseFloat(i.total_revenue_eur || 0);
        if (i.thumbnail_url && e.thumbs.length < 4) e.thumbs.push(i.thumbnail_url);
      });

      const ids = Object.keys(byCreator);
      if (!ids.length) { setList([]); setLoading(false); return; }

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, location, website")
        .in("id", ids);

      const merged: Contributor[] = (profs || []).map((p: any) => ({
        ...p,
        total_items: byCreator[p.id].items,
        total_downloads: byCreator[p.id].downloads,
        total_revenue: byCreator[p.id].revenue,
        cover_thumbs: byCreator[p.id].thumbs,
      })).sort((a, b) => b.total_downloads - a.total_downloads);

      setList(merged);
      setLoading(false);
    })();
  }, []);

  const openProfile = async (c: Contributor) => {
    setSelected(c);
    const { data } = await supabase
      .from("stock_content_items")
      .select("*")
      .eq("creator_id", c.id)
      .eq("is_active", true)
      .order("total_downloads", { ascending: false })
      .limit(24);
    setPortfolio(data || []);
  };

  const filtered = list.filter(c =>
    !q || c.full_name?.toLowerCase().includes(q.toLowerCase()) || c.username?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <FloatingHowItWorks title={"Contributor Portfolios View - How it works"} steps={[{ title: 'Open', desc: 'Access the Contributor Portfolios View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Contributor Portfolios View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-fuchsia-500" /> Contributor Portfolios
        </h2>
        <Badge variant="secondary">{filtered.length} contributors</Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search contributor..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No contributors yet</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, idx) => (
            <Card key={c.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => openProfile(c)}>
              <div className="grid grid-cols-4 h-24 bg-secondary/20">
                {c.cover_thumbs.length > 0 ? c.cover_thumbs.map((t, i) => (
                  <img key={i} src={t} alt="" className="w-full h-full object-cover" />
                )) : <div className="col-span-4 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 -mt-10 mb-2">
                  <Avatar className="w-14 h-14 border-4 border-background">
                    <AvatarImage src={c.avatar_url || undefined} />
                    <AvatarFallback>{(c.full_name || c.username || "?")[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {idx < 3 && <Badge className="bg-amber-500"><Star className="w-3 h-3 mr-0.5" />Top {idx + 1}</Badge>}
                </div>
                <h3 className="font-bold">{c.full_name || c.username || "Anonymous"}</h3>
                {c.username && <p className="text-xs text-muted-foreground">@{c.username}</p>}
                {c.bio && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.bio}</p>}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div><div className="font-bold text-sm">{c.total_items}</div><div className="text-[10px] text-muted-foreground">Diel</div></div>
                  <div><div className="font-bold text-sm flex items-center justify-center gap-0.5"><Download className="w-3 h-3" />{c.total_downloads}</div><div className="text-[10px] text-muted-foreground">Downloads</div></div>
                  <div><div className="font-bold text-sm flex items-center justify-center gap-0.5"><Euro className="w-3 h-3" />{c.total_revenue.toFixed(0)}</div><div className="text-[10px] text-muted-foreground">Revenue</div></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setPortfolio([]); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12"><AvatarImage src={selected.avatar_url || undefined} /><AvatarFallback>{(selected.full_name || "?")[0]}</AvatarFallback></Avatar>
                  <div>
                    <div>{selected.full_name || selected.username || "Anonymous"}</div>
                    {selected.username && <div className="text-xs text-muted-foreground font-normal">@{selected.username}</div>}
                  </div>
                </DialogTitle>
              </DialogHeader>
              {selected.bio && <p className="text-sm text-muted-foreground">{selected.bio}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {selected.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.location}</span>}
                {selected.website && <a href={selected.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="w-3 h-3" />{selected.website}</a>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center"><div className="text-2xl font-black">{selected.total_items}</div><div className="text-xs text-muted-foreground">Published</div></Card>
                <Card className="p-3 text-center"><div className="text-2xl font-black">{selected.total_downloads}</div><div className="text-xs text-muted-foreground">Downloads</div></Card>
                <Card className="p-3 text-center"><div className="text-2xl font-black">€{selected.total_revenue.toFixed(0)}</div><div className="text-xs text-muted-foreground">Revenue</div></Card>
              </div>
              <h3 className="font-bold mt-2">Portfolio ({portfolio.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {portfolio.map((it) => (
                  <Card key={it.id} className="overflow-hidden">
                    <div className="h-28 bg-secondary/20 relative">
                      {it.thumbnail_url ? <img src={it.thumbnail_url} className="w-full h-full object-cover" alt={it.title} /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-semibold line-clamp-1">{it.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" />{it.total_downloads}</span>
                        <span className="flex items-center gap-0.5"><Euro className="w-2.5 h-2.5" />{it.price_eur?.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
