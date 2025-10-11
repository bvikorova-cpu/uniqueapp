import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gavel, Clock, TrendingUp, Plus, Upload, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { createSaleTransaction } from "@/utils/createSaleTransaction";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  buyout_price: number | null;
  image_url: string | null;
  category: string;
  condition: string;
  ends_at: string;
  user_id: string;
}

const Auction = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
  const [bidAmount, setBidAmount] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [duration, setDuration] = useState("24");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailAuction, setDetailAuction] = useState<AuctionItem | null>(null);
  const [auctionPhotos, setAuctionPhotos] = useState<string[]>([]);
  const { limits, calculateCommission } = useSubscription();

  useEffect(() => {
    checkUser();
    fetchAuctions();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : undefined
        });

        if (error) throw error;

        toast.success("Platba úspešná! Váš nákup bol spracovaný.");

        // Remove URL parameters
        window.history.replaceState({}, '', window.location.pathname);
        
        // Reload auctions
        fetchAuctions();
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error("Nepodarilo sa overiť platbu. Kontaktujte podporu.");
      }
    } else if (paymentStatus === 'canceled') {
      toast.error("Platba bola zrušená.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from("auction_items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      toast.error("Nepodarilo sa načítať aukcie");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (imageFiles.length + files.length > 3) {
      toast.error("Môžete nahrať maximálne 3 fotky");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} je príliš veľký. Maximálna veľkosť je 5MB`);
        return false;
      }
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Musíte byť prihlásený");
      navigate("/auth");
      return;
    }

    setUploading(true);
    try {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + parseInt(duration));

      // Create auction first
      const { data: auctionData, error: auctionError } = await supabase
        .from("auction_items")
        .insert({
          user_id: user.id,
          title,
          description,
          starting_price: parseFloat(startingPrice),
          current_price: parseFloat(startingPrice),
          buyout_price: buyoutPrice ? parseFloat(buyoutPrice) : null,
          category,
          condition,
          ends_at: endsAt.toISOString(),
          image_url: null,
        })
        .select()
        .single();

      if (auctionError) throw auctionError;

      // Upload images if selected
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('bazaar_images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('bazaar_images')
            .getPublicUrl(fileName);

          // Save photo to auction_photos table
          await supabase.from("auction_photos").insert({
            auction_id: auctionData.id,
            photo_url: publicUrl,
          });
        }
      }

      toast.success("Aukcia bola vytvorená!");
      setCreateDialogOpen(false);
      resetForm();
      fetchAuctions();
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Nepodarilo sa vytvoriť aukciu");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartingPrice("");
    setBuyoutPrice("");
    setCategory("");
    setCondition("");
    setDuration("24");
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleBid = async (auction: AuctionItem) => {
    if (!user) {
      toast.error("Musíte byť prihlásený");
      navigate("/auth");
      return;
    }

    setSelectedAuction(auction);
    setBidAmount("");
    setBidDialogOpen(true);
  };

  const handleBuyout = async (auction: AuctionItem) => {
    if (!user) {
      toast.error("Musíte byť prihlásený");
      navigate("/auth");
      return;
    }

    if (!auction.buyout_price) return;

    try {
      const { error } = await supabase.from("auction_bids").insert({
        auction_id: auction.id,
        user_id: user.id,
        bid_amount: auction.buyout_price,
      });

      if (error) throw error;

      // Mark auction as sold/inactive
      await supabase
        .from("auction_items")
        .update({ 
          is_active: false,
          winner_id: user.id 
        })
        .eq("id", auction.id);

      // Create notification for seller
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await supabase.from("notifications").insert({
        user_id: auction.user_id,
        title: "Produkt bol zakúpený",
        message: `${profileData?.full_name || "Používateľ"} zakúpil váš produkt "${auction.title}" za ${auction.buyout_price}€`,
        type: "auction_buyout",
        related_id: auction.id,
      });

      toast.success("Produkt bol úspešne zakúpený!");
      fetchAuctions();
    } catch (error) {
      console.error("Error buying out:", error);
      toast.error("Nepodarilo sa zakúpiť produkt");
    }
  };

  const submitBid = async () => {
    if (!selectedAuction || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (amount <= selectedAuction.current_price) {
      toast.error("Ponuka musí byť vyššia ako aktuálna cena");
      return;
    }

    try {
      const { error } = await supabase.from("auction_bids").insert({
        auction_id: selectedAuction.id,
        user_id: user.id,
        bid_amount: amount,
      });

      if (error) throw error;

      // Create notification for seller
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await supabase.from("notifications").insert({
        user_id: selectedAuction.user_id,
        title: "Nové prihodenie v aukcii",
        message: `${profileData?.full_name || "Používateľ"} prihodel ${amount}€ na váš produkt "${selectedAuction.title}"`,
        type: "auction_bid",
        related_id: selectedAuction.id,
      });

      toast.success("Ponuka bola úspešne pridaná!");
      setBidDialogOpen(false);
      setBidAmount("");
      setSelectedAuction(null);
      fetchAuctions();
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Nepodarilo sa pridať ponuku");
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("auction_items")
        .delete()
        .eq("id", auctionId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Aukcia bola zmazaná");
      fetchAuctions();
    } catch (error) {
      console.error("Error deleting auction:", error);
      toast.error("Nepodarilo sa zmazať aukciu");
    }
  };

  const handleShowDetail = async (auction: AuctionItem) => {
    setDetailAuction(auction);
    
    // Fetch photos for this auction
    const { data: photos } = await supabase
      .from("auction_photos")
      .select("photo_url")
      .eq("auction_id", auction.id)
      .order("created_at", { ascending: true });

    setAuctionPhotos(photos?.map(p => p.photo_url) || []);
    setDetailDialogOpen(true);
  };

  const getTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ukončené";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Online Aukcia
              </span>
            </h1>
            <p className="text-muted-foreground mb-4">
              Kupuj a predávaj produkty v aukcii
            </p>
            
            {limits.auctionListingsPerMonth !== -1 && (
              <Alert className="max-w-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Limit: {limits.auctionListingsPerMonth} aukcií/mesiac • Provízia: {limits.commissionRate}%
                  {limits.tier === 'free' && (
                    <Link to="/subscription" className="ml-2 text-primary hover:underline">
                      Upgradujte
                    </Link>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Vytvoriť aukciu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vytvoriť novú aukciu</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAuction} className="space-y-4">
                <div>
                  <Label htmlFor="title">Názov</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Popis</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startingPrice">Východzia cena (€)</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      step="0.01"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="buyoutPrice">Ihneď kúpiť (€)</Label>
                    <Input
                      id="buyoutPrice"
                      type="number"
                      step="0.01"
                      value={buyoutPrice}
                      onChange={(e) => setBuyoutPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategória</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyber kategóriu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elektronika">Elektronika</SelectItem>
                        <SelectItem value="oblecenie">Oblečenie</SelectItem>
                        <SelectItem value="nabytok">Nábytok</SelectItem>
                        <SelectItem value="sport">Šport</SelectItem>
                        <SelectItem value="knihy">Knihy</SelectItem>
                        <SelectItem value="hracky">Hračky</SelectItem>
                        <SelectItem value="auto">Auto-moto</SelectItem>
                        <SelectItem value="ine">Iné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition">Stav</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyber stav" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nove">Nové</SelectItem>
                        <SelectItem value="pouzite">Použité</SelectItem>
                        <SelectItem value="poskodene">Poškodené</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Trvanie (hodiny)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hodín</SelectItem>
                      <SelectItem value="48">48 hodín</SelectItem>
                      <SelectItem value="72">3 dni</SelectItem>
                      <SelectItem value="168">7 dní</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Obrázky produktu (max 3)</Label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Náhľad ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Kliknite pre nahratie obrázkov ({imagePreviews.length}/3)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max. 5MB (JPG, PNG, WEBP)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? "Vytváram..." : "Vytvoriť aukciu"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktívne aukcie</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auctions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Končia dnes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auctions.filter(a => {
                  const hours = (new Date(a.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                  return hours <= 24 && hours > 0;
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Priemerná cena</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auctions.length > 0 
                  ? (auctions.reduce((sum, a) => sum + parseFloat(a.current_price.toString()), 0) / auctions.length).toFixed(2)
                  : "0"
                }€
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auctions Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Všetky</TabsTrigger>
            <TabsTrigger value="ending">Končia čoskoro</TabsTrigger>
            <TabsTrigger value="new">Nové</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Načítavam aukcie...</div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Žiadne aktívne aukcie
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <Card key={auction.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                        {auction.image_url ? (
                          <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex justify-between items-start">
                        <CardTitle 
                          className="text-xl cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleShowDetail(auction)}
                        >
                          {auction.title}
                        </CardTitle>
                        <Badge variant="outline">{auction.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {auction.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Aktuálna cena:</span>
                        <span className="text-2xl font-bold text-primary">
                          {parseFloat(auction.current_price.toString()).toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stav:</span>
                        <Badge variant="secondary">{auction.condition}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Zostáva:</span>
                        <span className="text-sm font-semibold">
                          {getTimeRemaining(auction.ends_at)}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {user?.id === auction.user_id ? (
                        <Button 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeleteAuction(auction.id)}
                        >
                          Zmazať
                        </Button>
                      ) : (
                        <>
                          <Button 
                            className="flex-1"
                            onClick={() => handleBid(auction)}
                          >
                            <Gavel className="mr-2 h-4 w-4" />
                            Prihodiť
                          </Button>
                          {auction.buyout_price && (
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleBuyout(auction)}
                            >
                              Kúpiť za {parseFloat(auction.buyout_price.toString()).toFixed(2)}€
                            </Button>
                          )}
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions
                .filter(a => {
                  const hours = (new Date(a.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                  return hours <= 24 && hours > 0;
                })
                .map((auction) => (
                  <Card key={auction.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                        {auction.image_url ? (
                          <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{auction.title}</CardTitle>
                        <Badge variant="outline">{auction.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {auction.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Aktuálna cena:</span>
                        <span className="text-2xl font-bold text-primary">
                          {parseFloat(auction.current_price.toString()).toFixed(2)}€
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Zostáva:</span>
                        <span className="text-sm font-semibold">
                          {getTimeRemaining(auction.ends_at)}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleBid(auction)}
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        Prihodiť
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.slice(0, 6).map((auction) => (
                <Card key={auction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      {auction.image_url ? (
                        <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{auction.title}</CardTitle>
                      <Badge variant="outline">{auction.category}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {auction.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aktuálna cena:</span>
                      <span className="text-2xl font-bold text-primary">
                        {parseFloat(auction.current_price.toString()).toFixed(2)}€
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleBid(auction)}
                    >
                      <Gavel className="mr-2 h-4 w-4" />
                      Prihodiť
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bid Dialog */}
        <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Prihodiť na aukciu</DialogTitle>
            </DialogHeader>
            {selectedAuction && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Aukcia: <strong>{selectedAuction.title}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aktuálna cena: <strong className="text-primary">{parseFloat(selectedAuction.current_price.toString()).toFixed(2)}€</strong>
                  </p>
                </div>
                <div>
                  <Label htmlFor="bidAmount">Koľko chcete prihodiť? (€)</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Minimálne ${(parseFloat(selectedAuction.current_price.toString()) + 0.01).toFixed(2)}€`}
                  />
                </div>
                <Button 
                  onClick={submitBid} 
                  className="w-full"
                  disabled={!bidAmount || parseFloat(bidAmount) <= parseFloat(selectedAuction.current_price.toString())}
                >
                  <Gavel className="h-4 w-4 mr-2" />
                  Prihodiť {bidAmount && `${parseFloat(bidAmount).toFixed(2)}€`}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailAuction && (
              <>
                <DialogHeader>
                  <DialogTitle>{detailAuction.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Photos Carousel */}
                  {auctionPhotos.length > 0 && (
                    <div className="space-y-2">
                      {auctionPhotos.length === 1 ? (
                        <img 
                          src={auctionPhotos[0]} 
                          alt={detailAuction.title} 
                          className="w-full h-96 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {auctionPhotos.map((photo, index) => (
                            <img 
                              key={index}
                              src={photo} 
                              alt={`${detailAuction.title} ${index + 1}`} 
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1">Popis</h3>
                      <p className="text-muted-foreground">{detailAuction.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">Aktuálna cena</h4>
                        <p className="text-2xl font-bold text-primary">
                          {parseFloat(detailAuction.current_price.toString()).toFixed(2)}€
                        </p>
                      </div>
                      {detailAuction.buyout_price && (
                        <div>
                          <h4 className="font-semibold text-sm">Kúpiť teraz</h4>
                          <p className="text-2xl font-bold">
                            {parseFloat(detailAuction.buyout_price.toString()).toFixed(2)}€
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">Kategória</h4>
                        <Badge variant="outline">{detailAuction.category}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Stav</h4>
                        <Badge variant="secondary">{detailAuction.condition}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">Zostávajúci čas</h4>
                      <p className="text-lg font-semibold text-primary">
                        {getTimeRemaining(detailAuction.ends_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {user?.id !== detailAuction.user_id && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          setDetailDialogOpen(false);
                          handleBid(detailAuction);
                        }}
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        Prihodiť
                      </Button>
                      {detailAuction.buyout_price && (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setDetailDialogOpen(false);
                            handleBuyout(detailAuction);
                          }}
                        >
                          Kúpiť za {parseFloat(detailAuction.buyout_price.toString()).toFixed(2)}€
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auction;