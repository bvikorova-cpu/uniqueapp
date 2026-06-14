import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScanLine, Upload, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Props { onBack: () => void; }

interface DamageReport {
  overallScore: number;
  damages: { type: string; severity: string; location: string; repairDifficulty: string }[];
  recommendation: string;
  estimatedRepairCredits: number;
}

export const DamageDetection = ({ onBack }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [report, setReport] = useState<DamageReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = usePhotoCredits();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setReport(null); }
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error("Please select a photo"); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('old-photos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const publicUrl = await getReadableUrl('old-photos', fileName);

      const { data, error } = await supabase.functions.invoke('photo-damage-detection', {
        body: { imageUrl: publicUrl }
      });
      if (error) throw error;
      setReport(data);
      toast.success("Damage analysis complete!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze photo");
    } finally { setLoading(false); }
  };

  const severityColor = (s: string) => {
    if (s === "high" || s === "severe") return "text-red-500";
    if (s === "medium" || s === "moderate") return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-red-500" />
          AI Damage Detection
        </h2>
        <p className="text-muted-foreground mb-6">
          Automatically identify scratches, tears, fading, and water damage before restoration. Cost: 4 credits
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Upload Photo to Analyze</Label>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Upload a damaged photo</p>
                  <label htmlFor="damage-file"><Button variant="outline" asChild><span>Choose File</span></Button></label>
                  <Input id="damage-file" type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleAnalyze} disabled={loading || !file || (credits?.credits_remaining ?? 0) < 4}>
              {loading ? "Analyzing..." : "Detect Damage (4 credits)"}
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Damage Report</Label>
            {report ? (
              <div className="space-y-4">
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Overall Condition</span>
                    <span className={`font-bold ${report.overallScore >= 70 ? 'text-green-500' : report.overallScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {report.overallScore}/100
                    </span>
                  </div>
                  <Progress value={report.overallScore} className="h-2" />
                </Card>

                {report.damages.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Detected Issues
                    </h4>
                    {report.damages.map((d, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="p-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{d.type}</span>
                            <span className={`text-xs font-semibold ${severityColor(d.severity)}`}>{d.severity}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Location: {d.location}</p>
                          <p className="text-xs text-muted-foreground">Repair: {d.repairDifficulty}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 text-center bg-green-500/10 border-green-500/20">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600">No significant damage detected!</p>
                  </Card>
                )}

                <Card className="p-3 bg-primary/5 border-primary/20">
                  <p className="text-sm font-medium">💡 Recommendation</p>
                  <p className="text-xs text-muted-foreground mt-1">{report.recommendation}</p>
                  <p className="text-xs font-semibold text-primary mt-2">Estimated repair cost: {report.estimatedRepairCredits} credits</p>
                </Card>
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <ScanLine className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Damage report appears here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
  );
};
