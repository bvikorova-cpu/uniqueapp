import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldAlert } from "lucide-react";

export default function BecomeCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    cover_image_url: "",
    avatar_url: "",
    social_links: {
      instagram: "",
      twitter: "",
      youtube: "",
      tiktok: ""
    },
    is_adult_content: false
  });

  const handleImageUpload = async (file: File, type: 'cover' | 'avatar') => {
    try {
      const setUploading = type === 'cover' ? setUploadingCover : setUploadingAvatar;
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `creator-${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('creator-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-media')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        [type === 'cover' ? 'cover_image_url' : 'avatar_url']: publicUrl
      }));

      toast({
        title: "Success",
        description: `${type === 'cover' ? 'Cover image' : 'Avatar'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    } finally {
      const setUploading = type === 'cover' ? setUploadingCover : setUploadingAvatar;
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to become a creator",
        });
        navigate("/auth");
        return;
      }

      // Create creator profile
      const { error: profileError } = await supabase
        .from('creator_profiles')
        .insert({
          user_id: user.id,
          display_name: formData.display_name,
          bio: formData.bio,
          cover_image_url: formData.cover_image_url,
          avatar_url: formData.avatar_url,
          is_adult_content: formData.is_adult_content,
          platform_commission_rate: 0.10
        });

      if (profileError) throw profileError;

      // Create default subscription tiers
      const defaultTiers = [
        {
          creator_id: user.id,
          name: 'Basic',
          price: 4.99,
          description: 'Access to basic exclusive content',
          benefits: ['Access to exclusive posts', 'Community chat', 'Monthly updates']
        },
        {
          creator_id: user.id,
          name: 'Premium',
          price: 9.99,
          description: 'Get premium content and early access',
          benefits: ['All Basic benefits', 'Early access to content', 'Behind the scenes', 'Priority support']
        },
        {
          creator_id: user.id,
          name: 'VIP',
          price: 19.99,
          description: 'Ultimate VIP experience with all perks',
          benefits: ['All Premium benefits', 'Private chat access', 'Exclusive live streams', 'Monthly Q&A sessions', 'Personalized content']
        }
      ];

      const { error: tiersError } = await supabase
        .from('creator_subscription_tiers')
        .insert(defaultTiers);

      if (tiersError) throw tiersError;

      toast({
        title: "Success!",
        description: "Your creator profile has been created",
      });

      navigate(`/creator/${user.id}`);
    } catch (error) {
      console.error('Error creating creator profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create creator profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Become a Creator</CardTitle>
          <CardDescription>
            Set up your creator profile and start earning from your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                required
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter your creator name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                required
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell your audience about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'cover');
                  }}
                  disabled={uploadingCover}
                />
                {uploadingCover && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.cover_image_url && (
                <img src={formData.cover_image_url} alt="Cover preview" className="w-full h-48 object-cover rounded-lg mt-2" />
              )}
            </div>

            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'avatar');
                  }}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.avatar_url && (
                <img src={formData.avatar_url} alt="Avatar preview" className="w-24 h-24 object-cover rounded-full mt-2" />
              )}
            </div>

            <div className="space-y-4">
              <Label>Social Media Links (Optional)</Label>
              <div className="grid gap-4">
                <Input
                  placeholder="Instagram URL"
                  value={formData.social_links.instagram}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, instagram: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Twitter URL"
                  value={formData.social_links.twitter}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, twitter: e.target.value }
                  }))}
                />
                <Input
                  placeholder="YouTube URL"
                  value={formData.social_links.youtube}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, youtube: e.target.value }
                  }))}
                />
                <Input
                  placeholder="TikTok URL"
                  value={formData.social_links.tiktok}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, tiktok: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <Label htmlFor="adult-content" className="text-base font-medium">
                    18+ Adult Content
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable if your content is intended for adults only
                </p>
              </div>
              <Switch
                id="adult-content"
                checked={formData.is_adult_content}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_adult_content: checked }))}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Platform Commission:</strong> We take only 10% commission. You keep 90% of all earnings from memberships and tips.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Create Creator Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
