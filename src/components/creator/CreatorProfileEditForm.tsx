import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CreatorProfileEditFormProps {
  creator: {
    id: string;
    display_name: string;
    bio: string | null;
    social_links: any;
    is_adult_content: boolean | null;
  };
  onSave: () => void;
}

export function CreatorProfileEditForm({ creator, onSave }: CreatorProfileEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(creator.display_name);
  const [bio, setBio] = useState(creator.bio || "");
  const [instagram, setInstagram] = useState(creator.social_links?.instagram || "");
  const [twitter, setTwitter] = useState(creator.social_links?.twitter || "");
  const [website, setWebsite] = useState(creator.social_links?.website || "");
  const [isAdultContent, setIsAdultContent] = useState(creator.is_adult_content || false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Display name is required" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          social_links: {
            instagram: instagram.trim() || null,
            twitter: twitter.trim() || null,
            website: website.trim() || null,
          },
          is_adult_content: isAdultContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", creator.id);

      if (error) throw error;

      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setEditing(false);
      onSave();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(creator.display_name);
    setBio(creator.bio || "");
    setInstagram(creator.social_links?.instagram || "");
    setTwitter(creator.social_links?.twitter || "");
    setWebsite(creator.social_links?.website || "");
    setIsAdultContent(creator.is_adult_content || false);
    setEditing(false);
  };

  if (!editing) {
    return (
    <>
      <FloatingHowItWorks title={"Creator Profile Edit Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Profile Edit Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Profile Edit Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
    </>
  );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your creator name"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your audience about yourself..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter URL</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="adultContent"
            checked={isAdultContent}
            onCheckedChange={setIsAdultContent}
          />
          <Label htmlFor="adultContent">Adult content (18+)</Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
