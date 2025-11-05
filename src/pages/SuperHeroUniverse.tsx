import { useState, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, Sphere, Text3D, Center } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Shield, 
  Users, 
  Trophy, 
  Sparkles, 
  Swords,
  Crown,
  Target,
  TrendingUp,
  Star,
  Plus,
  ArrowRight,
  Flame,
  Gem,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Enhanced 3D Hero Character Component with Dynamic Poses and Details
const HeroCharacter = ({ 
  position, 
  color, 
  pose = "ready" 
}: { 
  position: [number, number, number]; 
  color: string;
  pose?: "attack" | "defend" | "ready";
}) => {
  const groupRef = useRef<any>();
  
  // Animation based on pose
  const rotation = pose === "attack" ? [0.2, 0, 0.3] : pose === "defend" ? [-0.2, 0, -0.2] : [0, 0, 0];
  const armRotation = pose === "attack" ? -1.5 : pose === "defend" ? 0.5 : 0.3;
  
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} position={position} rotation={rotation as any}>
        {/* Torso - Muscular Build */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.35]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.4} 
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Chest Emblem */}
        <mesh position={[0, 0.4, 0.18]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Head with Mask */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.3} 
            roughness={0.4}
          />
        </mesh>
        
        {/* Helmet/Mask Detail */}
        <mesh position={[0, 1.05, 0.1]} castShadow>
          <boxGeometry args={[0.35, 0.15, 0.3]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.6} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Eyes Glow */}
        <mesh position={[-0.08, 1.05, 0.25]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        <mesh position={[0.08, 1.05, 0.25]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        
        {/* Left Arm - Dynamic Pose */}
        <group position={[-0.35, 0.4, 0]} rotation={[armRotation, 0, -0.5]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Fist */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Right Arm - Dynamic Pose */}
        <group position={[0.35, 0.4, 0]} rotation={[-armRotation, 0, 0.5]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Fist */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Legs */}
        <group position={[-0.12, -0.15, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.75, 0.05]} castShadow>
            <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -1.05, 0.1]} castShadow>
            <boxGeometry args={[0.15, 0.1, 0.25]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
        
        <group position={[0.12, -0.15, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.75, 0.05]} castShadow>
            <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -1.05, 0.1]} castShadow>
            <boxGeometry args={[0.15, 0.1, 0.25]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Dynamic Cape with Physics-like Movement */}
        <mesh position={[0, 0.5, -0.2]} rotation={[0.4, 0, 0]} castShadow>
          <planeGeometry args={[0.9, 1.5, 10, 10]} />
          <meshStandardMaterial 
            color={color} 
            side={2} 
            metalness={0.6} 
            roughness={0.4}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Power Aura - Larger and More Intense */}
        <Sphere args={[0.6, 32, 32]} position={[0, 0.3, 0]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.5}
            speed={3}
            roughness={0}
            transparent
            opacity={0.25}
          />
        </Sphere>
        
        {/* Energy Particles */}
        {pose === "attack" && (
          <>
            <mesh position={[0.5, 0.5, 0.5]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
            <mesh position={[-0.5, 0.6, 0.4]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color="#ff00ff" />
            </mesh>
            <mesh position={[0, 0.8, 0.6]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
          </>
        )}
      </group>
    </Float>
  );
};

// Energy Blast Effect
const EnergyBlast = ({ position, color }: { position: [number, number, number]; color: string }) => {
  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Sphere args={[0.3, 16, 16]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.8}
          speed={5}
          transparent
          opacity={0.4}
        />
      </Sphere>
    </Float>
  );
};

// Enhanced 3D Battle Scene Component
const BattleScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 10]} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        minDistance={6}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-10, 5, -5]} intensity={1} color="#9333ea" />
      <pointLight position={[10, 5, -5]} intensity={1} color="#3b82f6" />
      <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.6} penumbra={1} color="#ec4899" />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Heroes in Dynamic Combat Poses */}
      <HeroCharacter position={[-3, 0.5, 0]} color="#9333ea" pose="attack" />
      <HeroCharacter position={[3, 0.5, 0]} color="#3b82f6" pose="defend" />
      <HeroCharacter position={[0, 0.5, -3]} color="#ec4899" pose="ready" />
      
      {/* Energy Blasts */}
      <EnergyBlast position={[-1, 1.5, 0]} color="#9333ea" />
      <EnergyBlast position={[1, 1.5, 0]} color="#3b82f6" />
      
      {/* Battle Platform with Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial 
          color="#0f0a1f" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#4c1d95"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Hexagonal Energy Grid Pattern */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh 
          key={i} 
          rotation={[-Math.PI / 2, 0, (Math.PI / 3) * i]} 
          position={[0, -1.48, 0]}
        >
          <ringGeometry args={[2 + i * 0.5, 2.1 + i * 0.5, 6]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? "#9333ea" : "#3b82f6"} 
            transparent 
            opacity={0.3 - i * 0.04} 
          />
        </mesh>
      ))}
      
      {/* Lightning Effects */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
      </mesh>
    </>
  );
};

const SuperHeroUniverse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const heroStats = {
    totalHeroes: 12547,
    activeTeams: 3482,
    ongoingTournaments: 24,
    totalPrizePool: "$145,000"
  };

  const rarityTiers = [
    { name: "Common", color: "from-gray-400 to-gray-600", chance: "45%", bonus: "+0%" },
    { name: "Rare", color: "from-blue-400 to-blue-600", chance: "30%", bonus: "+10%" },
    { name: "Epic", color: "from-purple-400 to-purple-600", chance: "15%", bonus: "+25%" },
    { name: "Legendary", color: "from-yellow-400 to-yellow-600", chance: "8%", bonus: "+50%" },
    { name: "Mythic", color: "from-red-400 to-red-600", chance: "2%", bonus: "+100%" }
  ];

  const activeTournaments = [
    { 
      name: "Justice Champions League", 
      teams: 128, 
      prizePool: "$15,000", 
      endsIn: "2d 14h",
      entryFee: "500 credits"
    },
    { 
      name: "Avengers Battle Royale", 
      teams: 256, 
      prizePool: "$25,000", 
      endsIn: "5d 8h",
      entryFee: "750 credits"
    },
    { 
      name: "Cosmic Arena Showdown", 
      teams: 64, 
      prizePool: "$8,000", 
      endsIn: "1d 6h",
      entryFee: "300 credits"
    }
  ];

  const topTeams = [
    { rank: 1, name: "Guardians of Glory", power: 98500, wins: 247, icon: Crown },
    { rank: 2, name: "Supreme Defenders", power: 95200, wins: 234, icon: Shield },
    { rank: 3, name: "Cosmic Crusaders", power: 92100, wins: 221, icon: Rocket },
    { rank: 4, name: "Legendary Warriors", power: 88900, wins: 208, icon: Swords },
    { rank: 5, name: "Ultimate Champions", power: 85600, wins: 195, icon: Trophy }
  ];

  const handleCreateHero = () => {
    toast({
      title: "Coming Soon! 🦸",
      description: "Hero creation will be available soon. Stay tuned!",
    });
  };

  const handleJoinTournament = (tournament: string) => {
    toast({
      title: "Tournament Registration 🏆",
      description: `Registering for ${tournament}...`,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Exclusive Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 3D Hero Battle Scene */}
        <div className="w-full h-[500px] mb-12 rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <Canvas shadows>
            <Suspense fallback={null}>
              <BattleScene />
            </Suspense>
          </Canvas>
        </div>

        {/* Hero Section - Moved Lower */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 rounded-full mb-4 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              BUILD • BATTLE • DOMINATE
            </span>
            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
            SUPERHERO UNIVERSE
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Create legendary heroes, form unstoppable teams, and compete in epic tournaments for real prizes
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button 
              onClick={handleCreateHero}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-6 w-6 mr-2" />
              Create Your Hero
            </Button>
            <Button 
              onClick={() => setActiveTab("tournaments")}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-purple-500/50 text-white hover:bg-white/20 text-lg px-8 py-6 rounded-xl shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Trophy className="h-6 w-6 mr-2" />
              Join Tournaments
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-md border-purple-500/30 p-6 text-center hover:scale-105 transition-transform duration-300">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <div className="text-3xl font-bold text-white mb-1">{heroStats.totalHeroes.toLocaleString()}</div>
              <div className="text-sm text-purple-300">Total Heroes</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-md border-blue-500/30 p-6 text-center hover:scale-105 transition-transform duration-300">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-3xl font-bold text-white mb-1">{heroStats.activeTeams.toLocaleString()}</div>
              <div className="text-sm text-blue-300">Active Teams</div>
            </Card>
            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 backdrop-blur-md border-pink-500/30 p-6 text-center hover:scale-105 transition-transform duration-300">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-pink-400" />
              <div className="text-3xl font-bold text-white mb-1">{heroStats.ongoingTournaments}</div>
              <div className="text-sm text-pink-300">Live Tournaments</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 backdrop-blur-md border-yellow-500/30 p-6 text-center hover:scale-105 transition-transform duration-300">
              <Gem className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-3xl font-bold text-white mb-1">{heroStats.totalPrizePool}</div>
              <div className="text-sm text-yellow-300">Prize Pool</div>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-4xl mx-auto mb-8 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-white rounded-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-white rounded-lg">
              <Zap className="h-4 w-4 mr-2" />
              Create Hero
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-white rounded-lg">
              <Trophy className="h-4 w-4 mr-2" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 text-white rounded-lg">
              <Crown className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Rarity Tiers */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Gem className="h-8 w-8 text-purple-400" />
                Hero Rarity Tiers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {rarityTiers.map((tier) => (
                  <Card key={tier.name} className={`bg-gradient-to-br ${tier.color} p-6 border-0 hover:scale-105 transition-transform duration-300`}>
                    <div className="text-center">
                      <Star className="h-8 w-8 mx-auto mb-3 text-white" />
                      <h3 className="font-bold text-white text-lg mb-2">{tier.name}</h3>
                      <div className="space-y-1">
                        <div className="text-sm text-white/90">Drop: {tier.chance}</div>
                        <div className="text-sm text-white/90">Power: {tier.bonus}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-400" />
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">1. Create Heroes</h3>
                  <p className="text-gray-300">Design unique superheroes with AI-generated images and custom stats</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-pink-500/20 rounded-xl border border-blue-500/30">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">2. Form Teams</h3>
                  <p className="text-gray-300">Build powerful teams with synergies and shared resources</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/30">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">3. Win Prizes</h3>
                  <p className="text-gray-300">Compete in tournaments and earn real money rewards</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Create Hero Tab */}
          <TabsContent value="create" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-400" />
                Hero Creation
              </h2>
              <div className="text-center py-12">
                <Zap className="h-24 w-24 mx-auto mb-6 text-purple-400 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-4">Create Your First Hero</h3>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Use AI to generate unique superhero designs with custom powers, stats, and abilities. Each hero is one-of-a-kind!
                </p>
                <Button 
                  onClick={handleCreateHero}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-6 rounded-xl text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Start Creating (500 Credits)
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Active Tournaments
              </h2>
              <div className="space-y-4">
                {activeTournaments.map((tournament) => (
                  <Card key={tournament.name} className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md border-purple-500/30 p-6 hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                          <Flame className="h-6 w-6 text-orange-400" />
                          {tournament.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.teams} Teams
                          </span>
                          <span className="flex items-center gap-1">
                            <Gem className="h-4 w-4 text-yellow-400" />
                            {tournament.prizePool}
                          </span>
                          <Badge variant="outline" className="bg-red-500/20 border-red-500 text-red-300">
                            Ends in {tournament.endsIn}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleJoinTournament(tournament.name)}
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6"
                      >
                        Join ({tournament.entryFee})
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-400" />
                Top Teams
              </h2>
              <div className="space-y-3">
                {topTeams.map((team) => {
                  const Icon = team.icon;
                  const rankColors = {
                    1: "from-yellow-500 to-yellow-600",
                    2: "from-gray-300 to-gray-400",
                    3: "from-orange-600 to-orange-700"
                  };
                  const borderColors = {
                    1: "border-yellow-500",
                    2: "border-gray-400",
                    3: "border-orange-600"
                  };
                  
                  return (
                    <Card key={team.rank} className={`bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md ${team.rank <= 3 ? `border-2 ${borderColors[team.rank as keyof typeof borderColors]}` : 'border-white/10'} p-6 hover:scale-[1.02] transition-transform duration-300`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${team.rank <= 3 ? `bg-gradient-to-r ${rankColors[team.rank as keyof typeof rankColors]}` : 'bg-gradient-to-r from-purple-600 to-blue-600'} flex items-center justify-center font-bold text-white text-xl`}>
                          #{team.rank}
                        </div>
                        <Icon className="h-8 w-8 text-purple-400" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                          <div className="flex gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              Power: {team.power.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-blue-400" />
                              Wins: {team.wins}
                            </span>
                          </div>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperHeroUniverse;
