import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const supportTypeLabels: Record<string, string> = {
  tuition: '🎓 Tuition',
  books: '📚 Books',
  course: '💻 Course',
  equipment: '🔬 Equipment',
  other: '📖 Other',
};

export default function StudentSupport() {
  const [campaigns, setCampaigns] = useState<StudentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('student_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('support_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCampaigns(data || []);
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

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">
            🎓 Student Support Circle
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Students helping students achieve their educational goals
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/student/create')}
            className="bg-gradient-to-r from-secondary to-secondary/80"
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Request Support
          </Button>
        </div>

        <Alert className="mb-8 border-secondary/20 bg-secondary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p className="font-semibold">How Student Support Circle Works:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Request Support:</strong> Students can create campaigns for tuition, books, courses, equipment, or other educational needs.</li>
                <li><strong>Pay It Forward:</strong> Commit to supporting future students once financially stable - building a sustainable support ecosystem.</li>
                <li><strong>School Verification:</strong> Include school/institution details. Verified educational institutions receive higher visibility.</li>
                <li><strong>Platform Fee:</strong> Only 5% fee. 95% goes directly to student's educational expenses.</li>
                <li><strong>Impact Tracking:</strong> Share academic progress and achievements with supporters.</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Categories
          </Button>
          {Object.entries(supportTypeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No active campaigns</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {campaign.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">
                        {supportTypeLabels[campaign.support_type]}
                      </Badge>
                      {campaign.pay_it_forward && (
                        <Badge variant="outline" className="text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Pay Forward
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {campaign.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">
                        €{campaign.current_amount.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        of €{campaign.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                  </div>
                  
                  <div className="space-y-1 text-sm pt-2 border-t">
                    <p><strong>School:</strong> {campaign.school_name}</p>
                    <p><strong>Field:</strong> {campaign.field_of_study}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.supporters_count} supporters</span>
                      {campaign.pay_it_forward && (
                        <Badge variant="outline" className="ml-auto">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Pay it Forward
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/student/${campaign.id}`)}
                  >
                    Support Student
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
