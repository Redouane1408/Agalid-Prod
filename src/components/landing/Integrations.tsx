import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants } from '@/lib/animations';
import { Zap, Sun, Battery, Cpu, Cloud, Wifi, Check, AlertCircle, LayoutDashboard } from 'lucide-react';
import ConnectModal from './ConnectModal';
import { useNavigate } from 'react-router-dom';

interface IntegrationItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  id: string;
  description: string;
}

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const navigate = useNavigate();
  const [showAuthToast, setShowAuthToast] = useState(false);

  const integrations: IntegrationItem[] = [
    { name: 'Linky', icon: Zap, color: '#A4D037', id: 'linky', description: 'Suivi de consommation réel' },
    { name: 'Enphase', icon: Sun, color: '#F37021', id: 'enphase', description: 'Production solaire en direct' },
    { name: 'Tesla', icon: Battery, color: '#E31937', id: 'tesla', description: 'État de la batterie' },
    { name: 'OpenMeteo', icon: Cloud, color: '#1D4E89', id: 'meteo', description: 'Prévisions d\'ensoleillement' },
  ];

  // Check for connected services on load
  useEffect(() => {
    const checkConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch('/api/integrations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data: { provider: string }[] = await res.json();
            setConnectedServices(data.map((i) => i.provider));
          }
        }
      } catch (e) {
        console.error("Failed to fetch integrations", e);
      }
    };
    checkConnections();
  }, []);

  const handleIntegrationClick = async (integration: IntegrationItem) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthToast(true);
      setTimeout(() => setShowAuthToast(false), 3000);
      return;
    }

    // For OAuth providers, redirect directly
    if (integration.id === 'enphase' || integration.id === 'tesla') {
      try {
        const res = await fetch(`/api/integrations/auth/${integration.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const { url } = await res.json();
          localStorage.setItem('pending_integration_provider', integration.id);
          window.location.href = url;
          return;
        }
      } catch (e) {
        console.error("OAuth init failed", e);
      }
    }

    setSelectedIntegration(integration);
  };

  const handleConnect = async (apiKey: string) => {
    if (!selectedIntegration) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin?from=integrations');
        return;
      }

      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          provider: selectedIntegration.id, 
          apiKey 
        })
      });

      if (res.ok) {
        setConnectedServices(prev => [...prev, selectedIntegration.id]);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleMainCta = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // If logged in, scroll to graph or show first available integration
      const firstUnconnected = integrations.find(i => !connectedServices.includes(i.id));
      if (firstUnconnected) {
        setSelectedIntegration(firstUnconnected);
      } else {
        // All connected
        navigate('/dashboard');
      }
    } else {
      navigate('/signup?from=integrations');
    }
  };

  return (
    <section className="bg-white dark:bg-[#050b09] py-24 relative overflow-hidden transition-colors duration-500" id="integrations">
      <ConnectModal 
        isOpen={!!selectedIntegration} 
        onClose={() => setSelectedIntegration(null)}
        integration={selectedIntegration}
        onConnect={handleConnect}
      />

      {/* Auth Toast */}
      <AnimatePresence>
        {showAuthToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Authentification requise</div>
              <div className="text-sm opacity-90">Veuillez vous connecter pour gérer vos intégrations.</div>
            </div>
            <button 
              onClick={() => navigate('/signin?from=integrations')}
              className="ml-4 bg-white text-red-500 px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Se connecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={fadeInVariants} 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" />
            <span>Connectivité Intelligente</span>
          </div>
          
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            L'écosystème <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">connecté</span>
          </h3>
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ne jonglez plus entre vos applications. Agalid centralise Linky, vos panneaux solaires et votre batterie pour automatiser vos économies d'énergie.
          </p>
        </motion.div>

        <div className="relative mt-20 h-[500px] flex items-center justify-center">
          {/* Orbit Circles */}
          <div className="absolute border border-slate-200 dark:border-white/5 rounded-full w-[300px] h-[300px] animate-spin-slow" />
          <div className="absolute border border-slate-200 dark:border-white/5 rounded-full w-[450px] h-[450px] animate-reverse-spin-slower" />
          
          {/* Center Hub */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 w-32 h-32 rounded-full bg-white dark:bg-[#050b09] border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-pulse" />
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Agalid
            </div>
            {/* Connection Lines */}
            {integrations.map((item, i) => {
               const isConnected = connectedServices.includes(item.id);
               return (
                 <div 
                   key={i}
                   className={`absolute top-1/2 left-1/2 w-[225px] h-[1px] origin-left transition-colors duration-500 ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gradient-to-r from-emerald-500/50 to-transparent'}`}
                   style={{ transform: `rotate(${i * (360 / integrations.length)}deg)` }}
                 />
               );
            })}
          </motion.div>

          {/* Integration Icons */}
          {integrations.map((integration, i) => {
            const angle = i * (360 / integrations.length);
            const radius = 225; // Distance from center
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const isConnected = connectedServices.includes(integration.id);

            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="absolute z-20"
                style={{ 
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => handleIntegrationClick(integration)}
                >
                  <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${isConnected ? 'bg-emerald-500/30' : 'bg-slate-200/50 dark:bg-white/5 group-hover:bg-slate-300/50 dark:group-hover:bg-white/10'}`} />
                  
                  <div className={`w-16 h-16 rounded-full bg-white dark:bg-[#0A1210] border flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isConnected ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-slate-200 dark:border-white/10 group-hover:border-emerald-500/50'}`}>
                    
                    {isConnected && (
                      <div className="absolute top-0 right-0 p-1 bg-emerald-500 rounded-bl-lg z-10">
                        <Check className="w-2 h-2 text-white dark:text-black" strokeWidth={4} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <integration.icon 
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" 
                      style={{ color: isConnected ? '#10b981' : integration.color }} 
                    />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
                    <div className="bg-slate-900 dark:bg-white/10 backdrop-blur-md border border-slate-700 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm text-white whitespace-nowrap shadow-xl">
                      {isConnected ? 'Données synchronisées' : integration.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            {connectedServices.length > 0 && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 group"
              >
                  <LayoutDashboard className="w-5 h-5" />
                  Voir mes résultats
              </button>
            )}

            <button 
              onClick={handleMainCta}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 group ${connectedServices.length > 0 ? 'bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-emerald-500/20'}`}
            >
                <Wifi className="w-5 h-5" />
                {connectedServices.length > 0 ? 'Connecter un autre service' : 'Connecter mon installation'}
            </button>
        </div>
      </div>
    </section>
  );
}
