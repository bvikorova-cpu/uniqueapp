import { useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Upload, Sparkles, Camera, Baby, Scissors, Syringe, Sun, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import BeforeAfterSlider from "./BeforeAfterSlider";

type ActionId =
  | "age_progression" | "age_reversal" | "baby_predict" | "gender_swap"
  | "hair_makeover" | "beard_filter" | "botox_simulator" | "uv_heatmap"
  | "healthy_lifestyle" | "unhealthy_lifestyle";

const META: Record<ActionId, { label: string; cost: number; icon: any; needs2?: boolean }> = {
  age_progression:    { label: "Age +N years",       cost: 6, icon: Sparkles },
  age_reversal:       { label: "Age −15 years",      cost: 6, icon: Sparkles },
  baby_predict:       { label: "Baby Predictor",     cost: 8, icon: Baby, needs2: true },
  gender_swap:        { label: "Gender Swap",        cost: 6, icon: UserCog },
  hair_makeover:      { label: "Hair Makeover",      cost: 5, icon: Scissors },
  beard_filter:       { label: "Beard Filter",       cost: 5, icon: Scissors },
  botox_simulator:    { label: "Botox Simulator",    cost: 7, icon: Syringe },
  uv_heatmap:         { label: "UV Damage Heatmap",  cost: 6, icon: Sun },
  healthy_lifestyle:  { label: "Healthy +Years",     cost: 6, icon: Sparkles },
  unhealthy_lifestyle:{ label: "Unhealthy +Years",   cost: 6, icon: Sparkles },
};

async function uploadPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/source-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("future-face-photos").upload(path, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw error;
  return (await getReadableUrl("future-face-photos", path));
}

export default function FutureFacePhotoStudio() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [secondUrl, setSecondUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [action, setAction] = useState<ActionId>("age_progression");
  const [years, setYears] = useState("20");
  const [styleParam, setStyleParam] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSelect = async (file: File | null, slot: 1 | 2) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast({ title: "Photo too large (max 8 MB)", variant: "destructive" }); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const url = await uploadPhoto(file, session.user.id);
      if (slot === 1) { setSourceUrl(url); setResultUrl(null); }
      else setSecondUrl(url);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
  };

  const generate = async () => {
    if (!sourceUrl) { toast({ title: "Upload a photo first", variant: "destructive" }); return; }
    if (META[action].needs2 && !secondUrl) { toast({ title: "Upload second photo (partner)", variant: "destructive" }); return; }
    try {
      setLoading(true);
      setResultUrl(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const params: any = {};
      if (action === "age_progression" || action === "healthy_lifestyle" || action === "unhealthy_lifestyle") params.years = parseInt(years) || 20;
      if (action === "hair_makeover" || action === "beard_filter") params.style = styleParam || undefined;
      if (action === "botox_simulator") params.area = styleParam || undefined;

      const res = await supabase.functions.invoke("future-face-image", {
        body: { action, sourceUrl, sourceUrl2: secondUrl, params },
      });
      const data = throwIfInvokeError(res);
      setResultUrl(data.resultUrl);
      toast({ title: "Generated!", description: `Used ${data.creditsUsed} credits.` });
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Future Face Photo" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    } finally { setLoading(false); }
  };

  const cur = META[action];
  const Icon = cur.icon;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">📸 Photo Studio (Real Image AI)</h2>
        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">Img2Img</Badge>
      </div>

      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-4">
          {/* Upload zone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold mb-1.5">Your Photo</p>
              {sourceUrl ? (
                <img src={sourceUrl} alt="Source" className="w-full aspect-square object-cover rounded-lg border-2 border-cyan-500/30" />
              ) : (
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-cyan-500/30 grid place-items-center bg-card/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-1.5 mt-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> Upload
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-3 w-3 mr-1" /> Camera
                </Button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleSelect(e.target.files?.[0] || null, 1)} />
              <input ref={cameraRef} type="file" accept="image/*" capture="user" hidden onChange={e => handleSelect(e.target.files?.[0] || null, 1)} />
            </div>
            {cur.needs2 && (
              <div>
                <p className="text-xs font-bold mb-1.5">Partner Photo</p>
                {secondUrl ? (
                  <img src={secondUrl} alt="Second" className="w-full aspect-square object-cover rounded-lg border-2 border-pink-500/30" />
                ) : (
                  <div className="w-full aspect-square rounded-lg border-2 border-dashed border-pink-500/30 grid place-items-center bg-card/50">
                    <Baby className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={() => file2Ref.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" /> Upload Partner
                </Button>
                <input ref={file2Ref} type="file" accept="image/*" hidden onChange={e => handleSelect(e.target.files?.[0] || null, 2)} />
              </div>
            )}
          </div>

          {/* Action selection */}
          <div>
            <p className="text-xs font-bold mb-2">Choose Effect</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(Object.keys(META) as ActionId[]).map(id => {
                const M = META[id]; const I = M.icon;
                return (
                  <Button
                    key={id}
                    size="sm"
                    variant={action === id ? "default" : "outline"}
                    onClick={() => { setAction(id); setResultUrl(null); }}
                    className={`h-auto py-2 flex-col gap-1 text-[10px] ${action === id ? "bg-gradient-to-br from-cyan-600 to-purple-600" : ""}`}
                  >
                    <I className="h-3.5 w-3.5" />
                    <span className="leading-tight">{M.label}</span>
                    <span className="text-[8px] opacity-70">{M.cost} CR</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Params */}
          {(action === "age_progression" || action === "healthy_lifestyle" || action === "unhealthy_lifestyle") && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Years:</span>
              <Input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-24" min="5" max="60" />
            </div>
          )}
          {(action === "hair_makeover" || action === "beard_filter" || action === "botox_simulator") && (
            <Input
              value={styleParam}
              onChange={e => setStyleParam(e.target.value)}
              placeholder={action === "botox_simulator" ? "Area (e.g. forehead, lips)" : "Style (e.g. short blonde bob)"}
            />
          )}

          <Button
            onClick={generate}
            disabled={loading || !sourceUrl}
            className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Icon className="h-4 w-4 mr-2" />}
            {loading ? "Generating image..." : `Generate (${cur.cost} Credits)`}
          </Button>

          {/* Result */}
          {resultUrl && sourceUrl && (
            <Tabs defaultValue="slider">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="slider">Slider</TabsTrigger>
                <TabsTrigger value="side">Side-by-side</TabsTrigger>
              </TabsList>
              <TabsContent value="slider">
                <BeforeAfterSlider before={sourceUrl} after={resultUrl} />
              </TabsContent>
              <TabsContent value="side" className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-bold mb-1 uppercase">Before</p>
                  <img src={sourceUrl} alt="Before" className="w-full aspect-square object-cover rounded-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1 uppercase">After</p>
                  <img src={resultUrl} alt="After" className="w-full aspect-square object-cover rounded-lg" />
                </div>
              </TabsContent>
            </Tabs>
          )}
          {resultUrl && (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <a href={resultUrl} download target="_blank" rel="noreferrer">Download</a>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setResultUrl(null); }}>
                Try Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
