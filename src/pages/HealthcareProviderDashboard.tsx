import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useHealthcareSubscription } from "@/hooks/useHealthcareSubscription";
import { toast } from "sonner";
import { Heart, Plus, Download, Users, BarChart, Folder, FileText, Settings, Lock, Library, CalendarClock, Share2, CalendarPlus } from "lucide-react";
import { AppointmentsPanel } from "@/components/healthcare/AppointmentsPanel";
import { ReferralsPanel } from "@/components/healthcare/ReferralsPanel";
import { ManageBookingPanel } from "@/components/healthcare/ManageBookingPanel";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Collection {
  id: string;
  name: string;
  description: string;
  category: string;
  age_group: string;
  medical_specialty: string;
  page_count: number;
  created_at: string;
}

interface ColoringPage {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  therapeutic_purpose: string;
  download_count: number;
  created_at: string;
}

export default function HealthcareProviderDashboard() {
  const navigate = useNavigate();
  const { subscribed, subscription_tier, loading: subLoading } = useHealthcareSubscription();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    category: "anxiety",
    age_group: "",
    medical_specialty: ""
  });

  useEffect(() => {
    checkAccess();
  }, [subscribed, subLoading]);

  const checkAccess = async () => {
    if (subLoading) return;
    
    if (!subscribed) {
      toast.error("Active subscription required");
      navigate("/healthcare");
      return;
    }
    
    fetchCollections();
  };

  const fetchCollections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('healthcare_collections')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get healthcare profile
      const { data: profile } = await supabase
        .from('healthcare_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('healthcare_collections')
        .insert({
          provider_id: user.id,
          healthcare_profile_id: profile?.id,
          ...newCollection
        });

      if (error) throw error;

      toast.success("Collection created successfully");
      setShowCreateDialog(false);
      setNewCollection({
        name: "",
        description: "",
        category: "anxiety",
        age_group: "",
        medical_specialty: ""
      });
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error("Failed to create collection");
    }
  };

  if (loading || subLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingHowItWorks
        title="How Provider Dashboard works"
        steps={[
          { title: 'Verify credentials', description: 'Complete healthcare provider KYC.' },
          { title: 'Publish content', description: 'Add medically reviewed articles/videos.' },
          { title: 'Engage followers', description: 'Answer questions and grow reach.' },
          { title: 'Track earnings', description: 'See views, tips, and payouts in EUR.' },
        ]}
      />
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Healthcare Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your therapeutic coloring content</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {subscription_tier?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" onClick={() => navigate("/healthcare-library")}>
              <Library className="w-4 h-4 mr-2" />
              Content Library
            </Button>
            <Button onClick={() => navigate("/healthcare")}>
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collections.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collections.reduce((sum, col) => sum + col.page_count, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscription_tier || 'None'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collections.filter(c => 
                  new Date(c.created_at).getMonth() === new Date().getMonth()
                ).length} New
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="collections"><Folder className="w-4 h-4 mr-2" />Collections</TabsTrigger>
            <TabsTrigger value="appointments"><CalendarClock className="w-4 h-4 mr-2" />Appointments</TabsTrigger>
            <TabsTrigger value="referrals"><Share2 className="w-4 h-4 mr-2" />Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Collections</CardTitle>
                <CardDescription>Organize your therapeutic coloring pages by category</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                    <DialogDescription>
                      Organize your coloring pages into themed collections
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Collection Name</Label>
                      <Input
                        id="name"
                        value={newCollection.name}
                        onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                        placeholder="e.g., Anxiety Reduction for Children"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCollection.description}
                        onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                        placeholder="Describe the therapeutic purpose and target audience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Therapeutic Category</Label>
                      <Select 
                        value={newCollection.category}
                        onValueChange={(value) => setNewCollection({ ...newCollection, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anxiety">Anxiety Reduction</SelectItem>
                          <SelectItem value="pain">Pain Distraction</SelectItem>
                          <SelectItem value="emotional">Emotional Expression</SelectItem>
                          <SelectItem value="social">Social Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age_group">Age Group</Label>
                      <Select 
                        value={newCollection.age_group}
                        onValueChange={(value) => setNewCollection({ ...newCollection, age_group: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-3">Infant & Toddler (0-3)</SelectItem>
                          <SelectItem value="3-6">Preschool (3-6)</SelectItem>
                          <SelectItem value="6-12">School Age (6-12)</SelectItem>
                          <SelectItem value="13+">Teenagers (13+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Medical Specialty</Label>
                      <Input
                        id="specialty"
                        value={newCollection.medical_specialty}
                        onChange={(e) => setNewCollection({ ...newCollection, medical_specialty: e.target.value })}
                        placeholder="e.g., Pediatric, Dental, Therapy"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                    <Button onClick={createCollection} disabled={!newCollection.name}>
                      Create Collection
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to start organizing coloring pages
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Collection
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{collection.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {collection.age_group && `Ages ${collection.age_group} • `}
                            {collection.medical_specialty}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {collection.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {collection.page_count} pages
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => { window.location.href = `/healthcare-provider?collection=${collection.id}`; }}>
                          View Collection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card><CardContent className="p-6"><AppointmentsPanel /></CardContent></Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card><CardContent className="p-6"><ReferralsPanel /></CardContent></Card>
          </TabsContent>
        </Tabs>

      </div>

    </div>
    </>
  );
}

