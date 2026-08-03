import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAstrologyCredits, CREDIT_COSTS } from "@/hooks/useAstrologyCredits";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Hand, Sparkles, Camera, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const MAX_SIZE = 1280;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(file);
  });

const compressImage = async (file: File): Promise<string> => {
  const dataUrl = await fileToDataUrl(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Invalid image"));
      el.src = dataUrl;
    });
    const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return dataUrl;
  }
};

export const PalmistryReader = () => {
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const { credits } = useAstrologyCredits();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image is too large (max 15 MB)");
      return;
    }
    setResult(null);
    setPreview(await compressImage(file));
  };

  const readMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke('astrology-reading', {
        body: { type: 'palmistry', data: { imageBase64: preview } }
      });
      if (error) throw error;
      await supabase.from('palmistry_readings').insert({
        user_id: user.id,
        image_url: 'uploaded-photo',
        reading: data.reading,
        credits_used: CREDIT_COSTS.palmistry,
      });
      return data;
    },
    onSuccess: (data) => { setResult(data); toast.success("Palm decoded! 🖐️"); },
    onError: (error: Error) => { toast.error(error.message); }
  });

  const lines = result
    ? [
        ["Life line", result.life_line],
        ["Heart line", result.heart_line],
        ["Head line", result.head_line],
        ["Fate line", result.fate_line],
      ].filter(([, v]) => !!v)
    : [];

  return (
    <>
      <FloatingHowItWorks
        title='Palmistry Reader'
        steps={[
          { title: 'Take a photo', desc: 'Use "Take photo" to snap your open palm, or upload an image from your device.' },
          { title: 'Check the preview', desc: 'Make sure the palm lines are sharp and well lit. Retake if needed.' },
          { title: 'Read palm', desc: 'Tap "Read Palm" to send the photo for AI analysis.' },
          { title: 'Review the result', desc: 'Read the interpretation of your life, heart, head and fate lines.' }
        ]}
      />
    <div className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Hand className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-black text-foreground">Palmistry Reading</h2>
          <span className="ml-auto text-xs text-muted-foreground">{CREDIT_COSTS.palmistry} credits</span>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()} className="justify-center">
            <Camera className="mr-2 h-4 w-4" /> Take photo
          </Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="justify-center">
            <Upload className="mr-2 h-4 w-4" /> Upload image
          </Button>
        </div>

        {preview ? (
          <div className="relative w-full max-w-xs mx-auto mb-3">
            <img src={preview} alt="Palm photo preview" className="w-full rounded-xl border border-border/30" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Remove photo"
              onClick={() => { setPreview(""); setResult(null); }}
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-3 rounded-xl border border-dashed border-border/50 p-6 text-center text-xs text-muted-foreground">
            Take a photo of your open palm or upload one from your phone or computer.
          </div>
        )}

        <div className="flex gap-3 items-center flex-wrap">
          <Button onClick={() => readMutation.mutate()}
            disabled={readMutation.isPending || !preview || (credits?.credits_remaining || 0) < CREDIT_COSTS.palmistry}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold">
            {readMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading...</> : <>🖐️ Read Palm</>}
          </Button>
          <span className="text-xs text-muted-foreground">Credits: {credits?.credits_remaining || 0}</span>
        </div>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/90 backdrop-blur-xl border-border/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Palm Analysis
            </h3>
            {lines.length > 0 ? (
              <div className="space-y-3">
                {lines.map(([label, value]) => (
                  <div key={label as string} className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs font-bold text-emerald-500 mb-1">{label}</p>
                    <p className="text-sm text-foreground leading-relaxed">{String(value)}</p>
                  </div>
                ))}
                {result.summary && (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {result.summary || result.interpretation || result.reading}
              </p>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
