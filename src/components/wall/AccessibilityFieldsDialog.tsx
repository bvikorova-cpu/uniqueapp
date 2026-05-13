import { useState } from "react";
import { Accessibility, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  postId?: string;
}

/**
 * Lets the post author add alt-text for images and a captions VTT URL for videos.
 * Encourages accessibility on every visual post.
 */
export function AccessibilityFieldsDialog({ postId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState("");
  const [captions, setCaptions] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!postId || !user) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("posts")
      .update({ alt_text: alt || null, captions_url: captions || null })
      .eq("id", postId)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Accessibility info saved" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Accessibility className="h-4 w-4" />
          A11y
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accessibility</DialogTitle>
          <DialogDescription>
            Help screen-reader and hard-of-hearing users enjoy your content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="alt">Image alt-text</Label>
            <Textarea
              id="alt"
              placeholder="Describe what is shown in the image…"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              rows={3}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Concrete description (under 200 characters works best).
            </p>
          </div>
          <div>
            <Label htmlFor="vtt">Video captions URL (.vtt)</Label>
            <Input
              id="vtt"
              placeholder="https://…/captions.vtt"
              value={captions}
              onChange={(e) => setCaptions(e.target.value)}
            />
          </div>
          <Button onClick={save} disabled={saving || !postId} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
