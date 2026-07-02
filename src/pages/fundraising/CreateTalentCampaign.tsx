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
import { ArrowLeft, Star, Upload, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIStoryGenerator } from '@/components/fundraising/AIStoryGenerator';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const talentTypes = [
  { value: 'music', label: '🎵 Music' },
  { value: 'art', label: '🎨 Visual Arts' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'dance', label: '💃 Dance' },
  { value: 'acting', label: '🎭 Acting/Theater' },
  { value: 'writing', label: '✍️ Writing' },
  { value: 'other', label: '⭐ Other Talent' },
];

export default function CreateTalentCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    talent_type: '',
    target_amount: '',
    portfolio_url: '',
    achievements: [''],
    goals: [''],
    images: [] as string[],
    video_url: '',
    ends_at: '',
  });

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const addGoal = () => {
    setFormData({ ...formData, goals: [...formData.goals, ''] });
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    });
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

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
    
    if (!formData.title || !formData.description || !formData.story || !formData.talent_type || !formData.target_amount) {
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

      const cleanedAchievements = formData.achievements.filter(a => a.trim() !== '');
      const cleanedGoals = formData.goals.filter(g => g.trim() !== '');

      const { data, error } = await supabase
        .from('talent_campaigns')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          description: formData.description,
          story: formData.story,
          talent_type: formData.talent_type,
          target_amount: targetAmount,
          portfolio_url: formData.portfolio_url || null,
          achievements: cleanedAchievements.length > 0 ? cleanedAchievements : null,
          goals: cleanedGoals.length > 0 ? cleanedGoals : null,
          images: formData.images.length > 0 ? formData.images : null,
          video_url: formData.video_url || null,
          ends_at: formData.ends_at || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Your talent sponsorship campaign has been submitted for admin approval',
      });

      navigate(`/fundraising/talent/${data.id}/success?action=created`);
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
        title="Create Talent Campaign"
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
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/talent')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Talent Sponsorship
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Star className="h-8 w-8 text-accent" />
              Create Talent Sponsorship Campaign
            </CardTitle>
            <CardDescription>
              Showcase your talent and get sponsored! Share your achievements, goals, and portfolio.
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
                  placeholder="Help me record my first album"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="talent_type">Talent Type *</Label>
                <Select value={formData.talent_type} onValueChange={(value) => setFormData({ ...formData, talent_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select talent type" />
                  </SelectTrigger>
                  <SelectContent>
                    {talentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of your talent and goals..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="story">Your Full Story * (Your journey and aspirations)</Label>
                  <AIStoryGenerator
                    campaignType="talent"
                    onGenerated={(d) => setFormData({ ...formData, title: formData.title || d.title, story: d.story, description: formData.description || d.appeal.slice(0, 200) })}
                  />
                </div>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your background, passion for your craft, what makes you unique, and how sponsorship will help you reach the next level..."
                  rows={8}
                />
              </div>

              <div>
                <Label>Achievements</Label>
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={achievement}
                      onChange={(e) => updateAchievement(index, e.target.value)}
                      placeholder="Won local talent competition 2024"
                    />
                    {formData.achievements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAchievement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addAchievement}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Achievement
                </Button>
              </div>

              <div>
                <Label>Future Goals</Label>
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder="Release my first professional album"
                    />
                    {formData.goals.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeGoal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addGoal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </div>

              <div>
                <Label htmlFor="portfolio_url">Portfolio/Social Media URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://instagram.com/yourprofile or your website"
                />
                <p className="text-sm text-muted-foreground mt-1">Share where people can see your work</p>
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

              <div>
                <Label htmlFor="images">Portfolio Images (up to 5 images)</Label>
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
                        <img src={url} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded" />
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
                <Label htmlFor="video_url">Performance Video URL (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-muted-foreground mt-1">Show your talent! Add a performance video</p>
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
                  <li>Add your best work to showcase your talent</li>
                  <li>Platform fee: 10%</li>
                  <li>Include performance videos if possible</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={creating || uploading || !consentChecked}>
                  <Star className="mr-2 h-5 w-5" />
                  {creating ? 'Submitting...' : 'Submit Talent Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
