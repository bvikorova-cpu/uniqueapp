import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Plus, Loader2, Megaphone, Pencil, RefreshCw, Trash2, CalendarClock } from "lucide-react";
import { useResolvedStorageUrl } from "@/lib/storageSigned";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const PROMO_CATEGORIES = ["business", "event", "restaurant", "beauty", "fitness", "shop", "service", "real_estate", "job", "other"];

interface Row {
  id: string;
  title: string;
  description: string | null;
  link_url: string | null;
  category: string | null;
  city: string | null;
  media_url: string;
  media_type: "image" | "video";
  tier: "standard" | "top";
  status: string;
  active_until: string | null;
  created_at: string;
}

function Thumb({ url, type }: { url: string; type: string }) {
  const resolved = useResolvedStorageUrl(url);
  if (!resolved) return <div className="w-20 h-20 shrink-0 bg-muted rounded-lg animate-pulse" />;
  return type === "video" ? (
    <video src={resolved} muted className="w-20 h-20 shrink-0 object-cover rounded-lg" />
  ) : (
    <img src={resolved} alt="" className="w-20 h-20 shrink-0 object-cover rounded-lg" />
  );
}

const normalizeLink = (raw: string): string | null => {
  const v = raw.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
};

export default function MyPromotions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [extending, setExtending] = useState<Row | null>(null);
  const [extendTier, setExtendTier] = useState<"standard" | "top">("standard");
  const [redirecting, setRedirecting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // Self-heal: activate any listing that was paid but never confirmed
    // (checkout tab closed, mobile redirect lost, etc.).
    await supabase.functions.invoke("reconcile-promo-subscriptions").catch(() => {});
    const { data } = await supabase
      .from("promo_listings")
      .select("id,title,description,link_url,category,city,media_url,media_type,tier,status,active_until,created_at")
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

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase
      .from("promo_listings")
      .update({
        title: editing.title.trim(),
        description: editing.description?.trim() || null,
        link_url: editing.link_url ? normalizeLink(editing.link_url) : null,
        category: editing.category,
        city: editing.city?.trim() || null,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Promotion updated");
    setEditing(null);
    load();
  };

  const startExtend = async () => {
    if (!extending) return;
    const checkoutWindow = window.open("about:blank", "_blank");
    if (checkoutWindow) {
      checkoutWindow.document.title = "Opening Stripe Checkout…";
      checkoutWindow.document.body.textContent = "Opening secure Stripe Checkout…";
    }
    setRedirecting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-promo-subscription", {
        body: { listingId: extending.id, tier: extendTier },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.url) throw new Error("Could not open Stripe Checkout");
      const parsed = new URL(result.url as string);
      if (parsed.protocol !== "https:") throw new Error("Stripe returned an invalid checkout link");
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.location.href = parsed.toString();
      } else {
        window.location.assign(parsed.toString());
      }
      setExtending(null);
    } catch (e: unknown) {
      checkoutWindow?.close();
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRedirecting(false);
    }
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
    <div className="min-h-screen bg-background py-8 px-4">
      <SEO title="My promotions — Unique" description="Manage your Promotions Board listings." />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">My promotions</h1>
            <p className="text-sm text-muted-foreground">Manage your Promotions Board listings.</p>
          </div>
          <Button asChild variant="premium" size="sm">
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
              const daysLeft = r.active_until
                ? Math.ceil((new Date(r.active_until).getTime() - Date.now()) / 86400000)
                : null;
              return (
                <Card key={r.id}>
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="flex gap-3">
                      <Thumb url={r.media_url} type={r.media_type} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-2 break-words">{r.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {r.tier === "top" && (
                            <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] px-1.5">
                              <Crown className="h-3 w-3 mr-1" /> TOP
                            </Badge>
                          )}
                          <Badge variant={active ? "default" : "secondary"} className="text-[10px] px-1.5 capitalize">
                            {active ? "Active" : r.status}
                          </Badge>
                        </div>
                        {r.active_until && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3 shrink-0" />
                            {active
                              ? `Active until ${new Date(r.active_until).toLocaleDateString()}${daysLeft !== null ? ` · ${daysLeft} d left` : ""}`
                              : `Ended ${new Date(r.active_until).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditing({ ...r })}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => { setExtendTier(r.tier); setExtending(r); }}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Extend
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => remove(r.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit promotion</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="e-title">Title *</Label>
                <Input id="e-title" value={editing.title} maxLength={120}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="e-desc">Short description</Label>
                <Textarea id="e-desc" rows={4} maxLength={500} value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <select
                    value={editing.category ?? "business"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm capitalize"
                  >
                    {PROMO_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="e-city">City / area</Label>
                  <Input id="e-city" value={editing.city ?? ""}
                    onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="e-link">External link</Label>
                <Input id="e-link" inputMode="url" autoCapitalize="none" spellCheck={false}
                  placeholder="example.com" value={editing.link_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend dialog */}
      <Dialog open={!!extending} onOpenChange={(o) => !o && setExtending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Extend promotion</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose a plan and continue to secure Stripe Checkout. Your listing stays live for another 30 days.
          </p>
          <div className="grid gap-3">
            {(["standard", "top"] as const).map((t) => {
              const selected = extendTier === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setExtendTier(t)}
                  className={`text-left rounded-xl border-2 p-4 transition ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      {t === "top" && <Crown className="h-4 w-4 text-primary" />}
                      {t === "top" ? "TOP" : "Standard"}
                    </span>
                    <span className="font-bold">{t === "top" ? "€50" : "€20"}<span className="text-xs text-muted-foreground"> / 30 days</span></span>
                  </div>
                </button>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setExtending(null)}>Cancel</Button>
            <Button onClick={startExtend} disabled={redirecting}>
              {redirecting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Continue to payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
