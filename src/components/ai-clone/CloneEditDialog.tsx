import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save } from "lucide-react";

interface CloneEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clone: {
    id: string;
    clone_name: string;
    personality_data: {
      personality?: string;
      interests?: string;
      communicationStyle?: string;
      tone?: string;
    };
  } | null;
  onSaved: () => void;
}

export function CloneEditDialog({ open, onOpenChange, clone, onSaved }: CloneEditDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cloneName: "",
    personality: "",
    interests: "",
    communicationStyle: "",
    tone: "friendly",
  });

  useEffect(() => {
    if (open && clone) {
      setFormData({
        cloneName: clone.clone_name || "",
        personality: clone.personality_data?.personality || "",
        interests: clone.personality_data?.interests || "",
        communicationStyle: clone.personality_data?.communicationStyle || "",
        tone: clone.personality_data?.tone || "friendly",
      });
    }
  }, [open, clone]);

  const handleSave = async () => {
    if (!clone || !formData.cloneName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("personality_clones")
        .update({
          clone_name: formData.cloneName,
          personality_data: {
            ...clone.personality_data,
            personality: formData.personality,
            interests: formData.interests,
            communicationStyle: formData.communicationStyle,
            tone: formData.tone,
          },
        })
        .eq("id", clone.id);
      if (error) throw error;
      toast({ title: "Clone updated" });
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update clone", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Edit Clone
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cloneName">Clone Name</Label>
            <Input id="edit-cloneName" value={formData.cloneName} onChange={(e) => setFormData({ ...formData, cloneName: e.target.value })} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-personality">Personality</Label>
            <Textarea id="edit-personality" rows={4} value={formData.personality} onChange={(e) => setFormData({ ...formData, personality: e.target.value })} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-interests">Interests & Expertise</Label>
            <Textarea id="edit-interests" rows={3} value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-style">Communication Style</Label>
            <Textarea id="edit-style" rows={3} value={formData.communicationStyle} onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tone">Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly & Warm</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="intellectual">Intellectual</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
