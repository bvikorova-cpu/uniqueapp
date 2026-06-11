import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users2, Plus } from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";

export const CommunitiesDialog = () => {
  const [open, setOpen] = useState(false);
  const { communities, createCommunity, join } = useCommunities();
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!slug.trim() || !name.trim()) return;
    createCommunity({ slug: slug.trim().toLowerCase(), name: name.trim(), description });
    setSlug(""); setName(""); setDescription(""); setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Communities">
          <Users2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Communities</DialogTitle>
        </DialogHeader>

        {!creating ? (
          <>
            <Button onClick={() => setCreating(true)} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Create community
            </Button>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {communities.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                  <div>
                    <p className="font-medium text-sm">u/{c.slug}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description || c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.member_count} members</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => join(c.id)}>Join</Button>
                </div>
              ))}
              {!communities.length && <p className="text-sm text-muted-foreground text-center py-6">No communities yet</p>}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <Input placeholder="slug (e.g. cooking)" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
