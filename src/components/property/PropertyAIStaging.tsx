import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wand2, Upload, Palette, Sofa, Sparkles, Image } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const STYLES = [
  { id: "modern", name: "Modern", emoji: "🏢", desc: "Clean lines, neutral tones" },
  { id: "scandinavian", name: "Scandinavian", emoji: "🌿", desc: "Light wood, minimal" },
  { id: "industrial", name: "Industrial", emoji: "🏭", desc: "Raw materials, open spaces" },
  { id: "luxury", name: "Luxury", emoji: "✨", desc: "Premium finishes, elegant" },
  { id: "bohemian", name: "Bohemian", emoji: "🎨", desc: "Eclectic, colorful" },
  { id: "minimalist", name: "Minimalist", emoji: "⬜", desc: "Less is more" },
];

const ROOMS = [
  { id: "living", name: "Living Room", icon: Sofa },
  { id: "bedroom", name: "Bedroom", icon: Image },
  { id: "kitchen", name: "Kitchen", icon: Palette },
  { id: "bathroom", name: "Bathroom", icon: Sparkles },
];

export const PropertyAIStaging = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [uploaded, setUploaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const downloadStagingConfig = () => {
    const room = ROOMS.find(r => r.id === selectedRoom)?.name || selectedRoom;
    const style = STYLES.find(s => s.id === selectedStyle);
    const content = [
      "AI Home Staging — Configuration",
      "================================",
      `Generated: ${new Date().toLocaleString()}`,
      `Room: ${room}`,
      `Style: ${style?.name} ${style?.emoji}`,
      `Description: ${style?.desc}`,
      "",
      "Apply this configuration when listing your property to attract more views.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staging-${selectedRoom}-${selectedStyle}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Staging config downloaded");
  };

  const useInListing = () => {
    const params = new URLSearchParams({
      staged: "1",
      room: selectedRoom,
      style: selectedStyle,
    });
    navigate(`/property-submission?${params.toString()}`);
    toast.success("Staging applied to your new listing");
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property A I Staging - How it works"} steps={[{ title: 'Open', desc: 'Access the Property A I Staging section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property A I Staging.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            <Wand2 className="w-6 h-6 text-pink-500" />
            AI Home Staging
          </CardTitle>
          <p className="text-sm text-muted-foreground">Transform empty rooms into beautifully staged spaces with AI</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Upload Room Photo
            </h3>
            <div
              onClick={() => setUploaded(true)}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                uploaded ? "border-green-500/50 bg-green-500/5" : "border-border/50 hover:border-primary/50"
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${uploaded ? "text-green-500" : "text-muted-foreground"}`} />
              <p className="text-sm text-muted-foreground">
                {uploaded ? "✅ Photo uploaded successfully" : "Click to upload a room photo"}
              </p>
            </div>
          </div>

          {/* Step 2: Room Type */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Select Room Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ROOMS.map(room => (
                <Button
                  key={room.id}
                  variant={selectedRoom === room.id ? "default" : "outline"}
                  className={`h-auto py-3 flex-col gap-1 ${selectedRoom === room.id ? "bg-gradient-to-r from-sky-500 to-blue-600" : ""}`}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <room.icon className="w-4 h-4" />
                  <span className="text-xs">{room.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Step 3: Style */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              Choose Style
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STYLES.map(style => (
                <motion.div
                  key={style.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStyle === style.id
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-border/30 bg-card/60 hover:border-border/60"
                  }`}
                >
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <p className="text-sm font-bold">{style.name}</p>
                  <p className="text-[10px] text-muted-foreground">{style.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={!uploaded || !selectedRoom || !selectedStyle || generating}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white"
            size="lg"
          >
            {generating ? (
              <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> AI is staging your room...</>
            ) : generated ? (
              <><Wand2 className="w-4 h-4 mr-2" /> Regenerate Staging</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" /> Generate AI Staging</>
            )}
          </Button>

          {/* Result */}
          {generated && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-pink-500/20">
                <CardContent className="p-6 text-center">
                  <div className="w-full h-48 bg-gradient-to-br from-sky-900/20 to-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Wand2 className="w-12 h-12 text-pink-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">AI-staged room preview</p>
                      <p className="text-xs text-muted-foreground">Connect AI API for real staging</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={downloadStagingConfig}>Download</Button>
                    <Button size="sm" className="bg-gradient-to-r from-sky-500 to-blue-600" onClick={useInListing}>Use in Listing</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
