import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, ExternalLink, Code2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CATEGORIES = [
  { value: "medical", label: "Medical", table: "medical_campaigns" },
  { value: "dream", label: "Dream Maker", table: "dream_campaigns" },
  { value: "hero", label: "Community Hero", table: "hero_campaigns" },
  { value: "crisis", label: "Crisis Relief", table: "crisis_campaigns" },
  { value: "pet", label: "Pet Rescue", table: "pet_rescue_campaigns" },
  { value: "student", label: "Student", table: "student_campaigns" },
  { value: "talent", label: "Talent", table: "talent_campaigns" },
];

interface CampaignRow { id: string; title: string; }

/**
 * Public embed builder — pick a campaign, preview the iframe, copy the snippet.
 * Route: /fundraising/embed
 */
export default function EmbedBuilder() {
  const [category, setCategory] = useState<string>("medical");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [width, setWidth] = useState<number>(480);
  const [height, setHeight] = useState<number>(560);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cat = CATEGORIES.find((c) => c.value === category);
      if (!cat) return;
      setLoading(true);
      setSelectedId("");
      const { data } = await supabase
        .from(cat.table as any)
        .select("id,title")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) {
        const rows = ((data as unknown) as CampaignRow[]) || [];
        setCampaigns(rows);
        setSelectedId(rows[0]?.id || "");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.uniqueapp.fun";
  const embedUrl = useMemo(
    () => (selectedId ? `${origin}/embed/campaign/${category}/${selectedId}` : ""),
    [origin, category, selectedId]
  );
  const snippet = useMemo(() => {
    if (!embedUrl) return "";
    return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border:0;max-width:100%;border-radius:16px;overflow:hidden" loading="lazy" title="Support this campaign on Unique"></iframe>`;
  }, [embedUrl, width, height]);

  const copy = async () => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Embed code copied to clipboard");
    } catch {
      toast.error("Copy failed — select the code manually");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <FloatingHowItWorks
        title="Embed Campaign Widget"
        intro="Embed any active campaign on your website or blog."
        steps={[
          { title: "Pick a category", desc: "7 fundraising verticals to choose from." },
          { title: "Pick a campaign", desc: "Only active, verified campaigns appear." },
          { title: "Adjust size", desc: "Set width and height to fit your layout." },
          { title: "Copy the code", desc: "Paste the <iframe> into any HTML page." },
          { title: "Auto-updates", desc: "Widget always shows the latest progress and totals." },
        ]}
      />
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-black">Embed a Campaign</h1>
          </div>
          <p className="text-muted-foreground">Paste one iframe snippet on any website — no code required.</p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-6">
          {/* Builder */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Campaign</Label>
              {loading ? (
                <div className="h-10 rounded-md bg-muted animate-pulse" />
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active campaigns in this category yet.</p>
              ) : (
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input type="number" min={280} max={1200} value={width} onChange={(e) => setWidth(Math.max(280, Math.min(1200, Number(e.target.value) || 480)))} />
              </div>
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input type="number" min={360} max={900} value={height} onChange={(e) => setHeight(Math.max(360, Math.min(900, Number(e.target.value) || 560)))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Embed code</Label>
              <textarea
                readOnly
                value={snippet || "Pick a campaign to generate the embed code."}
                className="w-full min-h-[120px] rounded-md border border-border bg-muted/30 p-3 text-xs font-mono"
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={copy} disabled={!snippet}><Copy className="mr-2 h-4 w-4" /> Copy code</Button>
                {embedUrl && (
                  <Button variant="outline" asChild>
                    <a href={embedUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Open standalone
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Sites that support oEmbed (WordPress, Ghost, Substack, Notion, Discord) can also just paste the standalone URL — an oEmbed
              discovery link is provided.
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Live preview</p>
            {embedUrl ? (
              <iframe
                key={embedUrl + width + height}
                src={embedUrl}
                width={Math.min(width, 500)}
                height={height}
                className="mx-auto rounded-xl border border-border/40 bg-background max-w-full"
                title="Campaign embed preview"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                Preview appears here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
