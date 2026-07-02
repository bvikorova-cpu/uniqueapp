import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Tags, Sparkles, Upload, Copy, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface TagResult {
  title?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  keywords?: string[];
  mood?: string;
  color_palette?: string[];
  best_use_cases?: string[];
}

const fileToDataUrl = (file: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result as string);
  r.onerror = rej;
  r.readAsDataURL(file);
});

export function AITagSuggesterView({ onBack }: Props) {
  const [description, setDescription] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TagResult | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 MB"); return; }
    const url = await fileToDataUrl(file);
    setImageDataUrl(url);
    setPreviewUrl(url);
  };

  const analyze = async () => {
    if (!imageDataUrl && !description.trim()) {
      toast.error("Upload an image or enter a description");
      return;
    }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("stock-ai-tags", {
        body: {
          imageDataUrl: imageDataUrl || undefined,
          description: description.trim() || undefined,
          language: "en",
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult((data as any).result);
      toast.success("Done — AI suggested metadata");
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      result.title && `Title: ${result.title}`,
      result.category && `Category: ${result.category}${result.subcategory ? " / " + result.subcategory : ""}`,
      result.tags?.length && `Tags: ${result.tags.join(", ")}`,
      result.keywords?.length && `Keywords: ${result.keywords.join(", ")}`,
      result.mood && `Mood: ${result.mood}`,
      result.color_palette?.length && `Colors: ${result.color_palette.join(", ")}`,
      result.best_use_cases?.length && `Use cases: ${result.best_use_cases.join(", ")}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const copyTags = () => {
    if (!result?.tags?.length) return;
    navigator.clipboard.writeText(result.tags.join(", "));
    toast.success("Tags copied");
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Tag Suggester View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Tag Suggester View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Tag Suggester View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tags className="w-6 h-6 text-cyan-500" /> AI Tag Suggester
        </h2>
        <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 ml-2">3 credits</Badge>
      </div>

      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-cyan-500" />
          <div>
            <h3 className="text-lg font-bold">Optimize your content's discoverability</h3>
            <p className="text-sm text-muted-foreground">
              AI analyzes image or description and suggests title, category, tags, and SEO keywords.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div>
          <Label className="mb-2 block flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image (optional, max 5 MB)</Label>
          <div className="flex gap-3 items-start">
            <label className="flex-1">
              <Input type="file" accept="image/*" onChange={handleFile} />
            </label>
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="h-20 w-20 rounded-lg object-cover border" />
            )}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Content description (optional)</Label>
          <Textarea
            placeholder="Napr. 'sunset over mountain lake with reflection, warm orange tones, peaceful mood'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={analyze} disabled={loading} className="w-full" variant="premium">
          {loading ? (
            <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Analyzujem...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate tags and metadata</>
          )}
        </Button>
      </Card>

      {result && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" /> AI suggestions
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyTags}><Copy className="w-3 h-3 mr-1" /> Tagy</Button>
              <Button size="sm" variant="outline" onClick={copyAll}><Copy className="w-3 h-3 mr-1" /> All</Button>
            </div>
          </div>

          {result.title && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Title</div>
              <div className="font-semibold">{result.title}</div>
            </div>
          )}

          {(result.category || result.subcategory) && (
            <div className="flex gap-2 flex-wrap">
              {result.category && <Badge>{result.category}</Badge>}
              {result.subcategory && <Badge variant="outline">{result.subcategory}</Badge>}
              {result.mood && <Badge variant="secondary">mood: {result.mood}</Badge>}
            </div>
          )}

          {!!result.tags?.length && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Tags ({result.tags.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {!!result.keywords?.length && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">SEO keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((k, i) => (
                  <Badge key={i} className="text-xs bg-cyan-500/15 text-cyan-400 border-cyan-500/30">{k}</Badge>
                ))}
              </div>
            </div>
          )}

          {!!result.color_palette?.length && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Color palette</div>
              <div className="flex flex-wrap gap-1.5">
                {result.color_palette.map((c, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          )}

          {!!result.best_use_cases?.length && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Best use cases</div>
              <ul className="text-sm list-disc list-inside space-y-0.5">
                {result.best_use_cases.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
    </>
  );
}
