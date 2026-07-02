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
import { ArrowLeft, PawPrint, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const petTypes = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐈 Cat' },
  { value: 'bird', label: '🦜 Bird' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'other', label: '🐾 Other' },
];

export default function CreatePetCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    pet_name: '',
    pet_type: '',
    medical_condition: '',
    shelter_name: '',
    target_amount: '',
    urgent: false,
    images: [] as string[],
    video_url: '',
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
    
    if (!formData.title || !formData.description || !formData.story || !formData.pet_name || !formData.pet_type || !formData.target_amount) {
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
    if (isNaN(targetAmount) || targetAmount < 50) {
      toast({
        title: 'Error',
        description: 'Minimum target amount is €50',
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
        .from('pet_rescue_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          pet_name: formData.pet_name,
          pet_type: formData.pet_type,
          medical_condition: formData.medical_condition || null,
          shelter_name: formData.shelter_name || null,
          target_amount: targetAmount,
          urgent: formData.urgent,
          images: formData.images.length > 0 ? formData.images : null,
          video_url: formData.video_url || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your pet rescue campaign has been submitted for admin approval',
      });

      navigate(`/fundraising/pet/${data.id}/success?action=created`);
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
        title="Create Pet Campaign"
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
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/pet')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pet Rescue
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-accent" />
              Create Pet Rescue Campaign
            </CardTitle>
            <CardDescription>
              Help save a pet in need. Share their story and get support from animal lovers.
              Your campaign will be reviewed before going live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="pet_name">Pet's Name *</Label>
                <Input
                  id="pet_name"
                  value={formData.pet_name}
                  onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                  placeholder="Max"
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="pet_type">Pet Type *</Label>
                <Select value={formData.pet_type} onValueChange={(value) => setFormData({ ...formData, pet_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {petTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Help Max get life-saving surgery"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="medical_condition">Medical Condition</Label>
                <Input
                  id="medical_condition"
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({ ...formData, medical_condition: e.target.value })}
                  placeholder="Broken leg, needs surgery"
                />
              </div>

              <div>
                <Label htmlFor="shelter_name">Shelter/Rescue Name</Label>
                <Input
                  id="shelter_name"
                  value={formData.shelter_name}
                  onChange={(e) => setFormData({ ...formData, shelter_name: e.target.value })}
                  placeholder="Happy Paws Animal Shelter"
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of the pet's situation..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story">Full Story * (The pet's background and situation)</Label>
                  <AIStoryGenerator
                    campaignType="pet"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Tell the pet's story - how they ended up needing help, their personality, what treatment they need..."
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
                  placeholder="500"
                  min="50"
                  step="10"
                />
                <p className="text-sm text-muted-foreground mt-1">Minimum: €50</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked as boolean })}
                />
                <Label htmlFor="urgent" className="text-sm font-normal cursor-pointer">
                  This is an urgent case (time-sensitive medical emergency)
                </Label>
              </div>

              <div>
                <Label htmlFor="images">Pet Photos (up to 5 images)</Label>
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
                        <img src={url} alt={`Pet ${index + 1}`} className="w-full h-24 object-cover rounded" />
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
                <p className="text-sm text-muted-foreground mt-1">Optional: Add a video showing the pet</p>
              </div>

              {/* Consent Checkbox - MANDATORY */}
              <div className="flex items-start space-x-3 border-2 border-accent/30 p-4 rounded-lg bg-accent/5">
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

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed by our admin team</li>
                  <li>Add clear photos showing the pet's condition</li>
                  <li>Platform fee: 6%</li>
                  <li>Include any veterinary documentation if available</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={creating || uploading || !consentChecked}>
                  <PawPrint className="mr-2 h-5 w-5" />
                  {creating ? 'Submitting...' : 'Submit Pet Rescue Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
