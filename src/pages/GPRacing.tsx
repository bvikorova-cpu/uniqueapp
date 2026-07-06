import { useState, useEffect, Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Zap, Users, Star, Loader2, Flame, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import f1Background from "@/assets/f1-racing-background.jpg";

// 3D F1 Car Component
function GPCar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Car Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1, 0.4, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Front Wing */}
      <mesh position={[1.2, 0.1, 0]}>
        <boxGeometry args={[0.4, 0.1, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Rear Wing */}
      <mesh position={[-1, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.6, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Wheels */}
      {[
        [0.8, 0, 0.6],
        [0.8, 0, -0.6],
        [-0.8, 0, 0.6],
        [-0.8, 0, -0.6],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// 3D Track Component
function Track() {
  return (
    <group>
      {/* Track surface */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Track lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, -0.48, -45 + i * 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Barriers */}
      {[-8, 8].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.5, 1, 100]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ))}
    </group>
  );
}

// Camera that follows the player car along Z axis
function ChaseCamera({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();
  useFrame(() => {
    const desiredZ = targetZ + 14;
    camera.position.x += (0 - camera.position.x) * 0.05;
    camera.position.y += (8 - camera.position.y) * 0.05;
    camera.position.z += (desiredZ - camera.position.z) * 0.08;
    camera.lookAt(0, 0, targetZ - 5);
  });
  return null;
}

// 3D Scene Component
function RaceScene({ cars, playerZ, isRacing }: { cars: Array<{ x: number; z: number; color: string }>; playerZ: number; isRacing: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={55} />
      {isRacing ? <ChaseCamera targetZ={playerZ} /> : (
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={10} maxDistance={50} />
      )}

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <Track />
      {cars.map((car, i) => (
        <GPCar key={i} position={[car.x, 0, car.z]} color={car.color} />
      ))}

      <Environment preset="sunset" />
    </>
  );
}

const GPRacing = () => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRacing, setIsRacing] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0);
  const backgroundImage = f1Background;
  const [position, setPosition] = useState(1);
  const [speed, setSpeed] = useState(0);
  const [boostCharges, setBoostCharges] = useState(3);
  const [lap, setLap] = useState(1);
  const FINISH_Z = -85;
  const TOTAL_LAPS = 2;

  const initialCars = [
    { x: 0,  z: 0,  color: "#e10600", baseSpeed: 0.32, name: "You" },
    { x: -3, z: -2, color: "#dc0000", baseSpeed: 0.30, name: "Ferrari" },
    { x: 3,  z: -4, color: "#00d2be", baseSpeed: 0.31, name: "Mercedes" },
    { x: -3, z: -6, color: "#ff8700", baseSpeed: 0.29, name: "McLaren" },
  ];
  const [cars, setCars] = useState(initialCars);
  const boostRef = useRef(0); // remaining boost frames for player
  const lapRef = useRef(1);
  const finishedRef = useRef(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-f1-subscription');
      if (error) throw error;

      setIsSubscribed(data.subscribed);
      setTier(data.tier);

      if (data.subscribed) {
        const { data: creditsData } = await supabase
          .from('f1_user_credits')
          .select('credits')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (creditsData) {
          setCredits(creditsData.credits);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = () => {
    if (!isRacing || boostCharges <= 0 || boostRef.current > 0) return;
    boostRef.current = 25; // ~1.25s of boost at 50ms tick
    setBoostCharges(c => c - 1);
  };

  const startRace = async () => {
    if (credits < 10) {
      toast.error("Not enough credits! You need 10 credits to race.");
      return;
    }
    const { chargeGPAction } = await import("@/lib/moduleCreditActions");
    const charge = await chargeGPAction("join-race");
    if (!charge.ok) return;


    setCars(initialCars);
    setIsRacing(true);
    setRaceProgress(0);
    setSpeed(0);
    setBoostCharges(3);
    setLap(1);
    setPosition(1);
    lapRef.current = 1;
    finishedRef.current = false;
    boostRef.current = 0;

    const startedAt = Date.now();
    const interval = setInterval(() => {
      setCars(prev => {
        // Advance each car
        const next = prev.map((c, idx) => {
          const isPlayer = idx === 0;
          const jitter = (Math.random() - 0.5) * 0.06;
          const boost = isPlayer && boostRef.current > 0 ? 0.35 : 0;
          // Subtle AI rubber-banding so the race feels close
          const playerZ = prev[0].z;
          const rubber = !isPlayer ? (playerZ - c.z) * 0.002 : 0;
          let dz = -(c.baseSpeed + jitter + boost + rubber);
          // Gentle lane drift
          const dx = Math.sin((Date.now() / 600) + idx) * 0.015;
          return { ...c, z: c.z + dz, x: Math.max(-6, Math.min(6, c.x + dx)) };
        });
        if (boostRef.current > 0) boostRef.current -= 1;

        // Player progress
        const player = next[0];
        const distanceThisLap = Math.min(1, Math.abs(player.z) / Math.abs(FINISH_Z));

        // Lap rollover
        if (player.z <= FINISH_Z && lapRef.current < TOTAL_LAPS) {
          lapRef.current += 1;
          setLap(lapRef.current);
          toast.success(`Lap ${lapRef.current}!`);
          // Reset Z of all cars but keep ordering by offset
          const minZ = Math.min(...next.map(c => c.z));
          return next.map(c => ({ ...c, z: c.z - minZ }));
        }

        // Compute position
        const sorted = [...next].map((c, i) => ({ z: c.z, i })).sort((a, b) => a.z - b.z);
        const pos = sorted.findIndex(s => s.i === 0) + 1;
        setPosition(pos);

        const totalProgress = ((lapRef.current - 1) / TOTAL_LAPS) * 100 + (distanceThisLap / TOTAL_LAPS) * 100;
        setRaceProgress(Math.min(100, totalProgress));

        // Live speed (km/h-ish display)
        const playerSpeed = (initialCars[0].baseSpeed + (boostRef.current > 0 ? 0.35 : 0)) * 600;
        setSpeed(Math.round(playerSpeed));

        // Finish check: player completes final lap
        if (lapRef.current >= TOTAL_LAPS && player.z <= FINISH_Z && !finishedRef.current) {
          finishedRef.current = true;
          clearInterval(interval);
          // Final position by who crossed first (player just did): position = 1 IF player ahead
          const finalSorted = [...next].map((c, i) => ({ z: c.z, i })).sort((a, b) => a.z - b.z);
          const finalPos = finalSorted.findIndex(s => s.i === 0) + 1;
          setPosition(finalPos);
          setTimeout(() => finishRace(finalPos, Date.now() - startedAt), 200);
        }
        return next;
      });
    }, 50);
  };

  const finishRace = (finalPos: number, durationMs: number) => {
    setIsRacing(false);
    setSpeed(0);
    const points = finalPos === 1 ? 25 : finalPos === 2 ? 18 : finalPos === 3 ? 15 : 12;
    const seconds = (durationMs / 1000).toFixed(1);
    toast.success(`🏁 Finished P${finalPos} in ${seconds}s — +${points} points!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        {backgroundImage && (
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: 'blur(8px) brightness(1.3)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        <div className="fixed inset-0 bg-black/50" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <span className="text-white text-2xl">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen relative overflow-hidden p-4 flex items-center justify-center">
        {backgroundImage && (
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: 'blur(8px) brightness(1.3)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        <div className="fixed inset-0 bg-black/50" />
        <Card className="max-w-2xl border-4 border-red-500 bg-black/80 text-white z-10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-4xl text-center text-red-500">
              🏎️ GP Fantasy Racing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-xl">Subscribe to access the GP Fantasy Racing platform!</p>
            <Button
              onClick={() => navigate('/gp-subscription')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-xl"
            >
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      {/* AI Generated F1 Background */}
      {backgroundImage && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(8px) brightness(1.3)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Fallback Gradient Background */}
      {!backgroundImage && (
        <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-red-950/40 to-black" />
      )}
      
      {/* Dark Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Dynamic Racing Track Lines */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        <div className="absolute top-1/4 right-0 w-3/4 h-0.5 bg-gradient-to-l from-transparent via-amber-500 to-transparent animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-1/2 left-0 w-4/5 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-3/4 right-0 w-2/3 h-0.5 bg-gradient-to-l from-transparent via-amber-600 to-transparent animate-pulse" style={{ animationDelay: '0.9s' }} />
        <div className="absolute bottom-10 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <Badge className="bg-red-600 text-white text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
              {credits} Credits
            </Badge>
            <Badge className="bg-yellow-500 text-black text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
              {tier?.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-2 animate-fade-in">
            🏎️ GP Fantasy Racing
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300">Build Your Dream Team & Compete!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* 3D Racing View */}
          <Card className="border-4 border-red-500 bg-black/80 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                Live 3D Race View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden bg-gray-900 relative">
                <Canvas>
                  <Suspense fallback={null}>
                    <RaceScene cars={cars} playerZ={cars[0].z} isRacing={isRacing} />
                  </Suspense>
                </Canvas>
                {/* HUD overlay */}
                {isRacing && (
                  <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
                    <Badge className="bg-black/70 text-cyan-300 border border-cyan-500/40 font-mono text-base">
                      <Gauge className="w-4 h-4 mr-1" />{speed} km/h
                    </Badge>
                    <Badge className="bg-black/70 text-amber-300 border border-amber-500/40 font-mono">
                      LAP {lap}/{TOTAL_LAPS}
                    </Badge>
                    <Badge className="bg-black/70 text-white border border-red-500/50 font-mono text-lg">
                      P{position}/{cars.length}
                    </Badge>
                  </div>
                )}
              </div>

              {isRacing && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Race Progress</span>
                    <span className="text-cyan-300 font-mono text-sm">{Math.round(raceProgress)}%</span>
                  </div>
                  <Progress value={raceProgress} className="h-3" />
                  <Button
                    onClick={handleBoost}
                    disabled={boostCharges <= 0 || boostRef.current > 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black uppercase tracking-widest py-6 text-lg disabled:opacity-50"
                  >
                    <Flame className="w-5 h-5 mr-2" />
                    BOOST ({boostCharges} left)
                  </Button>
                </div>
              )}

              {!isRacing && (
                <Button
                  onClick={startRace}
                  disabled={credits < 10}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-6 text-xl"
                >
                  Start Race (10 Credits)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-4 border-red-500 bg-black/80 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/gp-fantasy-team')}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-6 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Manage Fantasy Team
              </Button>

              <Button
                onClick={() => navigate('/gp-leaderboard')}
                className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white py-6 text-lg"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Leaderboard
              </Button>

              <Button
                onClick={() => navigate('/gp-subscription')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Manage Subscription
              </Button>

              <Card className="bg-gradient-to-r from-red-900/50 to-black border-2 border-red-400 mt-4">
                <CardContent className="pt-6 text-center">
                  <p className="text-white text-lg mb-2">
                    🎮 <strong>Race Cost:</strong> 10 Credits
                  </p>
                  <p className="text-gray-300 text-sm">
                    Win races to earn points and climb the leaderboard!
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GPRacing;
