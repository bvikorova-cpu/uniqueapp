import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StudentHero } from '@/components/fundraising/student/StudentHero';
import { StudentStepsWizard } from '@/components/fundraising/student/StudentStepsWizard';
import { StudentFilters } from '@/components/fundraising/student/StudentFilters';
import { StudentCampaignCard } from '@/components/fundraising/student/StudentCampaignCard';
import { UniversityPartners } from '@/components/fundraising/student/UniversityPartners';
import { StudentSuccessStories } from '@/components/fundraising/student/StudentSuccessStories';
import { PayItForwardBoard } from '@/components/fundraising/student/PayItForwardBoard';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface StudentCampaign {
  id: string;
  title: string;
  description: string;
  support_type: string;
  target_amount: number;
  current_amount: number;
  school_name: string;
  field_of_study: string;
  image_url: string;
  supporters_count: number;
  pay_it_forward: boolean;
  created_at: string;
}

export default function StudentSupport() {
  const [campaigns, setCampaigns] = useState<StudentCampaign[]>([]);
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
        .from('student_campaigns' as any)
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('support_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns((data as unknown as StudentCampaign[]) || []);
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
        c.school_name.toLowerCase().includes(q) || c.field_of_study.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'almost_funded':
        result.sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount));
        break;
      case 'most_supporters':
        result.sort((a, b) => b.supporters_count - a.supporters_count);
        break;
      case 'pay_forward':
        result.sort((a, b) => (b.pay_it_forward ? 1 : 0) - (a.pay_it_forward ? 1 : 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [campaigns, search, sort]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <FloatingHowItWorks
        title="Student Support"
        intro="Help students cover tuition, books and living costs."
        steps={[
          { title: "Browse student stories", desc: "Verified students with academic records." },
          { title: "Fund tuition or supplies", desc: "Donate any amount toward their goal." },
          { title: "Track their studies", desc: "Students post grades, milestones and thanks." },
          { title: "Tax-deductible receipts", desc: "Emailed after payment where applicable." },
          { title: "Apply as a student", desc: "Requires school confirmation and clear budget." }
        ]}
      />
      <div className="max-w-7xl mx-auto">
        <StudentHero />
        <HeroRewardedAd sectionKey="page_studentsupport" />

        <StudentStepsWizard />

        <div id="campaigns" className="mt-12 space-y-6">
          <StudentFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12"><p className="text-muted-foreground">Loading campaigns...</p></div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 space-y-3">
                <p className="text-muted-foreground">No active campaigns found</p>
                <a href="/fundraising/student/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">+ Apply for Support</a>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => <StudentCampaignCard key={campaign.id} campaign={campaign} />)
            )}
          </div>
        </div>

        <UniversityPartners />
        <PayItForwardBoard />
        <StudentSuccessStories />
      </div>
    </div>
  );
}
