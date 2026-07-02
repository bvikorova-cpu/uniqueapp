import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ShieldCheck, Upload, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface PlagiarismScannerViewProps {
  onBack: () => void;
}

interface ScanResult {
  originalityScore: number;
  matches: { source: string; similarity: number; url: string }[];
  verdict: string;
  details: string;
}

export function PlagiarismScannerView({ onBack }: PlagiarismScannerViewProps) {
  const { toast } = useToast();
  const { credits, spendCredit } = useAICredits();
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setImageUrl("");
    }
  };

  const handleScan = async () => {
    if (!file && !imageUrl.trim()) {
      toast({ title: "Error", description: "Please upload an image or enter an image URL", variant: "destructive" });
      return;
    }

    if (credits.credits_remaining < 4) {
      toast({ title: "Insufficient Credits", description: "You need 4 credits for a plagiarism scan. Purchase more credits.", variant: "destructive" });
      return;
    }

    setScanning(true);
    try {
      const success = await spendCredit("custom_generation", "AI Plagiarism Scanner");
      if (!success) throw new Error("Failed to deduct credits");

      let uploadedUrl = imageUrl;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in");
        const filePath = `plagiarism-scans/${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("stock-content").upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("stock-content").getPublicUrl(filePath);
        uploadedUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "plagiarism_scan", imageUrl: uploadedUrl },
      });
      if (error) throw error;

      setResult(data);
      toast({ title: "Scan Complete!", description: `Originality score: ${data.originalityScore}%` });
    } catch (error: any) {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-8 h-8 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    return <XCircle className="w-8 h-8 text-red-500" />;
  };

  return (
    <>
      <FloatingHowItWorks title={"Plagiarism Scanner View - How it works"} steps={[{ title: 'Open', desc: 'Access the Plagiarism Scanner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Plagiarism Scanner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-emerald-500" /> AI Plagiarism Scanner</h2>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">4 credits</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          </div>
          <div className="text-center text-sm text-muted-foreground">— or —</div>
          <div>
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" disabled={!!file} />
          </div>

          {file && (
            <div className="p-3 bg-secondary/30 rounded-lg text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}

          <Button onClick={handleScan} disabled={scanning} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            {scanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Scan for Plagiarism (4 Credits)</>}
          </Button>

          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-xs font-semibold mb-1">How It Works:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AI analyzes visual patterns and composition</li>
              <li>• Compares against millions of known images</li>
              <li>• Detects derivatives, crops, and edits</li>
              <li>• Returns originality score with detailed report</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Scan Results</h3>
          {result ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-secondary/20 rounded-xl">
                {getScoreIcon(result.originalityScore)}
                <p className={`text-4xl font-black mt-2 ${getScoreColor(result.originalityScore)}`}>{result.originalityScore}%</p>
                <p className="text-sm text-muted-foreground">Originality Score</p>
                <Badge className="mt-2" variant={result.originalityScore >= 90 ? "default" : "destructive"}>{result.verdict}</Badge>
              </div>
              <Progress value={result.originalityScore} className="h-3" />
              <p className="text-sm text-muted-foreground">{result.details}</p>

              {result.matches.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Similar Content Found:</p>
                  {result.matches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg mb-2">
                      <span className="text-sm truncate flex-1">{m.source}</span>
                      <Badge variant="outline" className={m.similarity > 80 ? "text-red-400" : "text-yellow-400"}>{m.similarity}% match</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <ShieldCheck className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Upload an image to check originality</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}
