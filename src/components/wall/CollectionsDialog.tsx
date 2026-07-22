import { useState } from "react";
import { Bookmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollections } from "@/hooks/useCollections";
import { Checkbox } from "@/components/ui/checkbox";

interface CollectionsDialogProps {
  postId: string;
}

export const CollectionsDialog = ({ postId }: CollectionsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { collections, createCollection, addToCollection } = useCollections();

  const handleCreate = () => {
    if (!name.trim()) return;
    createCollection({ name, description });
    setName("");
    setDescription("");
    setShowCreate(false);
  };

  const handleAddToCollection = (collectionId: string) => {
    addToCollection({ collectionId, postId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bookmark className="h-4 w-4 mr-2" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        
        {!showCreate ? (
          <>
            <ScrollArea className="h-64">
              {collections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No collections yet
                </p>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => handleAddToCollection(collection.id)}
                    >
                      <Checkbox />
                      <div className="flex-1">
                        <p className="font-medium">{collection.name}</p>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Button onClick={() => setShowCreate(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Collection
            </Button>
          </>
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
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim()} className="flex-1">
                Create & Add
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
