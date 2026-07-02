import { Canvas, useLoader } from '@react-three/fiber';
import { PointerLockControls, Sky, Text, useTexture, Sphere, Environment } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Room3DProps {
  theme: string;
  currentRoom: number;
  totalRooms: number;
  roomName: string;
  roomDescription: string;
  onRoomComplete: () => void;
  onExit: () => void;
}

const Room3D = ({ theme, currentRoom, totalRooms, roomName, roomDescription, onRoomComplete, onExit }: Room3DProps) => {
  const [collected, setCollected] = useState<string[]>([]);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  const themeConfig = {
    horror: { 
      wall: '#2a1810', floor: '#1a0f08', ambient: '#ff4444',
      fog: { color: '#1a0f08', near: 5, far: 15 },
      metalness: 0.8, roughness: 0.9
    },
    'sci-fi': { 
      wall: '#1a2332', floor: '#0f1419', ambient: '#00ffff',
      fog: { color: '#0f1419', near: 8, far: 20 },
      metalness: 0.9, roughness: 0.3
    },
    mystery: { 
      wall: '#3a2a1a', floor: '#2a1a0a', ambient: '#ffaa00',
      fog: { color: '#2a1a0a', near: 6, far: 18 },
      metalness: 0.5, roughness: 0.7
    },
    fantasy: { 
      wall: '#2a1a3a', floor: '#1a0a2a', ambient: '#ff00ff',
      fog: { color: '#1a0a2a', near: 7, far: 19 },
      metalness: 0.3, roughness: 0.6
    },
    adventure: { 
      wall: '#2a3a1a', floor: '#1a2a0a', ambient: '#88ff00',
      fog: { color: '#1a2a0a', near: 10, far: 22 },
      metalness: 0.4, roughness: 0.8
    },
    educational: { 
      wall: '#f5f5f5', floor: '#e0e0e0', ambient: '#4a90e2',
      fog: { color: '#e0e0e0', near: 15, far: 30 },
      metalness: 0.2, roughness: 0.5
    },
    corporate: { 
      wall: '#2a2a3a', floor: '#1a1a2a', ambient: '#00aaff',
      fog: { color: '#1a1a2a', near: 8, far: 20 },
      metalness: 0.7, roughness: 0.4
    }
  };

  const config = themeConfig[theme as keyof typeof themeConfig] || themeConfig.mystery;

  const handleCollect = (item: string) => {
    if (!collected.includes(item)) {
      setCollected([...collected, item]);
      if (collected.length + 1 >= 3) {
        setDoorUnlocked(true);
      }
    }
  };

  const handleDoorClick = () => {
    if (doorUnlocked) {
      setCollected([]);
      setDoorUnlocked(false);
      onRoomComplete();
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Room3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Room3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Room3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />
        <ambientLight intensity={0.2} color={config.ambient} />
        <pointLight position={[0, 4, 0]} intensity={1.5} castShadow color={config.ambient} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.4}
          penumbra={1}
          intensity={1}
          castShadow
          color={config.ambient}
        />
        <spotLight
          position={[-5, 5, -5]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          castShadow
          color={config.ambient}
        />

        <Physics gravity={[0, -9.81, 0]}>
          <PointerLockControls />

          {/* Floor */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20, 32, 32]} />
              <meshStandardMaterial 
                color={config.floor}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          {/* Walls */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 2.5, -10]} castShadow receiveShadow>
              <boxGeometry args={[20, 5, 0.5, 10, 10]} />
              <meshStandardMaterial 
                color={config.wall}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 2.5, 10]} castShadow receiveShadow>
              <boxGeometry args={[20, 5, 0.5, 10, 10]} />
              <meshStandardMaterial 
                color={config.wall}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-10, 2.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 5, 20, 10, 10]} />
              <meshStandardMaterial 
                color={config.wall}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[10, 2.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 5, 20, 10, 10]} />
              <meshStandardMaterial 
                color={config.wall}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          {/* Ceiling */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[20, 20, 10, 10]} />
              <meshStandardMaterial 
                color={config.wall}
                metalness={config.metalness}
                roughness={config.roughness}
              />
            </mesh>
          </RigidBody>

          {/* Collectible Objects - Detailed Keys */}
          {!collected.includes('key1') && (
            <RigidBody type="fixed" colliders="cuboid">
              <group position={[-5, 1, -5]} onClick={() => handleCollect('key1')}>
                {/* Key body */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Key head */}
                <mesh position={[0, 0.5, 0]} castShadow>
                  <torusGeometry args={[0.25, 0.08, 16, 32]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Glow effect */}
                <pointLight position={[0, 0, 0]} intensity={2} distance={3} color="#ffd700" />
              </group>
              <Text
                position={[-5, 2.5, -5]}
                fontSize={0.4}
                color="white"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                Key 1
              </Text>
            </RigidBody>
          )}

          {!collected.includes('key2') && (
            <RigidBody type="fixed" colliders="cuboid">
              <group position={[5, 1, 5]} onClick={() => handleCollect('key2')}>
                {/* Key body */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Key head */}
                <mesh position={[0, 0.5, 0]} castShadow>
                  <torusGeometry args={[0.25, 0.08, 16, 32]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Glow effect */}
                <pointLight position={[0, 0, 0]} intensity={2} distance={3} color="#ffd700" />
              </group>
              <Text
                position={[5, 2.5, 5]}
                fontSize={0.4}
                color="white"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                Key 2
              </Text>
            </RigidBody>
          )}

          {!collected.includes('key3') && (
            <RigidBody type="fixed" colliders="cuboid">
              <group position={[0, 1, 8]} onClick={() => handleCollect('key3')}>
                {/* Key body */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Key head */}
                <mesh position={[0, 0.5, 0]} castShadow>
                  <torusGeometry args={[0.25, 0.08, 16, 32]} />
                  <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={0.8}
                    metalness={1}
                    roughness={0.2}
                  />
                </mesh>
                {/* Glow effect */}
                <pointLight position={[0, 0, 0]} intensity={2} distance={3} color="#ffd700" />
              </group>
              <Text
                position={[0, 2.5, 8]}
                fontSize={0.4}
                color="white"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                Key 3
              </Text>
            </RigidBody>
          )}

          {/* Exit Door */}
          <RigidBody type="fixed" colliders="cuboid">
            <group position={[0, 2, -9.5]} onClick={handleDoorClick}>
              {/* Door frame */}
              <mesh position={[0, 0, -0.1]} castShadow>
                <boxGeometry args={[2.4, 3.4, 0.2]} />
                <meshStandardMaterial
                  color="#8b4513"
                  metalness={0.3}
                  roughness={0.8}
                />
              </mesh>
              {/* Door */}
              <mesh castShadow>
                <boxGeometry args={[2, 3, 0.15]} />
                <meshStandardMaterial
                  color={doorUnlocked ? '#228b22' : '#8b0000'}
                  emissive={doorUnlocked ? '#00ff00' : '#ff0000'}
                  emissiveIntensity={doorUnlocked ? 0.5 : 0.3}
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
              {/* Door handle */}
              <mesh position={[0.7, 0, 0.1]} castShadow>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                  color="#ffd700"
                  metalness={1}
                  roughness={0.2}
                />
              </mesh>
              {/* Lock indicator */}
              <mesh position={[0, 0, 0.08]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
                <meshStandardMaterial
                  color={doorUnlocked ? '#00ff00' : '#ff0000'}
                  emissive={doorUnlocked ? '#00ff00' : '#ff0000'}
                  emissiveIntensity={1}
                  metalness={1}
                  roughness={0.1}
                />
              </mesh>
              {/* Door glow */}
              <pointLight 
                position={[0, 0, 0.3]} 
                intensity={doorUnlocked ? 3 : 1} 
                distance={5} 
                color={doorUnlocked ? '#00ff00' : '#ff0000'} 
              />
            </group>
            <Text
              position={[0, 4, -9.2]}
              fontSize={0.5}
              color="white"
              outlineWidth={0.03}
              outlineColor="#000000"
              fontWeight="bold"
            >
              {doorUnlocked 
                ? (currentRoom === totalRooms ? 'EXIT - Click to Escape!' : 'NEXT ROOM - Click to Continue!') 
                : `Locked (${collected.length}/3 keys)`}
            </Text>
          </RigidBody>

          {/* Decorative Objects - Theme-based */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-3, 1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
              <meshStandardMaterial 
                color="#8b4513"
                metalness={config.metalness}
                roughness={0.9}
              />
            </mesh>
            {/* Decoration on top */}
            <mesh position={[-3, 2.2, 0]} castShadow>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial 
                color={config.ambient}
                emissive={config.ambient}
                emissiveIntensity={0.5}
              />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[3, 0.5, -3]} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial 
                color="#654321"
                metalness={config.metalness}
                roughness={0.8}
              />
            </mesh>
          </RigidBody>

          {/* Additional decorations */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-7, 0.3, 7]} castShadow receiveShadow>
              <torusKnotGeometry args={[0.3, 0.1, 64, 8]} />
              <meshStandardMaterial 
                color={config.ambient}
                emissive={config.ambient}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[7, 1.5, -7]} castShadow receiveShadow>
              <octahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial 
                color={config.ambient}
                emissive={config.ambient}
                emissiveIntensity={0.4}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </RigidBody>

          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(i) * 8,
                Math.random() * 4 + 1,
                Math.cos(i) * 8
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color={config.ambient}
                emissive={config.ambient}
                emissiveIntensity={1}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </Physics>
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-xs">
        <h3 className="font-bold text-lg mb-2">{roomName}</h3>
        <p className="text-xs mb-3 text-gray-300">{roomDescription}</p>
        <div className="border-t border-gray-600 pt-2 mb-2">
          <p className="text-sm font-bold mb-1">Room {currentRoom}/{totalRooms}</p>
          <p className="text-sm font-bold">Keys: {collected.length}/3</p>
        </div>
        <div className="border-t border-gray-600 pt-2">
          <h4 className="font-bold text-xs mb-1">Controls:</h4>
          <p className="text-xs">• Click to lock pointer</p>
          <p className="text-xs">• WASD to move</p>
          <p className="text-xs">• Mouse to look around</p>
          <p className="text-xs">• Click golden keys to collect</p>
        </div>
      </div>

      <button
        onClick={onExit}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Quit Game
      </button>
    </div>
    </>
  );
};

export default Room3D;