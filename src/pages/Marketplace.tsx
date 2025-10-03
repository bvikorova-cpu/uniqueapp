import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, Euro } from "lucide-react";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface SkillOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  user_id: string;
  created_at: string;
  profiles?: Profile | Profile[] | null;
}

const CATEGORIES = {
  construction: "Stavebníctvo",
  repairs: "Opravy",
  cleaning: "Upratovanie",
  gardening: "Záhradníctvo",
  technology: "Technológie",
  teaching: "Vzdelávanie",
  creative: "Kreatíva",
  other: "Iné"
};

const Marketplace = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price_per_hour: "",
    location: ""
  });

  useEffect(() => {
    checkAuth();
    loadOfferings();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: subscription } = await supabase
        .from("marketplace_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      setIsSubscribed(!!subscription);
    }
  };

  const loadOfferings = async () => {
    const { data, error } = await supabase
      .from("skill_offerings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading offerings:", error);
      return;
    }

    setOfferings(data || []);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre predplatné sa musíte prihlásiť",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("marketplace_subscriptions")
      .insert({
        user_id: user.id,
        status: "active"
      });

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť predplatné",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribed(true);
    toast({
      title: "Úspech!",
      description: "Predplatné bolo aktivované"
    });
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre vytvorenie ponuky sa musíte prihlásiť",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("skill_offerings")
      .insert([{
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : null,
        location: formData.location || null
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Úspech!",
      description: "Vaša ponuka bola vytvorená"
    });

    setFormData({
      title: "",
      description: "",
      category: "",
      price_per_hour: "",
      location: ""
    });
    setShowCreateForm(false);
    loadOfferings();
  };

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold">Marketplace Zručností</CardTitle>
              <CardDescription className="text-lg">
                Ponúkni svoje zručnosti celému svetu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold">Čo získaš za 2 EUR/mesiac:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Vytvor neomedzený počet ponúk svojich služieb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Oslovíš tisíce potenciálnych zákazníkov</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Plná kontrola nad cenami a dostupnosťou</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Prezentuj sa profesionálne</span>
                  </li>
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-3xl font-bold text-primary">2 EUR / mesiac</p>
                <Button 
                  onClick={handleSubscribe}
                  size="lg" 
                  className="w-full max-w-md"
                >
                  Aktivovať predplatné
                </Button>
                <p className="text-sm text-muted-foreground">
                  Platobná brána bude pripojená neskôr
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketplace Zručností</h1>
            <p className="text-muted-foreground">Nájdi alebo ponúkni služby</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Zrušiť" : "Pridať ponuku"}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Vytvor novú ponuku</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOffering} className="space-y-4">
                <div>
                  <Input
                    placeholder="Názov služby"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Popis služby"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategória" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Cena za hodinu (€)"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                  />
                  <Input
                    placeholder="Lokalita"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Vytvoriť ponuku
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offerings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{offering.title}</CardTitle>
                  <Badge variant="secondary">
                    {CATEGORIES[offering.category as keyof typeof CATEGORIES]}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-sm">
                  Anonymný užívateľ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {offering.description}
                </p>
                <div className="space-y-2 text-sm">
                  {offering.price_per_hour && (
                    <div className="flex items-center gap-2 text-primary">
                      <Euro className="w-4 h-4" />
                      <span className="font-semibold">{offering.price_per_hour}€/hod</span>
                    </div>
                  )}
                  {offering.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{offering.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(offering.created_at).toLocaleDateString('sk-SK')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offerings.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Zatiaľ žiadne ponuky</h3>
            <p className="text-muted-foreground">Buď prvý, kto ponúkne svoje služby!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;