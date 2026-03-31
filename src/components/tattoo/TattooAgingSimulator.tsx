import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Loader2, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

interface Props { onBack: () => void; }

export const TattooAgingSimulator = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [tattooImage, setTattooImage] = useState<string | null>(null);
  const [years, setYears] = useState("5");
  const [skinType, setSkinType] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; agedImageUrl?: string } | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setTattooImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const simulate = async () => {
    if (!tattooImage) {
      toast.error("Upload a tattoo image first");
      return;
    }
    if (credits.credits_remaining < 10) {
      toast.error("You need 10 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "aging_simulation", imageUrl: tattooImage, years: parseInt(years), skinType },
      });
      if (error) throw error;
      setResult(data);
      await refresh();
      toast.success("Aging simulation complete!");
    } catch (e: any) {
      toast.error(e.message || "Error simulating aging");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-8 w-8 text-amber-500" />
          <div>
            <h2 className="text-2xl font-black">Tattoo Aging Simulator</h2>
            <p className="text-muted-foreground text-sm">See how your tattoo will look over time (10 credits)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Upload Tattoo Image or Design</Label>
            <div className="mt-2 border-2 border-dashed border-amber-500/30 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500/60 transition-colors" onClick={() => document.getElementById("aging-upload")?.click()}>
              {tattooImage ? (
                <img src={tattooImage} alt="Tattoo" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Click to upload tattoo image</p>
                </>
              )}
              <input id="aging-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Years Forward</Label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 30].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y} Years</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Skin Type</Label>
              <Select value={skinType} onValueChange={setSkinType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={simulate} disabled={loading || !tattooImage} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Simulating...</> : <><Sparkles className="h-4 w-4" /> Simulate Aging (10 credits)</>}
          </Button>

          {result && (
            <Card className="p-4 mt-4 bg-amber-500/5 border-amber-500/20">
              <h3 className="font-black text-lg mb-3">Aging Analysis — {years} Years</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {result.analysis}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};
