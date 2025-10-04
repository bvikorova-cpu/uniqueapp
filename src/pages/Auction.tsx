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
import { Gavel, Clock, TrendingUp, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [duration, setDuration] = useState("24");

  useEffect(() => {
    checkUser();
    fetchAuctions();
  }, []);

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

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Musíte byť prihlásený");
      navigate("/auth");
      return;
    }

    try {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + parseInt(duration));

      const { error } = await supabase.from("auction_items").insert({
        user_id: user.id,
        title,
        description,
        starting_price: parseFloat(startingPrice),
        current_price: parseFloat(startingPrice),
        buyout_price: buyoutPrice ? parseFloat(buyoutPrice) : null,
        category,
        condition,
        ends_at: endsAt.toISOString(),
      });

      if (error) throw error;

      toast.success("Aukcia bola vytvorená!");
      setCreateDialogOpen(false);
      resetForm();
      fetchAuctions();
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Nepodarilo sa vytvoriť aukciu");
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
  };

  const handleBid = async (auctionId: string, currentPrice: number) => {
    if (!user) {
      toast.error("Musíte byť prihlásený");
      navigate("/auth");
      return;
    }

    const bidAmount = prompt(`Zadajte vašu ponuku (aktuálna cena: ${currentPrice}€):`);
    if (!bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (amount <= currentPrice) {
      toast.error("Ponuka musí byť vyššia ako aktuálna cena");
      return;
    }

    try {
      const { error } = await supabase.from("auction_bids").insert({
        auction_id: auctionId,
        user_id: user.id,
        bid_amount: amount,
      });

      if (error) throw error;

      toast.success("Ponuka bola úspešne pridaná!");
      fetchAuctions();
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Nepodarilo sa pridať ponuku");
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Online Aukcia
              </span>
            </h1>
            <p className="text-muted-foreground">
              Kupuj a predávaj produkty v aukcii
            </p>
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

                <Button type="submit" className="w-full">
                  Vytvoriť aukciu
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
                      <Button 
                        className="flex-1"
                        onClick={() => handleBid(auction.id, parseFloat(auction.current_price.toString()))}
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        Prihodiť
                      </Button>
                      {auction.buyout_price && (
                        <Button variant="outline" className="flex-1">
                          Kúpiť za {parseFloat(auction.buyout_price.toString()).toFixed(2)}€
                        </Button>
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
                        onClick={() => handleBid(auction.id, parseFloat(auction.current_price.toString()))}
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
                      onClick={() => handleBid(auction.id, parseFloat(auction.current_price.toString()))}
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
      </div>
    </div>
  );
};

export default Auction;