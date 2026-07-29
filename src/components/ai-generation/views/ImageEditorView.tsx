import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Download, Upload, Eraser, Paintbrush, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ImageEditorViewProps {
  onCreditsUsed: () => void;
}

const editActions = [
  { label: "Remove Background", icon: Eraser, instruction: "Remove the background completely, make it transparent white" },
  { label: "Enhance Colors", icon: Paintbrush, instruction: "Enhance the colors, make them more vibrant and saturated while keeping natural look" },
  { label: "Add Artistic Filter", icon: Layers, instruction: "Apply a professional artistic filter with enhanced contrast and cinematic color grading" },
];

export const ImageEditorView = ({ onCreditsUsed }: ImageEditorViewProps) => {
  const [description, setDescription] = useState("");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleUpload = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be smaller than 8 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setSourceImage(reader.result as string);
    reader.onerror = () => toast.error("Could not read the image");
    reader.readAsDataURL(file);
  };

  const handleEdit = async (instruction?: string) => {
    const finalInstruction = instruction || editInstruction;
    if (!finalInstruction.trim()) {
      toast.error("Please describe the edit you want");
      return;
    }
    if (!sourceImage && !description.trim()) {
      toast.error("Upload an image or describe the original image");
      return;
    }
    setLoading(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: sourceImage
          ? { action: 'edit', imageUrl: sourceImage, editPrompt: finalInstruction, prompt: finalInstruction }
          : { action: 'edit', prompt: `Original image: ${description}. Edit: ${finalInstruction}` }
      });
      if (error) throw error;
      if (data.error) { toast.error(data.error); return; }
      setResultImage(data.imageUrl);
      toast.success("Image edited successfully!");
      onCreditsUsed();
    } catch (e: any) {
      toast.error(e.message || "Editing failed");
    } finally {
      setLoading(false);
    }
  };

  const canEdit = Boolean(sourceImage) || description.trim().length > 0;

  return (
    <>
      <FloatingHowItWorks title={"Image Editor View - How it works"} steps={[{ title: 'Upload', desc: 'Upload the image you want to edit (or describe it in words).' }, { title: 'Instruct', desc: 'Pick a quick action or write your own edit instruction.' }, { title: 'Apply', desc: 'Apply the edit — it costs 3 credits.' }, { title: 'Download', desc: 'Review the result and download the edited image.' }]} />
      <div className="ai-mobile-tool-shell ai-editor-mobile-guard w-full max-w-4xl mr-auto space-y-6 pb-96 pr-32 md:mx-auto md:pb-6 md:pr-0">
      <Card className="ai-editor-mobile-card border-2 border-primary/20">
        <CardHeader className="ai-editor-card-header">
          <CardTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> AI Image Editor</CardTitle>
          <CardDescription>Upload an image and describe the edits you want — 3 credits per edit</CardDescription>
        </CardHeader>
        <CardContent className="ai-editor-card-content space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload image to edit</label>
            {sourceImage ? (
              <div className="relative rounded-lg border overflow-hidden bg-muted/30">
                <img src={sourceImage} alt="Image to edit" className="w-full max-h-72 object-contain" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setSourceImage(null)}
                  disabled={loading}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full min-h-[140px] p-4 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/60 transition-colors">
                <Upload className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Tap to upload an image</span>
                <span className="text-xs text-muted-foreground">PNG or JPG, max 8 MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          {!sourceImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Or describe the original image</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A portrait of a woman with brown hair in a garden..."
                className="ai-editor-mobile-field w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
            </div>
          )}


          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Edit Actions</label>
            <div className="ai-editor-actions-grid grid grid-cols-3 gap-2">
              {editActions.map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  size="sm"
                  className="ai-editor-quick-action flex-col h-auto py-3 gap-1"
                  disabled={loading || !canEdit}
                  onClick={() => handleEdit(a.instruction)}
                >
                  <a.icon className="w-4 h-4 text-primary" />
                  <span className="text-[11px]">{a.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom edit instruction</label>
            <textarea
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder="e.g. Change the background to a sunset, add warm lighting..."
              className="ai-editor-mobile-field w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <Button onClick={() => handleEdit()} disabled={loading || !description.trim() || !editInstruction.trim()} size="lg" className="ai-mobile-safe-action w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Editing...</> : <><Pencil className="w-4 h-4 mr-2" />Apply Edit (3 credits)</>}
          </Button>

          {resultImage && (
            <div className="mt-6 border rounded-lg p-4 bg-background">
              <div className="relative group">
                <img src={resultImage} alt="Edited" className="w-full rounded-lg" />
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = `ai-edited-${Date.now()}.webp`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};
