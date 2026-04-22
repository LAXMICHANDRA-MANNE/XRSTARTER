import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Lock, Mail, ArrowRight, ShieldAlert, FlaskConical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    // Mock Authentication Logic connecting to RBAC
    setTimeout(() => {
      // In a real startup, this goes to Prisma -> /api/login endpoints
      let assignedRole = UserRole.STUDENT;
      
      if (email.includes('hod')) assignedRole = UserRole.HOD;
      else if (email.includes('admin')) assignedRole = UserRole.DATA_ADMIN;
      else if (email.includes('dev')) assignedRole = UserRole.CORE_DEV;
      else if (email.includes('principal')) assignedRole = UserRole.PRINCIPAL;
      
      login(assignedRole);
      setIsAuthenticating(false);
      onLoginSuccess();
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-neural-light dark:bg-neural-dark pt-16">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-neural-dark to-neural-dark z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <FlaskConical className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">XRSTARTER</h1>
          <p className="text-gray-400 font-medium text-sm mt-1 tracking-widest uppercase">Global Authentication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center text-red-400">
            <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">VCE Institutional Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="name@vce.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Spatial Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/30 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isAuthenticating}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-xl py-3.5 mt-4 flex items-center justify-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
          >
            {isAuthenticating ? (
              <span className="flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 animate-pulse" /> Decrypting Key...
              </span>
            ) : (
              <span className="flex items-center">
                Initialize Sequence <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Not registered on the VCE Grid?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="text-primary-400 hover:text-primary-300 font-bold hover:underline transition-colors ml-1"
            >
              Request Access
            </button>
          </p>
        </div>
        
        <div className="mt-4 flex justify-center space-x-2 text-xs text-gray-600">
           <span>Try mapping:</span>
           <span className="font-mono bg-black/30 px-1 rounded">hod@...</span>
           <span className="font-mono bg-black/30 px-1 rounded">admin@...</span>
           <span className="font-mono bg-black/30 px-1 rounded">dev@...</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
