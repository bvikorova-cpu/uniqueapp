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
import { ArrowLeft, AlertTriangle, Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
  const [uploadingProof, setUploadingProof] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
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
    proof_document_url: '',
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

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File is too large (max 10MB)',
        variant: 'destructive',
      });
      return;
    }

    setUploadingProof(true);

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
      const fileName = `crisis-proof-${session.user.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(data.path);

      setFormData({ ...formData, proof_document_url: publicUrl });

      toast({
        title: 'Success',
        description: 'Crisis documentation uploaded',
      });
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload documentation',
        variant: 'destructive',
      });
    } finally {
      setUploadingProof(false);
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

    if (!formData.proof_document_url) {
      toast({
        title: 'Error',
        description: 'Crisis documentation/evidence is required for verification',
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

      navigate(`/fundraising/crisis/${data.id}/success?action=created`);
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
        title="Create Crisis Campaign"
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story">Full Story * (What happened and what help is needed)</Label>
                  <AIStoryGenerator
                    campaignType="crisis"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
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

              {/* Crisis Documentation - MANDATORY */}
              <div className="space-y-2 border-2 border-destructive/30 p-4 rounded-lg bg-destructive/5">
                <Label htmlFor="proof" className="flex items-center gap-2 text-destructive font-semibold">
                  <FileText className="h-4 w-4" />
                  Crisis Documentation/Evidence (REQUIRED) *
                </Label>
                <Input
                  id="proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleProofUpload}
                  disabled={uploadingProof}
                  className="cursor-pointer"
                />
                {formData.proof_document_url && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    ✓ Documentation uploaded successfully
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required: Upload police reports, insurance documents, photos of damage, or official statements. Max 10MB.
                </p>
              </div>

              {/* Consent Checkbox - MANDATORY */}
              <div className="flex items-start space-x-3 border-2 border-primary/30 p-4 rounded-lg bg-primary/5">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that all provided information is true and accurate. I consent to the processing of sensitive personal data for verification purposes. I understand that false information may result in account suspension and legal action.
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed quickly due to urgent nature</li>
                  <li>Crisis documentation is required for verification</li>
                  <li>Be specific about immediate needs</li>
                  <li>Platform fee: 8%</li>
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
                  className="flex-1" 
                  size="lg" 
                  disabled={creating || uploading || uploadingProof || !consentChecked || !formData.proof_document_url}
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  {creating ? 'Submitting...' : 'Submit Crisis Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
