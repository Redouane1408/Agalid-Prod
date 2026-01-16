import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, Outlet } from 'react-router-dom';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();
  const isSignIn = location.pathname === '/signin';

  // Configuration for text content based on current route
  const config = {
    '/signin': {
      formTitle: "Bon retour",
      formSubtitle: "Connectez-vous à votre espace Agalid",
      imageTitle: "L'énergie solaire intelligente",
      imageSubtitle: "Connectez-vous pour suivre votre production et gérer votre consommation en temps réel."
    },
    '/signup': {
      formTitle: "Créer un compte",
      formSubtitle: "Rejoignez la révolution solaire",
      imageTitle: "Rejoignez le futur",
      imageSubtitle: "Commencez votre transition énergétique aujourd'hui avec Agalid."
    }
  };

  const currentConfig = config[location.pathname as keyof typeof config] || config['/signin'];

  return (
    <div className="h-screen w-full bg-[#050b09] text-white overflow-hidden font-sans relative">
      <AnimatedBackground />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
      >
        <ArrowLeft className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
      </Link>

      <div className="w-full h-full relative z-10 flex">
        
        {/* Desktop Layout (Split Screen with Sliding Animation) */}
        <div className="hidden lg:block w-full h-full relative">
          
          {/* Image Section - Slides Left/Right */}
          <motion.div 
            initial={false}
            animate={{ 
              x: isSignIn ? '0%' : '100%' 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute top-0 left-0 w-1/2 h-full overflow-hidden z-20 shadow-2xl"
          >
            <div className="absolute inset-0">
               <AnimatePresence mode="wait">
                 <motion.img 
                   key={isSignIn ? "signin-img" : "signup-img"}
                   src={isSignIn ? "/2151972752.jpg" : "/man-with-white-helmet-near-solar-panel.jpg"}
                   alt="Solar Energy" 
                   className="w-full h-full object-cover absolute inset-0"
                   initial={{ opacity: 0, scale: 1.1 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
                 />
               </AnimatePresence>
               <div className="absolute inset-0 bg-gradient-to-t from-[#050b09] via-[#050b09]/20 to-transparent pointer-events-none" />
               <div className="absolute inset-0 bg-[#050b09]/10 pointer-events-none" />
            </div>

            {/* Image Text Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-end p-16">
              <motion.div
                key={isSignIn ? "signin-img-text" : "signup-img-text"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {currentConfig.imageTitle}
                </h2>
                <p className="text-lg text-gray-300 max-w-md">
                  {currentConfig.imageSubtitle}
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Form Section - Slides Right/Left */}
          <motion.div 
            initial={false}
            animate={{ 
              x: isSignIn ? '100%' : '0%' 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center bg-[#050b09]/60 backdrop-blur-xl z-10"
          >
            <div className="w-full max-w-md p-12">
              <motion.div
                key={isSignIn ? "signin-header" : "signup-header"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2">{currentConfig.formTitle}</h1>
                <p className="text-gray-400">{currentConfig.formSubtitle}</p>
              </motion.div>
              
              {/* Render the actual page content (Form) here */}
              <Outlet />
            </div>
          </motion.div>

        </div>

        {/* Mobile Layout (Stacked, no sliding) */}
        <div className="lg:hidden w-full h-full flex items-center justify-center p-4 relative z-20">
           <div className="w-full max-w-md bg-[#050b09]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
             <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">{currentConfig.formTitle}</h1>
                <p className="text-gray-400 text-sm">{currentConfig.formSubtitle}</p>
             </div>
             <Outlet />
           </div>
        </div>

      </div>

      {/* Mobile Background Image */}
      <div className="lg:hidden absolute inset-0 z-0 opacity-20">
        <img 
          src="/2151972752.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
