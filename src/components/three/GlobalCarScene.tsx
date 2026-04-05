"use client";

import { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Points, PointMaterial, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// 1. SYSTEM INITIALIZATION & SAFE REGISTRATION
// ─────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ─────────────────────────────────────────────────────────────
// 2. GLOBAL PHYSICS & TELEMETRY STATE
// ─────────────────────────────────────────────────────────────
const PHYSICS = {
  velocity: 0,
  acceleration: 0,
  progress: 0,
  lastVelocity: 0,
};

const SENSORS = {
  mouse: new THREE.Vector2(0, 0),
  gyro: new THREE.Vector2(0, 0),
};

if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    SENSORS.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    SENSORS.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma && e.beta) {
      SENSORS.gyro.x = THREE.MathUtils.clamp(e.gamma / 45, -1, 1);
      SENSORS.gyro.y = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// 3. KINETIC CAMERA RIG
// ─────────────────────────────────────────────────────────────
function CameraRig({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  const baseFov = isMobile ? 64 : 48;
  const shakeVec = useMemo(() => new THREE.Vector3(), []);
  const targetPos = useMemo(() => new THREE.Vector3(0, 1.6, isMobile ? 8.5 : 7.5), [isMobile]);

  useFrame((state, delta) => {
    const speedWarp = Math.abs(PHYSICS.velocity) * 20;
    const targetFov = baseFov + speedWarp;
    
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.damp(cam.fov, targetFov, 4, delta);
    cam.updateProjectionMatrix();

    if (Math.abs(PHYSICS.velocity) > 0.05) {
      const shakeIntensity = Math.min(Math.abs(PHYSICS.velocity) * 0.3, 0.5);
      shakeVec.set(
        Math.sin(state.clock.elapsedTime * 60) * shakeIntensity,
        Math.cos(state.clock.elapsedTime * 70) * shakeIntensity,
        0
      );
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPos.x + shakeVec.x, 0.5);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPos.y + shakeVec.y, 0.5);
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 4, delta);
    }

    const lookX = isMobile ? SENSORS.gyro.x * 0.5 : SENSORS.mouse.x * 0.5;
    const lookY = isMobile ? SENSORS.gyro.y * 0.5 : SENSORS.mouse.y * 0.5;
    
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, -lookX * 0.1, 3, delta);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, lookY * 0.1, 3, delta);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────
// 4. ENVIRONMENT: CYBERPUNK MOVING FLOOR GRID
// ─────────────────────────────────────────────────────────────
function GroundGrid() {
  const gridRef = useRef<THREE.GridHelper>(null!);

  useFrame((state) => {
    if (!gridRef.current) return;
    const baseSpeed = 0.5;
    const scrollSpeed = PHYSICS.velocity * 10;
    const totalSpeed = baseSpeed + Math.abs(scrollSpeed);
    gridRef.current.position.z = (state.clock.elapsedTime * totalSpeed) % 2;
  });

  return (
    <group position={[0, -0.28, 0]}>
      <gridHelper ref={gridRef} args={[100, 100, "#E10600", "#ffffff"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#030303" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. ENVIRONMENT: HIGH-SPEED INSTANCED STREAKS
// ─────────────────────────────────────────────────────────────
function SpeedLines({ isMobile }: { isMobile: boolean }) {
  const count = isMobile ? 100 : 300;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 20 + 5,
      z: (Math.random() - 0.5) * 100,
      speed: 10 + Math.random() * 20,
      scale: Math.random() * 2 + 1,
    }));
  }, [count]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    
    const speedThreshold = Math.abs(PHYSICS.velocity);
    const targetOpacity = speedThreshold > 0.1 ? Math.min(speedThreshold * 2, 1) : 0;
    
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);

    if (mat.opacity < 0.01) return;

    lines.forEach((line, i) => {
      line.z += (line.speed + speedThreshold * 50) * delta;
      if (line.z > 10) {
        line.z = -100;
        line.x = (Math.random() - 0.5) * 40;
        line.y = (Math.random() - 0.5) * 20 + 5;
      }
      dummy.position.set(line.x, line.y, line.z);
      dummy.scale.set(0.02, 0.02, line.scale + speedThreshold * 10);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. WIND TUNNEL & AERO EMBERS
// ─────────────────────────────────────────────────────────────
function WindTunnelStars({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = isMobile ? 1500 : 4000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 15 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250 - 50;
    }
    return pos;
  }, [count]);

  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.03;
    const stretch = Math.abs(PHYSICS.velocity) * 40;
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, stretch, 0.1);
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#ffffff" size={isMobile ? 0.03 : 0.02} sizeAttenuation depthWrite={false} opacity={0.15} />
    </Points>
  );
}

function AerodynamicEmbers({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = isMobile ? 400 : 1000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 25;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.5;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    const turbulence = 1 + Math.abs(PHYSICS.velocity) * 8;
    ref.current.rotation.y += delta * 0.15 * turbulence;
    ref.current.rotation.x = Math.sin(time * 0.5) * 0.1 * turbulence;
    
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(time * 5) * 0.4;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#E10600" size={isMobile ? 0.08 : 0.06} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. VOLUMETRIC EXHAUST PLUME
// ─────────────────────────────────────────────────────────────
function ExhaustHeat({ targetRef }: { targetRef: React.RefObject<THREE.Group | null> }) {
  const trailRef = useRef<THREE.Points>(null!);
  const length = 60;
  const positions = useMemo(() => new Float32Array(length * 3), []);
  const sizes = useMemo(() => new Float32Array(length), []);
  const history = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    for (let i = 0; i < length; i++) sizes[i] = (1 - i / length) * 0.25;
  }, [sizes]);

  useFrame(() => {
    if (!targetRef.current || !trailRef.current) return;
    
    const wp = new THREE.Vector3();
    targetRef.current.getWorldPosition(wp);
    
    wp.z += 1.9;
    wp.y += 0.18;

    history.current.unshift(wp.clone());
    if (history.current.length > length) history.current.pop();

    for (let i = 0; i < length; i++) {
      const h = history.current[i];
      if (h) {
        const spread = (i / length) * 0.6;
        positions[i * 3]     = h.x + (Math.sin(i * 0.7) * spread);
        positions[i * 3 + 1] = h.y + (Math.cos(i * 0.7) * spread);
        positions[i * 3 + 2] = h.z + (i * 0.1);
      }
    }
    trailRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial transparent color="#FFB800" size={1.2} sizeAttenuation depthWrite={false} opacity={0.5} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. MASTER CAR MODEL & THE ORBITAL GSAP ENGINE
// ─────────────────────────────────────────────────────────────
function CarModel({ isMobile }: { isMobile: boolean }) {
  const outerGroupRef = useRef<THREE.Group>(null!);
  const innerGroupRef = useRef<THREE.Group>(null!);
  
  const { scene } = useGLTF("/f1-car.glb");

  const optimizedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        if (mat) {
          mat.envMapIntensity = 3.0;
          mat.roughness = 0.1;
          if ('clearcoat' in mat) {
            (mat as THREE.MeshPhysicalMaterial).clearcoat = 1.0;
            (mat as THREE.MeshPhysicalMaterial).clearcoatRoughness = 0.05;
          }
          mat.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  // ── G-FORCE PHYSICS ──
  useFrame((state, delta) => {
    if (!innerGroupRef.current) return;
    const time = state.clock.elapsedTime;
    const car = innerGroupRef.current;

    const rpmFactor = 1 + Math.abs(PHYSICS.velocity) * 10;
    const idleY = Math.sin(time * 10 * rpmFactor) * 0.008;
    const idleZRot = Math.sin(time * 5 * rpmFactor) * 0.003;

    const acceleration = (PHYSICS.velocity - PHYSICS.lastVelocity) / delta;
    PHYSICS.lastVelocity = PHYSICS.velocity;
    PHYSICS.acceleration = THREE.MathUtils.lerp(PHYSICS.acceleration, acceleration, 0.1);

    const pitchFromVelocity = PHYSICS.velocity * 1.5; 
    const pitchFromAccel = PHYSICS.acceleration * 0.08;
    const targetPitch = THREE.MathUtils.clamp(pitchFromVelocity + pitchFromAccel, -0.25, 0.25);

    const targetYaw = isMobile ? SENSORS.gyro.x * -0.5 : SENSORS.mouse.x * -0.25;
    const targetRoll = isMobile ? SENSORS.gyro.x * 0.25 : SENSORS.mouse.x * 0.1;

    car.position.y = THREE.MathUtils.damp(car.position.y, idleY, 6, delta);
    car.rotation.x = THREE.MathUtils.damp(car.rotation.x, targetPitch, 5, delta);
    car.rotation.y = THREE.MathUtils.damp(car.rotation.y, targetYaw, 4, delta);
    car.rotation.z = THREE.MathUtils.damp(car.rotation.z, idleZRot + targetRoll, 5, delta);
  });

  // ── THE HELICAL ORBIT GSAP TIMELINE ──
  useGSAP(() => {
    const g = outerGroupRef.current;
    if (!g) return;

    ScrollTrigger.refresh();

    const scaleBase = isMobile ? 0.5 : 0.85;
    const scaleZoom = isMobile ? 0.8 : 1.4;
    // INCREASED STARTING SCALE so the car is highly visible on load
    const scaleStart = isMobile ? 0.45 : 0.75; 

    // ZERO STATE: Brought much closer to the camera lens initially
    g.scale.set(scaleStart, scaleStart, scaleStart);
    g.position.set(isMobile ? -4 : -10, 0.8, isMobile ? -8 : -12);
    g.rotation.set(0, Math.PI / 1.5, 0); 

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: (self) => {
          PHYSICS.velocity = self.getVelocity() / 1000;
          PHYSICS.progress = self.progress;
        }
      },
    });

    if (isMobile) {
      tl
        .to(g.position, { x: 3, z: -6, y: 0.2, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(g.rotation, { y: Math.PI / 4, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(g.scale, { x: scaleBase, y: scaleBase, z: scaleBase, duration: 1.5 }, 0)
        
        .to(g.position, { x: 2.5, z: 4, y: -0.2, duration: 1.5, ease: "power2.inOut" }, 1.5)
        .to(g.rotation, { y: -Math.PI / 2, duration: 1.5, ease: "power2.inOut" }, 1.5)
        .to(g.scale, { x: scaleZoom, y: scaleZoom, z: scaleZoom, duration: 1.5, ease: "power2.out" }, 1.5)
        
        .to(g.position, { x: -3.5, z: 5, y: -0.4, duration: 1.5, ease: "power1.inOut" }, 3)
        .to(g.rotation, { y: -Math.PI + 0.2, duration: 1.5, ease: "power1.inOut" }, 3)
        
        .to(g.position, { x: 0, z: 0.5, y: -0.5, duration: 1.5, ease: "power3.out" }, 4.5)
        .to(g.rotation, { y: 0.1, x: 0.05, z: -0.02, duration: 1.5, ease: "power3.out" }, 4.5)
        .to(g.scale, { x: scaleBase, y: scaleBase, z: scaleBase, duration: 1.5, ease: "power2.inOut" }, 4.5)
        
        .to(g.position, { x: -1.2, y: -2.5, z: 1.5, duration: 1.5, ease: "power1.inOut" }, 6)
        .to(g.rotation, { y: 0.3, x: 0.1, z: 0.05, duration: 1.5, ease: "power1.inOut" }, 6)
        
        .to(g.position, { x: 1.2, y: -4.5, z: 2.5, duration: 1.5, ease: "power1.inOut" }, 7.5)
        .to(g.rotation, { y: -0.2, x: 0.1, z: -0.05, duration: 1.5, ease: "power1.inOut" }, 7.5)
        
        .to(g.position, { x: 0, y: -7, z: 6, duration: 2, ease: "power3.in" }, 9)
        .to(g.rotation, { y: 0, x: 0.2, z: 0, duration: 2, ease: "power3.in" }, 9);

    } else {
      tl
        .to(g.position, { x: 6, z: -8, y: 0.5, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(g.rotation, { y: Math.PI / 4, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(g.scale, { x: scaleBase, y: scaleBase, z: scaleBase, duration: 1.5 }, 0)
        
        .to(g.position, { x: 8, z: 5, y: -0.2, duration: 1.5, ease: "power2.inOut" }, 1.5)
        .to(g.rotation, { y: -Math.PI / 2, duration: 1.5, ease: "power2.inOut" }, 1.5)
        .to(g.scale, { x: scaleZoom, y: scaleZoom, z: scaleZoom, duration: 1.5, ease: "power2.out" }, 1.5)
        
        .to(g.position, { x: -6, z: 7, y: -0.5, duration: 1.5, ease: "power1.inOut" }, 3)
        .to(g.rotation, { y: -Math.PI + 0.1, duration: 1.5, ease: "power1.inOut" }, 3)
        
        .to(g.position, { x: 0, z: 0.5, y: -0.5, duration: 1.5, ease: "power3.out" }, 4.5)
        .to(g.rotation, { y: 0.1, x: 0.05, z: -0.02, duration: 1.5, ease: "power3.out" }, 4.5)
        .to(g.scale, { x: scaleBase, y: scaleBase, z: scaleBase, duration: 1.5, ease: "power2.inOut" }, 4.5)
        
        .to(g.position, { x: -3, y: -2.5, z: 2, duration: 1.5, ease: "power1.inOut" }, 6)
        .to(g.rotation, { y: 0.4, x: 0.15, z: 0.05, duration: 1.5, ease: "power1.inOut" }, 6)
        
        .to(g.position, { x: 3, y: -4.5, z: 3.5, duration: 1.5, ease: "power1.inOut" }, 7.5)
        .to(g.rotation, { y: -0.3, x: 0.1, z: -0.05, duration: 1.5, ease: "power1.inOut" }, 7.5)
        
        .to(g.position, { x: 0, y: -8, z: 8.5, duration: 2, ease: "power3.in" }, 9)
        .to(g.rotation, { y: 0, x: 0.3, z: 0, duration: 2, ease: "power3.in" }, 9);
    }
  }, [isMobile]); 

  return (
    <group ref={outerGroupRef}>
      <ContactShadows position={[0, -0.28, 0]} opacity={0.8} scale={8} blur={2.5} far={4} color="#000000" />
      
      <group ref={innerGroupRef}>
        <primitive object={optimizedScene} />
        <pointLight position={[0, 0.2, -2.3]} color="#E10600" intensity={40} distance={8} decay={2} />
        <pointLight position={[0, 0.2,  2.2]} color="#ffffff" intensity={15} distance={8} decay={2} />
        <pointLight position={[0, -0.4, 0  ]} color="#E10600" intensity={20} distance={6} decay={2} />
        <pointLight position={[0, 0.8,  0  ]} color="#00E5FF" intensity={5}  distance={4} decay={2} />
      </group>
      
      <ExhaustHeat targetRef={innerGroupRef} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// PRELOADER HOLOGRAPHIC PROXY
// ─────────────────────────────────────────────────────────────
function CarPlaceholder({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.4;
    ref.current.position.y = Math.sin(t * 2) * 0.05;
  });

  return (
    // Matches the updated, closer starting coordinates
    <group ref={ref} position={[isMobile ? -4 : -10, 0.8, isMobile ? -8 : -12]} scale={isMobile ? 0.45 : 0.75}>
      <mesh>
        <boxGeometry args={[1.4, 0.25, 4.0]} />
        <meshBasicMaterial color="#E10600" wireframe wireframeLinewidth={2} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.3, -0.2]}>
        <boxGeometry args={[0.7, 0.35, 1.5]} />
        <meshBasicMaterial color="#00E5FF" wireframe transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#E10600" intensity={15} distance={6} />
    </group>
  );
}

useGLTF.preload("/f1-car.glb");

// ─────────────────────────────────────────────────────────────
// MAIN SCENE EXPORT
// ─────────────────────────────────────────────────────────────
export function GlobalCarScene() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundColor: "#030303" }}>
      <Canvas
        style={{ background: "transparent" }}
        dpr={isMobile ? 1 : [1, 2]} 
        shadows
        gl={{ 
          antialias: !isMobile, 
          powerPreference: "high-performance", 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <CameraRig isMobile={isMobile} />
        
        <ambientLight intensity={0.1} />
        
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={4.0} 
          color="#ffffff" 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
          shadow-bias={-0.0001} 
        />
        <directionalLight position={[-15, -5, -10]} intensity={3.5} color="#E10600" />
        <directionalLight position={[15, 5, -5]} intensity={2.5} color="#00E5FF" />
        
        <Environment preset="night" />
        
        <GroundGrid />
        <WindTunnelStars isMobile={isMobile} />
        <AerodynamicEmbers isMobile={isMobile} />
        <SpeedLines isMobile={isMobile} />
        
        <Suspense fallback={<CarPlaceholder isMobile={isMobile} />}>
          <CarModel isMobile={isMobile} />
        </Suspense>

        {!isMobile && (
          <EffectComposer multisampling={4}>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
            <Noise opacity={0.025} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}