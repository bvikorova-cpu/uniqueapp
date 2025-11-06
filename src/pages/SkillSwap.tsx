import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSkillSwap } from "@/hooks/useSkillSwap";
import { ArrowLeftRight, Globe, Video, Users, CheckCircle } from "lucide-react";

interface SkillOffering {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  profiles?: {
    full_name: string;
  };
}

export default function SkillSwap() {
  const navigate = useNavigate();
  const { subscription, loading, createCheckout } = useSkillSwap();
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOffering, setNewOffering] = useState({
    title: "",
    description: "",
    category: "teaching",
  });

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    const { data, error } = await supabase
      .from('skill_offerings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching offerings:', error);
    } else {
      setOfferings(data || []);
    }
  };

  const handleSubscribe = async () => {
    const url = await createCheckout();
    if (url) {
      window.location.href = url;
    }
  };

  const handleAddOffering = async () => {
    if (!newOffering.title || !newOffering.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    const { error } = await supabase.from('skill_offerings').insert([
      {
        user_id: session.user.id,
        title: newOffering.title,
        description: newOffering.description,
        category: newOffering.category as any,
        is_active: true,
      },
    ]);

    if (error) {
      toast.error("Failed to add skill offering");
      console.error(error);
    } else {
      toast.success("Skill offering added successfully!");
      setShowAddForm(false);
      setNewOffering({
        title: "",
        description: "",
        category: "teaching",
      });
      fetchOfferings();
    }
  };

  const handleRequestExchange = async (offeringId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    if (!subscription.hasSubscription) {
      toast.error("Premium subscription required for exchanges");
      return;
    }

    toast.success("Exchange request sent! Check your messages.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ArrowLeftRight className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Global Skill Swap
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exchange skills without money. Learn guitar, teach cooking. Join the global marketplace.
          </p>
        </div>

        {/* Premium Features */}
        {!subscription.hasSubscription && (
          <Card className="p-8 mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Unlock Premium Features</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <Globe className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Global Exchanges</h3>
                  <p className="text-sm text-muted-foreground">Connect with users worldwide</p>
                </div>
                <div className="flex flex-col items-center">
                  <Video className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Video Lessons</h3>
                  <p className="text-sm text-muted-foreground">Learn through video calls</p>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Unlimited Swaps</h3>
                  <p className="text-sm text-muted-foreground">No limits on exchanges</p>
                </div>
              </div>
              <div className="text-3xl font-bold mb-4">€4.99<span className="text-lg text-muted-foreground">/month</span></div>
              <Button onClick={handleSubscribe} size="lg" className="px-8">
                Subscribe Now
              </Button>
            </div>
          </Card>
        )}

        {/* Active Subscription */}
        {subscription.hasSubscription && (
          <Card className="p-6 mb-8 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Premium Active</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.subscriptionEnd && `Valid until ${new Date(subscription.subscriptionEnd).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Add Skill Offering */}
        <div className="mb-8">
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full md:w-auto">
              Offer Your Skill
            </Button>
          ) : (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Add Your Skill Offering</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Skill Title</label>
                  <Input
                    placeholder="e.g., Guitar Lessons"
                    value={newOffering.title}
                    onChange={(e) => setNewOffering({ ...newOffering, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe what you can teach..."
                    value={newOffering.description}
                    onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newOffering.category}
                    onChange={(e) => setNewOffering({ ...newOffering, category: e.target.value })}
                  >
                    <option value="teaching">Teaching</option>
                    <option value="technology">Technology</option>
                    <option value="creative">Creative</option>
                    <option value="repairs">Repairs</option>
                    <option value="construction">Construction</option>
                    <option value="gardening">Gardening</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddOffering}>Add Offering</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Skill Offerings Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Skills</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((offering) => (
              <Card key={offering.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{offering.title}</h3>
                  <Badge variant="secondary">{offering.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {offering.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Posted by user
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleRequestExchange(offering.id)}
                    disabled={!subscription.hasSubscription}
                  >
                    Request Exchange
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {offerings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No skill offerings yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}