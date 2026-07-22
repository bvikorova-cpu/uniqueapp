import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFeedPreferences } from "@/hooks/useFeedPreferences";

export const FeedPreferencesDialog = () => {
  const [open, setOpen] = useState(false);
  const { preferences, updatePreferences } = useFeedPreferences();
  const [sortPreference, setSortPreference] = useState(preferences?.sort_preference || "smart");

  useEffect(() => {
    if (preferences) {
      setSortPreference(preferences.sort_preference);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({ sort_preference: sortPreference });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Feed Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feed Preferences</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="sort">Sort Posts By</Label>
            <Select value={sortPreference} onValueChange={setSortPreference}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Select sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">Smart Feed (Recommended)</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="following">Following Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
