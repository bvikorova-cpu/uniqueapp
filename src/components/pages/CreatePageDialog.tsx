import { useState } from "react";
import { FileText } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePages } from "@/hooks/usePages";
import { CoverImageUpload } from "@/components/shared/CoverImageUpload";

const CATEGORIES = [
  "Business",
  "Entertainment",
  "Education",
  "Technology",
  "Sports",
  "Arts",
  "Community",
  "Other",
];

export const CreatePageDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const { createPage } = usePages();

  const handleCreate = () => {
    if (!name) return;

    createPage(
      { name, description, category, coverImage },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
          setCategory("");
          setCoverImage(undefined);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Create Page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Page</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <CoverImageUpload
              value={coverImage}
              onChange={setCoverImage}
              folder="pages"
            />
          </div>
          <div>
            <Label htmlFor="name">Page Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Amazing Page"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what this page is about..."
            />
          </div>
          <Button onClick={handleCreate} disabled={!name} className="w-full">
            Create Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
