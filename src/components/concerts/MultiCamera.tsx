import { useState } from "react";
import { ArrowLeft, Camera, Monitor, Maximize2, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const CAMERA_ANGLES = [
  { id: "main", label: "Main Stage", description: "Front center view", icon: "🎤", color: "bg-red-500" },
  { id: "close", label: "Close-Up", description: "Artist face & hands", icon: "🔍", color: "bg-violet-500" },
  { id: "crowd", label: "Crowd Cam", description: "Audience energy view", icon: "👥", color: "bg-blue-500" },
  { id: "aerial", label: "Aerial", description: "Drone overhead shot", icon: "🚁", color: "bg-emerald-500" },
  { id: "backstage", label: "Backstage", description: "Behind the scenes", icon: "🎬", color: "bg-amber-500" },
  { id: "side", label: "Side Stage", description: "Profile angle view", icon: "📐", color: "bg-pink-500" },
];

export const MultiCamera = ({ onBack }: Props) => {
  const [activeCamera, setActiveCamera] = useState("main");
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 5000) + 1000);

  const currentCam = CAMERA_ANGLES.find(c => c.id === activeCamera)!;

  return (
    <>
      <FloatingHowItWorks title="How Multi Camera works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Multi-Camera View
          </h2>
          <p className="text-sm text-muted-foreground">Switch between 6 camera angles in real-time</p>
        </div>
      </div>

      {/* Main Video Area */}
      <Card className="overflow-hidden border-primary/20">
        <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          
          {/* Simulated video content */}
          <div className="text-center z-0">
            <span className="text-6xl mb-4 block">{currentCam.icon}</span>
            <p className="text-white/70 text-lg font-bold">{currentCam.label}</p>
            <p className="text-white/50 text-sm">{currentCam.description}</p>
          </div>

          {/* Top Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white border-0 animate-pulse">● LIVE</Badge>
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">{viewerCount.toLocaleString()} watching</Badge>
            </div>
            <Badge variant="outline" className="bg-black/50 text-white border-white/20">
              <Camera className="w-3 h-3 mr-1" /> {currentCam.label}
            </Badge>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Camera Grid */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Camera Angles</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CAMERA_ANGLES.map((cam) => (
            <motion.div
              key={cam.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCamera(cam.id)}
              className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${
                activeCamera === cam.id
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className={`w-8 h-8 mx-auto rounded-lg ${cam.color} flex items-center justify-center mb-1`}>
                <span className="text-sm">{cam.icon}</span>
              </div>
              <p className="text-xs font-bold truncate">{cam.label}</p>
              {activeCamera === cam.id && (
                <Badge className="mt-1 text-[10px] bg-primary/20 text-primary border-0">Active</Badge>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Picture-in-Picture Preview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-3 text-sm">All Cameras Preview</h3>
          <div className="grid grid-cols-3 gap-2">
            {CAMERA_ANGLES.filter(c => c.id !== activeCamera).map(cam => (
              <motion.div
                key={cam.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveCamera(cam.id)}
                className="cursor-pointer aspect-video rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center border border-border hover:border-primary/50 transition-all"
              >
                <span className="text-xl">{cam.icon}</span>
                <p className="text-[10px] text-white/60 mt-1">{cam.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
