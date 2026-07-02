import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Wand2, Sun, Palette, Maximize, Sparkles, Download, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const ENHANCEMENTS = [
  { id: "auto", icon: Sparkles, label: "AI Auto-Enhance", desc: "One-click optimal enhancement", premium: false },
  { id: "hdr", icon: Sun, label: "HDR Boost", desc: "Enhance lighting & dynamic range", premium: false },
  { id: "color", icon: Palette, label: "Color Correction", desc: "Professional color grading", premium: false },
  { id: "widen", icon: Maximize, label: "Wide-Angle Fix", desc: "Correct lens distortion", premium: true },
  { id: "sky", icon: Sun, label: "Sky Replacement", desc: "Replace cloudy skies with blue", premium: true },
  { id: "staging", icon: Wand2, label: "Virtual Declutter", desc: "AI removes clutter from photos", premium: true },
];

const BEFORE_AFTER = [
  { label: "Living Room", before: "Dark, cluttered", after: "Bright, spacious feel", improvement: "+340% views" },
  { label: "Kitchen", before: "Yellow lighting", after: "Natural white balance", improvement: "+280% views" },
  { label: "Exterior", before: "Overcast sky", after: "Sunny blue sky", improvement: "+195% views" },
];

export function PropertyPhotoEnhancer({ onBack }: Props) {
  const [selectedEnhancement, setSelectedEnhancement] = useState<string[]>(["auto"]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const toggleEnhancement = (id: string) => {
    setSelectedEnhancement(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setProcessed(true); }, 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Photo Enhancer - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Photo Enhancer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Photo Enhancer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">📸 AI Photo Enhancement</h2>
          <p className="text-sm text-muted-foreground">Automatically enhance property photos for maximum appeal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-xl border-border/30">
          <CardHeader><CardTitle className="text-lg">Upload Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Drop photos here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 25MB each • Max 20 photos</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {["🏠", "🛋️", "🍳"].map((emoji, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center text-3xl">
                  {emoji}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border/30">
          <CardHeader><CardTitle className="text-lg">Enhancement Options</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ENHANCEMENTS.map((e) => (
              <motion.div key={e.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => toggleEnhancement(e.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedEnhancement.includes(e.id) ? "border-primary/50 bg-primary/5" : "border-border/30 bg-background/50"
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedEnhancement.includes(e.id) ? "bg-primary/20" : "bg-muted"}`}>
                  <e.icon className={`h-4 w-4 ${selectedEnhancement.includes(e.id) ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{e.label}</span>
                    {e.premium && <Badge variant="secondary" className="text-[10px]">PRO</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                </div>
                {selectedEnhancement.includes(e.id) && <Check className="h-4 w-4 text-primary" />}
              </motion.div>
            ))}
            <Button onClick={handleProcess} disabled={processing} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white mt-4">
              {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</> : <><Wand2 className="h-4 w-4 mr-2" />Enhance Photos</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {processed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/60 backdrop-blur-xl border-border/30">
            <CardHeader><CardTitle className="text-lg">✨ Before & After Results</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BEFORE_AFTER.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                    className="rounded-xl border border-border/30 overflow-hidden">
                    <div className="grid grid-cols-2 h-32">
                      <div className="bg-muted/50 flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{item.before}</div>
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xs font-medium p-2 text-center">{item.after}</div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-bold">{item.label}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">{item.improvement}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => {
                const content = [
                  "Enhanced Property Photos — Summary",
                  "===================================",
                  `Generated: ${new Date().toLocaleString()}`,
                  "",
                  ...BEFORE_AFTER.map(b => `${b.label}: ${b.before} → ${b.after} (${b.improvement})`),
                  "",
                  "Re-upload your originals for AI enhancement on next session.",
                ].join("\n");
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `enhanced-photos-summary-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("Summary downloaded");
              }}><Download className="h-4 w-4 mr-2" />Download All Enhanced Photos</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
}
