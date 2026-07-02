import { useEffect, useRef, useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, X, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const FILTERS = [
  { label: "Original", css: "none" },
  { label: "+10y", css: "contrast(1.05) sepia(0.15) brightness(0.95) saturate(0.85)" },
  { label: "+30y", css: "contrast(1.1) sepia(0.3) brightness(0.85) saturate(0.7) blur(0.3px)" },
  { label: "Glow", css: "contrast(1.1) brightness(1.15) saturate(1.3)" },
  { label: "Vintage", css: "sepia(0.6) contrast(1.1)" },
  { label: "Cool", css: "hue-rotate(-15deg) saturate(1.2)" },
];

export default function FutureFaceLiveAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [filter, setFilter] = useState(0);
  const [snap, setSnap] = useState<string | null>(null);
  const [aged, setAged] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e: any) {
      toast({ title: "Camera denied", description: e.message, variant: "destructive" });
    }
  };
  const stop = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };
  useEffect(() => () => stop(), []); // eslint-disable-line

  const capture = async () => {
    if (!videoRef.current) return;
    const c = document.createElement("canvas");
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = FILTERS[filter].css;
    ctx.drawImage(videoRef.current, 0, 0);
    const blob: Blob = await new Promise(r => c.toBlob(b => r(b!), "image/jpeg", 0.9));
    const dataUrl = await new Promise<string>(r => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(blob); });
    setSnap(dataUrl);
    setAged(null);
    stop();
  };

  const ageIt = async () => {
    if (!snap) return;
    setBusy(true);
    try {
      // upload snapshot
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const blob = await (await fetch(snap)).blob();
      const path = `${session.user.id}/livear-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("future-face-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const url = (await getReadableUrl("future-face-photos", path));
      const res = await supabase.functions.invoke("future-face-image", {
        body: { action: "age_progression", sourceUrl: url, params: { years: 25 } },
      });
      const data = throwIfInvokeError(res);
      setAged(data.resultUrl);
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Live AR" })) {
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      }
    } finally { setBusy(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face Live A R - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Live A R section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Live A R.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">📹 Live AR Camera</h2>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{stream ? "● LIVE" : "Off"}</Badge>
      </div>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          {!stream && !snap && (
            <Button onClick={start} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
              <Video className="h-4 w-4 mr-2" /> Start Camera
            </Button>
          )}
          {stream && (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ filter: FILTERS[filter].css }} />
                <div className="absolute inset-x-0 top-0 p-2 flex justify-end">
                  <Button size="icon" variant="ghost" onClick={stop} className="text-white bg-black/40"><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {FILTERS.map((f, i) => (
                  <Button key={f.label} size="sm" variant={filter === i ? "default" : "outline"} onClick={() => setFilter(i)} className="text-[10px]">
                    {f.label}
                  </Button>
                ))}
              </div>
              <Button onClick={capture} className="w-full"><Camera className="h-4 w-4 mr-2" /> Capture</Button>
            </>
          )}
          {snap && !aged && (
            <>
              <img src={snap} alt="Captured" className="w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setSnap(null); start(); }}>Retake</Button>
                <Button onClick={ageIt} disabled={busy} className="bg-gradient-to-r from-cyan-600 to-purple-600">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Age +25y (6 CR)
                </Button>
              </div>
            </>
          )}
          {snap && aged && (
            <>
              <BeforeAfterSlider before={snap} after={aged} />
              <Button variant="outline" onClick={() => { setSnap(null); setAged(null); start(); }} className="w-full">New capture</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
