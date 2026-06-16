import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Upload, Search, ImageIcon, Download, Euro, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { onBack: () => void; }

export function SmartSearchView({ onBack }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });

  const onUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Image is too large (max 5 MB)", variant: "destructive" }); return; }
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(dataUrl);
    await runSearch({ imageDataUrl: dataUrl });
  };

  const runSearch = async (payload: { imageDataUrl?: string; queryText?: string }) => {
    setLoading(true);
    setResults([]); setKeywords([]);
    try {
      const { data, error } = await supabase.functions.invoke("stock-similar-search", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setKeywords(data.keywords || []);
      setResults(data.results || []);
      if (!data.results?.length) toast({ title: "No similar results", description: "Try a different image or query." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-violet-500" /> Smart Search · Reverse Image
        </h2>
        <Badge variant="secondary">AI · 4 credits</Badge>
      </div>

      <Card className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2"><Upload className="w-4 h-4" /> Upload image</h3>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Query" className="max-h-40 mx-auto rounded" />
              ) : (
                <div className="py-6 text-muted-foreground"><ImageIcon className="w-10 h-10 mx-auto mb-2" />Click and select image (max 5 MB)</div>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2"><Search className="w-4 h-4" /> Or describe in words</h3>
            <Input placeholder="napr. 'sunset over mountains, warm tones'" value={textQuery} onChange={e => setTextQuery(e.target.value)} />
            <Button className="mt-2 w-full" disabled={loading || !textQuery.trim()} onClick={() => runSearch({ queryText: textQuery.trim() })}>
              {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Searching...</> : <><Sparkles className="w-4 h-4 mr-1" />Find similar</>}
            </Button>
          </div>
        </div>
      </Card>

      {keywords.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">AI keywords:</span>
          {keywords.map((k, i) => <Badge key={i} variant="outline">{k}</Badge>)}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />AI analyzes and searches for similar works...</div>
      )}

      {!loading && results.length > 0 && (
        <>
          <h3 className="font-bold">Similar works ({results.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="relative h-40 bg-secondary/20">
                  {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground" /></div>}
                  <Badge className="absolute top-2 right-2 bg-violet-600 text-white">{item._score}× match</Badge>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold flex items-center gap-0.5 text-sm"><Euro className="w-3 h-3" />{item.price_eur?.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Download className="w-3 h-3" />{item.total_downloads}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
