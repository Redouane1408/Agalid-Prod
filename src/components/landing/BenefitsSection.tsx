import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '@/lib/animations';
import { CheckCircle, BarChart3, TrendingUp, Sun } from 'lucide-react';

export default function BenefitsSection() {
  return (
    <section className="bg-white dark:bg-[#0d1412] py-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium border border-orange-100 dark:border-orange-500/20">
              <Sun className="h-4 w-4" />
              <span>Spécial Algérie</span>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Rentabilisez votre toiture avec <span className="text-[var(--color-primary)]">le soleil algérien</span>
            </h3>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              L'Algérie bénéficie d'un ensoleillement exceptionnel. Ne laissez pas cette ressource gratuite se perdre. Agalid vous aide à transformer ces rayons en économies réelles et durables.
            </p>

            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 dark:bg-green-500/10 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Zéro Paperasse</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nous gérons toutes les autorisations administratives pour vous.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 dark:bg-green-500/10 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Installation Clé en Main</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">De la conception à la mise en service, on s'occupe de tout.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 bg-green-100 dark:bg-green-500/10 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Suivi Personnalisé</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Un expert dédié pour vous accompagner durant toute la durée de vie du projet.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            variants={cardHoverVariants} 
            initial="initial" 
            whileHover="hover" 
            className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-2xl backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <TrendingUp className="w-64 h-64 text-[var(--color-primary)]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Production Annuelle</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">12.5 MWh</div>
                </div>
                <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Janvier</span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-500">+15% vs Réseau</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-[var(--color-primary)] rounded-full" />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Juillet</span>
                    <span className="text-xs font-bold text-green-600 dark:text-green-500">+80% vs Réseau</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-[var(--color-primary)] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Économie Estimée</div>
                  <div className="text-2xl font-bold text-[var(--color-secondary)]">15,400 MAD<span className="text-sm text-gray-400 font-normal">/an</span></div>
                </div>
                <button className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                  Voir Détails
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
