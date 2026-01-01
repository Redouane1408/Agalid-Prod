import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { heroVariants, floatAnimation } from '@/lib/animations';

interface HeroProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

export default function Hero({ onPrimary, onSecondary }: HeroProps) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[var(--color-black)] bg-cover bg-center min-h-[85vh] sm:min-h-screen flex items-center"
      style={{ backgroundImage: "url('/bannerSite.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={heroVariants} initial="initial" animate="animate" className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-white/80 text-xs">
              <CheckCircle className="h-3 w-3 text-[var(--color-primary)]" />
              <span>Plateforme intelligente de gestion énergétique</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Powerful Tool For Managing Campaigns And Data Inventory
            </h1>
            <p className="text-white/70 max-w-xl">
              Simplifiez l'administration et optimisez vos performances grâce à des tableaux de bord clairs, des insights en temps réel et des recommandations intelligentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button onClick={onPrimary} className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:brightness-110" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Get Started
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button onClick={onSecondary} className="px-8 py-4 rounded-full bg-[var(--color-secondary)] text-black font-semibold hover:brightness-110" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Learn More
              </motion.button>
            </div>
          </motion.div>
          
        </div>
      </div>
      <motion.div className="absolute right-16 top-24" variants={floatAnimation} animate="animate">
        <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/20 blur-xl" />
      </motion.div>
    </section>
  );
}
