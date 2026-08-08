import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Loader2, Navigation, Phone, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface NearbyResult {
  name: string;
  type: string;
  address: string;
  distance: string;
  hours: string;
  phone: string;
  hasAED: boolean;
}

export const FirstAidMap = ({ onBack }: Props) => {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<NearbyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"all" | "aed" | "pharmacy" | "hospital">("all");
  const { toast } = useToast();

  const searchNearby = async () => {
    if (!location.trim()) { toast({ title: "Enter a location", variant: "destructive" }); return; }

    setLoading(true);
    try {
      const filterText = searchType === "all" ? "AEDs, pharmacies, hospitals, and urgent care centers" :
        searchType === "aed" ? "AED (Automated External Defibrillator) locations" :
        searchType === "pharmacy" ? "pharmacies and drugstores" : "hospitals and emergency rooms";

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "first_aid_map", module: "first_aid",
          customPrompt: `List 8 ${filterText} near "${location}". Return ONLY the JSON array.` } });
      if (error) throw error;
      const text = data?.message || data?.analysis || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      let parsed: NearbyResult[] = [];
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* tolerant fallback below */ }
      }
      if (!parsed.length) {
        // Tolerant salvage: extract individual objects even if the array is truncated
        const objs = text.match(/\{[^{}]*\}/g) || [];
        parsed = objs.map((o: string) => { try { return JSON.parse(o); } catch { return null; } })
          .filter((o: any) => o && o.name);
      }
      if (!parsed.length) {
        toast({ title: "No results", description: "Try a different or more specific location.", variant: "destructive" });
      }
      setResults(parsed);

    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, string> = { AED: "bg-red-100 text-red-700",
    Pharmacy: "bg-green-100 text-green-700",
    Hospital: "bg-blue-100 text-blue-700",
    "Urgent Care": "bg-orange-100 text-orange-700",
    "Fire Station": "bg-yellow-100 text-yellow-700" };

  const filteredResults = searchType === "all" ? results :
    searchType === "aed" ? results.filter(r => r.hasAED || r.type === "AED") :
    searchType === "pharmacy" ? results.filter(r => r.type === "Pharmacy") :
    results.filter(r => r.type === "Hospital" || r.type === "Urgent Care");

  return (
    <>
      <FloatingHowItWorks title={"First Aid Map - How it works"} steps={[{ title: 'Open', desc: 'Access the First Aid Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in First Aid Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Badge className="bg-red-100 text-red-700">3 Credits</Badge>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">First Aid Map</h2>
        <p className="text-muted-foreground">Find nearby AEDs, pharmacies & emergency facilities</p>
      </div>

      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Enter your city or address..." value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === "Enter" && searchNearby()} />
            <Button onClick={searchNearby} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "aed", "pharmacy", "hospital"] as const).map(type => (
              <Badge key={type} variant={searchType === type ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setSearchType(type)}>
                {type === "aed" ? "🫀 AEDs" : type === "pharmacy" ? "💊 Pharmacies" : type === "hospital" ? "🏥 Hospitals" : "📍 All"}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card><CardContent className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" /><p className="text-sm">Searching nearby facilities...</p></CardContent></Card>
      )}

      {filteredResults.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{filteredResults.length} facilities found near "{location}"</p>
          {filteredResults.map((r, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{r.name}</p>
                      <Badge className={`text-[10px] ${typeColors[r.type] || "bg-gray-100 text-gray-700"}`}>{r.type}</Badge>
                      {r.hasAED && <Badge className="bg-red-100 text-red-600 text-[10px]">🫀 AED</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.address}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.hours}</span>
                    </div>
                  </div>
                  <a href={`tel:${r.phone}`} className="flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-9 w-9"><Phone className="w-4 h-4" /></Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
