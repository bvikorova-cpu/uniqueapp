import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddColoringPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  onSuccess: () => void;
}

export default function AddColoringPageDialog({
  open,
  onOpenChange,
  collectionId,
  onSuccess
}: AddColoringPageDialogProps) {
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-teacher-coloring', {
        body: {
          prompt: prompt,
          collectionId: collectionId
        }
      });

      if (error) throw error;

      toast.success("Coloring page generated successfully!");
      setPrompt("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error generating coloring page:", error);
      toast.error(error.message || "Failed to generate coloring page");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Coloring Page</DialogTitle>
          <DialogDescription>
            Describe what you want to create. AI will generate a black and white coloring page suitable for children.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., friendly pumpkin, cute ghost, witch with cat..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={generating}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">💡 Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Be specific and descriptive</li>
              <li>Use child-friendly themes</li>
              <li>Keep it simple for younger ages</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Coloring Page"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
