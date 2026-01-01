import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useGroups } from "@/hooks/useGroups";
import { CoverImageUpload } from "@/components/shared/CoverImageUpload";

export const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const { createGroup } = useGroups();

  const handleCreate = () => {
    if (!name) return;

    createGroup(
      { name, description, isPrivate, coverImage },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setIsPrivate(false);
          setCoverImage(undefined);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <CoverImageUpload
              value={coverImage}
              onChange={setCoverImage}
              folder="groups"
            />
          </div>
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Photography Enthusiasts"
            />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A community for photography lovers..."
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="private">Private Group</Label>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          <Button onClick={handleCreate} disabled={!name} className="w-full">
            Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};