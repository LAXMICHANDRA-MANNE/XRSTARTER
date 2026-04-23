import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds, useGLTF, Html } from '@react-three/drei';
import { useGestureEngine } from '../hooks/useGestureEngine';
import * as THREE from 'three';

function Model({ url, gesture }: { url: string; gesture: any }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  
  const [explodeValue, setExplodeValue] = useState(0); 
  const [pushDepth, setPushDepth] = useState(0); 

  useEffect(() => {
    switch (gesture.action) {
      case 'explode':
        setExplodeValue(1);
        break;
      case 'collapse':
        setExplodeValue(0);
        break;
      case 'push':
        setPushDepth((prev) => prev - 2); 
        break;
      case 'pull':
        setPushDepth((prev) => prev + 2); 
        break;
      case 'wipe':
        setExplodeValue(0);
        setPushDepth(0);
        if (modelRef.current) {
          modelRef.current.position.set(0, 0, 0);
          modelRef.current.rotation.set(0, 0, 0);
        }
        break;
    }
  }, [gesture.action]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.Material;
        material.transparent = true;
        if (gesture.peel > 0) {
           material.opacity = Math.max(0.1, 1.0 - gesture.peel);
        } else {
           material.opacity = 1.0;
        }
      }
    });
  }, [scene, gesture.peel]);

  useFrame(() => {
    if (modelRef.current) {
      if (gesture.action !== 'shush') {
          // Trackball logic ONLY applies to rotation around natural center.
          modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, gesture.rotation_x, 0.1);
          modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, gesture.rotation_y, 0.1);
      }

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.userData.initialPos === undefined) {
          child.userData.initialPos = child.position.clone();
        }
        if ((child as THREE.Mesh).isMesh) {
          const original = child.userData.initialPos as THREE.Vector3;
          const dir = original.clone().normalize();
          const targetPos = original.clone().add(dir.multiplyScalar(explodeValue * 5)); // Increased explode magnitude
          child.position.lerp(targetPos, 0.1);
        }
      });
    }
  });

  return <primitive ref={modelRef} object={scene} />;
}

import { API_URLS } from '../config';

export default function XRViewer({ fileUrl, onPeelChange, arMode = false, className = "relative w-full h-[600px] rounded-xl overflow-hidden" }: { fileUrl: string | null; onPeelChange: (peel: number) => void; arMode?: boolean; className?: string }) {
  const gesture = useGestureEngine();

  useEffect(() => {
    onPeelChange(gesture.peel);
  }, [gesture.peel, onPeelChange]);

  useEffect(() => {
    if (gesture.action === 'crush') window.dispatchEvent(new Event('xr-crush'));
    if (gesture.action === 'double_tap') window.dispatchEvent(new Event('xr-double-tap'));
  }, [gesture.action]);

  return (
    <div className={className}>
      {arMode && (
         <img src={`${API_URLS.PYTHON_ENGINE}/video_feed`} alt="Live Camera" className="absolute inset-0 w-full h-full object-cover -z-10" />
      )}
      {!fileUrl ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize Spatial Simulation</h2>
          <p className="text-gray-500 mb-6">Upload a .glb / .gltf model to begin the Irma Simulation</p>
        </div>
      ) : (
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} intensity={1} castShadow />
          <Environment preset="city" />
          <Suspense fallback={<Html center><div className="text-gray-900 font-bold tracking-widest text-sm bg-white/50 px-4 py-2 rounded-full backdrop-blur-md border border-white">Loading Asset...</div></Html>}>
            <Bounds fit clip observe margin={1.2}>
              <Model url={fileUrl} gesture={gesture} />
            </Bounds>
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      )}
    </div>
  );
}
