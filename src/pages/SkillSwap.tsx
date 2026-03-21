import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSkillSwap } from "@/hooks/useSkillSwap";
import { SkillSwapMessages } from "@/components/skill-swap/SkillSwapMessages";
import { SkillMatches } from "@/components/skill-swap/SkillMatches";
import { ArrowLeftRight, Globe, Video, Users, CheckCircle, MessageSquare, Star, Sparkles, Filter, X, Search, Upload, Image as ImageIcon, Edit, Trash2, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SkillOffering {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  image_url?: string;
  profiles?: {
    full_name: string;
    rating_average: number;
    total_reviews: number;
    completed_exchanges: number;
    location?: string;
  };
}

export default function SkillSwap() {
  const navigate = useNavigate();
  const { subscription, loading, createCheckout } = useSkillSwap();
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "all",
    minRating: "0",
    location: "",
    ownership: "all", // "all", "mine", "others"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [newOffering, setNewOffering] = useState({
    title: "",
    description: "",
    category: "teaching",
  });
  const [editOffering, setEditOffering] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    image_url?: string;
  } | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [removeMedia, setRemoveMedia] = useState(false);

  const clearFilters = () => {
    setFilters({
      category: "all",
      minRating: "0",
      location: "",
      ownership: "all",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.category !== "all" || filters.minRating !== "0" || filters.location !== "" || filters.ownership !== "all";

  const fetchOfferings = async () => {
    let query = supabase
      .from('skill_offerings')
      .select('*')
      .eq('is_active', true);

    // Apply category filter
    if (filters.category !== "all") {
      query = query.eq('category', filters.category as any);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching offerings:', error);
      setOfferings([]);
      return;
    }

    // Fetch profiles for all users
    const userIds = data?.map(o => o.user_id) || [];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, rating_average, total_reviews, completed_exchanges, location')
      .in('id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    let offeringsWithProfiles = (data || []).map(offering => ({
      ...offering,
      profiles: profilesMap.get(offering.user_id) || undefined
    }));

    // Store total count before filtering
    setTotalOfferings(offeringsWithProfiles.length);

    // Apply client-side filters
    const minRating = parseFloat(filters.minRating);
    if (minRating > 0) {
      offeringsWithProfiles = offeringsWithProfiles.filter(
        o => (o.profiles?.rating_average || 0) >= minRating
      );
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      offeringsWithProfiles = offeringsWithProfiles.filter(
        o => o.profiles?.location?.toLowerCase().includes(locationLower)
      );
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      offeringsWithProfiles = offeringsWithProfiles.filter(
        o => o.title.toLowerCase().includes(queryLower) || 
             o.description.toLowerCase().includes(queryLower)
      );
    }

    // Apply ownership filter
    if (filters.ownership !== "all" && currentUserId) {
      if (filters.ownership === "mine") {
        offeringsWithProfiles = offeringsWithProfiles.filter(
          o => o.user_id === currentUserId
        );
      } else if (filters.ownership === "others") {
        offeringsWithProfiles = offeringsWithProfiles.filter(
          o => o.user_id !== currentUserId
        );
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "rating_desc":
        offeringsWithProfiles.sort((a, b) => 
          (b.profiles?.rating_average || 0) - (a.profiles?.rating_average || 0)
        );
        break;
      case "rating_asc":
        offeringsWithProfiles.sort((a, b) => 
          (a.profiles?.rating_average || 0) - (b.profiles?.rating_average || 0)
        );
        break;
      case "exchanges_desc":
        offeringsWithProfiles.sort((a, b) => 
          (b.profiles?.completed_exchanges || 0) - (a.profiles?.completed_exchanges || 0)
        );
        break;
      case "exchanges_asc":
        offeringsWithProfiles.sort((a, b) => 
          (a.profiles?.completed_exchanges || 0) - (b.profiles?.completed_exchanges || 0)
        );
        break;
      case "date_asc":
        offeringsWithProfiles.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "date_desc":
      default:
        // Already sorted by created_at desc from query
        break;
    }

    setOfferings(offeringsWithProfiles);
  };

  useEffect(() => {
    fetchOfferings();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortBy, searchQuery]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    checkUser();
  }, []);

  const handleSubscribe = async () => {
    const url = await createCheckout();
    if (url) {
      window.location.href = url;
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image or video file");
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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

    setUploading(true);
    let mediaUrl = null;

    try {
      // Upload media if provided
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('media')
          .upload(fileName, mediaFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
      }

      // Insert offering
      const { error } = await supabase.from('skill_offerings').insert([
        {
          user_id: session.user.id,
          title: newOffering.title,
          description: newOffering.description,
          category: newOffering.category as any,
          is_active: true,
          image_url: mediaUrl,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("Skill offering added successfully!");
      setShowAddForm(false);
      setNewOffering({
        title: "",
        description: "",
        category: "teaching",
      });
      setMediaFile(null);
      setMediaPreview("");
      fetchOfferings();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to add skill offering");
    } finally {
      setUploading(false);
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

    // Get the offering to find the owner
    const { data: offering } = await supabase
      .from('skill_offerings')
      .select('user_id')
      .eq('id', offeringId)
      .single();

    if (!offering) {
      toast.error("Offering not found");
      return;
    }

    // Create or get conversation
    const { data: existingConv } = await supabase
      .from('skill_swap_conversations')
      .select('id')
      .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${offering.user_id}),and(user1_id.eq.${offering.user_id},user2_id.eq.${session.user.id})`)
      .eq('offering_id', offeringId)
      .maybeSingle();

    if (!existingConv) {
      await supabase.from('skill_swap_conversations').insert([
        {
          user1_id: session.user.id,
          user2_id: offering.user_id,
          offering_id: offeringId,
        },
      ]);
    }

    toast.success("Conversation started! Check the Messages tab.");
  };

  const handleEditClick = (offering: SkillOffering) => {
    setEditOffering({
      id: offering.id,
      title: offering.title,
      description: offering.description,
      category: offering.category,
      image_url: offering.image_url,
    });
    setMediaPreview(offering.image_url || "");
    setRemoveMedia(false);
    setShowEditDialog(true);
  };

  const handleUpdateOffering = async () => {
    if (!editOffering || !editOffering.title || !editOffering.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in first");
      return;
    }

    setUploading(true);
    let mediaUrl = editOffering.image_url;

    try {
      // Handle media removal
      if (removeMedia && editOffering.image_url) {
        const urlParts = editOffering.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/');
        await supabase.storage.from('media').remove([fileName]);
        mediaUrl = null;
      }

      // Upload new media if provided
      if (mediaFile) {
        // Remove old media if exists
        if (editOffering.image_url) {
          const urlParts = editOffering.image_url.split('/');
          const fileName = urlParts.slice(-2).join('/');
          await supabase.storage.from('media').remove([fileName]);
        }

        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
      }

      // Update offering
      const { error } = await supabase
        .from('skill_offerings')
        .update({
          title: editOffering.title,
          description: editOffering.description,
          category: editOffering.category as any,
          image_url: mediaUrl,
        })
        .eq('id', editOffering.id);

      if (error) throw error;

      toast.success("Skill offering updated successfully!");
      setShowEditDialog(false);
      setEditOffering(null);
      setMediaFile(null);
      setMediaPreview("");
      setRemoveMedia(false);
      fetchOfferings();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update skill offering");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteOffering = async (offeringId: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this offering?")) return;

    try {
      // Delete media if exists
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts.slice(-2).join('/');
        await supabase.storage.from('media').remove([fileName]);
      }

      const { error } = await supabase
        .from('skill_offerings')
        .delete()
        .eq('id', offeringId);

      if (error) throw error;

      toast.success("Skill offering deleted successfully!");
      fetchOfferings();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete skill offering");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 relative">
          {/* Notification Bell and Dashboard Link - Top Right */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/skill-swap/dashboard')}
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <ArrowLeftRight className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Global Skill Swap
            </h1>
          </div>
          
          <p className="text-2xl font-semibold text-foreground mb-4 max-w-3xl mx-auto">
            The Revolutionary Platform for Skill Exchange Without Money
          </p>
          
          <div className="max-w-4xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              Welcome to Global Skill Swap - where knowledge meets opportunity. Our platform connects people worldwide who want to exchange skills without traditional payment. Whether you're a guitar virtuoso looking to learn web development, or a chef wanting to master photography, you'll find the perfect exchange partner here.
            </p>
            
            <p>
              How it works: Simply create a skill offering describing what you can teach, browse through hundreds of available skills from our global community, and request exchanges that interest you. Connect through our real-time messaging system, schedule video lessons, and start learning from experts around the world - all without spending a cent.
            </p>
            
            <p className="font-medium text-foreground">
              Join thousands of learners exchanging skills in categories like teaching, technology, creative arts, repairs, construction, gardening, and more. Your next skill is just an exchange away!
            </p>
          </div>
        </div>

        {/* Premium Features */}
        {!subscription.hasSubscription && (
          <Card className="p-8 mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <div className="text-center">
              <h2 className="text-2xl font-black mb-4">Unlock Premium Features</h2>
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
              <div className="text-3xl font-black mb-4">€4.99<span className="text-lg text-muted-foreground">/month</span></div>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Browse Skills
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Suggested Matches
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <SkillMatches />
          </TabsContent>

          <TabsContent value="browse">
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Media (Optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('media-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image or Video
                      </Button>
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleMediaChange}
                      />
                    </div>
                    {mediaPreview && (
                      <div className="relative">
                        {mediaFile?.type.startsWith('video/') ? (
                          <video
                            src={mediaPreview}
                            className="w-full max-h-64 rounded-lg object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full max-h-64 rounded-lg object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setMediaFile(null);
                            setMediaPreview("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddOffering} disabled={uploading}>
                    {uploading ? "Uploading..." : "Add Offering"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

            {/* Skill Offerings Grid */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Available Skills</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Showing {offerings.length} of {totalOfferings} skills
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">Sort by:</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">Newest First</SelectItem>
                        <SelectItem value="date_asc">Oldest First</SelectItem>
                        <SelectItem value="rating_desc">Highest Rated</SelectItem>
                        <SelectItem value="rating_asc">Lowest Rated</SelectItem>
                        <SelectItem value="exchanges_desc">Most Exchanges</SelectItem>
                        <SelectItem value="exchanges_asc">Least Exchanges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1">
                        Active
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <Card className="p-6 mb-6 border-primary/20">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ownership</label>
                      <Select
                        value={filters.ownership}
                        onValueChange={(value) => setFilters({ ...filters, ownership: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Offerings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Offerings</SelectItem>
                          <SelectItem value="mine">My Offerings</SelectItem>
                          <SelectItem value="others">Others' Offerings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters({ ...filters, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="teaching">Teaching</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="repairs">Repairs</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="gardening">Gardening</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                      <Select
                        value={filters.minRating}
                        onValueChange={(value) => setFilters({ ...filters, minRating: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Input
                        placeholder="Search by location..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Showing {offerings.length} skill offering{offerings.length !== 1 ? 's' : ''}
                  </div>
                </Card>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offerings
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((offering) => (
                  <Card key={offering.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {offering.image_url && (
                      <div className="relative w-full h-48">
                        {offering.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={offering.image_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={offering.image_url}
                            alt={offering.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold">{offering.title}</h3>
                        <Badge variant="secondary">{offering.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {offering.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <button
                            onClick={() => navigate(`/skill-swap/profile/${offering.user_id}`)}
                            className="text-sm text-primary hover:underline mb-1"
                          >
                            {offering.profiles?.full_name || 'User'}
                          </button>
                          {offering.profiles && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{offering.profiles.rating_average.toFixed(1)}</span>
                                  <span className="text-muted-foreground">({offering.profiles.total_reviews})</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">
                                  {offering.profiles.completed_exchanges} exchanges
                                </span>
                              </div>
                              {offering.profiles.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Globe className="w-3 h-3" />
                                  <span>{offering.profiles.location}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {currentUserId === offering.user_id ? (
                            <>
                              <Button
                                onClick={() => handleEditClick(offering)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteOffering(offering.id, offering.image_url)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRequestExchange(offering.id)}
                              disabled={!subscription.hasSubscription}
                            >
                              Request Exchange
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {offerings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No skill offerings yet. Be the first to add one!</p>
                </div>
              )}

              {/* Pagination */}
              {offerings.length > itemsPerPage && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.ceil(offerings.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(offerings.length / itemsPerPage);
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          if (index > 0 && array[index - 1] !== page - 1) {
                            return (
                              <>
                                <PaginationItem key={`ellipsis-${page}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(Math.ceil(offerings.length / itemsPerPage), currentPage + 1))}
                          className={currentPage === Math.ceil(offerings.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <SkillSwapMessages />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Skill Offering</DialogTitle>
            </DialogHeader>
            {editOffering && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="e.g., Web Development Lessons"
                    value={editOffering.title}
                    onChange={(e) => setEditOffering({ ...editOffering, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe what you can teach or help with..."
                    value={editOffering.description}
                    onChange={(e) => setEditOffering({ ...editOffering, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={editOffering.category}
                    onValueChange={(value) => setEditOffering({ ...editOffering, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="repairs">Repairs</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="gardening">Gardening</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Media (Image or Video)</label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="cursor-pointer"
                    />
                    {(mediaPreview || editOffering.image_url) && !removeMedia && (
                      <div className="relative">
                        {mediaPreview.match(/\.(mp4|webm|ogg)$/i) || editOffering.image_url?.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={mediaPreview || editOffering.image_url}
                            className="w-full max-h-64 rounded-lg object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={mediaPreview || editOffering.image_url}
                            alt="Preview"
                            className="w-full max-h-64 rounded-lg object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setMediaFile(null);
                            setMediaPreview("");
                            setRemoveMedia(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleUpdateOffering} disabled={uploading}>
                    {uploading ? "Updating..." : "Update Offering"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditOffering(null);
                      setMediaFile(null);
                      setMediaPreview("");
                      setRemoveMedia(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}