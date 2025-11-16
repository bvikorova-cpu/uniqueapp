import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    dream_type: '',
    target_amount: '',
    image_url: '',
    ends_at: '',
  });

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

      navigate(`/fundraising/dream/${data.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/dream')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dream Maker
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-secondary" />
              Share Your Dream
            </CardTitle>
            <CardDescription>
              Tell the community about your dream and how they can help make it a reality.
              Your campaign will be reviewed by our team before going live.
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
                  placeholder="My dream to study abroad"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="dream_type">Dream Type *</Label>
                <Select value={formData.dream_type} onValueChange={(value) => setFormData({ ...formData, dream_type: value })}>
                  <SelectTrigger>
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
                <Label htmlFor="description">Short Description * (max 200 characters)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief summary of your dream..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="story">Your Full Story * (Why this dream matters to you)</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Share your journey, motivations, and how achieving this dream will impact your life..."
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
                  placeholder="1000"
                  min="100"
                  step="10"
                />
                <p className="text-sm text-muted-foreground mt-1">Minimum: €100</p>
              </div>

              <div>
                <Label htmlFor="image_url">Campaign Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">Optional: Add a compelling image for your campaign</p>
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

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Before You Submit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your campaign will be reviewed by our admin team</li>
                  <li>You'll receive a notification once it's approved</li>
                  <li>Be honest and detailed in your story</li>
                  <li>Add a compelling image to increase support</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={creating}>
                <Sparkles className="mr-2 h-5 w-5" />
                {creating ? 'Submitting...' : 'Submit Dream Campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
