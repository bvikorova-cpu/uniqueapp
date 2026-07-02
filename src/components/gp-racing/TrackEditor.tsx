import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, RotateCcw, Save, Share2, Play, MapPin, Ruler, Mountain, Waves, Zap } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TrackSegment {
  id: string;
  type: "straight" | "left_turn" | "right_turn" | "chicane" | "hairpin" | "s_curve";
  length: number;
  elevation: number;
}

const segmentOptions = [
  { type: "straight", label: "Straight", icon: "━━", color: "bg-cyan-500" },
  { type: "left_turn", label: "Left Turn", icon: "╭━", color: "bg-blue-500" },
  { type: "right_turn", label: "Right Turn", icon: "━╮", color: "bg-blue-400" },
  { type: "chicane", label: "Chicane", icon: "〰", color: "bg-amber-500" },
  { type: "hairpin", label: "Hairpin", icon: "↩", color: "bg-red-500" },
  { type: "s_curve", label: "S-Curve", icon: "∿", color: "bg-violet-500" },
];

const communityTracks = [
  { name: "Neon City Circuit", author: "James K.", segments: 12, length: "4.2 km", rating: 4.8, plays: 342 },
  { name: "Mountain Pass Rally", author: "Priya S.", segments: 18, length: "6.1 km", rating: 4.5, plays: 218 },
  { name: "Desert Storm Track", author: "Omar H.", segments: 8, length: "3.0 km", rating: 4.2, plays: 156 },
  { name: "Arctic Drift Course", author: "Yuki T.", segments: 15, length: "5.5 km", rating: 4.9, plays: 489 },
];

export function TrackEditor({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"editor" | "community">("editor");
  const [trackName, setTrackName] = useState("");
  const [trackTheme, setTrackTheme] = useState("neon_city");
  const [segments, setSegments] = useState<TrackSegment[]>([
    { id: "1", type: "straight", length: 500, elevation: 0 },
    { id: "2", type: "left_turn", length: 200, elevation: 5 },
    { id: "3", type: "straight", length: 300, elevation: 0 },
  ]);

  const addSegment = (type: string) => {
    setSegments([...segments, {
      id: Date.now().toString(),
      type: type as TrackSegment["type"],
      length: 200,
      elevation: 0,
    }]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) { toast.error("Track needs at least 2 segments"); return; }
    setSegments(segments.filter(s => s.id !== id));
  };

  const updateSegment = (id: string, field: "length" | "elevation", value: number) => {
    setSegments(segments.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const totalLength = segments.reduce((s, seg) => s + seg.length, 0);
  const totalElevation = segments.reduce((s, seg) => s + Math.abs(seg.elevation), 0);

  const saveTrack = () => {
    if (!trackName) { toast.error("Please name your track"); return; }
    toast.success(`Track "${trackName}" saved! 🏗️`);
  };

  const shareTrack = () => {
    if (!trackName) { toast.error("Save your track first"); return; }
    toast.success(`Track "${trackName}" shared with the community! 🌍`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Track Editor - How it works"} steps={[{ title: 'Open', desc: 'Access the Track Editor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Track Editor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Track Editor</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Design custom race circuits</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === "editor" ? "default" : "outline"} size="sm" onClick={() => setTab("editor")}
          className={tab === "editor" ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase" : "border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase"}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Editor
        </Button>
        <Button variant={tab === "community" ? "default" : "outline"} size="sm" onClick={() => setTab("community")}
          className={tab === "community" ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase" : "border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase"}>
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Community
        </Button>
      </div>

      {tab === "editor" && (
        <div className="space-y-4">
          {/* Track Settings */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Track Name</Label>
                <Input value={trackName} onChange={e => setTrackName(e.target.value)} placeholder="Enter track name..."
                  className="bg-slate-900/50 border-cyan-500/30 text-white font-mono placeholder:text-cyan-400/30 mt-1" />
              </div>
              <div>
                <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Theme</Label>
                <Select value={trackTheme} onValueChange={setTrackTheme}>
                  <SelectTrigger className="bg-slate-900/50 border-cyan-500/30 text-white font-mono mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-950 border-cyan-500/30">
                    <SelectItem value="neon_city">Neon City</SelectItem>
                    <SelectItem value="desert">Desert Canyon</SelectItem>
                    <SelectItem value="arctic">Arctic Tundra</SelectItem>
                    <SelectItem value="forest">Forest Trail</SelectItem>
                    <SelectItem value="space">Space Station</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={saveTrack} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/20 font-mono text-xs uppercase">
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
                <Button onClick={shareTrack} variant="outline" className="border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Track Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-slate-900/60 border-cyan-500/15 backdrop-blur-sm text-center">
              <Ruler className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
              <p className="font-mono font-bold text-white">{(totalLength / 1000).toFixed(1)} km</p>
              <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Total Length</p>
            </Card>
            <Card className="p-3 bg-slate-900/60 border-cyan-500/15 backdrop-blur-sm text-center">
              <MapPin className="h-4 w-4 mx-auto text-amber-400 mb-1" />
              <p className="font-mono font-bold text-white">{segments.length}</p>
              <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Segments</p>
            </Card>
            <Card className="p-3 bg-slate-900/60 border-cyan-500/15 backdrop-blur-sm text-center">
              <Mountain className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
              <p className="font-mono font-bold text-white">{totalElevation}m</p>
              <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Elevation</p>
            </Card>
          </div>

          {/* Add Segment */}
          <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">Add Segment</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {segmentOptions.map(opt => (
                <Button key={opt.type} variant="outline" onClick={() => addSegment(opt.type)}
                  className="border-cyan-500/20 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs flex flex-col h-auto py-3">
                  <span className="text-lg mb-1">{opt.icon}</span>
                  <span className="text-[9px]">{opt.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Track Segments List */}
          <div className="space-y-2">
            {segments.map((seg, i) => {
              const segInfo = segmentOptions.find(s => s.type === seg.type);
              return (
                <motion.div key={seg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-cyan-500/10 backdrop-blur-sm">
                  <div className={`w-8 h-8 rounded-lg ${segInfo?.color || "bg-gray-500"} bg-opacity-20 flex items-center justify-center font-mono text-sm text-white`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono font-bold text-sm text-white">{segInfo?.label || seg.type}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-cyan-400/40">Length:</span>
                        <input type="range" min={100} max={1000} step={50} value={seg.length}
                          onChange={e => updateSegment(seg.id, "length", Number(e.target.value))}
                          className="w-20 h-1 accent-cyan-400" />
                        <span className="text-[9px] font-mono text-cyan-300 w-10">{seg.length}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-cyan-400/40">Elev:</span>
                        <input type="range" min={-20} max={20} step={1} value={seg.elevation}
                          onChange={e => updateSegment(seg.id, "elevation", Number(e.target.value))}
                          className="w-16 h-1 accent-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-300 w-8">{seg.elevation}m</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSegment(seg.id)} className="text-red-400/50 hover:text-red-400 hover:bg-red-950/30 h-8 w-8">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Visual Preview */}
          <Card className="p-4 bg-slate-950/60 border-cyan-500/15 backdrop-blur-sm">
            <h3 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">Track Preview</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {segments.map((seg, i) => {
                const segInfo = segmentOptions.find(s => s.type === seg.type);
                const width = Math.max(30, seg.length / 15);
                return (
                  <motion.div key={seg.id} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05 }}
                    className={`h-8 rounded ${segInfo?.color || "bg-gray-500"} flex items-center justify-center`} style={{ width, minWidth: 30, opacity: 0.6 + (seg.elevation + 20) / 60 }}>
                    <span className="text-[8px] font-mono text-white/80">{segInfo?.icon}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          <Button onClick={() => toast.success("Race started on custom track! 🏎️")}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400/30 font-mono uppercase tracking-wider py-5">
            <Play className="h-4 w-4 mr-2" /> Test Drive This Track
          </Button>
        </div>
      )}

      {tab === "community" && (
        <div className="space-y-3">
          {communityTracks.map((track, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono font-bold text-white">{track.name}</h3>
                    <p className="text-[10px] font-mono text-cyan-400/40 mt-0.5">by {track.author} • {track.segments} segments • {track.length}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-amber-400">⭐ {track.rating}</p>
                      <p className="text-[9px] font-mono text-cyan-400/30">{track.plays} plays</p>
                    </div>
                    <Button size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/20 text-cyan-300 font-mono text-[10px]" onClick={() => { window.location.href = `/gp-racing?track=${encodeURIComponent(track.name)}&action=race`; }}>
                      <Play className="h-3 w-3 mr-1" /> Race
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
