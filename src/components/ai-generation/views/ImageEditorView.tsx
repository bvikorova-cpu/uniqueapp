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
  const [editInstruction, setEditInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleEdit = async (instruction?: string) => {
    const finalInstruction = instruction || editInstruction;
    if (!description.trim() || !finalInstruction.trim()) {
      toast.error("Please describe your image and the edit you want");
      return;
    }
    setLoading(true);
    setResultImage(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'edit', prompt: `Original image: ${description}. Edit: ${finalInstruction}` }
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

  return (
    <>
      <FloatingHowItWorks title={"Image Editor View - How it works"} steps={[{ title: 'Open', desc: 'Access the Image Editor View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Image Editor View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> AI Image Editor</CardTitle>
          <CardDescription>Describe your image and the edits you want — 3 credits per edit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe the original image</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A portrait of a woman with brown hair in a garden..."
              className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Edit Actions</label>
            <div className="grid grid-cols-3 gap-2">
              {editActions.map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 gap-1"
                  disabled={loading || !description.trim()}
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
              className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <Button onClick={() => handleEdit()} disabled={loading || !description.trim() || !editInstruction.trim()} size="lg" className="w-full">
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
