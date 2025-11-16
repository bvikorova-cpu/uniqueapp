import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const crisisTypes = [
  { value: 'natural_disaster', label: '🌪️ Natural Disaster' },
  { value: 'fire', label: '🔥 Fire' },
  { value: 'flood', label: '🌊 Flood' },
  { value: 'accident', label: '🚗 Accident' },
  { value: 'family_emergency', label: '👨‍👩‍👧 Family Emergency' },
  { value: 'other', label: '⚠️ Other Crisis' },
];

export default function CreateCrisisCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    crisis_type: '',
    location: '',
    target_amount: '',
    urgent: false,
    images: [] as string[],
    video_url: '',
    expires_at: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to upload images',
          variant: 'destructive',
        });
        return;
      }

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'Error',
            description: `${file.name} is too large (max 5MB)`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('campaign-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
      toast({
        title: 'Success',
        description: `${uploadedUrls.length} image(s) uploaded`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.story || !formData.crisis_type || !formData.target_amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
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
        .from('crisis_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          crisis_type: formData.crisis_type,
          location: formData.location || null,
          target_amount: targetAmount,
          urgent: formData.urgent,
          images: formData.images.length > 0 ? formData.images : null,
          video_url: formData.video_url || null,
          expires_at: formData.expires_at || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your crisis relief campaign has been submitted for admin approval',
      });

      navigate(`/fundraising/crisis/${data.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/crisis')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Crisis Relief
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Create Crisis Relief Campaign
            </CardTitle>
            <CardDescription>
              Get immediate help during an emergency. Share what happened and what you need.
              Your campaign will be reviewed for fast approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Family lost everything in house fire"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="crisis_type">Crisis Type *</Label>
                <Select value={formData.crisis_type} onValueChange={(value) => setFormData({ ...formData, crisis_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crisis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {crisisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: Where did this crisis occur</p>
              </div>

              <div>
                <Label htmlFor="description">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of the crisis situation..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="story">Full Story * (What happened and what help is needed)</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Provide detailed information about the crisis, who is affected, immediate needs, and how funds will be used..."
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="target_amount">Target Amount (€) *</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="3000"
                  min="100"
                  step="10"
                />
                <p className="text-sm text-muted-foreground mt-1">Minimum: €100</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked as boolean })}
                />
                <Label htmlFor="urgent" className="text-sm font-normal cursor-pointer">
                  This is an URGENT crisis requiring immediate help
                </Label>
              </div>

              <div>
                <Label htmlFor="images">Crisis Photos/Evidence (up to 5 images)</Label>
                <div className="mt-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || formData.images.length >= 5}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.images.length}/5 images uploaded. Max 5MB per image.
                  </p>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Crisis ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index)
                          })}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="video_url">Video URL (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: Add a video showing the situation</p>
              </div>

              <div>
                <Label htmlFor="expires_at">Campaign Deadline</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: When do you need help by</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed quickly due to urgent nature</li>
                  <li>Add photos/videos showing the crisis situation</li>
                  <li>Be specific about immediate needs</li>
                  <li>Explain how funds will be used to help</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={creating || uploading}>
                <AlertTriangle className="mr-2 h-5 w-5" />
                {creating ? 'Submitting...' : 'Submit Crisis Campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
