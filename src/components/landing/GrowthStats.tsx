import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '@/lib/animations';
import { Users, Zap, TreePine } from 'lucide-react';

export default function GrowthStats() {
  return (
    <section className="bg-white dark:bg-[#0d1412] py-20 border-t border-slate-100 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-3xl rotate-3 opacity-20 blur-lg" />
            <img 
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Installation solaire Agalid" 
              className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover"
            />
            
            <div className="absolute -bottom-8 -right-8 bg-white dark:bg-[#1a2321] p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-full">
                  <TreePine className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">850 t</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">CO2 Évité</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Un impact réel en Algérie</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed">
              Depuis notre lancement, nous avons aidé des centaines de foyers et d'entreprises à prendre le contrôle de leur énergie. Nos chiffres parlent d'eux-mêmes.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">500+</div>
                  <div className="text-slate-600 dark:text-slate-400">Clients Satisfaits</div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] text-black flex items-center justify-center text-2xl font-bold">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">2.5 MW</div>
                  <div className="text-slate-600 dark:text-slate-400">Puissance Installée</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
