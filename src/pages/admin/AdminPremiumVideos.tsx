import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, RefreshCw, Video, Unlock, Coins, Wallet, Rocket, Users } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Summary {
  total_videos: number;
  published_videos: number;
  creators: number;
  total_views: number;
  total_unlocks: number;
  unlock_credits_spent: number;
  creator_earned_credits: number;
  creator_withdrawn_credits: number;
  credits_purchased: number;
  credits_remaining: number;
  boosts: number;
  boost_credits_spent: number;
  active_boosts: number;
  cashouts_count: number;
  cashouts_eur: number;
}

interface CreatorRow {
  user_id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  videos_count: number;
  published_count: number;
  views_total: number;
  unlocks_total: number;
  earned_credits: number;
  withdrawn_credits: number;
  withdrawable_credits: number;
  wallet_credits: number;
  purchased_credits: number;
  boost_credits: number;
  cashed_out_eur: number;
  last_upload_at: string | null;
}

interface VideoRow {
  id: string;
  user_id: string;
  creator_name: string | null;
  title: string | null;
  is_published: boolean;
  duration_seconds: number | null;
  unlock_cost: number | null;
  unlocks_count: number | null;
  views_count: number | null;
  boost_tier: string | null;
  boost_until: string | null;
  frame_slug: string | null;
  created_at: string | null;
}

interface Activity {
  unlocks: Array<{ created_at: string; credits_spent: number; buyer: string; creator: string; title: string | null }>;
  purchases: Array<{ created_at: string; delta: number; reason: string | null; source: string | null; balance_after: number; user_name: string }>;
  payouts: Array<{ created_at: string; amount: number; status: string | null; user_name: string }>;
}

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;
const num = (n: unknown) => Number(n || 0);
const dt = (v: string | null) => (v ? new Date(v).toLocaleString() : "—");

export default function AdminPremiumVideos() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [activity, setActivity] = useState<Activity>({ unlocks: [], purchases: [], payouts: [] });
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [s, c, v, a] = await Promise.all([
        (supabase as any).rpc("admin_premium_videos_summary"),
        (supabase as any).rpc("admin_premium_videos_creators"),
        (supabase as any).rpc("admin_premium_videos_list"),
        (supabase as any).rpc("admin_premium_videos_activity"),
      ]);
      if (s.error) throw s.error;
      setSummary(s.data as Summary);
      setCreators(((c.data as CreatorRow[]) || []).map((r) => ({
        ...r,
        videos_count: num(r.videos_count),
        published_count: num(r.published_count),
        views_total: num(r.views_total),
        unlocks_total: num(r.unlocks_total),
        earned_credits: num(r.earned_credits),
        withdrawn_credits: num(r.withdrawn_credits),
        withdrawable_credits: num(r.withdrawable_credits),
        wallet_credits: num(r.wallet_credits),
        purchased_credits: num(r.purchased_credits),
        boost_credits: num(r.boost_credits),
        cashed_out_eur: num(r.cashed_out_eur),
      })));
      setVideos((v.data as VideoRow[]) || []);
      setActivity((a.data as Activity) || { unlocks: [], purchases: [], payouts: [] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load Unlock Videos data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredCreators = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return creators;
    return creators.filter((r) =>
      [r.full_name, r.username, r.email, r.user_id].some((f) => (f || "").toLowerCase().includes(term))
    );
  }, [creators, q]);

  const filteredVideos = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return videos;
    return videos.filter((r) => [r.title, r.creator_name, r.id].some((f) => (f || "").toLowerCase().includes(term)));
  }, [videos, q]);

  const stats = [
    { label: "Videos", value: `${num(summary?.published_videos)} / ${num(summary?.total_videos)}`, hint: "published / total", icon: Video },
    { label: "Creators", value: num(summary?.creators), hint: "with uploads", icon: Users },
    { label: "Unlocks", value: num(summary?.total_unlocks), hint: `${num(summary?.unlock_credits_spent)} credits spent`, icon: Unlock },
    { label: "Creator earnings", value: `${num(summary?.creator_earned_credits)} cr`, hint: eur(num(summary?.creator_earned_credits) * 0.5), icon: Coins },
    { label: "Credits sold", value: num(summary?.credits_purchased), hint: `${num(summary?.credits_remaining)} unused`, icon: Wallet },
    { label: "Boosts", value: num(summary?.boosts), hint: `${num(summary?.active_boosts)} active · ${num(summary?.boost_credits_spent)} cr`, icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Unlock Videos Admin | Unique" description="Full overview of the Unlock Videos platform: creators, videos, unlocks, credits and payouts." noindex />
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 pt-24 pb-28 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Unlock Videos — Admin</h1>
            <p className="text-sm text-muted-foreground">Creators, videos, unlocks, credit sales and payouts. All data is live.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.hint}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payout overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Earned by creators</div>
              <div className="font-semibold">{num(summary?.creator_earned_credits)} cr · {eur(num(summary?.creator_earned_credits) * 0.5)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Already cashed out</div>
              <div className="font-semibold">{num(summary?.creator_withdrawn_credits)} cr · {eur(num(summary?.creator_withdrawn_credits) * 0.5)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Open liability</div>
              <div className="font-semibold">
                {Math.max(num(summary?.creator_earned_credits) - num(summary?.creator_withdrawn_credits), 0)} cr ·{" "}
                {eur(Math.max(num(summary?.creator_earned_credits) - num(summary?.creator_withdrawn_credits), 0) * 0.5)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Cashout requests</div>
              <div className="font-semibold">{num(summary?.cashouts_count)} · {eur(num(summary?.cashouts_eur))}</div>
            </div>
          </CardContent>
        </Card>

        <Input placeholder="Search creator, e-mail or video title…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

        <Tabs defaultValue="creators">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="creators">Creators ({filteredCreators.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({filteredVideos.length})</TabsTrigger>
            <TabsTrigger value="unlocks">Unlocks</TabsTrigger>
            <TabsTrigger value="credits">Credit sales</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="creators" className="mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Videos</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Unlocks</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                      <TableHead className="text-right">Withdrawable</TableHead>
                      <TableHead className="text-right">Cashed out</TableHead>
                      <TableHead className="text-right">Wallet</TableHead>
                      <TableHead className="text-right">Bought</TableHead>
                      <TableHead className="text-right">Boosts</TableHead>
                      <TableHead>Last upload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreators.map((r) => (
                      <TableRow key={r.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[180px]">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={r.avatar_url || undefined} />
                              <AvatarFallback>{(r.full_name || r.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                              <div className="font-medium text-sm">{r.full_name || r.username || "Unknown"}</div>
                              <div className="text-[11px] text-muted-foreground">{r.email || r.user_id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{r.published_count}/{r.videos_count}</TableCell>
                        <TableCell className="text-right">{r.views_total}</TableCell>
                        <TableCell className="text-right font-semibold">{r.unlocks_total}</TableCell>
                        <TableCell className="text-right">{r.earned_credits} cr<div className="text-[11px] text-muted-foreground">{eur(r.earned_credits * 0.5)}</div></TableCell>
                        <TableCell className="text-right">{r.withdrawable_credits} cr<div className="text-[11px] text-muted-foreground">{eur(r.withdrawable_credits * 0.5)}</div></TableCell>
                        <TableCell className="text-right">{eur(r.cashed_out_eur)}</TableCell>
                        <TableCell className="text-right">{r.wallet_credits}</TableCell>
                        <TableCell className="text-right">{r.purchased_credits}</TableCell>
                        <TableCell className="text-right">{r.boost_credits}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{dt(r.last_upload_at)}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && filteredCreators.length === 0 && (
                      <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">No creators yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Unlocks</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Boost</TableHead>
                      <TableHead>Frame</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="max-w-[220px] truncate">{v.title || "Untitled"}</TableCell>
                        <TableCell className="text-sm">{v.creator_name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant={v.is_published ? "default" : "secondary"}>{v.is_published ? "Live" : "Hidden"}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{num(v.unlocks_count)}</TableCell>
                        <TableCell className="text-right">{num(v.views_count)}</TableCell>
                        <TableCell className="text-right">{num(v.unlock_cost)} cr</TableCell>
                        <TableCell className="text-xs">
                          {v.boost_tier && v.boost_until && new Date(v.boost_until) > new Date()
                            ? `${v.boost_tier} → ${dt(v.boost_until)}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs">{v.frame_slug || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{dt(v.created_at)}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && filteredVideos.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No videos</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unlocks" className="mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Creator share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.unlocks.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{dt(u.created_at)}</TableCell>
                        <TableCell className="text-sm">{u.buyer}</TableCell>
                        <TableCell className="text-sm">{u.creator}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{u.title || "—"}</TableCell>
                        <TableCell className="text-right">{num(u.credits_spent)}</TableCell>
                        <TableCell className="text-right">{eur(num(u.credits_spent) * 0.25)}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && activity.unlocks.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No unlocks yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="mt-4">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Balance after</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.purchases.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{dt(p.created_at)}</TableCell>
                        <TableCell className="text-sm">{p.user_name}</TableCell>
                        <TableCell className={`text-right font-semibold ${num(p.delta) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                          {num(p.delta) > 0 ? "+" : ""}{num(p.delta)}
                        </TableCell>
                        <TableCell className="text-right">{num(p.balance_after)}</TableCell>
                        <TableCell className="text-xs">{p.reason || "—"}</TableCell>
                        <TableCell className="text-xs">{p.source || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {!loading && activity.purchases.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No credit movements yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Creator cashouts (min. €20)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.payouts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{dt(p.created_at)}</TableCell>
                        <TableCell className="text-sm">{p.user_name}</TableCell>
                        <TableCell className="text-right font-semibold">{eur(num(p.amount))}</TableCell>
                        <TableCell><Badge variant="secondary">{p.status || "—"}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {!loading && activity.payouts.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No cashouts yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
