import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, Heart, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function CreateMedicalCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    patient_name: '',
    diagnosis: '',
    hospital: '',
    target_amount: '',
    image_url: '',
    ends_at: '',
    proof_document_url: '',
  });

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
      const fileName = `proof-${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bazaar_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bazaar_images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, proof_document_url: publicUrl });

      toast({
        title: 'Success',
        description: 'Medical documentation uploaded',
      });
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload documentation',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.story || !formData.patient_name || !formData.diagnosis || !formData.target_amount) {
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
        description: 'Medical documentation is required for verification',
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
        description: 'Minimum target amount is 100€',
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
        .from('medical_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          patient_name: formData.patient_name,
          diagnosis: formData.diagnosis,
          hospital: formData.hospital || null,
          target_amount: targetAmount,
          image_url: formData.image_url || null,
          ends_at: formData.ends_at || null,
          status: 'pending', // Pending approval
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Campaign created and waiting for admin approval',
      });

      navigate(`/fundraising/medical/${data.id}/success?action=created`);
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
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('bazaar_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bazaar_images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });

      toast({
        title: 'Success',
        description: 'Image uploaded',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <FloatingHowItWorks
        title="Create Medical Campaign"
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
        <Button
          variant="ghost"
          onClick={() => navigate('/fundraising/medical')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaigns
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🏥 Create Medical Fundraising Campaign</CardTitle>
            <CardDescription>
              Create a campaign to help with medical treatment costs. All campaigns must be verified and approved before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g. Help Peter with cancer treatment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief campaign description (max 200 characters)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={200}
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story">Detailed Story *</Label>
                  <AIStoryGenerator
                    campaignType="medical"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
                <Textarea
                  id="story"
                  placeholder="Describe the situation, patient's health condition, needs, and why you need help in detail..."
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    placeholder="Full name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Medical diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital (optional)</Label>
                <Input
                  id="hospital"
                  placeholder="Hospital or medical facility name"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount (€) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="E.g. 5000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    min="100"
                    step="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum amount: 100€ • Platform fee: 6%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ends_at">Campaign End Date (optional)</Label>
                  <Input
                    id="ends_at"
                    type="date"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Main Image (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 5MB • JPG, PNG or WEBP
                </p>
              </div>

              {/* Medical Documentation - MANDATORY */}
              <div className="space-y-2 border-2 border-destructive/30 p-4 rounded-lg bg-destructive/5">
                <Label htmlFor="proof" className="flex items-center gap-2 text-destructive font-semibold">
                  <FileText className="h-4 w-4" />
                  Medical Documentation (REQUIRED) *
                </Label>
                <Input
                  id="proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleProofUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {formData.proof_document_url && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    ✓ Documentation uploaded successfully
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Required: Upload medical reports, hospital bills, or doctor's confirmation. Max 10MB.
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
                  I confirm that all provided information is true and accurate. I consent to the processing of sensitive personal data (including medical information) for verification purposes. I understand that false information may result in account suspension and legal action.
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ Important Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All campaigns must be verified by an administrator before publishing</li>
                  <li>Medical documentation is required for verification</li>
                  <li>The platform charges a 6% fee on each donation</li>
                  <li>Fake campaigns will be blocked and reported</li>
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
                  disabled={creating || uploading || !consentChecked || !formData.proof_document_url}
                  className="flex-1"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {creating ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
