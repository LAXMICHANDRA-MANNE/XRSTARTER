import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, UploadCloud, Layers, Cpu } from 'lucide-react';

import { API_URLS } from '../config';

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

    // Start remote camera (fallback/legacy)
    fetch(`${API_URLS.PYTHON_ENGINE}/start_camera`, { method: 'POST' }).catch(e => console.error("Camera Start Error:", e));

    return () => {
      fetch(`${API_URLS.PYTHON_ENGINE}/stop_camera`, { method: 'POST' }).catch(e => console.error("Camera Stop Error:", e));
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a blob URL for UI feedback (hides the center placeholder)
      const uiUrl = URL.createObjectURL(file);
      setFileUrl(uiUrl);
      setFileName(file.name);

      // Post the actual file to the Python lpro backend
      const fd = new FormData();
      fd.append("objfile", file);

      try {
        const res = await fetch(`${API_URLS.PYTHON_ENGINE}/upload`, { method: "POST", body: fd });
        const data = await res.json();
        
        // Command the iframe headless viewer to load the uploaded file!
        if (data.path && iframeRef.current?.contentWindow) {
          const relPath = `${API_URLS.PYTHON_ENGINE}/uploads/` + data.path;
          console.log("Sending LOAD_MODEL to lpro viewer:", relPath);
          iframeRef.current.contentWindow.postMessage({ type: 'LOAD_MODEL', path: relPath }, '*');
          
          setAiGenerating(true);
          // Wait 2s for WebGL geometry to load before capturing screen for AI
          setTimeout(() => {
              iframeRef.current?.contentWindow?.postMessage({ type: 'CAPTURE_SCREEN' }, '*');
          }, 2000);
        }
      } catch (err) {
        console.error("Backend upload failed:", err);
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
       if (e.data && e.data.type === 'XR_ACTION') {
           if (e.data.action === 'crush') {
               setFileUrl(null); // Return to default screen
               iframeRef.current?.contentWindow?.postMessage({ type: 'RESET' }, '*');
           }
           if (e.data.action === 'double_tap') {
               setAiGenerating(true);
               iframeRef.current?.contentWindow?.postMessage({ type: 'CAPTURE_SCREEN' }, '*');
           }
       }
       if (e.data && e.data.type === 'XR_SCREENSHOT') {
           generateAIReport('', e.data.image);
       }
       if (e.data && e.data.type === 'XR_PEEL') {
           setPeelValue(e.data.peel);
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
         <div className="text-gray-400 font-mono text-sm cursor-help transition-colors duration-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            [HOVER: Gesture Guide]
         </div>
         <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none flex flex-col space-y-3 pointer-events-none">
            <span className="text-emerald-400 font-extrabold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
               [Right Pinch + Drag] <span className="text-white font-semibold">Move Object</span>
            </span>
            <span className="text-emerald-400 font-extrabold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
               [Right Air Double Tap] <span className="text-white font-semibold">Irma AI Diagnostic</span>
            </span>
            <span className="text-teal-400 font-extrabold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
               [Left Pinch Distance] <span className="text-white font-semibold">Layer Peel / Cross-Section</span>
            </span>
            <span className="text-red-400 font-extrabold text-base drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
               [Right Fist Crush] <span className="text-white font-semibold">Reset / Clear Screen</span>
            </span>
         </div>
      </div>

      {/* 
        1. MAIN CANVAS (Full Screen Background) via Headless iframe
      */}
      <div className="absolute inset-0 z-0">
          <iframe 
             ref={iframeRef} 
             src={API_URLS.PYTHON_ENGINE} 
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
        className="absolute bottom-8 right-8 z-50 w-64 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white/30 backdrop-blur-md cursor-grab active:cursor-grabbing pointer-events-auto"
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover pointer-events-none mirror ${cameraStatus !== 'active' ? 'opacity-0' : 'opacity-100'}`} 
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
             className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-4 flex items-center pointer-events-auto"
           >
             <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4 shadow-inner">
                <FlaskConical className="text-white w-6 h-6" />
             </div>
             <div>
               <h1 className="text-gray-900 font-extrabold text-xl leading-tight tracking-tight">XR Simulator 2.0</h1>
               <p className="text-gray-500 text-sm font-medium">Headless LPRO Core Active</p>
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
             className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-4 flex items-center"
           >
              <label className="cursor-pointer flex items-center text-gray-600 hover:text-gray-900 transition group w-full">
                 <UploadCloud className="w-5 h-5 mr-3 group-hover:scale-110 group-hover:text-primary-500 transition-all font-bold" />
                 <span className="font-bold text-sm mr-4 tracking-wide w-full relative top-0.5">Import Alternate Model</span>
                 <input type="file" accept=".glb,.gltf,.obj,.stl,.ply" className="hidden" onChange={handleFileUpload} />
              </label>
           </motion.div>

           <motion.div 
             initial={{opacity:0, x:-30}} 
             animate={{opacity:1, x:0}} 
             transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
             className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
           >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
               <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
                 <Layers className="w-5 h-5 mr-2 text-secondary-500" />
                 Layer Metrics
               </h2>

               <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-400 font-bold tracking-wider mb-1">GESTURE PEEL DEPTH</div>
                    <div className="text-3xl font-light text-primary-600 font-mono">
                      {(peelValue * 100).toFixed(0)}%
                    </div>
                  </div>

                  {layerData && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs text-secondary-500 font-extrabold mb-2 tracking-wide uppercase">TARGET: {layerData.partName}</div>
                      <div className="text-gray-600 text-sm leading-relaxed font-medium">
                        {layerData.description}
                      </div>
                    </div>
                  )}
               </div>

               {/* AI Double Tap Section */}
               <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-xs text-gray-400 font-bold tracking-wider mb-3 flex items-center">
                    <Cpu className="w-4 h-4 mr-2 text-gray-400" /> 
                    AI DIAGNOSTIC (DOUBLE AIR TAP)
                  </h3>
                  
                  {aiGenerating ? (
                    <div className="flex space-x-1 items-center opacity-70">
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                  ) : aiReport ? (
                    <div className="text-xs text-green-700 font-mono leading-tight bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                      {aiReport}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 font-medium italic">
                      Air Double Tap to run Irma Diagnostic...
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