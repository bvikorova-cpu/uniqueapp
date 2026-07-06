import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Plus, Loader2, Megaphone } from "lucide-react";
import { useResolvedStorageUrl } from "@/lib/storageSigned";
import { toast } from "sonner";
import SEO from "@/components/SEO";

interface Row {
  id: string;
  title: string;
  media_url: string;
  media_type: "image" | "video";
  tier: "standard" | "top";
  status: string;
  active_until: string | null;
  created_at: string;
}

function Thumb({ url, type }: { url: string; type: string }) {
  const resolved = useResolvedStorageUrl(url);
  if (!resolved) return <div className="w-24 h-24 bg-muted rounded animate-pulse" />;
  return type === "video" ? (
    <video src={resolved} muted className="w-24 h-24 object-cover rounded" />
  ) : (
    <img src={resolved} alt="" className="w-24 h-24 object-cover rounded" />
  );
}

export default function MyPromotions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("promo_listings")
      .select("id,title,media_url,media_type,tier,status,active_until,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const remove = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    const { error } = await supabase.from("promo_listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Megaphone className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Sign in required</h2>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <SEO title="My promotions — Unique" description="Manage your Promotions Board listings." />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My promotions</h1>
            <p className="text-muted-foreground">Manage your Promotions Board listings.</p>
          </div>
          <Button asChild variant="premium">
            <Link to="/promotions/new"><Plus className="h-4 w-4 mr-1" /> New</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : rows.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">You have no promotions yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const active = r.status === "active" && r.active_until && new Date(r.active_until) > new Date();
              return (
                <Card key={r.id}>
                  <CardContent className="p-4 flex gap-4 items-center">
                    <Thumb url={r.media_url} type={r.media_type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold truncate">{r.title}</h3>
                        {r.tier === "top" && (
                          <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                            <Crown className="h-3 w-3 mr-1" /> TOP
                          </Badge>
                        )}
                        <Badge variant={active ? "default" : "secondary"}>
                          {active ? "Active" : r.status}
                        </Badge>
                      </div>
                      {r.active_until && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {active ? "Active until " : "Ended "}
                          {new Date(r.active_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>Delete</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
