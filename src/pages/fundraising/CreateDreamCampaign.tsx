import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Sparkles, ImagePlus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const dreamTypes = [
  { value: 'education', label: '🎓 Education' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'startup', label: '🚀 Startup' },
  { value: 'creative', label: '🎨 Creative Project' },
  { value: 'other', label: '✨ Other' },
];

export default function CreateDreamCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    dream_type: '',
    target_amount: '',
    image_url: '',
    ends_at: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image is too large (max 5MB)',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `dream-${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bazaar_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bazaar_images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.story || !formData.dream_type || !formData.target_amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!consentChecked) {
      toast({
        title: 'Error',
        description: 'You must confirm the consent checkbox',
        variant: 'destructive',
      });
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    if (isNaN(targetAmount) || targetAmount < 100) {
      toast({
        title: 'Error',
        description: 'Minimum target amount is €100',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a campaign',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('dream_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          dream_type: formData.dream_type,
          target_amount: targetAmount,
          image_url: formData.image_url || null,
          ends_at: formData.ends_at || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your dream campaign has been submitted for admin approval',
      });

      navigate(`/fundraising/dream/${data.id}/success?action=created`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <FloatingHowItWorks
        title="Create Dream Campaign"
        intro="Launch a new fundraising campaign in this category."
        steps={[
          { title: "Fill the story", desc: "Title, description, goal amount and deadline." },
          { title: "Upload proof", desc: "Photos, documents and verification files." },
          { title: "Set payout method", desc: "Connect Stripe to receive donations." },
          { title: "Submit for review", desc: "Our team verifies within 24-72 hours." },
          { title: "Go live & share", desc: "Once approved, share the link everywhere." }
        ]}
      />
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/dream')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dream Maker
        </Button>

        <Card className="border-amber-500/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-t-lg border-b border-amber-500/20">
            <CardTitle className="text-3xl flex items-center gap-2 text-foreground">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Share Your Dream
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell the community about your dream and how they can help make it a reality.
              Your campaign will be reviewed by our team before going live.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-foreground font-medium">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My dream to study abroad"
                  maxLength={100}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="dream_type" className="text-foreground font-medium">Dream Type *</Label>
                <Select value={formData.dream_type} onValueChange={(value) => setFormData({ ...formData, dream_type: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select dream type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dreamTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground font-medium">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of your dream..."
                  maxLength={200}
                  rows={3}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/200 characters</p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story" className="text-foreground font-medium">Your Full Story * (Why this dream matters to you)</Label>
                  <AIStoryGenerator
                    campaignType="dream"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your journey, motivations, and how achieving this dream will impact your life..."
                  rows={8}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="target_amount" className="text-foreground font-medium">Target Amount (€) *</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="1000"
                  min="100"
                  step="10"
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1">Minimum: €100</p>
              </div>

              <div>
                <Label className="text-foreground font-medium">Campaign Image/Video</Label>
                <div className="mt-1.5 space-y-3">
                  {/* File Upload */}
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-amber-500/30 rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors">
                        <ImagePlus className="h-5 w-5 text-amber-500" />
                        <span className="text-sm text-muted-foreground">
                          {uploading ? 'Uploading...' : 'Click to upload image from device'}
                        </span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  {formData.image_url && (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* URL fallback */}
                  <div className="text-xs text-muted-foreground">Or enter URL:</div>
                  <Input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, WEBP or MP4</p>
                </div>
              </div>

              <div>
                <Label htmlFor="ends_at" className="text-foreground font-medium">Campaign End Date</Label>
                <Input
                  id="ends_at"
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: Set a deadline for your campaign</p>
              </div>

              {/* Consent Checkbox - MANDATORY */}
              <div className="flex items-start space-x-3 border-2 border-amber-500/30 p-4 rounded-lg bg-amber-500/5">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that all provided information is true and accurate. I consent to the processing of personal data for verification purposes.
                </Label>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-foreground">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed by our admin team</li>
                  <li>You'll receive a notification once it's approved</li>
                  <li>Platform fee: 7%</li>
                  <li>Add a compelling image to increase support</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
                  size="lg" 
                  disabled={creating || uploading || !consentChecked}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {creating ? 'Submitting...' : 'Submit Dream Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
