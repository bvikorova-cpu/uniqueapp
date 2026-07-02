import { useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBulkAnalyze } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function BulkUploadCard() {
  const [items, setItems] = useState<string[]>([]);
  const m = useBulkAnalyze();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 200);
    if (parsed.length < 1) { toast.error("File is empty"); return; }
    setItems(parsed);
    toast.success(`Loaded ${parsed.length} items`);
    e.target.value = "";
  };
  return (
    <>
      <FloatingHowItWorks title={"Bulk Upload Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Bulk Upload Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bulk Upload Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-indigo-400">
          <FileText className="w-5 h-5" /> Bulk Upload (CSV/TXT)
          <Badge variant="outline" className="ml-auto text-[10px] border-indigo-500/40 text-indigo-300">1 cr / item</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block">
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
            <span><Upload className="w-4 h-4 mr-2" /> Upload TXT/CSV (one msg per line, max 200)</span>
          </Button>
          <input type="file" accept=".txt,.csv" onChange={onFile} hidden />
        </label>
        {items.length > 0 && (
          <Button onClick={() => m.mutate({ items })} disabled={m.isPending} className="w-full" variant="default">
            {m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing {items.length}...</> : `Analyze ${items.length} items (${items.length} cr)`}
          </Button>
        )}
        {m.data?.results && (
          <div className="space-y-1 max-h-48 overflow-auto pt-2 border-t border-indigo-500/20">
            <div className="text-xs font-bold text-indigo-400">Processed: {m.data.processed} / {m.data.total}</div>
            {m.data.results.slice(0, 10).map((r: any, i: number) => (
              <div key={i} className="text-[11px] flex justify-between p-1.5 rounded bg-black/20">
                <span className="truncate flex-1">[{r.index}] {r.summary}</span>
                <span className={`font-mono ml-2 ${r.truthfulness < 50 ? "text-red-400" : r.truthfulness < 75 ? "text-yellow-400" : "text-green-400"}`}>{r.truthfulness}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
