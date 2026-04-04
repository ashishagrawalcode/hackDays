"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Points, PointMaterial } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";

// Register plugins safely for Next.js SSR
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* ─────────────────────────────────────────────────────────────
   STAR FIELD — Optimized Buffer Geometry
───────────────────────────────────────────────────────────── */
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Reduced count from 4000 to 2000 for better performance without losing the aesthetic
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    return pos;
  }, []);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.004;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#ffffff" size={0.01} sizeAttenuation depthWrite={false} opacity={0.3} />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   RED SPARKS — Optimized
───────────────────────────────────────────────────────────── */
function Sparks() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 9;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = Math.sin(a) * r * 0.22;
    }
    return pos;
  }, []);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.055;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#FF1801" size={0.03} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   F1 CAR MODEL — GSAP Scroll-Driven
───────────────────────────────────────────────────────────── */
function CarModel() {
  const groupRef = useRef<THREE.Group>(null);
  const floatRef = useRef<THREE.Group>(null);

  // Load the model. Make sure this model is optimized!
  const { scene } = useGLTF("/f1-car.glb");
  
  // OPTIMIZATION: Mutate existing materials instead of cloning them to save RAM/CPU
  const optimizedScene = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial || mesh.material instanceof THREE.MeshPhysicalMaterial) {
          mesh.material.envMapIntensity = 1.4;
          mesh.material.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  // Idle float animation
  useFrame((s) => {
    if (!floatRef.current) return;
    const t = s.clock.elapsedTime;
    floatRef.current.position.y = Math.sin(t * 1.5) * 0.05; // Faster, tighter bounce
    floatRef.current.rotation.z = Math.sin(t * 1.0) * 0.01;
  });

  // GSAP SCROLL ANIMATION - using useGSAP for React 18 safety
  useGSAP(() => {
    const g = groupRef.current;
    if (!g) return;

    // Refresh ScrollTrigger to sync with Lenis/Next.js body height
    ScrollTrigger.refresh();

    // Setup initial state securely
    gsap.set(g.position, { x: 2.2, y: 0.2, z: -1 });
    gsap.set(g.rotation, { x: 0.08, y: -0.4, z: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        // Tie this to the root Next.js element for accurate height tracking
        trigger: document.documentElement, 
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // Tighter scrub for less visual lag
      },
    });

    tl.to(g.position, { x: -1.8, y: -0.1, z: 0.5, ease: "power1.inOut" }, 0)
      .to(g.rotation, { y: 0.35, x: 0.05, z: 0.02 }, 0)
      .to(g.position, { x: 2.5,  y: 0.3,  z: -0.5, ease: "power2.inOut" }, 0.2)
      .to(g.rotation, { y: -0.6, x: 0.0,  z: -0.02 }, 0.2)
      .to(g.position, { x: 0,    y: -0.4, z: 2,   ease: "power3.inOut" }, 0.45)
      .to(g.rotation, { y: 0.1,  x: 0.15, z: 0 }, 0.45)
      .to(g.position, { x: -2.2, y: 0.1,  z: 0,   ease: "power2.out" }, 0.65)
      .to(g.rotation, { y: 0.5,  x: 0.05, z: 0.03 }, 0.65)
      .to(g.position, { x: 0.5,  y: -1.5, z: 8,   ease: "power4.in" }, 0.85)
      .to(g.rotation, { y: 0.2,  x: 0.2,  z: 0 }, 0.85);

  }, { dependencies: [] });

  return (
    <group ref={groupRef}>
      <group ref={floatRef} scale={[0.9, 0.9, 0.9]}>
        <primitive object={optimizedScene} />
        {/* Lights attached to the car */}
        <pointLight position={[0, 0, -1.8]} color="#FF1801" intensity={5} distance={5} decay={2} />
        <pointLight position={[0, 0,  1.6]} color="#FF6600" intensity={2.5} distance={4} decay={2} />
        <pointLight position={[0, -0.5, 0]} color="#E8002D" intensity={2} distance={3} decay={2} />
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER
───────────────────────────────────────────────────────────── */
function CarPlaceholder() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.45;
    ref.current.position.y = Math.sin(t * 2) * 0.05;
  });

  return (
    <group ref={ref} position={[2, 0, -1]}>
      <mesh>
        <boxGeometry args={[1.6, 0.28, 4.2]} />
        <meshStandardMaterial color="#E8002D" roughness={0.2} metalness={0.8} />
      </mesh>
      <pointLight position={[0, 0, -2]} color="#FF1801" intensity={4} distance={4} decay={2} />
    </group>
  );
}

useGLTF.preload("/f1-car.glb");

/* ─────────────────────────────────────────────────────────────
   MAIN CANVAS WRAPPER
───────────────────────────────────────────────────────────── */
export function GlobalCarScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none", // Ensures you can still click the HTML buttons on top
      }}
    >
      {/* PERFORMANCE TWEAKS: 
        dpr restricts pixel ratio on 4k monitors so GPUs don't catch fire.
        powerPreference="high-performance" tells the browser to use the dedicated GPU.
      */}
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 48 }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 10, 6]}  intensity={1.5} color="#ffffff" />
        <directionalLight position={[-6, -4, -5]} intensity={0.6} color="#FF1801" />

        <Environment preset="night" />

        <StarField />
        <Sparks />

        <Suspense fallback={<CarPlaceholder />}>
          <CarModel />
        </Suspense>
      </Canvas>
    </div>
  );
}