import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TalentHero } from '@/components/fundraising/talent/TalentHero';
import { TalentStepsWizard } from '@/components/fundraising/talent/TalentStepsWizard';
import { TalentFilters } from '@/components/fundraising/talent/TalentFilters';
import { TalentCampaignCard } from '@/components/fundraising/talent/TalentCampaignCard';
import { TalentSuccessStories } from '@/components/fundraising/talent/TalentSuccessStories';

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface TalentCampaign {
  id: string;
  title: string;
  description: string;
  talent_type: string;
  target_amount: number;
  current_amount: number;
  portfolio_url: string;
  achievements: string[];
  goals: string[];
  images: string[];
  sponsors_count: number;
  premium_subscriber: boolean;
  created_at: string;
}

export default function TalentSponsorship() {
  const [campaigns, setCampaigns] = useState<TalentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('talent_campaigns' as any)
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('premium_subscriber', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('talent_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns((data as unknown as TalentCampaign[]) || []);
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
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) ||
        (c.achievements || []).some(a => a.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case 'featured':
        result.sort((a, b) => (b.premium_subscriber ? 1 : 0) - (a.premium_subscriber ? 1 : 0));
        break;
      case 'almost_funded':
        result.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount));
        break;
      case 'most_sponsors':
        result.sort((a, b) => b.sponsors_count - a.sponsors_count);
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [campaigns, search, sort]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <TalentHero />
        <HeroRewardedAd sectionKey="page_talentsponsorship" />

        <TalentStepsWizard />

        <div id="campaigns" className="mt-12 space-y-6">
          <TalentFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12"><p className="text-muted-foreground">Loading talents...</p></div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-3">
                <p className="text-muted-foreground">No active talent campaigns found</p>
                <a href="/fundraising/talent/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">+ Apply as Talent</a>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => <TalentCampaignCard key={campaign.id} campaign={campaign} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
