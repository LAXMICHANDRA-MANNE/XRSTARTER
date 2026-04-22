import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, User, Camera, Bell, MonitorSmartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage: React.FC = () => {
  const { role } = useAuth();
  const { user } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Parameters', icon: User },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'system', label: 'XR Render Engine', icon: MonitorSmartphone },
  ];

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-b border-gray-800 pb-6 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-extrabold text-white flex items-center">
             <Settings className="w-8 h-8 mr-4 text-primary-500" />
             Matrix Configurations
           </h1>
           <p className="text-gray-400 mt-2">Adjust core aesthetic and authentication node variables.</p>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
           {tabs.map(tab => {
              const TIcon = tab.icon;
              return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`w-full flex items-center p-4 rounded-xl transition-all ${
                      activeTab === tab.id 
                       ? 'bg-primary-900/40 text-white border border-primary-500 shadow-glow' 
                       : 'bg-glass-white dark:bg-glass-black text-gray-400 border border-transparent hover:border-white/10 hover:bg-white/5'
                   }`}
                 >
                    <TIcon className={`w-5 h-5 mr-3 ${activeTab===tab.id ? 'text-primary-400' : 'text-gray-500'}`} />
                    <span className="font-semibold text-sm">{tab.label}</span>
                 </button>
              )
           })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50 rounded-2xl p-8">
           {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <h2 className="text-2xl font-bold text-white mb-6">Profile Parameters</h2>
                 <div className="flex items-center space-x-6 mb-8">
                    <div className="relative group">
                       <img src={user?.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-primary-500/50" />
                       <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white w-6 h-6" />
                       </button>
                    </div>
                    <div>
                       <p className="text-xl font-bold text-white">{user?.name}</p>
                       <p className="text-primary-400 font-mono text-sm">{role} CLEARANCE</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-semibold text-gray-400 mb-1">Matrix Handle</label>
                       <input type="text" disabled value={user?.name} className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold text-gray-400 mb-1">Grid Email Address</label>
                       <input type="email" disabled value={user?.email} className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed" />
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <h2 className="text-2xl font-bold text-white mb-6">Security & Privacy</h2>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-800/50">
                       <div className="flex items-center">
                          <Bell className="w-5 h-5 text-gray-400 mr-4" />
                          <div>
                             <p className="font-semibold text-white">Login Anomalies</p>
                             <p className="text-xs text-gray-500">Alert me if my node is accessed from an external IP.</p>
                          </div>
                       </div>
                       <button className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-bold">Enabled</button>
                    </div>
                    
                    <div>
                       <label className="block text-sm font-semibold text-gray-400 mb-2">Update Password Logic</label>
                       <input type="password" placeholder="Current Password" className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-white mb-3 focus:border-primary-500 outline-none" />
                       <input type="password" placeholder="New Password Sequence" className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-primary-500 outline-none" />
                       <button className="mt-4 bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors">Apply Cryptography</button>
                    </div>
                 </div>
              </motion.div>
           )}

           {activeTab === 'system' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <h2 className="text-2xl font-bold text-white mb-6">System Engine</h2>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-800/50">
                       <div>
                          <p className="font-semibold text-white">Interface Luminescence</p>
                          <p className="text-xs text-gray-500">Toggle between Dark Matrix and Light Matter modes.</p>
                       </div>
                       <button 
                         onClick={toggleTheme}
                         className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                       >
                         {theme === 'light' ? 'Engage Dark Mode' : 'Engage Light Mode'}
                       </button>
                    </div>
                 </div>
              </motion.div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
