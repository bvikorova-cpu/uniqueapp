import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { MedicalHero } from '@/components/fundraising/medical/MedicalHero';
import { MedicalStepsWizard } from '@/components/fundraising/medical/MedicalStepsWizard';
import { MedicalFilters, type DiagnosisFilter, type SortOption } from '@/components/fundraising/medical/MedicalFilters';
import { MedicalCampaignCard } from '@/components/fundraising/medical/MedicalCampaignCard';
import { MedicalSuccessStories } from '@/components/fundraising/medical/MedicalSuccessStories';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface MedicalCampaign {
  id: string;
  title: string;
  description: string;
  patient_name: string;
  diagnosis: string;
  hospital: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  verified: boolean;
  monthly_donors_count: number;
  one_time_donors_count: number;
  created_at: string;
  ends_at: string;
}

export default function MedicalFundraising() {
  const [campaigns, setCampaigns] = useState<MedicalCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState<DiagnosisFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_campaigns' as any)
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data as unknown as MedicalCampaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter & sort
  const filtered = campaigns
    .filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.diagnosis.toLowerCase().includes(q) && !c.patient_name.toLowerCase().includes(q)) return false;
      }
      if (diagnosis !== 'all') {
        const d = c.diagnosis.toLowerCase();
        if (diagnosis === 'cancer' && !d.includes('cancer')) return false;
        if (diagnosis === 'surgery' && !d.includes('surgery') && !d.includes('operation')) return false;
        if (diagnosis === 'rare-disease' && !d.includes('rare')) return false;
        if (diagnosis === 'transplant' && !d.includes('transplant')) return false;
        if (diagnosis === 'chronic' && !d.includes('chronic')) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'urgent') {
        const daysA = a.ends_at ? Math.ceil((new Date(a.ends_at).getTime() - Date.now()) / 86400000) : 999;
        const daysB = b.ends_at ? Math.ceil((new Date(b.ends_at).getTime() - Date.now()) / 86400000) : 999;
        return daysA - daysB;
      }
      if (sort === 'almost-funded') {
        return (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount);
      }
      if (sort === 'most-donors') {
        return (b.monthly_donors_count + b.one_time_donors_count) - (a.monthly_donors_count + a.one_time_donors_count);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <FloatingHowItWorks
        title="Medical Fundraising"
        intro="Help patients cover treatments, surgeries and medication."
        steps={[
          { title: "Browse cases", desc: "Verified patients with documented medical needs." },
          { title: "Read the story", desc: "Open a campaign to see diagnosis, goal and updates." },
          { title: "Donate any amount", desc: "Secure Stripe checkout in EUR, one-time or monthly." },
          { title: "Get a tax receipt", desc: "Emailed automatically after payment." },
          { title: "Create a campaign", desc: "Patients or families can apply \u2014 verification required." }
        ]}
      />
      <MedicalHero onCreateCampaign={() => navigate('/fundraising/medical/create')} />
      <HeroRewardedAd sectionKey="page_medicalfundraising" />


      <MedicalStepsWizard />

      <MedicalFilters
        search={search}
        onSearchChange={setSearch}
        diagnosis={diagnosis}
        onDiagnosisChange={setDiagnosis}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Campaigns grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="text-4xl block mb-3">🏥</span>
              <p className="text-muted-foreground mb-4">No active campaigns found</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button variant="outline" onClick={() => { setSearch(''); setDiagnosis('all'); }}>
                  Clear Filters
                </Button>
                <Button onClick={() => navigate('/fundraising/medical/create')}>+ Start Medical Campaign</Button>
              </div>
            </div>
          ) : (
            filtered.map((campaign, i) => (
              <MedicalCampaignCard
                key={campaign.id}
                campaign={campaign}
                index={i}
                onNavigate={(id) => navigate(`/fundraising/medical/${id}`)}
              />
            ))
          )}
        </div>
      </div>

      <MedicalSuccessStories />

      {/* CTA */}
      <section className="py-14 px-4 mt-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Need Help With Medical Bills?</h2>
          <p className="text-base text-white/90 mb-6">
            Create a verified campaign and let the community support you
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/fundraising/medical/create')} className="active:scale-[0.97]">
            <Sparkles className="mr-2 h-4 w-4" /> Start Your Campaign
          </Button>
        </div>
      </section>
    </div>
  );
}
