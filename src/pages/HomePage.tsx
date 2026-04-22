import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, MonitorPlay, HandMetal, Cpu, Layers, Sparkles, 
  Brain, Zap, Link as LinkIcon, ShieldCheck, TrendingUp, Users, 
  Box, Eye, Activity, Database, Menu, X, Globe, BarChart3
} from 'lucide-react';
import ModelViewer from '../components/ModelViewer';

interface HomePageProps {
  onLaunch?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLaunch }) => {
  const { scrollYProgress } = useScroll();
  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200 scroll-smooth">
      
      {/* Background Animated Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div style={{
          position: 'absolute', inset: 0, backgroundSize: '50px 50px',
          backgroundImage: `linear-gradient(to right, rgba(0, 255, 0, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 0, 0.4) 1px, transparent 1px)`,
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
        }} />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/10 via-black/90 to-black" />
      <motion.div style={{ y: yBackground }} className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <Box className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">XRSTARTER</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollTo('features')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Platform</button>
            <button onClick={() => scrollTo('tech-stack')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Technology</button>
            <button onClick={() => scrollTo('clients')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Clients</button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={onLaunch} className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-4 py-2">Sign In</button>
            <button onClick={onLaunch} className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Get Started</button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsNavOpen(!isNavOpen)}>
            {isNavOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 space-y-4"
            >
              <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left py-2 text-gray-300 hover:text-white">How it Works</button>
              <button onClick={() => scrollTo('features')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Platform</button>
              <button onClick={() => scrollTo('tech-stack')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Technology</button>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <button onClick={onLaunch} className="w-full text-center py-3 rounded-xl border border-white/20 text-white font-bold">Sign In</button>
                <button onClick={onLaunch} className="w-full text-center py-3 rounded-xl bg-white text-black font-bold">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 px-6 lg:px-8 pt-40 pb-24 mx-auto max-w-7xl min-h-screen flex flex-col justify-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center items-center gap-3 mb-8">
            <div className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-wide flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Live V1.0 Available
            </div>
            <div className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 text-xs font-bold tracking-wide flex items-center">
              <Brain className="w-4 h-4 mr-2" /> Irma AI Cognitive Core
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            Next-Gen Spatial <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Intelligence
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl leading-relaxed text-gray-400 max-w-2xl mx-auto font-medium">
            The definitive platform for rendering, analyzing, and interacting with high-fidelity spatial models. Powered by a headless Python engine and bare-hand mechanics.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={onLaunch} className="group w-full sm:w-auto relative px-8 py-4 bg-white text-black font-extrabold text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] flex items-center justify-center">
              Launch Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="group w-full sm:w-auto px-8 py-4 bg-gray-900/50 backdrop-blur-md text-white border border-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center">
              Discover How
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative z-10 py-32 bg-black/40 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-emerald-400 tracking-widest uppercase mb-3">Workflow</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white">How XRSTARTER Works</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
            
            {[
              { icon: <Database className="w-8 h-8"/>, title: "1. Upload & Parse", desc: "Drag and drop your raw .GLB assets. Our engine maps the metadata and layers securely into a robust SQLite core." },
              { icon: <Cpu className="w-8 h-8"/>, title: "2. Headless Render", desc: "The spatial data is pushed through an IPC bridge to our localized Python Flask server to process physics off-thread." },
              { icon: <Eye className="w-8 h-8"/>, title: "3. Interact & Analyze", desc: "Use bare-hand gestures or your mouse to rotate, zoom, and dissect assets while Irma AI analyzes the components in real-time." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} viewport={{ once: true }}
                className="relative pt-8 px-6 pb-12 bg-gray-900/40 border border-gray-800 rounded-3xl text-center backdrop-blur-md hover:bg-gray-800/50 transition-colors"
              >
                <div className="mx-auto w-16 h-16 bg-black border border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-6 relative z-10">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{step.title}</h4>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Inside (Bento Box Features) */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Inside the Platform</h2>
            <p className="text-xl text-gray-400 max-w-2xl">A complete ecosystem designed to give you ultimate control over spatial visualization and role-based data access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
              <ModelViewer />
              <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                  <HandMetal className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3">Bare-Hand Physics</h3>
                  <p className="text-gray-400 text-lg">Dual-hand trackball rotations, pinch-to-zoom scaling, and algorithmic swipe trajectories calculated at 60 FPS.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="md:col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-md hover:border-blue-500/30 transition-colors">
              <ShieldCheck className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Role-Based Access Control</h3>
              <p className="text-gray-400">7-tier hierarchical security structure separating core admins, educators, and students.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="md:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-center items-center text-center hover:border-purple-500/30 transition-colors">
              <Layers className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Simulation Labs</h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="md:col-span-1 bg-emerald-900/20 border border-emerald-800/50 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-center items-center text-center hover:bg-emerald-900/40 transition-colors">
              <Zap className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-emerald-50">Zero Latency</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture / Tech Stack */}
      <section id="tech-stack" className="relative z-10 py-32 bg-black border-y border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-white mb-6">Built on Premium Architecture.</h2>
              <p className="text-lg text-gray-400 font-light mb-8 leading-relaxed">
                We decoupled the gorgeous React dashboard from the actual 3D rendering pipeline to eliminate memory leaks. The architecture relies on an invisible iframe pipeline pushing standard messages between Vite/React and Python/Flask almost instantaneously.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mr-4 shrink-0 border border-gray-700">
                    <MonitorPlay className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">React Frontend (Vite)</h4>
                    <p className="text-gray-500 mt-1">Lightning-fast HMR, glassmorphic UI, and seamless state management.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center mr-4 shrink-0 border border-emerald-700">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-emerald-100 font-bold text-lg">Python Engine (Flask)</h4>
                    <p className="text-emerald-500/70 mt-1">Handles intense compute, raw GLTF parsing, and Mediapipe gesture models.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative h-[400px] w-full rounded-3xl border border-white/10 bg-gray-900/30 backdrop-blur-2xl p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
              <div className="relative z-10 flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5">
                <div className="font-mono text-sm text-gray-400">frontend_req.ts</div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-0.5 bg-gradient-to-b from-white/20 to-emerald-500/50" />
                <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold font-mono tracking-widest border border-emerald-500/30">
                  IPC BRIDGE ACTIVE
                </div>
                <div className="h-16 w-0.5 bg-gradient-to-t from-white/20 to-emerald-500/50" />
              </div>

              <div className="relative z-10 flex justify-between items-center bg-emerald-950/50 p-4 rounded-2xl border border-emerald-500/20">
                <div className="font-mono text-sm text-emerald-200">engine_response.py</div>
                <Cpu className="w-5 h-5 text-emerald-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outcomes & Metrics */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-black to-gray-900/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "60+", label: "FPS Rendering", icon: <TrendingUp /> },
              { value: "0ms", label: "Render Blocking", icon: <Zap /> },
              { value: "100%", label: "Data Isolation", icon: <ShieldCheck /> },
              { value: "Unlimited", label: "Model Size", icon: <Layers /> }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="mx-auto w-12 h-12 flex items-center justify-center text-gray-400 mb-4">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients & Trust */}
      <section id="clients" className="relative z-10 py-32 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Trusted by Leading Innovators</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-black tracking-tighter flex items-center"><Globe className="w-8 h-8 mr-2"/> AERO SPACE</div>
            <div className="text-2xl font-black tracking-tighter flex items-center"><Activity className="w-8 h-8 mr-2"/> MED TECH</div>
            <div className="text-2xl font-black tracking-tighter flex items-center"><Users className="w-8 h-8 mr-2"/> EDU FORGE</div>
            <div className="text-2xl font-black tracking-tighter flex items-center"><BarChart3 className="w-8 h-8 mr-2"/> QUANTUM LABS</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-40 border-t border-white/10 text-center bg-black overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Ready to step inside?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">Initialize the engine, upload your models, and experience the future of spatial interaction.</p>
          <button onClick={onLaunch} className="inline-flex items-center justify-center px-12 py-5 bg-white text-black font-extrabold text-xl rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(255,255,255,0.4)]">
            Start Your Sandbox
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold text-white tracking-tight">XRSTARTER</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 XRSTARTER Platform. All Rights Reserved.</p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;