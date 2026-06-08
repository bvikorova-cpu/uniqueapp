import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { HeroHero } from '@/components/fundraising/hero/HeroHero';
import { HeroStepsWizard } from '@/components/fundraising/hero/HeroStepsWizard';
import { HeroFilters } from '@/components/fundraising/hero/HeroFilters';
import { HeroCampaignCard } from '@/components/fundraising/hero/HeroCampaignCard';
import { CorporateSponsors } from '@/components/fundraising/hero/CorporateSponsors';
import { HeroSuccessStories } from '@/components/fundraising/hero/HeroSuccessStories';

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface HeroCampaign {
  id: string;
  title: string;
  description: string;
  hero_type: string;
  target_amount: number;
  current_amount: number;
  verified: boolean;
  organization_name: string;
  image_url: string;
  supporters_count: number;
  created_at: string;
}

export default function CommunityHero() {
  const [campaigns, setCampaigns] = useState<HeroCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('hero_campaigns' as any)
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('hero_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns((data as unknown as HeroCampaign[]) || []);
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
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'trending':
      case 'most_supporters':
        result.sort((a, b) => b.supporters_count - a.supporters_count);
        break;
      case 'almost_funded':
        result.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [campaigns, search, sort]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <HeroHero />
        <HeroRewardedAd sectionKey="page_communityhero" />

        <HeroStepsWizard />

        <div className="mt-12 space-y-6">
          <HeroFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12"><p className="text-muted-foreground">Loading campaigns...</p></div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-3">
                <p className="text-muted-foreground">No active campaigns found</p>
                <a href="/fundraising/hero/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">+ Nominate a Hero</a>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => <HeroCampaignCard key={campaign.id} campaign={campaign} />)
            )}
          </div>
        </div>

        <CorporateSponsors />
        <HeroSuccessStories />
      </div>
    </div>
  );
}
