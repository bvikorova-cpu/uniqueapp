import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Clock, User, MessageCircle, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Bazaar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Súbor je príliš veľký",
          description: "Maximálna veľkosť obrázka je 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const categories = [
    { id: "all", name: "Všetko" },
    { id: "electronics", name: "Elektronika" },
    { id: "clothing", name: "Oblečenie" },
    { id: "home", name: "Dom & záhrada" },
    { id: "sports", name: "Šport" },
    { id: "books", name: "Knihy" },
    { id: "other", name: "Ostatné" },
  ];

  const bazaarItems = [
    {
      id: 1,
      title: "iPhone 13 Pro - ako nový",
      price: 750,
      location: "Bratislava",
      timeAgo: "pred 2 hodinami",
      seller: "Peter K.",
      rating: 4.8,
      category: "electronics",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
      condition: "Ako nový",
      description: "Predávam iPhone 13 Pro v perfektnom stave, používaný len 6 mesiacov..."
    },
    {
      id: 2,
      title: "Dámske zimné čižmy veľ. 38",
      price: 45,
      location: "Košice",
      timeAgo: "pred 5 hodinami",
      seller: "Anna M.",
      rating: 4.6,
      category: "clothing",
      image: "https://images.unsplash.com/photo-1544966503-7adccccd7009?w=300&h=300&fit=crop",
      condition: "Použité",
      description: "Kvalitné zimné čižmy, nosené jednu sezónu..."
    },
    {
      id: 3,
      title: "Bicykel Cube - horský",
      price: 320,
      location: "Žilina",
      timeAgo: "pred 1 dňom",
      seller: "Michal T.",
      rating: 4.9,
      category: "sports",
      image: "https://images.unsplash.com/photo-1544191696-15693072f9b8?w=300&h=300&fit=crop",
      condition: "Veľmi dobré",
      description: "Horský bicykel v skvelom stave, pravidelne servisovaný..."
    },
    {
      id: 4,
      title: "Kávovar DeLonghi",
      price: 180,
      location: "Trnava",
      timeAgo: "pred 3 dňami",
      seller: "Lucia V.",
      rating: 4.7,
      category: "home",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
      condition: "Dobré",
      description: "Automatický kávovar, funguje perfektne..."
    },
    {
      id: 5,
      title: "Učebnice matematiky",
      price: 15,
      location: "Prešov",
      timeAgo: "pred 1 týždňom",
      seller: "Tomáš B.",
      rating: 4.5,
      category: "books",
      image: "https://images.unsplash.com/photo-1509266272358-7701da638078?w=300&h=300&fit=crop",
      condition: "Dobré",
      description: "Kompletná sada učebníc pre stredoškolskú matematiku..."
    },
    {
      id: 6,
      title: "Gaming chair",
      price: 120,
      location: "Banská Bystrica",
      timeAgo: "pred 2 týždňami",
      seller: "Jakub S.",
      rating: 4.4,
      category: "other",
      image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=300&fit=crop",
      condition: "Použité",
      description: "Pohodlná gaming stolička, len malé známky používania..."
    }
  ];

  const filteredItems = bazaarItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContact = (sellerName: string) => {
    toast({
      title: "Kontakt predajcu",
      description: `Kontaktovanie ${sellerName} - potrebné pripojenie k databáze`,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Online{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Bazár
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Kupuj a predávaj s dôverou v našej komunite
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Pridať inzerát
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nový inzerát</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Názov produktu" />
                <Input placeholder="Cena (€)" type="number" />
                <Input placeholder="Lokalita" />
                <Textarea placeholder="Popis produktu..." className="min-h-20" />
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Obrázok produktu</label>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Náhľad" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Kliknite pre nahratie obrázka
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max. 5MB (JPG, PNG, WEBP)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>

                <Button variant="hero" className="w-full" disabled={uploading}>
                  {uploading ? "Nahrávam..." : "Zverejniť inzerát"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať v bazári..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Trust Banner */}
        <Card className="mb-8 bg-gradient-secondary border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-2 mb-4 md:mb-0">
                <h3 className="text-xl font-bold">🛡️ Bezpečný nákup garantovaný</h3>
                <p className="text-muted-foreground">Všetci predajcovia sú overení členi našej komunity</p>
              </div>
              <Badge className="bg-success text-success-foreground">
                ✓ Overené profily
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground">
                    {item.condition}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="text-2xl font-bold text-success mb-3">
                  €{item.price}
                </div>

                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.timeAgo}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.seller} 
                    <span className="text-gold">★ {item.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>

                <Button 
                  className="w-full"
                  onClick={() => handleContact(item.seller)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Kontaktovať
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Žiadne inzeráty sa nenašli</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4"
            >
              Vymazať filtre
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">🔒 Bezpečnosť</h3>
              <p className="text-sm text-muted-foreground">
                Všetky transakcie sú chránené našim systémom
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">⚡ Rýchle doručenie</h3>
              <p className="text-sm text-muted-foreground">
                Lokálni predajcovia pre rýchle vyzdvihnutie
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">💬 Podpora</h3>
              <p className="text-sm text-muted-foreground">
                24/7 podpora pre všetkých členov komunity
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Bazaar;