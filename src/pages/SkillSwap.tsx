import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSkillSwap } from "@/hooks/useSkillSwap";
import { SkillSwapMessages } from "@/components/skill-swap/SkillSwapMessages";
import { SkillMatches } from "@/components/skill-swap/SkillMatches";
import { SkillSwapHero } from "@/components/skill-swap/SkillSwapHero";
import { SkillSwapStreak } from "@/components/skill-swap/SkillSwapStreak";
import { SkillSwapProgress } from "@/components/skill-swap/SkillSwapProgress";
import { SkillSwapAchievements } from "@/components/skill-swap/SkillSwapAchievements";
import { SkillSwapParityPack } from "@/components/skill-swap/SkillSwapParityPack";
import { SkillSwapToolCard } from "@/components/skill-swap/SkillSwapToolCard";
import { SkillSwapTestimonials } from "@/components/skill-swap/SkillSwapTestimonials";
import { SkillMap } from "@/components/skill-swap/SkillMap";
import { AISkillAdvisor } from "@/components/skill-swap/AISkillAdvisor";
import { LearningProgressTracker } from "@/components/skill-swap/LearningProgressTracker";
import { RecordedLessons } from "@/components/skill-swap/RecordedLessons";
import { SwapLeaderboard } from "@/components/skill-swap/SwapLeaderboard";
import { SessionScheduler } from "@/components/skill-swap/SessionScheduler";
import { AISkillValuationView } from "@/components/skill-swap/views/AISkillValuationView";
import { LiveSkillDemoView } from "@/components/skill-swap/views/LiveSkillDemoView";
import { SkillCertificationView } from "@/components/skill-swap/views/SkillCertificationView";
import { GroupWorkshopsView } from "@/components/skill-swap/views/GroupWorkshopsView";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Globe, Video, Users, CheckCircle, MessageSquare, Star,
  Sparkles, Filter, X, Search, Upload, Edit, Trash2, LayoutDashboard,
  ArrowLeft, Lock, Check, UserPlus, BookOpen, Shield, Zap, Award, CalendarDays,
  TrendingUp, Radio, ShieldCheck, UsersRound
} from "lucide-react";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface SkillOffering {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    rating_average: number;
    total_reviews: number;
    completed_exchanges: number;
    location?: string;
  };
}

type ViewType = "hub" | "browse" | "matches" | "messages" | "add" | "skillmap" | "advisor" | "progress" | "lessons" | "leaderboard" | "scheduler" | "valuation" | "demo" | "certification" | "workshops";

const SWAP_TOOLS = [
  {
    id: "browse",
    title: "Browse Skills",
    description: "Explore hundreds of skill offerings from our global community",
    icon: Globe,
    badge: "Free",
    gradient: "bg-gradient-to-r from-primary to-accent",
    features: ["Filter by category", "Search by keyword", "Sort by rating", "Location-based"],
  },
  {
    id: "matches",
    title: "Suggested Matches",
    description: "AI-powered matches based on your skills and preferences",
    icon: Sparkles,
    badge: "Premium",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: ["Smart matching algorithm", "Compatibility score", "One-click connect", "Auto-suggestions"],
  },
  {
    id: "messages",
    title: "Messages",
    description: "Chat with exchange partners and arrange skill swap sessions",
    icon: MessageSquare,
    badge: "Real-time",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    features: ["Real-time messaging", "Video call support", "Exchange completion", "Review system"],
  },
  {
    id: "add",
    title: "Offer Your Skill",
    description: "List a new skill you can teach and start getting requests",
    icon: UserPlus,
    badge: "Create",
    gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
    features: ["Media upload support", "Category selection", "Custom description", "Instant publishing"],
  },
  {
    id: "skillmap",
    title: "Skill Map",
    description: "Interactive world map showing swappers across the globe",
    icon: Globe,
    badge: "New",
    gradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
    features: ["Global visualization", "Filter by continent", "Connect instantly", "Location-based"],
  },
  {
    id: "advisor",
    title: "AI Skill Advisor",
    description: "AI chatbot recommending skills to learn based on market trends",
    icon: Sparkles,
    badge: "AI",
    gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
    features: ["Market analysis", "Personalized advice", "Trending skills", "Career paths"],
  },
  {
    id: "progress",
    title: "Learning Progress",
    description: "Track your learning journey with milestones and goals",
    icon: BookOpen,
    badge: "Track",
    gradient: "bg-gradient-to-r from-green-500 to-emerald-500",
    features: ["Milestone tracking", "Hours logged", "Progress bars", "Goal setting"],
  },
  {
    id: "lessons",
    title: "Lesson Library",
    description: "Watch recorded lessons from top-rated skill swappers",
    icon: Video,
    badge: "Video",
    gradient: "bg-gradient-to-r from-red-500 to-rose-500",
    features: ["HD recordings", "Multi-category", "Expert instructors", "Free & premium"],
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    description: "See the most active and top-rated swappers worldwide",
    icon: Award,
    badge: "Rank",
    gradient: "bg-gradient-to-r from-yellow-500 to-amber-500",
    features: ["Global rankings", "Multiple metrics", "Weekly updates", "Achievement badges"],
  },
  {
    id: "scheduler",
    title: "Session Scheduler",
    description: "Plan and manage your exchange sessions with a calendar",
    icon: CalendarDays,
    badge: "Plan",
    gradient: "bg-gradient-to-r from-indigo-500 to-blue-500",
    features: ["Calendar view", "Video call links", "Reminders", "Session history"],
  },
  {
    id: "valuation",
    title: "AI Skill Valuation",
    description: "AI-powered market value analysis for your skills",
    icon: TrendingUp,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: ["Market value score", "Demand analysis", "Exchange rate", "Trend insights"],
  },
  {
    id: "demo",
    title: "Live Skill Demo",
    description: "Generate professional demo scripts to showcase skills",
    icon: Radio,
    badge: "3 CR",
    gradient: "bg-gradient-to-r from-rose-500 to-pink-500",
    features: ["Presentation scripts", "Audience engagement", "Tech setup guide", "Demo plans"],
  },
  {
    id: "certification",
    title: "Skill Certification",
    description: "AI assessment and digital certification for your skills",
    icon: ShieldCheck,
    badge: "5 CR",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
    features: ["Proficiency scoring", "Digital badges", "Detailed feedback", "Learning path"],
  },
  {
    id: "workshops",
    title: "Group Workshops",
    description: "AI-designed group workshop plans for teaching multiple learners",
    icon: UsersRound,
    badge: "4 CR",
    gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
    features: ["Curriculum design", "Group activities", "Pricing guide", "Marketing tips"],
  },
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "teaching", label: "Teaching" },
  { value: "technology", label: "Technology" },
  { value: "creative", label: "Creative" },
  { value: "repairs", label: "Repairs" },
  { value: "construction", label: "Construction" },
  { value: "gardening", label: "Gardening" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Create Profile", desc: "List skills you can teach & want to learn", icon: "📝", color: "from-primary to-accent" },
  { step: "2", title: "Find Partners", desc: "Browse or get AI-matched with swappers", icon: "🔍", color: "from-amber-500 to-orange-500" },
  { step: "3", title: "Connect & Chat", desc: "Message, video call, arrange sessions", icon: "💬", color: "from-emerald-500 to-teal-500" },
  { step: "4", title: "Exchange Skills", desc: "Learn, teach, rate and grow together", icon: "🎓", color: "from-pink-500 to-rose-500" },
];

export default function SkillSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, loading, createCheckout } = useSkillSwap();
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [filters, setFilters] = useState({
    category: "all",
    minRating: "0",
    location: "",
    ownership: "all",
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
    setFilters({ category: "all", minRating: "0", location: "", ownership: "all" });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.category !== "all" || filters.minRating !== "0" || filters.location !== "" || filters.ownership !== "all";

  const fetchOfferings = async () => {
    let query = supabase.from('skill_offerings').select('*').eq('is_active', true);
    if (filters.category !== "all") {
      query = query.eq('category', filters.category as any);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) { console.error('Error fetching offerings:', error); setOfferings([]); return; }

    const userIds = data?.map(o => o.user_id) || [];
    const { data: profilesData } = await (supabase as any)
      .from('profiles_public')
      .select('id, full_name, rating_average, total_reviews, completed_exchanges, location')
      .in('id', userIds);

    const profilesMap = new Map<string, SkillOffering['profiles']>((profilesData || []).map((p: any) => [p.id, p]));
    let offeringsWithProfiles: SkillOffering[] = (data || []).map(offering => ({
      ...offering,
      profiles: profilesMap.get(offering.user_id) || undefined
    }));

    setTotalOfferings(offeringsWithProfiles.length);

    const minRating = parseFloat(filters.minRating);
    if (minRating > 0) {
      offeringsWithProfiles = offeringsWithProfiles.filter(o => (o.profiles?.rating_average || 0) >= minRating);
    }
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      offeringsWithProfiles = offeringsWithProfiles.filter(o => o.profiles?.location?.toLowerCase().includes(locationLower));
    }
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      offeringsWithProfiles = offeringsWithProfiles.filter(o => o.title.toLowerCase().includes(queryLower) || o.description.toLowerCase().includes(queryLower));
    }
    if (filters.ownership !== "all" && currentUserId) {
      if (filters.ownership === "mine") offeringsWithProfiles = offeringsWithProfiles.filter(o => o.user_id === currentUserId);
      else if (filters.ownership === "others") offeringsWithProfiles = offeringsWithProfiles.filter(o => o.user_id !== currentUserId);
    }

    switch (sortBy) {
      case "rating_desc": offeringsWithProfiles.sort((a, b) => (b.profiles?.rating_average || 0) - (a.profiles?.rating_average || 0)); break;
      case "rating_asc": offeringsWithProfiles.sort((a, b) => (a.profiles?.rating_average || 0) - (b.profiles?.rating_average || 0)); break;
      case "exchanges_desc": offeringsWithProfiles.sort((a, b) => (b.profiles?.completed_exchanges || 0) - (a.profiles?.completed_exchanges || 0)); break;
      case "exchanges_asc": offeringsWithProfiles.sort((a, b) => (a.profiles?.completed_exchanges || 0) - (b.profiles?.completed_exchanges || 0)); break;
      case "date_asc": offeringsWithProfiles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
    }

    setOfferings(offeringsWithProfiles);
  };

  useEffect(() => { fetchOfferings(); setCurrentPage(1); }, [filters, sortBy, searchQuery]);
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    checkUser();
  }, []);

  // Honor ?tab=... or ?view=... so cross-page links can deep-link into a view
  useEffect(() => {
    const v = searchParams.get("view") || searchParams.get("tab");
    const valid: ViewType[] = ["hub","browse","matches","messages","add","skillmap","advisor","progress","lessons","leaderboard","scheduler","valuation","demo","certification","workshops"];
    if (v && valid.includes(v as ViewType)) setActiveView(v as ViewType);
  }, [searchParams]);

  const handleSubscribe = async () => {
    const url = await createCheckout();
    if (url) { const __w = window.open(url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = url; }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) { toast.error("Please upload a valid image or video file"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("File size must be less than 20MB"); return; }
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddOffering = async () => {
    if (!newOffering.title || !newOffering.description) { toast.error("Please fill in all required fields"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in first"); navigate('/auth'); return; }

    setUploading(true);
    let mediaUrl = null;
    try {
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
        mediaUrl = publicUrl;
      }
      const { error } = await supabase.from('skill_offerings').insert([{
        user_id: session.user.id, title: newOffering.title, description: newOffering.description,
        category: newOffering.category as any, is_active: true, image_url: mediaUrl,
      }]);
      if (error) throw error;
      toast.success("Skill offering added successfully!");
      setActiveView("browse");
      setNewOffering({ title: "", description: "", category: "teaching" });
      setMediaFile(null); setMediaPreview("");
      fetchOfferings();
    } catch (error: any) {
      console.error(error); toast.error("Failed to add skill offering");
    } finally { setUploading(false); }
  };

  const handleRequestExchange = async (offeringId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in first"); navigate('/auth'); return; }
    if (!subscription.hasSubscription) { toast.error("Premium subscription required for exchanges"); return; }
    try {
      const { data: offering, error: offErr } = await supabase
        .from('skill_offerings').select('user_id').eq('id', offeringId).maybeSingle();
      if (offErr) throw offErr;
      if (!offering) { toast.error("Offering not found"); return; }
      if (offering.user_id === session.user.id) { toast.error("You cannot request your own offering"); return; }
      const { data: existingConv } = await supabase
        .from('skill_swap_conversations').select('id')
        .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${offering.user_id}),and(user1_id.eq.${offering.user_id},user2_id.eq.${session.user.id})`)
        .eq('offering_id', offeringId).maybeSingle();
      if (!existingConv) {
        const { error: insErr } = await supabase.from('skill_swap_conversations').insert([{
          user1_id: session.user.id, user2_id: offering.user_id, offering_id: offeringId,
        }]);
        if (insErr) throw insErr;
      }
      toast.success("Conversation started! Check Messages.");
      setActiveView("messages");
    } catch (e: any) {
      console.error('Request exchange error:', e);
      toast.error("Failed to start exchange");
    }
  };

  const handleEditClick = (offering: SkillOffering) => {
    setEditOffering({ id: offering.id, title: offering.title, description: offering.description, category: offering.category, image_url: offering.image_url });
    setMediaPreview(offering.image_url || ""); setRemoveMedia(false); setShowEditDialog(true);
  };

  const handleUpdateOffering = async () => {
    if (!editOffering || !editOffering.title || !editOffering.description) { toast.error("Please fill in all required fields"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in first"); return; }
    setUploading(true);
    let mediaUrl = editOffering.image_url;
    try {
      if (removeMedia && editOffering.image_url) {
        const urlParts = editOffering.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/');
        await supabase.storage.from('media').remove([fileName]);
        mediaUrl = null;
      }
      if (mediaFile) {
        if (editOffering.image_url) {
          const urlParts = editOffering.image_url.split('/');
          const fileName = urlParts.slice(-2).join('/');
          await supabase.storage.from('media').remove([fileName]);
        }
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
        mediaUrl = publicUrl;
      }
      const { error } = await supabase.from('skill_offerings').update({
        title: editOffering.title, description: editOffering.description, category: editOffering.category as any, image_url: mediaUrl,
      }).eq('id', editOffering.id);
      if (error) throw error;
      toast.success("Skill offering updated successfully!");
      setShowEditDialog(false); setEditOffering(null); setMediaFile(null); setMediaPreview(""); setRemoveMedia(false);
      fetchOfferings();
    } catch (error: any) {
      console.error(error); toast.error("Failed to update skill offering");
    } finally { setUploading(false); }
  };

  const handleDeleteOffering = async (offeringId: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this offering?")) return;
    try {
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts.slice(-2).join('/');
        await supabase.storage.from('media').remove([fileName]);
      }
      const { error } = await supabase.from('skill_offerings').delete().eq('id', offeringId);
      if (error) throw error;
      toast.success("Skill offering deleted successfully!"); fetchOfferings();
    } catch (error: any) {
      console.error(error); toast.error("Failed to delete skill offering");
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Skill Swap works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      </>
      );
  }

  const renderBrowseView = () => (
    <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Available Skills
        </h2>
        <p className="text-xs text-muted-foreground">{offerings.length} of {totalOfferings} skills</p>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-muted/10 border-border/50" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
                <SelectItem value="rating_asc">Lowest Rated</SelectItem>
                <SelectItem value="exchanges_desc">Most Exchanges</SelectItem>
                <SelectItem value="exchanges_asc">Least Exchanges</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1 text-xs"><X className="w-3 h-3" /> Clear</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1 text-xs">
              <Filter className="w-3 h-3" /> Filters
              {hasActiveFilters && <Badge variant="secondary" className="text-[9px] ml-1">ON</Badge>}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Ownership</label>
              <Select value={filters.ownership} onValueChange={(v) => setFilters({ ...filters, ownership: v })}>
                <SelectTrigger className="bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mine">My Offerings</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Category</label>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                <SelectTrigger className="bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Min Rating</label>
              <Select value={filters.minRating} onValueChange={(v) => setFilters({ ...filters, minRating: v })}>
                <SelectTrigger className="bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Location</label>
              <Input placeholder="City, Country..." value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="bg-muted/10 border-border/50" />
            </div>
          </div>
        )}
      </Card>

      {/* Skill Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offerings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((offering, i) => (
          <motion.div key={offering.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
              {offering.image_url && (
                <div className="relative w-full h-40">
                  {offering.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={offering.image_url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm line-clamp-1">{offering.title}</h3>
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0 ml-2">{offering.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{offering.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <button onClick={() => navigate(`/skill-swap/profile/${offering.user_id}`)} className="text-xs text-primary hover:underline font-medium">
                      {offering.profiles?.full_name || 'User'}
                    </button>
                    {offering.profiles && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{offering.profiles.rating_average.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                        <span>{offering.profiles.completed_exchanges} swaps</span>
                        {offering.profiles.location && (
                          <><span>•</span><span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" />{offering.profiles.location}</span></>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {currentUserId === offering.user_id ? (
                      <>
                        <Button onClick={() => handleEditClick(offering)} size="sm" variant="outline" className="h-7 w-7 p-0"><Edit className="w-3 h-3" /></Button>
                        <Button onClick={() => handleDeleteOffering(offering.id, offering.image_url)} size="sm" variant="destructive" className="h-7 w-7 p-0"><Trash2 className="w-3 h-3" /></Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => handleRequestExchange(offering.id)} disabled={!subscription.hasSubscription} className="text-xs h-7">
                        Exchange
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {offerings.length === 0 && (
        <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border border-border/50">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Skills Found</h3>
          <p className="text-sm text-muted-foreground">Be the first to offer a skill!</p>
        </Card>
      )}

      {offerings.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
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
                  const items = [];
                  if (index > 0 && array[index - 1] !== page - 1) {
                    items.push(<PaginationItem key={`e-${page}`}><PaginationEllipsis /></PaginationItem>);
                  }
                  items.push(
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                    </PaginationItem>
                  );
                  return items;
                })}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(Math.ceil(offerings.length / itemsPerPage), currentPage + 1))} className={currentPage === Math.ceil(offerings.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </motion.div>
  );

  const renderAddView = () => (
    <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 via-primary to-accent" />
        <div className="p-5 sm:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Offer Your Skill
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">Share what you can teach and start receiving exchange requests</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Skill Title *</label>
              <Input placeholder="e.g., Guitar Lessons" value={newOffering.title} onChange={(e) => setNewOffering({ ...newOffering, title: e.target.value })} className="bg-muted/10 border-border/50" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Description *</label>
              <Textarea placeholder="Describe what you can teach and your experience level..." value={newOffering.description} onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })} rows={4} className="bg-muted/10 border-border/50" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Category</label>
              <Select value={newOffering.category} onValueChange={(v) => setNewOffering({ ...newOffering, category: v })}>
                <SelectTrigger className="bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c.value !== "all").map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Media (Optional)</label>
              <div className="space-y-3">
                <Button type="button" variant="outline" onClick={() => document.getElementById('media-upload-hub')?.click()} className="gap-2">
                  <Upload className="w-4 h-4" /> Upload Image or Video
                </Button>
                <input id="media-upload-hub" type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
                {mediaPreview && (
                  <div className="relative">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} className="w-full max-h-48 rounded-lg object-cover" controls />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full max-h-48 rounded-lg object-cover" />
                    )}
                    <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setMediaFile(null); setMediaPreview(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAddOffering} disabled={uploading} className="flex-1">
              {uploading ? "Uploading..." : <><Sparkles className="mr-2 h-4 w-4" /> Add Offering</>}
            </Button>
            <Button variant="outline" onClick={() => setActiveView("hub")}>Cancel</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6 relative z-10 max-w-7xl">
        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* Dashboard Link */}
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('/skill-swap/dashboard')} className="gap-2 text-xs">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                </Button>
              </div>

              <SkillSwapHero />

              <HeroRewardedAd sectionKey="page_skillswap" />

              {/* Subscription Status */}
              {subscription.hasSubscription ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="font-bold text-sm">Premium Active</p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.subscriptionEnd && `Valid until ${new Date(subscription.subscriptionEnd).toLocaleDateString()}`}
                          {" • "}Full access to all features
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-primary/20">
                    <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                    <div className="p-6 text-center space-y-4">
                      <div className="p-3 rounded-xl bg-primary/10 inline-flex">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">Unlock Premium</h2>
                        <div className="text-4xl font-black text-primary mt-2">€9.99<span className="text-base font-medium text-muted-foreground">/month</span></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                        {[
                          { icon: Globe, label: "Global Exchanges" },
                          { icon: Video, label: "Video Lessons" },
                          { icon: Users, label: "Unlimited Swaps" },
                        ].map((f) => (
                          <div key={f.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/20 border border-border/30">
                            <f.icon className="h-5 w-5 text-primary" />
                            <span className="text-[10px] text-muted-foreground">{f.label}</span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleSubscribe} size="lg" className="w-full max-w-md">
                        <Sparkles className="mr-2 h-4 w-4" /> Subscribe Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Engagement Row */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkillSwapStreak />
                <SkillSwapProgress />
                <SkillSwapAchievements />
              </motion.div>

              {/* Expansion Pack */}
              <SkillSwapParityPack />

              {/* Main Content: Tools + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-primary" /> Swap Tools
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SWAP_TOOLS.map((tool, i) => (
                      <SkillSwapToolCard key={tool.id} tool={tool} onSelect={() => setActiveView(tool.id as ViewType)} index={i} />
                    ))}
                  </div>

                  {/* How It Works */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> How Skill Swap Works
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {HOW_IT_WORKS.map((s, i) => (
                        <motion.div key={s.step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                          className="relative text-center p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-all"
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className={`bg-gradient-to-r ${s.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>STEP {s.step}</span>
                          </div>
                          <span className="text-3xl block mb-2 mt-1">{s.icon}</span>
                          <h4 className="font-bold text-sm">{s.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>

                  {/* Categories Overview */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" /> Skill Categories
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { emoji: "📚", label: "Teaching", count: "2.4K" },
                        { emoji: "💻", label: "Technology", count: "1.8K" },
                        { emoji: "🎨", label: "Creative", count: "1.2K" },
                        { emoji: "🔧", label: "Repairs", count: "890" },
                        { emoji: "🏗️", label: "Construction", count: "650" },
                        { emoji: "🌱", label: "Gardening", count: "780" },
                        { emoji: "🧹", label: "Cleaning", count: "340" },
                        { emoji: "🎯", label: "Other", count: "1.1K" },
                      ].map((cat) => (
                        <div key={cat.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all cursor-pointer"
                          onClick={() => { setFilters({ ...filters, category: cat.label.toLowerCase() }); setActiveView("browse"); }}>
                          <span className="text-xl block mb-1">{cat.emoji}</span>
                          <p className="text-xs font-semibold">{cat.label}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">{cat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Why Skill Swap */}
                  <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" /> Why Choose Skill Swap?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: "💰", title: "No Money Needed", desc: "Exchange knowledge and skills without any financial transactions." },
                        { icon: "🌍", title: "Global Community", desc: "Connect with skilled people worldwide across 8+ categories." },
                        { icon: "⭐", title: "Verified Quality", desc: "Rating system and reviews ensure high-quality exchanges." },
                      ].map((item) => (
                        <div key={item.title} className="p-4 rounded-xl bg-muted/20 border border-border/30 text-center">
                          <span className="text-3xl block mb-2">{item.icon}</span>
                          <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  <SkillSwapTestimonials />

                  {/* Quick Actions */}
                  <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button onClick={() => setActiveView("browse")} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <Globe className="h-3.5 w-3.5" /> Browse All Skills
                      </Button>
                      <Button onClick={() => setActiveView("add")} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <UserPlus className="h-3.5 w-3.5" /> Offer Your Skill
                      </Button>
                      <Button onClick={() => setActiveView("matches")} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <Sparkles className="h-3.5 w-3.5" /> View Matches
                      </Button>
                      <Button onClick={() => setActiveView("messages")} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" /> Messages
                      </Button>
                      <Button onClick={() => navigate('/skill-swap/profile/edit')} variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                        <Edit className="h-3.5 w-3.5" /> Edit Profile
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : activeView === "browse" ? (
            renderBrowseView()
          ) : activeView === "add" ? (
            renderAddView()
          ) : activeView === "matches" ? (
            <motion.div key="matches" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Hub
              </Button>
              <SkillMatches />
            </motion.div>
          ) : activeView === "messages" ? (
            <motion.div key="messages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Hub
              </Button>
              <SkillSwapMessages />
            </motion.div>
          ) : activeView === "skillmap" ? (
            <SkillMap onBack={() => setActiveView("hub")} />
          ) : activeView === "advisor" ? (
            <AISkillAdvisor onBack={() => setActiveView("hub")} />
          ) : activeView === "progress" ? (
            <LearningProgressTracker onBack={() => setActiveView("hub")} />
          ) : activeView === "lessons" ? (
            <RecordedLessons onBack={() => setActiveView("hub")} />
          ) : activeView === "leaderboard" ? (
            <SwapLeaderboard onBack={() => setActiveView("hub")} />
          ) : activeView === "scheduler" ? (
            <SessionScheduler onBack={() => setActiveView("hub")} />
          ) : activeView === "valuation" ? (
            <AISkillValuationView onBack={() => setActiveView("hub")} />
          ) : activeView === "demo" ? (
            <LiveSkillDemoView onBack={() => setActiveView("hub")} />
          ) : activeView === "certification" ? (
            <SkillCertificationView onBack={() => setActiveView("hub")} />
          ) : activeView === "workshops" ? (
            <GroupWorkshopsView onBack={() => setActiveView("hub")} />
          ) : null}
        </AnimatePresence>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Edit Skill Offering</DialogTitle>
            </DialogHeader>
            {editOffering && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Title</label>
                  <Input placeholder="e.g., Web Development Lessons" value={editOffering.title} onChange={(e) => setEditOffering({ ...editOffering, title: e.target.value })} className="bg-muted/10 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Description</label>
                  <Textarea placeholder="Describe what you can teach..." value={editOffering.description} onChange={(e) => setEditOffering({ ...editOffering, description: e.target.value })} rows={4} className="bg-muted/10 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Category</label>
                  <Select value={editOffering.category} onValueChange={(v) => setEditOffering({ ...editOffering, category: v })}>
                    <SelectTrigger className="bg-muted/10 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== "all").map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Media</label>
                  <div className="space-y-2">
                    <Input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="cursor-pointer bg-muted/10 border-border/50" />
                    {(mediaPreview || editOffering.image_url) && !removeMedia && (
                      <div className="relative">
                        {(mediaPreview || editOffering.image_url || "").match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={mediaPreview || editOffering.image_url} className="w-full max-h-48 rounded-lg object-cover" controls />
                        ) : (
                          <img src={mediaPreview || editOffering.image_url} alt="Preview" className="w-full max-h-48 rounded-lg object-cover" />
                        )}
                        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2"
                          onClick={() => { setMediaFile(null); setMediaPreview(""); setRemoveMedia(true); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleUpdateOffering} disabled={uploading} className="flex-1">
                    {uploading ? "Updating..." : "Update Offering"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditOffering(null); setMediaFile(null); setMediaPreview(""); setRemoveMedia(false); }}>
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
