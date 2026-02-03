import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, Sun, BarChart3 } from 'lucide-react';
import { heroVariants, floatAnimation } from '@/lib/animations';
import AnimatedBackground from './AnimatedBackground';
import SolarPanel3D from './SolarPanel3D';

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

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              L'avenir de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#60a5fa]">
                votre énergie
              </span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed">
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
                className="px-8 py-4 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-slate-700 dark:text-white font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                En savoir plus
              </motion.button>
            </div>

            <div className="flex items-center gap-6 pt-8 text-sm text-slate-600 dark:text-slate-400">
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
          
          {/* Right Visual (3D Solar Panel) */}
          <div className="relative hidden lg:block">
            <SolarPanel3D />
          </div>

        </div>
      </div>
    </section>
  );
}
