import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Environment } from "@react-three/drei";
import { Horse3D } from "./Horse3D";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Participant {
  id: string;
  horse: {
    name: string;
    color: string;
    speed_stat: number;
    stamina_stat: number;
  };
  position: number;
  progress: number;
}

interface RaceTrack3DProps {
  participants: Participant[];
  isRaceActive: boolean;
  onRaceComplete: (results: { id: string; position: number; time: number }[]) => void;
}

export const RaceTrack3D = ({ participants, isRaceActive, onRaceComplete }: RaceTrack3DProps) => {
  const [raceProgress, setRaceProgress] = useState<Map<string, number>>(new Map());
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isRaceActive && !raceStartTime) {
      setRaceStartTime(Date.now());
      
      // Initialize progress for each participant
      const initialProgress = new Map();
      participants.forEach(p => initialProgress.set(p.id, 0));
      setRaceProgress(initialProgress);
    }
  }, [isRaceActive, raceStartTime, participants]);

  useEffect(() => {
    if (!isRaceActive || !raceStartTime) return;

    const interval = setInterval(() => {
      setRaceProgress(prev => {
        const newProgress = new Map(prev);
        let allFinished = true;

        participants.forEach(p => {
          const current = newProgress.get(p.id) || 0;
          if (current < 100) {
            allFinished = false;
            // Speed based on horse stats with some randomness
            const speed = (p.horse.speed_stat + p.horse.stamina_stat) / 2;
            const increment = (speed / 1000) + (Math.random() * 0.3);
            newProgress.set(p.id, Math.min(100, current + increment));
          }
        });

        if (allFinished) {
          // Race complete - calculate results
          const results = participants.map(p => ({
            id: p.id,
            position: 0,
            time: Date.now() - raceStartTime,
          })).sort((a, b) => {
            const aProgress = newProgress.get(a.id) || 0;
            const bProgress = newProgress.get(b.id) || 0;
            return bProgress - aProgress;
          }).map((r, i) => ({ ...r, position: i + 1 }));

          onRaceComplete(results);
        }

        return newProgress;
      });
    }, 50);

    return (
    <>
      <FloatingHowItWorks title={"Race Track3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Race Track3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Race Track3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, [isRaceActive, raceStartTime, participants, onRaceComplete]);

  return (
    <div className="w-full h-[600px] relative rounded-lg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [15, 10, 15], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="sunset" />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Track Ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[30, 120]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>

        {/* Track Lanes */}
        {participants.map((p, i) => {
          const lanePosition = -6 + (i * 3);
          return (
            <group key={p.id}>
              {/* Lane marking */}
              <mesh position={[lanePosition, 0.01, 0]}>
                <planeGeometry args={[2.5, 120]} />
                <meshStandardMaterial color="#a0826d" />
              </mesh>
              
              {/* Lane lines */}
              <mesh position={[lanePosition - 1.25, 0.02, 0]}>
                <planeGeometry args={[0.1, 120]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}

        {/* Start Line */}
        <mesh position={[0, 0.03, -55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Finish Line */}
        <mesh position={[0, 0.03, 55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>

        {/* Horses */}
        {participants.map((p, i) => {
          const lanePosition = -6 + (i * 3);
          const progress = raceProgress.get(p.id) || 0;
          const zPosition = -55 + (progress / 100) * 110;
          
          return (
            <Horse3D
              key={p.id}
              position={[lanePosition, 0.3, zPosition]}
              color={p.horse.color}
              speed={p.horse.speed_stat / 50}
              isRunning={isRaceActive && progress < 100}
            />
          );
        })}

        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>

      {/* Race Progress Overlay */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-4 rounded-lg">
        <h3 className="font-bold mb-2">Race Progress</h3>
        {participants.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 mb-1">
            <div className="w-24 text-sm truncate">{p.horse.name}</div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${raceProgress.get(p.id) || 0}%` }}
              />
            </div>
            <div className="text-sm font-mono">{Math.floor(raceProgress.get(p.id) || 0)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};
