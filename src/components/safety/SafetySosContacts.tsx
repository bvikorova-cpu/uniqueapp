import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Globe, MessageCircle, Search, ExternalLink, Heart, MapPin, Loader2, AlertTriangle, Shield } from "lucide-react";
import { useSosCountry } from "@/hooks/useSafetyExtras";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SafetySosContacts = () => {
  const { code, data, allCountries, setCountry, isLoading } = useSosCountry();
  const [search, setSearch] = useState("");

  const filteredNumbers = useMemo(() => {
    if (!search) return data.numbers;
    return data.numbers.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <>
      <FloatingHowItWorks title={"Safety Sos Contacts - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Sos Contacts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Sos Contacts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-5">
      {/* CRITICAL EMERGENCY BANNER */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-2 border-red-400/60 shadow-2xl shadow-red-600/40"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <AlertTriangle className="h-8 w-8 animate-pulse" />
            <div>
              <p className="text-2xl font-black">In immediate danger?</p>
              <p className="text-sm opacity-90">One-tap call your local emergency line</p>
            </div>
          </div>
          <a href={`tel:${data.numbers[0]?.tel}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white text-red-700 hover:bg-white/90 font-black text-lg gap-2 shadow-lg">
              <Phone className="h-5 w-5" /> CALL {data.numbers[0]?.tel}
            </Button>
          </a>
        </div>
      </motion.div>

      {/* Auto-detected country card */}
      <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-teal-400" />
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Detected: <span className="text-2xl">{data.flag}</span> {data.country}</>}
          </CardTitle>
          <CardDescription className="text-xs">Wrong country? Pick yours below — we'll cache it offline.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={code} onValueChange={(v) => setCountry.mutate(v)}>
            <SelectTrigger className="bg-card/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(allCountries).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.flag} {v.country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hotlines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card/60" />
      </div>

      {/* 1-tap call grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {filteredNumbers.map((n, i) => (
          <motion.div
            key={n.tel + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-md hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-teal-400" />
                      <p className="font-bold text-foreground">{n.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.note || "24/7 confidential"}</p>
                    <p className="text-sm font-mono text-teal-300 mt-1">{n.tel}</p>
                  </div>
                </div>
                <a href={n.note?.startsWith("Text") ? `sms:${n.tel}?body=HOME` : `tel:${n.tel}`}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-500 group-hover:scale-[1.02] transition-transform">
                    {n.note?.startsWith("Text") ? <MessageCircle className="h-4 w-4 mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
                    {n.note?.startsWith("Text") ? "Text Now" : "Call Now"}
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Global directory link */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md">
        <CardContent className="pt-6 text-center">
          <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm">
            More countries:{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline inline-flex items-center gap-1">
              findahelpline.com <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default SafetySosContacts;
