import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldAlert, Sparkles, FlaskConical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URLS } from '../config';

interface SubscriptionPageProps {
  onSuccess: () => void;
  onLogout: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onSuccess, onLogout }) => {
  const { role } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // In a real app, you'd get the user ID and email from the global state/context
      const res = await fetch(`${API_URLS.NODE_BACKEND}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'mock-user-id', email: 'student@vce.edu' })
      });
      
      if (!res.ok) throw new Error("Failed to initialize checkout");
      
      const data = await res.json();
      if (data.url.startsWith('/labs')) {
          // Mock success redirect
          onSuccess();
      } else {
          // Real stripe checkout redirect
          window.location.href = data.url;
      }
    } catch (err: any) {
      setError("Payment gateway is currently unreachable.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-neural-light dark:bg-neural-dark pt-16">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-neural-dark to-neural-dark z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <FlaskConical className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Subscription Required</h1>
          <p className="text-gray-400 font-medium text-sm mt-2 text-center">
            Your current clearance level ({role}) requires an active computational license to access the LPRO Engine.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center text-red-400">
            <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-black/30 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden mb-6">
           <div className="absolute top-0 right-0 p-3">
              <Sparkles className="text-blue-400 w-6 h-6 opacity-50 animate-pulse" />
           </div>
           <h3 className="text-xl font-bold text-white mb-1">Student License</h3>
           <div className="flex items-baseline mb-4">
              <span className="text-4xl font-black text-white">$20</span>
              <span className="text-gray-400 ml-1">/month</span>
           </div>
           
           <ul className="space-y-3 mb-6">
             <li className="flex items-center text-sm text-gray-300">
               <CheckCircle2 className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" /> Unlimited Spatial Lab Rendering
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <CheckCircle2 className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" /> AI Diagnostic Telemetry Access
             </li>
             <li className="flex items-center text-sm text-gray-300">
               <CheckCircle2 className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" /> Cloud Object Processing Priority
             </li>
           </ul>

           <button 
             onClick={handleSubscribe}
             disabled={isProcessing}
             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
           >
             {isProcessing ? (
                <span className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 animate-pulse" /> Processing...
                </span>
             ) : (
                <span className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" /> Subscribe with Stripe
                </span>
             )}
           </button>
        </div>

        <div className="text-center">
          <button 
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
          >
            Sign out and return to home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPage;
