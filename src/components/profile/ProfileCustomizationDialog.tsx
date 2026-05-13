import { useRef, useState, useEffect } from "react";
import { Settings, Trash2, Image, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfileCustomization } from "@/hooks/useProfileCustomization";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ProfileCustomizationDialog = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { pinnedPosts, featuredLinks, unpinPost, addLink, removeLink, updateBanner } =
    useProfileCustomization(userId);

  const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await updateBanner(file);
      toast.success("Banner updated");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    addLink({ title: linkTitle, url: linkUrl });
    setLinkTitle("");
    setLinkUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Customize profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile customization</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6">
            <section>
              <Label className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4" /> Banner
              </Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBanner}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Upload banner image
              </Button>
            </section>

            <section>
              <Label className="mb-2 block">Pinned posts ({pinnedPosts.length}/3)</Label>
              {pinnedPosts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Pin posts from the post menu (max 3).
                </p>
              )}
              <div className="space-y-1">
                {pinnedPosts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-muted rounded px-2 py-1 text-sm"
                  >
                    <span className="truncate">Post {p.post_id.slice(0, 8)}…</span>
                    <Button size="icon" variant="ghost" onClick={() => unpinPost(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Label className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4" /> Featured links
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <Input
                  placeholder="https://…"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button onClick={handleAddLink}>Add</Button>
              </div>
              <div className="space-y-1">
                {featuredLinks.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between bg-muted rounded px-2 py-1 text-sm"
                  >
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:underline"
                    >
                      {l.title}
                    </a>
                    <Button size="icon" variant="ghost" onClick={() => removeLink(l.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
