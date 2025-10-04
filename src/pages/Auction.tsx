import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gavel, Clock, TrendingUp, Plus, User } from "lucide-react";
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
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const [newAuction, setNewAuction] = useState({
    title: "",
    description: "",
    starting_price: "",
    buyout_price: "",
    category: "elektronika",
    condition: "nove",
    ends_at: "",
  });

  useEffect(() => {
    fetchAuctions();
  }, [selectedCategory]);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("auction_items")
        .select("*")
        .eq("is_active", true)
        .gt("ends_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      toast.error("Nepodarilo sa načítať aukcie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Musíte byť prihlásený pre vytvorenie aukcie");
      navigate("/auth");
      return;
    }

    if (!newAuction.title || !newAuction.description || !newAuction.starting_price || !newAuction.ends_at) {
      toast.error("Vyplňte všetky povinné polia");
      return;
    }

    try {
      const { error } = await supabase.from("auction_items").insert({
        title: newAuction.title,
        description: newAuction.description,
        starting_price: parseFloat(newAuction.starting_price),
        current_price: parseFloat(newAuction.starting_price),
        buyout_price: newAuction.buyout_price ? parseFloat(newAuction.buyout_price) : null,
        category: newAuction.category,
        condition: newAuction.condition,
        ends_at: newAuction.ends_at,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Aukcia bola úspešne vytvorená!");
      setIsCreateDialogOpen(false);
      setNewAuction({
        title: "",
        description: "",
        starting_price: "",
        buyout_price: "",
        category: "elektronika",
        condition: "nove",
        ends_at: "",
      });
      fetchAuctions();
    } catch (error) {
      console.error("Error creating auction:", error);
      toast.error("Nepodarilo sa vytvoriť aukciu");
    }
  };

  const handleBid = async (auctionId: string, currentPrice: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Musíte byť prihlásený pre podanie ponuky");
      navigate("/auth");
      return;
    }

    const bidAmount = prompt(`Zadajte sumu (aktuálna cena: ${currentPrice} €):`);
    if (!bidAmount) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= currentPrice) {
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

      toast.success("Ponuka bola úspešne podaná!");
      fetchAuctions();
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Nepodarilo sa podať ponuku");
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ukončená";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-primary py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <Gavel className="h-16 w-16 mx-auto text-white" />
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Online Aukcie
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Ponúkaj, vydražuj a zárobok na predaji produktov z celého sveta
          </p>
        </div>
      </section>

      {/* Filters and Create Button */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Všetky kategórie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky kategórie</SelectItem>
              <SelectItem value="elektronika">Elektronika</SelectItem>
              <SelectItem value="mobil">Mobilné telefóny</SelectItem>
              <SelectItem value="oblecenie">Oblečenie</SelectItem>
              <SelectItem value="domacnost">Domácnosť</SelectItem>
              <SelectItem value="sport">Šport</SelectItem>
              <SelectItem value="auto">Auto & Moto</SelectItem>
              <SelectItem value="knihy">Knihy</SelectItem>
              <SelectItem value="ostatne">Ostatné</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Vytvoriť aukciu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vytvoriť novú aukciu</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Názov *</Label>
                  <Input
                    id="title"
                    value={newAuction.title}
                    onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })}
                    placeholder="Názov produktu"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Popis *</Label>
                  <Textarea
                    id="description"
                    value={newAuction.description}
                    onChange={(e) => setNewAuction({ ...newAuction, description: e.target.value })}
                    placeholder="Podrobný popis produktu"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="starting_price">Počiatočná cena (€) *</Label>
                    <Input
                      id="starting_price"
                      type="number"
                      value={newAuction.starting_price}
                      onChange={(e) => setNewAuction({ ...newAuction, starting_price: e.target.value })}
                      placeholder="10.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="buyout_price">Kúp teraz cena (€)</Label>
                    <Input
                      id="buyout_price"
                      type="number"
                      value={newAuction.buyout_price}
                      onChange={(e) => setNewAuction({ ...newAuction, buyout_price: e.target.value })}
                      placeholder="100.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Kategória</Label>
                    <Select value={newAuction.category} onValueChange={(value) => setNewAuction({ ...newAuction, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elektronika">Elektronika</SelectItem>
                        <SelectItem value="mobil">Mobilné telefóny</SelectItem>
                        <SelectItem value="oblecenie">Oblečenie</SelectItem>
                        <SelectItem value="domacnost">Domácnosť</SelectItem>
                        <SelectItem value="sport">Šport</SelectItem>
                        <SelectItem value="auto">Auto & Moto</SelectItem>
                        <SelectItem value="knihy">Knihy</SelectItem>
                        <SelectItem value="ostatne">Ostatné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="condition">Stav</Label>
                    <Select value={newAuction.condition} onValueChange={(value) => setNewAuction({ ...newAuction, condition: value })}>
                      <SelectTrigger>
                        <SelectValue />
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
                  <Label htmlFor="ends_at">Koniec aukcie *</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={newAuction.ends_at}
                    onChange={(e) => setNewAuction({ ...newAuction, ends_at: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateAuction} className="w-full">
                  Vytvoriť aukciu
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Auctions Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Načítavam aukcie...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-20">
              <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Žiadne aktívne aukcie</h3>
              <p className="text-muted-foreground">Vytvorte prvú aukciu!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <Card key={auction.id} className="hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{auction.title}</CardTitle>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {auction.category}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {auction.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Aktuálna cena:</span>
                      <span className="font-bold text-xl text-primary">
                        {auction.current_price.toFixed(2)} €
                      </span>
                    </div>

                    {auction.buyout_price && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kúp teraz:</span>
                        <span className="font-semibold">
                          {auction.buyout_price.toFixed(2)} €
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Zostáva:</span>
                      </div>
                      <span className="font-semibold">{getTimeRemaining(auction.ends_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Stav: {auction.condition}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleBid(auction.id, auction.current_price)}
                      className="w-full"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Podať ponuku
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Auction;