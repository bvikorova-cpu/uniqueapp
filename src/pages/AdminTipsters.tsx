import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, ArrowLeft } from "lucide-react";

interface Tipster {
  id: string;
  user_id: string;
  display_name: string;
  sport_specialization: string;
  bio: string;
  tip_price: number;
  subscription_price: number;
  status: string;
  created_at: string;
  avatar_url: string;
  badge: string;
  correct_predictions: number;
  followers_count: number;
  pending_payout: number;
  roi: number;
  stripe_account_id?: string | null;
  subscription_end?: string | null;
  total_earnings: number;
  total_predictions: number;
  updated_at: string;
  win_rate: number;
}

export default function AdminTipsters() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingTipsters, setPendingTipsters] = useState<Tipster[]>([]);
  const [activeTipsters, setActiveTipsters] = useState<Tipster[]>([]);
  const [rejectedTipsters, setRejectedTipsters] = useState<Tipster[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Access denied",
          description: "Please sign in to access admin panel",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: roleData } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (!roleData) {
        toast({
          title: "Access denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadTipsters();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const loadTipsters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sports_tipsters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const pending = data?.filter(t => t.status === "pending") || [];
      const active = data?.filter(t => t.status === "active") || [];
      const rejected = data?.filter(t => t.status === "rejected") || [];

      setPendingTipsters(pending);
      setActiveTipsters(active);
      setRejectedTipsters(rejected);
    } catch (error) {
      console.error("Error loading tipsters:", error);
      toast({
        title: "Error",
        description: "Failed to load tipsters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tipsterId: string) => {
    setActionLoading(tipsterId);
    try {
      const { error } = await supabase
        .from("sports_tipsters")
        .update({ status: "active" })
        .eq("id", tipsterId);

      if (error) throw error;

      toast({
        title: "Tipster approved",
        description: "The tipster can now publish predictions",
      });

      await loadTipsters();
    } catch (error) {
      console.error("Error approving tipster:", error);
      toast({
        title: "Error",
        description: "Failed to approve tipster",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tipsterId: string) => {
    setActionLoading(tipsterId);
    try {
      const { error } = await supabase
        .from("sports_tipsters")
        .update({ status: "rejected" })
        .eq("id", tipsterId);

      if (error) throw error;

      toast({
        title: "Tipster rejected",
        description: "The application has been rejected",
      });

      await loadTipsters();
    } catch (error) {
      console.error("Error rejecting tipster:", error);
      toast({
        title: "Error",
        description: "Failed to reject tipster",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const TipsterCard = ({ tipster, showActions }: { tipster: Tipster; showActions: boolean }) => (
    <Card key={tipster.id} className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{tipster.display_name}</h3>
          <p className="text-sm text-muted-foreground">{tipster.sport_specialization}</p>
        </div>
        <Badge variant={tipster.status === "active" ? "default" : tipster.status === "pending" ? "secondary" : "destructive"}>
          {tipster.status}
        </Badge>
      </div>
      
      {tipster.bio && (
        <p className="text-sm mb-4 text-muted-foreground">{tipster.bio}</p>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Tip Price:</span>
          <p className="font-semibold">€{tipster.tip_price}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Subscription:</span>
          <p className="font-semibold">€{tipster.subscription_price}/mo</p>
        </div>
        <div>
          <span className="text-muted-foreground">Applied:</span>
          <p className="font-semibold">{new Date(tipster.created_at).toLocaleDateString()}</p>
        </div>
        {tipster.subscription_end && (
          <div>
            <span className="text-muted-foreground">Sub. End:</span>
            <p className="font-semibold">{new Date(tipster.subscription_end).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleApprove(tipster.id)}
            disabled={actionLoading === tipster.id}
            className="flex-1"
          >
            {actionLoading === tipster.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </>
            )}
          </Button>
          <Button
            onClick={() => handleReject(tipster.id)}
            disabled={actionLoading === tipster.id}
            variant="destructive"
            className="flex-1"
          >
            {actionLoading === tipster.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tipster Management</h1>
            <p className="text-muted-foreground">Review and manage tipster applications</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending">
              Pending ({pendingTipsters.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeTipsters.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedTipsters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTipsters.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending applications</p>
              </Card>
            ) : (
              pendingTipsters.map((tipster) => (
                <TipsterCard key={tipster.id} tipster={tipster} showActions={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTipsters.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No active tipsters</p>
              </Card>
            ) : (
              activeTipsters.map((tipster) => (
                <TipsterCard key={tipster.id} tipster={tipster} showActions={false} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedTipsters.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No rejected applications</p>
              </Card>
            ) : (
              rejectedTipsters.map((tipster) => (
                <TipsterCard key={tipster.id} tipster={tipster} showActions={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
