import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Activity, 
  Database,
  Code,
  Box,
  Fingerprint,
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useApp();

  const [liveData, setLiveData] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Initializing Node VCE-XR-01...']);
  const [metrics, setMetrics] = useState({
    latency: 14,
    memory: 780,
    confidence: 98,
    ops: 2450
  });
  const [cores, setCores] = useState([
    { name: 'Core 0', usage: 45 },
    { name: 'Core 1', usage: 80 },
    { name: 'Core 2', usage: 30 },
    { name: 'Core 3', usage: 60 }
  ]);

  useEffect(() => {
    const initialData = Array.from({ length: 20 }).map((_, i) => ({
      time: i,
      compute: 40 + Math.random() * 40,
      memory: 20 + Math.random() * 20
    }));
    setLiveData(initialData);

    const interval = setInterval(() => {
      // Update Area Chart
      setLiveData(current => {
        const next = [...current.slice(1)];
        const lastTime = next[next.length - 1].time;
        next.push({
          time: lastTime + 1,
          compute: 40 + Math.random() * 45,
          memory: 20 + Math.random() * 25
        });
        return next;
      });

      // Update Top Metrics
      setMetrics({
        latency: Math.floor(12 + Math.random() * 8),
        memory: Math.floor(750 + Math.random() * 150),
        confidence: (98 + Math.random() * 1.5),
        ops: Math.floor(2400 + Math.random() * 300)
      });
      
      // Update Core Matrix
      setCores(current => current.map(c => ({
          name: c.name,
          usage: Math.max(10, Math.min(100, c.usage + (Math.random() * 20 - 10)))
      })));

      // Simulate Terminal Output Stream
      if (Math.random() > 0.4) {
         setLogs(current => {
             const msgs = [
                 "Executing Vector mapping on Spatial Engine...",
                 "Parsing GLB geometry binary hash...",
                 "Re-allocating spatial memory block (VCE Protocol)",
                 "Network peer sync: VCE-Cluster-B [Active]",
                 "Irma Cognitive Engine polling complete.",
                 "Applying Neural Filter to XR canvas...",
                 "WARN: High bandwidth throughput on port 5173",
                 "SUCCESS: Data Structure sequence verified."
             ];
             const next = [...current];
             const time = new Date().toISOString().split('T')[1].slice(0,-1);
             const type = Math.random() > 0.8 ? 'WARN' : 'INFO';
             next.push(`[${time}] [${type}] ${msgs[Math.floor(Math.random()*msgs.length)]}`);
             if (next.length > 6) next.shift();
             return next;
         });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* IDENTITY HEADER */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="mb-8 p-6 md:p-8 bg-glass-white dark:bg-glass-black backdrop-blur-3xl border border-white/20 dark:border-primary-500/30 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
           
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div>
                 <div className="flex items-center space-x-3 mb-3">
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono font-bold rounded-lg border border-green-500/30 uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                       Node Connected
                    </div>
                    <div className="text-xs md:text-sm font-mono text-gray-500 tracking-widest uppercase font-bold">
                       SYS_ID: VCE-XR-01
                    </div>
                 </div>
                 
                 <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight uppercase">
                    LAXMICHANDRA <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">MANNE</span>
                 </h1>
                 <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                    Auth Roll No: <span className="text-primary-500 font-mono font-bold tracking-widest">24881A67G5</span>
                 </p>
              </div>
              
              <div className="flex flex-col space-y-2 text-xs md:text-sm xl:text-right font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-black/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 w-full xl:w-auto shadow-inner uppercase tracking-wider">
                 <div className="text-gray-900 dark:text-gray-200 font-bold text-sm">VARDHAMAN COLLEGE OF ENGINEERING</div>
                 <div>Div: <span className="text-primary-400 font-bold">C SECTION</span></div>
                 <div>Dept: <span className="text-primary-400 font-bold">CSE IN DATA SCIENCE</span></div>
                 <div>Year: <span className="text-white font-bold text-base">2</span> <span className="mx-2 opacity-30">|</span> Sem: <span className="text-white font-bold text-base">2</span></div>
              </div>
           </div>
        </motion.div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-lg" whileHover={{ y: -5 }}>
              <Activity className="w-6 h-6 text-primary-500 mb-4" />
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-1">{metrics.latency}<span className="text-lg text-gray-500 ml-1">ms</span></div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Engine Latency</div>
           </motion.div>
           <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-lg" whileHover={{ y: -5 }}>
              <Database className="w-6 h-6 text-secondary-500 mb-4" />
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-1">{metrics.memory} <span className="text-lg text-gray-500 ml-1">MB</span></div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Spatial Buffer</div>
           </motion.div>
           <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-lg" whileHover={{ y: -5 }}>
              <Fingerprint className="w-6 h-6 text-accent-500 mb-4" />
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-1">{metrics.confidence.toFixed(1)}<span className="text-lg text-gray-500 ml-1">%</span></div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Gesture Auth</div>
           </motion.div>
           <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-lg" whileHover={{ y: -5 }}>
              <Zap className="w-6 h-6 text-yellow-500 mb-4" />
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-1">{metrics.ops.toLocaleString()}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Compute Vectors</div>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Visualizations Column */}
          <div className="xl:col-span-2 space-y-8">
             
            {/* Live Telemetry Chart */}
            <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                   <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center tracking-tight">
                     <Network className="w-6 h-6 mr-3 text-primary-500" />
                     Live Telemetry
                   </h3>
                   <p className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-widest">DS Compute Pipeline Monitor</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-mono bg-green-500/10 text-green-500 font-bold px-4 py-2 rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <span>SYNC ACTIVE</span>
                </div>
              </div>
              
              <div className="h-72 w-full pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveData}>
                    <defs>
                      <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 12, fontFamily: 'monospace' }} domain={['dataMin - 10', 'auto']} width={40} />
                    <Area type="monotone" dataKey="compute" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#computeGradient)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="memory" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#memoryGradient)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Hardware Topology matrix */}
            <motion.div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-lg">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                 <Cpu className="w-5 h-5 mr-3 text-secondary-500" />
                 Hardware Topology Architecture
               </h3>
               <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cores} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="#ffffff50" tick={{ fontSize: 12, fontFamily: 'monospace', fill:'#ffffff80' }} width={60} />
                      <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                        {cores.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.usage > 75 ? '#ef4444' : entry.usage > 50 ? '#eab308' : '#22c55e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
             
            {/* Terminal Live Console */}
            <motion.div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg relative overflow-hidden h-[330px] flex flex-col">
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                  <h3 className="text-gray-400 font-mono text-sm tracking-widest uppercase flex items-center">
                     <Terminal className="w-4 h-4 mr-2 text-primary-500" />
                     Server Log
                  </h3>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
               </div>
               <div className="flex-1 overflow-hidden font-mono text-xs flex flex-col justify-end space-y-2">
                  {logs.map((log, i) => (
                     <div key={i} className={`${log.includes('WARN') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-gray-400'} opacity-${Math.min(100, 20 + i * 15)} transition-all break-words`}>
                        {log}
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* Course Initialization Module */}
            <motion.div className="bg-primary-500/10 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgba(99,102,241,0.15)]">
               <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
               <Box className="w-16 h-16 text-primary-400 mx-auto mb-6 drop-shadow-md" />
               <h3 className="text-xl font-bold text-white mb-3">XR Workspace Ready</h3>
               <p className="text-sm text-gray-400 mb-8 font-medium leading-relaxed">Your spatial computer is securely synced with the VCE Data Science curriculum protocols.</p>
               <button className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-extrabold tracking-wide uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                  Initialize Subsystem
               </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;