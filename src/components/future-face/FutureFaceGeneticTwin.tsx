import { useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";

const COST = 7;

export default function FutureFaceGeneticTwin() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [ethnicity, setEthnicity] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const upload = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    if (file.size > 8 * 1024 * 1024) { toast({ title: "Photo too large (max 8 MB)", variant: "destructive" }); return; }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${session.user.id}/twin-source-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("future-face-photos").upload(path, file, { contentType: file.type });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    setSourceUrl((await getReadableUrl("future-face-photos", path)));
    setResultUrl(null);
  };

  const generate = async () => {
    if (!sourceUrl) { toast({ title: "Upload a photo first", variant: "destructive" }); return; }
    try {
      setLoading(true); setResultUrl(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const res = await supabase.functions.invoke("future-face-image", {
        body: { action: "genetic_twin", sourceUrl, params: { ethnicity: ethnicity || undefined } },
      });
      const data = throwIfInvokeError(res);
      setResultUrl(data.resultUrl);
      toast({ title: "Genetic twin generated!", description: `Used ${data.creditsUsed} credits.` });
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Genetic Twin" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🧬 Genetic Twin Finder</h2>
        <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">{COST} CR</Badge>
      </div>
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold mb-1.5">Your Photo</p>
              {sourceUrl ? (
                <img src={sourceUrl} alt="You" className="w-full aspect-square object-cover rounded-lg border-2 border-emerald-500/30" />
              ) : (
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-emerald-500/30 grid place-items-center bg-card/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1" /> Upload
              </Button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            </div>
            <div>
              <p className="text-xs font-bold mb-1.5">Your Twin</p>
              {resultUrl ? (
                <img src={resultUrl} alt="Twin" className="w-full aspect-square object-cover rounded-lg border-2 border-cyan-500/30" />
              ) : (
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-cyan-500/30 grid place-items-center bg-card/50">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          <Input value={ethnicity} onChange={e => setEthnicity(e.target.value)} placeholder="Optional ethnicity (e.g. Korean, Brazilian)" />
          <Button onClick={generate} disabled={loading || !sourceUrl} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            {loading ? "Finding twin..." : `Find Genetic Twin (${COST} Credits)`}
          </Button>
          {resultUrl && (
            <Button asChild size="sm" variant="outline" className="w-full">
              <a href={resultUrl} download target="_blank" rel="noreferrer">Download</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
