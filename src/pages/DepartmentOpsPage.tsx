import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DepartmentOpsPage: React.FC = () => {
  const { role, permissions } = useAuth();

  if (!permissions?.canAccessDepartmentOverview) {
     return (
       <div className="flex h-64 items-center justify-center text-red-500 font-bold">
         <AlertTriangle className="mr-2" /> Clearance Level Insufficient
       </div>
     );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-extrabold text-white flex items-center">
          <Building2 className="w-10 h-10 mr-4 text-primary-500" />
          Department Command Center
        </h1>
        <p className="text-gray-400 mt-2">Classified Overview for {role} personnel.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
           <Users className="w-8 h-8 text-secondary-400 mb-4" />
           <p className="text-sm font-semibold text-gray-400">Total Active Cadets</p>
           <p className="text-3xl font-bold text-white tracking-widest mt-1">1,048</p>
        </div>

        <div className="bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-all"></div>
           <TrendingUp className="w-8 h-8 text-accent-400 mb-4" />
           <p className="text-sm font-semibold text-gray-400">Average Lab Completion Time</p>
           <p className="text-3xl font-bold text-white tracking-widest mt-1">42m 14s</p>
        </div>

        <div className="bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
           <ShieldCheck className="w-8 h-8 text-green-400 mb-4" />
           <p className="text-sm font-semibold text-gray-400">Compliance Rate</p>
           <p className="text-3xl font-bold text-white tracking-widest mt-1">98.4%</p>
        </div>
      </div>

      <div className="mt-8 bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-6">
         <h2 className="text-xl font-bold text-white mb-4">Live Student Telemetry Stream</h2>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                     <th className="pb-3 px-4 font-semibold">Node ID</th>
                     <th className="pb-3 px-4 font-semibold">Status</th>
                     <th className="pb-3 px-4 font-semibold">Current Module</th>
                  </tr>
               </thead>
               <tbody>
                  <tr className="border-b border-gray-800/50">
                     <td className="py-4 px-4 font-mono text-white text-sm">VCE-8841-A</td>
                     <td className="py-4 px-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-bold">ACTIVE</span></td>
                     <td className="py-4 px-4 text-gray-300">Spatial Rendering Matrix</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                     <td className="py-4 px-4 font-mono text-white text-sm">VCE-8842-B</td>
                     <td className="py-4 px-4"><span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs font-bold">OFFLINE</span></td>
                     <td className="py-4 px-4 text-gray-300">N/A</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default DepartmentOpsPage;
