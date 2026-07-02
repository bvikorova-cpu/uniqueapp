import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plane, MapPin, Star, Plus, Camera, Send, X, Upload, Eye, Trash2, Brain, Luggage, Compass, Calculator, BookOpen, UtensilsCrossed, Globe, Search, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { VacationerHero } from "@/components/vacationer/VacationerHero";
import { AITravelPlanner } from "@/components/vacationer/AITravelPlanner";
import { AIPackingList } from "@/components/vacationer/AIPackingList";
import { AILocalGuide } from "@/components/vacationer/AILocalGuide";
import { AIBudgetCalculator } from "@/components/vacationer/AIBudgetCalculator";
import { AICulturalGuide } from "@/components/vacationer/AICulturalGuide";
import { AIFoodExplorer } from "@/components/vacationer/AIFoodExplorer";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ViewType = "hub" | "planner" | "packing" | "localguide" | "budget" | "cultural" | "food";

interface Destination {
  id: string; name: string; description: string; location: string; created_at: string; user_id: string;
  photos?: { id: string; photo_url: string }[];
  reviews?: { id: string; rating: number; comment: string; user_id: string }[];
}

const FEATURE_CARDS = [
  { id: "planner", icon: Brain, label: "AI Travel Planner", desc: "Full itinerary", color: "from-purple-500 to-violet-600" },
  { id: "packing", icon: Luggage, label: "AI Packing List", desc: "Smart packing", color: "from-amber-500 to-orange-600" },
  { id: "localguide", icon: Compass, label: "AI Local Guide", desc: "Insider tips", color: "from-emerald-500 to-green-600" },
  { id: "budget", icon: Calculator, label: "Budget Calculator", desc: "Cost breakdown", color: "from-sky-500 to-blue-600" },
  { id: "cultural", icon: BookOpen, label: "Cultural Guide", desc: "Etiquette & customs", color: "from-rose-500 to-pink-600" },
  { id: "food", icon: UtensilsCrossed, label: "Food Explorer", desc: "Local cuisine", color: "from-orange-500 to-red-600" },
];

const Vacationer = () => {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const [searchQuery, setSearchQuery] = useState("");
  const [newDestination, setNewDestination] = useState({ name: "", location: "", description: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => { fetchUser(); fetchDestinations(); }, []);

  const fetchUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setUser(user); };

  const fetchDestinations = async () => {
    const { data, error } = await supabase.from("destinations").select("*, photos:destination_photos(*), reviews:destination_reviews(*)").eq("is_active", true).order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Failed to load destinations", variant: "destructive" });
    else setDestinations(data || []);
  };

  const handleAddDestination = async () => {
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!newDestination.name || !newDestination.location || !newDestination.description) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    setIsUploading(true);
    try {
      const { data: destData, error } = await supabase.from("destinations").insert([{ ...newDestination, user_id: user.id }]).select().single();
      if (error) throw error;
      if (selectedFiles.length > 0) {
        await Promise.all(selectedFiles.map(async (file) => {
          const fileName = `${user.id}/${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
          const { error: upErr } = await supabase.storage.from('destination-media').upload(fileName, file);
          if (upErr) throw upErr;
          const { data: { publicUrl } } = supabase.storage.from('destination-media').getPublicUrl(fileName);
          await supabase.from('destination_photos').insert([{ destination_id: destData.id, photo_url: publicUrl }]);
        }));
      }
      toast({ title: "Destination added!" });
      setNewDestination({ name: "", location: "", description: "" }); setSelectedFiles([]); setIsAddDialogOpen(false); fetchDestinations();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsUploading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => (f.type.startsWith('image/') || f.type.startsWith('video/')) && f.size <= 10 * 1024 * 1024);
    setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const handleAddReview = async () => {
    if (!user || !selectedDestination || !newReview.comment) return;
    const { error } = await supabase.from("destination_reviews").insert([{ destination_id: selectedDestination.id, user_id: user.id, rating: newReview.rating, comment: newReview.comment }]);
    if (!error) { toast({ title: "Review added!" }); setNewReview({ rating: 5, comment: "" }); setIsReviewDialogOpen(false); fetchDestinations(); }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("destinations").delete().eq("id", id).eq("user_id", user.id);
    if (!error) { toast({ title: "Deleted!" }); setIsDetailDialogOpen(false); fetchDestinations(); }
  };

  const avgRating = (d: Destination) => {
    if (!d.reviews?.length) return 0;
    return (d.reviews.reduce((a, r) => a + r.rating, 0) / d.reviews.length).toFixed(1);
  };

  const filtered = destinations.filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.location.toLowerCase().includes(searchQuery.toLowerCase()));

  const goBack = () => setActiveView("hub");

  if (activeView === "planner") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AITravelPlanner onBack={goBack} /></div></div>;
  if (activeView === "packing") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIPackingList onBack={goBack} /></div></div>;
  if (activeView === "localguide") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AILocalGuide onBack={goBack} /></div></div>;
  if (activeView === "budget") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIBudgetCalculator onBack={goBack} /></div></div>;
  if (activeView === "cultural") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AICulturalGuide onBack={goBack} /></div></div>;
  if (activeView === "food") return <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4 max-w-4xl"><AIFoodExplorer onBack={goBack} /></div></div>;

  return (
    <>
      <FloatingHowItWorks title="How Vacationer works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <VacationerHero />

        <HeroRewardedAd sectionKey="page_vacationer" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border/40 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{destinations.length}</div>
            <p className="text-sm text-muted-foreground">Destinations Shared</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border/40 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">6</div>
            <p className="text-sm text-muted-foreground">AI Travel Tools</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/80 backdrop-blur-xl rounded-2xl p-5 border border-border/40 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">∞</div>
            <p className="text-sm text-muted-foreground">Adventures Await</p>
          </motion.div>
        </div>

        {/* AI Tools Grid */}
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Travel Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div key={card.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              onClick={() => setActiveView(card.id as ViewType)}
              className="bg-card/80 backdrop-blur-xl rounded-xl p-4 border border-border/40 cursor-pointer hover:scale-105 active:scale-[0.97] transition-all group">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-2`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">{card.label}</h3>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Destinations Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Community Destinations</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Destination</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Destination</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input value={newDestination.name} onChange={e => setNewDestination({...newDestination, name: e.target.value})} placeholder="Destination name" />
                <Input value={newDestination.location} onChange={e => setNewDestination({...newDestination, location: e.target.value})} placeholder="Location (e.g., Dubrovnik, Croatia)" />
                <Textarea value={newDestination.description} onChange={e => setNewDestination({...newDestination, description: e.target.value})} placeholder="Description..." className="min-h-24" />
                <div>
                  <label className="text-sm font-medium">Photos (max 5)</label>
                  <Input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="mt-1" disabled={selectedFiles.length >= 5} />
                  {selectedFiles.length > 0 && <div className="flex gap-2 mt-2 flex-wrap">{selectedFiles.map((f, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">{f.name.slice(0, 15)}<X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFiles(p => p.filter((_, j) => j !== i))} /></Badge>
                  ))}</div>}
                </div>
                <Button onClick={handleAddDestination} className="w-full" disabled={isUploading}><Send className="h-4 w-4 mr-2" />{isUploading ? "Uploading..." : "Add Destination"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search destinations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] bg-card/80 backdrop-blur-xl border-border/40">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                {destination.photos?.[0] ? (
                  <img src={destination.photos[0].photo_url} alt={destination.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Camera className="h-12 w-12 text-muted-foreground" /></div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <CardTitle className="cursor-pointer hover:text-primary transition-colors line-clamp-1" onClick={() => { setSelectedDestination(destination); setIsDetailDialogOpen(true); }}>{destination.name}</CardTitle>
                <CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4" />{destination.location}</CardDescription>
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating(destination))) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}</div>
                  <span className="text-sm text-muted-foreground">{avgRating(destination)} ({destination.reviews?.length || 0})</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedDestination(destination); setIsDetailDialogOpen(true); }}><Eye className="h-4 w-4 mr-1" />Details</Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedDestination(destination); setIsReviewDialogOpen(true); }}><Star className="h-4 w-4 mr-1" />Review</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12"><Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><p className="text-xl text-muted-foreground">No destinations yet. Be the first to share!</p></div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{selectedDestination?.name}</DialogTitle>
                  <CardDescription className="flex items-center gap-1 text-base mt-1"><MapPin className="h-5 w-5" />{selectedDestination?.location}</CardDescription>
                </div>
                {user?.id === selectedDestination?.user_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => selectedDestination && handleDeleteDestination(selectedDestination.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </DialogHeader>
            {selectedDestination && (
              <div className="space-y-6">
                {selectedDestination.photos?.length ? (
                  <div className="grid grid-cols-2 gap-2">{selectedDestination.photos.map(p => <div key={p.id} className="aspect-video rounded-lg overflow-hidden"><img src={p.photo_url} alt="" className="w-full h-full object-cover" /></div>)}</div>
                ) : null}
                <div className="flex items-center gap-3">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-6 w-6 ${s <= Math.round(Number(avgRating(selectedDestination))) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}</div>
                  <span className="text-lg font-semibold">{avgRating(selectedDestination)}</span>
                  <span className="text-muted-foreground">({selectedDestination.reviews?.length || 0} reviews)</span>
                </div>
                <div><h3 className="font-semibold text-lg mb-2">Description</h3><p className="text-muted-foreground whitespace-pre-wrap">{selectedDestination.description}</p></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Reviews ({selectedDestination.reviews?.length || 0})</h3>
                    <Button variant="outline" size="sm" onClick={() => { setIsDetailDialogOpen(false); setIsReviewDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Review</Button>
                  </div>
                  {selectedDestination.reviews?.length ? (
                    <div className="space-y-3">{selectedDestination.reviews.map(r => (
                      <Card key={r.id}><CardContent className="pt-4"><div className="flex items-start gap-3"><Avatar className="h-10 w-10"><AvatarFallback>U</AvatarFallback></Avatar><div className="flex-1 space-y-2"><div className="flex items-center justify-between"><span className="font-semibold">Traveler</span><div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}</div></div><p className="text-sm text-muted-foreground">{r.comment}</p></div></div></CardContent></Card>
                    ))}</div>
                  ) : <p className="text-center text-muted-foreground py-6">No reviews yet.</p>}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Review — {selectedDestination?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">{[1,2,3,4,5].map(s => <Star key={s} className={`h-8 w-8 cursor-pointer ${s <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} onClick={() => setNewReview({...newReview, rating: s})} />)}</div>
              <Textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} placeholder="Write your review..." className="min-h-24" />
              <Button onClick={handleAddReview} className="w-full"><Send className="h-4 w-4 mr-2" />Submit Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
    );
};

export default Vacationer;
