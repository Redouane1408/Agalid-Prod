import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { Sun, Leaf, Battery, Wallet, BarChart3, Zap, ShieldCheck, Home } from 'lucide-react';

export default function PromoSection() {
  const badges = [
    { label: 'Énergie Verte', color: 'bg-green-100 text-green-700', icon: Leaf },
    { label: 'Indépendance', color: 'bg-blue-100 text-blue-700', icon: Battery },
    { label: 'Économie', color: 'bg-yellow-100 text-yellow-700', icon: Wallet },
    { label: 'Smart Home', color: 'bg-purple-100 text-purple-700', icon: Home },
    { label: 'Performance', color: 'bg-cyan-100 text-cyan-700', icon: BarChart3 }
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-semibold text-[var(--color-primary)] tracking-wider uppercase">Pourquoi Choisir Agalid ?</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              L'énergie solaire <br/>
              <span className="text-[var(--color-primary)]">simplifiée pour tous</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Passez au solaire sans tracas. Agalid s'occupe de tout : de l'étude de faisabilité à l'installation, en passant par les démarches administratives. Profitez d'une énergie propre et réduisez votre facture dès le premier jour.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {badges.map(b => (
                <div key={b.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${b.color}`}>
                  <b.icon className="h-4 w-4" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="grid grid-cols-2 gap-6"
          >
            <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-3xl border border-gray-100 p-8 bg-gradient-to-br from-yellow-50 to-white shadow-lg">
              <Sun className="h-10 w-10 text-yellow-500 mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-1">300+</div>
              <div className="text-sm text-gray-500 font-medium">Jours d'ensoleillement</div>
            </motion.div>

            <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-3xl border border-gray-100 p-8 bg-gradient-to-br from-green-50 to-white shadow-lg mt-8">
              <Leaf className="h-10 w-10 text-green-500 mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-1">-40%</div>
              <div className="text-sm text-gray-500 font-medium">Réduction Facture</div>
            </motion.div>

            <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-3xl border border-gray-100 p-8 bg-gradient-to-br from-blue-50 to-white shadow-lg">
              <Zap className="h-10 w-10 text-blue-500 mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-1">24h</div>
              <div className="text-sm text-gray-500 font-medium">Installation Rapide</div>
            </motion.div>

            <motion.div variants={cardHoverVariants} initial="initial" whileHover="hover" className="rounded-3xl border border-gray-100 p-8 bg-gradient-to-br from-purple-50 to-white shadow-lg mt-8">
              <ShieldCheck className="h-10 w-10 text-purple-500 mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-1">25 Ans</div>
              <div className="text-sm text-gray-500 font-medium">Garantie Performance</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
