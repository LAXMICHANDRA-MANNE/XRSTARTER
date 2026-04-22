import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, User, Mail, ArrowLeft, Building2, Terminal, Network, Code2, FlaskConical, AlertCircle } from 'lucide-react';
import { UserRole } from '../types/auth';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.STUDENT
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    // Future Prisma integration point
    setTimeout(() => {
      onSignupSuccess();
    }, 1500);
  };

  const roleConfigs = [
    { id: UserRole.STUDENT, label: 'Student', icon: User, desc: 'Access 3D Labs & Dashboards' },
    { id: UserRole.COLLEGE_MENTOR, label: 'Mentor', icon: FlaskConical, desc: 'Grade internal laboratory metrics' },
    { id: UserRole.HOD, label: 'HOD', icon: Building2, desc: 'Department-wide aggregates' },
    { id: UserRole.PRINCIPAL, label: 'Principal', icon: Network, desc: 'Global college telemetry mapping' },
    { id: UserRole.COLLEGE_ADMIN, label: 'Admin', icon: Terminal, desc: 'Reset passwords, manage rosters' },
    { id: UserRole.CORE_DEV, label: 'Core Dev', icon: Code2, desc: 'Root access to engine payload' }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-neural-light dark:bg-neural-dark pt-12 pb-12">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-900/20 via-neural-dark to-neural-dark z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex items-center justify-between mb-8">
           <button onClick={onSwitchToLogin} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-2xl font-extrabold text-white tracking-tight">Node Registration</h1>
           <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow">
            <FlaskConical className="text-white w-5 h-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
          {/* Identity Block */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-gray-300 mb-2">Clearance Name</label>
               <input 
                 type="text" 
                 required
                 className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-all font-mono text-sm"
                 placeholder="L. Manne"
                 onChange={e => setFormData({...formData, name: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-300 mb-2">VCE Route Mask</label>
               <input 
                 type="email" 
                 required
                 className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500 transition-all font-mono text-sm"
                 placeholder="ID@vce.edu"
                 onChange={e => setFormData({...formData, email: e.target.value})}
               />
             </div>
          </div>
          
          <div className="mt-8 mb-4">
             <label className="block text-sm font-bold text-white mb-3 flex items-center">
                Select Network Hierarchy Protocol
             </label>
             <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {roleConfigs.map((role) => {
                   const RIcon = role.icon;
                   const isSelected = formData.role === role.id;
                   return (
                      <div 
                         key={role.id}
                         onClick={() => setFormData({...formData, role: role.id as UserRole})}
                         className={`cursor-pointer border rounded-xl p-3 flex flex-col items-start transition-all ${
                            isSelected 
                            ? 'bg-primary-900/40 border-primary-500 shadow-glow' 
                            : 'bg-black/20 border-white/5 hover:border-white/20'
                         }`}
                      >
                         <RIcon className={`w-5 h-5 mb-2 ${isSelected ? 'text-primary-400' : 'text-gray-500'}`} />
                         <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>{role.label}</span>
                         <span className="text-xs text-gray-500 mt-1 leading-tight">{role.desc}</span>
                      </div>
                   )
                })}
             </div>
          </div>

          {(formData.role === UserRole.CORE_DEV || formData.role === UserRole.PRINCIPAL || formData.role === UserRole.HOD) && (
            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start text-red-400 mt-2">
               <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
               <p className="text-xs font-medium leading-tight">Warning: Administrative Level clearance requires an active Prisma Root Token out-of-band verification approval before activation.</p>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isAuthenticating}
            className="w-full bg-white text-black hover:bg-gray-200 font-extrabold tracking-wide rounded-xl py-4 mt-6 flex items-center justify-center transition-all disabled:opacity-50"
          >
            {isAuthenticating ? (
              <span className="flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 animate-pulse" /> Minting Matrix ID...
              </span>
            ) : (
              'Submit Clearance Protocol'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
