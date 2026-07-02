import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles, Brush, Layers, Palette, Trophy, Video, Users, Repeat, Heart, Lock, Music, ShoppingBag, Wand2, Grid3x3, ZoomIn, Flame, Image as ImageIcon } from "lucide-react";
import { coloringCall } from "@/hooks/useColoringRouter";
import { useColoringCredits } from "@/hooks/useColoringCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_COLORINGHUB_STEPS = [
  { title: 'Create or pick a template', desc: 'Generate with AI or choose a curated template.' },
  { title: 'Color online or print', desc: 'Use the digital canvas or download a print-ready PDF.' },
  { title: 'Community gallery', desc: "Share your work and admire others' creations." },
  { title: 'Programs for schools & orgs', desc: 'Special tabs for schools, healthcare and corporate.' }
];
const __HIW_COLORINGHUB = { title: 'Coloring Hub', intro: 'Your dashboard for every coloring activity.', steps: __HIW_COLORINGHUB_STEPS };


type Feature = {
  slug: string;
  title: string;
  desc: string;
  icon: any;
  paid?: boolean;
  cost?: number;
};

const FEATURES: Feature[] = [
  { slug: "color-by-number", title: "Color by Number", desc: "AI splits outline into numbered zones", icon: Grid3x3, paid: true, cost: 5 },
  { slug: "paint-bucket", title: "Tap-to-fill", desc: "Fill a closed zone with one tap", icon: Palette },
  { slug: "brushes", title: "Brushes & textures", desc: "Watercolor, pastel, spray, glitter, neon", icon: Brush },
  { slug: "mandala", title: "Mandala / symmetry", desc: "Radial mirroring 2×–16×", icon: Sparkles },
  { slug: "layers", title: "Layers & history", desc: "Undo, redo, branching up to 50+ steps", icon: Layers },
  { slug: "smart-palettes", title: "Smart palettes", desc: "Pantone, Monet, seasonal (AI-suggested)", icon: Palette, paid: true, cost: 3 },
  { slug: "zoom-stylus", title: "Zoom & Stylus", desc: "Pressure-sensitive pen, smooth zoom", icon: ZoomIn },
  { slug: "streaks", title: "Streaks & badges", desc: "Daily streak, XP, levels, badges", icon: Flame },
  { slug: "contests", title: "Weekly contests", desc: "Theme, voting, winner with reward", icon: Trophy },
  { slug: "timelapse", title: "Time-lapse", desc: "Record every stroke, playback", icon: Video },
  { slug: "follow-feed", title: "Follow artists", desc: "Feed of your favorite creators", icon: Users },
  { slug: "remix", title: "Remix", desc: "Take someone else's outline and color it your way", icon: Repeat },
  { slug: "collab", title: "Collab canvas", desc: "Paint together via invite", icon: Users },
  { slug: "collections", title: "Themed collections", desc: "Seasonal packs with a story", icon: ImageIcon },
  { slug: "licensed", title: "Licensed packs", desc: "Disney, Marvel, Anime (premium)", icon: Lock, paid: true, cost: 50 },
  { slug: "ai-examples", title: "AI inspiration", desc: "Color combination suggestions", icon: Wand2, paid: true, cost: 3 },
  { slug: "mindfulness", title: "Mindfulness", desc: "Meditation soundtrack while you paint", icon: Music },
  { slug: "print-on-demand", title: "Print-on-demand", desc: "Print your artwork on poster, t-shirt, mug", icon: ShoppingBag, paid: true },
];

export default function ColoringHub() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { balance, purchase, refresh } = useColoringCredits();

  if (slug) return <FeaturePanel slug={slug} onBack={() => navigate("/coloring-pages/hub")} balance={balance} refreshCredits={refresh} />;

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks title={__HIW_COLORINGHUB.title} intro={__HIW_COLORINGHUB.intro} steps={__HIW_COLORINGHUB.steps} />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/coloring-pages")} className="mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Coloring Pages
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold">Coloring Hub</h1>
            <p className="text-muted-foreground mt-1">18 advanced features. AI tools are billed in credits.</p>
          </div>
          <Card className="px-4 py-3">
            <div className="text-xs text-muted-foreground">Credits</div>
            <div className="text-2xl font-bold">{balance}</div>
            <Button size="sm" variant="outline" className="mt-1" onClick={async () => {
              const url = await purchase(100);
              if (url) window.open(url, "_blank");
            }}>Top up 100</Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <button key={f.slug} onClick={() => navigate(`/coloring-pages/hub/${f.slug}`)} className="text-left">
              <Card className="h-full hover:border-primary transition">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-lg bg-primary/10"><f.icon className="w-5 h-5 text-primary" /></div>
                    {f.paid && <Badge variant="secondary">{f.cost ? `${f.cost} credits` : "Paid"}</Badge>}
                  </div>
                  <CardTitle className="text-base mt-2">{f.title}</CardTitle>
                  <CardDescription className="text-xs">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// ============ FEATURE PANELS ============

function FeaturePanel({ slug, onBack, balance, refreshCredits }: { slug: string; onBack: () => void; balance: number; refreshCredits: () => void }) {
  const feature = FEATURES.find((f) => f.slug === slug);
  if (!feature) return <div className="p-10">Feature not found. <Button onClick={onBack}>Back</Button></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to hub
        </Button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <feature.icon className="w-6 h-6 text-primary" /> {feature.title}
            </h1>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
          {feature.paid && <Badge variant="secondary">{feature.cost ? `${feature.cost} credits / use` : "Paid"}</Badge>}
        </div>

        <Panel slug={slug} balance={balance} refreshCredits={refreshCredits} />
      </main>
    </div>
  );
}

function useAction<T = any>() {
  const [loading, setLoading] = useState(false);
  const run = async (action: string, payload: any = {}, refreshCredits?: () => void): Promise<T | null> => {
    setLoading(true);
    try {
      const res = await coloringCall<T>(action, payload);
      refreshCredits?.();
      return res;
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg === "insufficient_credits") toast.error("Not enough credits. Please top up.", {
        action: { label: "Buy credits", onClick: () => { window.location.href = "/ai-credits-store"; } },
      });
      else if (msg === "unauthorized") {
        toast.error("Please sign in to continue.");
        setTimeout(() => {
          window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 600);
      }
      else if (msg === "rate_limited" || /rate.?limit|too many/i.test(msg)) {
        toast.error("Too many requests — please wait a moment and try again.");
      }
      else toast.error(msg || "Something went wrong. Please try again.");
      return null;
    } finally { setLoading(false); }
  };
  return { run, loading };
}

function Panel({ slug, refreshCredits }: { slug: string; balance: number; refreshCredits: () => void }) {
  switch (slug) {
    case "color-by-number": return <ColorByNumberPanel refreshCredits={refreshCredits} />;
    case "smart-palettes": return <PalettePanel refreshCredits={refreshCredits} />;
    case "ai-examples": return <ExamplesPanel refreshCredits={refreshCredits} />;
    case "streaks": return <StreakPanel />;
    case "contests": return <ContestsPanel />;
    case "follow-feed": return <FollowFeedPanel />;
    case "remix": return <RemixPanel />;
    case "collab": return <CollabPanel />;
    case "collections": return <CollectionsPanel mode="all" />;
    case "licensed": return <CollectionsPanel mode="premium" refreshCredits={refreshCredits} />;
    case "mindfulness": return <MindfulnessPanel />;
    case "print-on-demand": return <PodPanel />;
    case "timelapse": return <TimelapsePanel />;
    case "paint-bucket": case "brushes": case "mandala": case "layers": case "zoom-stylus":
      return <CanvasInfoPanel slug={slug} />;
    default: return <div>Unavailable</div>;
  }
}

// 1. Color-by-number
function ColorByNumberPanel({ refreshCredits }: { refreshCredits: () => void }) {
  const { run, loading } = useAction();
  const [title, setTitle] = useState("");
  const [zones, setZones] = useState<any[]>([]);
  return (
    <Card>
      <CardHeader><CardTitle>Generate a numbered color plan</CardTitle><CardDescription>AI splits the outline into 8–16 color zones.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="e.g. Mandala with butterflies" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button disabled={loading} onClick={async () => {
          const r = await run("ai.colorByNumber", { title }, refreshCredits);
          if (r?.zones) setZones(r.zones);
        }}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />} Generate (5 credits)</Button>
        {zones.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {zones.map((z: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded border">
                <div className="w-6 h-6 rounded" style={{ background: z.color_hex }} />
                <div className="text-xs"><div className="font-bold">{z.id ?? i + 1}</div><div className="text-muted-foreground">{z.label}</div></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 6. Smart palettes
function PalettePanel({ refreshCredits }: { refreshCredits: () => void }) {
  const { run, loading } = useAction();
  const [palette, setPalette] = useState<any>(null);
  const presets = ["Pantone Spring", "Monet Garden", "Pixar Sunset", "Cyberpunk Neon", "Cozy Autumn"];
  return (
    <Card>
      <CardHeader><CardTitle>Smart palettes</CardTitle><CardDescription>AI suggests a 6-color palette (3 credits).</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p} variant="outline" size="sm" disabled={loading} onClick={async () => {
              const r = await run("ai.palette", { preset: p }, refreshCredits);
              if (r) setPalette(r);
            }}>{p}</Button>
          ))}
        </div>
        {palette?.colors?.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">{palette.name}</div>
            <div className="flex gap-2">
              {palette.colors.map((c: string) => (<div key={c} className="w-12 h-12 rounded shadow" style={{ background: c }} title={c} />))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 16. AI examples
function ExamplesPanel({ refreshCredits }: { refreshCredits: () => void }) {
  const { run, loading } = useAction();
  const [theme, setTheme] = useState("");
  const [examples, setExamples] = useState<any[]>([]);
  return (
    <Card>
      <CardHeader><CardTitle>AI inspiration</CardTitle><CardDescription>4 ready-made color combinations (3 credits).</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="e.g. garden in summer" value={theme} onChange={(e) => setTheme(e.target.value)} />
        <Button disabled={loading} onClick={async () => {
          const r = await run("ai.example", { theme }, refreshCredits);
          if (r?.examples) setExamples(r.examples);
        }}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />} Generate</Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {examples.map((ex: any, i: number) => (
            <div key={i} className="p-3 rounded border">
              <div className="font-medium text-sm mb-2">{ex.name}</div>
              <div className="flex gap-1">{(ex.colors ?? []).map((c: string) => (<div key={c} className="w-8 h-8 rounded" style={{ background: c }} />))}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 8. Streaks
function StreakPanel() {
  const [streak, setStreak] = useState<any>(null);
  useEffect(() => { coloringCall("streak.get").then((r: any) => setStreak(r?.streak)).catch(() => {}); }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card><CardHeader><CardTitle className="text-3xl">🔥 {streak?.current_streak ?? 0}</CardTitle><CardDescription>Current streak (days)</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle className="text-3xl">🏆 {streak?.longest_streak ?? 0}</CardTitle><CardDescription>Longest streak</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle className="text-3xl">⚡ {streak?.xp ?? 0} XP</CardTitle><CardDescription>Level {streak?.level ?? 1}</CardDescription></CardHeader></Card>
      {streak?.badges?.length > 0 && (
        <Card className="sm:col-span-3"><CardHeader><CardTitle>Badges</CardTitle></CardHeader><CardContent className="flex gap-2 flex-wrap">{streak.badges.map((b: string) => <Badge key={b}>{b}</Badge>)}</CardContent></Card>
      )}
    </div>
  );
}

// 9. Contests
function ContestsPanel() {
  const [contests, setContests] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  useEffect(() => { coloringCall("contests.list").then((r: any) => setContests(r?.contests ?? [])); }, []);
  useEffect(() => { if (active) coloringCall("contest.entries", { contest_id: active.id }).then((r: any) => setEntries(r?.entries ?? [])); }, [active]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contests.map((c) => (
          <Card key={c.id} className={active?.id === c.id ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="text-base">{c.theme}</CardTitle>
              <CardDescription>{c.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">Reward: {c.prize}</div>
              <Button size="sm" onClick={() => setActive(c)}>Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {active && (
        <Card>
          <CardHeader><CardTitle>Contest entries</CardTitle></CardHeader>
          <CardContent>
            {entries.length === 0 && <div className="text-sm text-muted-foreground">No entries yet.</div>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {entries.map((e) => (
                <div key={e.id} className="border rounded overflow-hidden">
                  <img src={e.image_url} alt={e.title ?? "entry"} className="w-full aspect-square object-cover" />
                  <div className="p-2 flex items-center justify-between">
                    <div className="text-xs">{e.likes_count ?? 0} ❤</div>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await coloringCall("contest.vote", { artwork_id: e.id });
                      toast.success("Vote submitted");
                    }}><Heart className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 11. Follow feed
function FollowFeedPanel() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [tab, setTab] = useState<"public" | "following">("public");
  useEffect(() => {
    const action = tab === "public" ? "feed.public" : "feed.following";
    coloringCall(action).then((r: any) => setArtworks(r?.artworks ?? [])).catch(() => {});
  }, [tab]);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Button size="sm" variant={tab === "public" ? "default" : "outline"} onClick={() => setTab("public")}>Public</Button>
        <Button size="sm" variant={tab === "following" ? "default" : "outline"} onClick={() => setTab("following")}>Following</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artworks.map((a) => (
          <div key={a.id} className="border rounded overflow-hidden">
            <img src={a.image_url} alt={a.title ?? "art"} className="w-full aspect-square object-cover" />
            <div className="p-2 flex items-center justify-between">
              <div className="text-xs truncate">{a.title ?? "Untitled"}</div>
              <Button size="sm" variant="ghost" onClick={async () => {
                const r: any = await coloringCall("follow.toggle", { followee_id: a.user_id });
                toast.success(r?.following ? "Following" : "Unfollowed");
              }}>+follow</Button>
            </div>
          </div>
        ))}
        {artworks.length === 0 && <div className="text-sm text-muted-foreground col-span-3">Nothing yet.</div>}
      </div>
    </div>
  );
}

// 12. Remix
function RemixPanel() {
  const [artworks, setArtworks] = useState<any[]>([]);
  useEffect(() => { coloringCall("feed.public").then((r: any) => setArtworks(r?.artworks ?? [])); }, []);
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Pick an artwork from the public gallery and create your remix.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artworks.map((a) => (
          <div key={a.id} className="border rounded overflow-hidden">
            <img src={a.image_url} alt="" className="w-full aspect-square object-cover" />
            <div className="p-2">
              <Button size="sm" className="w-full" onClick={async () => {
                const r: any = await coloringCall("remix.start", { artwork_id: a.id });
                toast.success("Remix ready — open Coloring Pages to edit", { description: r?.title });
              }}>Remix</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 13. Collab
function CollabPanel() {
  const [collab, setCollab] = useState<any>(null);
  return (
    <Card>
      <CardHeader><CardTitle>Shared canvas</CardTitle><CardDescription>Invite anyone via link.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={async () => {
          const r: any = await coloringCall("collab.create", {});
          setCollab(r?.collab);
        }}>Create session</Button>
        {collab && (
          <div className="p-3 border rounded">
            <div className="text-sm">Share invite:</div>
            <code className="text-xs break-all">{window.location.origin}/coloring-pages/collab/{collab.invite_token}</code>
            <Button size="sm" className="mt-2" variant="outline" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/coloring-pages/collab/${collab.invite_token}`);
              toast.success("Copied");
            }}>Copy link</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 14/15. Collections
function CollectionsPanel({ mode, refreshCredits }: { mode: "all" | "premium"; refreshCredits?: () => void }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [items, setItems] = useState<Record<string, any[]>>({});
  useEffect(() => {
    coloringCall("collections.list").then((r: any) => {
      const list = r?.collections ?? [];
      setCollections(mode === "premium" ? list.filter((c: any) => c.is_premium) : list);
    });
  }, [mode]);
  return (
    <div className="space-y-3">
      {collections.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{c.name} {c.is_premium && <Badge variant="secondary" className="ml-1">Premium</Badge>}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </div>
              <Button size="sm" onClick={async () => {
                const action = c.is_premium ? "collection.unlock" : "collections.items";
                const r: any = await coloringCall(action, { collection_id: c.id });
                setItems((prev) => ({ ...prev, [c.id]: r?.items ?? [] }));
                if (c.is_premium) { refreshCredits?.(); toast.success("Unlocked"); }
              }}>{c.is_premium ? `Unlock (${c.price_credits} credits)` : "Open"}</Button>
            </div>
          </CardHeader>
          {items[c.id] && (
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {items[c.id].length === 0 && <div className="text-xs text-muted-foreground col-span-4">Outlines coming soon.</div>}
                {items[c.id].map((it: any) => (
                  <div key={it.id} className="border rounded p-2 text-xs">{it.title ?? "Outline"}</div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

// 17. Mindfulness
function MindfulnessPanel() {
  const [tracks, setTracks] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => { coloringCall("mindfulness.tracks").then((r: any) => setTracks(r?.tracks ?? [])); }, []);
  return (
    <Card>
      <CardHeader><CardTitle>Meditation sounds</CardTitle><CardDescription>Play in the background while you color.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-2 rounded border">
            <div className="text-sm">{t.name}</div>
            <Button size="sm" variant={playing === t.id ? "default" : "outline"} onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              if (playing === t.id) { setPlaying(null); return; }
              const a = new Audio(t.url); a.loop = true; a.volume = 0.5; a.play().catch(() => toast.error("Cannot play"));
              audioRef.current = a; setPlaying(t.id);
            }}>{playing === t.id ? "Stop" : "Play"}</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// 18. Print on demand
function PodPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [type, setType] = useState("poster_A3");
  useEffect(() => { coloringCall("pod.orders").then((r: any) => setOrders(r?.orders ?? [])); }, []);
  const types = [
    { id: "poster_A3", label: "Poster A3", price: 1900 },
    { id: "tshirt", label: "T-shirt", price: 2900 },
    { id: "mug", label: "Mug", price: 1500 },
    { id: "canvas", label: "Canvas 40×40", price: 4900 },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Order print</CardTitle><CardDescription>Pick a product — payment via Stripe.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {types.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={`p-3 rounded border text-left ${type === t.id ? "border-primary bg-primary/10" : ""}`}>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground">€{(t.price / 100).toFixed(2)}</div>
              </button>
            ))}
          </div>
          <Button onClick={async () => {
            const sel = types.find((t) => t.id === type)!;
            const r: any = await coloringCall("pod.checkout", { product_type: sel.id, amount_eur: sel.price });
            if (r?.checkout_url) window.open(r.checkout_url, "_blank");
            else if (r?.warning) toast.message(r.warning); else toast.success("Order created");
          }}>Continue to payment</Button>
        </CardContent>
      </Card>
      {orders.length > 0 && (
        <Card>
          <CardHeader><CardTitle>My orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div>{o.product_type}</div>
                  <Badge variant="outline">{o.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 10. Timelapse
function TimelapsePanel() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [frames, setFrames] = useState<any[]>([]);
  useEffect(() => { coloringCall("artwork.list").then((r: any) => setArtworks(r?.artworks ?? [])); }, []);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Pick an artwork — we'll play back the saved stroke recording.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artworks.map((a) => (
          <button key={a.id} onClick={async () => {
            const r: any = await coloringCall("timelapse.get", { artwork_id: a.id });
            setFrames(r?.frames ?? []);
            toast.success(`Loaded ${r?.frames?.length ?? 0} frames`);
          }} className="border rounded overflow-hidden text-left">
            <img src={a.image_url} alt="" className="w-full aspect-square object-cover" />
            <div className="p-2 text-xs">{a.title ?? "Untitled"}</div>
          </button>
        ))}
        {artworks.length === 0 && <div className="text-sm text-muted-foreground col-span-3">No artworks yet.</div>}
      </div>
      {frames.length > 0 && <div className="text-xs">Frames ready to play ({frames.length}).</div>}
    </div>
  );
}

// Canvas-based features info
function CanvasInfoPanel({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const tips: Record<string, string> = {
    "paint-bucket": "Open the canvas in Coloring Pages → tap a closed zone for instant fill.",
    "brushes": "Watercolor, pastel, spray, glitter and neon are available on the canvas. Pressure is detected from your stylus.",
    "mandala": "Activate symmetry/mandala mode on the canvas — everything mirrors 2× to 16×.",
    "layers": "The canvas keeps a 50+ stroke history; undo/redo + branching.",
    "zoom-stylus": "Pinch-zoom and pressure-sensitive pens (Apple Pencil / S Pen) — automatic.",
  };
  return (
    <Card>
      <CardHeader><CardTitle>How to use</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{tips[slug]}</p>
        <Button onClick={() => navigate("/coloring-pages")}>Open canvas</Button>
      </CardContent>
    </Card>
  );
}
