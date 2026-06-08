import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PetHero } from '@/components/fundraising/pet/PetHero';
import { PetStepsWizard } from '@/components/fundraising/pet/PetStepsWizard';
import { PetFilters } from '@/components/fundraising/pet/PetFilters';
import { PetCampaignCard } from '@/components/fundraising/pet/PetCampaignCard';
import { VerifiedShelters } from '@/components/fundraising/pet/VerifiedShelters';
import { PetSuccessStories } from '@/components/fundraising/pet/PetSuccessStories';

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface PetCampaign {
  id: string;
  pet_name: string;
  pet_type: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  urgent: boolean;
  medical_condition: string;
  shelter_name: string;
  images: string[];
  supporters_count: number;
  created_at: string;
}

export default function PetRescue() {
  const [campaigns, setCampaigns] = useState<PetCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('urgent_first');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('pet_rescue_campaigns' as any)
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all' && filter !== 'urgent') {
        query = query.eq('pet_type', filter);
      } else if (filter === 'urgent') {
        query = query.eq('urgent', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns((data as unknown as PetCampaign[]) || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({ title: 'Error', description: 'Failed to load campaigns', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.pet_name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.medical_condition.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'urgent_first':
        result.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
        break;
      case 'almost_funded':
        result.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount));
        break;
      case 'most_supporters':
        result.sort((a, b) => b.supporters_count - a.supporters_count);
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [campaigns, search, sort]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <PetHero />
        <HeroRewardedAd sectionKey="page_petrescue" />

        <PetStepsWizard />

        <div className="mt-12 space-y-6">
          <PetFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12"><p className="text-muted-foreground">Loading campaigns...</p></div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-3">
                <p className="text-muted-foreground">No active campaigns found</p>
                <a href="/fundraising/pet/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">+ Rescue a Pet</a>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => <PetCampaignCard key={campaign.id} campaign={campaign} />)
            )}
          </div>
        </div>

        <VerifiedShelters />
        <PetSuccessStories />
      </div>
    </div>
  );
}
