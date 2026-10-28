import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { feelingColors } from './palette';

const artwork = { width: 1536, height: 1024 };
const jarInterior = { x: 642, y: 438, width: 270, height: 292 };
const crawlerPath = { x: 875, y: 786, width: 185, height: 48 };

const sceneVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sceneFragmentShader = `
  uniform sampler2D uMap;
  uniform vec2 uResolution;
  uniform float uTime;
  varying vec2 vUv;

  float ellipseMask(vec2 point, vec2 center, vec2 radius) {
    float distanceFromCenter = length((point - center) / radius);
    return 1.0 - smoothstep(0.78, 1.12, distanceFromCenter);
  }

  void main() {
    float imageAspect = 1.5;
    float viewAspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 sampleUv = vUv;
    if (viewAspect < imageAspect) {
      float visibleWidth = viewAspect / imageAspect;
      sampleUv.x = (1.0 - visibleWidth) * 0.5 + vUv.x * visibleWidth;
    } else {
      float visibleHeight = imageAspect / viewAspect;
      sampleUv.y = (1.0 - visibleHeight) * 0.5 + vUv.y * visibleHeight;
    }

    vec2 topUv = vec2(sampleUv.x, 1.0 - sampleUv.y);
    float lake = max(
      ellipseMask(topUv, vec2(0.76, 0.49), vec2(0.23, 0.105)),
      ellipseMask(topUv, vec2(0.93, 0.48), vec2(0.105, 0.075))
    );
    float foliage = max(
      ellipseMask(topUv, vec2(0.18, 0.69), vec2(0.22, 0.18)),
      ellipseMask(topUv, vec2(0.94, 0.72), vec2(0.12, 0.2))
    );
    float time = uTime;
    vec2 warpedUv = sampleUv;
    float ripple = sin(topUv.y * 210.0 + sin(topUv.x * 28.0 + time * 0.24) - time * 1.2);
    warpedUv.x += lake * ripple * 0.00145;
    warpedUv.y += lake * sin(topUv.x * 165.0 - time * 0.92) * 0.00065;
    warpedUv.x += foliage * sin(time * 1.4 + topUv.y * 17.0 + topUv.x * 26.0) * 0.0022;

    vec3 color = texture2D(uMap, warpedUv).rgb;
    float waterGlint = pow(max(0.0, sin(topUv.y * 210.0 + topUv.x * 25.0 - time * 1.3)), 20.0);
    color += vec3(0.12, 0.16, 0.2) * waterGlint * lake * 0.34;

    vec2 skyCell = floor(topUv * vec2(46.0, 30.0));
    float seed = fract(sin(dot(skyCell, vec2(127.1, 311.7))) * 43758.5453);
    float twinkle = pow(max(0.0, sin(time * (0.35 + seed * 0.55) + seed * 6.283)), 18.0);
    float sky = 1.0 - smoothstep(0.28, 0.39, topUv.y);
    float star = step(0.972, seed) * twinkle * sky;
    color += vec3(0.17, 0.2, 0.29) * star * 0.72;

    float moonHalo = exp(-length((topUv - vec2(0.77, 0.17)) / vec2(0.065, 0.085)) * 3.2);
    color += vec3(0.1, 0.082, 0.055) * moonHalo * (0.5 + 0.5 * sin(time * 0.22)) * 0.055;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type SceneFrame = {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

type WorldRect = { left: number; top: number; width: number; height: number };

function useSceneFrame(stage: React.RefObject<HTMLDivElement | null>) {
  const [frame, setFrame] = useState<SceneFrame | null>(null);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      const scale = Math.max(width / artwork.width, height / artwork.height);
      const next = {
        width,
        height,
        scale,
        offsetX: (width - artwork.width * scale) / 2,
        offsetY: (height - artwork.height * scale) / 2,
      };
      setFrame((current) =>
        current &&
        Math.abs(current.width - width) < 0.5 &&
        Math.abs(current.height - height) < 0.5
          ? current
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, [stage]);
  return frame;
}

function toWorldRect(
  rect: { x: number; y: number; width: number; height: number },
  frame: SceneFrame,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
): WorldRect {
  const left = frame.offsetX + rect.x * frame.scale;
  const top = frame.offsetY + rect.y * frame.scale;
  return {
    left: (left / size.width - 0.5) * viewport.width,
    top: (0.5 - top / size.height) * viewport.height,
    width: (rect.width * frame.scale * viewport.width) / size.width,
    height: (rect.height * frame.scale * viewport.height) / size.height,
  };
}

function AnimatedBackdrop({ calmMode }: { calmMode: boolean }) {
  const sourceTexture = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}assets/glowmory-night-clearing.jpg`,
  );
  const texture = useMemo(() => {
    const sceneTexture = sourceTexture.clone();
    sceneTexture.colorSpace = THREE.SRGBColorSpace;
    sceneTexture.needsUpdate = true;
    return sceneTexture;
  }, [sourceTexture]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { camera, size, viewport } = useThree();
  const plane = viewport.getCurrentViewport(
    camera,
    new THREE.Vector3(0, 0, -1),
  );
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTime: { value: 0 },
    }),
    [size.height, size.width, texture],
  );
  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime!.value =
      clock.elapsedTime * (calmMode ? 0.16 : 1);
    material.current.uniforms.uResolution!.value.set(size.width, size.height);
  });
  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[plane.width, plane.height]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={sceneVertexShader}
        fragmentShader={sceneFragmentShader}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Fireflies({
  frame,
  calmMode,
}: {
  frame: SceneFrame;
  calmMode: boolean;
}) {
  const { camera, size, viewport } = useThree();
  const plane = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 2));
  const jar = useMemo(
    () => toWorldRect(jarInterior, frame, size, plane),
    [frame, plane, size],
  );
  const points = useMemo(
    () => [
      { x: 0.23, y: 0.25, z: 0.02, phase: 0.4, color: feelingColors.proud },
      { x: 0.74, y: 0.3, z: 0.09, phase: 1.7, color: feelingColors.loved },
      { x: 0.47, y: 0.46, z: -0.06, phase: 3, color: feelingColors.peaceful },
      { x: 0.24, y: 0.64, z: 0.07, phase: 4.2, color: feelingColors.silly },
      { x: 0.72, y: 0.63, z: -0.02, phase: 5.3, color: feelingColors.brave },
      { x: 0.5, y: 0.78, z: 0.1, phase: 6.6, color: feelingColors.thankful },
    ],
    [],
  );
  const scale = jar.width * 0.5;
  return (
    <group>
      {points.map((fly) => (
        <Firefly
          key={fly.phase}
          {...fly}
          jar={jar}
          scale={scale}
          calmMode={calmMode}
        />
      ))}
    </group>
  );
}

function Caterpillar({
  path,
  jarWidth,
  calmMode,
}: {
  path: WorldRect;
  jarWidth: number;
  calmMode: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const segments = useRef<Array<THREE.Group | null>>([]);
  const legs = useRef<Array<THREE.Mesh | null>>([]);
  const unit = jarWidth * 0.12;
  const bodyLength = unit * 1.55;
  useFrame(({ clock }) => {
    if (!root.current) return;
    const speed = calmMode ? 0.007 : 0.018;
    const travel = (clock.elapsedTime * speed + 0.12) % 1;
    const x =
      path.left +
      unit * 0.85 +
      travel * Math.max(0, path.width - bodyLength - unit * 1.7);
    const time = clock.elapsedTime * (calmMode ? 2 : 5.2);
    root.current.position.set(
      x,
      path.top - path.height * 0.58 + Math.sin(time * 0.55) * unit * 0.018,
      2.75,
    );
    segments.current.forEach((segment, index) => {
      if (!segment) return;
      segment.position.y = Math.sin(time - index * 0.72) * unit * 0.025;
      segment.rotation.z = Math.sin(time * 0.55 - index * 0.65) * 0.045;
    });
    legs.current.forEach((leg, index) => {
      if (leg) leg.rotation.z = Math.sin(time * 1.7 + index * 1.35) * 0.22;
    });
  });
  return (
    <group ref={root}>
      {Array.from({ length: 6 }, (_, index) => (
        <group
          key={`segment-${index}`}
          ref={(node) => {
            segments.current[index] = node;
          }}
          position={[0.28 * unit - index * 0.22 * unit, 0, 0]}
        >
          <mesh scale={[0.19, 0.2, 0.17]}>
            <sphereGeometry args={[unit, 16, 12]} />
            <meshStandardMaterial
              color={index % 2 ? '#788e4b' : '#91a65e'}
              roughness={0.68}
              emissive="#26351b"
              emissiveIntensity={0.14}
            />
          </mesh>
          <mesh
            position={[0, unit * 0.15, unit * 0.14]}
            scale={[0.045, 0.035, 0.025]}
          >
            <sphereGeometry args={[unit, 10, 8]} />
            <meshStandardMaterial color="#bdc47a" roughness={0.82} />
          </mesh>
        </group>
      ))}
      <mesh
        position={[0.52 * unit, unit * 0.015, 0]}
        scale={[0.22, 0.21, 0.18]}
      >
        <sphereGeometry args={[unit, 16, 12]} />
        <meshStandardMaterial
          color="#9aaa60"
          roughness={0.64}
          emissive="#26351b"
          emissiveIntensity={0.14}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={`eye-${side}`}
          position={[0.6 * unit, unit * 0.055, side * unit * 0.15]}
          scale={[0.038, 0.044, 0.024]}
        >
          <sphereGeometry args={[unit, 10, 8]} />
          <meshBasicMaterial color="#302c28" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={`feel-${side}`}
          position={[0.68 * unit, unit * 0.2, side * unit * 0.07]}
          rotation={[side * 0.2, 0, 0.28]}
          scale={[0.018, 0.11, 0.018]}
        >
          <sphereGeometry args={[unit, 8, 6]} />
          <meshStandardMaterial color="#71834b" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, index) =>
        [-1, 1].map((side) => {
          const legIndex = index * 2 + (side > 0 ? 1 : 0);
          return (
            <mesh
              key={`leg-${legIndex}`}
              ref={(node) => {
                legs.current[legIndex] = node;
              }}
              position={[
                0.24 * unit - index * 0.22 * unit,
                -unit * 0.14,
                side * unit * 0.09,
              ]}
              scale={[0.04, 0.14, 0.035]}
            >
              <sphereGeometry args={[unit, 8, 6]} />
              <meshStandardMaterial color="#52633c" roughness={0.75} />
            </mesh>
          );
        }),
      )}
    </group>
  );
}

function Firefly({
  x,
  y,
  z,
  phase,
  color,
  jar,
  scale,
  calmMode,
}: {
  x: number;
  y: number;
  z: number;
  phase: number;
  color: string;
  jar: WorldRect;
  scale: number;
  calmMode: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const time =
      clock.elapsedTime * (calmMode ? 0.14 : 0.25 + phase * 0.009) + phase;
    const dx = Math.cos(time) * 0.14 + Math.cos(time * 0.59 + phase) * 0.08;
    const dy = -Math.sin(time) * 0.11 - Math.sin(time * 0.59 + phase) * 0.06;
    if (!ref.current) return;
    ref.current.position.set(
      jar.left +
        jar.width *
          (x + Math.sin(time) * 0.12 + Math.sin(time * 0.59 + phase) * 0.055),
      jar.top -
        jar.height *
          (y + Math.cos(time) * 0.1 + Math.cos(time * 0.59 + phase) * 0.045),
      2 + z + Math.sin(time * 0.38 + phase) * 0.08,
    );
    ref.current.rotation.z = Math.atan2(dy, dx) + Math.PI;
  });
  return (
    <group ref={ref}>
      <FireflyModel
        color={color}
        phase={phase}
        scale={scale}
        calmMode={calmMode}
      />
    </group>
  );
}

function FireflyModel({
  color,
  phase,
  scale,
  calmMode = false,
}: {
  color: string;
  phase: number;
  scale: number;
  calmMode?: boolean;
}) {
  const lantern = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.SpriteMaterial>(null);
  const lanternLight = useRef<THREE.PointLight>(null);
  const wingLeft = useRef<THREE.Mesh>(null);
  const wingRight = useRef<THREE.Mesh>(null);
  const glow = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 32);
    gradient.addColorStop(0, 'rgb(255 248 230 / 100%)');
    gradient.addColorStop(0.12, `${color}ee`);
    gradient.addColorStop(0.42, `${color}66`);
    gradient.addColorStop(1, `${color}00`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, [color]);
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const pulse = Math.pow(
      0.5 +
        0.5 *
          Math.sin(time * Math.PI * 2 * (0.2 + (phase % 4) * 0.035) + phase),
      2.4,
    );
    const flutter = time * (calmMode ? 6 : 15) + phase;
    if (lantern.current) lantern.current.opacity = 0.1 + pulse * 0.9;
    if (halo.current) halo.current.opacity = 0.12 + pulse * 0.82;
    if (lanternLight.current)
      lanternLight.current.intensity = 0.01 + pulse * 0.32;
    if (wingLeft.current)
      wingLeft.current.rotation.z = 0.48 + Math.sin(flutter) * 0.16;
    if (wingRight.current)
      wingRight.current.rotation.z = -0.48 + Math.sin(flutter + Math.PI) * 0.16;
  });
  return (
    <group scale={scale}>
      <mesh position={[-0.016, 0, 0]} scale={[0.082, 0.027, 0.025]}>
        <sphereGeometry args={[1, 16, 10]} />
        <meshBasicMaterial color="#38263e" />
      </mesh>
      <mesh position={[-0.077, 0, 0]} scale={[0.025, 0.023, 0.024]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshBasicMaterial color="#49334a" />
      </mesh>
      <mesh
        ref={wingLeft}
        position={[-0.015, 0.027, 0.012]}
        scale={[0.045, 0.014, 0.005]}
      >
        <sphereGeometry args={[1, 14, 8]} />
        <meshBasicMaterial
          color="#f4dfe6"
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={wingRight}
        position={[-0.015, -0.027, -0.012]}
        scale={[0.045, 0.014, 0.005]}
      >
        <sphereGeometry args={[1, 14, 8]} />
        <meshBasicMaterial
          color="#e4dafa"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.083, 0, 0]} scale={[0.034, 0.027, 0.025]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshBasicMaterial
          ref={lantern}
          color={color}
          transparent
          toneMapped={false}
        />
      </mesh>
      <sprite position={[0.083, 0, -0.015]} scale={[0.38, 0.38, 1]}>
        <spriteMaterial
          ref={halo}
          map={glow}
          color={color}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <pointLight
        ref={lanternLight}
        position={[0.083, 0, 0.04]}
        color={color}
        intensity={0.1}
        distance={0.7}
        decay={2}
      />
    </group>
  );
}

function BirthRitual({
  birthKey,
  jar,
  flyScale,
}: {
  birthKey: number;
  jar: WorldRect;
  flyScale: number;
}) {
  const start = useRef(0);
  const note = useRef<THREE.Group>(null);
  const serum = useRef<THREE.Group>(null);
  const newborn = useRef<THREE.Group>(null);
  const noteMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const serumMaterial = useRef<THREE.MeshBasicMaterial>(null);
  useEffect(() => {
    if (birthKey) start.current = performance.now();
  }, [birthKey]);
  useFrame(({ clock, viewport, camera }) => {
    if (!birthKey || !start.current) return;
    const view = viewport.getCurrentViewport(
      camera,
      new THREE.Vector3(0, 0, 2),
    );
    const elapsed = (performance.now() - start.current) / 1000;
    const t = Math.min(elapsed, 8);
    const targetX = jar.left + jar.width * 0.5;
    const targetY = jar.top - jar.height * 0.5;
    if (note.current) {
      const fold = THREE.MathUtils.smoothstep(t, 0.8, 2.2);
      const lift = THREE.MathUtils.smoothstep(t, 0.4, 2.3);
      note.current.position.set(
        THREE.MathUtils.lerp(-view.width * 0.46, targetX, lift),
        THREE.MathUtils.lerp(
          targetY - jar.height * 0.4,
          targetY + jar.height * 0.38,
          lift,
        ),
        2.5,
      );
      note.current.rotation.z = -0.08 + fold * Math.PI * 0.5;
      note.current.scale.set(1 - fold * 0.5, 1 - fold * 0.25, 1);
      if (noteMaterial.current)
        noteMaterial.current.opacity = THREE.MathUtils.clamp(
          1 - THREE.MathUtils.smoothstep(t, 2.2, 3.6),
          0,
          1,
        );
    }
    if (serum.current) {
      const drip = THREE.MathUtils.smoothstep(t, 2.8, 5.8);
      serum.current.visible = t > 2.5 && t < 6.4;
      serum.current.position.set(
        targetX,
        THREE.MathUtils.lerp(
          targetY + jar.height * 0.38,
          targetY - jar.height * 0.32,
          drip,
        ),
        2.55,
      );
      serum.current.scale.setScalar(0.28 + Math.sin(t * 7) * 0.025);
      if (serumMaterial.current)
        serumMaterial.current.opacity =
          t < 3.1 ? (t - 2.5) / 0.6 : t > 5.8 ? 1 - (t - 5.8) / 0.6 : 0.9;
    }
    if (newborn.current) {
      const awaken = THREE.MathUtils.smoothstep(t, 5.7, 7.4);
      newborn.current.visible = t > 5.7;
      newborn.current.position.set(targetX, targetY, 2.65);
      newborn.current.rotation.z = Math.sin(clock.elapsedTime * 3.2) * 0.15;
      newborn.current.scale.setScalar(flyScale * (0.05 + awaken * 0.95));
    }
  });
  return (
    <group>
      <group ref={note}>
        <mesh>
          <planeGeometry args={[0.42, 0.3]} />
          <meshBasicMaterial
            ref={noteMaterial}
            color="#fff1d8"
            transparent
            opacity={0}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.3, 0.015]} />
          <meshBasicMaterial color="#d895a4" transparent opacity={0.45} />
        </mesh>
      </group>
      <group ref={serum} visible={false}>
        <mesh>
          <sphereGeometry args={[0.42, 24, 16]} />
          <meshBasicMaterial
            ref={serumMaterial}
            color={feelingColors.proud}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          color={feelingColors.proud}
          intensity={0.7}
          distance={0.8}
        />
      </group>
      <group ref={newborn} visible={false}>
        <FireflyModel color={feelingColors.proud} phase={1.4} scale={1} />
      </group>
    </group>
  );
}

function RoomScene({
  frame,
  birthKey,
  calmMode,
}: {
  frame: SceneFrame;
  birthKey: number;
  calmMode: boolean;
}) {
  const { camera, size, viewport } = useThree();
  const plane = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 2));
  const jar = useMemo(
    () => toWorldRect(jarInterior, frame, size, plane),
    [frame, plane, size],
  );
  const crawler = useMemo(
    () => toWorldRect(crawlerPath, frame, size, plane),
    [frame, plane, size],
  );
  const flyScale = jar.width * 0.67;
  return (
    <>
      <AnimatedBackdrop calmMode={calmMode} />
      <ambientLight intensity={1.25} color="#e7dfcd" />
      <directionalLight position={[-2, 4, 5]} intensity={1.4} color="#fff0d6" />
      <Fireflies frame={frame} calmMode={calmMode} />
      <Caterpillar path={crawler} jarWidth={jar.width} calmMode={calmMode} />
      <BirthRitual birthKey={birthKey} jar={jar} flyScale={flyScale} />
    </>
  );
}

export function Room({
  birthKey = 0,
  calmMode = false,
}: {
  birthKey?: number;
  calmMode?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useSceneFrame(stage);
  const [pageVisible, setPageVisible] = useState(
    () => document.visibilityState !== 'hidden',
  );
  useEffect(() => {
    const onVisibilityChange = () =>
      setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);
  return (
    <div ref={stage} className="room-stage" aria-hidden="true">
      <div className={`room-world${calmMode ? ' room-world--calm' : ''}`}>
        {frame && (
          <Canvas
            className="room-fireflies"
            frameloop={pageVisible ? 'always' : 'never'}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 7], fov: 42 }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={null}>
              <RoomScene
                frame={frame}
                birthKey={birthKey}
                calmMode={calmMode}
              />
            </Suspense>
          </Canvas>
        )}
      </div>
    </div>
  );
}
