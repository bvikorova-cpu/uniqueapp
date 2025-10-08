import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, MapPin, Clock, User, MessageCircle, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BazaarItem {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  category: string;
  condition: string;
  listing_type: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

const Bazaar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BazaarItem | null>(null);
  const [items, setItems] = useState<BazaarItem[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
    category: "electronics",
    condition: "Ako nový",
    listing_type: "sell",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('bazaar_items')
      .select('*, profiles(full_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading items:', error);
      return;
    }

    setItems(data || []);
  };

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

  const conditions = ["Ako nový", "Veľmi dobré", "Dobré", "Použité"];

  const listingTypes = [
    { id: "sell", name: "Predám" },
    { id: "buy", name: "Kúpim" },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "pred chvíľou";
    if (diffInHours < 24) return `pred ${diffInHours} hodinami`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "pred 1 dňom";
    if (diffInDays < 7) return `pred ${diffInDays} dňami`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return "pred 1 týždňom";
    return `pred ${diffInWeeks} týždňami`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.location) {
      toast({
        title: "Chyba",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Chyba",
          description: "Musíte byť prihlásený",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('bazaar_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('bazaar_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('bazaar_items')
        .insert({
          user_id: user.id,
          title: formData.title,
          price: parseFloat(formData.price),
          location: formData.location,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          listing_type: formData.listing_type,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Úspech",
        description: "Inzerát bol pridaný",
      });

      setFormData({ title: "", price: "", location: "", description: "", category: "electronics", condition: "Ako nový", listing_type: "sell" });
      setImageFile(null);
      setImagePreview("");
      setIsDialogOpen(false);
      loadItems();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať inzerát",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleContact = (item: BazaarItem) => {
    toast({
      title: "Kontakt predajcu",
      description: `Kontaktovanie predajcu - funkcia bude dostupná čoskoro`,
    });
  };

  const openDetail = (item: BazaarItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Typ inzerátu</label>
                  <Select 
                    value={formData.listing_type} 
                    onValueChange={(value) => setFormData({...formData, listing_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {listingTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  placeholder="Názov produktu" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                <Input 
                  placeholder="Cena (€)" 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <Input 
                  placeholder="Lokalita"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
                <Textarea 
                  placeholder="Popis produktu..." 
                  className="min-h-20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Kategória</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.id !== "all").map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Stav</label>
                  <Select 
                    value={formData.condition} 
                    onValueChange={(value) => setFormData({...formData, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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

                <Button variant="hero" className="w-full" disabled={uploading} onClick={handleSubmit}>
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
                    src={item.image_url || "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=300&h=300&fit=crop"}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground">
                    {item.condition}
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
                    {listingTypes.find(t => t.id === item.listing_type)?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 
                  className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                  onClick={() => openDetail(item)}
                >
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
                    {getTimeAgo(item.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.profiles?.full_name || "Anonymný užívateľ"}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-6">
                {selectedItem.image_url && (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={selectedItem.listing_type === 'sell' ? 'default' : 'secondary'}>
                        {listingTypes.find(t => t.id === selectedItem.listing_type)?.name}
                      </Badge>
                      <Badge>{selectedItem.condition}</Badge>
                    </div>
                    <div className="text-3xl font-bold text-success">
                      €{selectedItem.price}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{getTimeAgo(selectedItem.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedItem.profiles?.full_name || "Anonymný užívateľ"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Kategória</h4>
                    <p className="text-muted-foreground">
                      {categories.find(c => c.id === selectedItem.category)?.name}
                    </p>
                  </div>

                  {selectedItem.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Popis</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handleContact(selectedItem)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Kontaktovať predajcu
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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