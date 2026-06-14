import { useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";

const STEPS = [10, 20, 30, 40, 50];

export default function FutureFaceMultiAgeTimeline() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    const path = `${session.user.id}/timeline-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("future-face-photos").upload(path, file, { contentType: file.type });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    setSourceUrl((await getReadableUrl("future-face-photos", path)));
    setResults({});
  };

  const generateAll = async () => {
    if (!sourceUrl) { toast({ title: "Upload a photo first", variant: "destructive" }); return; }
    for (const years of STEPS) {
      setLoading(years);
      try {
        const res = await supabase.functions.invoke("future-face-image", {
          body: { action: "age_progression", sourceUrl, params: { years } },
        });
        const data = throwIfInvokeError(res);
        setResults(prev => ({ ...prev, [years]: data.resultUrl }));
      } catch (err: any) {
        if (!handleEdgeError(err, { navigate, context: "Timeline" })) {
          toast({ title: `+${years}y failed`, description: err.message, variant: "destructive" });
        }
        break;
      }
    }
    setLoading(null);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">⏳ Multi-Age Timeline</h2>
        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">30 CR total</Badge>
      </div>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-4">
          {sourceUrl ? (
            <img src={sourceUrl} alt="You today" className="w-32 h-32 object-cover rounded-lg border-2 border-cyan-500/40 mx-auto" />
          ) : (
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full">
              <Upload className="h-4 w-4 mr-2" /> Upload your photo
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleUpload(e.target.files?.[0] || null)} />

          {sourceUrl && (
            <Button onClick={generateAll} disabled={loading !== null} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
              {loading !== null ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating +{loading}y…</> : <><CalendarDays className="h-4 w-4 mr-2" /> Generate full timeline</>}
            </Button>
          )}

          {sourceUrl && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <div className="text-center">
                <img src={sourceUrl} alt="Today" className="w-full aspect-square object-cover rounded-lg border border-border/40" />
                <p className="text-[10px] font-bold mt-1">Today</p>
              </div>
              {STEPS.map(y => (
                <div key={y} className="text-center">
                  {results[y] ? (
                    <img src={results[y]} alt={`+${y}y`} className="w-full aspect-square object-cover rounded-lg border border-cyan-500/30" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg border border-dashed border-border grid place-items-center bg-card/50">
                      {loading === y ? <Loader2 className="h-5 w-5 animate-spin text-cyan-500" /> : <span className="text-[9px] text-muted-foreground">+{y}y</span>}
                    </div>
                  )}
                  <p className="text-[10px] font-bold mt-1">+{y} years</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
