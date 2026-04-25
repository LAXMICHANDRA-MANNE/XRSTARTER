import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, UploadCloud, Layers, Cpu } from 'lucide-react';

import { API_URLS } from '../config';
import { useGestureEngine } from '../hooks/useGestureEngine';

const LabsPage: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Spatial Object');
  const [peelValue, setPeelValue] = useState<number>(0);
  const [layerData, setLayerData] = useState<{ partName: string, description: string } | null>(null);
  
  // States for AI Double Tap
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const containerRef = useRef(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStatus, setCameraStatus] = useState<'requesting' | 'active' | 'denied' | 'error'>('requesting');
  const isProd = import.meta.env.PROD;

  const gestureState = useGestureEngine(videoRef, true); // Track gestures locally

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_STATE',
        state: gestureState
      }, '*');
    }
    
    /* 
       Disabled automatic crush reset to make objects stay longer.
       The user now has to use keyboard 'delete' or 'del' to clear.
    */
    /*
    if (gestureState.action === 'crush') {
      setFileUrl(null);
      iframeRef.current?.contentWindow?.postMessage({ type: 'RESET' }, '*');
    }
    */
    if (gestureState.action === 'double_tap') {
      setAiGenerating(true);
      iframeRef.current?.contentWindow?.postMessage({ type: 'CAPTURE_SCREEN' }, '*');
    }
    setPeelValue(gestureState.peel);
  }, [gestureState]);

  // Keyboard Delete Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'delete' || key === 'backspace' || key === 'd') {
        console.log("Keyboard Reset triggered");
        setFileUrl(null);
        iframeRef.current?.contentWindow?.postMessage({ type: 'RESET' }, '*');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startBrowserCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraStatus('requesting');
      navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
        .then(stream => {
          setCameraStatus('active');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video Play Error:", e));
          }
        })
        .catch(err => {
          console.error("Browser Camera Error:", err);
          setCameraStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
        });
    }
  };

  useEffect(() => {
    startBrowserCamera();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a blob URL for UI feedback and pass it to the local Three.js iframe
      const uiUrl = URL.createObjectURL(file);
      setFileUrl(uiUrl);
      setFileName(file.name);

      if (iframeRef.current?.contentWindow) {
        console.log("Sending LOAD_MODEL to lpro viewer:", uiUrl);
        iframeRef.current.contentWindow.postMessage({ type: 'LOAD_MODEL', path: uiUrl, fileName: file.name }, '*');
        
        setAiGenerating(true);
        // Wait 2s for WebGL geometry to load before capturing screen for AI
        setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({ type: 'CAPTURE_SCREEN' }, '*');
        }, 2000);
      }
    }
  };

  useEffect(() => {
    async function fetchLayerContext() {
      try {
        const res = await fetch(`${API_URLS.NODE_BACKEND}/api/metadata/current_asset`);
        const data = await res.json();
        
        if (data.layers) {
          const maxDepth = data.layers.length - 1;
          const mappedIndex = Math.min(maxDepth, Math.floor(peelValue * (data.layers.length)));
          setLayerData(data.layers[mappedIndex]);
        }
      } catch (e) {
        // Fallback or ignore
      }
    }
    fetchLayerContext();
  }, [peelValue]);

  // Listen for custom XR Actions from the LPRO iframe!
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
       if (e.data && e.data.type === 'XR_SCREENSHOT') {
           generateAIReport('', e.data.image);
       }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [layerData]);

  const generateAIReport = async (overrideName?: string, imageDataUrl?: string) => {
    setAiGenerating(true);
    setAiReport(null);
    
    try {
      const currentObject = overrideName || fileName || layerData?.partName || 'unknown 3D object';

      const response = await fetch(`${API_URLS.PYTHON_ENGINE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl || "",
          object: currentObject
        })
      });

      if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status}`);
      }

      const data = await response.json();
      setAiReport(`[IRMA DIAGNOSTIC]: ${data.analysis || "Diagnostic data unavailable."}`);
    } catch (err: any) {
      console.error(err);
      setAiReport(`[IRMA DIAGNOSTIC ERROR]: ${err.message || 'Connection to cognitive engine lost.'}`);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen overflow-hidden bg-black flex items-center justify-center">

      {/* 
        GESTURE HELP - Top Left Corner
        Hover activated, raw text only via drop-shadow, no background container
      */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto group">
         <div className="text-primary-400 font-mono text-xs cursor-help transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,255,170,0.5)] border-l-2 border-primary-500 pl-3 uppercase tracking-tighter">
            System Gestures v2.4 // Online
         </div>
         <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 select-none flex flex-col space-y-4 pointer-events-none translate-x-[-10px] group-hover:translate-x-0">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-r-2xl border-l-4 border-l-primary-500">
                <span className="text-primary-400 font-black text-xs block mb-1 uppercase tracking-widest opacity-70">Interaction A</span>
                <span className="text-white font-bold text-sm">[Right Pinch + Drag]</span>
                <span className="text-primary-500/80 text-[10px] block mt-1 font-mono uppercase">Spatial Translation Mode</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-r-2xl border-l-4 border-l-secondary-500">
                <span className="text-secondary-400 font-black text-xs block mb-1 uppercase tracking-widest opacity-70">Interaction B</span>
                <span className="text-white font-bold text-sm">[Right Air Double Tap]</span>
                <span className="text-secondary-500/80 text-[10px] block mt-1 font-mono uppercase">Neural Diagnostic Uplink</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-r-2xl border-l-4 border-l-teal-500">
                <span className="text-teal-400 font-black text-xs block mb-1 uppercase tracking-widest opacity-70">Interaction C</span>
                <span className="text-white font-bold text-sm">[Left Pinch Distance]</span>
                <span className="text-teal-500/80 text-[10px] block mt-1 font-mono uppercase">Sub-Surface Cross Section</span>
            </div>
         </div>
      </div>

      {/* 
        1. MAIN CANVAS (Full Screen Background) via Headless iframe
      */}
      <div className="absolute inset-0 z-0">
          <iframe 
             ref={iframeRef} 
             src={`${import.meta.env.BASE_URL}lpro-viewer.html`} 
             className="w-full h-full border-none pointer-events-none" 
             title="LPRO Headless Physics Viewer"
          />
      </div>

      {/* 
        2. DRAGGABLE CAMERA PIP (Picture In Picture)
      */}
      <motion.div 
        drag
        dragConstraints={containerRef}
        className="absolute bottom-8 right-8 z-50 w-72 h-52 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,255,170,0.2)] border-2 border-white/20 bg-black/40 backdrop-blur-2xl cursor-grab active:cursor-grabbing pointer-events-auto group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ transform: 'scaleX(-1)' }}
          className={`w-full h-full object-cover pointer-events-none ${cameraStatus !== 'active' ? 'opacity-0' : 'opacity-100'}`} 
        />
        
        {cameraStatus !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 p-4 text-center">
            <p className="text-white text-xs font-bold mb-2">
              {cameraStatus === 'requesting' ? 'Requesting Camera...' : 
               cameraStatus === 'denied' ? 'Camera Blocked!' : 'Camera Error'}
            </p>
            <button 
              onClick={startBrowserCamera}
              className="px-3 py-1 bg-white text-black text-[10px] font-black rounded-full hover:bg-emerald-400 transition-colors"
            >
              RESTART CAMERA
            </button>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-md px-2 py-1 rounded-md flex items-center text-xs text-gray-900 font-medium border border-white/40 shadow-sm">
          <div className={`w-2 h-2 rounded-full mr-2 ${cameraStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {cameraStatus === 'active' ? 'Camera Active' : 'Camera Offline'}
        </div>
      </motion.div>


      {/* 
        3. GLASSMORPHIC UI PANELS (Floating over the canvas)
      */}
      <div className="absolute inset-0 pointer-events-none z-10 p-6 flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="flex justify-between items-start pointer-events-none">
           <motion.div 
             initial={{opacity:0, y:-30}} 
             animate={{opacity:1, y:0}} 
             transition={{ type: 'spring', stiffness: 200, damping: 20 }}
             className="bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-5 flex items-center pointer-events-auto group"
           >
             <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                <FlaskConical className="text-white w-7 h-7" />
             </div>
             <div>
               <h1 className="text-white font-black text-2xl leading-tight tracking-tighter uppercase italic">LPRO Core // Lab</h1>
               <p className="text-primary-400 text-[10px] font-mono tracking-widest uppercase opacity-80 animate-pulse">Scanning Neural Assets...</p>
             </div>
           </motion.div>
        </div>

        {/* Big Center Prompt if no file */}
        {!fileUrl && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <motion.div 
               initial={{scale:0.8, opacity:0}} 
               animate={{scale:1, opacity:1}}
               transition={{ type: 'spring', stiffness: 250, damping: 25, delay: 0.1 }}
               className="bg-white/70 backdrop-blur-3xl p-10 rounded-3xl border border-white/50 text-center pointer-events-auto shadow-[0_8px_40px_rgb(0,0,0,0.12)]"
             >
                <UploadCloud className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Initialize spatial simulation</h2>
                <p className="text-gray-500 mb-8 max-w-sm font-medium">No 3D asset detected. The robust LPRO Engine can parse .glb, .gltf, .obj, .stl, and .ply natively.</p>
                
                <label className="cursor-pointer inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/30">
                   Browse Local Models
                   <input type="file" accept=".glb,.gltf,.obj,.stl,.ply" className="hidden" onChange={handleFileUpload} />
                </label>
             </motion.div>
           </div>
        )}

        {/* Bottom Left: Irma HUD */}
        <div className="w-80 pointer-events-auto space-y-4">
           {/* IMPORT BLOCK: Kept explicitly above the layer metrics */}
           <motion.div 
             initial={{opacity:0, x:-30}} 
             animate={{opacity:1, x:0}} 
             transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
             className="bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] rounded-2xl p-5 flex items-center group cursor-pointer hover:border-primary-500/50 transition-all"
           >
              <label className="cursor-pointer flex items-center text-gray-400 hover:text-white transition group w-full">
                 <UploadCloud className="w-5 h-5 mr-4 group-hover:scale-110 group-hover:text-primary-500 transition-all font-bold" />
                 <span className="font-bold text-[11px] mr-4 tracking-[0.2em] w-full relative top-0.5 uppercase">Load Neural Asset</span>
                 <input type="file" accept=".glb,.gltf,.obj,.stl,.ply" className="hidden" onChange={handleFileUpload} />
              </label>
           </motion.div>

           <motion.div 
             initial={{opacity:0, x:-30}} 
             animate={{opacity:1, x:0}} 
             transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
             className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.4)] relative overflow-hidden group"
           >
               <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 animate-gradient-x" />
               <h2 className="text-white font-black text-sm mb-6 flex items-center uppercase tracking-[0.2em] opacity-90">
                 <Layers className="w-4 h-4 mr-3 text-primary-500" />
                 Telemetry Stream
               </h2>

               <div className="space-y-6">
                  <div>
                    <div className="text-[10px] text-primary-400/60 font-mono font-bold tracking-[0.3em] mb-2 uppercase">Peel Intensity</div>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                      {(peelValue * 100).toFixed(0)}<span className="text-lg text-primary-500 ml-1">%</span>
                    </div>
                  </div>

                  {layerData && (
                    <div className="pt-6 border-t border-white/5">
                      <div className="text-[10px] text-secondary-400 font-mono font-black mb-3 tracking-[0.2em] uppercase flex items-center">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2 animate-ping" />
                        Component ID: {layerData.partName}
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed font-medium font-mono border-l-2 border-secondary-500/30 pl-4 py-1">
                        {layerData.description}
                      </div>
                    </div>
                  )}
               </div>

               {/* AI Double Tap Section */}
               <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-[10px] text-primary-400/60 font-mono font-black tracking-[0.3em] mb-4 flex items-center uppercase">
                    <Cpu className="w-4 h-4 mr-3 text-primary-500 animate-pulse" /> 
                    AI Core Uplink
                  </h3>
                  
                  {aiGenerating ? (
                    <div className="flex space-x-2 items-center opacity-70 p-4 bg-primary-500/5 rounded-xl border border-primary-500/20">
                       <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                       <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                       <span className="text-[10px] text-primary-400 font-mono ml-4 uppercase tracking-widest">Processing spectral data...</span>
                    </div>
                  ) : aiReport ? (
                    <div className="text-[10px] text-green-400 font-mono leading-relaxed bg-green-500/5 p-4 rounded-xl border border-green-500/20 shadow-[inset_0_0_20px_rgba(0,255,100,0.05)]">
                       <span className="text-green-500 font-black block mb-2 tracking-widest">[DIAGNOSTIC DATA RECEIVED]</span>
                       {aiReport.replace('[IRMA DIAGNOSTIC]: ', '')}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500 font-medium italic font-mono p-4 border border-dashed border-white/10 rounded-xl">
                      Waiting for Air Double-Tap to initiate Irma scan...
                    </div>
                  )}
               </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default LabsPage;