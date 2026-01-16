import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, Sun, BarChart3 } from 'lucide-react';
import { heroVariants, floatAnimation } from '@/lib/animations';
import AnimatedBackground from './AnimatedBackground';

interface HeroProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

export default function Hero({ onPrimary, onSecondary }: HeroProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <motion.div 
            variants={heroVariants} 
            initial="initial" 
            animate="animate" 
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 backdrop-blur-md text-[var(--color-primary)] text-sm font-medium shadow-[0_0_15px_rgba(57,146,196,0.3)]"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>L'énergie solaire intelligente</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              L'avenir de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#60a5fa]">
                votre énergie
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed">
              Transformez votre toit en centrale électrique intelligente. 
              Gérez votre consommation, réduisez vos factures et suivez votre production en temps réel grâce à notre technologie Web3.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button 
                onClick={onPrimary} 
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#2563eb] text-white font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all overflow-hidden"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Commencer
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
              
              <motion.button 
                onClick={onSecondary} 
                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-semibold hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                En savoir plus
              </motion.button>
            </div>

            <div className="flex items-center gap-6 pt-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>Installation rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>Suivi temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>Garantie 25 ans</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right Visual (Glass Card) */}
          <motion.div 
            variants={floatAnimation} 
            animate="animate"
            className="relative hidden lg:block"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl blur-2xl opacity-30" />
            
            {/* Main Card */}
            <div className="relative bg-[#0d1412]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-semibold text-lg">Production Actuelle</h3>
                  <p className="text-slate-400 text-sm">Mise à jour en temps réel</p>
                </div>
                <div className="p-3 rounded-full bg-[var(--color-primary)]/20">
                  <Sun className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Efficacité Solaire</span>
                    <span className="text-[var(--color-secondary)] font-mono">94%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-slate-400 text-xs mb-1">Production (kW)</div>
                    <div className="text-2xl font-bold text-white font-mono">4.2</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-slate-400 text-xs mb-1">Économie (MAD)</div>
                    <div className="text-2xl font-bold text-[var(--color-secondary)] font-mono">1,250</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-500 text-sm font-medium">Système Opérationnel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -right-8 top-20 p-4 rounded-xl bg-[#0d1412]/90 backdrop-blur-md border border-white/10 shadow-xl"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <BarChart3 className="h-6 w-6 text-[var(--color-primary)]" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
