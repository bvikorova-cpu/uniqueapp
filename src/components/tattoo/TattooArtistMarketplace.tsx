import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, MessageSquare, Search, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

const ARTISTS = [
  { id: 1, name: "Marcus Steele", specialty: "Realistic & Portrait", rating: 4.9, reviews: 342, location: "London, UK", hourlyRate: 180, avatar: "MS", styles: ["Realistic", "Portrait", "Color"], portfolio: 89 },
  { id: 2, name: "Yuki Tanaka", specialty: "Japanese Traditional", rating: 4.8, reviews: 275, location: "Tokyo, Japan", hourlyRate: 200, avatar: "YT", styles: ["Japanese", "Traditional", "Irezumi"], portfolio: 124 },
  { id: 3, name: "Elena Vasquez", specialty: "Watercolor & Fine Line", rating: 5.0, reviews: 198, location: "Barcelona, Spain", hourlyRate: 150, avatar: "EV", styles: ["Watercolor", "Fine Line", "Minimalist"], portfolio: 67 },
  { id: 4, name: "Dmitri Volkov", specialty: "Blackwork & Geometric", rating: 4.7, reviews: 412, location: "Berlin, Germany", hourlyRate: 160, avatar: "DV", styles: ["Blackwork", "Geometric", "Dotwork"], portfolio: 156 },
  { id: 5, name: "Priya Sharma", specialty: "Neo-Traditional", rating: 4.9, reviews: 231, location: "Mumbai, India", hourlyRate: 120, avatar: "PS", styles: ["Neo-Traditional", "Color", "Illustrative"], portfolio: 93 },
  { id: 6, name: "James Carter", specialty: "Biomechanical", rating: 4.8, reviews: 167, location: "New York, USA", hourlyRate: 220, avatar: "JC", styles: ["Biomechanical", "Surrealist", "3D"], portfolio: 78 },
];

export const TattooArtistMarketplace = ({ onBack }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const allStyles = [...new Set(ARTISTS.flatMap((a) => a.styles))];

  const filtered = ARTISTS.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.specialty.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchesStyle = !selectedStyle || a.styles.includes(selectedStyle);
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">Tattoo Artist Marketplace</h2>
        <p className="text-muted-foreground">Connect with world-class tattoo artists</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search artists, styles, locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={!selectedStyle ? "default" : "outline"} onClick={() => setSelectedStyle(null)}>All</Button>
          {allStyles.slice(0, 5).map((s) => (
            <Button key={s} size="sm" variant={selectedStyle === s ? "default" : "outline"} onClick={() => setSelectedStyle(selectedStyle === s ? null : s)}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {filtered.map((artist, i) => (
          <motion.div key={artist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-5 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.97] border-amber-500/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {artist.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg truncate">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground">{artist.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-semibold">{artist.rating}</span>
                    <span className="text-xs text-muted-foreground">({artist.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5" /> {artist.location}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {artist.styles.map((s) => (
                  <span key={s} className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black text-amber-600">€{artist.hourlyRate}/hr</span>
                <span className="text-xs text-muted-foreground">{artist.portfolio} works</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                  <MessageSquare className="h-3.5 w-3.5" /> Contact
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
