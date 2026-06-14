import { useState } from "react";
import { getReadableUrl } from "@/lib/storageSigned";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layers, Upload, ArrowLeft, Download, CheckCircle, Loader2 } from "lucide-react";
import { usePhotoCredits } from "@/hooks/usePhotoCredits";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Props { onBack: () => void; }

interface BatchItem {
  file: File;
  preview: string;
  status: "pending" | "processing" | "done" | "error";
  result?: string;
}

export const BatchProcessing = ({ onBack }: Props) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [operation, setOperation] = useState("repair");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { credits } = usePhotoCredits();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) { toast.error("Maximum 10 photos per batch"); return; }
    const newItems = files.map(f => ({ file: f, preview: URL.createObjectURL(f), status: "pending" as const }));
    setItems(newItems);
  };

  const totalCredits = items.length * (operation === "colorization-pro" ? 8 : operation === "face-enhancement" ? 5 : operation === "background-removal" ? 3 : 1);

  const handleBatchProcess = async () => {
    if (items.length === 0) { toast.error("Please select photos"); return; }
    if ((credits?.credits_remaining ?? 0) < totalCredits) { toast.error("Not enough credits"); return; }
    setProcessing(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setItems(prev => prev.map((p, idx) => idx === i ? { ...p, status: "processing" } : p));

        try {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${user.id}/batch-${Date.now()}-${i}.${fileExt}`;
          await supabase.storage.from('old-photos').upload(fileName, item.file);
          const publicUrl = await getReadableUrl('old-photos', fileName);

          let fnName = "restore-old-photo";
          let body: any = { imageUrl: publicUrl, restorationType: operation };

          if (operation === "background-removal") { fnName = "photo-background-removal"; body = { imageUrl: publicUrl }; }
          else if (operation === "face-enhancement") { fnName = "photo-face-enhancement"; body = { imageUrl: publicUrl }; }
          else if (operation === "colorization-pro") { fnName = "photo-colorization-pro"; body = { imageUrl: publicUrl, era: "auto" }; }

          const { data, error } = await supabase.functions.invoke(fnName, { body });
          if (error) throw error;

          const resultUrl = data.restoredImageUrl || data.processedImageUrl || data.enhancedImageUrl || data.colorizedImageUrl || "";
          setItems(prev => prev.map((p, idx) => idx === i ? { ...p, status: "done", result: resultUrl } : p));
        } catch {
          setItems(prev => prev.map((p, idx) => idx === i ? { ...p, status: "error" } : p));
        }

        setProgress(((i + 1) / items.length) * 100);
      }

      toast.success("Batch processing complete!");
    } catch (error: any) {
      toast.error(error.message || "Batch processing failed");
    } finally { setProcessing(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Layers className="h-6 w-6 text-indigo-500" />
          Batch Processing
        </h2>
        <p className="text-muted-foreground mb-6">
          Restore up to 10 photos simultaneously. Select an operation and upload your photos.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="mb-2 block">Operation</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">🔧 Photo Repair (1 credit each)</SelectItem>
                <SelectItem value="colorize">🎨 Colorization (1 credit each)</SelectItem>
                <SelectItem value="enhance">✨ Enhancement (1 credit each)</SelectItem>
                <SelectItem value="background-removal">✂️ Background Removal (3 credits each)</SelectItem>
                <SelectItem value="face-enhancement">👤 Face Enhancement (5 credits each)</SelectItem>
                <SelectItem value="colorization-pro">🎭 Colorization Pro (8 credits each)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Upload Photos (max 10)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleFiles} disabled={processing} />
          </div>
        </div>

        {items.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{items.length} photos selected</p>
              <p className="text-sm font-semibold text-primary">Total: {totalCredits} credits</p>
            </div>

            {processing && (
              <div className="mb-4">
                <Progress value={progress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {items.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={item.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      item.status === "processing" ? "bg-black/50" :
                      item.status === "done" ? "bg-green-500/20" :
                      item.status === "error" ? "bg-red-500/20" : ""
                    }`}>
                      {item.status === "processing" && <Loader2 className="h-6 w-6 text-white animate-spin" />}
                      {item.status === "done" && <CheckCircle className="h-6 w-6 text-green-500" />}
                      {item.status === "error" && <span className="text-red-500 text-xs font-bold">Failed</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button className="w-full" size="lg" onClick={handleBatchProcess}
              disabled={processing || (credits?.credits_remaining ?? 0) < totalCredits}>
              {processing ? "Processing..." : `Process ${items.length} Photos (${totalCredits} credits)`}
            </Button>

            {items.some(i => i.status === "done" && i.result) && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Results</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.filter(i => i.status === "done" && i.result).map((item, i) => (
                    <Card key={i} className="overflow-hidden">
                      <img src={item.result!} alt="Result" className="w-full aspect-square object-cover" />
                      <a href={item.result!} download>
                        <Button variant="ghost" size="sm" className="w-full gap-1">
                          <Download className="h-3 w-3" /> Download
                        </Button>
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {credits && <p className="text-sm text-muted-foreground mt-4">Remaining credits: {credits.credits_remaining}</p>}
      </Card>
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
    </motion.div>
  );
};
