import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CreateMedicalCampaign() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.story || !formData.patient_name || !formData.diagnosis || !formData.target_amount) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte prosím všetky povinné polia',
        variant: 'destructive',
      });
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    if (isNaN(targetAmount) || targetAmount < 100) {
      toast({
        title: 'Chyba',
        description: 'Minimálna cieľová suma je 100€',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Chyba',
          description: 'Musíte byť prihlásený pre vytvorenie kampane',
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
          status: 'pending', // Čaká na schválenie
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Úspech!',
        description: 'Kampaň bola vytvorená a čaká na schválenie adminom',
      });

      navigate(`/fundraising/medical/${data.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa vytvoriť kampaň',
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
        title: 'Chyba',
        description: 'Obrázok je príliš veľký (max 5MB)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Chyba',
          description: 'Musíte byť prihlásený',
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
        title: 'Úspech',
        description: 'Obrázok bol nahraný',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa nahrať obrázok',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/fundraising/medical')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na kampane
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">🏥 Vytvoriť Medical Fundraising kampaň</CardTitle>
            <CardDescription>
              Vytvorte kampaň pre pomoc s nákladmi na liečbu. Všetky kampane musia byť overené a schválené pred zverejnením.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Názov kampane *</Label>
                <Input
                  id="title"
                  placeholder="Napr. Pomoc pre Petra s liečbou rakoviny"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Krátky popis *</Label>
                <Textarea
                  id="description"
                  placeholder="Stručný popis kampane (max 200 znakov)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={200}
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/200 znakov
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Podrobný príbeh *</Label>
                <Textarea
                  id="story"
                  placeholder="Opíšte podrobne situáciu, zdravotný stav pacienta, potreby a prečo potrebujete pomoc..."
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Meno pacienta *</Label>
                  <Input
                    id="patient_name"
                    placeholder="Celé meno"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóza *</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Zdravotná diagnóza"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Nemocnica (voliteľné)</Label>
                <Input
                  id="hospital"
                  placeholder="Názov nemocnice alebo zdravotníckeho zariadenia"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_amount">Cieľová suma (€) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    placeholder="Napr. 5000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    min="100"
                    step="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimálna suma: 100€ • Poplatok platformy: 6%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ends_at">Koniec kampane (voliteľné)</Label>
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
                <Label htmlFor="image">Hlavný obrázok (voliteľné)</Label>
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
                      alt="Náhľad"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 5MB • JPG, PNG alebo WEBP
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ Dôležité informácie</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Všetky kampane musia byť overené administrátorom pred zverejnením</li>
                  <li>Budete musieť poskytnúť lekárske správy a dokumentáciu</li>
                  <li>Platforma si účtuje 6% poplatok z každého daru</li>
                  <li>Falošné kampane budú zablokované a nahlásené</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/fundraising/medical')}
                  className="flex-1"
                >
                  Zrušiť
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {creating ? 'Vytváram...' : 'Vytvoriť kampaň'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
