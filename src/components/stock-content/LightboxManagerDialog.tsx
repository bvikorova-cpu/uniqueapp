import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FolderHeart, Plus, Trash2, Globe, Lock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LightboxManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog acts as "Add to lightbox" picker for this content item */
  contentItemId?: string;
}

interface Lightbox {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_url: string | null;
  item_count?: number;
  contains_item?: boolean;
}

export function LightboxManagerDialog({ open, onOpenChange, contentItemId }: LightboxManagerDialogProps) {
  const { toast } = useToast();
  const [lightboxes, setLightboxes] = useState<Lightbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => { if (open) load(); }, [open]);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: lbs } = await supabase
      .from("stock_lightboxes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    let containsMap = new Set<string>();
    if (contentItemId && lbs?.length) {
      const { data: items } = await supabase
        .from("stock_lightbox_items")
        .select("lightbox_id")
        .eq("content_item_id", contentItemId)
        .in("lightbox_id", lbs.map((l: any) => l.id));
      containsMap = new Set((items || []).map((i: any) => i.lightbox_id));
    }

    setLightboxes((lbs || []).map((l: any) => ({ ...l, contains_item: containsMap.has(l.id) })));
    setLoading(false);
  };

  const createLightbox = async () => {
    if (!name.trim()) { toast({ title: "Enter a name", variant: "destructive" }); return; }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }
    const { data, error } = await supabase
      .from("stock_lightboxes")
      .insert({ user_id: user.id, name: name.trim(), description: description.trim() || null, is_public: isPublic })
      .select()
      .single();
    setCreating(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lightbox created" });
    setName(""); setDescription(""); setIsPublic(false);
    if (contentItemId && data) await addToLightbox(data.id);
    else load();
  };

  const addToLightbox = async (lightboxId: string) => {
    if (!contentItemId) return;
    const { error } = await supabase
      .from("stock_lightbox_items")
      .insert({ lightbox_id: lightboxId, content_item_id: contentItemId });
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Error", description: error.message, variant: "destructive" }); return;
    }
    toast({ title: "Added to lightbox" });
    load();
  };

  const removeFromLightbox = async (lightboxId: string) => {
    if (!contentItemId) return;
    await supabase.from("stock_lightbox_items").delete()
      .eq("lightbox_id", lightboxId).eq("content_item_id", contentItemId);
    toast({ title: "Removed from lightbox" });
    load();
  };

  const deleteLightbox = async (id: string) => {
    if (!confirm("Delete lightbox?")) return;
    await supabase.from("stock_lightboxes").delete().eq("id", id);
    toast({ title: "Lightbox deleted" });
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-pink-500" />
            {contentItemId ? "Add to Lightbox" : "My Lightboxes"}
          </DialogTitle>
          <DialogDescription>
            Organize and store inspirational works into your own collections.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 space-y-3 border-primary/30">
          <div className="flex items-center gap-2 font-semibold"><Plus className="w-4 h-4" /> New lightbox</div>
          <Input placeholder="Name..." value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Description (optional)..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <div className="flex items-center gap-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public" className="text-sm flex items-center gap-1">
              {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isPublic ? "Public" : "Private"}
            </Label>
          </div>
          <Button onClick={createLightbox} disabled={creating} size="sm" className="w-full">
            {creating ? "Creating..." : "Create"}
          </Button>
        </Card>

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-6 text-muted-foreground text-sm">Loading...</div>
          ) : lightboxes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">No lightboxes. Create the first one above.</div>
          ) : (
            lightboxes.map((lb) => (
              <Card key={lb.id} className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {lb.name}
                    {lb.is_public ? <Globe className="w-3 h-3 text-muted-foreground" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                    {lb.contains_item && <Badge className="bg-green-600 text-white text-[10px]"><Check className="w-3 h-3 mr-0.5" />V kolekcii</Badge>}
                  </div>
                  {lb.description && <div className="text-xs text-muted-foreground line-clamp-1">{lb.description}</div>}
                </div>
                {contentItemId ? (
                  lb.contains_item ? (
                    <Button size="sm" variant="outline" onClick={() => removeFromLightbox(lb.id)}>Remove</Button>
                  ) : (
                    <Button size="sm" onClick={() => addToLightbox(lb.id)}>Add</Button>
                  )
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => deleteLightbox(lb.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
