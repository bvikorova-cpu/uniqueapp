import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky, Text } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface Room3DProps {
  theme: string;
  onPuzzleSolved: () => void;
  onExit: () => void;
}

const Room3D = ({ theme, onPuzzleSolved, onExit }: Room3DProps) => {
  const [collected, setCollected] = useState<string[]>([]);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  const themeColors = {
    horror: { wall: '#2a1810', floor: '#1a0f08', ambient: '#ff4444' },
    'sci-fi': { wall: '#1a2332', floor: '#0f1419', ambient: '#00ffff' },
    mystery: { wall: '#3a2a1a', floor: '#2a1a0a', ambient: '#ffaa00' },
    fantasy: { wall: '#2a1a3a', floor: '#1a0a2a', ambient: '#ff00ff' },
    adventure: { wall: '#2a3a1a', floor: '#1a2a0a', ambient: '#88ff00' },
    educational: { wall: '#f5f5f5', floor: '#e0e0e0', ambient: '#4a90e2' },
    corporate: { wall: '#2a2a3a', floor: '#1a1a2a', ambient: '#00aaff' }
  };

  const colors = themeColors[theme as keyof typeof themeColors] || themeColors.mystery;

  const handleCollect = (item: string) => {
    if (!collected.includes(item)) {
      setCollected([...collected, item]);
      if (collected.length + 1 >= 3) {
        setDoorUnlocked(true);
        onPuzzleSolved();
      }
    }
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.3} color={colors.ambient} />
        <pointLight position={[0, 3, 0]} intensity={1} castShadow />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        <Physics gravity={[0, -9.81, 0]}>
          <PointerLockControls />

          {/* Floor */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color={colors.floor} />
            </mesh>
          </RigidBody>

          {/* Walls */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 2.5, -10]} castShadow>
              <boxGeometry args={[20, 5, 0.5]} />
              <meshStandardMaterial color={colors.wall} />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 2.5, 10]} castShadow>
              <boxGeometry args={[20, 5, 0.5]} />
              <meshStandardMaterial color={colors.wall} />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-10, 2.5, 0]} castShadow>
              <boxGeometry args={[0.5, 5, 20]} />
              <meshStandardMaterial color={colors.wall} />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[10, 2.5, 0]} castShadow>
              <boxGeometry args={[0.5, 5, 20]} />
              <meshStandardMaterial color={colors.wall} />
            </mesh>
          </RigidBody>

          {/* Ceiling */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color={colors.wall} />
            </mesh>
          </RigidBody>

          {/* Collectible Objects */}
          {!collected.includes('key1') && (
            <RigidBody type="fixed" colliders="cuboid">
              <mesh
                position={[-5, 1, -5]}
                castShadow
                onClick={() => handleCollect('key1')}
              >
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
              <Text
                position={[-5, 2, -5]}
                fontSize={0.3}
                color="white"
              >
                Key 1
              </Text>
            </RigidBody>
          )}

          {!collected.includes('key2') && (
            <RigidBody type="fixed" colliders="cuboid">
              <mesh
                position={[5, 1, 5]}
                castShadow
                onClick={() => handleCollect('key2')}
              >
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
              <Text
                position={[5, 2, 5]}
                fontSize={0.3}
                color="white"
              >
                Key 2
              </Text>
            </RigidBody>
          )}

          {!collected.includes('key3') && (
            <RigidBody type="fixed" colliders="cuboid">
              <mesh
                position={[0, 1, 8]}
                castShadow
                onClick={() => handleCollect('key3')}
              >
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
              <Text
                position={[0, 2, 8]}
                fontSize={0.3}
                color="white"
              >
                Key 3
              </Text>
            </RigidBody>
          )}

          {/* Exit Door */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh
              position={[0, 2, -9.5]}
              castShadow
              onClick={() => doorUnlocked && onExit()}
            >
              <boxGeometry args={[2, 3, 0.2]} />
              <meshStandardMaterial
                color={doorUnlocked ? '#00ff00' : '#ff0000'}
                emissive={doorUnlocked ? '#00ff00' : '#ff0000'}
                emissiveIntensity={0.3}
              />
            </mesh>
            <Text
              position={[0, 3.5, -9.3]}
              fontSize={0.4}
              color="white"
            >
              {doorUnlocked ? 'EXIT - Click to Escape!' : `Locked (${collected.length}/3 keys)`}
            </Text>
          </RigidBody>

          {/* Decorative Objects */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-3, 1, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          </RigidBody>

          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[3, 0.5, -3]} castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <p className="text-sm">• Click to lock pointer</p>
        <p className="text-sm">• WASD to move</p>
        <p className="text-sm">• Mouse to look around</p>
        <p className="text-sm">• Click golden cubes to collect keys</p>
        <p className="text-sm mb-2">• Find 3 keys to unlock exit</p>
        <p className="text-sm font-bold">Keys: {collected.length}/3</p>
      </div>

      <button
        onClick={onExit}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Quit Game
      </button>
    </div>
  );
};

export default Room3D;