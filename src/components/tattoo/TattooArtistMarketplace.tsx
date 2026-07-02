import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, MessageSquare, Search, ExternalLink, Crown, Award } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const ARTISTS = [
  { id: 1, name: "Marcus Steele", specialty: "Realistic & Portrait", rating: 4.9, reviews: 342, location: "London, UK", hourlyRate: 180, avatar: "MS", styles: ["Realistic", "Portrait", "Color"], portfolio: 89, verified: true },
  { id: 2, name: "Yuki Tanaka", specialty: "Japanese Traditional", rating: 4.8, reviews: 275, location: "Tokyo, Japan", hourlyRate: 200, avatar: "YT", styles: ["Japanese", "Traditional", "Irezumi"], portfolio: 124, verified: true },
  { id: 3, name: "Elena Vasquez", specialty: "Watercolor & Fine Line", rating: 5.0, reviews: 198, location: "Barcelona, Spain", hourlyRate: 150, avatar: "EV", styles: ["Watercolor", "Fine Line", "Minimalist"], portfolio: 67, verified: true },
  { id: 4, name: "Dmitri Volkov", specialty: "Blackwork & Geometric", rating: 4.7, reviews: 412, location: "Berlin, Germany", hourlyRate: 160, avatar: "DV", styles: ["Blackwork", "Geometric", "Dotwork"], portfolio: 156, verified: false },
  { id: 5, name: "Priya Sharma", specialty: "Neo-Traditional", rating: 4.9, reviews: 231, location: "Mumbai, India", hourlyRate: 120, avatar: "PS", styles: ["Neo-Traditional", "Color", "Illustrative"], portfolio: 93, verified: true },
  { id: 6, name: "James Carter", specialty: "Biomechanical", rating: 4.8, reviews: 167, location: "New York, USA", hourlyRate: 220, avatar: "JC", styles: ["Biomechanical", "Surrealist", "3D"], portfolio: 78, verified: true },
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
    <>
      <FloatingHowItWorks title={"Tattoo Artist Marketplace - How it works"} steps={[{ title: 'Open', desc: 'Access the Tattoo Artist Marketplace section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tattoo Artist Marketplace.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-amber-400 hover:text-amber-300">
        <ArrowLeft className="h-4 w-4" /> Back to Atelier
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-5 w-5 text-amber-400" />
          <span className="text-amber-400/80 text-xs font-semibold tracking-[0.2em] uppercase">Curated Collection</span>
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black" style={{
          background: "linear-gradient(135deg, #D4AF37, #F5E6C8, #D4AF37)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Artist Marketplace
        </h2>
        <p className="text-muted-foreground mt-1">Connect with world-class tattoo masters</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/50" />
          <Input placeholder="Search artists, styles, locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-amber-500/20 focus:border-amber-500/50 bg-background/50" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={!selectedStyle ? "default" : "outline"} onClick={() => setSelectedStyle(null)} className={!selectedStyle ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold" : "border-amber-500/20"}>All</Button>
          {allStyles.slice(0, 5).map((s) => (
            <Button key={s} size="sm" variant={selectedStyle === s ? "default" : "outline"} onClick={() => setSelectedStyle(selectedStyle === s ? null : s)} className={selectedStyle === s ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold" : "border-amber-500/20 hover:border-amber-500/40"}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {filtered.map((artist, i) => (
          <motion.div key={artist.id} initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}>
            <Card className="p-5 bg-card/80 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] border-amber-500/10 hover:border-amber-500/30 relative overflow-hidden">
              {artist.verified && (
                <div className="absolute top-3 right-3">
                  <Award className="h-5 w-5 text-amber-400" />
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black text-lg flex-shrink-0 shadow-lg shadow-amber-500/20">
                  {artist.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg truncate">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground">{artist.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-amber-400">{artist.rating}</span>
                    <span className="text-xs text-muted-foreground">({artist.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 text-amber-500/50" /> {artist.location}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {artist.styles.map((s) => (
                  <span key={s} className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black" style={{
                  background: "linear-gradient(135deg, #D4AF37, #F5E6C8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>€{artist.hourlyRate}/hr</span>
                <span className="text-xs text-muted-foreground">{artist.portfolio} works</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold shadow-lg shadow-amber-500/20" onClick={() => { window.location.href = `/messenger?to=tattoo-artist-${artist.id}&name=${encodeURIComponent(artist.name)}`; }}>
                  <MessageSquare className="h-3.5 w-3.5" /> Contact
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5" onClick={() => { window.location.href = `/ai-tattoo?artist=${artist.id}&view=portfolio`; }}>
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
