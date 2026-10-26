import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { feelingColors } from './palette';

const fireflyColors = Object.values(feelingColors);

function NightBackdrop() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#352b5d');
    gradient.addColorStop(0.48, '#65568f');
    gradient.addColorStop(1, '#d69292');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);
  return (
    <mesh position={[0, 0.8, -1.1]} scale={[14, 8, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Window() {
  return (
    <group position={[-2.8, 2.45, -0.4]}>
      <mesh>
        <planeGeometry args={[3.2, 2.4]} />
        <meshBasicMaterial color="#514476" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.05, 2.25]} />
        <meshBasicMaterial color="#7969a6" transparent opacity={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <ringGeometry args={[0.36, 0.41, 32, 1, 0.5, Math.PI * 1.5]} />
        <meshBasicMaterial color="#ffd97a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.08, 2.3, 0.08]} />
        <meshBasicMaterial color="#ffe5d4" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.2, 0.08, 0.08]} />
        <meshBasicMaterial color="#ffe5d4" />
      </mesh>
      <Stars count={28} />
    </group>
  );
}

function Stars({ count }: { count: number }) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = index * 2.39996;
        return [
          Math.cos(angle) * (0.35 + (index % 5) * 0.23) - 0.4,
          Math.sin(angle) * (0.35 + (index % 4) * 0.2) + 0.25,
          0.11,
        ] as [number, number, number];
      }),
    [count],
  );
  return (
    <>
      {positions.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#fff0b8" />
        </mesh>
      ))}
    </>
  );
}

function FairyLights() {
  const bulbs = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const x = -3.8 + index * 0.45;
        return [x, 2.98 - Math.pow((x + 0.1) / 4, 2) * 0.35, 0.15] as [
          number,
          number,
          number,
        ];
      }),
    [],
  );
  return (
    <group>
      {bulbs.map((position, index) => (
        <Bulb key={index} position={position} index={index} />
      ))}
    </group>
  );
}

function Bulb({
  position,
  index,
}: {
  position: [number, number, number];
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.scale.setScalar(
        0.9 + Math.sin(clock.elapsedTime * 1.6 + index) * 0.08,
      );
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color="#ffd97a" toneMapped={false} />
    </mesh>
  );
}

function Shelf() {
  return (
    <group position={[0, -1.25, 0]}>
      <mesh>
        <boxGeometry args={[8.5, 0.38, 1.5]} />
        <meshStandardMaterial color="#d9a877" roughness={0.78} />
      </mesh>
      <mesh position={[-2.75, 0.38, 0]}>
        <boxGeometry args={[1.3, 0.16, 0.8]} />
        <meshStandardMaterial color="#fff6ec" roughness={1} />
      </mesh>
      <mesh position={[-2.75, 0.5, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[1.05, 0.04, 0.66]} />
        <meshStandardMaterial color="#f7c6d6" roughness={1} />
      </mesh>
      <mesh position={[2.8, 0.45, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.6, 20]} />
        <meshStandardMaterial color="#bdebd3" roughness={0.9} />
      </mesh>
      <mesh position={[2.8, 0.95, 0]}>
        <sphereGeometry args={[0.58, 12, 8]} />
        <meshStandardMaterial color="#bdebd3" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Jar() {
  return (
    <group position={[0, -0.18, 0.15]} scale={[1.14, 1.14, 1.14]}>
      <mesh>
        <latheGeometry
          args={[
            [
              new THREE.Vector2(0.55, -1.15),
              new THREE.Vector2(0.72, -0.98),
              new THREE.Vector2(0.78, 0.55),
              new THREE.Vector2(0.58, 0.95),
              new THREE.Vector2(0.38, 1.12),
            ],
            48,
          ]}
        />
        <MeshTransmissionMaterial
          color="#b9b5df"
          thickness={0.24}
          roughness={0.08}
          transmission={0.92}
          ior={1.35}
          chromaticAberration={0.03}
          samples={4}
        />
      </mesh>
      <mesh position={[0, -0.35, 0]} scale={[0.96, 0.55, 0.96]}>
        <sphereGeometry args={[0.78, 32, 18]} />
        <meshBasicMaterial
          color="#ffd97a"
          transparent
          opacity={0.16}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 0.18, 32]} />
        <meshStandardMaterial color="#d9a877" roughness={0.45} />
      </mesh>
      <pointLight
        position={[0, 0, 0.45]}
        color="#ffd97a"
        intensity={1.8}
        distance={3}
      />
      <Fireflies />
    </group>
  );
}

function Fireflies() {
  const points = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        position: [
          ((index % 4) - 1.5) * 0.25,
          (((index * 7) % 9) - 4) * 0.12,
          0.4 + (index % 3) * 0.05,
        ] as [number, number, number],
        color: fireflyColors[index % fireflyColors.length]!,
        phase: index * 0.7,
      })),
    [],
  );
  return (
    <group>
      {points.map((fly, index) => (
        <Firefly key={index} {...fly} />
      ))}
    </group>
  );
}

function Firefly({
  position,
  color,
  phase,
}: {
  position: [number, number, number];
  color: string;
  phase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const glow = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 32);
    gradient.addColorStop(0, `${color}cc`);
    gradient.addColorStop(0.18, `${color}66`);
    gradient.addColorStop(1, `${color}00`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, [color]);
  useFrame(({ clock, pointer }) => {
    if (ref.current) {
      const pulse =
        0.72 +
        Math.sin(clock.elapsedTime * (1.8 + phase * 0.03) + phase) * 0.28;
      const drift = 0.045;
      ref.current.position.x =
        position[0] +
        Math.sin(clock.elapsedTime * 0.45 + phase) * 0.18 +
        (pointer.x * 0.35 - position[0]) * drift;
      ref.current.position.y =
        position[1] +
        Math.cos(clock.elapsedTime * 0.6 + phase) * 0.16 +
        (pointer.y * 0.28 - position[1]) * drift;
      ref.current.position.z =
        position[2] + Math.sin(clock.elapsedTime * 0.3 + phase) * 0.08;
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + phase) * 0.3;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#fff6d0" toneMapped={false} />
      </mesh>
      <sprite scale={[0.28, 0.28, 0.28]}>
        <spriteMaterial
          map={glow}
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight color={color} intensity={0.08} distance={0.45} />
    </group>
  );
}

function SceneTitle() {
  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const tilt = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onTilt = (event: DeviceOrientationEvent) => {
      tilt.current.x = Math.max(-18, Math.min(18, event.beta ?? 0)) / 18;
      tilt.current.y = Math.max(-18, Math.min(18, event.gamma ?? 0)) / 18;
    };
    window.addEventListener('deviceorientation', onTilt);
    return () => window.removeEventListener('deviceorientation', onTilt);
  }, []);
  // R3F's render loop intentionally mutates the live camera for parallax.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(({ pointer }) => {
    // eslint-disable-next-line react-hooks/immutability
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 0.28 + tilt.current.y * 0.16,
      3,
      1 / 60,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      0.65 + pointer.y * 0.16 - tilt.current.x * 0.12,
      3,
      1 / 60,
    );
    camera.lookAt(0, 0.35, 0);
  });
  return null;
}

function RoomScene() {
  return (
    <>
      <color attach="background" args={['#352b5d']} />
      <CameraRig />
      <NightBackdrop />
      <ambientLight intensity={0.42} color="#d7c5ff" />
      <Window />
      <FairyLights />
      <Shelf />
      <Jar />
      <SceneTitle />
      <Sparkles
        count={24}
        scale={[7, 5, 1]}
        size={1.5}
        speed={0.15}
        color="#ffd97a"
        opacity={0.35}
      />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.65} luminanceThreshold={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.28} darkness={0.45} />
        <Noise opacity={0.025} />
      </EffectComposer>
    </>
  );
}

export function Room() {
  return (
    <div className="room-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.65, 7], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <RoomScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
