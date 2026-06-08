import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CrisisHero } from '@/components/fundraising/crisis/CrisisHero';
import { CrisisStepsWizard } from '@/components/fundraising/crisis/CrisisStepsWizard';
import { CrisisFilters } from '@/components/fundraising/crisis/CrisisFilters';
import { CrisisCampaignCard } from '@/components/fundraising/crisis/CrisisCampaignCard';
import { CrisisImpactTicker } from '@/components/fundraising/crisis/CrisisImpactTicker';
import { CrisisZoneOverview } from '@/components/fundraising/crisis/CrisisZoneOverview';
import { ResolvedEmergencies } from '@/components/fundraising/crisis/ResolvedEmergencies';

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface CrisisCampaign {
  id: string;
  crisis_type: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  verified: boolean;
  urgent: boolean;
  location: string;
  images: string[];
  supporters_count: number;
  created_at: string;
  expires_at: string;
}

export default function CrisisRelief() {
  const [campaigns, setCampaigns] = useState<CrisisCampaign[]>([]);
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
        .from('crisis_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('crisis_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns(data || []);
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
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'urgent_first':
        result.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
        break;
      case 'expiring_soon':
        result.sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime());
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
        <CrisisHero />
        <HeroRewardedAd sectionKey="page_crisisrelief" />

        <CrisisImpactTicker />
        <CrisisZoneOverview />

        <CrisisStepsWizard />

        <div id="campaigns" className="mt-8 space-y-6">
          <CrisisFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12"><p className="text-muted-foreground">Loading campaigns...</p></div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-3">
                <p className="text-muted-foreground">No active emergencies found</p>
                <a href="/fundraising/crisis/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">+ Report Crisis</a>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => <CrisisCampaignCard key={campaign.id} campaign={campaign} />)
            )}
          </div>
        </div>

        <ResolvedEmergencies />
      </div>
    </div>
  );
}
