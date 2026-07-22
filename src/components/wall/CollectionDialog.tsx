import { useState } from "react";
import { useCollections } from "@/hooks/useCollections";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FolderPlus, Folder } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollectionDialogProps {
  postId?: string;
}

export const CollectionDialog = ({ postId }: CollectionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [mode, setMode] = useState<"list" | "create">("list");

  const { collections, createCollection, addToCollection } = useCollections();

  const handleCreate = () => {
    createCollection({ name, description, isPrivate: !isPublic });
    setName("");
    setDescription("");
    setIsPublic(false);
    setMode("list");
  };

  const handleAddToCollection = (collectionId: string) => {
    if (postId) {
      addToCollection({ collectionId, postId });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Folder className="w-4 h-4 mr-2" />
          Save to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Collection" : "Add to Collection"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" ? (
          <div className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAddToCollection(collection.id)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {collection.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setMode("create")}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create New Collection
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Collection"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Make collection public</Label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode("list")}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name}>
                Create
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
