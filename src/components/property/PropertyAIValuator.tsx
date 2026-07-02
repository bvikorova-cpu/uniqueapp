import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, TrendingUp, MapPin, Home, BarChart3, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const PropertyAIValuator = ({ onBack }: Props) => {
  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    type: "",
    area: "",
    rooms: "",
    condition: "",
    year: "",
  });

  const estimatedValue = Math.round(
    (parseInt(formData.area || "80") * 2200) +
    (parseInt(formData.rooms || "3") * 15000) +
    (formData.condition === "new" ? 30000 : formData.condition === "renovated" ? 15000 : 0)
  );

  const handleValuate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("result");
    }, 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property A I Valuator - How it works"} steps={[{ title: 'Open', desc: 'Access the Property A I Valuator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property A I Valuator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            <Brain className="w-6 h-6 text-purple-500" />
            AI Property Valuator
          </CardTitle>
          <p className="text-sm text-muted-foreground">Get an instant AI-powered property valuation based on market data</p>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="City, district..." className="pl-9" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area (m²)</Label>
                    <Input type="number" placeholder="80" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input type="number" placeholder="3" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v})}>
                      <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Build</SelectItem>
                        <SelectItem value="renovated">Renovated</SelectItem>
                        <SelectItem value="original">Original State</SelectItem>
                        <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year Built</Label>
                    <Input type="number" placeholder="2010" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                  </div>
                </div>
                <Button onClick={handleValuate} className="w-full bg-gradient-to-r from-purple-500 to-violet-600" disabled={loading}>
                  {loading ? (
                    <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> AI is analyzing...</>
                  ) : (
                    <><Brain className="w-4 h-4 mr-2" /> Get AI Valuation</>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                  <p className="text-sm text-muted-foreground mb-2">Estimated Market Value</p>
                  <div className="text-5xl font-black bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">
                    €{estimatedValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Based on {formData.area || 80}m² in {formData.location || "your area"}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-red-500/10 border-red-500/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Low Estimate</p>
                      <p className="text-lg font-black text-red-500">€{Math.round(estimatedValue * 0.85).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/10 border-green-500/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Fair Value</p>
                      <p className="text-lg font-black text-green-500">€{estimatedValue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">High Estimate</p>
                      <p className="text-lg font-black text-blue-500">€{Math.round(estimatedValue * 1.15).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Price per m²", value: `€${Math.round(estimatedValue / parseInt(formData.area || "80")).toLocaleString()}`, icon: BarChart3, color: "text-sky-500" },
                    { label: "Market Trend", value: "+8.5%/year", icon: TrendingUp, color: "text-green-500" },
                  ].map((item, i) => (
                    <Card key={i} className="bg-card/60 border-border/30">
                      <CardContent className="p-3 flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-bold">{item.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={() => setStep("form")} variant="outline" className="w-full">
                  New Valuation
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
