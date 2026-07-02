import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, AlertTriangle, MessageCircle } from "lucide-react";
import { useScreenshotForensics } from "@/hooks/useLieDetectorAdvanced";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ScreenshotForensicsCard = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [mime, setMime] = useState<string>("image/png");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const detect = useScreenshotForensics();

  const onFile = (f: File) => {
    setMime(f.type || "image/png");
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      setB64(url.split(",")[1]);
    };
    reader.readAsDataURL(f);
  };

  return (
    <>
      <FloatingHowItWorks title={"Screenshot Forensics Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Screenshot Forensics Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Screenshot Forensics Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-amber-950/30 via-card/60 to-card/60 backdrop-blur-md border-amber-900/40 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-amber-400" /> Screenshot Forensics
          </CardTitle>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">8 cr</Badge>
        </div>
        <CardDescription className="text-xs">
          Upload a DM/SMS screenshot. AI extracts the text and detects manipulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 rounded-lg border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 transition flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
          >
            <Camera className="h-6 w-6 text-amber-400" />
            Click to upload screenshot
          </button>
        ) : (
          <div className="relative">
            <img src={preview} alt="" className="w-full max-h-64 object-contain rounded-lg border border-border/40" />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 h-7 text-xs"
              onClick={() => { setPreview(null); setB64(null); setResult(null); }}
            >
              Change
            </Button>
          </div>
        )}
        {b64 && (
          <Button
            onClick={() => detect.mutate({ image_base64: b64, mime }, { onSuccess: (d) => setResult(d) })}
            disabled={detect.isPending}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white"
          >
            {detect.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning…</> : "Run Forensic Scan"}
          </Button>
        )}
        {result?.results && (
          <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Truthfulness</span>
              <span className="text-xl font-black text-amber-300">{result.results.truthfulness_score}%</span>
            </div>
            {result.results.red_flags?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-red-300 mb-1 font-bold text-[11px]">
                  <AlertTriangle className="h-3 w-3" /> Red flags
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {result.results.red_flags.slice(0, 5).map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.results.suggested_response && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-1 text-emerald-300 mb-1 font-bold text-[11px]">
                  <MessageCircle className="h-3 w-3" /> Suggested reply
                </div>
                <p className="text-[11px] italic text-foreground/85">"{result.results.suggested_response}"</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
