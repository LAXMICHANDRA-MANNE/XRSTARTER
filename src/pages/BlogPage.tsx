import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Network,
  Database,
  Cpu,
  ChevronRight,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const BlogPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPaper = {
    id: 'doi-10-1038-xr-vce',
    title: 'Topological Mapping of Graph Neural Networks across Spatial Render Matrices',
    abstract: 'This paper details the VCE algorithmic framework for compiling heavy-weight graph structures directly onto the LPRO WebGL pipeline, circumventing traditional DOM manipulation latency by 45%. We specifically test this hypothesis against Large Language Model geometric parsing.',
    authors: 'L. Manne, Dr. S. Chen',
    publishedAt: '2026-03-12',
    citations: 142,
    category: 'Spatial Algorithms',
    tags: ['Graph Theory', 'LPRO Engine', 'Data Science'],
    grade: 'A+ PEER REVIEWED'
  };

  const [researchPapers, setResearchPapers] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/research')
      .then(res => res.json())
      .then(data => {
         // Exclude the featured paper from the general list feed
         setResearchPapers(data.filter((p: any) => p.id !== 'doi-10-1038-xr-vce'));
      })
      .catch(console.error);
  }, []);

  const databases = [
    { name: 'Core Data Science Array', size: '2.4 TB', status: 'Online' },
    { name: 'XR Physics Geometry', size: '890 GB', status: 'Synced' },
    { name: 'Gestural Biometric DB', size: '1.2 PB', status: 'Encrypted' }
  ];

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 border-b border-white/10 dark:border-gray-800 pb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-primary-400/50">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight uppercase">
            VCE Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Research Library</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-3xl font-mono uppercase tracking-widest">
            Data Science & Extended Reality Academic Repository. Access Restricted to Node Authenticated Personnel.
          </p>
        </motion.div>

        {/* Query Console */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-4 shadow-lg items-center"
        >
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="QUERY RESEARCH DATABASES (e.g. Graph Algorithms)..." 
                 className="w-full bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-bold tracking-wide"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="px-6 py-4 bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-3 hover:border-primary-500 transition-colors whitespace-nowrap font-mono text-sm uppercase font-bold text-gray-700 dark:text-gray-300">
             <Filter className="w-4 h-4" /> Attributes
           </button>
           <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-glow font-mono font-bold uppercase tracking-wider transition-all hover:-translate-y-1">
             Execute Null Query
           </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Paper Feed */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Featured Lead Publication */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-glass-white dark:bg-glass-black backdrop-blur-xl border border-primary-500/30 p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:shadow-glow transition-all"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/20 to-secondary-500/10 blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                 <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-lg text-primary-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                       <FileText className="w-3 h-3 mr-2" />
                       Lead Publication
                    </span>
                    <span className="font-mono text-gray-400 text-xs tracking-widest uppercase">DOI: {featuredPaper.id}</span>
                 </div>
                 
                 <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight">
                   {featuredPaper.title}
                 </h2>
                 
                 <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-8 font-mono border-l-2 border-primary-500/50 pl-4 py-1">
                   "{featuredPaper.abstract}"
                 </p>
                 
                 <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="space-y-4">
                       <div className="flex gap-2">
                          {featuredPaper.tags.map(tag => (
                             <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full font-bold uppercase">{tag}</span>
                          ))}
                       </div>
                       <div className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                          AUTHORS: <span className="text-white font-bold">{featuredPaper.authors}</span> | {featuredPaper.publishedAt}
                       </div>
                    </div>
                    
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-xl font-bold font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-105 transition-all">
                       <Download className="w-4 h-4" />
                       <span>Pull PDF Array</span>
                    </button>
                 </div>
              </div>
            </motion.article>

            {/* General Logged Research Papers */}
            <div ref={ref} className="space-y-6">
              <h3 className="text-lg font-bold font-mono text-gray-400 uppercase tracking-widest flex items-center mb-6">
                 <Database className="w-4 h-4 mr-2" /> Local Registry Data
              </h3>
              
              {researchPapers.map((paper, index) => {
                const getIcon = (iconStr: string) => {
                   switch (iconStr) {
                      case 'Database': return Database;
                      case 'Cpu': return Cpu;
                      case 'Network': return Network;
                      case 'ShieldAlert': return ShieldAlert;
                      default: return FileText;
                   }
                };
                const Icon = getIcon(paper.icon);
                return (
                  <motion.article
                    key={paper.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-primary-500/50 transition-colors shadow-lg cursor-pointer"
                  >
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all">
                           <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary-500" />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-400 transition-colors uppercase pr-4">
                                 {paper.title}
                              </h3>
                              <span className="font-mono text-xs text-gray-500 shrink-0 whitespace-nowrap border border-gray-700 px-2 py-1 rounded bg-black/40">{paper.id}</span>
                           </div>
                           <p className="text-gray-500 text-sm mb-4 font-mono leading-relaxed line-clamp-2">
                              {paper.abstract}
                           </p>
                           <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                              <div className="flex gap-4 font-mono text-xs text-gray-500 uppercase tracking-widest">
                                 <span>{paper.authors}</span>
                                 <span className="hidden sm:inline">|</span>
                                 <span className="hidden sm:inline text-green-400">{paper.citations} Citations</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
                           </div>
                        </div>
                     </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar Architecture */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest font-mono border-b border-gray-800 pb-4 flex items-center">
                 <Network className="w-4 h-4 mr-2 text-secondary-500" /> Linked Data Hubs
              </h3>
              <div className="space-y-4">
                {databases.map((db, i) => (
                  <div key={i} className="flex flex-col p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-gray-800 relative overflow-hidden group">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                     <div className="text-sm font-bold text-white mb-1 uppercase">{db.name}</div>
                     <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-gray-500">{db.size}</span>
                        <span className="text-green-500 flex items-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />{db.status}</span>
                     </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-primary-500/10 backdrop-blur-xl border border-primary-500/30 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden"
            >
              <div className="absolute -inset-4 bg-gradient-to-b from-primary-500/20 to-transparent rotate-45 blur-xl pointer-events-none" />
              <ShieldAlert className="w-8 h-8 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Network Node Locked</h3>
              <p className="text-xs text-gray-400 mb-6 font-mono leading-relaxed">
                Academic payloads are currently limited to authenticated VCE devices over standard port protocols.
              </p>
              <button className="w-full bg-black border border-primary-500/50 text-white font-mono text-sm py-3 rounded-lg hover:bg-primary-500/20 transition-colors uppercase font-bold tracking-widest">
                 Audit Credentials
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;