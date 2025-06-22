import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'

// Game state management
const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    currentZone: 'home',
    fragments: 0,
    totalFragments: 5,
    unlockedZones: ['home'],
    progress: {
      forest: { completed: false, puzzle: null },
      mountains: { completed: false, boulders: [] },
      galaxy: { completed: false, colors: { r: 0.5, g: 0.3, b: 0.8 } },
      ocean: { completed: false, depth: 0 },
      crystal: { completed: false, resonance: 0 }
    }
  });

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const collectFragment = (zone) => {
    setGameState(prev => ({
      ...prev,
      fragments: prev.fragments + 1,
      progress: {
        ...prev.progress,
        [zone]: { ...prev.progress[zone], completed: true }
      }
    }));
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState, collectFragment }}>
      {children}
    </GameContext.Provider>
  );
};

const GameContext = React.createContext();

// Floating animation hook
const useFloating = (speed = 1, amplitude = 0.5) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.elapsedTime * speed) * amplitude * 0.01;
    }
  });
  return ref;
};

// Rotating animation hook
const useRotation = (speed = 1) => {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += speed * 0.01;
    }
  });
  return ref;
};

// Interactive Globe Component
const InteractiveGlobe = ({ onZoneSelect }) => {
  const globeRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [zones] = useState([
    { name: 'Forest of Code', position: [1.2, 0.5, 0.8], color: '#10B981', id: 'forest' },
    { name: 'Logic Mountains', position: [-1.2, 0.8, 0.3], color: '#8B5CF6', id: 'mountains' },
    { name: 'Design Galaxy', position: [0.3, -1.1, 1], color: '#F59E0B', id: 'galaxy' },
    { name: 'Data Ocean', position: [-0.8, -0.9, -0.7], color: '#3B82F6', id: 'ocean' },
    { name: 'Crystal Core', position: [0, 0, 1.3], color: '#EC4899', id: 'crystal' }
  ]);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
  });

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1a1a2e" 
          wireframe 
          opacity={0.3} 
          transparent 
        />
      </Sphere>
      
      {/* Zone Portals */}
      {zones.map((zone, index) => (
        <group key={zone.id}>
          <Sphere
            args={[0.2, 16, 16]}
            position={zone.position}
            onClick={() => onZoneSelect(zone.id)}
            onPointerOver={() => setHovered(zone.id)}
            onPointerOut={() => setHovered(null)}
          >
            <meshStandardMaterial 
              color={zone.color}
              emissive={hovered === zone.id ? zone.color : '#000000'}
              emissiveIntensity={hovered === zone.id ? 0.3 : 0}
            />
          </Sphere>
          
          {hovered === zone.id && (
            <Text
              position={[zone.position[0], zone.position[1] + 0.5, zone.position[2]]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {zone.name}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
};

// Forest of Code Zone
const ForestZone = ({ gameState, collectFragment }) => {
  const [trees] = useState([
    { pos: [-3, 0, 2], number: 7 },
    { pos: [1, 0, 3], number: 3 },
    { pos: [4, 0, -1], number: 9 },
    { pos: [-1, 0, -3], number: 1 },
    { pos: [2, 0, 1], number: 5 }
  ]);
  const [revealedNumbers, setRevealedNumbers] = useState([]);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  const revealNumber = (index, number) => {
    if (!revealedNumbers.includes(number)) {
      setRevealedNumbers(prev => [...prev, number]);
      
      // Check if puzzle is solved (numbers in ascending order)
      const newRevealed = [...revealedNumbers, number].sort((a, b) => a - b);
      if (newRevealed.length === 5 && newRevealed.join('') === '13579') {
        setPuzzleSolved(true);
        collectFragment('forest');
      }
    }
  };

  return (
    <group>
      {/* Ground */}
      <Cylinder args={[10, 10, 0.1]} position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#2d5016" />
      </Cylinder>
      
      {/* Trees */}
      {trees.map((tree, index) => (
        <Tree 
          key={index}
          position={tree.pos}
          number={tree.number}
          revealed={revealedNumbers.includes(tree.number)}
          onReveal={() => revealNumber(index, tree.number)}
        />
      ))}
      
      {/* Success Message */}
      {puzzleSolved && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
        >
          Forest Fragment Collected! 🌟
        </Text>
      )}
    </group>
  );
};

const Tree = ({ position, number, revealed, onReveal }) => {
  const treeRef = useFloating(1.5, 0.3);
  const [hovered, setHovered] = useState(false);

  return (
    <group ref={treeRef} position={position}>
      {/* Trunk */}
      <Cylinder args={[0.2, 0.3, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      
      {/* Leaves */}
      <Sphere args={[1, 8, 8]} position={[0, 2.5, 0]}
        onClick={onReveal}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? "#22c55e" : "#16a34a"}
          emissive={hovered ? "#10b981" : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Sphere>
      
      {/* Number Display */}
      {(revealed || hovered) && (
        <Text
          position={[0, 2.5, 1.2]}
          fontSize={0.6}
          color={revealed ? "#fbbf24" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          {number}
        </Text>
      )}
    </group>
  );
};

// Logic Mountains Zone
const MountainsZone = ({ gameState, collectFragment }) => {
  const [boulders, setBoulders] = useState([
    { id: 1, pos: [-4, 1, 2], targetPos: [-2, 1, 0], placed: false },
    { id: 2, pos: [0, 1, 4], targetPos: [0, 1, 0], placed: false },
    { id: 3, pos: [4, 1, -2], targetPos: [2, 1, 0], placed: false }
  ]);
  const [draggedBoulder, setDraggedBoulder] = useState(null);

  const moveBoulder = (id, newPos) => {
    setBoulders(prev => prev.map(boulder => {
      if (boulder.id === id) {
        const distance = Math.sqrt(
          Math.pow(newPos[0] - boulder.targetPos[0], 2) +
          Math.pow(newPos[2] - boulder.targetPos[2], 2)
        );
        const placed = distance < 1;
        return { ...boulder, pos: newPos, placed };
      }
      return boulder;
    }));

    // Check if all boulders are placed
    const allPlaced = boulders.every(b => b.id === id ? 
      Math.sqrt(Math.pow(newPos[0] - b.targetPos[0], 2) + Math.pow(newPos[2] - b.targetPos[2], 2)) < 1 
      : b.placed
    );
    
    if (allPlaced) {
      collectFragment('mountains');
    }
  };

  return (
    <group>
      {/* Mountain Base */}
      <Cylinder args={[8, 12, 1]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#6b7280" />
      </Cylinder>
      
      {/* Target Positions */}
      {boulders.map(boulder => (
        <Cylinder 
          key={`target-${boulder.id}`}
          args={[0.8, 0.8, 0.1]} 
          position={[boulder.targetPos[0], boulder.targetPos[1] - 0.4, boulder.targetPos[2]]}
        >
          <meshStandardMaterial color="#374151" opacity={0.5} transparent />
        </Cylinder>
      ))}
      
      {/* Boulders */}
      {boulders.map(boulder => (
        <Boulder
          key={boulder.id}
          boulder={boulder}
          onMove={(newPos) => moveBoulder(boulder.id, newPos)}
          isDragged={draggedBoulder === boulder.id}
          onDragStart={() => setDraggedBoulder(boulder.id)}
          onDragEnd={() => setDraggedBoulder(null)}
        />
      ))}
      
      {/* Success Message */}
      {boulders.every(b => b.placed) && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.5}
          color="#8B5CF6"
          anchorX="center"
          anchorY="middle"
        >
          Mountain Fragment Collected! ⛰️
        </Text>
      )}
    </group>
  );
};

const Boulder = ({ boulder, onMove, isDragged, onDragStart, onDragEnd }) => {
  const boulderRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <Sphere
      ref={boulderRef}
      args={[0.8, 12, 12]}
      position={boulder.pos}
      onPointerDown={onDragStart}
      onPointerUp={onDragEnd}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        const { point } = e;
        onMove([point.x, boulder.pos[1], point.z]);
      }}
    >
      <meshStandardMaterial 
        color={boulder.placed ? "#22c55e" : (hovered || isDragged) ? "#94a3b8" : "#64748b"}
        emissive={boulder.placed ? "#16a34a" : "#000000"}
        emissiveIntensity={boulder.placed ? 0.3 : 0}
      />
    </Sphere>
  );
};

// Design Galaxy Zone
const GalaxyZone = ({ gameState, updateGameState, collectFragment }) => {
  const [colors, setColors] = useState({ r: 0.5, g: 0.3, b: 0.8 });
  const [planetsRevealed, setPlanetsRevealed] = useState(false);

  const updateColor = (channel, value) => {
    const newColors = { ...colors, [channel]: value };
    setColors(newColors);
    
    // Check if colors match the golden ratio pattern
    const golden = 0.618;
    if (Math.abs(newColors.r - golden) < 0.1 && 
        Math.abs(newColors.g - golden * 0.8) < 0.1 && 
        Math.abs(newColors.b - golden * 1.2) < 0.1) {
      setPlanetsRevealed(true);
      collectFragment('galaxy');
    }
  };

  return (
    <group>
      {/* Starfield Background */}
      <Stars colors={colors} />
      
      {/* Planets */}
      <Planet position={[-4, 2, 0]} color={colors.r} />
      <Planet position={[0, -1, 3]} color={colors.g} />
      <Planet position={[3, 1, -2]} color={colors.b} />
      
      {/* Control Panel */}
      <group position={[0, -3, 0]}>
        <ColorSlider 
          position={[-2, 0, 0]} 
          color="red" 
          value={colors.r} 
          onChange={(v) => updateColor('r', v)} 
        />
        <ColorSlider 
          position={[0, 0, 0]} 
          color="green" 
          value={colors.g} 
          onChange={(v) => updateColor('g', v)} 
        />
        <ColorSlider 
          position={[2, 0, 0]} 
          color="blue" 
          value={colors.b} 
          onChange={(v) => updateColor('b', v)} 
        />
      </group>
      
      {/* Success Message */}
      {planetsRevealed && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.5}
          color="#F59E0B"
          anchorX="center"
          anchorY="middle"
        >
          Galaxy Fragment Collected! 🌌
        </Text>
      )}
    </group>
  );
};

const Stars = ({ colors }) => {
  const starsRef = useRef();
  const [starPositions] = useState(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  });

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.1} 
        color={new THREE.Color(colors.r, colors.g, colors.b)}
      />
    </points>
  );
};

const Planet = ({ position, color }) => {
  const planetRef = useRotation(0.5);
  const ringRef = useRotation(-0.3);

  return (
    <group position={position}>
      <Sphere ref={planetRef} args={[1, 16, 16]}>
        <meshStandardMaterial 
          color={new THREE.Color(color, color * 0.8, color * 0.6)}
          emissive={new THREE.Color(color * 0.2, color * 0.1, color * 0.3)}
        />
      </Sphere>
      <Torus ref={ringRef} args={[1.5, 0.1, 8, 32]}>
        <meshStandardMaterial 
          color={new THREE.Color(color * 0.8, color, color * 0.7)}
          transparent
          opacity={0.6}
        />
      </Torus>
    </group>
  );
};

const ColorSlider = ({ position, color, value, onChange }) => {
  const [dragging, setDragging] = useState(false);

  return (
    <group position={position}>
      {/* Slider Track */}
      <Box args={[2, 0.1, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      
      {/* Slider Handle */}
      <Box 
        args={[0.2, 0.3, 0.2]} 
        position={[(value - 0.5) * 2, 0, 0]}
        onClick={(e) => {
          const newValue = (e.point.x - position[0]) / 2 + 0.5;
          onChange(Math.max(0, Math.min(1, newValue)));
        }}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
      >
        <meshStandardMaterial 
          color={color}
          emissive={dragging ? color : "#000000"}
          emissiveIntensity={dragging ? 0.3 : 0}
        />
      </Box>
      
      {/* Label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {color.toUpperCase()}
      </Text>
    </group>
  );
};

// Ocean Zone
const OceanZone = ({ gameState, collectFragment }) => {
  const [depth, setDepth] = useState(0);
  const [treasure, setTreasure] = useState({ found: false, position: [0, -8, 0] });

  const dive = () => {
    setDepth(prev => {
      const newDepth = Math.min(prev + 1, 10);
      if (newDepth >= 8 && !treasure.found) {
        setTreasure({ found: true, position: [0, -8, 0] });
        collectFragment('ocean');
      }
      return newDepth;
    });
  };

  return (
    <group>
      {/* Ocean Surface */}
      <Cylinder args={[10, 10, 0.5]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1e40af" 
          transparent 
          opacity={0.7}
        />
      </Cylinder>
      
      {/* Dive Button */}
      <Box 
        args={[2, 0.5, 1]} 
        position={[0, 2, 0]}
        onClick={dive}
      >
        <meshStandardMaterial color="#059669" />
      </Box>
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        DIVE (Depth: {depth})
      </Text>
      
      {/* Underwater Elements */}
      {depth > 3 && (
        <group>
          <Cylinder args={[0.3, 0.3, 4]} position={[-3, -2, 1]}>
            <meshStandardMaterial color="#16a34a" />
          </Cylinder>
          <Cylinder args={[0.2, 0.2, 3]} position={[2, -1.5, -2]}>
            <meshStandardMaterial color="#22c55e" />
          </Cylinder>
        </group>
      )}
      
      {/* Treasure */}
      {treasure.found && (
        <group position={treasure.position}>
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
            />
          </Box>
          <Text
            position={[0, 2, 0]}
            fontSize={0.5}
            color="#3B82F6"
            anchorX="center"
          >
            Ocean Fragment Found! 🌊
          </Text>
        </group>
      )}
    </group>
  );
};

// Crystal Core Zone
const CrystalZone = ({ gameState, collectFragment }) => {
  const [resonance, setResonance] = useState(0);
  const [crystals] = useState([
    { pos: [0, 0, 0], activated: false },
    { pos: [-3, 1, 2], activated: false },
    { pos: [3, -1, -2], activated: false },
    { pos: [0, 3, 1], activated: false },
    { pos: [2, -2, 3], activated: false }
  ]);
  const [activatedCrystals, setActivatedCrystals] = useState([]);

  const activateCrystal = (index) => {
    if (!activatedCrystals.includes(index)) {
      const newActivated = [...activatedCrystals, index];
      setActivatedCrystals(newActivated);
      setResonance(newActivated.length / crystals.length);
      
      if (newActivated.length === crystals.length) {
        collectFragment('crystal');
      }
    }
  };

  return (
    <group>
      {/* Central Platform */}
      <Cylinder args={[4, 4, 0.5]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      
      {/* Crystals */}
      {crystals.map((crystal, index) => (
        <Crystal
          key={index}
          position={crystal.pos}
          activated={activatedCrystals.includes(index)}
          onActivate={() => activateCrystal(index)}
          resonance={resonance}
        />
      ))}
      
      {/* Progress Display */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.4}
        color="#EC4899"
        anchorX="center"
      >
        Resonance: {Math.round(resonance * 100)}%
      </Text>
      
      {/* Success Message */}
      {resonance === 1 && (
        <Text
          position={[0, 6, 0]}
          fontSize={0.5}
          color="#EC4899"
          anchorX="center"
        >
          Crystal Fragment Collected! 💎
        </Text>
      )}
    </group>
  );
};

const Crystal = ({ position, activated, onActivate, resonance }) => {
  const crystalRef = useFloating(2, 0.4);
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      ref={crystalRef}
      args={[0.8, 2, 0.8]}
      position={position}
      onClick={onActivate}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={activated ? "#ec4899" : hovered ? "#f472b6" : "#9ca3af"}
        emissive={activated ? "#be185d" : "#000000"}
        emissiveIntensity={activated ? resonance * 0.5 : 0}
        transparent
        opacity={activated ? 1 : 0.8}
      />
    </Box>
  );
};

// Progress Bar Component
const ProgressBar = ({ fragments, total }) => {
  const progress = fragments / total;
  
  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg text-white">
      <div className="mb-2">
        <h3 className="text-lg font-bold">Lost Algorithm Recovery</h3>
        <p className="text-sm">Fragments: {fragments}/{total}</p>
      </div>
      <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ currentZone, onZoneChange, unlockedZones }) => {
  const zones = [
    { id: 'home', name: 'Home', icon: '🏠' },
    { id: 'forest', name: 'Forest', icon: '🌲' },
    { id: 'mountains', name: 'Mountains', icon: '⛰️' },
    { id: 'galaxy', name: 'Galaxy', icon: '🌌' },
    { id: 'ocean', name: 'Ocean', icon: '🌊' },
    { id: 'crystal', name: 'Crystal', icon: '💎' }
  ];

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg">
      <div className="flex flex-col space-y-2">
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => onZoneChange(zone.id)}
            disabled={!unlockedZones.includes(zone.id) && zone.id !== 'home'}
            className={`px-3 py-2 rounded text-sm font-medium transition-all ${
              currentZone === zone.id 
                ? 'bg-blue-600 text-white' 
                : unlockedZones.includes(zone.id) || zone.id === 'home'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {zone.icon} {zone.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

const GameContent = () => {
  const { gameState, updateGameState, collectFragment } = React.useContext(GameContext);

  const handleZoneChange = (zoneId) => {
    // Unlock zones progressively
    const zoneOrder = ['home', 'forest', 'mountains', 'galaxy', 'ocean', 'crystal'];
    const currentIndex = zoneOrder.indexOf(gameState.currentZone);
    const targetIndex = zoneOrder.indexOf(zoneId);
    
    if (zoneId === 'home' || targetIndex <= currentIndex + 1 || gameState.unlockedZones.includes(zoneId)) {
      updateGameState({ 
        currentZone: zoneId,
        unlockedZones: [...new Set([...gameState.unlockedZones, zoneId])]
      });
    }
  };

  const renderCurrentZone = () => {
    switch (gameState.currentZone) {
      case 'home':
        return <InteractiveGlobe onZoneSelect={handleZoneChange} />;
      case 'forest':
        return <ForestZone gameState={gameState} collectFragment={collectFragment} />;
      case 'mountains':
        return <MountainsZone gameState={gameState} collectFragment={collectFragment} />;
      case 'galaxy':
        return <GalaxyZone gameState={gameState} updateGameState={updateGameState} collectFragment={collectFragment} />;
      case 'ocean':
        return <OceanZone gameState={gameState} collectFragment={collectFragment} />;
      case 'crystal':
        return <CrystalZone gameState={gameState} collectFragment={collectFragment} />;
      default:
        return <InteractiveGlobe onZoneSelect={handleZoneChange} />;
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-blue-900">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          {renderCurrentZone()}
        </Suspense>
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>
      
      <ProgressBar fragments={gameState.fragments} total={gameState.totalFragments} />
      <Navigation 
        currentZone={gameState.currentZone}
        onZoneChange={handleZoneChange}
        unlockedZones={gameState.unlockedZones}
      />
      
      {/* Victory Screen */}
      {gameState.fragments === gameState.totalFragments && (
        <VictoryScreen />
      )}
      
      {/* Instructions Panel */}
      <InstructionsPanel currentZone={gameState.currentZone} />
    </div>
  );
};

// Victory Screen Component
const VictoryScreen = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-2xl text-center max-w-md mx-4 border border-purple-500">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
        <p className="text-lg text-purple-200 mb-6">
          You've successfully collected all fragments and restored the Lost Algorithm! 
          The digital universe is now complete.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl">🌲</div>
            <div className="text-sm text-green-400">Forest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">⛰️</div>
            <div className="text-sm text-purple-400">Mountains</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🌌</div>
            <div className="text-sm text-yellow-400">Galaxy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🌊</div>
            <div className="text-sm text-blue-400">Ocean</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">💎</div>
            <div className="text-sm text-pink-400">Crystal</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-4">
          Continue exploring or start a new journey!
        </p>
      </div>
    </div>
  );
};

// Instructions Panel Component
const InstructionsPanel = ({ currentZone }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const instructions = {
    home: {
      title: "Welcome to the Digital Universe",
      content: "Click on the glowing portals around the globe to explore different zones. Each zone contains a fragment of the Lost Algorithm waiting to be discovered."
    },
    forest: {
      title: "Forest of Code",
      content: "Hover over the trees to reveal hidden numbers. Find all numbers and arrange them in ascending order to unlock the forest fragment."
    },
    mountains: {
      title: "Logic Mountains", 
      content: "Drag the boulders to their target positions (dark circles). Each boulder represents a logical step in the sequence."
    },
    galaxy: {
      title: "Design Galaxy",
      content: "Use the color sliders to adjust planet colors. Find the golden ratio pattern to reveal the hidden constellation and collect the fragment."
    },
    ocean: {
      title: "Data Ocean",
      content: "Click the DIVE button to explore deeper into the ocean. Reach the bottom to discover the hidden treasure fragment."
    },
    crystal: {
      title: "Crystal Core",
      content: "Click on each crystal to activate them. When all crystals resonate together, the final fragment will be yours."
    }
  };

  const currentInstruction = instructions[currentZone] || instructions.home;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
        title="Instructions"
      >
        ❓
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-black bg-opacity-90 p-4 rounded-lg max-w-sm text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{currentInstruction.title}</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {currentInstruction.content}
          </p>
        </div>
      )}
    </>
  );
};

// Sound Effects Component (Visual representation)
const SoundIndicator = ({ isPlaying, type }) => {
  if (!isPlaying) return null;
  
  const getEmoji = () => {
    switch (type) {
      case 'collect': return '🎵';
      case 'hover': return '🔊';
      case 'complete': return '🎉';
      default: return '🔊';
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce pointer-events-none z-50">
      {getEmoji()}
    </div>
  );
};

// Particle System Component
const ParticleSystem = ({ position, active, color = "#ffffff" }) => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const positions = new Float32Array(50 * 3);
    const velocities = new Float32Array(50 * 3);
    
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    return { positions, velocities };
  });

  useFrame(() => {
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < 50; i++) {
        positions[i * 3] += particles.velocities[i * 3];
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
        
        // Reset particles that go too far
        if (Math.abs(positions[i * 3]) > 5) {
          positions[i * 3] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={50}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} />
    </points>
  );
};

// Performance Monitor Component
const PerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [showStats, setShowStats] = useState(false);
  
  useFrame(({ clock }) => {
    if (Math.floor(clock.elapsedTime) % 2 === 0) {
      setFps(Math.round(1 / clock.getDelta()));
    }
  });

  return (
    <>
      <button
        onClick={() => setShowStats(!showStats)}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
      >
        Stats
      </button>
      
      {showStats && (
        <div className="fixed bottom-16 right-4 bg-black bg-opacity-90 p-3 rounded text-white text-sm">
          <div>FPS: {fps}</div>
          <div>Memory: ~{Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024) || 'N/A'}MB</div>
        </div>
      )}
    </>
  );
};

// Enhanced App Component with additional features
const EnhancedApp = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);

  const playSound = (type) => {
    if (soundEnabled) {
      setCurrentSound(type);
      setTimeout(() => setCurrentSound(null), 1000);
    }
  };

  return (
    <GameProvider>
      <div className="relative">
        <GameContent />
        
        {/* Sound Controls */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm"
        >
          {soundEnabled ? '🔊' : '🔇'} Sound
        </button>
        
        <SoundIndicator isPlaying={currentSound !== null} type={currentSound} />
        <PerformanceMonitor />
      </div>
    </GameProvider>
  );
};

export default EnhancedApp;