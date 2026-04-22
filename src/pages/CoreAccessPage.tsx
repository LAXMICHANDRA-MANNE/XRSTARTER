import React from 'react';
import { motion } from 'framer-motion';
import { Database, AlertTriangle, Cpu, HardDrive, Settings2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CoreAccessPage: React.FC = () => {
  const { role, permissions } = useAuth();

  if (!permissions?.canAccessRootEngine) {
     return (
       <div className="flex h-64 items-center justify-center text-red-500 font-bold bg-red-900/10">
         <AlertTriangle className="mr-2" /> ROOT ENGINE CLEARANCE REJECTED
       </div>
     );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-extrabold text-red-500 flex items-center uppercase tracking-tighter">
          <Database className="w-10 h-10 mr-4" />
          Root Infrastructure Command
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">Level 7 Authentication Established. Operating as: {role}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/60 transition-colors">
           <Cpu className="w-8 h-8 text-red-400 mb-4" />
           <p className="text-sm font-semibold text-gray-400 uppercase">Computer Vision Engine</p>
           <div className="mt-4 font-mono text-sm text-gray-300 space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Camera Bindings:</span> <span className="text-green-400">cv2 @ 640x480</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Thread Status:</span> <span className="text-green-400">DAEMON ONLINE</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Buffer Flush:</span> <span className="text-yellow-400">3 CAP_GRAB</span></div>
           </div>
        </div>

        <div className="bg-blue-900/10 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/60 transition-colors">
           <HardDrive className="w-8 h-8 text-blue-400 mb-4" />
           <p className="text-sm font-semibold text-gray-400 uppercase">SQLite Database State</p>
           <div className="mt-4 font-mono text-sm text-gray-300 space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Node File:</span> <span className="text-white">xrstarter.db</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Users:</span> <span>1</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Data Footprint:</span> <span>2.4 MB</span></div>
           </div>
        </div>
      </div>

      <div className="mt-8 bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-6">
         <div className="flex items-center mb-6">
             <Settings2 className="w-6 h-6 mr-3 text-primary-400" />
             <h2 className="text-xl font-bold text-white">System Global Variables</h2>
         </div>
         <div className="bg-black/40 rounded-xl p-4 font-mono text-sm border border-gray-800">
            <p className="text-primary-400">{"{"}</p>
            <div className="pl-6 space-y-1 my-2 text-gray-300">
               <p><span className="text-blue-400">"GEMINI_ROUTING":</span> <span className="text-green-400">"SECURE_PROXY"</span>,</p>
               <p><span className="text-blue-400">"FRONTEND_PORT":</span> <span className="text-green-400">5173</span>,</p>
               <p><span className="text-blue-400">"BACKEND_PORT":</span> <span className="text-green-400">5000</span>,</p>
               <p><span className="text-blue-400">"PRISMA_MODE":</span> <span className="text-green-400">"STANDBY"</span></p>
            </div>
            <p className="text-primary-400">{"}"}</p>
         </div>
      </div>
    </div>
  );
};

export default CoreAccessPage;
