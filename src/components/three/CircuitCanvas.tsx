"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Points, PointMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   CRITICAL FIX: useGLTF must NEVER be called inside try/catch.
   That violates React hooks rules and silently kills the render.
   Instead: separate component that only mounts when GLB exists,
   wrapped in <Suspense> so any load error is caught cleanly.
───────────────────────────────────────────────────────────── */

/** Inner component — always call useGLTF unconditionally here */
function CarModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/f1-car.glb");

  // Clone so the scene can be reused safely
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Apply F1 red emissive to all meshes in the model
  useMemo(() => {
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => {
            const mat = (m as THREE.MeshStandardMaterial).clone();
            mat.envMapIntensity = 1.2;
            return mat;
          });
        } else {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.envMapIntensity = 1.2;
          mesh.material = mat;
        }
      }
    });
  }, [cloned]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.12;
    groupRef.current.rotation.y = Math.sin(t * 0.22) * 0.12 + Math.PI * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.38) * 0.018;
  });

  return (
    <Float speed={1.0} rotationIntensity={0.06} floatIntensity={0.3}>
      <group ref={groupRef} scale={[0.92, 0.92, 0.92]} position={[0, -0.25, 0]}>
        <primitive object={cloned} />
        {/* Front headlight glow */}
        <pointLight position={[0, 0, -1.8]} color="#FF1801" intensity={4} distance={5} decay={2} />
        {/* Rear light */}
        <pointLight position={[0, 0, 1.6]} color="#FF6600" intensity={2} distance={4} decay={2} />
        {/* Underglow */}
        <pointLight position={[0, -0.5, 0]} color="#E8002D" intensity={1.5} distance={3} decay={2} />
      </group>
    </Float>
  );
}

/* Preload — call at module level OUTSIDE any component */
useGLTF.preload("/f1-car.glb");

/* ─────────────────────────────────────────────────────────────
   FALLBACK — shown while GLB loads or if file missing
───────────────────────────────────────────────────────────── */
function CarFallback() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.5;
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8) * 0.1;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusKnotGeometry args={[0.8, 0.22, 128, 20]} />
      <meshStandardMaterial
        color="#E8002D"
        emissive="#E8002D"
        emissiveIntensity={0.4}
        metalness={0.9}
        roughness={0.15}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAR FIELD
───────────────────────────────────────────────────────────── */
function StarField({ count = 3500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 8;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.005;
    ref.current.rotation.x = s.clock.elapsedTime * 0.002;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#ffffff" size={0.01} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   RED SPARK STREAM
───────────────────────────────────────────────────────────── */
function SparkStream({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 8;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.25;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.06;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#FF1801" size={0.028} sizeAttenuation depthWrite={false} opacity={0.45} />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   AMBER ACCENT PARTICLES
───────────────────────────────────────────────────────────── */
function AmberDust({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = s.clock.elapsedTime * 0.03;
    ref.current.rotation.y = -s.clock.elapsedTime * 0.04;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#FFF200" size={0.015} sizeAttenuation depthWrite={false} opacity={0.25} />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPORTED CANVAS WRAPPER
───────────────────────────────────────────────────────────── */
export function CircuitCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 52 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 9, 5]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-4, -3, -4]} intensity={0.5} color="#FF1801" />
        <pointLight position={[0, 5, 2]} intensity={0.9} color="#ffffff" />

        {/* PBR environment for car reflections */}
        <Environment preset="night" />

        {/* Background particles */}
        <StarField count={3500} />
        <SparkStream count={500} />
        <AmberDust count={200} />

        {/* F1 Car — Suspense catches missing GLB gracefully */}
        <Suspense fallback={<CarFallback />}>
          <CarModel />
        </Suspense>
      </Canvas>
    </div>
  );
}