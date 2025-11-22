import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { useState } from "react";

export const PrivacySettingsDialog = () => {
  const { settings, updateSettings } = usePrivacySettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    if (localSettings) {
      updateSettings(localSettings);
    }
  };

  if (!localSettings) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="w-4 h-4" />
          Privacy Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy & Security Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibility Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Visibility</h3>
            <div className="space-y-4">
              <div>
                <Label>Profile Visibility</Label>
                <Select
                  value={localSettings.profile_visibility}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, profile_visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Default Post Visibility</Label>
                <Select
                  value={localSettings.post_visibility}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, post_visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Interaction Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Who Can...</h3>
            <div className="space-y-4">
              <div>
                <Label>Send You Messages</Label>
                <Select
                  value={localSettings.who_can_message}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, who_can_message: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Comment on Your Posts</Label>
                <Select
                  value={localSettings.who_can_comment}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, who_can_comment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tag You in Posts</Label>
                <Select
                  value={localSettings.who_can_tag}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, who_can_tag: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Display Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Online Status</Label>
                <Switch
                  checked={localSettings.show_online_status}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, show_online_status: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Activity</Label>
                <Switch
                  checked={localSettings.show_activity}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, show_activity: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Birthday</Label>
                <Switch
                  checked={localSettings.show_birthday}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, show_birthday: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Friends List</Label>
                <Switch
                  checked={localSettings.show_friends_list}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, show_friends_list: checked })
                  }
                />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
