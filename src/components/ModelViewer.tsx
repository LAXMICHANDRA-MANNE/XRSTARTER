import React from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Bounds, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-emerald-400 font-bold whitespace-nowrap bg-black/50 px-3 py-1 rounded-full">{progress.toFixed(0)} % loaded</Html>;
}

function Model() {
  const obj = useLoader(OBJLoader, '/models/objfile.obj');
  return <primitive object={obj} />;
}

const ModelViewer: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, -10, -10]} intensity={1} />
        <pointLight position={[0, 10, 0]} intensity={1.5} color="#10b981" />
        <pointLight position={[0, -10, 0]} intensity={1.5} color="#06b6d4" />
        <React.Suspense fallback={<Loader />}>
          <Bounds fit clip observe margin={1.2}>
            <Model />
          </Bounds>
        </React.Suspense>
        <OrbitControls makeDefault enableZoom={true} enablePan={true} autoRotate={true} autoRotateSpeed={1.5} />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />
    </div>
  );
};

export default ModelViewer;
