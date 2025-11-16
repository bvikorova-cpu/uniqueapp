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

      const defaultTiers = [
        {
          creator_id: user.id,
          name: 'Basic',
          price: 4.99,
          description: 'Access to basic exclusive content',
          benefits: ['Exclusive posts', 'Community chat', 'Monthly updates']
        },
        {
          creator_id: user.id,
          name: 'Premium',
          price: 9.99,
          description: 'Enhanced access with more perks',
          benefits: ['All Basic benefits', 'Priority responses', 'Behind-the-scenes', 'Weekly Q&A']
        },
        {
          creator_id: user.id,
          name: 'VIP',
          price: 19.99,
          description: 'Ultimate creator experience',
          benefits: ['All Premium benefits', 'Direct messaging', '1-on-1 calls', 'Custom content', 'Early access']
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
    } catch (error: any) {
      console.error('Error creating creator profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create creator profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Become a Creator</CardTitle>
            <CardDescription>
              Start sharing exclusive content with your subscribers. Platform takes 10% commission, you keep 90%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">Creator Name *</Label>
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

              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Commission Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Platform commission: 10% • You keep: 90% of all earnings
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="adult-content"
                  checked={formData.is_adult_content}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_adult_content: checked })}
                />
                <Label htmlFor="adult-content" className="text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  My content is suitable for 18+ audiences only
                </Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
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
    </div>
  );
}
