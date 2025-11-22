import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useInterests } from "@/hooks/useInterests";

interface InterestsDialogProps {
  userId: string;
}

export const InterestsDialog = ({ userId }: InterestsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const { interests, addInterest, removeInterest } = useInterests(userId);

  const handleAdd = () => {
    if (!newInterest.trim()) return;
    addInterest({ interest: newInterest });
    setNewInterest("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Tag className="h-4 w-4 mr-2" />
          Interests
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Interests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest..."
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!newInterest.trim()}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 w-full">
                No interests yet
              </p>
            ) : (
              interests.map((interest) => (
                <Badge key={interest.id} variant="secondary" className="gap-1">
                  {interest.interest}
                  <button
                    onClick={() => removeInterest(interest.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
