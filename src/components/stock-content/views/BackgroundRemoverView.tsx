import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eraser, Loader2, ImageIcon, Download, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BackgroundRemoverViewProps {
  onBack: () => void;
}

export function BackgroundRemoverView({ onBack }: BackgroundRemoverViewProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bgColor, setBgColor] = useState("transparent");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResultUrl(null);
      setResultPath(null);
    }
  };

  const handleRemove = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please upload an image first", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const filePath = `bg-removal-src/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("stock-content")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("stock-content").getPublicUrl(filePath);

      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageUrl: urlData.publicUrl, bgColor },
      });
      if (error) throw error;
      if (!data?.resultUrl) throw new Error("No result returned");

      setResultUrl(data.resultUrl);
      setResultPath(data.filePath ?? null);
      toast({ title: "Background Removed!", description: "Your PNG with transparency is ready." });
    } catch (error: any) {
      const msg = error?.message?.includes("402")
        ? "Insufficient credits (need 3)."
        : error?.message ?? "Processing failed";
      toast({ title: "Processing Failed", description: msg, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bg-removed-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultUrl, "_blank");
    }
  };

  const handleSaveToMyContent = async () => {
    if (!resultUrl) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const { error } = await supabase.from("stock_content_items").insert([{
        creator_id: user.id,
        title: file?.name?.replace(/\.[^.]+$/, "") ?? "Background-removed image",
        description: `Background removed (${bgColor}) using AI`,
        content_type: "image",
        category: "edited",
        tags: ["bg-removed", bgColor],
        price_eur: 0,
        license_type: "standard",
        file_url: resultUrl,
        thumbnail_url: resultUrl,
        is_active: false,
      }]);
      if (error) throw error;
      toast({ title: "Saved", description: "Added to My Content as a draft (inactive)." });
    } catch (error: any) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Background Remover View - How it works"} steps={[{ title: 'Open', desc: 'Access the Background Remover View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Background Remover View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Eraser className="w-6 h-6 text-rose-500" /> AI Background Remover</h2>
        <Badge variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20">3 credits</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          </div>

          <div>
            <Label>Background Replacement</Label>
            <Select value={bgColor} onValueChange={setBgColor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transparent">Transparent PNG</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="gradient-blue">Blue Gradient</SelectItem>
                <SelectItem value="gradient-purple">Purple Gradient</SelectItem>
                <SelectItem value="blur">Blurred Original</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {previewUrl && (
            <div>
              <Label>Original</Label>
              <img src={previewUrl} alt="Original" className="w-full rounded-lg mt-1 max-h-48 object-contain bg-secondary/20" />
            </div>
          )}

          <Button onClick={handleRemove} disabled={processing || !file} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Eraser className="w-4 h-4 mr-2" />Remove Background (3 Credits)</>}
          </Button>

          <div className="p-3 bg-secondary/20 rounded-lg">
            <p className="text-xs font-semibold mb-1">Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• AI-powered precise edge detection</li>
              <li>• Hair and fine detail preservation</li>
              <li>• Real transparent PNG output</li>
              <li>• Instant download or save to library</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Result</h3>
          {resultUrl ? (
            <div className="space-y-4">
              <div className="bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')] rounded-lg p-2">
                <img src={resultUrl} alt="Result" className="w-full rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> Download PNG
                </Button>
                <Button variant="default" onClick={handleSaveToMyContent} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save to My Content
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-secondary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Processed result will appear here</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}
