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
import { ArrowLeft, GraduationCap, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const supportTypes = [
  { value: 'tuition', label: '💰 Tuition Fees' },
  { value: 'books', label: '📚 Books & Materials' },
  { value: 'living', label: '🏠 Living Expenses' },
  { value: 'technology', label: '💻 Technology & Equipment' },
  { value: 'research', label: '🔬 Research Project' },
  { value: 'other', label: '📝 Other Educational Needs' },
];

export default function CreateStudentCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    support_type: '',
    school_name: '',
    field_of_study: '',
    target_amount: '',
    pay_it_forward: false,
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
          description: 'You must be logged in to upload images',
          variant: 'destructive',
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(data.path);

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
    
    if (!formData.title || !formData.description || !formData.story || !formData.support_type || !formData.target_amount) {
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

    if (!ageConfirmed) {
      toast({
        title: 'Age verification required',
        description: 'You must be 18+ or have verified parental consent on file.',
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
        .from('student_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          support_type: formData.support_type,
          school_name: formData.school_name || null,
          field_of_study: formData.field_of_study || null,
          target_amount: targetAmount,
          pay_it_forward: formData.pay_it_forward,
          image_url: formData.image_url || null,
          ends_at: formData.ends_at || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your student support campaign has been submitted for admin approval',
      });

      navigate(`/fundraising/student/${data.id}/success?action=created`);
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
        title="Create Student Campaign"
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
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/student')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Support
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              Create Student Support Campaign
            </CardTitle>
            <CardDescription>
              Get support for your educational journey. Share your goals and academic needs.
              Your campaign will be reviewed before going live.
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
                  placeholder="Help me pursue my Engineering degree"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="support_type">Support Type *</Label>
                <Select value={formData.support_type} onValueChange={(value) => setFormData({ ...formData, support_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select support type" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="school_name">School/University Name</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  placeholder="Technical University of..."
                />
              </div>

              <div>
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Input
                  id="field_of_study"
                  value={formData.field_of_study}
                  onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of your educational goals..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story">Your Full Story * (Academic goals and why you need support)</Label>
                  <AIStoryGenerator
                    campaignType="student"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your academic journey, goals, challenges you're facing, and how this support will help you succeed..."
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
                  placeholder="2000"
                  min="100"
                  step="10"
                />
                <p className="text-sm text-muted-foreground mt-1">Minimum: €100</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pay_it_forward"
                  checked={formData.pay_it_forward}
                  onCheckedChange={(checked) => setFormData({ ...formData, pay_it_forward: checked as boolean })}
                />
                <Label htmlFor="pay_it_forward" className="text-sm font-normal cursor-pointer">
                  I commit to pay it forward by helping other students once I succeed
                </Label>
              </div>

              <div>
                <Label htmlFor="image">Campaign Image</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Max 5MB. JPG, PNG supported.</p>
                </div>
                {formData.image_url && (
                  <div className="mt-4">
                    <img src={formData.image_url} alt="Campaign" className="w-full max-w-md h-48 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="ends_at">Campaign End Date</Label>
                <Input
                  id="ends_at"
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: Set a deadline for your campaign</p>
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
                  I confirm that all provided information is true and accurate. I consent to the processing of personal data for verification purposes.
                </Label>
              </div>

              {/* Age verification - MANDATORY */}
              <div className="flex items-start space-x-3 border-2 border-amber-500/30 p-4 rounded-lg bg-amber-500/5">
                <Checkbox
                  id="age"
                  checked={ageConfirmed}
                  onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="age" className="text-sm leading-relaxed cursor-pointer">
                  I confirm that I am at least 18 years old, or that I have written
                  parental/guardian consent on file. Campaigns by minors without
                  verified consent will be removed.
                </Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed by our admin team</li>
                  <li>Be specific about how funds will be used</li>
                  <li>Platform fee: 5%</li>
                  <li>Share your academic achievements and goals</li>
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
                <Button type="submit" className="flex-1" size="lg" disabled={creating || uploading || !consentChecked || !ageConfirmed}>
                  <GraduationCap className="mr-2 h-5 w-5" />
                  {creating ? 'Submitting...' : 'Submit Student Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
